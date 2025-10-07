import type { CodeGrant } from '../types.js';

export class CodeStore {
    private map = new Map<string, CodeGrant>();
    set(code: string, grant: CodeGrant) { this.map.set(code, grant); }
    get(code: string) { return this.map.get(code); }
    delete(code: string) { this.map.delete(code); }
}
