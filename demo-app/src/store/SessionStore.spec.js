import { describe, it, expect } from 'vitest';
import { SessionStore } from './SessionStore.js';

describe('SessionStore', () => {
    it('set/get/delete', () => {
        const s = new SessionStore();
        s.set('abc', { code_verifier: 'cv' });
        expect(s.get('abc')).toEqual({ code_verifier: 'cv' });

        s.delete('abc');
        expect(s.get('abc')).toBeUndefined();
    });
});
