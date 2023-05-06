import logger from '@shims/logger';

//import { Request, Response, Router } from '@shims/router';
import { Router } from 'itty-router';

import { RequestShim } from '@shims/request';
import { pushByChanString } from '@shims/push';

const router = Router({ base: '/bark' });

const URL_PREFIX_PARTS = 1 // "/bark" uses 1 slots in URL

router.all('*', async (req: RequestShim) => {
    const dolog = (logmsg: string) => {
        // console.log(logmsg)
        logger.reqlog(req, 'send: ' + logmsg)
        // msg.push(logmsg)
    };

    
    let pathname = req.pathname
    while (pathname.startsWith('/')) {
        pathname = pathname.substring(1)
    }
    while (pathname.endsWith('/')) {
        pathname = pathname.substring(0, pathname.length - 1)
    }
    const urlParts = pathname.split('/')
                            .slice(URL_PREFIX_PARTS)
                            .map((part) => decodeURIComponent(part))
    console.log(urlParts)
    let channame = ''
    let content = ''
    let title = ''

    if (urlParts.length >= 1) {
        channame = urlParts[0]
    }
    if (urlParts.length >= 2) { // has content in url
        if (urlParts.length == 2) {
            content = urlParts[1]
        }
        if (urlParts.length == 3) {
            title = urlParts[1]
            content = urlParts[2]
        }
    }
    if (req.bodyobj_type == 'form') {
        content = req.bodyobj?.body || content
        title = req.bodyobj?.title || title
    } else {
        dolog(`Unknown Bark POST body type: ${req.bodyobj_type}`)
    }

    logger.info("Got bark request: \n"
                + `    content: ${content ?? 'undefined'}\n`
                + `    title: ${title ?? 'undefined'}\n`
                + `    chan: ${channame ?? 'undefined'}\n`
                );

    let results: string[] = [];
    try {
        results = await pushByChanString(channame, title, content, dolog)
    } catch(e) {
        const _e = <Error>e
        dolog("unknown error during send: " + _e.toString())
    }
    logger.info(`Got results: ${JSON.stringify(results)} logs: ${JSON.stringify(req.logs)}`)
    return {
        status: 200,
        body: JSON.stringify({
                // bark standard ret
                code: 200,
                message: "success",
                timestamp: Math.floor(Date.now()/1000),
                // additional message for debugging
                results: results.length ? results : undefined,
                msg: req.logs.length ? req.logs : undefined
            }, null, 4),
        headers: {
            'content-type': 'application/json; charset=utf-8'
        }
    }
});


// Export default.
export default router;
