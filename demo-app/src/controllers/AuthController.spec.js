import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

import { AuthController } from './AuthController.js';
import { SessionStore } from '../store/SessionStore.js';
import { makeApp } from '../test/appFactory.js';

vi.mock('../views/pages.js', () => ({
    homePage: () => '<h1>Home</h1>',
    cancelledPage: (e) => `<h1>Cancelled ${e}</h1>`,
    sessionPage: ({ payload }) => `<h1>Signed in as ${payload.sub ?? ''}</h1>`,
}));

describe('AuthController routes', () => {
    const session = new SessionStore();

    const oauthMock = {
        buildAuthUrl: vi.fn(),
        exchangeCode: vi.fn(),
        verifyIdToken: vi.fn(),
    };

    let app;

    beforeEach(() => {
        session._byState?.clear?.();
        oauthMock.buildAuthUrl.mockReset();
        oauthMock.exchangeCode.mockReset();
        oauthMock.verifyIdToken.mockReset();

        const ctrl = new AuthController({ oauthService: oauthMock, sessionStore: session });
        app = makeApp({ authController: ctrl });
    });

    it('GET / -> home page', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Home');
    });

    it('GET /login -> redirects to AS and stores session', async () => {
        oauthMock.buildAuthUrl.mockResolvedValue('http://as.local/oidc/auth?x=1');
        const res = await request(app).get('/login');
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('http://as.local/oidc/auth?x=1');

        // sanity: a state entry should have been created (unknown key, but count > 0)
        expect(session._byState.size).toBe(1);
    });

    it('GET /callback?error=access_denied -> shows cancelled page', async () => {
        const res = await request(app).get('/callback?error=access_denied');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Cancelled access_denied');
    });

    it('GET /callback missing code/state -> 400', async () => {
        const res = await request(app).get('/callback');
        expect(res.status).toBe(400);
        expect(res.text).toContain('Missing code/state');
    });

    it('GET /callback unknown state -> 400', async () => {
        const res = await request(app).get('/callback?code=abc&state=notfound');
        expect(res.status).toBe(400);
        expect(res.text).toContain('Unknown state');
    });

    it('GET /callback happy path -> renders session page', async () => {
        // Arrange: seed a state
        const state = 's1';
        session.set(state, { code_verifier: 'ver' });

        oauthMock.exchangeCode.mockResolvedValue({ id_token: 'jwt' });
        oauthMock.verifyIdToken.mockResolvedValue({
            payload: { sub: 'user-1', addr: 'addr-xyz' },
            protectedHeader: { alg: 'RS256' },
        });

        const res = await request(app).get(`/callback?code=abc&state=${state}`);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Signed in as user-1');

        // State should be one-time use
        expect(session.get(state)).toBeUndefined();
    });

    it('GET /callback token error -> forwards body', async () => {
        const state = 's2';
        session.set(state, { code_verifier: 'ver' });

        const error = { error: 'invalid_grant' };
        const err = new Error('Token endpoint error');
        err.details = error;
        oauthMock.exchangeCode.mockRejectedValue(err);

        const res = await request(app).get(`/callback?code=bad&state=${state}`);
        expect(res.status).toBe(400);
        expect(res.text).toContain('Token error');
        expect(res.text).toContain('invalid_grant');
    });
});
