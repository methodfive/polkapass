import type { PendingAuth } from '../types.js';

export class PendingStore {
    private map = new Map<string, PendingAuth>();
    set(id: string, p: PendingAuth) { this.map.set(id, p); }
    get(id: string) { return this.map.get(id); }
    delete(id: string) { this.map.delete(id); }
}
