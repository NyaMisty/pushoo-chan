import { ChannelType } from 'pushoo';

export type Config = {
    channels: ChannelConfig[]
    default_channel: string
}

export type ChannelConfig = {
    name: string
    type: ChannelType
    token: string
}