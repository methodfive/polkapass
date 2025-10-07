import crypto from 'node:crypto';

export function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest();
}

export function randomStateHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function randomCodeVerifier(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}
