export let readConfigFile = async function (filename: string): Promise<string | null> {
    throw new Error("unimplemented shim function: readConfigFile")
}

export let writeConfigFile = async function (filename: string, content: string) {
    throw new Error("unimplemented shim function: writeConfigFile")
}


export let readStaticFile = async function (filename: string): Promise<string | null> {
    throw new Error("unimplemented shim function: readStaticFile")
}
