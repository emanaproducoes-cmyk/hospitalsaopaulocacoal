import type { ContactRequest, Feedback, ScheduleRequest } from '@/lib/domain/types';

/**
 * Cliente da API do backend Java (Spring Boot) — contratos em docs/api/openapi.yaml.
 * Quando NEXT_PUBLIC_API_URL não está definida, retorna { ok: false, fallback: true }
 * e a interface oferece o WhatsApp como canal alternativo.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export type ApiResult = { ok: true; protocol: string } | { ok: false; fallback: boolean; error?: string };

async function post(path: string, body: unknown): Promise<ApiResult> {
  if (!API_URL) return { ok: false, fallback: true };
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, fallback: true, error: `HTTP ${res.status}` };
    const data = (await res.json()) as { protocol: string };
    return { ok: true, protocol: data.protocol };
  } catch (e) {
    return { ok: false, fallback: true, error: (e as Error).message };
  }
}

export const api = {
  scheduleRequest: (r: ScheduleRequest) => post('/schedule-requests', r),
  contactRequest: (r: ContactRequest) => post('/contact-requests', r),
  feedback: (r: Feedback) => post('/feedback', r),
};
