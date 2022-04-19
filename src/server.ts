import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import logger from 'jet-logger';

process.env["NODE_CONFIG_DIR"] = process.cwd() + "/config" + require('path').delimiter + process.cwd() + "/user_config"

// Constants
const app = express();


/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/

// Common middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

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

 import sendRouter from './routes/send';

// Add api router
app.use('/send', sendRouter);
// app.use('/config', configRouter);

// Error handling
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
    logger.err(err, true);
    return res.status(StatusCodes.BAD_REQUEST).json({
        error: err.message,
    });
});


/***********************************************************************************
 *                                  Front-end content
 **********************************************************************************/

// Set static dir
const staticDir = path.join(__dirname, 'static');
app.use(express.static(staticDir));


// Export here and start in a diff file (for testing).
export default app;
