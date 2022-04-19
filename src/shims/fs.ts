/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */

export const readConfigFile = async function (filename: string): Promise<string | null> {
    throw new Error("unimplemented shim function: readConfigFile")
}

export const writeConfigFile = async function (filename: string, content: string) {
    throw new Error("unimplemented shim function: writeConfigFile")
}


export const readStaticFile = async function (filename: string): Promise<string | null> {
    throw new Error("unimplemented shim function: readStaticFile")
}
