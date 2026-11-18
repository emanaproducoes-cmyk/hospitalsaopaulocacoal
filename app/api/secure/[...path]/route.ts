import { handle } from '@/lib/secure/api';

/**
 * Porta única da API segura (área do paciente, área do médico e administração).
 * Toda a lógica, as checagens de sessão, papel, origem e permissão estão em lib/secure/api.ts.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const path = (req: Request) => new URL(req.url).pathname.replace(/^\/api\/secure\/?/, '').replace(/\/$/, '');

export const GET = (req: Request) => handle(req, path(req));
export const POST = (req: Request) => handle(req, path(req));
export const PUT = (req: Request) => handle(req, path(req));
