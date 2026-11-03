'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useMemo, useRef, useState } from 'react';
import { search, type SearchItem } from '@/lib/data/search-index';
import { track } from '@/lib/integrations/analytics';
import { Icon } from '@/components/ui/Icon';

const suggestions = ['Cardiologia', 'Pediatria', 'Tomografia', 'Internação', 'Convênios', 'Urologia'];

/** Combobox ARIA 1.2 com resultados agrupados por tipo. */
export function UniversalSearch({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(q, 8), [q]);
  const lastTracked = useRef('');
  const router = useRouter();

  const go = (item: SearchItem) => {
    track('site_search', { query_length: q.length, results_count: results.length, selected_type: item.type });
    onNavigate?.();
    router.push(item.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
    if (e.key === 'Enter' && active >= 0 && results[active]) { e.preventDefault(); go(results[active]); }
  };

  const onChange = (v: string) => {
    setQ(v);
    setActive(-1);
    if (v.length >= 3 && v !== lastTracked.current) {
      lastTracked.current = v;
      const n = search(v, 8).length;
      if (n === 0) track('site_search', { query_length: v.length, results_count: 0 });
    }
  };

  return (
    <div className={`usearch ${compact ? 'is-compact' : ''}`}>
      <label htmlFor={`${listId}-input`} className="sr-only">Buscar médico, especialidade, exame ou serviço</label>
      <div className="usearch-field">
        <Icon name="search" size={22} />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          placeholder="Busque por médico, especialidade, exame ou serviço"
          autoComplete="off"
          value={q}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
        />
        {q && (
          <button type="button" className="usearch-clear" onClick={() => { setQ(''); inputRef.current?.focus(); }} aria-label="Limpar busca">
            <Icon name="close" size={18} />
          </button>
        )}
      </div>

      {!q && (
        <div className="usearch-suggest">
          <span>Mais buscados:</span>
          {suggestions.map((s) => (
            <button type="button" key={s} className="chip" onClick={() => onChange(s)}>{s}</button>
          ))}
        </div>
      )}

      <ul id={listId} role="listbox" aria-label="Resultados" className="usearch-results" hidden={!q}>
        {results.map((r, i) => (
          <li key={r.href + r.title} id={`${listId}-opt-${i}`} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''}>
            <Link href={r.href} onClick={() => { track('site_search', { query_length: q.length, results_count: results.length, selected_type: r.type }); onNavigate?.(); }}>
              <span className={`usearch-type t-${r.type.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}`}>{r.type}</span>
              <span className="usearch-text">
                <strong>{r.title}</strong>
                <small>{r.subtitle}</small>
              </span>
              <Icon name="arrow-right" size={18} />
            </Link>
          </li>
        ))}
        {q && results.length === 0 && (
          <li className="usearch-empty" role="option" aria-selected={false}>
            <p><strong>Não encontramos “{q}”.</strong> A central pode orientar você.</p>
            <Link href="/agendar" onClick={onNavigate}>Falar com a central de atendimento</Link>
          </li>
        )}
      </ul>
      <p className="sr-only" aria-live="polite">{q ? `${results.length} resultados` : ''}</p>
    </div>
  );
}
