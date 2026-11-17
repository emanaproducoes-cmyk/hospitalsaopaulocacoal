/**
 * "Minha jornada": pedidos que o PRÓPRIO paciente escolheu guardar neste aparelho.
 * Fica só no navegador dele (localStorage), sem nome, telefone ou dado clínico,
 * e pode ser apagado a qualquer momento na página /minha-jornada.
 */

export interface SavedRequest {
  protocol: string;
  kind: 'consulta' | 'exame' | 'retorno';
  title: string; // "Consulta · Cardiologia"
  slug?: string; // especialidade ou exame, para links
  doctor?: string;
  date?: string; // AAAA-MM-DD (preferência)
  period?: string;
  createdAt: string;
  sentToCrm: boolean;
  nps?: number;
}

const KEY = 'hbsp-meus-pedidos';

export function listRequests(): SavedRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]') as SavedRequest[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveRequest(r: SavedRequest) {
  const all = listRequests().filter((x) => x.protocol !== r.protocol);
  all.unshift(r);
  try { localStorage.setItem(KEY, JSON.stringify(all.slice(0, 20))); } catch { /* sem armazenamento */ }
}

export function updateRequest(protocol: string, patch: Partial<SavedRequest>) {
  const all = listRequests().map((x) => (x.protocol === protocol ? { ...x, ...patch } : x));
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* */ }
}

export function removeRequest(protocol: string) {
  try { localStorage.setItem(KEY, JSON.stringify(listRequests().filter((x) => x.protocol !== protocol))); } catch { /* */ }
}

export function clearRequests() {
  try { localStorage.removeItem(KEY); } catch { /* */ }
}

/** Etapas mostradas ao paciente. A confirmação real vem da central (WhatsApp/telefone). */
export function requestStatus(r: SavedRequest): { step: number; label: string } {
  if (r.nps !== undefined) return { step: 4, label: 'Atendimento avaliado' };
  if (r.date) {
    const d = new Date(r.date + 'T23:59:00');
    if (d.getTime() < Date.now()) return { step: 3, label: 'Data passou: conte como foi' };
  }
  return { step: 1, label: r.sentToCrm ? 'Pedido recebido · aguardando confirmação da central' : 'Aguardando você enviar pelo WhatsApp' };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Arquivo .ics (lembrete) para a data de preferência. Funciona no Google, Apple e Outlook. */
export function icsFor(r: SavedRequest, address: string): string {
  const [y, m, d] = (r.date || new Date().toISOString().slice(0, 10)).split('-').map(Number);
  const start = r.period === 'tarde' ? [14, 0] : [8, 0];
  const dt = (h: number, mi: number) => `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(mi)}00`;
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hospital Sao Paulo Cacoal//Minha jornada//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${r.protocol}@hospitalsaopaulocacoal`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/Porto_Velho:${dt(start[0], start[1])}`,
    `DTEND;TZID=America/Porto_Velho:${dt(start[0] + 1, start[1])}`,
    `SUMMARY:${esc(`${r.title} · Hospital São Paulo`)}`,
    `DESCRIPTION:${esc(`Protocolo ${r.protocol}. Data de preferência; o horário é confirmado pela central. Leve documento com foto e carteirinha do convênio, se houver.`)}`,
    `LOCATION:${esc(address)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Amanhã: atendimento no Hospital São Paulo', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcs(r: SavedRequest, address: string) {
  const blob = new Blob([icsFor(r, address)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hbsp-${r.protocol}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
