import type { AssistantLead, ContactRequest, Feedback, LeadEnvelope, LeadKind, LeadResult, NpsRequest, ScheduleRequest } from '@/lib/domain/types';
import { journeySnapshot } from './journey';
import { track } from './analytics';

/**
 * Cliente do hub de pedidos (/api/leads). O servidor gera o protocolo, classifica a
 * prioridade e entrega ao backend do hospital e/ou ao CRM (ver lib/server/leadHub.ts).
 *
 * - ok: true      → pelo menos um destino confirmou o recebimento.
 * - fallback: true → nenhum destino confirmou (ou o site está em hospedagem estática):
 *                    a interface oferece o WhatsApp levando o protocolo, quando houver.
 */
export type ApiResult = LeadResult;

/** Protocolo gerado no navegador quando o servidor não responde (mesmo formato do servidor). */
function localProtocol(): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(5);
  (globalThis.crypto || ({} as Crypto)).getRandomValues?.(bytes);
  return `HBSP-${ymd}-${Array.from(bytes, (b) => alphabet[(b || Math.floor(Math.random() * 256)) % alphabet.length]).join('')}`;
}

const ENDPOINT = process.env.NEXT_PUBLIC_LEADS_ENDPOINT || '/api/leads';

async function send(kind: LeadKind, data: LeadEnvelope['data'], origin: string): Promise<ApiResult> {
  const envelope: LeadEnvelope = { kind, data, journey: journeySnapshot(origin) };
  let result: ApiResult;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(envelope), signal: ctrl.signal });
    clearTimeout(t);
    const ct = res.headers.get('content-type') || '';
    result = ct.includes('json') ? ((await res.json()) as ApiResult) : { ok: false, fallback: true, error: `HTTP ${res.status}` };
    if (!res.ok && !result.error) result = { ...result, ok: false, fallback: true, error: `HTTP ${res.status}` };
  } catch (e) {
    result = { ok: false, fallback: true, error: (e as Error).message };
  }
  if (!result.protocol) result = { ...result, protocol: localProtocol() };
  track('lead_submitted', { form: kind, delivered: result.ok, score_band: result.band, channel: result.ok ? 'crm' : 'whatsapp' });
  return result;
}

export const api = {
  scheduleRequest: (r: ScheduleRequest) => send('agendamento', r, r.origin),
  contactRequest: (r: ContactRequest) => send('contato', r, r.origin),
  feedback: (r: Feedback) => send('ouvidoria', r, 'ouvidoria'),
  nps: (r: NpsRequest) => send('nps', r, 'nps'),
  assistantLead: (r: AssistantLead) => send('assistente', r, 'assistente'),
};
