/***********************************************************************************
 *                                  Shims
 **********************************************************************************/

/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _logger = require('@shims/logger');
_logger.doLog = (msg: string) => {console.log(msg)}

import { CloudflareWorkerKV } from 'types-cloudflare-worker';
declare let PUSHOO_CONFIG: CloudflareWorkerKV;

const KVConfig = typeof PUSHOO_CONFIG === 'undefined' ? null : PUSHOO_CONFIG;
if (typeof KVConfig === 'undefined') {
    throw new Error('KV Namespace not found');
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const _fs = require('@shims/fs')
_fs.readConfigFile = async (filename: string) => await KVConfig?.get(filename)
_fs.writeConfigFile = async (filename: string, content: string) => 
    await KVConfig?.put(filename, content)

const STATIC_FILE_ROOTURL = 
    "https://raw.githubusercontent.com/NyaMisty/pushoo-chan/master/src/static/"
_fs.readStaticFile = async (filename: string) => {
    try {
        const fileresp = await axios.get(
            STATIC_FILE_ROOTURL + filename, 
            { transformResponse: (r) => <unknown>r });
        return <string>fileresp.data
    } catch (e) {
        const _e = <Error>e
        logger.warn(`query static file failed: ${filename} ${_e.toString()}`)
        return null
    }
}


import axios from "axios"
import fetchAdapter from "@vespaiach/axios-fetch-adapter"
axios.defaults.adapter = fetchAdapter


 /***********************************************************************************
 *                                  Framework
 **********************************************************************************/
 
import itty from "itty-router";
import allRouter from '@routes/index';
import { RequestShim, ResponseShim } from '@shims/request';
import { Request } from "node-fetch";
import logger from '@shims/logger';

import { decodeBuffer } from "http-encoding";

const getRawBody = async (request: Request) => {
    const reqshim = <RequestShim>(request as unknown)

    const encoding = (request.headers.get('content-encoding') || 'identity').toLowerCase()
    // const length = request.headers.get('content-length')
    const decodedBuf = await decodeBuffer(await request.arrayBuffer(), encoding)
    reqshim.rawBodyBuf = decodedBuf
    
    //const body = await request.text();
}  

const router = itty.Router();

router.all("*", ({ method, url }) => console.log(`${method} ${url}`));

router.all("*", getRawBody);

router.all("*", allRouter.handle)

// attach the router "handle" to the event handler
addEventListener('fetch', (_event: Event) => {
    const event = <FetchEvent>_event
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
})