/* eslint-disable @typescript-eslint/no-unused-vars */
export const doLog = function(msg: any): void {
    throw new Error("unimplemented shim function: " + arguments.callee.name)
}

export default {
    info(msg: any) {
        doLog("[INFO] " + msg)
    },

    err(err: Error) {
        doLog("[ERR] " + err.message + "\n" + err.stack)
    },

    warn(msg: any) {
        doLog("[WARN] " + msg)
    },
}