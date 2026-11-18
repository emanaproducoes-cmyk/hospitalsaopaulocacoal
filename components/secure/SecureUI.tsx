'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/lib/domain/types';

/** Selo de ambiente seguro, mostrado em todas as telas do ambiente. */
export function SecureBadge({ compact = false }: { compact?: boolean }) {
  return (
    <p className={`sx-badge ${compact ? 'is-compact' : ''}`}>
      <Icon name="lock" size={15} />
      <span><strong>Ambiente seguro</strong>{!compact && ' · conexão criptografada (TLS) · dados protegidos com AES-256'}</span>
    </p>
  );
}

export function Panel({ title, icon, actions, children, className = '', id }: { title?: string; icon?: IconName; actions?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section className={`sx-panel ${className}`} id={id}>
      {(title || actions) && (
        <header className="sx-panel-head">
          {title && <h2>{icon && <Icon name={icon} size={20} />}{title}</h2>}
          {actions && <div className="sx-panel-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Empty({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return <div className="sx-empty"><Icon name={icon} size={28} /><p>{children}</p></div>;
}

export function Pill({ tone = 'neutral', children }: { tone?: 'neutral' | 'ok' | 'warn' | 'alert' | 'info'; children: React.ReactNode }) {
  return <span className={`sx-pill is-${tone}`}>{children}</span>;
}

export type ToastT = { kind: 'ok' | 'erro'; text: string } | null;
export function Toast({ toast, onDone }: { toast: ToastT; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [toast, onDone]);
  if (!toast) return null;
  return <div className={`sx-toast is-${toast.kind}`} role={toast.kind === 'erro' ? 'alert' : 'status'}><Icon name={toast.kind === 'ok' ? 'check' : 'alert'} size={18} />{toast.text}</div>;
}

export function Tabs<T extends string>({ items, value, onChange, label }: { items: { key: T; label: string; icon: IconName; badge?: number }[]; value: T; onChange: (k: T) => void; label: string }) {
  return (
    <nav className="sx-tabs" aria-label={label}>
      {items.map((it) => (
        <button key={it.key} type="button" className={`sx-tab ${value === it.key ? 'is-active' : ''}`} aria-current={value === it.key ? 'page' : undefined} onClick={() => onChange(it.key)}>
          <Icon name={it.icon} size={18} />
          <span>{it.label}</span>
          {!!it.badge && <em className="sx-tab-badge">{it.badge}</em>}
        </button>
      ))}
    </nav>
  );
}

/** Aviso de inatividade: a sessão expira sozinha; aqui só avisamos antes. */
export function IdleWatch({ minutes, onExpire }: { minutes: number; onExpire: () => void }) {
  const [left, setLeft] = useState(minutes * 60);
  useEffect(() => {
    const reset = () => setLeft(minutes * 60);
    const ev = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    ev.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => { ev.forEach((e) => window.removeEventListener(e, reset)); clearInterval(t); };
  }, [minutes]);
  useEffect(() => { if (left <= 0) onExpire(); }, [left, onExpire]);
  if (left > 90) return null;
  return <div className="sx-idle" role="alert"><Icon name="clock" size={18} /> Por segurança, sua sessão termina em {Math.max(0, left)} s sem atividade. Mexa o mouse para continuar.</div>;
}

export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return <div className="sx-spinner" role="status"><span aria-hidden="true" />{label}</div>;
}
