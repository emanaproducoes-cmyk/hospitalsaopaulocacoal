import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Breadcrumbs, JsonLd, PendingBadge } from '@/components/ui/primitives';
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
  return { title: `${d.title} ${d.name} · ${d.specialtyLabel}`.trim(), description: `${d.specialtyLabel} no Hospital São Paulo de Cacoal. ${d.registry}. Agende sua consulta.`, alternates: { canonical: `/medicos/${d.slug}` } };
}

export default async function DoctorPage({ params }: Props) {
  const d = getDoctor((await params).slug);
  if (!d) notFound();
  const specs = d.specialties.map(getSpecialty).filter(Boolean);
  const full = `${d.title} ${d.name}`.trim();

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Physician', name: full, medicalSpecialty: d.specialtyLabel, identifier: d.registry, worksFor: { '@type': 'Hospital', name: site.name } }} />
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Médicos', href: '/medicos' }, { label: full }]} />
          <div className="doctor-hero">
            <span className="avatar avatar-xl" aria-hidden="true">{initials(d.name)}</span>
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
      <section className="section doctor-photos-section" aria-labelledby="fotos-title">
        <div className="container">
          <h2 id="fotos-title" className="sr-only">Fotos de {full}</h2>
          <ul className="doctor-photos">
            {d.photos && d.photos.length > 0 ? (
              d.photos.map((src, i) => (
                <li key={src}>
                  <Image src={src} alt={`${full}, ${d.specialtyLabel} no Hospital São Paulo (foto ${i + 1})`} width={1080} height={1080} sizes="(min-width: 1140px) 1080px, 100vw" priority={i === 0} />
                </li>
              ))
            ) : (
              <li>
                <div className="doctor-photo-placeholder" role="img" aria-label={`Foto de ${full} a inserir`}>
                  <span className="dpp-initials" aria-hidden="true">{initials(d.name)}</span>
                  <span className="dpp-note">Foto do profissional · 1080 × 1080 px<br /><code>public/images/equipe/{d.slug}-1.webp</code></span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </section>
      <section className="section">
        <div className="container with-aside">
          <div className="prose">
            <h2>Sobre</h2>
            <p>Biografia, formação, áreas de interesse, idiomas e dias de atendimento serão publicados após validação com o profissional. <PendingBadge /></p>
            <h2>Especialidades</h2>
            <ul>
              {specs.map((s) => s && <li key={s.slug}><Link href={`/especialidades/${s.slug}`}>{s.name}</Link> — {s.summary}</li>)}
            </ul>
          </div>
          <aside>
            <div className="card is-blue">
              <h2>Atendimento</h2>
              <ul className="icon-list">
                <li><Icon name="pin" size={20} /><span>{site.address.street}, Cacoal</span></li>
                <li><Icon name="calendar" size={20} /><span>Agenda e convênios: confirme com a central <PendingBadge /></span></li>
                <li><Icon name="whatsapp" size={20} /><span>{site.contacts.scheduling.label}</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
