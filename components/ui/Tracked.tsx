'use client';

import { useEffect } from 'react';
import { track, type AnalyticsEvent } from '@/lib/integrations/analytics';
import { ButtonLink } from './primitives';
import type { IconName } from '@/lib/domain/types';

type Params = Record<string, string | number | boolean | undefined>;

/** Botão-link com evento de analytics (para uso em páginas de servidor). */
export function TrackedButton(props: {
  href: string;
  children: React.ReactNode;
  event: AnalyticsEvent;
  params?: Params;
  variant?: 'primary' | 'secondary' | 'ghost' | 'alert' | 'white' | 'green';
  icon?: IconName;
  iconRight?: IconName;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  describedBy?: string;
}) {
  const { event, params, describedBy, ...rest } = props;
  return <ButtonLink {...rest} aria-describedby={describedBy} onClick={() => track(event, params)} />;
}

/** Link de texto simples com evento. */
export function TrackedA({ href, event, params, children, className }: { href: string; event: AnalyticsEvent; params?: Params; children: React.ReactNode; className?: string }) {
  const ext = href.startsWith('http');
  return (
    <a href={href} className={className} onClick={() => track(event, params)} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}

/** Dispara um evento de visualização ao montar (ex.: view_service, view_exam_prep). */
export function TrackView({ event, params }: { event: AnalyticsEvent; params?: Params }) {
  useEffect(() => {
    track(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
