import type { Metadata } from 'next';
import { EmergencyPanel } from '@/components/sections/HomeSections';
import { FAQList, LocationCard } from '@/components/sections/ContentBlocks';
import { MapConsent } from '@/components/sections/MediaSections';
import { Icon } from '@/components/ui/Icon';
import { PageHero, PendingBadge, SectionHeading } from '@/components/ui/primitives';
import { TrackedButton, TrackView } from '@/components/ui/Tracked';
import { Tooltip } from '@/components/ui/Tooltip';
import { faqs } from '@/lib/data/faq';
import { site } from '@/lib/data/site';

export const metadata: Metadata = {
  title: 'Pronto atendimento',
  description: 'Pronto atendimento do Hospital São Paulo em Cacoal todos os dias. Endereço, rota, telefone, o que levar e quando ligar 192.',
  alternates: { canonical: '/pronto-atendimento' },
};

const levels = [
  { tone: 'alert', title: 'Ligue 192 (SAMU)', when: 'Risco de vida: desmaio, falta de ar intensa, dor forte no peito, sinais de AVC, convulsão, acidente grave.', action: 'Não dirija até o hospital. O SAMU começa o atendimento no local.' },
  { tone: 'blue', title: 'Venha ao pronto atendimento', when: 'Febre alta persistente, dor intensa, cortes, torções, vômitos repetidos, crise de asma leve a moderada.', action: 'Traga documento com foto, cartão do convênio e lista de remédios em uso.' },
  { tone: 'green', title: 'Agende uma consulta', when: 'Sintomas leves e estáveis, acompanhamento de doenças crônicas, check-up, renovação de receitas.', action: 'Use o assistente de agendamento ou fale com a central pelo WhatsApp.' },
];

export default function ProntoAtendimentoPage() {
  return (
    <>
      <TrackView event="view_service" params={{ service_slug: 'pronto-atendimento' }} />
      <PageHero
        tone="alert"
        crumbs={[{ label: 'Pronto atendimento' }]}
        eyebrow="Atendimento todos os dias"
        title="Pronto atendimento HBSP"
        intro={<>Atendimento médico para situações que precisam de avaliação rápida. Funciona todos os dias, no {site.address.street}, Jardim Clodoaldo. <PendingBadge text="horário 24h a validar" /></>}
      >
        <TrackedButton href={site.address.mapsUrl} event="view_location" params={{ origin: 'pa-hero' }} icon="route" size="lg">Traçar rota</TrackedButton>
        <TrackedButton href={`tel:${site.contacts.scheduling.tel}`} event="click_emergency" params={{ origin: 'pa-hero', action: 'call' }} variant="secondary" icon="phone" size="lg">{site.contacts.scheduling.label}</TrackedButton>
        <TrackedButton href="tel:192" event="click_emergency" params={{ origin: 'pa-hero', action: 'samu' }} variant="alert" icon="phone" size="lg">Ligar 192</TrackedButton>
      </PageHero>

      <section className="section" aria-labelledby="where-title">
        <div className="container">
          <SectionHeading id="where-title" eyebrow="Onde buscar ajuda" title="Qual é o lugar certo para o que você sente?" intro={<>Na dúvida, procure atendimento. Esta orientação é geral e não substitui a avaliação de um profissional. <Tooltip content="Os critérios seguem orientações gerais de classificação de risco usadas em serviços de urgência no Brasil. A equipe do pronto atendimento faz a classificação na chegada." label="De onde vêm estes critérios?" /></>} />
          <ol className="journey-steps" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {levels.map((l) => (
              <li key={l.title} className={`card is-${l.tone === 'alert' ? 'alert' : l.tone === 'green' ? 'green' : 'blue'}`}>
                <h3>{l.title}</h3>
                <p><strong>Quando:</strong> {l.when}</p>
                <p>{l.action}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <EmergencyPanel compact />

      <section className="section alt" aria-labelledby="bring-title">
        <div className="container grid-2">
          <div className="prose">
            <h2 id="bring-title">O que levar</h2>
            <ul className="icon-list">
              {['Documento oficial com foto (e certidão para crianças)', 'Cartão do convênio, se houver', 'Lista de remédios em uso e alergias', 'Exames e receitas recentes', 'Um acompanhante, quando possível'].map((t) => (
                <li key={t}><Icon name="check" size={20} /><span>{t}</span></li>
              ))}
            </ul>
            <h2>Como funciona a chegada</h2>
            <ol>
              <li><strong>Recepção:</strong> confirmamos seus dados.</li>
              <li><strong>Classificação de risco:</strong> a enfermagem avalia a gravidade. Casos mais graves são atendidos primeiro, não por ordem de chegada.</li>
              <li><strong>Atendimento médico</strong> e, se necessário, exames ou internação.</li>
              <li><strong>Orientação de alta</strong> por escrito, com sinais de alerta e retorno.</li>
            </ol>
            <div className="notice"><Icon name="info" size={20} /><p>Tempo de espera, especialidades de plantão e convênios aceitos no pronto atendimento serão publicados após validação do hospital.</p></div>
          </div>
          <div>
            <LocationCard />
            <div style={{ marginTop: '1.25rem' }}><MapConsent /></div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="pa-faq">
        <div className="container narrow">
          <SectionHeading id="pa-faq" title="Perguntas frequentes" />
          <FAQList items={faqs.filter((f) => f.topic === 'atendimento')} />
        </div>
      </section>
    </>
  );
}
