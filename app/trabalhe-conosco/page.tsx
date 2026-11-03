import type { Metadata } from 'next';
import { Icon } from '@/components/ui/Icon';
import { PageHero, PendingBadge } from '@/components/ui/primitives';
import { TrackedButton } from '@/components/ui/Tracked';
import { whatsappLink } from '@/lib/integrations/whatsapp';

export const metadata: Metadata = {
  title: 'Trabalhe conosco, corpo clínico e parceiros',
  description: 'Faça parte da equipe do Hospital São Paulo de Cacoal: vagas, credenciamento de médicos e parcerias institucionais.',
  alternates: { canonical: '/trabalhe-conosco' },
};

const paths = [
  { icon: 'users' as const, title: 'Equipe assistencial e administrativa', text: 'Enfermagem, técnicos, recepção, hotelaria, administrativo e apoio.', cta: 'Enviar currículo' },
  { icon: 'doctor' as const, title: 'Corpo clínico', text: 'Médicos interessados em atender no HBSP: credenciamento, documentação e especialidades de interesse.', cta: 'Quero me credenciar' },
  { icon: 'heart' as const, title: 'Parceiros, doadores e voluntários', text: 'Empresas, instituições e pessoas que querem apoiar um hospital beneficente.', cta: 'Quero apoiar' },
];

export default function TrabalheConoscoPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Trabalhe conosco' }]} eyebrow="Carreiras e parcerias" title="Venha cuidar com a gente" intro="Procuramos pessoas que acreditam que acolher é parte do cuidado." />
      <section className="section">
        <div className="container">
          <ul className="services-grid">
            {paths.map((p) => (
              <li key={p.title}>
                <article className="service-card">
                  <span className="service-icon"><Icon name={p.icon} size={28} /></span>
                  <h2 style={{ fontSize: 'var(--fs-h3)' }}>{p.title}</h2>
                  <p>{p.text}</p>
                  <TrackedButton href={whatsappLink({ intent: p.cta, origin: 'trabalhe-conosco' })} event="submit_contact" params={{ form: 'careers', topic: p.cta }} variant="secondary" size="sm">{p.cta}</TrackedButton>
                </article>
              </li>
            ))}
          </ul>
          <div className="notice" style={{ marginTop: '2rem' }}><Icon name="info" size={20} /><p>Vagas abertas, e-mail de RH e formulário de credenciamento serão integrados ao sistema do hospital. <PendingBadge /></p></div>
        </div>
      </section>
    </>
  );
}
