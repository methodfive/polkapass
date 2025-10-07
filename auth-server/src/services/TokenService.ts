import { SignJWT, type JWTPayload } from 'jose';
import type { CodeGrant } from '../types.js';
import { CodeStore } from '../stores/CodeStore.js';
import { nano } from '../utils/crypto.js';

export class TokenService {
    constructor(private codeStore: CodeStore, private issuer: string, private signKey: CryptoKey, private kid: string) {}

    // after verified wallet signature -> issue code
    issueCode(grant: Omit<CodeGrant, 'createdAt'>): string {
        const code = nano();
        this.codeStore.set(code, { ...grant, createdAt: Date.now() });
        return code;
    }

    getGrant(code: string) { return this.codeStore.get(code); }
    consumeCode(code: string) { this.codeStore.delete(code); }

    async mintIdToken(grant: CodeGrant): Promise<string> {
        const now = Math.floor(Date.now() / 1000);
        const payload: JWTPayload = {
            iss: this.issuer,
            aud: grant.client_id,
            sub: grant.sub,
            iat: now,
            exp: now + 600,
            nonce: grant.nonce,
            addr: grant.address,
        };

        return await new SignJWT(payload)
            .setProtectedHeader({ alg: 'EdDSA', kid: this.kid })
            .setIssuer(this.issuer)
            .setAudience(grant.client_id)
            .setSubject(grant.sub)
            .setIssuedAt(now)
            .setExpirationTime('10m')
            .sign(this.signKey);
    }
}
