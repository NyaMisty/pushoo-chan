/***********************************************************************************
*                                  Shims
**********************************************************************************/

const _logger = require('@shims/logger');
_logger.doLog = (msg: string) => {console.log(msg)}

import { CloudflareWorkerKV } from 'types-cloudflare-worker';
declare var PUSHOO_CONFIG: CloudflareWorkerKV;

const KVConfig = typeof PUSHOO_CONFIG === 'undefined' ? null : PUSHOO_CONFIG;
if (typeof KVConfig === 'undefined') {
    throw new Error('KV Namespace not found');
}

const _fs = require('@shims/fs')
_fs.readConfigFile = async (filename: string) => await KVConfig?.get(filename)
_fs.writeConfigFile = async (filename: string, content: string) => await KVConfig?.put(filename, content)
_fs.readStaticFile = async (filename: string) => ""


import axios from "axios"
import fetchAdapter from "@vespaiach/axios-fetch-adapter"
axios.defaults.adapter = fetchAdapter


 /***********************************************************************************
 *                                  Framework
 **********************************************************************************/
 


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

import itty from "itty-router";
import allRouter from '@routes/index';
import { RequestShim, ResponseShim } from '@shims/request';
import { Request } from "node-fetch";

const getRawBody = async (request: Request) => {
    const buf = await request.text();
    const reqshim = <RequestShim>(request as any)
    reqshim.rawBody = buf
}  

const router = itty.Router();

router.all("*", ({ method, url }) => console.log(`${method} ${url}`));

router.all("*", getRawBody);

router.all("*", allRouter.handle)

// attach the router "handle" to the event handler
addEventListener('fetch', <any>(async (event: FetchEvent) => {
    const handler = async () => {
        const respInfo: ResponseShim = await router.handle(event.request)
        console.log(respInfo)
        const resp = new Response(respInfo.body, {
            status: respInfo.status,
            headers: respInfo.headers,
        })
        return resp
    }
    event.respondWith(handler())
}))