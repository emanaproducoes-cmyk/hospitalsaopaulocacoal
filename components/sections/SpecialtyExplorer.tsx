'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { specialties, specialtyGroups } from '@/lib/data/specialties';
import { normalize } from '@/lib/data/search-index';
import { Icon } from '@/components/ui/Icon';
import type { SpecialtyGroup } from '@/lib/domain/types';

/** Lista filtrável de especialidades por grupo e texto. */
export function SpecialtyExplorer() {
  const [group, setGroup] = useState<SpecialtyGroup | ''>('');
  const [q, setQ] = useState('');
  const groups = Object.entries(specialtyGroups) as [SpecialtyGroup, string][];
  const filtered = useMemo(() => {
    const nq = normalize(q);
    return specialties.filter((s) => (!group || s.group === group) && (!nq || normalize(s.name + ' ' + s.keywords.join(' ') + ' ' + s.summary).includes(nq)));
  }, [group, q]);

  return (
    <>
      <div className="field" style={{ maxWidth: 520, marginBottom: '1.25rem' }}>
        <label htmlFor="spec-q">Filtrar por nome ou palavra-chave</label>
        <div className="input-icon"><Icon name="search" size={18} /><input id="spec-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: coração, criança, pele" /></div>
      </div>
      <div className="spec-filter" role="group" aria-label="Filtrar por área">
        <button type="button" className="chip" aria-pressed={group === ''} onClick={() => setGroup('')}>Todas ({specialties.length})</button>
        {groups.map(([k, v]) => (
          <button type="button" key={k} className="chip" aria-pressed={group === k} onClick={() => setGroup(k)}>{v}</button>
        ))}
      </div>
      <p className="finder-count" aria-live="polite">{filtered.length} especialidades</p>
      {groups.filter(([k]) => filtered.some((s) => s.group === k)).map(([k, v]) => (
        <section className="spec-group" key={k} aria-labelledby={`g-${k}`}>
          <h2 id={`g-${k}`}>{v}</h2>
          <ul className="spec-grid">
            {filtered.filter((s) => s.group === k).map((s) => (
              <li key={s.slug}>
                <Link href={`/especialidades/${s.slug}`} className="spec-card">
                  <span className="spec-dot" aria-hidden="true">{s.name[0]}</span>
                  <span><strong>{s.name}</strong><span>{s.summary}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {filtered.length === 0 && <div className="empty"><p><strong>Nenhuma especialidade encontrada.</strong></p><Link href="/agendar" className="btn btn-primary btn-sm">Pedir orientação à central</Link></div>}
    </>
  );
}
