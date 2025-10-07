import express from 'express';
import path from 'node:path';
import { ENV } from './config/env.js';
import { OAuthService } from './services/OAuthService.js';
import { SessionStore } from './store/SessionStore.js';
import { AuthController } from './controllers/AuthController.js';
import { buildRouter } from './routes/index.js';

export function makeServer() {
    const app = express();

    const staticDir = path.join(process.cwd(), 'public');
    app.use('/static', express.static(staticDir, {
        etag: true,
        lastModified: true,
        maxAge: '1d',
        fallthrough: true,
    }));

    const sessionStore = new SessionStore();
    const oauthService = new OAuthService({
        asBase: ENV.AS_BASE,
        clientId: ENV.CLIENT_ID,
        redirectUri: ENV.REDIRECT_URI,
    });

    const authController = new AuthController({ oauthService, sessionStore });
    app.use(buildRouter({ authController }));
    app.get('/healthz', (_req, res) => res.json({ ok: true }));
    app.use((err, _req, res, _next) => {
        console.error('Unhandled error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    return app;
}

// Run server only when invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const app = makeServer();
    app.listen(ENV.PORT, () => console.log(`Demo App on http://localhost:${ENV.PORT}`));
}
