'use client';

import { useEffect, useState } from 'react';
import { NpsForm } from './NpsForm';

/** Lê ?p=PROTOCOLO do link enviado pela central (WhatsApp/SMS) após o atendimento. */
export function NpsAuto() {
  const [protocol, setProtocol] = useState<string | undefined>();
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('p') || undefined;
    if (p && /^HBSP-\d{6}-[A-Z0-9]{5}$/.test(p)) setProtocol(p);
  }, []);
  return <NpsForm protocol={protocol} />;
}
