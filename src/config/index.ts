import { Config } from '@config/type';
import { readConfigFile, writeConfigFile } from '@shims/fs';
import YAML from 'yaml';

import NodeCache from 'node-cache'

const configCache = new NodeCache({
    stdTTL: 8,
    checkperiod: 0, // use this, or Cloudflare fails
    deleteOnExpire: false,
})

const CONFIG_FILE = "config.yaml"

export async function refreshConfig() {
    configCache.del('config')
    await getConfig()
}

const DEFAULT_CONFIG = 
`channels:
  - name: stub_channel
    type: stub
    token: stub

default_channel: stub_channel

auth:
    # uncomment to enable basic authentication
    #user: pushoo
    #pass: pushoo
`

export async function getRawConfig() {
    const ret = await readConfigFile(CONFIG_FILE)
    if (!ret) {
        return DEFAULT_CONFIG
    }
    return ret
}


export async function getConfig() {
    let curConfig = configCache.get<Config>('config')
    if (!curConfig) {
        const rawConfig = await getRawConfig()
        curConfig = <Config>YAML.parse(rawConfig)
        configCache.set<Config>('config', curConfig)
    }
    return curConfig
}

export async function setRawConfig(rawBody: string) {
    await writeConfigFile(CONFIG_FILE, rawBody)
    await refreshConfig()
}