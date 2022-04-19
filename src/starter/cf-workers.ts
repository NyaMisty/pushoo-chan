const _logger = require('@shims/logger');
_logger.doLog = (msg: string) => {console.log(msg)}

const KVConfig = typeof PUSHOO_CONFIG === 'undefined' ? null : PUSHOO_CONFIG;
if (typeof KVConfig === 'undefined') {
    throw new Error('KV Namespace not found');
}

const _fs = require('@shims/fs')
_fs.readFile = (filename: string) => KVConfig.get(filename)
_fs.writeFile = (filename: string, content: string) => KVConfig.put(filename, content)

async function handleEvent(event: any) {
    const request = event.request;
    const url = new URL(request.url);
    const h: any = {};
    for (let [k, v] of request.headers) {
        h[k] = v;
    }
    const req = {
        method: request.method,
        path: url.pathname,
        headers: h,
        body: await request.text(),
        query: url.search,
        ip: [request.headers.get('CF-Connecting-IP')],
    };
}

import {Sunder, Router, Context} from "sunder";
import { RouterShim } from '@shims/router';


const app = new Sunder();
const router = new Router();

function transformIRouter(router: RouterShim) : Router {
    const ret = Router()
    for (const route of router.paths) {
        (<any>ret)[route.type](
            route.path, 
            async (req: Request, res: Response) => {
                const ret = await route.handler({
                    method: req.method,
                    body: req.body,
                    query: <any>req.query,
                    rawBody: (req as any).body
                })
                let t = res.status(ret.status)
                if (ret.body) t = t.send(ret.body)
                return t
            }
        )
    }
    return ret
}


// Example route with a named parameter
router.get("/hello/:username", ({response, params}) => {
    response.body = `Hello ${params.username}`;
});
app.use(router.middlew);

export default {
    fetch(request: any, ctx: any, env: any) {
        return app.fetch(request, ctx, env);
    }
};
