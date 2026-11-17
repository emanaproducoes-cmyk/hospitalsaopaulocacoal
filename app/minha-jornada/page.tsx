import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/primitives';
import { MyJourney } from '@/components/patient/MyJourney';

export const metadata: Metadata = {
  title: 'Minha jornada',
  description: 'Acompanhe seus pedidos de agendamento, lembretes, preparo de exames e avalie seu atendimento no Hospital São Paulo de Cacoal.',
  alternates: { canonical: '/minha-jornada' },
  robots: { index: false, follow: true },
};

export default function MyJourneyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Pacientes', href: '/pacientes-e-acompanhantes' }, { label: 'Minha jornada' }]} />
          <p className="eyebrow">Autoatendimento</p>
          <h1>Minha jornada</h1>
          <p className="lead">Seus pedidos, lembretes e próximos passos em um lugar só, guardados apenas neste aparelho.</p>
        </div>
      </section>
      <section className="section">
        <div className="container narrow">
          <MyJourney />
        </div>
      </section>
    </>
  );
}
