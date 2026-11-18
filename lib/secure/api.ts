import { db, isPatientNumber, minutesFromNow, now, type DoctorRow, type FileRow, type GrantRow, type PatientRow, type Role } from './db';
import { blindIndex, decrypt, decryptJson, encryptJson, hashPassword, newToken, passwordProblems, tokenHash, verifyPassword } from './crypto';
import { cfg, DEMO, LIMITS } from './config';
import { audit, securityEvent, tooMany, verifyAuditChain } from './security';
import { COOKIE, cookieHeader, createSession, endSession, getAuth, ipHash, readCookie, upgradeSession, type Auth } from './session';
import { checkOtp, createPatient, createUser, doctorLabel, fileName, findUserByEmail, issueOtp, maskEmail, notify, patientName, readFile, saveAnamnesis, saveProfile, storeFile, UserError, viewPatient } from './services';
import { googleCallback, googleStart, OAUTH_COOKIE } from './google';
import { outbox, sendMail } from './mail';
import { ensureSeed } from './seed';
import { ANAMNESIS, ENCOUNTER, PRIVATE_ENCOUNTER_KEYS, PROFILE, clinicalHighlights, type FormValue } from '@/lib/clinical/schema';
import { sanitizeForm, validCpf } from '@/lib/clinical/sanitize';

/* ------------------------------ Respostas ------------------------------ */
const BASE_HEADERS = { 'Cache-Control': 'no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
function json(data: unknown, status = 200, extra: Record<string, string> = {}, cookies: string[] = []): Response {
  const h = new Headers({ 'Content-Type': 'application/json; charset=utf-8', ...BASE_HEADERS, ...extra });
  for (const c of cookies) h.append('Set-Cookie', c);
  return new Response(JSON.stringify(data), { status, headers: h });
}
const fail = (status: number, error: string) => json({ error }, status);
const redirect = (to: string, cookies: string[] = []) => {
  const h = new Headers({ Location: to, ...BASE_HEADERS });
  for (const c of cookies) h.append('Set-Cookie', c);
  return new Response(null, { status: 303, headers: h });
};

async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  const len = Number(req.headers.get('content-length') || 0);
  if (len > 400_000) throw new UserError('Conteúdo grande demais.');
  if (!(req.headers.get('content-type') || '').includes('application/json')) throw new UserError('Formato inválido.');
  return (await req.json()) as T;
}

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const emailOk = (e: string) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(e);

/* -------------------------- Proteções globais -------------------------- */
async function guard(req: Request, path: string): Promise<Response | null> {
  const ip = ipHash(req);
  if (tooMany(`all:${ip}`, 400, 5 * 60_000)) {
    if (tooMany(`alert-rate:${ip}`, 1, 10 * 60_000) === false) await securityEvent('excesso-de-requisicoes', 'alta', { ipHash: ip, detail: 'mais de 400 requisições em 5 min' });
    return fail(429, 'Muitas requisições. Aguarde alguns minutos.');
  }
  if (path.startsWith('auth/') && req.method === 'POST' && tooMany(`auth:${ip}`, 30, 10 * 60_000)) {
    await securityEvent('forca-bruta-origem', 'alta', { ipHash: ip, detail: 'excesso de tentativas de login/cadastro de uma origem' });
    return fail(429, 'Muitas tentativas. Aguarde alguns minutos.');
  }
  if (req.method !== 'GET') {
    const origin = req.headers.get('origin');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    let ok = false;
    try { ok = !!origin && !!host && new URL(origin).host === host; } catch { ok = false; }
    if (!ok) {
      await securityEvent('origem-invalida', 'media', { ipHash: ip, detail: `requisição ${req.method} sem origem confiável (possível CSRF)` });
      return fail(403, 'Origem não autorizada.');
    }
  }
  return null;
}

/* ------------------------------ Contexto ------------------------------ */
async function currentPatient(a: Auth): Promise<PatientRow> {
  const p = await db.one('patients', { user_id: a.user.id });
  if (!p) throw new UserError('Cadastro de paciente não encontrado.');
  return p;
}
async function currentDoctor(a: Auth): Promise<DoctorRow> {
  const d = await db.one('doctors', { user_id: a.user.id });
  if (!d) throw new UserError('Cadastro médico não encontrado.');
  return d;
}
async function patientByNumber(n: string): Promise<PatientRow> {
  if (!isPatientNumber(n)) throw new UserError('Número de paciente inválido.');
  const p = await db.one('patients', { number: n.trim().toUpperCase() });
  if (!p) throw new UserError('Paciente não encontrado.');
  return p;
}
async function activeGrant(patientId: string, doctorId: string): Promise<GrantRow | null> {
  const gs = await db.select('grants', { patient_id: patientId, doctor_id: doctorId, status: 'concedido' });
  return gs.find((g) => !g.expires_at || new Date(g.expires_at).getTime() > Date.now()) ?? null;
}
async function userEmail(userId: string): Promise<string | null> {
  const u = await db.one('users', { id: userId });
  return u ? decrypt(u.email_enc, 'email') : null;
}
function fileView(f: FileRow, doctors: Map<string, string>) {
  return { id: f.id, nome: fileName(f), categoria: f.category, mime: f.mime, tamanho: f.size, autor: f.owner === 'paciente' ? 'Você / paciente' : doctors.get(f.uploaded_by) || 'Equipe médica', origem: f.owner, compartilhado: f.shared_with_patient, criadoEm: f.created_at };
}
async function doctorNames(): Promise<Map<string, string>> {
  const all = await db.select('doctors', {});
  return new Map(all.map((d) => [d.user_id, doctorLabel(d)]));
}
function encounterView(e: { id: string; kind: string; data_enc: string; created_at: string; doctor_id: string; patient_id: string }, names: Map<string, string>, forPatient: boolean) {
  const data = decryptJson<FormValue>(e.data_enc, `consulta:${e.patient_id}`, {});
  if (forPatient) for (const g of Object.values(data)) if (g && !Array.isArray(g)) for (const k of PRIVATE_ENCOUNTER_KEYS) delete (g as Record<string, unknown>)[k];
  return { id: e.id, tipo: e.kind, data, medico: names.get(e.doctor_id) || 'Equipe médica', criadoEm: e.created_at };
}

/* ------------------------------ Rotas ------------------------------ */
type Handler = (req: Request, params: string[]) => Promise<Response>;
const routes: { method: string; pattern: RegExp; handler: Handler }[] = [];
const on = (method: string, pattern: string, handler: Handler) => routes.push({ method, pattern: new RegExp('^' + pattern.replace(/:[a-z]+/g, '([^/]+)') + '$'), handler });

const homeFor = (r: Role) => (r === 'paciente' ? '/area-do-paciente' : r === 'medico' ? '/area-do-medico' : '/admin');

/* ===== Autenticação ===== */
on('POST', 'auth/register', async (req) => {
  const b = await body(req);
  const nome = str(b.nome, 120);
  const email = str(b.email, 200).toLowerCase();
  const password = String(b.password || '');
  if (nome.length < 3 || !emailOk(email)) throw new UserError('Confira nome e e-mail.');
  if (!b.aceite) throw new UserError('É preciso aceitar os termos e a política de privacidade.');
  const probs = passwordProblems(password, email);
  if (probs.length) throw new UserError(`Senha fraca: ${probs.join(', ')}.`);
  const existing = await findUserByEmail(email);
  if (existing) {
    // Não revela se o e-mail existe: avisa o dono por e-mail e responde igual.
    await sendMail({ to: email, subject: 'Tentativa de cadastro com seu e-mail', title: 'Já existe uma conta com este e-mail', lines: ['Alguém tentou criar uma conta no ambiente seguro do Hospital São Paulo com este e-mail.', 'Se foi você, use “Esqueci a senha”. Se não foi, nenhuma ação é necessária.'], kind: 'aviso' });
    return json({ next: 'verificar', email: maskEmail(email) });
  }
  // Os dados iniciais ficam criptografados na conta até a confirmação do e-mail.
  const user = await createUser(email, 'paciente', { password_hash: await hashPassword(password), pending_enc: encryptJson({ nome, nascimento: str(b.nascimento, 10), celular: str(b.celular, 20) }, 'cadastro-pendente') });
  const { token } = await createSession(req, user, false);
  await issueOtp(user, 'verificar-email', email);
  await audit({ actorId: user.id, actorRole: 'paciente', action: 'cadastro-iniciado' });
  return json({ next: 'verificar', email: maskEmail(email) }, 200, {}, [cookieHeader(COOKIE, token, 15 * 60)]);
});

on('POST', 'auth/login', async (req) => {
  const b = await body(req);
  const email = str(b.email, 200).toLowerCase();
  const password = String(b.password || '');
  const area = (b.area === 'medico' ? 'medico' : 'paciente') as Role;
  const user = emailOk(email) ? await findUserByEmail(email) : null;
  const generic = fail(401, 'E-mail ou senha incorretos.');
  if (!user) { await verifyPassword(password, null); return generic; }
  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    await securityEvent('login-em-conta-bloqueada', 'media', { userId: user.id, ipHash: ipHash(req) });
    return fail(423, 'Conta temporariamente bloqueada por tentativas erradas. Tente em 15 minutos ou fale com a central.');
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    const n = user.failed_attempts + 1;
    const lock = n >= LIMITS.maxFailedLogins;
    await db.update('users', { id: user.id }, { failed_attempts: lock ? 0 : n, locked_until: lock ? minutesFromNow(LIMITS.lockMinutes) : null });
    if (lock) {
      await securityEvent('conta-bloqueada', 'alta', { userId: user.id, ipHash: ipHash(req), detail: `${LIMITS.maxFailedLogins} senhas erradas seguidas` });
      await sendMail({ to: email, subject: 'Sua conta foi bloqueada por segurança', title: 'Bloqueio temporário de segurança', lines: [`Registramos ${LIMITS.maxFailedLogins} tentativas de senha errada na sua conta. Por proteção, o acesso ficou bloqueado por ${LIMITS.lockMinutes} minutos.`, 'Se não foi você, troque sua senha assim que o bloqueio terminar e avise a central.'], kind: 'alerta' });
    }
    return generic;
  }
  const allowed = area === 'medico' ? ['medico', 'admin'] : ['paciente'];
  if (!allowed.includes(user.role)) {
    await securityEvent('area-errada', 'media', { userId: user.id, ipHash: ipHash(req), detail: `conta ${user.role} tentou entrar na área ${area}` });
    return fail(403, area === 'medico' ? 'Este e-mail está cadastrado como paciente. Entre pela aba “Sou paciente”. O acesso médico é criado pela administração do hospital.' : 'Esta conta é da equipe médica. Entre pela aba “Sou médico”.');
  }
  if (user.status === 'bloqueado') return fail(423, 'Conta suspensa. Fale com a central.');
  await db.update('users', { id: user.id }, { failed_attempts: 0, locked_until: null });
  const { token } = await createSession(req, user, false);
  await issueOtp(user, user.status === 'pendente' ? 'verificar-email' : 'login', email);
  return json({ next: 'verificar', email: maskEmail(email) }, 200, {}, [cookieHeader(COOKIE, token, 15 * 60)]);
});

on('POST', 'auth/verify', async (req) => {
  const a = await getAuth(req, { requireMfa: false });
  if (!a) return fail(401, 'Sessão expirada. Entre novamente.');
  if (a.session.mfa_ok) return json({ ok: true, redirect: homeFor(a.user.role) });
  const b = await body(req);
  const r = await checkOtp(a.user, str(b.code, 12), ['login', 'verificar-email']);
  if (!r.ok) return fail(400, r.reason || 'Código inválido.');
  if (r.purpose === 'verificar-email' || a.user.status === 'pendente') {
    await db.update('users', { id: a.user.id }, { status: 'ativo', email_verified_at: now() });
    if (a.user.role === 'paciente' && !(await db.one('patients', { user_id: a.user.id }))) {
      const init = decryptJson(a.user.pending_enc, 'cadastro-pendente', { nome: a.email.split('@')[0], nascimento: '', celular: '' });
      await db.update('users', { id: a.user.id }, { pending_enc: null });
      await createPatient({ ...a.user, status: 'ativo' }, a.email, init);
    }
  }
  const token = await upgradeSession(a.session);
  await db.update('users', { id: a.user.id }, { last_login_at: now() });
  await audit({ actorId: a.user.id, actorRole: a.user.role, action: 'login', detail: 'senha + código por e-mail' });
  return json({ ok: true, redirect: homeFor(a.user.role) }, 200, {}, [cookieHeader(COOKIE, token, 12 * 3600)]);
});

on('POST', 'auth/resend', async (req) => {
  const a = await getAuth(req, { requireMfa: false });
  if (!a) return fail(401, 'Sessão expirada. Entre novamente.');
  if (tooMany(`resend:${a.user.id}`, 3, 10 * 60_000)) return fail(429, 'Aguarde alguns minutos para pedir outro código.');
  await issueOtp(a.user, a.user.status === 'pendente' ? 'verificar-email' : 'login', a.email);
  return json({ ok: true });
});

on('POST', 'auth/logout', async (req) => {
  const a = await getAuth(req, { requireMfa: false });
  await endSession(req);
  if (a) await audit({ actorId: a.user.id, actorRole: a.user.role, action: 'logout' });
  return json({ ok: true }, 200, {}, [cookieHeader(COOKIE, '', 0)]);
});

on('GET', 'auth/me', async (req) => {
  const a = await getAuth(req, { requireMfa: false });
  const base = { demo: DEMO, google: !!cfg.googleId };
  if (!a) return json({ ...base, user: null });
  if (!a.session.mfa_ok) return json({ ...base, user: null, pending: { email: maskEmail(a.email) } });
  const out: Record<string, unknown> = { ...base, user: { role: a.user.role, email: a.email, lastLogin: a.user.last_login_at } };
  if (a.user.role === 'paciente') {
    const p = await db.one('patients', { user_id: a.user.id });
    if (p) out.patient = { number: p.number, nome: patientName(viewPatient(p)) };
  } else {
    const d = await db.one('doctors', { user_id: a.user.id });
    if (d) out.doctor = { nome: d.name, crm: `CRM-${d.uf} ${d.crm}`, especialidade: d.specialty };
  }
  return json(out);
});

on('POST', 'auth/forgot', async (req) => {
  const b = await body(req);
  const email = str(b.email, 200).toLowerCase();
  const user = emailOk(email) ? await findUserByEmail(email) : null;
  if (user && user.status !== 'bloqueado') await issueOtp(user, 'reset', email);
  return json({ ok: true, email: emailOk(email) ? maskEmail(email) : '' }); // mesma resposta sempre
});

on('POST', 'auth/reset', async (req) => {
  const b = await body(req);
  const email = str(b.email, 200).toLowerCase();
  const user = emailOk(email) ? await findUserByEmail(email) : null;
  if (!user) return fail(400, 'Código inválido.');
  const probs = passwordProblems(String(b.password || ''), email);
  if (probs.length) throw new UserError(`Senha fraca: ${probs.join(', ')}.`);
  const r = await checkOtp(user, str(b.code, 12), ['reset']);
  if (!r.ok) return fail(400, r.reason || 'Código inválido.');
  await db.update('users', { id: user.id }, { password_hash: await hashPassword(String(b.password)), failed_attempts: 0, locked_until: null });
  await db.remove('sessions', { user_id: user.id }); // encerra todas as sessões abertas
  await audit({ actorId: user.id, actorRole: user.role, action: 'senha-redefinida' });
  await sendMail({ to: email, subject: 'Sua senha foi alterada', title: 'Senha alterada', lines: ['A senha da sua conta no ambiente seguro foi alterada agora. Todas as sessões abertas foram encerradas.', 'Se não foi você, fale imediatamente com a central.'], kind: 'alerta' });
  return json({ ok: true });
});

on('POST', 'auth/activate', async (req) => {
  const b = await body(req);
  const token = str(b.token, 200);
  const rows = await db.select('otps', { code_hash: tokenHash('ativacao:' + token), consumed_at: null });
  const r = rows[0];
  if (!r || r.purpose !== 'ativacao' || new Date(r.expires_at).getTime() < Date.now()) {
    await securityEvent('convite-invalido', 'media', { ipHash: ipHash(req) });
    return fail(400, 'Convite inválido ou expirado. Peça um novo à administração.');
  }
  const user = await db.one('users', { id: r.user_id });
  if (!user) return fail(400, 'Convite inválido.');
  const email = decrypt(user.email_enc, 'email');
  const probs = passwordProblems(String(b.password || ''), email);
  if (probs.length) throw new UserError(`Senha fraca: ${probs.join(', ')}.`);
  await db.update('users', { id: user.id }, { password_hash: await hashPassword(String(b.password)), status: 'ativo', email_verified_at: now() });
  await db.update('otps', { id: r.id }, { consumed_at: now() });
  await audit({ actorId: user.id, actorRole: user.role, action: 'conta-ativada' });
  return json({ ok: true });
});

on('GET', 'auth/google/start', async (req) => {
  if (!cfg.googleId || !cfg.googleSecret) return redirect('/acesso?erro=google-indisponivel');
  const role = new URL(req.url).searchParams.get('area') === 'medico' ? 'medico' : 'paciente';
  const { url, cookie } = googleStart(role);
  return redirect(url, [cookieHeader(OAUTH_COOKIE, cookie, 600).replace('SameSite=Strict', 'SameSite=Lax')]);
});

on('GET', 'auth/google/callback', async (req) => {
  const u = new URL(req.url);
  const clear = cookieHeader(OAUTH_COOKIE, '', 0);
  try {
    const id = await googleCallback(u.searchParams.get('code') || '', u.searchParams.get('state') || '', readCookie(req, OAUTH_COOKIE));
    let user = (await db.one('users', { google_sub: id.sub })) || (await findUserByEmail(id.email));
    if (!user) {
      if (id.role !== 'paciente') return redirect('/acesso?area=medico&erro=sem-cadastro', [clear]);
      user = await createUser(id.email, 'paciente', { google_sub: id.sub, pending_enc: encryptJson({ nome: id.name || id.email.split('@')[0], nascimento: '', celular: '' }, 'cadastro-pendente') });
    } else if (!user.google_sub) {
      await db.update('users', { id: user.id }, { google_sub: id.sub });
    }
    const allowed = id.role === 'medico' ? ['medico', 'admin'] : ['paciente'];
    if (!allowed.includes(user.role) || user.status === 'bloqueado') return redirect(`/acesso?area=${id.role}&erro=area`, [clear]);
    const { token } = await createSession(req, user, false);
    await issueOtp(user, user.status === 'ativo' ? 'login' : 'verificar-email', id.email);
    await audit({ actorId: user.id, actorRole: user.role, action: 'google-autenticado', detail: 'aguardando código por e-mail' });
    return redirect(`/acesso?etapa=verificar&area=${id.role}`, [clear, cookieHeader(COOKIE, token, 15 * 60).replace('SameSite=Strict', 'SameSite=Lax')]);
  } catch (e) {
    await securityEvent('google-falhou', 'media', { ipHash: ipHash(req), detail: (e as Error).message });
    return redirect('/acesso?erro=google', [clear]);
  }
});

/* ===== Paciente ===== */
const asPatient = async (req: Request) => {
  const a = await getAuth(req, { roles: ['paciente'] });
  if (!a) throw new AuthError();
  return a;
};
class AuthError extends Error {}

on('GET', 'paciente/resumo', async (req) => {
  const a = await asPatient(req);
  const p = await currentPatient(a);
  const v = viewPatient(p);
  const names = await doctorNames();
  const files = (await db.select('files', { patient_id: p.id }, { order: 'created_at', desc: true })).filter((f) => f.owner === 'paciente' || f.shared_with_patient);
  const encounters = (await db.select('encounters', { patient_id: p.id }, { order: 'created_at', desc: true })).filter((e) => e.kind !== 'versao-anamnese');
  const grants = await db.select('grants', { patient_id: p.id }, { order: 'requested_at', desc: true });
  const notes = await db.select('notifications', { user_id: a.user.id }, { order: 'created_at', desc: true, limit: 30 });
  const doctors = await db.select('doctors', {});
  const byId = new Map(doctors.map((d) => [d.id, d]));
  return json({
    number: p.number,
    profile: { ...v.profile, contato: { ...(v.profile.contato as Record<string, unknown> || {}), email: a.email } },
    anamnesis: v.anamnesis,
    anamnesisVersion: v.anamnesisVersion,
    highlights: clinicalHighlights(v.anamnesis),
    files: files.map((f) => fileView(f, names)),
    encounters: encounters.map((e) => encounterView(e, names, true)),
    grants: grants.map((g) => ({ id: g.id, medico: byId.get(g.doctor_id) ? doctorLabel(byId.get(g.doctor_id)!) : 'Médico', especialidade: byId.get(g.doctor_id)?.specialty, status: g.status, solicitadoEm: g.requested_at, expiraEm: g.expires_at })),
    notifications: notes.map((n) => ({ id: n.id, titulo: n.title, texto: n.body, lida: !!n.read_at, em: n.created_at, link: n.link })),
  });
});

on('PUT', 'paciente/cadastro', async (req) => {
  const a = await asPatient(req);
  const p = await currentPatient(a);
  const b = await body<{ value: unknown }>(req);
  const value = sanitizeForm(PROFILE, b.value, 'paciente');
  const id = (value.identificacao || {}) as Record<string, unknown>;
  if (!id.nome || String(id.nome).length < 3) throw new UserError('Informe o nome completo.');
  if (id.cpf && !validCpf(String(id.cpf))) throw new UserError('CPF inválido.');
  value.contato = { ...((value.contato as Record<string, unknown>) || {}), email: a.email };
  await saveProfile(p, value, { id: a.user.id, role: 'paciente' });
  return json({ ok: true });
});

on('PUT', 'paciente/anamnese', async (req) => {
  const a = await asPatient(req);
  const p = await currentPatient(a);
  const b = await body<{ value: unknown; version: number }>(req);
  const r = await saveAnamnesis(p, sanitizeForm(ANAMNESIS, b.value, 'paciente'), Number(b.version), { id: a.user.id, role: 'paciente' });
  return r.ok ? json(r) : fail(409, 'Seu prontuário foi atualizado em outro lugar. Recarregue para ver a versão mais recente.');
});

on('POST', 'paciente/arquivos', async (req) => {
  const a = await asPatient(req);
  const p = await currentPatient(a);
  const form = await req.formData();
  const file = form.get('arquivo');
  if (!(file instanceof File)) throw new UserError('Selecione um arquivo.');
  const cat = ['documento', 'exame', 'laudo', 'receita', 'outro'].includes(String(form.get('categoria'))) ? String(form.get('categoria')) : 'documento';
  const f = await storeFile(p, file, { uploadedBy: a.user.id, owner: 'paciente', category: cat, share: true });
  return json({ ok: true, id: f.id });
});

on('POST', 'paciente/permissoes/:id', async (req, [id]) => {
  const a = await asPatient(req);
  const p = await currentPatient(a);
  const g = await db.one('grants', { id });
  if (!g || g.patient_id !== p.id) {
    await securityEvent('permissao-alheia', 'alta', { userId: a.user.id, ipHash: ipHash(req), detail: 'tentou decidir permissão de outro paciente' });
    return fail(404, 'Pedido não encontrado.');
  }
  const b = await body(req);
  const decision = str(b.decisao, 20);
  const dias = Math.min(365, Math.max(1, Number(b.dias) || 30));
  const status = decision === 'conceder' ? 'concedido' : decision === 'negar' ? 'negado' : decision === 'revogar' ? 'revogado' : null;
  if (!status) throw new UserError('Decisão inválida.');
  await db.update('grants', { id }, { status, decided_at: now(), expires_at: status === 'concedido' ? minutesFromNow(dias * 24 * 60) : g.expires_at });
  await audit({ actorId: a.user.id, actorRole: 'paciente', action: `permissao-${status}`, patientId: p.id, detail: status === 'concedido' ? `${dias} dias` : null });
  const doc = await db.one('doctors', { id: g.doctor_id });
  if (doc) await notify(doc.user_id, await userEmail(doc.user_id), { kind: 'permissao', title: status === 'concedido' ? 'Acesso aos documentos autorizado' : 'Pedido de acesso respondido', body: `O paciente ${p.number} ${status === 'concedido' ? `autorizou o acesso aos documentos por ${dias} dias` : 'não autorizou o acesso aos documentos'}.`, link: '/area-do-medico' });
  return json({ ok: true });
});

on('GET', 'paciente/acessos', async (req) => {
  const a = await asPatient(req);
  const p = await currentPatient(a);
  const rows = await db.select('audit_log', { patient_id: p.id }, { order: 'seq', desc: true, limit: 80 });
  const names = await doctorNames();
  const labels: Record<string, string> = { 'prontuario-aberto': 'Abriu seu prontuário', 'anamnese-atualizada': 'Atualizou a anamnese', 'consulta-registrada': 'Registrou um atendimento', 'arquivo-anexado': 'Anexou um arquivo', 'arquivo-baixado': 'Abriu um arquivo', 'cadastro-atualizado': 'Atualizou o cadastro', 'permissao-solicitada': 'Pediu acesso aos seus documentos', 'permissao-concedido': 'Você autorizou acesso', 'permissao-negado': 'Você negou acesso', 'permissao-revogado': 'Você revogou acesso', 'paciente-criado': 'Cadastro criado', 'arquivo-compartilhado': 'Liberou um exame para você', 'busca-paciente': 'Localizou seu cadastro' };
  return json({ items: rows.map((r) => ({ em: r.at, quem: r.actor_role === 'paciente' ? 'Você' : names.get(r.actor_id || '') || 'Equipe', acao: labels[r.action] || r.action, detalhe: r.action === 'prontuario-aberto' ? r.detail : null })) });
});

on('POST', 'paciente/avisos/lidos', async (req) => {
  const a = await asPatient(req);
  await db.update('notifications', { user_id: a.user.id, read_at: null }, { read_at: now() });
  return json({ ok: true });
});

/* ===== Arquivo (paciente ou médico) ===== */
on('GET', 'arquivos/:id', async (req, [id]) => {
  const a = await getAuth(req, { roles: ['paciente', 'medico'] });
  if (!a) throw new AuthError();
  const f = await db.one('files', { id });
  if (!f) return fail(404, 'Arquivo não encontrado.');
  let allowed = false;
  if (a.user.role === 'paciente') {
    const p = await db.one('patients', { user_id: a.user.id });
    allowed = !!p && p.id === f.patient_id && (f.owner === 'paciente' || f.shared_with_patient);
  } else {
    const d = await currentDoctor(a);
    allowed = f.owner === 'medico' || !!(await activeGrant(f.patient_id, d.id));
  }
  if (!allowed) {
    await securityEvent('arquivo-sem-permissao', 'alta', { userId: a.user.id, ipHash: ipHash(req), detail: `tentou abrir arquivo ${id} sem permissão` });
    return fail(403, 'Sem permissão para este arquivo.');
  }
  const buf = await readFile(f);
  await audit({ actorId: a.user.id, actorRole: a.user.role, action: 'arquivo-baixado', patientId: f.patient_id, detail: id });
  const name = fileName(f).replace(/[^\w.\- ]+/g, '_');
  return new Response(new Uint8Array(buf), { headers: { ...BASE_HEADERS, 'Content-Type': f.mime, 'Content-Disposition': `inline; filename="${name}"`, 'Content-Security-Policy': "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox" } });
});

/* ===== Médico ===== */
const asDoctor = async (req: Request) => {
  const a = await getAuth(req, { roles: ['medico'] });
  if (!a) throw new AuthError();
  return { a, d: await currentDoctor(a) };
};

on('GET', 'medico/painel', async (req) => {
  const { a, d } = await asDoctor(req);
  const recent = await db.select('audit_log', { actor_id: a.user.id, action: 'prontuario-aberto' }, { order: 'seq', desc: true, limit: 40 });
  const seen = new Set<string>();
  const recentes: { number: string; nome: string; em: string }[] = [];
  for (const r of recent) {
    if (!r.patient_id || seen.has(r.patient_id)) continue;
    seen.add(r.patient_id);
    const p = await db.one('patients', { id: r.patient_id });
    if (p) recentes.push({ number: p.number, nome: patientName(viewPatient(p)), em: r.at });
    if (recentes.length >= 8) break;
  }
  const notes = await db.select('notifications', { user_id: a.user.id }, { order: 'created_at', desc: true, limit: 20 });
  return json({ medico: { nome: d.name, crm: `CRM-${d.uf} ${d.crm}`, rqe: d.rqe, especialidade: d.specialty }, recentes, notifications: notes.map((n) => ({ id: n.id, titulo: n.title, texto: n.body, lida: !!n.read_at, em: n.created_at })) });
});

on('POST', 'medico/busca', async (req) => {
  const { a } = await asDoctor(req);
  const b = await body(req);
  const q = str(b.q, 120);
  if (tooMany(`busca:${a.user.id}`, 40, 60 * 60_000)) {
    await securityEvent('busca-em-massa', 'alta', { userId: a.user.id, ipHash: ipHash(req), detail: 'mais de 40 buscas de pacientes em 1 hora' });
    return fail(429, 'Limite de buscas atingido. Fale com a administração.');
  }
  let rows: PatientRow[] = [];
  if (isPatientNumber(q)) rows = await db.select('patients', { number: q.toUpperCase() });
  else if (q.replace(/\D/g, '').length === 11) rows = await db.select('patients', { cpf_bidx: blindIndex('cpf', q.replace(/\D/g, '')) });
  else if (emailOk(q)) {
    const u = await findUserByEmail(q);
    rows = u ? await db.select('patients', { user_id: u.id }) : [];
  } else if (q.length >= 5) rows = await db.select('patients', { name_bidx: blindIndex('nome', q) });
  else throw new UserError('Busque pelo número do paciente (HB0001SP), CPF, e-mail ou nome completo.');
  for (const r of rows) await audit({ actorId: a.user.id, actorRole: 'medico', action: 'busca-paciente', patientId: r.id });
  return json({ items: rows.slice(0, 5).map((p) => { const v = viewPatient(p); const id = (v.profile.identificacao || {}) as Record<string, unknown>; return { number: p.number, nome: patientName(v), nascimento: id.nascimento || null }; }) });
});

on('POST', 'medico/prontuario', async (req) => {
  const { a, d } = await asDoctor(req);
  const b = await body(req);
  const motivo = str(b.motivo, 60);
  if (!['Consulta', 'Retorno', 'Urgência', 'Internação', 'Cirurgia', 'Interconsulta', 'Laudo de exame'].includes(motivo)) throw new UserError('Informe o motivo do acesso.');
  const p = await patientByNumber(str(b.number, 20));
  if (tooMany(`abrir:${a.user.id}`, 60, 60 * 60_000)) await securityEvent('acesso-em-massa', 'alta', { userId: a.user.id, ipHash: ipHash(req), detail: 'mais de 60 prontuários abertos em 1 hora' });
  await audit({ actorId: a.user.id, actorRole: 'medico', action: 'prontuario-aberto', patientId: p.id, detail: motivo });
  return json(await chartFor(p, d));
});

async function chartFor(p: PatientRow, d: DoctorRow) {
  const v = viewPatient(p);
  const names = await doctorNames();
  const grant = await activeGrant(p.id, d.id);
  const pending = (await db.select('grants', { patient_id: p.id, doctor_id: d.id, status: 'pendente' }))[0];
  const files = await db.select('files', { patient_id: p.id }, { order: 'created_at', desc: true });
  const encounters = (await db.select('encounters', { patient_id: p.id }, { order: 'created_at', desc: true })).filter((e) => e.kind !== 'versao-anamnese');
  const versions = (await db.select('encounters', { patient_id: p.id, kind: 'versao-anamnese' })).length;
  const user = await db.one('users', { id: p.user_id });
  return {
    number: p.number,
    profile: { ...v.profile, contato: { ...((v.profile.contato as Record<string, unknown>) || {}), email: user ? decrypt(user.email_enc, 'email') : '' } },
    anamnesis: v.anamnesis,
    anamnesisVersion: v.anamnesisVersion,
    anamnesisHistory: versions,
    highlights: clinicalHighlights(v.anamnesis),
    encounters: encounters.map((e) => encounterView(e, names, false)),
    files: files.filter((f) => f.owner === 'medico').map((f) => fileView(f, names)),
    patientFiles: grant ? files.filter((f) => f.owner === 'paciente').map((f) => fileView(f, names)) : null,
    patientFilesCount: files.filter((f) => f.owner === 'paciente').length,
    grant: grant ? { status: 'concedido', expiraEm: grant.expires_at } : pending ? { status: 'pendente', expiraEm: null } : null,
  };
}

on('PUT', 'medico/prontuario/:n/anamnese', async (req, [n]) => {
  const { a } = await asDoctor(req);
  const p = await patientByNumber(n);
  const b = await body<{ value: unknown; version: number }>(req);
  const r = await saveAnamnesis(p, sanitizeForm(ANAMNESIS, b.value, 'medico'), Number(b.version), { id: a.user.id, role: 'medico' });
  return r.ok ? json(r) : fail(409, 'A anamnese foi alterada por outra pessoa. Recarregue o prontuário.');
});

on('POST', 'medico/prontuario/:n/atendimentos', async (req, [n]) => {
  const { a } = await asDoctor(req);
  const p = await patientByNumber(n);
  const b = await body<{ value: unknown }>(req);
  const value = sanitizeForm(ENCOUNTER, b.value, 'medico');
  const at = (value.atendimento || {}) as Record<string, unknown>;
  if (!at.tipo || !at.queixa) throw new UserError('Informe o tipo de atendimento e a queixa principal.');
  const e = await db.insert('encounters', { patient_id: p.id, doctor_id: a.user.id, kind: String(at.tipo), data_enc: encryptJson(value, `consulta:${p.id}`), created_at: now() });
  await audit({ actorId: a.user.id, actorRole: 'medico', action: 'consulta-registrada', patientId: p.id, detail: e.id });
  const ds = (value.desfecho || {}) as Record<string, unknown>;
  if (ds.orientacoes || ds.retornoData) await notify(p.user_id, await userEmail(p.user_id), { kind: 'consulta', title: 'Novas orientações do seu atendimento', body: 'O médico registrou orientações e próximos passos do seu atendimento.', link: '/area-do-paciente#atendimentos' });
  return json({ ok: true, id: e.id });
});

on('POST', 'medico/prontuario/:n/arquivos', async (req, [n]) => {
  const { a } = await asDoctor(req);
  const p = await patientByNumber(n);
  const form = await req.formData();
  const file = form.get('arquivo');
  if (!(file instanceof File)) throw new UserError('Selecione um arquivo.');
  const cat = ['exame', 'laudo', 'receita', 'atestado', 'outro'].includes(String(form.get('categoria'))) ? String(form.get('categoria')) : 'exame';
  const share = form.get('compartilhar') === '1';
  const f = await storeFile(p, file, { uploadedBy: a.user.id, owner: 'medico', category: cat, share });
  if (share) await announceShared(p, a.user.id, f);
  return json({ ok: true, id: f.id });
});

on('POST', 'medico/prontuario/:n/arquivos/:id/compartilhar', async (req, [n, id]) => {
  const { a } = await asDoctor(req);
  const p = await patientByNumber(n);
  const f = await db.one('files', { id });
  if (!f || f.patient_id !== p.id || f.owner !== 'medico') return fail(404, 'Arquivo não encontrado.');
  if (!f.shared_with_patient) {
    await db.update('files', { id }, { shared_with_patient: true });
    await announceShared(p, a.user.id, f);
  }
  return json({ ok: true });
});

async function announceShared(p: PatientRow, actorId: string, f: FileRow) {
  await audit({ actorId, actorRole: 'medico', action: 'arquivo-compartilhado', patientId: p.id, detail: f.id });
  const v = viewPatient(p);
  const wants = !!((v.profile.contato || {}) as Record<string, unknown>).avisos;
  await notify(p.user_id, wants ? await userEmail(p.user_id) : null, {
    kind: 'exame',
    title: f.category === 'exame' || f.category === 'laudo' ? 'Novo resultado de exame disponível' : 'Novo documento disponível',
    body: 'A equipe médica liberou um arquivo para você na sua área do paciente.',
    link: '/area-do-paciente#arquivos',
  });
}

on('POST', 'medico/prontuario/:n/permissao', async (req, [n]) => {
  const { a, d } = await asDoctor(req);
  const p = await patientByNumber(n);
  if (await activeGrant(p.id, d.id)) return json({ ok: true, status: 'concedido' });
  const pending = await db.select('grants', { patient_id: p.id, doctor_id: d.id, status: 'pendente' });
  if (!pending.length) {
    await db.insert('grants', { patient_id: p.id, doctor_id: d.id, scope: 'documentos', status: 'pendente', expires_at: null, requested_at: now(), decided_at: null });
    await audit({ actorId: a.user.id, actorRole: 'medico', action: 'permissao-solicitada', patientId: p.id });
  }
  await notify(p.user_id, await userEmail(p.user_id), {
    kind: 'permissao',
    title: 'Um médico pediu acesso aos seus documentos',
    body: `${doctorLabel(d)} (${d.specialty}) pediu para ver os documentos e exames que você anexou. Você decide: autorizar por um período ou negar.`,
    link: '/area-do-paciente#permissoes',
    mailLines: [`${doctorLabel(d)}, ${d.specialty}, pediu acesso aos documentos e exames que você anexou na sua área do paciente.`, 'Nada é liberado sem a sua decisão. Entre no ambiente seguro para autorizar por um período, negar ou revogar quando quiser.'],
  });
  return json({ ok: true, status: 'pendente' });
});

/* ===== Administração ===== */
const asAdmin = async (req: Request) => {
  const a = await getAuth(req, { roles: ['admin'] });
  if (!a) throw new AuthError();
  return a;
};

on('GET', 'admin/painel', async (req) => {
  await asAdmin(req);
  const doctors = await db.select('doctors', {}, { order: 'created_at', desc: true });
  const users = new Map((await db.select('users', { role: 'medico' })).map((u) => [u.id, u]));
  const events = await db.select('security_events', {}, { order: 'at', desc: true, limit: 80 });
  const chain = await verifyAuditChain();
  const patients = (await db.select('patients', {})).length;
  return json({
    medicos: doctors.map((d) => ({ nome: d.name, crm: `CRM-${d.uf} ${d.crm}`, rqe: d.rqe, especialidade: d.specialty, status: users.get(d.user_id)?.status || '—', email: users.get(d.user_id) ? maskEmail(decrypt(users.get(d.user_id)!.email_enc, 'email')) : '' })),
    eventos: events.map((e) => ({ em: e.at, tipo: e.kind, gravidade: e.severity, detalhe: e.detail })),
    auditoria: chain,
    totais: { pacientes: patients, medicos: doctors.length, alertas24h: events.filter((e) => Date.now() - new Date(e.at).getTime() < 864e5 && (e.severity === 'alta' || e.severity === 'critica')).length },
  });
});

on('POST', 'admin/medicos', async (req) => {
  const a = await asAdmin(req);
  const b = await body(req);
  const nome = str(b.nome, 120);
  const email = str(b.email, 200).toLowerCase();
  const crm = str(b.crm, 12).replace(/\D/g, '');
  const uf = str(b.uf, 2).toUpperCase();
  if (nome.length < 5 || !emailOk(email) || !crm || !/^[A-Z]{2}$/.test(uf)) throw new UserError('Preencha nome, e-mail, CRM e UF.');
  if (await findUserByEmail(email)) throw new UserError('Já existe uma conta com este e-mail.');
  const user = await createUser(email, 'medico', { status: 'convidado' });
  await db.insert('doctors', { user_id: user.id, name: nome, crm, uf, rqe: str(b.rqe, 20) || null, specialty: str(b.especialidade, 80) || 'Clínica médica', created_at: now() });
  const token = newToken();
  await db.insert('otps', { user_id: user.id, purpose: 'ativacao', code_hash: tokenHash('ativacao:' + token), expires_at: minutesFromNow(72 * 60), attempts: 0, consumed_at: null, created_at: now() });
  await sendMail({ to: email, subject: 'Convite: área do médico do Hospital São Paulo', title: `Bem-vindo(a), ${nome.split(' ')[0]}`, lines: ['A administração do Hospital São Paulo cadastrou você na área do médico.', 'Crie sua senha pelo botão abaixo. O convite vale por 72 horas. Em todo acesso, você também receberá um código de verificação por e-mail.'], button: { label: 'Criar minha senha', href: `${cfg.siteUrl}/acesso?etapa=ativar&token=${token}` }, kind: 'convite' });
  await audit({ actorId: a.user.id, actorRole: 'admin', action: 'medico-convidado', detail: `CRM-${uf} ${crm}` });
  return json({ ok: true, ...(DEMO ? { demoLink: `/acesso?etapa=ativar&token=${token}` } : {}) });
});

/* ===== Demonstração ===== */
on('GET', 'demo/caixa', async () => {
  if (!DEMO) return fail(404, 'Não encontrado.');
  return json({ items: outbox().slice(0, 12).map((m) => ({ para: maskEmail(m.to), assunto: m.subject, codigo: m.code || null, link: m.button?.href.replace(cfg.siteUrl, '') || null, em: m.at })) });
});

/* ------------------------------ Entrada ------------------------------ */
export async function handle(req: Request, path: string): Promise<Response> {
  try {
    await ensureSeed();
    const blocked = await guard(req, path);
    if (blocked) return blocked;
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = path.match(r.pattern);
      if (m) return await r.handler(req, m.slice(1).map(decodeURIComponent));
    }
    return fail(404, 'Não encontrado.');
  } catch (e) {
    if (e instanceof AuthError) return fail(401, 'Sessão expirada ou sem permissão. Entre novamente.');
    if (e instanceof UserError) return fail(400, e.message);
    console.error(JSON.stringify({ msg: 'secure-api-error', path, err: (e as Error).message }));
    return fail(500, 'Não foi possível concluir agora. Tente de novo em instantes.');
  }
}
