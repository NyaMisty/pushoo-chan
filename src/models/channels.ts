import config from 'config';
import { ChannelType } from 'pushoo';


export type ChannelConfig = {
    name: string
    type: ChannelType
    token: string
}

export function getDefaultChannel() {
    const defChannel = config.get<string>('default_channel');
    return getAllChannel()[defChannel]
}

export function getAllChannel() {
    const channels : ChannelConfig[] = config.get('channels');
    let ret: {[index: string]: ChannelConfig} = {};
    for (const channel of channels) {
        ret[channel.name] = channel;
    }
    return ret;
}