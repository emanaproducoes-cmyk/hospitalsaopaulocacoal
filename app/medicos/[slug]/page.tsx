import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Breadcrumbs, JsonLd } from '@/components/ui/primitives';
import { asset } from '@/lib/asset';
import { TrackedButton } from '@/components/ui/Tracked';
import { Tooltip } from '@/components/ui/Tooltip';
import { doctors, getDoctor, initials } from '@/lib/data/doctors';
import { getSpecialty } from '@/lib/data/specialties';
import { site } from '@/lib/data/site';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return doctors.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = getDoctor((await params).slug);
  if (!d) return {};
  return { title: `${d.title} ${d.name} · ${d.specialtyLabel}`.trim(), description: `${d.specialtyLabel} no Hospital São Paulo de Cacoal. ${d.registry}. Agende sua consulta.`, alternates: { canonical: `/medicos/${d.slug}` }, openGraph: { type: 'profile', title: `${d.title} ${d.name}`.trim(), description: `${d.specialtyLabel} · ${d.registry}`, images: d.photo ? [{ url: `${d.photo}.webp`, width: 1080, height: 1080 }] : undefined } };
}

export default async function DoctorPage({ params }: Props) {
  const d = getDoctor((await params).slug);
  if (!d) notFound();
  const specs = d.specialties.map(getSpecialty).filter(Boolean);
  const full = `${d.title} ${d.name}`.trim();

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Physician', name: full, medicalSpecialty: d.specialtyLabel, identifier: d.registry, image: d.photo ? `${site.url}${d.photo}.webp` : undefined, worksFor: { '@type': 'Hospital', name: site.name } }} />
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Médicos', href: '/medicos' }, { label: full }]} />
          <div className="doctor-hero">
            {d.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar avatar-xl avatar-photo" src={asset(`${d.photo}-sm.webp`)} alt="" width={120} height={120} />
            ) : (
              <span className="avatar avatar-xl" aria-hidden="true">{initials(d.name)}</span>
            )}
            <div>
              <p className="eyebrow">{d.specialtyLabel}</p>
              <h1>{full}</h1>
              <p className="doctor-reg" style={{ fontSize: '1rem' }}>
                <Icon name="shield" size={18} /> {d.registry}
                <Tooltip content="CRM é o registro no Conselho Regional de Medicina. RQE é o Registro de Qualificação de Especialista. CRP é o registro no Conselho Regional de Psicologia. Você pode conferir nos sites dos conselhos." label="O que significam CRM, RQE e CRP?" />
              </p>
              <div className="page-hero-actions">
                <TrackedButton href={`/agendar?especialidade=${d.specialties[0]}&medico=${d.slug}&origem=perfil`} event="click_schedule" params={{ origin: 'doctor-profile', specialty: d.specialties[0] }} icon="calendar" size="lg">Agendar com {d.title || ''} {d.name.split(' ')[0]}</TrackedButton>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="sobre-title">
        <div className="container with-aside">
          <div className="doctor-about">
            {d.photo && (
              <figure className="doctor-about-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(`${d.photo}.webp`)} alt={`${full}, ${d.specialtyLabel} no Hospital São Paulo`} width={1080} height={1080} loading="lazy" />
              </figure>
            )}
            <div className="prose">
              <h2 id="sobre-title">Sobre</h2>
              {d.approach && <p className="doctor-approach">“{d.approach}”</p>}
              {(d.bio ?? []).map((p) => <p key={p}>{p}</p>)}
              {d.focus && d.focus.length > 0 && (
                <>
                  <h3>Áreas de atuação</h3>
                  <ul>{d.focus.map((f) => <li key={f}>{f}</li>)}</ul>
                </>
              )}
              <h3>Especialidades</h3>
              <ul>
                {specs.map((s) => s && <li key={s.slug}><Link href={`/especialidades/${s.slug}`}>{s.name}</Link> — {s.summary}</li>)}
              </ul>
            </div>
          </div>
          <aside>
            <div className="card is-blue">
              <h2>Atendimento</h2>
              <ul className="icon-list">
                <li><Icon name="pin" size={20} /><span>{site.address.street}, Cacoal</span></li>
                <li><Icon name="calendar" size={20} /><span>Dias, horários e convênios: a central confirma no agendamento</span></li>
                <li><Icon name="whatsapp" size={20} /><span>{site.contacts.scheduling.label}</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
