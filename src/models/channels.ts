import { getConfig } from '@config/index';
import { ChannelConfig } from '@config/type';

export async function getAllChannel() {
    const config = await getConfig()
    const channels : ChannelConfig[] = config.channels;
    let chans: {[index: string]: ChannelConfig} = {};
    for (const channel of channels) {
        chans[channel.name] = channel;
    }
    return {
        chan_map: chans,
        default_chan: chans[config.default_channel]
    };
}

export { ChannelConfig } from '@config/type';