import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/primitives';
import { NpsAuto } from '@/components/patient/NpsAuto';

export const metadata: Metadata = {
  title: 'Avalie seu atendimento',
  description: 'Conte como foi seu atendimento no Hospital São Paulo de Cacoal. Leva menos de um minuto.',
  alternates: { canonical: '/avaliar' },
  robots: { index: false, follow: false },
};

export default function RatePage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Avaliar atendimento' }]} />
          <p className="eyebrow">Sua opinião</p>
          <h1>Como foi seu atendimento?</h1>
          <p className="lead">Leva menos de um minuto. Para relatar um problema com detalhes, use a ouvidoria.</p>
        </div>
      </section>
      <section className="section">
        <div className="container narrow"><div className="card"><NpsAuto /></div></div>
      </section>
    </>
  );
}
