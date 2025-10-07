import { describe, it, expect, beforeEach, afterEach } from 'vitest';

function reloadEnv() {
    return import('./env.js?x=' + Math.random()).then(m => m.ENV);
}

const ORIGINAL = { ...process.env };

describe('ENV config', () => {
    beforeEach(() => { process.env = { ...ORIGINAL }; });
    afterEach(() => { process.env = ORIGINAL; });

    it('provides sane defaults', async () => {
        delete process.env.PORT;
        delete process.env.AS_BASE;
        delete process.env.CLIENT_ID;
        delete process.env.REDIRECT_URI;

        const ENV = await reloadEnv();
        expect(ENV.PORT).toBe(3000);
        expect(ENV.AS_BASE).toBe('http://localhost:4000');
        expect(ENV.CLIENT_ID).toBe('demo-app');
        expect(ENV.REDIRECT_URI).toBe('http://localhost:3000/callback');
    });

    it('uses overrides from env', async () => {
        process.env.PORT = '3333';
        process.env.AS_BASE = 'https://auth.example.com';
        process.env.CLIENT_ID = 'client-123';
        process.env.REDIRECT_URI = 'https://rp.example.com/cb';

        const ENV = await reloadEnv();
        expect(ENV.PORT).toBe(3333);
        expect(ENV.AS_BASE).toBe('https://auth.example.com');
        expect(ENV.CLIENT_ID).toBe('client-123');
        expect(ENV.REDIRECT_URI).toBe('https://rp.example.com/cb');
    });
});
