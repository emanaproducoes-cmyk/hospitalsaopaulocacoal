import type { Metadata } from 'next';
import { ScheduleWizard } from '@/components/forms/ScheduleWizard';
import { Icon } from '@/components/ui/Icon';
import { Breadcrumbs } from '@/components/ui/primitives';
import { site } from '@/lib/data/site';

export const metadata: Metadata = {
  title: 'Agendar consulta ou exame',
  description: 'Agende consulta, exame ou retorno no Hospital São Paulo de Cacoal em 4 passos. Confirmação pela central no WhatsApp.',
  alternates: { canonical: '/agendar' },
};

export default function AgendarPage() {
  return (
    <section className="section schedule-page">
      <div className="container with-aside">
        <div>
          <Breadcrumbs items={[{ label: 'Agendar' }]} />
          <p className="eyebrow">Agendamento</p>
          <h1 style={{ fontSize: 'clamp(2rem, 1.4rem + 2.4vw, 3rem)' }}>Agende em 4 passos</h1>
          <p className="lead" style={{ marginBottom: '2rem' }}>Escolha o que precisa e o melhor período. A central confirma data, horário e cobertura do convênio com você.</p>
          <ScheduleWizard />
        </div>
        <aside aria-label="Outras formas de agendar">
          <div className="card is-blue">
            <h2>Prefere falar com alguém?</h2>
            <p>A central de agendamentos atende pelo WhatsApp e telefone.</p>
            <ul className="icon-list">
              <li><Icon name="whatsapp" size={20} /><span><a href={`https://wa.me/${site.contacts.scheduling.whatsapp}`} target="_blank" rel="noopener noreferrer">{site.contacts.scheduling.label}</a></span></li>
              <li><Icon name="phone" size={20} /><span><a href={`tel:${site.contacts.scheduling.tel}`}>Ligar para a central</a></span></li>
            </ul>
          </div>
          <div className="card">
            <h2>O que ter em mãos</h2>
            <ul className="icon-list">
              <li><Icon name="file" size={20} /><span>Pedido médico (para exames)</span></li>
              <li><Icon name="shield" size={20} /><span>Cartão do convênio, se houver</span></li>
              <li><Icon name="calendar" size={20} /><span>Dias e horários de preferência</span></li>
            </ul>
          </div>
          <div className="card is-alert">
            <h2>É urgente?</h2>
            <p>Não agende. Venha ao pronto atendimento ou, se houver risco de vida, ligue 192.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
