import logger from '@shims/logger';

//import { Request, Response, Router } from '@shims/router';
import { Router } from 'itty-router';

import { RequestShim } from '@shims/request';
import { pushByChanString } from '@shims/push';

const router = Router({ base: '/barkv2' });

router.all('*', async (req: RequestShim) => {
    const dolog = (logmsg: string) => {
        // console.log(logmsg)
        logger.reqlog(req, 'send: ' + logmsg)
        // msg.push(logmsg)
    };

    
    if (req.bodyobj_type != 'json') {
        dolog(`Unknown Bark POST body type: ${req.bodyobj_type}`)
    }
    const content = req.bodyobj?.body
    const title = req.bodyobj?.title
    const channame = req.bodyobj?.device_key

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
