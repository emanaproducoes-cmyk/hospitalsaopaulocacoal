import { randomBytes } from 'node:crypto';

/**
 * Configuração do ambiente seguro (Área do paciente / Área do médico).
 * Sem as variáveis do Supabase, o sistema roda em MODO DEMONSTRAÇÃO:
 * dados fictícios, em memória, e-mails exibidos numa caixa de testes. Nunca use dados reais nele.
 *
 * Variáveis (Vercel → Settings → Environment Variables, nunca no código):
 *  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   banco Postgres + arquivos (região São Paulo)
 *  HBSP_DATA_KEYS        chaves de criptografia "k1:<base64 32 bytes>,k2:<...>" (rotação)
 *  HBSP_ACTIVE_KEY       id da chave usada para gravar (ex.: k2)
 *  HBSP_INDEX_KEY        chave (base64 32 bytes) dos índices cegos (busca sem expor o dado)
 *  HBSP_SESSION_PEPPER   segredo extra para hash de sessões e códigos
 *  RESEND_API_KEY, MAIL_FROM          envio de e-mails (código de acesso e avisos)
 *  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET   login com Google
 *  SECURITY_ALERT_EMAIL  quem recebe os alertas de tentativa de invasão
 *  HBSP_ADMIN_EMAIL      e-mail do primeiro administrador (bootstrap)
 */

const env = (k: string) => (typeof process !== 'undefined' ? process.env[k] || '' : '');

export const DEMO = !(env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY'));

/** Em produção, a falta de chaves é erro fatal: nunca gravamos dado sensível sem criptografia. */
function requireKey(name: string): Buffer {
  const v = env(name);
  if (v) {
    const b = Buffer.from(v, 'base64');
    if (b.length !== 32) throw new Error(`${name} precisa ter 32 bytes em base64`);
    return b;
  }
  if (!DEMO) throw new Error(`${name} não configurada`);
  return demoKey(name);
}

const demoKeys = new Map<string, Buffer>();
function demoKey(name: string): Buffer {
  if (!demoKeys.has(name)) demoKeys.set(name, randomBytes(32));
  return demoKeys.get(name)!;
}

export function dataKeys(): { active: string; keys: Map<string, Buffer> } {
  const raw = env('HBSP_DATA_KEYS');
  const keys = new Map<string, Buffer>();
  if (raw) {
    for (const part of raw.split(',')) {
      const [id, b64] = part.split(':').map((x) => x.trim());
      const b = Buffer.from(b64 || '', 'base64');
      if (!id || b.length !== 32) throw new Error('HBSP_DATA_KEYS inválida');
      keys.set(id, b);
    }
  } else if (!DEMO) {
    throw new Error('HBSP_DATA_KEYS não configurada');
  } else {
    keys.set('demo', demoKey('data'));
  }
  const active = env('HBSP_ACTIVE_KEY') || [...keys.keys()].pop()!;
  if (!keys.has(active)) throw new Error('HBSP_ACTIVE_KEY não existe em HBSP_DATA_KEYS');
  return { active, keys };
}

export const indexKey = () => requireKey('HBSP_INDEX_KEY');
export const pepper = () => (env('HBSP_SESSION_PEPPER') ? Buffer.from(env('HBSP_SESSION_PEPPER')) : demoKey('pepper'));

export const cfg = {
  supabaseUrl: env('SUPABASE_URL').replace(/\/$/, ''),
  supabaseKey: env('SUPABASE_SERVICE_ROLE_KEY'),
  bucket: env('SUPABASE_BUCKET') || 'prontuario',
  resendKey: env('RESEND_API_KEY'),
  mailFrom: env('MAIL_FROM') || 'Hospital São Paulo <seguranca@hospitalsaopaulocacoal.com.br>',
  googleId: env('GOOGLE_CLIENT_ID'),
  googleSecret: env('GOOGLE_CLIENT_SECRET'),
  alertEmail: env('SECURITY_ALERT_EMAIL'),
  adminEmail: env('HBSP_ADMIN_EMAIL') || 'admin@demo.hbsp',
  siteUrl: (env('NEXT_PUBLIC_SITE_URL') || 'https://hospitalsaopaulocacoal.vercel.app').replace(/\/$/, ''),
  crmWebhook: env('CRM_WEBHOOK_URL'),
  crmSecret: env('CRM_WEBHOOK_SECRET'),
};

/** Tempos de sessão por papel (minutos). */
export const SESSION_POLICY = {
  paciente: { idle: 30, absolute: 12 * 60 },
  medico: { idle: 20, absolute: 10 * 60 },
  admin: { idle: 15, absolute: 4 * 60 },
} as const;

export const LIMITS = {
  maxFailedLogins: 5, // por conta, antes do bloqueio
  lockMinutes: 15,
  otpMinutes: 10,
  otpMaxAttempts: 5,
  maxFileBytes: 4 * 1024 * 1024, // limite do corpo de requisição na Vercel (~4,5 MB)
  allowedMime: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
};
