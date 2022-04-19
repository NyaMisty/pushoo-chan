import { Config } from '@config/type';
import { readConfigFile, writeConfigFile } from '@shims/fs';
import YAML from 'yaml';

let curConfig: Config | null = null;

const CONFIG_FILE = "config.yaml"

export async function refreshConfig() {
    curConfig = null;
    await getConfig()
}

export async function getRawConfig() {
    return await readConfigFile(CONFIG_FILE)
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

export async function getConfig() {
    if (curConfig === null) {
        const rawConfig = await getRawConfig() || DEFAULT_CONFIG
        curConfig = <Config>YAML.parse(rawConfig)
    }
    return curConfig
}

export async function setRawConfig(rawBody: string) {
    await writeConfigFile(CONFIG_FILE, rawBody)
    await refreshConfig()
}