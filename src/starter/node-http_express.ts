/***********************************************************************************
 *                                  Shims
 **********************************************************************************/


const _logger = require('@shims/logger');
_logger.doLog = (msg: string) => {console.log(msg)}

const _fs = require('@shims/fs')
import fs from 'fs'
_fs.readFile = (filename: string) => fs.readFileSync(filename).toString()
_fs.writeFile = (filename: string, content: string) => fs.writeFileSync(filename, content)


import express, { NextFunction, Request, Response, Router } from 'express';
import { RouterShim } from '@shims/router';

function transformIRouter(router: RouterShim) : Router {
    const ret = Router()
    for (const route of router.paths) {
        (<any>ret)[route.type](
            route.path, 
            async (req: Request, res: Response) => {
                const ret = await route.handler({
                    method: req.method,
                    body: req.body,
                    query: <any>req.query,
                    rawBody: (req as any).body
                })
                let t = res.status(ret.status)
                if (ret.body) t = t.send(ret.body)
                return t
            }
        )
    }
    return ret
}

import logger from '@shims/logger';

/***********************************************************************************
 *                                  Framework
 **********************************************************************************/

import cookieParser from 'cookie-parser';
import path from 'path';

import StatusCodes from 'http-status-codes';
import 'express-async-errors';

process.env["NODE_CONFIG_DIR"] = process.cwd() + "/config" + require('path').delimiter + process.cwd() + "/user_config"

// Constants
const app = express();


/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/

// Common middlewares
app.use(express.raw({ type: "text/plain" }));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


import morgan from 'morgan';
import helmet from 'helmet';

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security (helmet recommended in express docs)
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}


/***********************************************************************************
 *                         API routes and error handling
 **********************************************************************************/

import sendRouter from '@routes/send';
import configRouter from '@routes/config';

// Add api router
app.use('/send', transformIRouter(sendRouter));
app.use('/config', transformIRouter(configRouter));

// Error handling
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
    console.log(err);
    return res.status(StatusCodes.BAD_REQUEST).json({
        error: err.message,
    });
});


/***********************************************************************************
 *                                  Front-end content
 **********************************************************************************/

// Set static dir
const staticDir = path.join(__dirname, '../static');
app.use(express.static(staticDir));


// Constants
const serverStartMsg = 'Express server started on port: ',
        port = (process.env.PORT || 4000);

// Start server

app.listen(port, () => {
    logger.info(serverStartMsg + port);
});