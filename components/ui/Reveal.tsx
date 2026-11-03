'use client';

import { useEffect, useRef, useState } from 'react';

/** Entrada suave de blocos ao rolar. Respeita prefers-reduced-motion (via CSS) e nunca esconde conteúdo sem JS. */
export function Reveal({ children, as: Tag = 'div', className, delay = 0 }: { children: React.ReactNode; as?: 'div' | 'section' | 'li' | 'article'; className?: string; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'armed' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return; // já visível: não anima
    setState('armed');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('shown');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref} className={`reveal ${state === 'armed' ? 'is-armed' : ''} ${state === 'shown' ? 'is-shown' : ''} ${className ?? ''}`} style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}>
      {children}
    </Comp>
  );
}
