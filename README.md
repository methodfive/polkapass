# ⚡️ PolkaPass — Sign in with Polkadot

### _Open Identity for an Open Web_

**Radically open. Radically useful.**  
**PolkaPass** is a next‑generation authentication server that speaks **OAuth 2.1** and **OpenID Connect (OIDC)** while replacing passwords and centralized identity providers with **Polkadot wallets**.

Any Web2 or Web3 app can offer **“Sign in with Polkadot”** — the same convenience as “Sign in with Google,” but with **self‑sovereign keys**, **on‑chain verifiability**, and **zero data silos**.

Users prove who they are by signing a short challenge with their **sr25519 / ed25519** wallet key.  
The server verifies the signature and issues standard **JWT tokens (ID Token + Access Token)**, so existing OAuth/OIDC libraries work seamlessly — no custom SDKs and no blockchain RPCs required.

---

## 🔑 What Are OAuth and OIDC?

- **OAuth 2.1** — the global standard for delegated authorization, letting apps access resources securely _without_ handling user passwords.
- **OpenID Connect (OIDC)** — adds identity on top of OAuth, issuing signed **ID Tokens (JWTs)** that assert who the user is.

Every Web2 app using “Sign in with Google” or “Sign in with GitHub” already speaks OIDC.  
With **PolkaPass**, that same familiar flow now works — only this time, **the user’s wallet is the identity provider**, not a centralized platform.

---

## 🎯 Objectives

1. **Resilient Identity**
   - Decentralize login using verifiable wallet signatures.
   - Support multiple issuers with **JWKS anchored on‑chain**, preventing single points of failure.

2. **Web2 Compatibility**
   - Fully standards‑compliant **OAuth 2.1 / OIDC** endpoints (`/authorize`, `/token`, `/.well-known/openid-configuration`).
   - Works out of the box with existing OAuth client libraries — no custom integration layer needed.

3. **User‑Centric Authentication**
   - Passwordless sign‑in via **sr25519 / ed25519** Polkadot wallets.
   - Future roadmap: **DID‑based identity**, **social recovery**, and **key rotation**.

4. **Hackathon‑Ready Demo**
   - Includes a full **Node/Express demo app** showing the end‑to‑end flow:  
     → Click **Log in with Polkadot** → sign challenge → receive JWT → access protected route.

---

## 🛠 Tech Stack

### Authorization Server (`auth-server/`)
- [Express](https://expressjs.com/) — robust Node.js HTTP server
- [jose](https://github.com/panva/jose) — JWT + JWKS handling
- [@polkadot/util-crypto](https://github.com/polkadot-js/common/tree/master/packages/util-crypto) — signature verification (sr25519/ed25519)
- [nanoid](https://github.com/ai/nanoid) — secure nonce generation

### Browser SDK (`sdk/`)
- TypeScript, browser‑ready build
- Integrates directly with [polkadot{.js} extension](https://polkadot.js.org/extension/)
- Includes fallback demo signer for environments without wallet access

### Demo App (`demo-app/`)
- Node + Express relying party (RP) implementation
- Uses [openid-client](https://github.com/panva/node-openid-client) for OIDC
- Session‑based user login & JWT verification

---

## 📦 Repository Structure

```
/auth-server      # OAuth2/OIDC Authorization Server
/sdk              # Browser SDK for wallet interaction
/demo-app         # Example Web2 relying party (login demo)
/shared           # Shared config (.env.example)
/README.md        # Project overview
```

---

## 🖼️️ Screenshots

<p align="center">
   <img src="/assets/home.png" width="450" alt="PolkaPass logo"/>
</p>
<p align="center">
   <img src="/assets/sign.png" width="450" alt="PolkaPass logo"/>
</p>
<p align="center">
   <img src="/assets/session.png" width="450" alt="PolkaPass logo"/>
</p>

---

## ⚡️ Getting Started

### Requirements
- Node.js 18+
- npm or yarn
- [Polkadot{.js} browser extension](https://polkadot.js.org/extension/) (optional — demo includes a fallback signer)

### 1) Run the Authorization Server
```bash
cd auth-server
cp .env.example .env
npm install
npm run dev
# → http://localhost:4000
```

### 2) Run the Demo App
```bash
cd demo-app
cp .env.example .env
npm install
npm run dev
# → http://localhost:3000
```

### 3) Try the Flow
1. Open http://localhost:3000
2. Click **Log in with Polkadot**
3. Sign the challenge via your wallet (or demo signer)
4. The app receives an OAuth `code`, exchanges it for **ID Token + Access Token**
5. The app verifies the JWT via the Authorization Server’s **JWKS endpoint**

---

## 🔐 Security Considerations

> ⚠️ This is an early‑stage **hackathon prototype**. For production deployment:

- Persist tokens & authorization codes (currently in‑memory)
- Consider **DPoP / proof‑of‑possession** tokens to mitigate replay
- Anchor issuer **JWKS / DID keys** on‑chain for full decentralization
- Add **guardian‑based recovery** for key loss
- Harden security: strict CORS, CSRF protection, secure cookies, and CSP

---

## 📜 License

[Apache‑2.0](https://www.apache.org/licenses/LICENSE-2.0)

---

Built with ❤️ to bring open identity to the Polkadot ecosystem.
