import { Router } from 'express';

export function buildRouter({ authController }) {
    const r = Router();

    r.get('/', authController.home);
    r.get('/login', authController.login);
    r.get('/callback', authController.callback);

    return r;
}
