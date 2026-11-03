import type { Metadata } from 'next';
import { JourneyTabs } from '@/components/sections/JourneyTabs';
import { FAQList } from '@/components/sections/ContentBlocks';
import { Icon } from '@/components/ui/Icon';
import { PageHero, PendingBadge, SectionHeading } from '@/components/ui/primitives';
import { TrackedButton } from '@/components/ui/Tracked';
import { faqs } from '@/lib/data/faq';

export const metadata: Metadata = {
  title: 'Pacientes e acompanhantes',
  description: 'Guia para pacientes e famílias: documentos, internação, visitas, acompanhantes, alta e retorno no Hospital São Paulo de Cacoal.',
  alternates: { canonical: '/pacientes-e-acompanhantes' },
};

export default function PacientesPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Pacientes e acompanhantes' }]} eyebrow="Guia para a família" title="Tudo o que você precisa saber, em um só lugar" intro="Documentos, internação, visitas, alta e retorno — explicados de forma simples para quem está cuidando de alguém.">
        <TrackedButton href="/servicos/internacao" event="view_service" params={{ origin: 'guide-hero', service_slug: 'internacao' }} icon="bed" size="lg">Entender a internação</TrackedButton>
        <TrackedButton href="/contato" event="view_location" params={{ origin: 'guide-hero' }} variant="secondary" icon="route" size="lg">Como chegar</TrackedButton>
      </PageHero>

      <section className="section">
        <div className="container"><JourneyTabs /></div>
      </section>

      <section className="section alt" id="documentos">
        <div className="container grid-2">
          <div className="card">
            <h2><Icon name="file" size={22} /> Documentos</h2>
            <ul className="icon-list">
              {['Documento oficial com foto do paciente (certidão de nascimento para crianças)', 'Documento do responsável legal, quando for o caso', 'Cartão do convênio ou guia de autorização', 'Pedido médico, exames e receitas recentes', 'Lista de remédios em uso e alergias'].map((t) => <li key={t}><Icon name="check" size={20} /><span>{t}</span></li>)}
            </ul>
          </div>
          <div className="card">
            <h2><Icon name="users" size={22} /> Visitas e acompanhantes</h2>
            <p>Têm direito a acompanhante: crianças e adolescentes (ECA), idosos (Estatuto da Pessoa Idosa), gestantes no parto e pós-parto e pessoas com deficiência.</p>
            <p>Horários de visita, número de visitantes e regras de troca de acompanhante: <PendingBadge text="a validar com o hospital" /></p>
            <ul className="icon-list">
              <li><Icon name="shield" size={20} /><span>Higienize as mãos ao entrar e sair do quarto.</span></li>
              <li><Icon name="info" size={20} /><span>Evite visitar se estiver gripado ou com febre.</span></li>
            </ul>
          </div>
          <div className="card">
            <h2><Icon name="hotel" size={22} /> O que levar para a internação</h2>
            <ul className="icon-list">
              {['Itens de higiene pessoal', 'Roupas confortáveis e chinelo antiderrapante', 'Carregador de celular', 'Evite joias e objetos de valor'].map((t) => <li key={t}><Icon name="check" size={20} /><span>{t}</span></li>)}
            </ul>
          </div>
          <div className="card">
            <h2><Icon name="calendar" size={22} /> Alta e retorno</h2>
            <p>Na alta você recebe orientações por escrito: remédios, cuidados em casa, sinais de alerta e data de retorno. Guarde esse documento e leve-o na próxima consulta.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <SectionHeading title="Perguntas frequentes" />
          <FAQList items={faqs.filter((f) => f.topic === 'internacao')} />
        </div>
      </section>
    </>
  );
}
