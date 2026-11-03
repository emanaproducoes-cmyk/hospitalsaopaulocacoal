import type { Metadata } from 'next';
import { FAQList } from '@/components/sections/ContentBlocks';
import { JsonLd, PageHero } from '@/components/ui/primitives';
import { faqs } from '@/lib/data/faq';

export const metadata: Metadata = {
  title: 'Perguntas frequentes',
  description: 'Respostas sobre pronto atendimento, agendamento, convênios, internação e privacidade no Hospital São Paulo de Cacoal.',
  alternates: { canonical: '/perguntas-frequentes' },
};

const topics: Record<string, string> = { atendimento: 'Atendimento', agendamento: 'Agendamento', convenios: 'Convênios', internacao: 'Internação e visitas', privacidade: 'Privacidade' };

export default function FAQPage() {
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }} />
      <PageHero crumbs={[{ label: 'Perguntas frequentes' }]} eyebrow="Ajuda" title="Perguntas frequentes" intro="Não encontrou sua dúvida? Fale com a central pelo WhatsApp." />
      <section className="section">
        <div className="container narrow">
          {Object.entries(topics).map(([k, label]) => (
            <section key={k} style={{ marginBottom: '2.5rem' }} aria-labelledby={`faq-${k}`}>
              <h2 id={`faq-${k}`} style={{ fontSize: '1.375rem' }}>{label}</h2>
              <FAQList items={faqs.filter((f) => f.topic === k)} />
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
