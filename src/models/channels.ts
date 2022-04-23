import { getConfig } from '@config/index';
import { ChannelConfig, ChannelGroupConfig } from '@config/type';
import logger from '@shims/logger';

export async function getAllChannel() {
    const config = await getConfig()
    const channels : ChannelConfig[] = config.channels || [];
    const chans: {[index: string]: ChannelConfig} = {};
    for (const channel of channels) {
        chans[channel.name] = channel;
    }
    return {
        chan_map: chans,
        default_chan: config.default_channel ? chans[config.default_channel] : null
    };
}

async function buildChanConfig() {
    const config = await getConfig()
    const channels : ChannelConfig[] = config.channels || [];
    const channel_groups : ChannelGroupConfig[] = config.channel_groups || [];
    const chans: {[index: string]: (ChannelConfig)} = {};
    const changroups: {[index: string]: (ChannelGroupConfig)} = {};
    
    for (const channel of channels) {
        chans[channel.name] = channel;
    }
    for (const channel_group of channel_groups) {
        changroups[channel_group.name] = channel_group;
    }
    return {
        chans: chans,
        changroups: changroups,
        default_chan: config.default_channel ?? null
    };
}

export async function getAllChanName() {
    const chanConfig = await buildChanConfig()
    const chan_names = Object.keys(chanConfig.chans)
    const changroup_names = Object.keys(chanConfig.chans)
    return {
        channames: [...chan_names, ...changroup_names],
        default_channame: chanConfig.default_chan
    }
}

export async function getRealChannelList(channelOrGroupNames: string[]) {
    const { chans: CHANS, changroups: CHANGROUPS, default_chan } = await buildChanConfig()
    if (!channelOrGroupNames.length) {
        if (default_chan) {
            channelOrGroupNames = [default_chan]
        } else {
            throw new Error("default_channel not specified!")
        }
    }

    const logmsg = []
    let processList = [...channelOrGroupNames]
    const processedMap: { [index: string]: number } = {}
    const retChans: { [index: string]: ChannelConfig } = {}
            
    while (processList.length > 0) {
        const curName = processList.pop()
        if (!curName)
            break
        if (curName in CHANS) {
            retChans[curName] = CHANS[curName]
        } else if (curName in CHANGROUPS) {
            if (curName in processedMap)
                continue
            const groupUsedChans = CHANGROUPS[curName].use
            if (groupUsedChans)
                processList = [...processList, ...groupUsedChans]
                processedMap[curName] = 1
        } else {
            logmsg.push(`unknown channel or group name: ${curName}`)
        }
    }
    return {
        chans: Object.values(retChans),
        logmsg: logmsg
    }
}

export { ChannelConfig, ChannelGroupConfig } from '@config/type';