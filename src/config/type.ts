import { ChannelType } from 'pushoo';

export type Config = {
    channels: ChannelConfig[]
    default_channel: string
    auth?: AuthConfig
}

export type ChannelConfig = {
    name: string
    type: ChannelType
    token: string
}

export type AuthConfig = {
    user: string
    pass: string
}