'use client';

import Link from 'next/link';
import { site } from '@/lib/data/site';
import { track } from '@/lib/integrations/analytics';
import { whatsappLink } from '@/lib/integrations/whatsapp';
import { Icon } from '@/components/ui/Icon';

/** Barra de ações persistente no mobile: ações críticas a um toque, sem cobrir conteúdo (body tem padding-bottom). */
export function MobileActionBar() {
  return (
    <nav className="mobile-bar" aria-label="Ações rápidas">
      <Link href="/pronto-atendimento" className="mb-item is-alert" onClick={() => track('click_emergency', { origin: 'mobile-bar' })}>
        <Icon name="emergency" size={22} /><span>Urgência</span>
      </Link>
      <Link href="/agendar" className="mb-item" onClick={() => track('click_schedule', { origin: 'mobile-bar' })}>
        <Icon name="calendar" size={22} /><span>Agendar</span>
      </Link>
      <a href={whatsappLink({ intent: 'Contato', origin: 'mobile-bar' })} target="_blank" rel="noopener noreferrer" className="mb-item is-wa" onClick={() => track('click_whatsapp', { origin: 'mobile-bar' })}>
        <Icon name="whatsapp" size={22} /><span>WhatsApp</span>
      </a>
      <a href={`tel:${site.contacts.scheduling.tel}`} className="mb-item" onClick={() => track('click_emergency', { origin: 'mobile-bar', action: 'call' })}>
        <Icon name="phone" size={22} /><span>Ligar</span>
      </a>
      <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="mb-item" onClick={() => track('view_location', { origin: 'mobile-bar' })}>
        <Icon name="route" size={22} /><span>Rota</span>
      </a>
    </nav>
  );
}
