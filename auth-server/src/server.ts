import { makeApp } from './app.js';
import { PORT, ISSUER } from './config/env.js';

(async () => {
  const app = await makeApp();
  app.listen(PORT, () => console.log(`Auth Server on ${ISSUER}`));
})();
