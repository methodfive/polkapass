import 'dotenv/config';

export const ENV = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    AS_BASE: process.env.AS_BASE || 'http://localhost:4000',
    CLIENT_ID: process.env.CLIENT_ID || 'demo-app',
    REDIRECT_URI: process.env.REDIRECT_URI || `http://localhost:${process.env.PORT ? Number(process.env.PORT) : 3000}/callback`,
};
