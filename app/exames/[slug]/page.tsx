import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Artwork } from '@/components/ui/Artwork';
import { Icon } from '@/components/ui/Icon';
import { JsonLd, PageHero } from '@/components/ui/primitives';
import { TrackedButton, TrackView } from '@/components/ui/Tracked';
import { examCategories, exams, getExam } from '@/lib/data/exams';
import { whatsappLink } from '@/lib/integrations/whatsapp';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return exams.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = getExam((await params).slug);
  if (!e) return {};
  return { title: `${e.name}: preparo e agendamento`, description: `${e.summary} Veja documentos, preparo e como agendar no Hospital São Paulo de Cacoal.`, alternates: { canonical: `/exames/${e.slug}` } };
}

export default async function ExamPage({ params }: Props) {
  const e = getExam((await params).slug);
  if (!e) notFound();
  return (
    <>
      <TrackView event="view_exam_prep" params={{ exam_slug: e.slug }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: e.name, about: { '@type': 'MedicalTest', name: e.name }, lastReviewed: e.updatedAt }} />
      <PageHero
        crumbs={[{ label: 'Exames', href: '/exames' }, { label: e.name }]}
        eyebrow={examCategories[e.category]}
        title={e.name}
        intro={e.summary}
        art={<Artwork name={({ 'tomografia-computadorizada': 'tomografia-paciente', radiografia: 'raio-x', 'endoscopia-digestiva': 'consulta', 'exames-laboratoriais': 'laboratorio', ecocardiograma: 'ultrassom' } as Record<string, string>)[e.slug] ?? 'tomografia'} ratio="4 / 3" />}
      >
        <TrackedButton href={`/agendar?tipo=exame&exame=${e.slug}&origem=exame`} event="click_schedule" params={{ origin: 'exam', type: 'exame' }} icon="calendar" size="lg">Agendar exame</TrackedButton>
        <TrackedButton href={whatsappLink({ intent: `Preparo ${e.name}`, origin: `exame-${e.slug}`, text: `Olá! Tenho uma dúvida sobre o preparo do exame: ${e.name}.` })} event="click_whatsapp" params={{ origin: 'exam' }} variant="secondary" icon="whatsapp" size="lg">Dúvida sobre preparo</TrackedButton>
      </PageHero>
      <section className="section">
        <div className="container with-aside">
          <div className="prose">
            <h2>O que é</h2>
            <p>{e.whatIsIt}</p>
            <h2 id="preparo">Preparo</h2>
            {e.preparation ? (
              <ul>{e.preparation.map((p) => <li key={p}>{p}</li>)}</ul>
            ) : (
              <div className="notice"><Icon name="info" size={20} /><p>O preparo varia conforme o pedido médico e o tipo de exame (com ou sem contraste, com ou sem sedação). <strong>A central informa o preparo completo no momento do agendamento.</strong></p></div>
            )}
            <h2>Duração</h2>
            <p>{e.duration ?? 'Informada no agendamento, conforme o tipo de exame.'}</p>
            <h2>Valores e orçamento</h2>
            <p>Para atendimento particular, solicite um orçamento à central. Para convênios, a central confirma a cobertura antes do exame.</p>
          </div>
          <aside>
            <div className="card is-green">
              <h2>Documentos</h2>
              <ul className="icon-list">{e.documents.map((d) => <li key={d}><Icon name="check" size={20} /><span>{d}</span></li>)}</ul>
            </div>
            <div className="card">
              <h2>Avise a equipe se</h2>
              <ul className="icon-list">
                {['Estiver grávida ou com suspeita de gravidez', 'Tiver alergias (inclusive a contraste)', 'Tiver problemas nos rins', 'Usar remédios contínuos'].map((t) => <li key={t}><Icon name="info" size={20} /><span>{t}</span></li>)}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
