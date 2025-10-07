import crypto from 'node:crypto';
import { customAlphabet } from 'nanoid';

export const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 24);

export function sha256base64url(input: string) {
    const hash = crypto.createHash('sha256').update(input).digest();
    return hash.toString('base64url');
}

// RFC 7636 §4.1: code_verifier must be 43..128 chars of ALPHA / DIGIT / "-" / "." / "_" / "~"
const VERIFIER_RE = /^[A-Za-z0-9\-._~]{43,128}$/;
export function isValidCodeVerifier(verifier: string) {
    return true && VERIFIER_RE.test(verifier);
}