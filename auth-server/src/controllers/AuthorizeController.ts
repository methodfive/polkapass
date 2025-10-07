import type { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { ISSUER } from '../config/env.js';
import { ClientRegistry } from '../stores/ClientRegistry.js';
import { AuthorizationService } from '../services/AuthorizationService.js';
import { SignatureVerifier } from '../services/SignatureVerifier.js';
import { TokenService } from '../services/TokenService.js';
import { ChallengeService } from '../services/ChallengeService.js';
import { consentPageHtml } from '../utils/html.js';

export class AuthorizeController {
    constructor(
        private clients: ClientRegistry,
        private authz: AuthorizationService,
        private verifier: SignatureVerifier,
        private tokens: TokenService,
        private challenge: ChallengeService,
    ) {}

    authorize = (req: Request, res: Response) => {
        const q = z.object({
            client_id: z.string(),
            redirect_uri: z.string().url(),
            response_type: z.literal('code'),
            scope: z.string().optional(),
            state: z.string().optional(),
            code_challenge: z.string().optional(),
            code_challenge_method: z.enum(['S256']).optional(),
        }).safeParse(req.query);

        if (!q.success) return res.status(400).send('invalid_request');

        const { client_id, redirect_uri, state, code_challenge, code_challenge_method } = q.data;

        const reg = this.clients.get(client_id);
        if (!reg || reg.redirect_uri !== redirect_uri) return res.status(400).send('invalid_client or redirect_uri');

        const nonce = '0x' + crypto.randomBytes(16).toString('hex');
        const exp = new Date(Date.now() + 5 * 60 * 1000);
        const challenge = this.challenge.build({
            domain: new URL(redirect_uri).host,
            uri: redirect_uri,
            chain: 'polkadot:91b171bb158e2d3848fa23a9f1c25182',
            nonce,
            expISO: exp.toISOString(),
            resources: ['openid', 'profile'],
        });

        const { authId, pending } = this.authz.createPending({
            client_id, redirect_uri, state, code_challenge, code_challenge_method,
            nonce, challenge, aud: client_id,
        });

        res.type('html').send(consentPageHtml({
            issuer: ISSUER,
            authId,
            challenge,
            redirect_uri,
            state,
        }));
    };

    complete = async (req: Request, res: Response) => {
        const Body = z.object({
            authId: z.string(),
            address: z.string(),
            publicKeyHex: z.string().optional(),
            signatureHex: z.string(),
            algo: z.enum(['sr25519', 'ed25519']).optional(),
        }).refine(d => !!(d.signature || d.signatureHex), {
            message: 'missing signature',
            path: ['signature'],
        });

        const parsed = Body.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: parsed.error.issues.map(i => i.message).join('; ')
            });
        }

        const { authId, address, publicKeyHex, signature, signatureHex } = parsed.data;

        const p = this.authz.getPending(authId);
        if (!p) return res.status(400).json({ error: 'invalid_auth' });

        // Normalize signature + verification target
        const sig = signature ?? signatureHex!;
        const verifyTarget = publicKeyHex ?? address;   // allow 0x.. pubkey or SS58

        const ok = await this.verifier.verifyUTF8(p.challenge, sig, verifyTarget);
        if (!ok) return res.status(401).json({ error: 'invalid_signature' });

        const code = this.tokens.issueCode({
            client_id: p.client_id,
            sub: `substrate:ss58:${address}`,
            address,
            nonce: p.nonce,
            code_challenge: p.code_challenge,
            code_challenge_method: p.code_challenge_method,
        });

        const u = new URL(p.redirect_uri);
        u.searchParams.set('code', code);
        if (p.state) u.searchParams.set('state', p.state);
        this.authz.deletePending(authId);

        return res.json({ redirect: u.toString() });
    };
}
