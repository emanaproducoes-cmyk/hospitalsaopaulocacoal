/**
 * Camada de analytics com consentimento (LGPD + Google Consent Mode v2).
 * - Eventos só são enviados ao dataLayer quando o consentimento de analytics foi concedido.
 * - Parâmetros passam por uma lista de permissões: nada de nome, telefone, e-mail ou dado clínico.
 */

export type AnalyticsEvent =
  | 'view_service'
  | 'search_doctor'
  | 'click_schedule'
  | 'click_whatsapp'
  | 'click_emergency'
  | 'view_exam_prep'
  | 'submit_contact'
  | 'view_location'
  | 'content_engagement'
  | 'site_search';

type Params = Record<string, string | number | boolean | undefined>;

const ALLOWED_PARAMS = new Set([
  'origin', 'intent', 'type', 'specialty', 'service_slug', 'exam_slug', 'article_slug', 'action',
  'query_length', 'results_count', 'selected_type', 'form', 'topic', 'depth', 'step',
]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    __hbspConsent?: ConsentState;
  }
}

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

export const CONSENT_KEY = 'hbsp-consent';

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return window.__hbspConsent ?? null;
  }
}

export function saveConsent(state: ConsentState) {
  if (typeof window === 'undefined') return;
  window.__hbspConsent = state;
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    /* armazenamento indisponível: mantém em memória */
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push([
    'consent',
    'update',
    {
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: state.marketing ? 'granted' : 'denied',
      ad_user_data: state.marketing ? 'granted' : 'denied',
      ad_personalization: state.marketing ? 'granted' : 'denied',
    },
  ]);
}

function sanitize(params: Params): Params {
  const out: Params = {};
  for (const [k, v] of Object.entries(params)) {
    if (ALLOWED_PARAMS.has(k) && v !== undefined) out[k] = typeof v === 'string' ? v.slice(0, 80) : v;
  }
  return out;
}

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === 'undefined') return;
  const consent = readConsent();
  const payload = { event, ...sanitize(params) };
  if (process.env.NODE_ENV !== 'production') console.debug('[analytics]', payload, consent?.analytics ? 'enviado' : 'retido (sem consentimento)');
  if (!consent?.analytics) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/** Lê UTMs da URL atual para registrar a origem no contato (sem dados pessoais). */
export function currentOrigin(fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const p = new URLSearchParams(window.location.search);
  const parts = [p.get('origem') || fallback, p.get('utm_source'), p.get('utm_campaign')].filter(Boolean);
  return parts.join('|');
}
