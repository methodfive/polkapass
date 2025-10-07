import type { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { z } from 'zod';
import { ClientRegistry } from '../stores/ClientRegistry.js';
import { TokenService } from '../services/TokenService.js';
import { isValidCodeVerifier, sha256base64url } from '../utils/crypto.js';

export class TokenController {
    public parseForm = bodyParser.urlencoded({ extended: true });

    constructor(private clients: ClientRegistry, private tokens: TokenService) {}

    token = async (req: Request, res: Response) => {
        const q = z.object({
            grant_type: z.literal('authorization_code'),
            code: z.string(),
            redirect_uri: z.string().url(),
            client_id: z.string().optional(),
            code_verifier: z.string().optional(),
        }).safeParse(req.body);

        if (!q.success) return res.status(400).json({ error: 'invalid_request' });

        const { code, redirect_uri, code_verifier } = q.data;
        const grant = this.tokens.getGrant(code);
        if (!grant) return res.status(400).json({ error: 'invalid_grant' });

        const reg = this.clients.get(grant.client_id);
        if (!reg || reg.redirect_uri !== redirect_uri) return res.status(400).json({ error: 'invalid_client' });

        // PKCE enforcement
        if (grant.code_challenge) {
            if (!code_verifier) {
                return res.status(400).json({ error: 'invalid_request', error_description: 'code_verifier required' });
            }
            if (!isValidCodeVerifier(code_verifier)) {
                return res.status(400).json({ error: 'invalid_grant', error_description: 'invalid code_verifier' });
            }
            if (grant.code_challenge_method && grant.code_challenge_method !== 'S256') {
                return res.status(400).json({ error: 'invalid_grant', error_description: 'unsupported code_challenge_method' });
            }
            const computed = sha256base64url(code_verifier);
            if (computed !== grant.code_challenge) {
                return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
            }
        }

        const idToken = await this.tokens.mintIdToken(grant);
        const accessToken = idToken;

        this.tokens.consumeCode(code);

        return res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 600,
            id_token: idToken,
        });
    };
}
