import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ESM deps first
vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('jose', () => ({
    createRemoteJWKSet: vi.fn(() => (/* JWKS function */ {})),
    jwtVerify: vi.fn(async () => ({
        payload: { sub: 'user-1' },
        protectedHeader: { alg: 'RS256' },
    })),
}));

import fetch from 'node-fetch';
import { jwtVerify } from 'jose';
import { OAuthService } from './OAuthService.js';

const disco = {
    authorization_endpoint: 'http://as.local/oidc/auth',
    token_endpoint: 'http://as.local/oidc/token',
};

function mockFetchSequence(...responses) {
    fetch.mockReset();
    let i = 0;
    fetch.mockImplementation(async () => {
        const r = responses[i++] ?? responses[responses.length - 1];
        return {
            ok: r.ok,
            status: r.status ?? (r.ok ? 200 : 400),
            json: async () => r.json,
            text: async () => JSON.stringify(r.json),
            headers: new Map([['content-type', 'application/json']]),
        };
    });
}

describe('OAuthService', () => {
    const svc = () =>
        new OAuthService({
            asBase: 'http://as.local',
            clientId: 'demo-app',
            redirectUri: 'http://rp.local/callback',
        });

    beforeEach(() => {
        fetch.mockReset();
    });

    it('buildAuthUrl uses discovery & sets PKCE params', async () => {
        mockFetchSequence({ ok: true, json: disco }); // discovery
        const s = svc();
        const url = await s.buildAuthUrl({ state: 'st', codeChallenge: 'cc' });

        const u = new URL(url);
        expect(u.origin + u.pathname).toBe(disco.authorization_endpoint);
        expect(u.searchParams.get('response_type')).toBe('code');
        expect(u.searchParams.get('client_id')).toBe('demo-app');
        expect(u.searchParams.get('redirect_uri')).toBe('http://rp.local/callback');
        expect(u.searchParams.get('scope')).toBe('openid profile');
        expect(u.searchParams.get('state')).toBe('st');
        expect(u.searchParams.get('code_challenge')).toBe('cc');
        expect(u.searchParams.get('code_challenge_method')).toBe('S256');
    });

    it('exchangeCode posts to token endpoint (happy path)', async () => {
        mockFetchSequence(
            { ok: true, json: disco },                            // discovery
            { ok: true, json: { id_token: 'jwt', access_token: 'at' } }, // token
        );
        const s = svc();
        const tok = await s.exchangeCode({ code: 'abc', codeVerifier: 'ver' });
        expect(tok).toEqual({ id_token: 'jwt', access_token: 'at' });
        // (We could also assert that fetch was called with x-www-form-urlencoded body)
    });

    it('exchangeCode surfaces token error body', async () => {
        mockFetchSequence(
            { ok: true, json: disco },                        // discovery
            { ok: false, status: 400, json: { error: 'invalid_grant' } },
        );
        const s = svc();
        await expect(
            s.exchangeCode({ code: 'bad', codeVerifier: 'ver' }),
        ).rejects.toMatchObject({
            message: 'Token endpoint error',
            details: { error: 'invalid_grant' },
        });
    });

    it('verifyIdToken returns payload/header', async () => {
        const s = svc();
        const out = await s.verifyIdToken('fake.jwt');
        expect(jwtVerify).toHaveBeenCalled();
        expect(out.payload.sub).toBe('user-1');
        expect(out.protectedHeader.alg).toBe('RS256');
    });
});
