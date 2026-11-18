import { createHmac, randomUUID } from 'node:crypto';
import { db, formatPatientNumber, minutesFromNow, now, storage, type DoctorRow, type FileRow, type PatientRow, type UserRow } from './db';
import { blindIndex, decrypt, decryptFile, decryptJson, encrypt, encryptFile, encryptJson, otpCode, safeEqual, sha256, tokenHash } from './crypto';
import { cfg, LIMITS } from './config';
import { sendMail } from './mail';
import { audit, securityEvent } from './security';
import type { FormValue } from '@/lib/clinical/schema';

/* ------------------------------ Usuários ------------------------------ */
export const findUserByEmail = (email: string) => db.one('users', { email_bidx: blindIndex('email', email) });

export async function createUser(email: string, role: UserRow['role'], extra: Partial<UserRow> = {}): Promise<UserRow> {
  return db.insert('users', {
    role,
    email_enc: encrypt(email.toLowerCase(), 'email'),
    email_bidx: blindIndex('email', email),
    password_hash: null,
    google_sub: null,
    email_verified_at: null,
    status: 'pendente',
    failed_attempts: 0,
    locked_until: null,
    last_login_at: null,
    pending_enc: null,
    created_at: now(),
    ...extra,
  });
}

export const maskEmail = (e: string) => e.replace(/^(.{2})[^@]*(@.*)$/, (_m, a: string, b: string) => `${a}${'•'.repeat(4)}${b}`);

/* ------------------------- Código por e-mail (2ª etapa) ------------------------- */
export async function issueOtp(user: UserRow, purpose: 'login' | 'verificar-email' | 'reset', email: string) {
  await db.update('otps', { user_id: user.id, consumed_at: null }, { consumed_at: now() }); // invalida os anteriores
  const code = otpCode();
  await db.insert('otps', { user_id: user.id, purpose, code_hash: tokenHash(`${user.id}:${code}`), expires_at: minutesFromNow(LIMITS.otpMinutes), attempts: 0, consumed_at: null, created_at: now() });
  const titles = { login: 'Seu código de acesso', 'verificar-email': 'Confirme seu e-mail', reset: 'Código para criar nova senha' } as const;
  await sendMail({
    to: email,
    subject: `${code} é o seu código do Hospital São Paulo`,
    title: titles[purpose],
    lines: [
      purpose === 'verificar-email' ? 'Para ativar sua conta no ambiente seguro, digite o código abaixo.' : 'Digite o código abaixo para concluir a verificação em duas etapas.',
      `O código vale por ${LIMITS.otpMinutes} minutos e só pode ser usado uma vez.`,
      'Se não foi você, ignore este e-mail: sua conta continua protegida.',
    ],
    code,
    kind: 'codigo',
  });
}

export async function checkOtp(user: UserRow, code: string, purposes: string[]): Promise<{ ok: boolean; purpose?: string; reason?: string }> {
  const rows = (await db.select('otps', { user_id: user.id, consumed_at: null }, { order: 'created_at', desc: true, limit: 1 })).filter((r) => purposes.includes(r.purpose));
  const r = rows[0];
  if (!r) return { ok: false, reason: 'Peça um novo código.' };
  if (new Date(r.expires_at).getTime() < Date.now()) return { ok: false, reason: 'Código expirado. Peça um novo.' };
  if (r.attempts >= LIMITS.otpMaxAttempts) return { ok: false, reason: 'Muitas tentativas. Peça um novo código.' };
  const good = safeEqual(r.code_hash, tokenHash(`${user.id}:${String(code).replace(/\D/g, '')}`));
  if (!good) {
    await db.update('otps', { id: r.id }, { attempts: r.attempts + 1 });
    if (r.attempts + 1 >= LIMITS.otpMaxAttempts) await securityEvent('codigo-forca-bruta', 'alta', { userId: user.id, detail: 'código de verificação errado 5 vezes' });
    return { ok: false, reason: 'Código incorreto.' };
  }
  await db.update('otps', { id: r.id }, { consumed_at: now() });
  return { ok: true, purpose: r.purpose };
}

/* ------------------------------ Pacientes ------------------------------ */
export interface PatientView {
  id: string;
  number: string;
  profile: FormValue;
  anamnesis: FormValue;
  anamnesisVersion: number;
  createdAt: string;
}

const aad = (p: { id: string }, what: string) => `${what}:${p.id}`;

export function viewPatient(p: PatientRow): PatientView {
  return {
    id: p.id,
    number: p.number,
    profile: decryptJson<FormValue>(p.profile_enc, aad(p, 'perfil'), {}),
    anamnesis: decryptJson<FormValue>(p.anamnesis_enc, aad(p, 'anamnese'), {}),
    anamnesisVersion: p.anamnesis_version,
    createdAt: p.created_at,
  };
}

export const patientName = (v: PatientView) => {
  const id = (v.profile.identificacao || {}) as Record<string, unknown>;
  return String(id.nomeSocial || id.nome || 'Paciente');
};

export async function createPatient(user: UserRow, email: string, initial: { nome: string; nascimento?: string; celular?: string }): Promise<PatientRow> {
  const seq = await db.nextPatientSeq();
  const id = randomUUID();
  const profile: FormValue = {
    identificacao: { nome: initial.nome, ...(initial.nascimento ? { nascimento: initial.nascimento } : {}) },
    contato: { email, ...(initial.celular ? { celular: initial.celular } : {}), avisos: true },
  };
  const row = await db.insert('patients', {
    id,
    user_id: user.id,
    number: formatPatientNumber(seq),
    profile_enc: encryptJson(profile, `perfil:${id}`),
    name_bidx: blindIndex('nome', initial.nome),
    cpf_bidx: null,
    anamnesis_enc: null,
    anamnesis_version: 0,
    created_at: now(),
    updated_at: now(),
  });
  await audit({ actorId: user.id, actorRole: 'paciente', action: 'paciente-criado', patientId: row.id, detail: row.number });
  void pushCrm(row, profile, 'paciente-criado');
  return row;
}

export async function saveProfile(p: PatientRow, profile: FormValue, actor: { id: string; role: string }) {
  const id = (profile.identificacao || {}) as Record<string, unknown>;
  await db.update('patients', { id: p.id }, {
    profile_enc: encryptJson(profile, aad(p, 'perfil')),
    name_bidx: blindIndex('nome', String(id.nome || '')),
    cpf_bidx: id.cpf ? blindIndex('cpf', String(id.cpf)) : null,
    updated_at: now(),
  });
  await audit({ actorId: actor.id, actorRole: actor.role, action: 'cadastro-atualizado', patientId: p.id });
  void pushCrm(p, profile, 'cadastro-atualizado');
}

export async function saveAnamnesis(p: PatientRow, a: FormValue, version: number, actor: { id: string; role: string; name?: string }): Promise<{ ok: boolean; version: number }> {
  const fresh = await db.one('patients', { id: p.id });
  if (!fresh) return { ok: false, version: 0 };
  if (fresh.anamnesis_version !== version) return { ok: false, version: fresh.anamnesis_version }; // alguém salvou antes
  const nv = version + 1;
  await db.update('patients', { id: p.id }, { anamnesis_enc: encryptJson(a, aad(p, 'anamnese')), anamnesis_version: nv, updated_at: now() });
  // Versão anterior preservada, criptografada, para histórico clínico.
  if (fresh.anamnesis_enc) await db.insert('encounters', { patient_id: p.id, doctor_id: actor.id, kind: 'versao-anamnese', data_enc: encrypt(fresh.anamnesis_enc, aad(p, 'versao')), created_at: now() });
  await audit({ actorId: actor.id, actorRole: actor.role, action: 'anamnese-atualizada', patientId: p.id, detail: `versão ${nv}` });
  return { ok: true, version: nv };
}

/* ------------------------------ Arquivos ------------------------------ */
const MAGIC: Record<string, (b: Buffer) => boolean> = {
  'application/pdf': (b) => b.subarray(0, 5).toString() === '%PDF-',
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP',
};

export async function storeFile(p: PatientRow, file: File, meta: { uploadedBy: string; owner: 'paciente' | 'medico'; category: string; share: boolean }): Promise<FileRow> {
  if (file.size > LIMITS.maxFileBytes) throw new UserError(`Arquivo maior que ${LIMITS.maxFileBytes / 1024 / 1024} MB.`);
  if (!LIMITS.allowedMime.includes(file.type)) throw new UserError('Envie PDF, JPG, PNG ou WEBP.');
  const buf = Buffer.from(await file.arrayBuffer());
  if (!MAGIC[file.type]?.(buf)) {
    await securityEvent('arquivo-disfarcado', 'alta', { userId: meta.uploadedBy, detail: `conteúdo não confere com ${file.type}` });
    throw new UserError('O conteúdo do arquivo não confere com o tipo informado.');
  }
  const id = randomUUID();
  const path = `${p.id}/${id}.bin`;
  await storage.put(path, encryptFile(buf, `arquivo:${id}`));
  const row = await db.insert('files', {
    id,
    patient_id: p.id,
    uploaded_by: meta.uploadedBy,
    owner: meta.owner,
    category: meta.category,
    name_enc: encrypt(file.name.slice(0, 160), `nome-arquivo:${id}`),
    mime: file.type,
    size: buf.length,
    sha256: sha256(buf),
    storage_path: path,
    shared_with_patient: meta.owner === 'paciente' ? true : meta.share,
    created_at: now(),
  });
  await audit({ actorId: meta.uploadedBy, actorRole: meta.owner, action: 'arquivo-anexado', patientId: p.id, detail: `${meta.category} · ${id}` });
  return row;
}

export async function readFile(f: FileRow): Promise<Buffer> {
  const buf = decryptFile(await storage.get(f.storage_path), `arquivo:${f.id}`);
  if (sha256(buf) !== f.sha256) {
    await securityEvent('integridade-arquivo', 'critica', { detail: `hash não confere: ${f.id}` });
    throw new Error('integridade');
  }
  return buf;
}

export const fileName = (f: FileRow) => decrypt(f.name_enc, `nome-arquivo:${f.id}`);

/* ------------------------------ Avisos ------------------------------ */
export async function notify(userId: string, email: string | null, n: { kind: string; title: string; body: string; link?: string; mailLines?: string[] }) {
  await db.insert('notifications', { user_id: userId, kind: n.kind, title: n.title, body: n.body, link: n.link ?? null, read_at: null, created_at: now() });
  if (email) {
    await sendMail({
      to: email,
      subject: n.title,
      title: n.title,
      lines: n.mailLines ?? [n.body, 'Por segurança, o conteúdo fica só no ambiente seguro do hospital. Entre com sua senha e o código de verificação para ver.'],
      button: n.link ? { label: 'Abrir o ambiente seguro', href: `${cfg.siteUrl}${n.link}` } : undefined,
      kind: n.kind === 'permissao' ? 'permissao' : 'aviso',
    }).catch(() => {});
  }
}

/* ------------------------------ CRM ------------------------------ */
/**
 * Envia ao CRM só o cadastro (identificação e contato) — nunca dados clínicos.
 * Dados de saúde ficam no prontuário; o CRM recebe o necessário para relacionamento.
 */
async function pushCrm(p: PatientRow, profile: FormValue, event: string) {
  if (!cfg.crmWebhook) return;
  const id = (profile.identificacao || {}) as Record<string, unknown>;
  const ct = (profile.contato || {}) as Record<string, unknown>;
  const en = (profile.endereco || {}) as Record<string, unknown>;
  const cv = (profile.convenio || {}) as Record<string, unknown>;
  const body = JSON.stringify({
    schema: 'hbsp.paciente.v1',
    event,
    at: now(),
    patient: { number: p.number, nome: id.nome, nomeSocial: id.nomeSocial, nascimento: id.nascimento, email: ct.email, celular: ct.celular, cidade: en.cidade, uf: en.uf, atendimento: cv.tipo, operadora: cv.operadora, aceitaAvisos: !!ct.avisos },
  });
  const sig = cfg.crmSecret ? 'sha256=' + createHmac('sha256', cfg.crmSecret).update(body).digest('hex') : '';
  await fetch(cfg.crmWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(sig ? { 'X-HBSP-Signature': sig } : {}) }, body }).catch(() => {});
}

/* ------------------------------ Médicos ------------------------------ */
export const doctorLabel = (d: DoctorRow) => `${d.name} · CRM-${d.uf} ${d.crm}`;

export class UserError extends Error {}
