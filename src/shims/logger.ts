export let doLog = function(msg: any) {
    throw new Error("unimplemented shim function: " + arguments.callee.name)
}

export default {
    info(msg: any) {
        doLog("[INFO] " + msg)
    },

    err(msg: any) {
        doLog("[ERR] " + msg)
    },

    warn(msg: any) {
        doLog("[WARN] " + msg)
    },
}