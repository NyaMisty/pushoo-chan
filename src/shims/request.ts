export type Obj = {
    [propName: string]: string
}

export interface RequestShim {
    method: string
    params?: Obj
    query?: Obj
    url: string

    rawBody: string
    bodyobj: Obj
}

export interface ResponseShim {
    status: number
    body: string
    headers?: Obj
}