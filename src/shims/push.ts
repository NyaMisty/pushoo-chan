import logger from '@shims/logger';

import { ChannelConfig, getRealChannelList } from "@models/channels";

import pushoo from 'pushoo';

const MAX_RETRY = 5;
const RETRY_INTERVAL = 3.0; // 3s per round

function shouldRetry(msg: string) {
    // const msg = err.message
    if (msg.includes("Network Error")) {
        return true
    }
    if (msg.includes("timeout")) {
        return true
    }
    if (msg.includes("failed with status code")) {
        const statusCode = parseInt(msg.split("status code")[1])
        if (statusCode >= 500) {
            return true
        }
    }
    return false
}

async function pushOneChanInternal(chan: ChannelConfig, content: string, title: string | undefined) {
    const result = await pushoo(chan.type, {
        token: chan.token,
        content: content || '',
        title,
    });
    if (result.error) {
        const err: Error = result.error
        logger.err(err)
        // return "push error: " + err.toString();
        return { status: "error", msg: err.toString() };
    } else {
        return { status: "success", msg: JSON.stringify(result) };
    }
}

async function sleep(duration: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, duration);
    });
}

async function pushOneChan(chan: ChannelConfig, content: string, title: string | undefined) {
    let retMsg = '';
    for (let i = 0; i < MAX_RETRY; i++) {
        const {status, msg} = await pushOneChanInternal(chan, content, title)
        if (status == "success") {
            retMsg += `push success (round ${i+1}): ${msg}`
            break
        } else if (status == 'error') {
            retMsg += `push error (round ${i+1}): ${msg}`
            if (!shouldRetry(msg)) {
                retMsg += '\n'
                retMsg += `push failed because not retriable...`
            }
            await sleep(RETRY_INTERVAL)
        }
        retMsg += '\n'
    }
    return retMsg
}

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
                return await pushOneChan(chan, content, title)
            }
        ))
    } catch(e) {
        if (e !== "return") {
            throw(e)
        }
    }
    return []
}