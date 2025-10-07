import { nano } from '../utils/crypto.js';
import type { PendingAuth } from '../types.js';
import { PendingStore } from '../stores/PendingStore.js';

export class AuthorizationService {
    constructor(private store: PendingStore) {}

    createPending(input: Omit<PendingAuth, 'createdAt'>): { authId: string; pending: PendingAuth } {
        const authId = nano();
        const pending: PendingAuth = { ...input, createdAt: Date.now() };
        this.store.set(authId, pending);
        return { authId, pending };
    }

    getPending(id: string) { return this.store.get(id); }
    deletePending(id: string) { this.store.delete(id); }
}
