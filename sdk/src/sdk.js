/**
 * Sign an arbitrary challenge using a Polkadot wallet.
 *
 * @param {string} challengeText
 * @param {{ appName?: string, preferType?: 'sr25519'|'ed25519' }} [opts]
 * @returns {Promise<{ address: string, publicKeyHex?: string, signatureHex: string, algo: 'sr25519'|'ed25519' }>}
 */
export async function signChallenge(challengeText, opts = {}) {
    const { appName = 'PolkaPass Demo', preferType = 'sr25519' } = opts;

    const toHex = (u8) => '0x' + Array.from(u8, b => b.toString(16).padStart(2, '0')).join('');
    const bytes = new TextEncoder().encode(challengeText);

    // Require injected wallets (e.g., Polkadot{.js} extension)
    const injected = (globalThis && globalThis.injectedWeb3) || undefined;
    if (!injected || typeof injected !== 'object' || Object.keys(injected).length === 0) {
        throw new Error(
            'No injected Polkadot wallet detected. Please install/enable a compatible wallet (e.g., Polkadot{.js}) and try again.'
        );
    }

    const providers = Object.values(injected).filter(Boolean);
    let lastErr;
    for (const provider of providers) {
        try {
            const ext = await provider.enable?.(appName);
            if (!ext) { lastErr = new Error('Wallet did not return an extension'); continue; }

            const signRaw = ext.signer?.signRaw;
            if (typeof signRaw !== 'function') { lastErr = new Error('Wallet does not expose signer.signRaw'); continue; }

            const accounts = await ext.accounts?.get?.();
            if (!Array.isArray(accounts) || accounts.length === 0) { lastErr = new Error('No accounts in wallet'); continue; }

            // Prefer requested crypto type; otherwise first account
            const pick =
                accounts.find(a => (a?.type || a?.meta?.crypto) === preferType) ??
                accounts[0];

            const rs = await signRaw({
                address: pick.address,
                data: toHex(bytes),
                type: 'bytes'
            });

            const signatureHex = rs?.signature;
            if (!signatureHex) throw new Error('Wallet returned no signature');

            const algo = (pick?.type || pick?.meta?.crypto) === 'ed25519' ? 'ed25519' : 'sr25519';

            return {
                address: pick.address,
                publicKeyHex: pick?.publicKey, // may be undefined depending on wallet
                signatureHex,
                algo
            };
        } catch (err) {
            lastErr = err;
            // try next provider
        }
    }

    throw new Error(
        `No usable wallet signer found. ${lastErr ? `Last error: ${lastErr.message}` : ''}`.trim()
    );
}