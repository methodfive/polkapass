import express, { Router, type Express } from 'express';
import path from 'node:path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import { DiscoveryController } from '../controllers/DiscoveryController.js';
import { AuthorizeController } from '../controllers/AuthorizeController.js';
import { TokenController } from '../controllers/TokenController.js';

export function wireRoutes(app: Express, deps: {
    discovery: DiscoveryController;
    authorize: AuthorizeController;
    token: TokenController;
}) {
    app.use(cors({ origin: true, credentials: true }));
    app.use(cookieParser());
    app.use(morgan('dev'));
    app.use('/public', express.static(path.join(process.cwd(), 'public')));

    const r = Router();

    // Discovery
    r.get('/.well-known/openid-configuration', deps.discovery.openidConfiguration);
    r.get('/.well-known/jwks.json', deps.discovery.jwks);

    // Authorization
    r.get('/authorize', deps.authorize.authorize);
    r.post('/authorize/complete', bodyParser.json(), deps.authorize.complete);

    // Token
    r.post('/token', deps.token.parseForm, deps.token.token);

    // Root
    r.get('/', (_req, res) => res.send('Polka Auth Server running. See /.well-known/openid-configuration'));

    app.use(r);
}
