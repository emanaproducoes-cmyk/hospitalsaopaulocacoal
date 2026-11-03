import { site } from '@/lib/data/site';

/**
 * Gera links de WhatsApp com contexto de jornada.
 * A referência [Site · intenção · ref] permite à central identificar a origem
 * sem que o site colete dados sensíveis.
 */
export function whatsappLink(opts: { intent: string; origin: string; text?: string }) {
  const msg = opts.text ?? 'Olá! Gostaria de atendimento.';
  const full = `${msg}\n\n[Site · ${opts.intent} · ref:${opts.origin}]`;
  return `https://wa.me/${site.contacts.scheduling.whatsapp}?text=${encodeURIComponent(full)}`;
}

export const telLink = (tel: string) => `tel:${tel}`;
