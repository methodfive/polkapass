import { ISSUER } from '../config/env.js';
import type { Request, Response } from 'express';

export class DiscoveryController {
    constructor(private getJwks: () => any) {}

    openidConfiguration = (_req: Request, res: Response) => {
        res.json({
            issuer: ISSUER,
            authorization_endpoint: `${ISSUER}/authorize`,
            token_endpoint: `${ISSUER}/token`,
            jwks_uri: `${ISSUER}/.well-known/jwks.json`,
            response_types_supported: ['code'],
            code_challenge_methods_supported: ['S256'],
            id_token_signing_alg_values_supported: ['EdDSA'],
            scopes_supported: ['openid', 'profile'],
            claims_supported: ['sub', 'addr', 'nonce', 'iat', 'exp', 'aud', 'iss'],
        });
    };

    jwks = (_req: Request, res: Response) => {
        const jwks = this.getJwks() ?? { keys: [] };
        res.json(jwks);
    };
}
