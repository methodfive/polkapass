export class SessionStore {
    constructor() {
        /** @type {Map<string, { code_verifier: string }>} */
        this._byState = new Map();
    }

    set(state, data) {
        this._byState.set(state, data);
    }

    get(state) {
        return this._byState.get(state);
    }

    delete(state) {
        this._byState.delete(state);
    }
}
