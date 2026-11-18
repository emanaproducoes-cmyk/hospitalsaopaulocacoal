import { db, now, minutesFromNow, type Role, type SessionRow, type UserRow } from './db';
import { anonId, decrypt, newToken, tokenHash } from './crypto';
import { SESSION_POLICY } from './config';
import { securityEvent } from './security';

/**
 * Sessões: token aleatório de 256 bits num cookie __Host- (HttpOnly, Secure, SameSite=Strict).
 * No banco fica só o HMAC do token. A sessão nasce "pendente" e só vale depois do
 * código de verificação por e-mail (2ª etapa). Expira por inatividade e por tempo máximo,
 * e é presa ao navegador que a criou.
 */

export const COOKIE = '__Host-hbsp_sid';

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function cookieHeader(name: string, value: string, maxAgeSec: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSec}`;
}

export const clientIp = (req: Request) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
export const ipHash = (req: Request) => anonId(clientIp(req));
const uaHash = (req: Request) => anonId(req.headers.get('user-agent') || '');

export async function createSession(req: Request, user: UserRow, mfaOk: boolean): Promise<{ token: string; row: SessionRow }> {
  const token = newToken();
  const pol = SESSION_POLICY[user.role];
  const row = await db.insert('sessions', {
    user_id: user.id,
    role: user.role,
    token_hash: tokenHash(token),
    mfa_ok: mfaOk,
    ua_hash: uaHash(req),
    ip_hash: ipHash(req),
    created_at: now(),
    last_seen_at: now(),
    expires_at: minutesFromNow(mfaOk ? pol.absolute : 15),
  });
  return { token, row };
}

export interface Auth { session: SessionRow; user: UserRow; email: string }

/** Lê e valida a sessão. Com requireMfa, exige a 2ª etapa concluída. */
export async function getAuth(req: Request, opts: { requireMfa?: boolean; roles?: Role[] } = {}): Promise<Auth | null> {
  const token = readCookie(req, COOKIE);
  if (!token || token.length < 30) return null;
  const s = await db.one('sessions', { token_hash: tokenHash(token) });
  if (!s) {
    await securityEvent('sessao-invalida', 'baixa', { ipHash: ipHash(req), detail: 'token de sessão desconhecido' });
    return null;
  }
  const pol = SESSION_POLICY[s.role];
  const idleOk = Date.now() - new Date(s.last_seen_at).getTime() < pol.idle * 60_000;
  if (new Date(s.expires_at).getTime() < Date.now() || !idleOk) {
    await db.remove('sessions', { id: s.id });
    return null;
  }
  if (s.ua_hash !== uaHash(req)) {
    await db.remove('sessions', { id: s.id });
    await securityEvent('sessao-sequestrada', 'alta', { userId: s.user_id, ipHash: ipHash(req), detail: 'sessão usada em outro navegador: encerrada' });
    return null;
  }
  if (opts.requireMfa !== false && !s.mfa_ok) return null;
  if (opts.roles && !opts.roles.includes(s.role)) {
    await securityEvent('acesso-negado-papel', 'media', { userId: s.user_id, ipHash: ipHash(req), detail: `papel ${s.role} tentou área restrita` });
    return null;
  }
  const user = await db.one('users', { id: s.user_id });
  if (!user || user.status === 'bloqueado' || user.status === 'convidado') return null;
  if (opts.requireMfa !== false && user.status !== 'ativo') return null;
  await db.update('sessions', { id: s.id }, { last_seen_at: now() });
  return { session: s, user, email: decrypt(user.email_enc, 'email') };
}

export async function upgradeSession(s: SessionRow): Promise<string> {
  // Novo token após a 2ª etapa (evita fixação de sessão).
  const token = newToken();
  await db.update('sessions', { id: s.id }, { token_hash: tokenHash(token), mfa_ok: true, expires_at: minutesFromNow(SESSION_POLICY[s.role].absolute), last_seen_at: now() });
  return token;
}

export async function endSession(req: Request) {
  const token = readCookie(req, COOKIE);
  if (token) await db.remove('sessions', { token_hash: tokenHash(token) });
}
