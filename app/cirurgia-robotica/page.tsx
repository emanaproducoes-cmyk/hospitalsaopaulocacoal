import type { Metadata } from 'next';
import { RoboticSurgery } from '@/components/sections/RoboticSurgery';
import { Breadcrumbs } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Cirurgia robótica em Cacoal',
  description: 'Cirurgia robótica no Hospital São Paulo de Cacoal: mais precisão, visão ampliada e recuperação mais tranquila. Entenda como funciona e agende sua avaliação.',
  alternates: { canonical: '/cirurgia-robotica' },
  openGraph: { title: 'Cirurgia robótica no Hospital São Paulo de Cacoal', description: 'Tecnologia que transforma a cirurgia. Cuidado que continua humano.', images: [{ url: '/images/og/cirurgia-robotica.jpg', width: 1200, height: 630 }] },
};

export default function RoboticPage() {
  return (
    <>
      <div className="robotic-crumbs">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Atendimento', href: '/pronto-atendimento' }, { label: 'Cirurgia robótica' }]} />
        </div>
      </div>
      <RoboticSurgery headingLevel={1} showPageLink={false} />
    </>
  );
}
