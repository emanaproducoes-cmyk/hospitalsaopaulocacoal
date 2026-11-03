'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';

/**
 * Tooltip acessível (WCAG 1.4.13):
 * - abre com hover, foco do teclado e toque; fecha com Esc ou ao sair;
 * - o conteúdo fica ligado ao gatilho por aria-describedby;
 * - permanece visível enquanto o ponteiro está sobre o balão (hoverable).
 * Use apenas para complementar — a informação essencial deve estar no texto visível.
 */
export function Tooltip({ content, label = 'Mais informações', children }: { content: React.ReactNode; label?: string; children?: React.ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDoc = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDoc);
    };
  }, [open]);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <span className="tooltip-wrap" ref={wrap} onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        className="tooltip-trigger"
        aria-describedby={id}
        aria-expanded={open}
        aria-label={children ? undefined : label}
        onFocus={show}
        onBlur={hide}
        onClick={() => setOpen((o) => !o)}
      >
        {children ?? <Icon name="info" size={16} />}
      </button>
      <span role="tooltip" id={id} className={`tooltip ${open ? 'is-open' : ''}`}>
        {content}
      </span>
    </span>
  );
}
