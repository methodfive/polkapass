export function consentPageHtml(params: {
    issuer: string;
    authId: string;
    challenge: string;
    redirect_uri: string;
    state?: string;
}) {
    const { issuer, authId, challenge, redirect_uri, state } = params;
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sign in with Polkadot</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style> body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; } </style>
  </head>
  <body class="min-h-screen bg-gradient-to-br from-black via-[#141019] to-black text-white">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur p-8">
        <div class="flex items-center gap-3 mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" class="text-pink-500"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>
          <h1 class="text-2xl font-bold">Sign in with Polkadot</h1>
        </div>
        <p class="text-sm text-white/70 mb-4">Please review and sign the challenge below with your wallet to continue.</p>
        <div class="mb-6">
          <label class="text-xs uppercase tracking-wide text-white/60">Challenge</label>
          <pre id="challenge" class="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-4 text-sm border border-white/10"></pre>
        </div>
        <div class="flex gap-3">
          <button id="sign" class="group relative inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold hover:bg-pink-500">
            <span class="inline-block w-2 h-2 rounded-full bg-white/80 group-hover:scale-125 transition"></span>Sign with Polkadot.js
          </button>
          <button id="cancel" class="inline-flex items-center gap-2 rounded-xl bg-gray-600 px-5 py-3 font-semibold hover:bg-gray-500">Cancel</button>
        </div>
        <div id="status" class="mt-4 text-sm text-white/70"></div>
        <p class="mt-8 text-xs text-white/50">By signing, you prove control of your Polkadot key.</p>
      </div>
    </div>

    <script type="module">
      import { signChallenge } from '${issuer}/public/sdk.js';
      const challengeEl = document.getElementById('challenge');
      const signBtn = document.getElementById('sign');
      const status = document.getElementById('status');
      const authId = ${JSON.stringify(authId)};
      const challenge = ${JSON.stringify(challenge)};
      const redirectUri = ${JSON.stringify(redirect_uri)};
      const stateParam = ${JSON.stringify(state || '')};
      challengeEl.textContent = challenge;

      signBtn.onclick = async () => {
        status.textContent = 'Requesting signature from wallet...';
        try {
          const result = await signChallenge(challenge);
          status.textContent = 'Verifying signature...';
          const resp = await fetch('${issuer}/authorize/complete', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ authId, ...result }),
            credentials: 'include'
          });
          const data = await resp.json();
          if (!resp.ok) throw new Error(data.error || 'Authorization failed');
          window.location.href = data.redirect;
        } catch (e) {
          status.textContent = 'Error: ' + (e.message || e);
        }
      };

      document.getElementById('cancel').onclick = () => {
        try {
          const u = new URL(redirectUri);
          if (stateParam) u.searchParams.set('state', stateParam);
          u.searchParams.set('error', 'access_denied');
          window.location.href = u.toString();
        } catch {
          window.location.href = 'http://localhost:3000/?error=access_denied';
        }
      };
    </script>
  </body>
</html>`;
}
