import express from 'express';
import { ISSUER } from './config/env.js';
import { wireRoutes } from './routes';

import { KeyStore } from './services/KeyStore.js';
import { SignatureVerifier } from './services/SignatureVerifier.js';
import { ChallengeService } from './services/ChallengeService.js';
import { AuthorizationService } from './services/AuthorizationService.js';
import { TokenService } from './services/TokenService.js';

import { PendingStore } from './stores/PendingStore.js';
import { CodeStore } from './stores/CodeStore.js';
import { ClientRegistry } from './stores/ClientRegistry.js';
import { DiscoveryController } from './controllers/DiscoveryController.js';
import { AuthorizeController } from './controllers/AuthorizeController.js';
import { TokenController } from './controllers/TokenController.js';

export async function makeApp() {
  const app = express();

  // Services & stores
  const keys = new KeyStore();

  await keys.init();
  const clients = new ClientRegistry();
  const pending = new PendingStore();
  const codes = new CodeStore();
  const authzSvc = new AuthorizationService(pending);
  const verifier = new SignatureVerifier();
  const challenge = new ChallengeService();
  const tokenSvc = new TokenService(codes, ISSUER, keys.privateKey, keys.kid);

  // Controllers
  const discovery = new DiscoveryController(() => keys.jwks);
  const authorize = new AuthorizeController(clients, authzSvc, verifier, tokenSvc, challenge);
  const token = new TokenController(clients, tokenSvc);

  wireRoutes(app, { discovery, authorize, token });

  // Error handler
  app.use((err: any, _req, res, _next) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}
