'use client';

/** Cliente da API segura. Cookies HttpOnly vão sozinhos; nada sensível fica no navegador. */
export class SessionError extends Error {}

export async function sx<T = Record<string, unknown>>(path: string, init: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;
  if (init.form) body = init.form;
  else if (init.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`/api/secure/${path}`, { method: init.method || (body ? 'POST' : 'GET'), headers, body, credentials: 'same-origin', cache: 'no-store' });
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('json') ? await res.json() : null;
  if (res.status === 401) throw new SessionError((data && data.error) || 'Sessão expirada.');
  if (!res.ok) throw new Error((data && data.error) || 'Não foi possível concluir agora.');
  return data as T;
}

export const fmtDate = (s?: string | null) => (s ? new Date(s.length === 10 ? s + 'T12:00:00' : s).toLocaleDateString('pt-BR') : '—');
export const fmtDateTime = (s?: string | null) => (s ? new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
export function age(birth?: unknown): string {
  if (typeof birth !== 'string' || !birth) return '';
  const b = new Date(birth + 'T12:00:00');
  let a = new Date().getFullYear() - b.getFullYear();
  const m = new Date().getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && new Date().getDate() < b.getDate())) a--;
  return `${a} anos`;
}
