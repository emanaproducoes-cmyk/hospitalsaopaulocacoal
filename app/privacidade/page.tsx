import type { Metadata } from 'next';
import { CookieSettingsButton } from '@/components/layout/CookieConsent';
import { PageHero, PendingBadge } from '@/components/ui/primitives';
import { site } from '@/lib/data/site';

export const metadata: Metadata = {
  title: 'Privacidade, cookies e LGPD',
  description: 'Como o Hospital São Paulo de Cacoal trata seus dados pessoais, cookies e seus direitos como titular (LGPD).',
  alternates: { canonical: '/privacidade' },
};

export default function PrivacidadePage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Privacidade' }]} eyebrow="LGPD" title="Privacidade e proteção de dados" intro={<>Versão {site.policyVersion}. Minuta para revisão jurídica do hospital. <PendingBadge text="revisão jurídica" /></>} />
      <section className="section">
        <div className="container narrow prose">
          <h2>1. Quais dados coletamos no site</h2>
          <ul>
            <li><strong>Formulários de agendamento e contato:</strong> nome, telefone, e-mail (opcional) e a mensagem que você escrever.</li>
            <li><strong>Medição de uso (somente com seu consentimento):</strong> páginas visitadas e cliques em botões, sem identificação pessoal.</li>
          </ul>
          <p>O site <strong>não solicita</strong> dados de saúde. Pedimos que você não informe sintomas, diagnósticos ou resultados de exames nos formulários.</p>
          <h2>2. Para que usamos</h2>
          <ul>
            <li>Retornar seu pedido de agendamento ou mensagem (base legal: consentimento e procedimentos preliminares a pedido do titular).</li>
            <li>Melhorar a experiência do site (base legal: consentimento).</li>
            <li>Atender obrigações legais e regulatórias.</li>
          </ul>
          <h2>3. Compartilhamento</h2>
          <p>Seus dados não são vendidos. Podem ser tratados por fornecedores que nos ajudam a operar o site e o atendimento (hospedagem, WhatsApp, CRM), sob contrato e com as mesmas garantias.</p>
          <h2 id="cookies">4. Cookies</h2>
          <p>Usamos cookies necessários (para o site funcionar) e, se você permitir, cookies de medição e de campanhas. Você pode mudar sua escolha a qualquer momento: <CookieSettingsButton /></p>
          <p>O mapa do Google só é carregado quando você clica em &quot;Carregar mapa&quot;.</p>
          <h2>5. Seus direitos</h2>
          <p>Você pode pedir confirmação, acesso, correção, anonimização, portabilidade, eliminação dos dados e revogação do consentimento, conforme o art. 18 da LGPD (Lei 13.709/2018).</p>
          <h2>6. Encarregado (DPO)</h2>
          <p>Nome e canal de contato do encarregado de dados: <PendingBadge /></p>
          <h2>7. Retenção e segurança</h2>
          <p>Mantemos os dados apenas pelo tempo necessário à finalidade e adotamos medidas técnicas como criptografia em trânsito (HTTPS), controle de acesso e registros de auditoria.</p>
        </div>
      </section>
    </>
  );
}
