'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readConsent, saveConsent } from '@/lib/integrations/analytics';
import { site } from '@/lib/data/site';

const OPEN_EVENT = 'hbsp:open-cookies';

/** Banner de cookies não intrusivo (LGPD + Consent Mode v2). Recusar é tão fácil quanto aceitar. */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!readConsent()) {
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, []);
  useEffect(() => {
    const h = () => {
      const c = readConsent();
      setAnalytics(!!c?.analytics);
      setMarketing(!!c?.marketing);
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, h);
    return () => window.removeEventListener(OPEN_EVENT, h);
  }, []);

  const save = (a: boolean, m: boolean) => {
    saveConsent({ necessary: true, analytics: a, marketing: m, version: site.policyVersion, timestamp: new Date().toISOString() });
    setOpen(false);
  };

  if (!open) return null;
  return (
    <section className="cookie" role="region" aria-label="Preferências de cookies">
      <p className="cookie-title">Sua privacidade importa</p>
      <p>
        Usamos cookies necessários para o site funcionar e, com a sua permissão, cookies de medição para melhorar a experiência.
        Nunca usamos dados de saúde para publicidade. <Link href="/privacidade#cookies">Saiba mais</Link>.
      </p>
      {custom && (
        <fieldset className="cookie-options">
          <legend className="sr-only">Categorias de cookies</legend>
          <label><input type="checkbox" checked disabled /> Necessários (sempre ativos)</label>
          <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Medição de uso (analytics)</label>
          <label><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Campanhas e marketing</label>
        </fieldset>
      )}
      <div className="cookie-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => save(false, false)}>Recusar opcionais</button>
        {custom ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => save(analytics, marketing)}>Salvar escolhas</button>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCustom(true)}>Personalizar</button>
        )}
        <button type="button" className="btn btn-primary btn-sm" onClick={() => save(true, true)}>Aceitar todos</button>
      </div>
    </section>
  );
}

export function CookieSettingsButton() {
  return (
    <button type="button" className="linklike" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Preferências de cookies
    </button>
  );
}
