'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { doctors, initials } from '@/lib/data/doctors';
import { specialties } from '@/lib/data/specialties';
import { normalize } from '@/lib/data/search-index';
import { track } from '@/lib/integrations/analytics';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';

/** Busca de médicos com filtros por nome e especialidade. Filtros de convênio/agenda entram quando a API Java estiver integrada. */
export function DoctorFinder({ limit, initialSpecialty = '' }: { limit?: number; initialSpecialty?: string }) {
  const [q, setQ] = useState('');
  const [spec, setSpec] = useState(initialSpecialty);

  const usedSpecs = useMemo(() => specialties.filter((s) => doctors.some((d) => d.specialties.includes(s.slug))), []);
  const list = useMemo(() => {
    const nq = normalize(q);
    return doctors.filter((d) => (!spec || d.specialties.includes(spec)) && (!nq || normalize(d.name + ' ' + d.specialtyLabel).includes(nq)));
  }, [q, spec]);
  const shown = limit ? list.slice(0, limit) : list;

  const report = (query: string, specialty: string) => {
    const n = doctors.filter((d) => (!specialty || d.specialties.includes(specialty)) && (!query || normalize(d.name + ' ' + d.specialtyLabel).includes(normalize(query)))).length;
    track('search_doctor', { query_length: query.length, specialty: specialty || undefined, results_count: n });
  };

  return (
    <div className="finder">
      <form className="finder-filters" role="search" aria-label="Buscar médicos" onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label htmlFor="doc-q">Nome ou especialidade</label>
          <div className="input-icon">
            <Icon name="search" size={18} />
            <input id="doc-q" type="search" value={q} placeholder="Ex.: cardiologia, Marcela" onChange={(e) => setQ(e.target.value)} onBlur={() => q && report(q, spec)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="doc-s">Especialidade</label>
          <select id="doc-s" value={spec} onChange={(e) => { setSpec(e.target.value); report(q, e.target.value); }}>
            <option value="">Todas</option>
            {usedSpecs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </div>
        <div className="field field-disabled">
          <label htmlFor="doc-c">
            Convênio
            <Tooltip content="O filtro por convênio e por agenda disponível será ativado quando a lista oficial de convênios e a agenda forem integradas ao sistema do hospital." label="Por que este filtro está indisponível?" />
          </label>
          <select id="doc-c" disabled aria-describedby="doc-c-hint"><option>Em breve</option></select>
          <span id="doc-c-hint" className="sr-only">Filtro indisponível até a integração com a agenda do hospital.</span>
        </div>
      </form>

      <p className="finder-count" aria-live="polite">{list.length === 1 ? '1 profissional encontrado' : `${list.length} profissionais encontrados`}</p>

      <ul className="doctor-grid">
        {shown.map((d) => (
          <li key={d.slug}>
            <article className="doctor-card">
              <span className="avatar" aria-hidden="true">{initials(d.name)}</span>
              <div className="doctor-body">
                <h3><Link href={`/medicos/${d.slug}`}>{`${d.title} ${d.name}`.trim()}</Link></h3>
                <p className="doctor-spec">{d.specialtyLabel}</p>
                <p className="doctor-reg"><Icon name="shield" size={15} /> {d.registry}</p>
              </div>
              <Link href={`/agendar?especialidade=${d.specialties[0]}&medico=${d.slug}&origem=finder`} className="btn btn-secondary btn-sm" onClick={() => track('click_schedule', { origin: 'doctor-card', specialty: d.specialties[0] })}>
                Agendar
              </Link>
            </article>
          </li>
        ))}
      </ul>
      {list.length === 0 && (
        <div className="empty">
          <p><strong>Nenhum profissional encontrado com esses filtros.</strong></p>
          <p>A lista completa do corpo clínico está sendo atualizada. A central pode indicar o especialista certo.</p>
          <Link href="/agendar?origem=finder-vazio" className="btn btn-primary btn-sm">Pedir orientação à central</Link>
        </div>
      )}
      {limit && list.length > limit && (
        <p className="center"><Link href="/medicos" className="btn btn-ghost">Ver todos os profissionais</Link></p>
      )}
    </div>
  );
}
