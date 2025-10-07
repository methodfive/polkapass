import { describe, it, expect } from 'vitest';
import { b64url, sha256, randomStateHex, randomCodeVerifier } from './crypto.js';

describe('crypto utils', () => {
    it('b64url/sha256', () => {
        const out = b64url(sha256('abc'));
        // Well-known SHA256("abc")
        expect(out).toBe('ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0'); // base64url
    });

    it('random generators produce strings', () => {
        expect(typeof randomStateHex()).toBe('string');
        expect(typeof randomCodeVerifier()).toBe('string');
    });
});
