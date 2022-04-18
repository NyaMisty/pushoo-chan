import logger from 'jet-logger';

import { Request, Response, Router } from 'express';

import pushoo from 'pushoo';
import { ChannelConfig, getAllChannel, getDefaultChannel } from '@models/channels';

const router = Router();

router.all('/', async (req: Request, res: Response) => {
    const text = req.body.text || req.query.text;
    const desp = req.body.desp || req.query.desp;
    const channame = req.body.chan || req.query.chan;
    logger.info("Got send request: \n    text: " + text + "\n    desp: " + desp + "\n    chan: " + channame);

    let msg: string[] = [];

    const dolog = (logmsg: string) => {
        msg.push(logmsg)
    }

    let chans: ChannelConfig[] = [];
    if (channame === "all") {
        chans = Object.values(getAllChannel());
    } else if (channame) {
        const channames = channame.split(',')
        for (const channame of channames) {
            const chan = getAllChannel()[channame];
            if (!chan) {
                dolog('Warning: cannot find chan "' + channame + '" in channel config!')
            } else {
                chans.push(chan)
            }
        }
    }
    if (!chans.length) {
        dolog('Warning: no valid channel specified, using default channel!');
        chans = [getDefaultChannel()];
    }

    let results = [];
    if (chans.length === 1 && <string>chans[0].type === "stub") {
        dolog('Error: default push channel has invalid type: stub, please finish the setup!')
    } else {
        for (const curChan of chans) {
            const result = await pushoo(curChan.type, {
                token: curChan.token,
                title: text,
                content: desp
            });
            if (result.error) {
                results.push("push error: " + result.error.toString())
            } else {
                results.push("push success: " + JSON.stringify(result))
            }
        }
    }
    
    logger.info("Got results: " + JSON.stringify(results) + " msg: " + JSON.stringify(msg))
    return res.status(200).json({
        results: results.length ? results : undefined,
        msg: msg.length ? msg : undefined
    });
});


// Export default.
export default router;
