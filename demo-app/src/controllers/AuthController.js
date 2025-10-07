import { homePage, cancelledPage, sessionPage } from '../views/pages.js';
import { b64url, sha256, randomStateHex, randomCodeVerifier } from '../utils/crypto.js';

export class AuthController {
  constructor({ oauthService, sessionStore }) {
    this.oauthService = oauthService;
    this.sessions = sessionStore;

    // Bind methods so they can be used directly as handlers
    this.home = this.home.bind(this);
    this.login = this.login.bind(this);
    this.callback = this.callback.bind(this);
  }

  home(_req, res) {
    res.type('html').send(homePage());
  }

  async login(_req, res, next) {
    try {
      const state = randomStateHex(16);
      const code_verifier = randomCodeVerifier(32);
      const code_challenge = b64url(sha256(code_verifier));

      this.sessions.set(state, { code_verifier });
      const url = await this.oauthService.buildAuthUrl({ state, codeChallenge: code_challenge });
      res.redirect(url);
    } catch (e) {
      next(e);
    }
  }

  async callback(req, res, next) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return res.type('html').send(cancelledPage(error));
      }
      if (!code || !state) {
        return res.status(400).send('Missing code/state');
      }

      const sess = this.sessions.get(state);
      if (!sess) {
        return res.status(400).send('Unknown state');
      }

      const tokens = await this.oauthService.exchangeCode({
        code: code.toString(),
        codeVerifier: sess.code_verifier,
      });

      // One-time use of the state
      this.sessions.delete(state);

      const { payload, protectedHeader } = await this.oauthService.verifyIdToken(tokens.id_token);

      res.type('html').send(
        sessionPage({
          payload,
          protectedHeader,
          raw: tokens.id_token,
        }),
      );
    } catch (e) {
      // If token endpoint failed, surface details for easier debugging
      if (e.details) {
        return res.status(400).send('Token error: ' + JSON.stringify(e.details));
      }
      next(e);
    }
  }
}
