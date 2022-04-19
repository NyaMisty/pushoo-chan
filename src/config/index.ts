import { Config } from '@config/type';
import { readConfigFile, writeConfigFile } from '@shims/fs';
import YAML from 'yaml';

let curConfig: Config | null = null;

const CONFIG_FILE = "config.yaml"

export function refreshConfig() {
    curConfig = null;
    getConfig()
}

export function getRawConfig() {
    return readConfigFile(CONFIG_FILE)
}

export function getConfig() : Config {
    if (curConfig === null) {
        curConfig = <Config>YAML.parse(getRawConfig())
    }
    return curConfig
}

export function setRawConfig(rawBody: string) {
    writeConfigFile(CONFIG_FILE, rawBody)
    refreshConfig()
}