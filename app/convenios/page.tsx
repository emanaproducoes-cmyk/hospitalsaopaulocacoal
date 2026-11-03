import type { Metadata } from 'next';
import { Icon } from '@/components/ui/Icon';
import { PageHero, PendingBadge } from '@/components/ui/primitives';
import { TrackedButton } from '@/components/ui/Tracked';
import { whatsappLink } from '@/lib/integrations/whatsapp';

export const metadata: Metadata = {
  title: 'Convênios e atendimento particular',
  description: 'Formas de atendimento no Hospital São Paulo de Cacoal: convênios e particular. Confirme a cobertura antes de agendar.',
  alternates: { canonical: '/convenios' },
};

export default function ConveniosPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Convênios e particular' }]} eyebrow="Formas de atendimento" title="Convênios e atendimento particular" intro="Transparência antes do atendimento: confirme a cobertura do seu plano ou peça um orçamento particular.">
        <TrackedButton href={whatsappLink({ intent: 'Convênio', origin: 'convenios', text: 'Olá! Quero confirmar se meu convênio é aceito. Meu plano é: ' })} event="click_whatsapp" params={{ origin: 'insurance' }} icon="whatsapp" size="lg">Confirmar meu convênio</TrackedButton>
      </PageHero>
      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <h2><Icon name="shield" size={22} /> Convênios aceitos</h2>
            <p>A lista oficial de operadoras, planos e serviços cobertos está sendo atualizada com o hospital. <PendingBadge /></p>
            <p>Enquanto isso, a central confirma a cobertura pelo WhatsApp antes de marcar sua consulta ou exame.</p>
          </div>
          <div className="card is-green">
            <h2><Icon name="file" size={22} /> Atendimento particular</h2>
            <p>Consultas, exames e procedimentos podem ser feitos de forma particular. Solicite um orçamento: a central informa valores, formas de pagamento e o que está incluído.</p>
          </div>
          <div className="card is-blue">
            <h2><Icon name="users" size={22} /> Empresas e parcerias</h2>
            <p>Empresas e operadoras interessadas em parcerias podem falar com a área de relacionamento institucional pelo formulário de contato.</p>
          </div>
          <div className="card">
            <h2><Icon name="info" size={22} /> Dica</h2>
            <p>Antes de qualquer procedimento, verifique com o seu plano se é necessária autorização prévia (guia). Isso evita atrasos no dia do atendimento.</p>
          </div>
        </div>
      </section>
    </>
  );
}
