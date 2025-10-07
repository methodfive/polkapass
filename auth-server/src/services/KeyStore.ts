import { exportJWK, generateKeyPair, type JWK } from 'jose';
import crypto from 'node:crypto';

export class KeyStore {
  private _privateKey!: CryptoKey;
  private _publicJwk!: JWK;
  private _jwks!: { keys: JWK[] };

  async init() {
    const { publicKey, privateKey } = await generateKeyPair('EdDSA', { crv: 'Ed25519' });
    this._privateKey = privateKey;
    const jwk = await exportJWK(publicKey);
    (jwk as any).kid = crypto.createHash('sha256').update(JSON.stringify(jwk)).digest('hex').slice(0, 16);
    this._publicJwk = jwk;
    this._jwks = { keys: [jwk] };
  }

  get privateKey() { return this._privateKey; }
  get jwks() { return this._jwks; }
  get kid() { return (this._jwks.keys[0] as any).kid as string; }
}
