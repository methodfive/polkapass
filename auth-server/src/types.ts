export type PendingAuth = {
    client_id: string;
    redirect_uri: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: 'S256';
    nonce: string;
    challenge: string;
    aud: string;
    createdAt: number;
    address?: string;
    publicKey?: string;
    algo?: 'sr25519' | 'ed25519';
};

export type CodeGrant = {
    client_id: string;
    sub: string;
    address: string;
    nonce: string;
    code_challenge?: string;
    code_challenge_method?: 'S256';
    createdAt: number;
};