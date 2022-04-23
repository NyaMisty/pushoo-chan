import { Router } from 'itty-router'
import sendRouter from '@routes/send';
import configRouter from '@routes/config';
import qs from 'qs';
import content_type from 'content-type'
import mime from 'mime-types';
import iconv from 'iconv-lite';
import { Obj, RequestShim } from '@shims/request';
import { readStaticFile } from '@shims/fs';
import logger from '@shims/logger'

const router = Router()

// const staticDir = path.join(__dirname, '../static');
// app.use((staticDir));

function get_qs_decoder(charset: string) {
    return (str: string, _defaultDecoder: unknown, _charset: string, _type: unknown) => {
        const strWithoutPlus = str.replace(/\+/g, ' ');
        const rawstr = strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
        
        const buf = new ArrayBuffer(rawstr.length);
        const bufView = new Uint8Array(buf);
        for (let i=0; i < rawstr.length; i++) {
            bufView[i] = rawstr.charCodeAt(i);
        }
        return iconv.decode(new Buffer(bufView), charset)
    }
}

function queryparse (body: string, charset?: string) {
    return qs.parse(body, {
        allowPrototypes: true,
        arrayLimit: 100,
        depth: Infinity,
        parameterLimit: 100,
        decoder: get_qs_decoder(charset ?? 'utf-8'),
    })
}

function jsonparse (body: string) {
    return JSON.parse(body)
}

import auth from 'basic-auth'
import { getConfig } from '@config/index';

const DEFAULT_AUTH_MSG = "Pushoo-chan Editor Authentication"
const DEFAULT_USERNAME = "pushoo"
const DEFAULT_PASSWORD = "pushoo"

const verifyBasicAuth = async (request: Request) => {
    const failResp = (body: string, authMsg?: string) => ({
        status: 401,
        body,
        headers: {
            'WWW-Authenticate': 
                `Basic realm="` + (authMsg || DEFAULT_AUTH_MSG) + `", charset="UTF-8"`
        }
    })

    const config = await getConfig()
    if (!config.auth?.user || !config.auth?.pass) {
        return 
    }
    
    if (!request.headers.has('Authorization')) {
        // Chrome does not support displaying realm in recent build... 
        // so the auth msg is useless currently
        return failResp("No auth supplied", 
            config.auth ? 
                undefined : 
                DEFAULT_AUTH_MSG + ", password not set, please setup password!"
            )
    } else {
        const authHdr = request.headers.get('Authorization') ?? ""
        const basicAuth = auth.parse(authHdr)
        if (basicAuth?.name == (config.auth.user || DEFAULT_USERNAME) 
            && basicAuth?.pass == (config.auth.pass || DEFAULT_PASSWORD)) {
            return
        }
        return failResp("Wrong credential")
    }
}

const processQuery = (request: Request) => {
    const reqshim = <RequestShim>(request as unknown)
    
    const { search, searchParams } = new URL(request.url)
    if (!search.length) return
    if (!searchParams.has('charset')) return
    
    reqshim.encoding = searchParams.get('charset') || undefined
    if (reqshim.encoding) {
        logger.reqlog(reqshim, 
            `parseQuery: got override charset in query param: ${reqshim.encoding}`)
    }

    const targetCharset = searchParams.get('charset') || 'utf-8'
    const newQueryObj: Obj = <Obj>qs.parse(search, { 
        decoder: get_qs_decoder(targetCharset),
        ignoreQueryPrefix: true,
    })
    reqshim.query_ = newQueryObj
}

const decodeRawBody = (request: Request) => {
    const reqshim = <RequestShim>(request as unknown)

    let body : string | null = null
    let charset : string | null = null

    if (reqshim.encoding) {
        // if we got charset from processQuery, we directly use it
        charset = reqshim.encoding
    } else {
        // then, we retrive them from content-type
        const contentType = request.headers.get('content-type')
        if (contentType) {
            const { parameters: contentTypeParas } = content_type.parse(contentType)
            charset = contentTypeParas.charset || null
        }
        // else, we guess them!
        if (!charset) {
            const tempBody = reqshim.rawBodyBuf.toString()
            const re1 = /([^A-z]|^)charset=(?<charset>[A-z0-9-]+?)&/g
            const match1 = re1.exec(tempBody)
            if (match1 && match1.groups?.charset) {
                charset = match1.groups.charset
                reqshim.logs.push(`decodeBody: guessed charset ${charset} using form parameter`)
            }
            const re2 = /([^\\])"charset": *"(?<charset>[A-z0-9-]+?)"/g
            const match2 = re2.exec(tempBody)
            if (match2 && match2.groups?.charset) {
                charset = match2.groups.charset
                reqshim.logs.push(`decodeBody: guessed charset ${charset} using json parameter`)
            }
        }
    }
    
    if (charset && !iconv.encodingExists(charset)) {
        logger.reqlog(reqshim, `decodeBody: charset ${charset || 'null'} not available`)
        charset = null
    }
    charset = charset || 'utf-8'
    reqshim.encoding = charset
    body = iconv.decode(reqshim.rawBodyBuf, charset)

    if (body === null) {
        logger.reqlog(reqshim, `decodeBody: charset decoding failed, fall back to default decoding`)
        body = reqshim.rawBodyBuf.toString()
    }
    
    reqshim.rawBody = body
    return
}

const parseBody = (request: Request) => {
    const reqshim = <RequestShim>(request as unknown)
    const contentType = request.headers.get('content-type')
    const contentTypeInfo = contentType ? content_type.parse(contentType) : undefined
    
    reqshim.bodyobj = {}
    if (contentTypeInfo?.type == "application/json") {
        reqshim.bodyobj = <Obj>jsonparse(reqshim.rawBody)
    } else if (contentTypeInfo?.type == "application/x-www-form-urlencoded") {
        reqshim.bodyobj = <Obj>queryparse(reqshim.rawBody, reqshim.encoding)
    } else {
        // auto detect body type
        if (reqshim.rawBody.startsWith('{')) {
            reqshim.bodyobj = <Obj>jsonparse(reqshim.rawBody)
        } else {
            reqshim.bodyobj = <Obj>queryparse(reqshim.rawBody, reqshim.encoding)
        }
    }
}

const serveStatic = async (request: Request) => {
    if (request.method !== "GET") {
        return {
            status: 405,
            body: "Method Not Allowed",
            headers: { "content-type": "text/html" },
        };
      }
      let relativePath = new URL(request.url).pathname;
      if (relativePath.endsWith("/")) {
        relativePath = relativePath + "index.html"
      }
      try {
          const fileContent = await readStaticFile(relativePath)
          return {
                status: 200,
                body: fileContent,
                headers: { "content-type": mime.lookup(relativePath) },
            };
      } catch (e) {
          return {
              status: 404,
              body: "Not Found"
          }
      }
}

router
    .all('*', (req: RequestShim) => { req.logs = [] })
    .all('*', processQuery)
    .all('*', decodeRawBody)
    .all('*', parseBody)
    .all('/send/*', sendRouter.handle) // attach child router

    .all('*', verifyBasicAuth)
    .all('/config/*', configRouter.handle) // attach child router
    .all('*', serveStatic)

export default router;