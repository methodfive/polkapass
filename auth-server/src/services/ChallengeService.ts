export class ChallengeService {
    build(params: {
        domain: string; uri: string; chain: string; nonce: string; expISO: string; resources: string[]; addressHint?: string;
    }) {
        const { domain, uri, chain, nonce, expISO, resources, addressHint } = params;
        const lines = [
            `URI: ${uri}`,
            `Chain: ${chain}`,
            `Nonce: ${nonce}`,
            `Expiration Time: ${expISO}`,
            `Requested Resources:`,
            ...resources.map(r => `- ${r}`),
            ``,
            `Statement:`,
            `By signing, you authenticate to ${domain} and agree to bind tokens to this key.`,
        ];
        return lines.join('\n').trim();
    }
}
