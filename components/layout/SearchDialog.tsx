'use client';

import { useEffect, useRef } from 'react';
import { UniversalSearch } from '@/components/sections/UniversalSearch';
import { Icon } from '@/components/ui/Icon';

/** Busca universal em modal (atalho Ctrl/⌘ K). Foco preso e fechamento com Esc. */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => ref.current?.querySelector<HTMLInputElement>('input')?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, input, a[href]');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="search-modal" role="dialog" aria-modal="true" aria-label="Buscar no site">
      <div className="search-modal-backdrop" onClick={onClose} />
      <div className="search-modal-panel" ref={ref}>
        <div className="search-modal-head">
          <p>O que você procura?</p>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar busca">
            <Icon name="close" size={22} />
          </button>
        </div>
        <UniversalSearch compact onNavigate={onClose} />
      </div>
    </div>
  );
}
