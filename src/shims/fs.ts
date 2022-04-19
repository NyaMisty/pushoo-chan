export let readConfigFile = function (filename: string) {
    throw new Error("unimplemented shim function: " + arguments.callee.name)
}

export let writeConfigFile = function (filename: string, content: string) {
    throw new Error("unimplemented shim function: " + arguments.callee.name)
}


export let readStaticFile = function (filename: string): Buffer {
    throw new Error("unimplemented shim function: " + arguments.callee.name)
}
