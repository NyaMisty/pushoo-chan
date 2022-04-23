import logger from '@shims/logger';

//import { Request, Response, Router } from '@shims/router';
import { Router } from 'itty-router';

import pushoo from 'pushoo';
import { ChannelConfig, getAllChanName, getAllChannel, getRealChannelList } from '@models/channels';
import { RequestShim } from '@shims/request';

const router = Router({ base: '/send' });

router.all('/', async (req: RequestShim) => {
    const text = req.bodyobj?.text || req.query?.text;
    const desp = req.bodyobj?.desp || req.query?.desp;
    const channame = req.bodyobj?.chan || req.query?.chan;
    logger.info("Got send request: \n"
                + `    text: ${text ?? 'undefined'}\n`
                + `    desp: ${desp ?? 'undefined'}\n`
                + `    chan: ${channame ?? 'undefined'}`
                );

    let msg: string[] = [];
    let results: string[] = [];

    const dolog = (logmsg: string) => {
        // console.log(logmsg)
        msg.push(logmsg)
    };

    try {
        // const { chan_map, default_chan } = await getAllChannel()
        // const { channames, default_channame } = await getAllChanName()

        let chans: ChannelConfig[] = [];
        const channames = (channame || "").split(',')
        if (!channames.length) {
            dolog('Warning: no valid channel specified, using default channel!');
        }
        try {
            const { chans: _chans, logmsg: getChanLog } = await getRealChannelList(channames)
            chans = _chans
            msg = msg.concat(getChanLog)
        } catch (e) {
            const _e = <Error>e
            dolog("Get channels to send failed: " + _e.toString())
            throw "return"
        }

        // console.log(chans);
        
        if (!chans.length) {
            dolog('Warning: got no channel to send...');
        } else if (chans.length === 1 && (!chans[0] || chans[0].type as string === "stub")) {
            dolog('Error: default push channel invalid, please finish the setup!')
        } else {
            results = await Promise.all(chans.map(
                async (chan: ChannelConfig) => {
                    // if text = null, desp != null, send desp only
                    // if text != null, desp = null, send text only
                    // if text = null, desp = null, send empty thing
                    let content: string = desp ?? "";
                    let title = text;
                    if (desp === undefined) {
                        content = text ?? ""
                        title = undefined
                    }
                    const result = await pushoo(chan.type, {
                        token: chan.token,
                        title,
                        content
                    });
                    if (result.error) {
                        const err: Error = result.error
                        logger.err(err)
                        return "push error: " + err.toString();
                    } else {
                        return "push success: " + JSON.stringify(result)
                    }
                }
            ))
        }

    } catch(e) {
        if (e !== "return") {
            const _e = <Error>e
            dolog("unknown error during send: " + _e.toString())
        }
    }
    logger.info(`Got results: ${JSON.stringify(results)} msg: ${JSON.stringify(msg)}`)
    return {
        status: 200,
        body: JSON.stringify({
                results: results.length ? results : undefined,
                msg: msg.length ? msg : undefined
            }, null, 4),
        headers: {
            'content-type': 'application/json; charset=utf-8'
        }
    }
});


// Export default.
export default router;
