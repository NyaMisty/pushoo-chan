/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestShim } from "./request"

export const doLog = function(_msg: string): void {
    throw new Error("unimplemented shim function: " + arguments.callee.name)
}

export default {
    reqlog(req: RequestShim, msg: any) {
        req.logs.push("" + msg)
        doLog("[ReqLog] " + msg)
    },

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