export type Obj = {
    [propName: string]: string
}

export interface RequestShim {
    method: string
    url: string
    pathname: string
    
    encoding?: string
    
    params?: Obj
    query?: Obj // original query object
    query_?: Obj // query object after converting charset

    rawBodyBuf: Buffer
    rawBody: string
    
    bodyobj?: Obj
    bodyobj_type?: string

    logs: string[]
}

export interface ResponseShim {
    status: number
    body: string
    headers?: Obj
}