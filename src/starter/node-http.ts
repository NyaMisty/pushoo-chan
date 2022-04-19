/***********************************************************************************
 *                                  Shims
 **********************************************************************************/


const _logger = require('@shims/logger');
_logger.doLog = (msg: string) => {console.log(msg)}

const _fs = require('@shims/fs')
import fs from 'fs'
_fs.readConfigFile = (filename: string) => fs.readFileSync(filename).toString()
_fs.writeConfigFile = (filename: string, content: string) => fs.writeFileSync(filename, content)
_fs.readStaticFile = (filename: string) => fs.readFileSync(__dirname + "/../static/" + filename).toString()

/***********************************************************************************
*                                  Framework
**********************************************************************************/


import itty from "itty-router";
import allRouter from '@routes/index';

import { createServer } from "node:http";
import { IncomingMessage, ServerResponse } from 'http';
import { Request, Response } from "node-fetch";
import { RequestShim, ResponseShim } from '@shims/request';

const getRawBody = async (request: Request) => {
  const buf = await request.buffer();
  const reqshim = <RequestShim>(request as any)
  reqshim.rawBody = buf.toString()
}

const router = itty.Router();

router.all("*", ({ method, url }) => console.log(`${method} ${url}`));

router.all("*", getRawBody);

router.all("*", allRouter.handle)

async function handler(nodeReq: IncomingMessage, nodeRes: ServerResponse) {
  const request = await convertRequest(nodeReq);
  const response: ResponseShim = await router.handle(request);
  // console.log(response)
  nodeRes.writeHead(response.status, response.headers);
  nodeRes.end(response.body);
}

const server = createServer(handler);

server.listen(4000, () => console.log(`http://localhost:4000`));

async function convertRequest(req: IncomingMessage) {
  const { headers, method } = req;
  const url = `http://${req.headers.host}${req.url}`;
  let body = undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await new Request(url, {
      method,
      headers: headers as any,
      body: req,
    }).buffer();
  }
  return new Request(url, {
    method,
    headers: headers as any,
    body,
  });
}