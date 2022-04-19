//import { Request, Response, Router } from '@shims/router';
import { Router, Request } from 'itty-router';
import { getRawConfig, setRawConfig } from '@config/index';
import { RequestShim } from '@shims/request';

const router = Router({ base: '/config' });

router.get('/download', async (_: Request) => {
    const rawConfig = await getRawConfig()
    console.log("111: " + rawConfig)
    return {
        status: 200, 
        body: rawConfig
    };
});

router.post('/upload', async (req: RequestShim) => {
    setRawConfig(req.rawBody)
    return {
        status: 200, 
        body: JSON.stringify({status: "ok"})
    };
});


// Export default.
export default router;
