import { getConfig } from '@config/index';
import { ChannelConfig } from '@config/type';

export function getDefaultChannel() {
    return getAllChannel()[getConfig().default_channel]
}

export function getAllChannel() {
    const channels : ChannelConfig[] = getConfig().channels;
    let ret: {[index: string]: ChannelConfig} = {};
    for (const channel of channels) {
        ret[channel.name] = channel;
    }
    return ret;
}

export { ChannelConfig } from '@config/type';