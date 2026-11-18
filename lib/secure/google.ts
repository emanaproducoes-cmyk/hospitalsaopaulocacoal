import { createHash, createPublicKey, createVerify } from 'node:crypto';

type Jwk = { kid: string; kty: string; n: string; e: string; alg?: string; use?: string };
import { cfg } from './config';
import { encryptJson, decryptJson, newToken } from './crypto';

/**
 * Login com Google (OAuth 2.0 + OpenID Connect) com state, nonce e PKCE.
 * O id_token é verificado aqui mesmo (assinatura RS256 com as chaves públicas do Google,
 * emissor, público, validade, nonce e e-mail verificado). Mesmo entrando com Google,
 * o usuário passa pela 2ª etapa: código enviado ao e-mail.
 */

export const OAUTH_COOKIE = '__Host-hbsp_oauth';
const b64u = (b: Buffer) => b.toString('base64url');

export function googleStart(role: 'paciente' | 'medico') {
  const state = newToken(24);
  const nonce = newToken(24);
  const verifier = newToken(48);
  const challenge = b64u(createHash('sha256').update(verifier).digest());
  const p = new URLSearchParams({
    client_id: cfg.googleId,
    redirect_uri: `${cfg.siteUrl}/api/secure/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });
  const cookie = encryptJson({ state, nonce, verifier, role, at: Date.now() }, 'oauth');
  return { url: `https://accounts.google.com/o/oauth2/v2/auth?${p}`, cookie };
}

let jwks: { keys: Jwk[]; at: number } | null = null;
async function googleKeys() {
  if (jwks && Date.now() - jwks.at < 3600_000) return jwks.keys;
  const r = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  const j = (await r.json()) as { keys: Jwk[] };
  jwks = { keys: j.keys, at: Date.now() };
  return j.keys;
}

export interface GoogleIdentity { sub: string; email: string; name: string; role: 'paciente' | 'medico' }

export async function googleCallback(code: string, state: string, cookieVal: string | null): Promise<GoogleIdentity> {
  const saved = decryptJson<{ state: string; nonce: string; verifier: string; role: 'paciente' | 'medico'; at: number } | null>(cookieVal, 'oauth', null);
  if (!saved || saved.state !== state || Date.now() - saved.at > 10 * 60_000) throw new Error('estado inválido');
  const tok = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: cfg.googleId, client_secret: cfg.googleSecret, redirect_uri: `${cfg.siteUrl}/api/secure/auth/google/callback`, grant_type: 'authorization_code', code_verifier: saved.verifier }),
  });
  if (!tok.ok) throw new Error('troca de código falhou');
  const { id_token } = (await tok.json()) as { id_token: string };
  const [h, p, s] = id_token.split('.');
  const header = JSON.parse(Buffer.from(h, 'base64url').toString()) as { kid: string; alg: string };
  if (header.alg !== 'RS256') throw new Error('algoritmo inesperado');
  const jwk = (await googleKeys()).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('chave do Google não encontrada');
  const ok = createVerify('RSA-SHA256').update(`${h}.${p}`).verify(createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(s, 'base64url'));
  if (!ok) throw new Error('assinatura inválida');
  const c = JSON.parse(Buffer.from(p, 'base64url').toString()) as { iss: string; aud: string; exp: number; nonce: string; sub: string; email: string; email_verified: boolean; name?: string };
  if (!['https://accounts.google.com', 'accounts.google.com'].includes(c.iss) || c.aud !== cfg.googleId || c.exp * 1000 < Date.now() || c.nonce !== saved.nonce) throw new Error('token inválido');
  if (!c.email_verified) throw new Error('e-mail do Google não verificado');
  return { sub: c.sub, email: c.email.toLowerCase(), name: c.name || '', role: saved.role };
}
