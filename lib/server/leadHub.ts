import { createHmac, randomBytes } from 'node:crypto';
import type { LeadEnvelope, LeadKind, LeadResult } from '@/lib/domain/types';

/**
 * Hub de pedidos do site → CRM.
 * Recebe tudo o que o paciente envia (agendamento, contato, ouvidoria, NPS, assistente),
 * valida, gera protocolo, classifica a prioridade e entrega aos destinos configurados:
 *
 *  HBSP_API_URL          backend do hospital (Java/Spring, contrato em docs/api/openapi.yaml)
 *  CRM_WEBHOOK_URL       qualquer CRM via webhook (n8n, Make, Zapier, RD Station, HubSpot, Kommo…)
 *  CRM_WEBHOOK_SECRET    assina o corpo (HMAC-SHA256) no cabeçalho X-HBSP-Signature
 *
 * Sem destino configurado, responde fallback=true com o protocolo: o site segue pelo
 * WhatsApp levando o protocolo na mensagem, e nada se perde.
 * Nunca registra dados pessoais em log.
 */

const KINDS: LeadKind[] = ['agendamento', 'contato', 'ouvidoria', 'nps', 'assistente'];
const API_PATH: Record<LeadKind, string> = {
  agendamento: '/schedule-requests',
  contato: '/contact-requests',
  ouvidoria: '/feedback',
  nps: '/feedback',
  assistente: '/contact-requests',
};

export function makeProtocol(d = new Date()): string {
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rnd = Array.from(randomBytes(5), (b) => alphabet[b % alphabet.length]).join('');
  return `HBSP-${ymd}-${rnd}`;
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const digits = (v: unknown) => (typeof v === 'string' ? v.replace(/\D/g, '') : '');

export function validate(env: LeadEnvelope): string | null {
  if (!env || typeof env !== 'object' || !KINDS.includes(env.kind)) return 'tipo inválido';
  if (env.website) return 'spam';
  const d = env.data as unknown as Record<string, unknown>;
  if (!d || typeof d !== 'object') return 'dados ausentes';
  const consent = d.consent as Record<string, unknown> | undefined;
  if (env.kind !== 'nps' && !(consent && consent.granted === true)) return 'consentimento ausente';
  if (env.kind === 'agendamento' || env.kind === 'contato' || env.kind === 'assistente') {
    if (str(d.name, 80).length < 2) return 'nome inválido';
    const ph = digits(d.phone);
    if (ph.length < 10 || ph.length > 13) return 'telefone inválido';
  }
  if (env.kind === 'agendamento' && d.preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(d.preferredDate))) return 'data inválida';
  if (env.kind === 'nps') {
    const sc = Number(d.score);
    if (!Number.isInteger(sc) || sc < 0 || sc > 10) return 'nota inválida';
  }
  if (typeof d.message === 'string' && d.message.length > 2000) return 'mensagem longa demais';
  return null;
}

/** Pontuação 0–100 para a central priorizar o retorno. Regras simples e auditáveis. */
export function score(env: LeadEnvelope): { score: number; band: 'quente' | 'morno' | 'frio'; reasons: string[] } {
  const d = env.data as unknown as Record<string, unknown>;
  const reasons: string[] = [];
  let s = { agendamento: 45, assistente: 30, contato: 20, ouvidoria: 0, nps: 0 }[env.kind];
  if (env.kind === 'agendamento') {
    if (d.specialty || d.exam) { s += 10; reasons.push('serviço definido'); }
    if (d.doctor) { s += 5; reasons.push('médico escolhido'); }
    if (typeof d.preferredDate === 'string') {
      const days = (new Date(d.preferredDate + 'T12:00:00').getTime() - Date.now()) / 864e5;
      if (days <= 7) { s += 20; reasons.push('data nos próximos 7 dias'); } else if (days <= 21) { s += 10; reasons.push('data em até 3 semanas'); }
    }
    if (d.insurance === 'particular') { s += 10; reasons.push('particular'); } else if (d.insurance === 'convenio') { s += 5; reasons.push('convênio'); }
  }
  if (env.kind === 'contato' && (d.topic === 'agendamento' || d.topic === 'internacao')) { s += 15; reasons.push(`assunto: ${d.topic}`); }
  const j = env.journey;
  if (j) {
    if (j.lastTouch?.campaign) { s += 5; reasons.push('veio de campanha'); }
    if (j.visits >= 2) { s += 5; reasons.push('visita recorrente'); }
    if (j.pagesViewed >= 5) { s += 5; reasons.push('navegação engajada'); }
  }
  s = Math.max(0, Math.min(100, s));
  return { score: s, band: s >= 70 ? 'quente' : s >= 40 ? 'morno' : 'frio', reasons };
}

async function postJson(url: string, body: string, headers: Record<string, string>, timeoutMs = 6000): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers }, body, signal: ctrl.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export async function deliver(env: LeadEnvelope): Promise<LeadResult> {
  const protocol = makeProtocol();
  const { score: sc, band, reasons } = score(env);
  const record = {
    protocol,
    kind: env.kind,
    receivedAt: new Date().toISOString(),
    priority: { score: sc, band, reasons },
    data: env.data,
    journey: env.journey ?? null,
    source: 'site-hbsp',
    schema: 'hbsp.lead.v1',
  };
  const body = JSON.stringify(record);
  const delivered: string[] = [];
  const jobs: Promise<void>[] = [];

  const api = process.env.HBSP_API_URL;
  if (api) {
    jobs.push(postJson(`${api.replace(/\/$/, '')}/api/v1${API_PATH[env.kind]}`, JSON.stringify({ ...env.data, protocol, priority: band, journey: env.journey }), process.env.HBSP_API_TOKEN ? { Authorization: `Bearer ${process.env.HBSP_API_TOKEN}` } : {}).then((ok) => { if (ok) delivered.push('api-hbsp'); }));
  }
  const hook = process.env.CRM_WEBHOOK_URL;
  if (hook) {
    const sig = process.env.CRM_WEBHOOK_SECRET ? 'sha256=' + createHmac('sha256', process.env.CRM_WEBHOOK_SECRET).update(body).digest('hex') : '';
    jobs.push(postJson(hook, body, sig ? { 'X-HBSP-Signature': sig } : {}).then((ok) => { if (ok) delivered.push('crm-webhook'); }));
  }
  await Promise.all(jobs);

  // Log operacional sem dados pessoais.
  console.info(JSON.stringify({ msg: 'lead', protocol, kind: env.kind, band, delivered, stage: env.journey?.stage, source: env.journey?.lastTouch?.source }));

  return delivered.length > 0 ? { ok: true, protocol, delivered, band } : { ok: false, fallback: true, protocol, band };
}

/* Limite simples por IP (melhor esforço, por instância). */
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, max = 8, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}
