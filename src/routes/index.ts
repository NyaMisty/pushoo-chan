import { Router } from 'itty-router'
import sendRouter from '@routes/send';
import configRouter from '@routes/config';
import qs from 'qs';
import mime from 'mime-types';
import path from 'path';
import { RequestShim, ResponseShim } from '@shims/request';
import { readStaticFile } from '@shims/fs';

const router = Router()

// const staticDir = path.join(__dirname, '../static');
// app.use((staticDir));

function queryparse (body: string): any {
    return qs.parse(body, {
        allowPrototypes: true,
        arrayLimit: 100,
        depth: Infinity,
        parameterLimit: 100
    })
}

function jsonparse (body: string): any {
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
        return failResp("No auth supplied", 
            config.auth ? 
                undefined : 
                DEFAULT_AUTH_MSG + ", password not set, please setup password!"
            )
            // Chrome does not support displaying realm in recent build... so the auth msg is useless currently
    } else {
        const basicAuth = auth.parse(request.headers.get('Authorization')!!)
        if (basicAuth?.name == (config.auth!!.user || DEFAULT_USERNAME) 
            && basicAuth?.pass == (config.auth!!.pass || DEFAULT_PASSWORD)) {
            return
        }
        return failResp("Wrong credential")
    }
}

const parseBody = async (request: Request) => {
    const reqshim = <RequestShim>(request as any)
    const contentType = request.headers.get('content-type')
    if (contentType?.startsWith("application/json")) {
        reqshim.bodyobj = jsonparse(reqshim.rawBody)
    } else if (contentType?.startsWith("application/x-www-form-urlencoded")) {
        reqshim.bodyobj = queryparse(reqshim.rawBody)
    } else {
        reqshim.bodyobj = {}
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
      const fileContent = readStaticFile(relativePath)
      return {
            status: 200,
            body: fileContent,
            headers: { "content-type": mime.lookup(relativePath) },
        };
}

router
    .all('*', parseBody)
    .all('/send/*', sendRouter.handle) // attach child router

    .all('*', verifyBasicAuth)
    .all('/config/*', configRouter.handle) // attach child router
    .all('*', serveStatic)

export default router;