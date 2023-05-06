import logger from '@shims/logger';

import { ChannelConfig, getRealChannelList } from "@models/channels";

import pushoo from 'pushoo';

export async function pushByChanString(
    channame: string | undefined, // channel names splitted by comma
    _title: string | undefined,
    _content: string | undefined,
    dolog: (a: string) => void = ((_) => null),
) {
    // if text = null, desp != null, send desp only
    // if text != null, desp = null, send text only
    // if text = null, desp = null, send empty thing
    let content: string = _content ?? "";
    let title = _title;
    if (_content === undefined) {
        content = title ?? ""
        title = undefined
    }

    try {
        let chans: ChannelConfig[] = [];
        let channames = channame?.split(',') || []
        channames = channames.filter((item) => item.length > 0)
        
        if (!channames.length) {
            dolog('Warning: no channel specified, using default channel!');
        }
        try {
            const { chans: _chans, logmsg: getChanLog } = await getRealChannelList(channames)
            chans = _chans
            for (const logline of getChanLog) {
                dolog(logline)
            }
        } catch (e) {
            const _e = <Error>e
            dolog("Get channels to send failed: " + _e.toString())
            throw "return"
        }

        return await Promise.all(chans.map(
            async (chan: ChannelConfig) => {
                const result = await pushoo(chan.type, {
                    token: chan.token,
                    content: content || '',
                    title,
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
    } catch(e) {
        if (e !== "return") {
            throw(e)
        }
    }
    return []
}