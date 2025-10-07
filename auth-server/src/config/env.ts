import 'dotenv/config';

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const ISSUER = process.env.ISSUER ?? `http://localhost:${PORT}`;
