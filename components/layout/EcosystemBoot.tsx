'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { readConsent, track } from '@/lib/integrations/analytics';
import { readJourney, recordPageView } from '@/lib/integrations/journey';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';

/**
 * Liga as peças do ecossistema em todas as páginas:
 * 1. Google Tag Manager com Consent Mode v2 (padrão "negado" até o aceite no banner).
 * 2. Registro 1st-party da jornada (origem, páginas vistas, interesses, etapa).
 * 3. Evento page_view com a origem da visita, para o funil no GA4.
 */
export function EcosystemBoot() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GTM_ID || typeof window === 'undefined' || document.getElementById('gtm-loader')) return;
    window.dataLayer = window.dataLayer || [];
    const c = readConsent();
    window.dataLayer.push(['consent', 'default', {
      analytics_storage: c?.analytics ? 'granted' : 'denied',
      ad_storage: c?.marketing ? 'granted' : 'denied',
      ad_user_data: c?.marketing ? 'granted' : 'denied',
      ad_personalization: c?.marketing ? 'granted' : 'denied',
      wait_for_update: 500,
    }]);
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.id = 'gtm-loader';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!pathname) return;
    recordPageView(pathname);
    const j = readJourney();
    track('page_view', { page_path: pathname, stage: j.stage, source: j.last?.source, medium: j.last?.medium, campaign: j.last?.campaign });
  }, [pathname]);

  return null;
}
