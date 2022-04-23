export type Obj = {
    [propName: string]: string
}

export interface RequestShim {
    method: string
    url: string
    
    encoding?: string
    
    params?: Obj
    query?: Obj
    query_?: Obj

    rawBodyBuf: Buffer
    rawBody: string
    bodyobj: Obj

    logs: string[]
}

export interface ResponseShim {
    status: number
    body: string
    headers?: Obj
}