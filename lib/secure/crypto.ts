import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { dataKeys, indexKey, pepper } from './config';

const scrypt = promisify(scryptCb) as (pw: string | Buffer, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

/* ------------------------------------------------------------------ */
/* Criptografia de dados: AES-256-GCM com versão de chave (rotação)    */
/* Formato: v1.<kid>.<iv b64url>.<tag b64url>.<dados b64url>           */
/* O tag do GCM garante integridade: qualquer alteração é detectada.   */
/* ------------------------------------------------------------------ */
const b64u = (b: Buffer) => b.toString('base64url');
const unb64u = (s: string) => Buffer.from(s, 'base64url');

export function encrypt(plain: string | Buffer, aad = ''): string {
  const { active, keys } = dataKeys();
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', keys.get(active)!, iv);
  if (aad) c.setAAD(Buffer.from(aad));
  const data = Buffer.concat([c.update(typeof plain === 'string' ? Buffer.from(plain, 'utf8') : plain), c.final()]);
  return ['v1', active, b64u(iv), b64u(c.getAuthTag()), b64u(data)].join('.');
}

export function decryptBuffer(token: string, aad = ''): Buffer {
  const [v, kid, iv, tag, data] = token.split('.');
  if (v !== 'v1') throw new Error('formato de criptografia desconhecido');
  const key = dataKeys().keys.get(kid);
  if (!key) throw new Error('chave de criptografia não encontrada (rotação?)');
  const d = createDecipheriv('aes-256-gcm', key, unb64u(iv));
  if (aad) d.setAAD(Buffer.from(aad));
  d.setAuthTag(unb64u(tag));
  return Buffer.concat([d.update(unb64u(data)), d.final()]); // lança erro se o dado foi adulterado
}

export const decrypt = (token: string, aad = '') => decryptBuffer(token, aad).toString('utf8');
export const encryptJson = (v: unknown, aad = '') => encrypt(JSON.stringify(v), aad);
export function decryptJson<T>(token: string | null | undefined, aad = '', fallback: T): T {
  if (!token) return fallback;
  return JSON.parse(decrypt(token, aad)) as T;
}

/** Arquivos: mesmo esquema, em binário. */
export function encryptFile(buf: Buffer, aad: string): Buffer {
  const { active, keys } = dataKeys();
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', keys.get(active)!, iv);
  c.setAAD(Buffer.from(aad));
  const data = Buffer.concat([c.update(buf), c.final()]);
  const head = Buffer.from(`HBSPENC1:${active}:`);
  return Buffer.concat([head, iv, c.getAuthTag(), data]);
}

export function decryptFile(buf: Buffer, aad: string): Buffer {
  const s = buf.subarray(0, 64).toString('latin1');
  const m = s.match(/^HBSPENC1:([A-Za-z0-9_-]+):/);
  if (!m) throw new Error('arquivo sem cabeçalho de criptografia');
  const off = m[0].length;
  const key = dataKeys().keys.get(m[1]);
  if (!key) throw new Error('chave do arquivo não encontrada');
  const iv = buf.subarray(off, off + 12);
  const tag = buf.subarray(off + 12, off + 28);
  const d = createDecipheriv('aes-256-gcm', key, iv);
  d.setAAD(Buffer.from(aad));
  d.setAuthTag(tag);
  return Buffer.concat([d.update(buf.subarray(off + 28)), d.final()]);
}

/* ------------------------------------------------------------------ */
/* Índice cego: permite achar por e-mail/CPF/nome sem guardar em claro */
/* ------------------------------------------------------------------ */
export function blindIndex(kind: string, value: string): string {
  const norm = value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  return createHmac('sha256', indexKey()).update(`${kind}:${norm}`).digest('base64url');
}

/* ------------------------------------------------------------------ */
/* Senhas: scrypt (memória alta, resistente a GPU), comparação segura  */
/* ------------------------------------------------------------------ */
const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const dk = await scrypt(pw.normalize('NFKC'), salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${b64u(salt)}$${b64u(dk)}`;
}

export async function verifyPassword(pw: string, stored: string | null | undefined): Promise<boolean> {
  // Sem hash (conta só Google) ou hash inválido: ainda calcula, para não vazar tempo de resposta.
  const parts = (stored || '').split('$');
  const salt = parts.length === 6 ? unb64u(parts[4]) : randomBytes(16);
  const dk = await scrypt(pw.normalize('NFKC'), salt, 64, SCRYPT);
  if (parts.length !== 6) return false;
  const ref = unb64u(parts[5]);
  return ref.length === dk.length && timingSafeEqual(ref, dk);
}

/** Política de senha: 10+ caracteres, letras e números, sem padrões óbvios. */
export function passwordProblems(pw: string, email = ''): string[] {
  const p: string[] = [];
  if (pw.length < 10) p.push('use pelo menos 10 caracteres');
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) p.push('misture letras e números');
  if (/^(.)\1+$/.test(pw) || /(123456|abcdef|qwerty|senha|password|hospital)/i.test(pw)) p.push('evite sequências e palavras comuns');
  const user = email.split('@')[0];
  if (user && user.length > 3 && pw.toLowerCase().includes(user.toLowerCase())) p.push('não use seu e-mail na senha');
  return p;
}

/* ------------------------------------------------------------------ */
/* Tokens, códigos e hashes                                             */
/* ------------------------------------------------------------------ */
export const newToken = (bytes = 32) => b64u(randomBytes(bytes));
export const tokenHash = (t: string) => createHmac('sha256', pepper()).update(t).digest('base64url');
export const sha256 = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');
export const otpCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Identificador anônimo de IP/navegador (para limites e alertas sem guardar o IP em claro). */
export const anonId = (v: string) => createHmac('sha256', pepper()).update('anon:' + v).digest('base64url').slice(0, 22);
