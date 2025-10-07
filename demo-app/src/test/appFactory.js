import express from 'express';
import { buildRouter } from '../routes/index.js';

export function makeApp({ authController }) {
    const app = express();
    app.use(buildRouter({ authController }));
    app.get('/healthz', (_req, res) => res.json({ ok: true }));
    app.use((err, _req, res, _next) => {
        // same error handler style as sdk.js
        res.status(500).json({ error: 'Internal Server Error', message: err?.message });
    });
    return app;
}
