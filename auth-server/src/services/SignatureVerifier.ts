import { signatureVerify, cryptoWaitReady } from '@polkadot/util-crypto';

export class SignatureVerifier {
    async verifyUTF8(message: string, signatureHex: string, publicKeyOrSs58: string): Promise<boolean> {
        await cryptoWaitReady();
        const msgBytes = Buffer.from(message, 'utf8');
        const sigBytes = Buffer.from(signatureHex.replace(/^0x/i, ''), 'hex');
        const pkIsHex = publicKeyOrSs58.startsWith('0x') || publicKeyOrSs58.startsWith('0X');
        const pkBytesOrAddr = pkIsHex ? Buffer.from(publicKeyOrSs58.replace(/^0x/i, ''), 'hex') : publicKeyOrSs58;
        const { isValid } = signatureVerify(msgBytes, sigBytes, pkBytesOrAddr as any);
        return isValid;
    }
}
