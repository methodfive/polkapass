import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeServer } from './server.js';

describe('server bootstrap', () => {
    it('exposes /healthz', async () => {
        const app = makeServer();
        const res = await request(app).get('/healthz');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true });
    });
});
