import { describe, it, expect } from 'vitest';
import { homePage, cancelledPage, sessionPage } from './pages.js';

describe('pages', () => {
    it('homePage includes login link', () => {
        const html = homePage();
        expect(html).toContain('Login with Polkadot');
        expect(html).toContain('href="/login"');
    });

    it('cancelledPage displays error code', () => {
        const html = cancelledPage('access_denied');
        expect(html).toContain('Login cancelled');
        expect(html).toContain('access_denied');
    });

    it('sessionPage shows subject and addr', () => {
        const html = sessionPage({
            payload: { sub: 'user-1', addr: '5F...' },
            protectedHeader: { alg: 'RS256' },
            raw: 'header.payload.sig',
        });
        expect(html).toContain('You are signed in');
        expect(html).toContain('user-1');
        expect(html).toContain('5F...');
        expect(html).toContain('ID Token (JWT)');
    });
});
