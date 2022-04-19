import logger from '@shims/logger';

//import { Request, Response, Router } from '@shims/router';
import { Router } from 'itty-router';

import pushoo from 'pushoo';
import { ChannelConfig, getAllChannel } from '@models/channels';
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

    const msg: string[] = [];

    const dolog = (logmsg: string) => {
        // console.log(logmsg)
        msg.push(logmsg)
    };

    const { chan_map, default_chan } = await getAllChannel()

    let chans: ChannelConfig[] = [];
    if (channame === "all") {
        chans = Object.values(chan_map);
    } else if (channame) {
        const channames = channame.split(',')
        for (const channame of channames) {
            const chan = chan_map[channame];
            if (!chan) {
                dolog('Warning: cannot find chan "' + channame + '" in channel config!')
            } else {
                chans.push(chan)
            }
        }
    }
    if (!chans.length) {
        dolog('Warning: no valid channel specified, using default channel!');
        chans = [default_chan];
    }

    // console.log(chans);
    let results: string[] = [];
    if (chans.length === 1 && (!chans[0] || chans[0].type as string === "stub")) {
        dolog('Error: default push channel invalid, please finish the setup!')
    } else {
        results = await Promise.all(chans.map(
            async (chan: ChannelConfig) => {
                const result = await pushoo(chan.type, {
                    token: chan.token,
                    title: text,
                    content: <string>desp
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
    
    logger.info(`Got results: ${JSON.stringify(results)} msg: ${JSON.stringify(msg)}`)
    return {
        status: 200,
        body: JSON.stringify({
            results: results.length ? results : undefined,
            msg: msg.length ? msg : undefined
        })
    }
});


// Export default.
export default router;
