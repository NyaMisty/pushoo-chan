//import { Request, Response, Router } from '@shims/router';
import { Router } from 'itty-router';
import { getRawConfig, setRawConfig } from '@config/index';
import { RequestShim } from '@shims/request';

const router = Router({ base: '/config' });

router.get('/download', async () => {
    const rawConfig = await getRawConfig()
    return {
        status: 200, 
        body: rawConfig
    };
});

router.post('/upload', async (req: RequestShim) => {
    await setRawConfig(req.rawBody)
    return {
        status: 200, 
        body: JSON.stringify({status: "ok"})
    };
});


// Export default.
export default router;
