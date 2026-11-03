import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DoctorFinder } from '@/components/sections/DoctorFinder';
import { ArticleCard } from '@/components/sections/ContentBlocks';
import { Artwork } from '@/components/ui/Artwork';
import { Icon } from '@/components/ui/Icon';
import { JsonLd, PageHero, PendingBadge } from '@/components/ui/primitives';
import { TrackedButton, TrackView } from '@/components/ui/Tracked';
import { articles } from '@/lib/data/articles';
import { doctorsBySpecialty } from '@/lib/data/doctors';
import { getSpecialty, specialties, specialtyGroups } from '@/lib/data/specialties';
import { whatsappLink } from '@/lib/integrations/whatsapp';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return specialties.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getSpecialty((await params).slug);
  if (!s) return {};
  return { title: `${s.name} em Cacoal`, description: `${s.summary} Agende sua consulta de ${s.name.toLowerCase()} no Hospital São Paulo.`, alternates: { canonical: `/especialidades/${s.slug}` } };
}

export default async function SpecialtyPage({ params }: Props) {
  const s = getSpecialty((await params).slug);
  if (!s) notFound();
  const docs = doctorsBySpecialty(s.slug);
  const related = articles.filter((a) => a.relatedSpecialty === s.slug);
  const siblings = specialties.filter((x) => x.group === s.group && x.slug !== s.slug).slice(0, 6);

  return (
    <>
      <TrackView event="view_service" params={{ service_slug: s.slug }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: s.name, about: { '@type': 'MedicalSpecialty', name: s.name }, lastReviewed: s.updatedAt }} />
      <PageHero
        crumbs={[{ label: 'Especialidades', href: '/especialidades' }, { label: s.name }]}
        eyebrow={specialtyGroups[s.group]}
        title={s.name}
        intro={s.summary}
        art={<Artwork name={s.group === 'mulher-crianca' ? 'pediatria' : s.group === 'cirurgicas' ? 'cirurgia' : s.group === 'diagnostico' ? 'tomografia' : 'equipe'} ratio="4 / 3" />}
      >
        <TrackedButton href={`/agendar?especialidade=${s.slug}&origem=especialidade`} event="click_schedule" params={{ origin: 'specialty', specialty: s.slug }} icon="calendar" size="lg">Agendar consulta</TrackedButton>
        <TrackedButton href={whatsappLink({ intent: `Dúvida ${s.name}`, origin: `especialidade-${s.slug}` })} event="click_whatsapp" params={{ origin: 'specialty', specialty: s.slug }} variant="secondary" icon="whatsapp" size="lg">Tirar dúvida</TrackedButton>
      </PageHero>

      <section className="section">
        <div className="container with-aside">
          <div className="prose">
            <h2>Quando procurar {s.name.toLowerCase()}</h2>
            <ul>{s.whenToSeek.map((w) => <li key={w}>{w}</li>)}</ul>
            <div className="notice"><Icon name="info" size={20} /><p>Texto de caráter geral, em revisão pelo corpo clínico. Não substitui uma consulta. <PendingBadge text="revisão médica" /></p></div>
            <h2>Profissionais</h2>
          </div>
          <aside>
            <div className="card is-green">
              <h2>Como agendar</h2>
              <ol className="prose" style={{ paddingLeft: '1.1rem' }}>
                <li>Escolha a especialidade e o período no assistente.</li>
                <li>Abrimos o WhatsApp da central com a mensagem pronta.</li>
                <li>A central confirma data, horário e convênio.</li>
              </ol>
              <Link href={`/agendar?especialidade=${s.slug}`} className="btn btn-primary btn-sm">Começar agora</Link>
            </div>
          </aside>
        </div>
        <div className="container">
          {docs.length ? <DoctorFinder initialSpecialty={s.slug} /> : (
            <div className="empty"><p><strong>Lista de profissionais em atualização.</strong></p><p>A central informa os médicos disponíveis para {s.name.toLowerCase()}.</p><Link href={`/agendar?especialidade=${s.slug}`} className="btn btn-primary btn-sm">Falar com a central</Link></div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section alt">
          <div className="container">
            <h2>Conteúdos relacionados</h2>
            <ul className="article-grid">{related.map((a) => <li key={a.slug}><ArticleCard a={a} /></li>)}</ul>
          </div>
        </section>
      )}

      <section className="section tight">
        <div className="container">
          <h2 style={{ fontSize: '1.375rem' }}>Outras especialidades da área</h2>
          <ul className="spec-grid">
            {siblings.map((x) => (
              <li key={x.slug}><Link href={`/especialidades/${x.slug}`} className="spec-card"><span className="spec-dot" aria-hidden="true">{x.name[0]}</span><span><strong>{x.name}</strong><span>{x.summary}</span></span></Link></li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
