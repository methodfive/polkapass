export type Client = { redirect_uri: string };
export class ClientRegistry {
    private clients = new Map<string, Client>([
        ['demo-app', { redirect_uri: 'http://localhost:3000/callback' }],
    ]);
    get(clientId: string) { return this.clients.get(clientId); }
}
