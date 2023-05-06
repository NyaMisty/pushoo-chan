import logger from '@shims/logger';

//import { Request, Response, Router } from '@shims/router';
import { Router } from 'itty-router';

import { RequestShim } from '@shims/request';
import { pushByChanString } from '@shims/push';

const router = Router({ base: '/send' });

router.all('*', async (req: RequestShim) => {
    const text = req.bodyobj?.text || req.query_?.text || req.query?.text;
    const desp = req.bodyobj?.desp || req.query_?.desp || req.query?.desp;
    const channame = req.bodyobj?.chan || req.query?.chan;
    logger.info("Got send request: \n"
                + `    text: ${text ?? 'undefined'}\n`
                + `    desp: ${desp ?? 'undefined'}\n`
                + `    chan: ${channame ?? 'undefined'}\n`
                );


    const dolog = (logmsg: string) => {
        // console.log(logmsg)
        logger.reqlog(req, 'send: ' + logmsg)
        // msg.push(logmsg)
    };

    let results: string[] = [];
    try {
        results = await pushByChanString(channame, text, desp, dolog)
    } catch(e) {
        const _e = <Error>e
        dolog("unknown error during send: " + _e.toString())
    }
    
    logger.info(`Got results: ${JSON.stringify(results)} logs: ${JSON.stringify(req.logs)}`)
    return {
        status: results.length ? 200 : 500,
        body: JSON.stringify({
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
