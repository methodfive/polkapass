const baseHead = (title) => `
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica; } 
.brand { display:flex; align-items:center; gap:.5rem; }
.brand .logo { height:48px; margin-top:8px; width:auto; }
</style>
`;

export function homePage() {
    return `<!doctype html>
<html lang="en">
  <head>${baseHead('PolkaPass Demo App')}</head>
  <body class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
    <div class="max-w-4xl mx-auto p-6">
      <header class="flex items-center justify-between mb-10 brand">
        <div class="flex items-center gap-3">
          <img src="/static/polkapass.png" alt="PolkaPass" class="logo">
        </div>
        <a href="/login" class="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 font-medium hover:bg-pink-500">
          <span class="w-2 h-2 rounded-full bg-white/80"></span>
          Login with Polkadot
        </a>
      </header>
      
      <main class="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h2 class="text-lg font-semibold mb-2">Welcome</h2>
        <p class="text-white/70">Sign in with your Polkadot wallet—no passwords, no seed phrases.</p>
        <p class="text-white/70 mt-6">This Web2 app verifies you with a quick wallet signature and returns a standard OIDC ID Token (JWT).</p>
        <p class="text-white/70 mt-6">That ID Token lets apps create a session via standard OAuth/OIDC flows—interoperable with existing "Sign in with .." stacks (e.g. Google).</p>
        <p class="text-white/70 mt-12">Click <em>Login with Polkadot</em> to start the flow.</p>
      </main>
    </div>
  </body>
</html>`;
}

export function cancelledPage(error) {
    return `<!doctype html>
<html lang="en">
  <head>${baseHead('Login cancelled')}</head>
  <body class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
    <div class="max-w-xl mx-auto p-6">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur mt-16">
        <h1 class="text-xl font-semibold mb-2">Login cancelled</h1>
        <p class="text-white/70">The authorization request was cancelled or denied (<code>${error}</code>).</p>
        <div class="mt-6">
          <a href="/" class="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 font-medium hover:bg-pink-500">Try again</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function sessionPage({ payload, protectedHeader, raw }) {
    const payloadStr = JSON.stringify(payload).replace(/`/g, "\\`");
    const headerStr = JSON.stringify(protectedHeader).replace(/`/g, "\\`");

    return `<!doctype html>
<html lang="en">
  <head>${baseHead('PolkaPass Demo App – Session')}</head>
  <body class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
    <div class="max-w-5xl mx-auto p-6">
      <header class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" class="text-pink-500"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>
          <h1 class="text-xl font-semibold">PolkaPass Demo App – Session</h1>
        </div>
        <a href="/" class="text-white/70 hover:text-white underline">Home</a>
      </header>

      <main class="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h2 class="text-lg font-semibold mb-4">You are signed in</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div>
              <div class="text-xs uppercase tracking-wide text-white/60">Subject</div>
              <div class="mt-1 rounded-lg bg-black/40 border border-white/10 p-3 font-mono text-sm break-all">${payload.sub || ''}</div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-white/60">Address</div>
              <div class="mt-1 rounded-lg bg-black/40 border border-white/10 p-3 font-mono text-sm break-all">${payload.addr || ''}</div>
            </div>
          </div>
          <div class="space-y-3">
            <details open class="rounded-lg bg-black/40 border border-white/10 p-3">
              <summary class="cursor-pointer font-medium">ID Token (JWT)</summary>
              <pre class="mt-2 overflow-auto whitespace-pre-wrap break-all text-xs">${raw}</pre>
            </details>
            <details open class="rounded-lg bg-black/40 border border-white/10 p-3">
              <summary class="cursor-pointer font-medium">Decoded Claims</summary>
              <pre class="mt-2 overflow-auto whitespace-pre-wrap break-all text-xs">${JSON.stringify(JSON.parse(payloadStr), null, 2)}</pre>
            </details>
          </div>
        </div>
        <div class="mt-6">
          <a href="/" class="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 font-medium hover:bg-pink-500">Log out (clear session)</a>
        </div>
      </main>
    </div>
  </body>
</html>`;
}
