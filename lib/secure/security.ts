import { db, now, type AuditRow, type SecurityEventRow } from './db';
import { sha256 } from './crypto';
import { sendMail } from './mail';
import { cfg } from './config';

/**
 * Trilha de auditoria imutável (cada registro carrega o hash do anterior: qualquer
 * alteração ou exclusão quebra a cadeia e é detectada) e eventos de segurança com alerta.
 */

/** Hash canônico: ordem fixa de campos (não depende de como o banco devolve as colunas). */
const canon = (r: Omit<AuditRow, 'id' | 'hash'>) => sha256([r.seq, r.at, r.actor_id ?? '', r.actor_role ?? '', r.action, r.patient_id ?? '', r.detail ?? '', r.prev_hash].join('\u001f'));

let lastHash: string | null = null;
let lastSeq = 0;
let chain: Promise<unknown> = Promise.resolve();

export function audit(e: { actorId?: string | null; actorRole?: string | null; action: string; patientId?: string | null; detail?: string | null }) {
  // Serializa as gravações para manter a cadeia íntegra dentro da instância.
  const job = chain.then(async () => {
    if (lastHash === null) {
      const prev = (await db.select('audit_log', {}, { order: 'seq', desc: true, limit: 1 }))[0];
      lastHash = prev?.hash ?? 'GENESIS';
      lastSeq = prev?.seq ?? 0;
    }
    const row: Omit<AuditRow, 'id' | 'hash'> = {
      seq: lastSeq + 1,
      at: now(),
      actor_id: e.actorId ?? null,
      actor_role: e.actorRole ?? null,
      action: e.action,
      patient_id: e.patientId ?? null,
      detail: e.detail ?? null,
      prev_hash: lastHash,
    };
    const hash = canon(row);
    await db.insert('audit_log', { ...row, hash });
    lastHash = hash;
    lastSeq = row.seq;
  });
  chain = job.catch(() => { lastHash = null; });
  return job;
}

/** Recalcula a cadeia inteira. Retorna o primeiro registro quebrado, se houver. */
export async function verifyAuditChain(): Promise<{ ok: boolean; total: number; brokenAt?: number }> {
  const rows = await db.select('audit_log', {}, { order: 'seq' });
  let prev = 'GENESIS';
  for (const r of rows) {
    if (r.prev_hash !== prev || canon(r) !== r.hash) return { ok: false, total: rows.length, brokenAt: r.seq };
    prev = r.hash;
  }
  return { ok: true, total: rows.length };
}

const SEVERITY_ALERT = new Set(['alta', 'critica']);

export async function securityEvent(kind: string, severity: SecurityEventRow['severity'], info: { userId?: string | null; ipHash?: string | null; detail?: string }) {
  await db.insert('security_events', { at: now(), kind, severity, user_id: info.userId ?? null, ip_hash: info.ipHash ?? null, detail: info.detail ?? null });
  if (SEVERITY_ALERT.has(severity)) {
    await sendMail({
      to: cfg.alertEmail || cfg.adminEmail,
      subject: `[Alerta de segurança HBSP] ${kind}`,
      title: 'Alerta de segurança',
      lines: [
        `Evento: ${kind} (gravidade ${severity}).`,
        info.detail ? `Detalhe: ${info.detail}` : '',
        `Quando: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Porto_Velho' })}.`,
        'Revise os eventos no painel administrativo. Nenhum dado de paciente foi incluído neste e-mail.',
      ].filter(Boolean),
      kind: 'alerta',
    }).catch(() => {});
  }
}

/* --------------- Limite de tentativas por origem (janela deslizante) --------------- */
const buckets = new Map<string, number[]>();
export function tooMany(key: string, max: number, windowMs: number): boolean {
  const t = Date.now();
  const arr = (buckets.get(key) || []).filter((x) => t - x < windowMs);
  arr.push(t);
  buckets.set(key, arr);
  if (buckets.size > 20000) buckets.clear();
  return arr.length > max;
}
