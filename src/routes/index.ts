import { Router } from 'itty-router'
import sendRouter from '@routes/send';
import configRouter from '@routes/config';
import qs from 'qs';
import mime from 'mime';
import path from 'path';
import { RequestShim } from '@shims/request';
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
      const fileContentBuf = readStaticFile(relativePath)
      return {
            status: 200,
            body: fileContentBuf.toString(),
            headers: { "content-type": mime.lookup(relativePath) },
        };
}

router
    .all('*', parseBody)
    .all('/send/*', sendRouter.handle) // attach child router
    .all('/config/*', configRouter.handle) // attach child router
    .all('*', serveStatic)

export default router;