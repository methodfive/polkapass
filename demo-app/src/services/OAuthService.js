import fetch from 'node-fetch';
import qs from 'qs';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export class OAuthService {
    constructor({ asBase, clientId, redirectUri }) {
        this.asBase = asBase.replace(/\/+$/, '');
        this.clientId = clientId;
        this.redirectUri = redirectUri;
        this._jwks = createRemoteJWKSet(new URL(`${this.asBase}/.well-known/jwks.json`));
        this._disco = null; // will hold discovery doc
    }

    async _ensureDiscovery() {
        if (this._disco) return this._disco;
        const res = await fetch(`${this.asBase}/.well-known/openid-configuration`);
        if (!res.ok) throw new Error(`Discovery failed: ${res.status}`);
        this._disco = await res.json();
        return this._disco;
    }

    async buildAuthUrl({ state, codeChallenge }) {
        const disco = await this._ensureDiscovery();
        const authUrl = new URL(disco.authorization_endpoint);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', this.clientId);
        authUrl.searchParams.set('redirect_uri', this.redirectUri);
        authUrl.searchParams.set('scope', 'openid profile');
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        return authUrl.toString();
    }

    async exchangeCode({ code, codeVerifier }) {
        const disco = await this._ensureDiscovery();
        const body = qs.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            code_verifier: codeVerifier,
        });

        const resp = await fetch(disco.token_endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body,
        });

        const json = await resp.json();
        if (!resp.ok) {
            const err = new Error('Token endpoint error');
            err.details = json;
            throw err;
        }
        return json;
    }

    async verifyIdToken(idToken) {
        const { payload, protectedHeader } = await jwtVerify(idToken, this._jwks, {
            issuer: this.asBase,
            audience: this.clientId,
        });
        return { payload, protectedHeader };
    }
}
