import type { Metadata } from 'next';
import { DoctorFinder } from '@/components/sections/DoctorFinder';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Encontre um médico',
  description: 'Busque médicos do Hospital São Paulo de Cacoal por nome ou especialidade e confira o registro profissional (CRM/RQE).',
  alternates: { canonical: '/medicos' },
};

export default function MedicosPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Médicos' }]} eyebrow="Corpo clínico" title="Encontre um médico" intro="Busque por nome ou especialidade. Todo perfil mostra o registro no conselho profissional para você conferir." />
      <section className="section">
        <div className="container">
          <div className="notice" style={{ marginBottom: '2rem' }}>
            <Icon name="info" size={20} />
            <p>Exibimos os profissionais publicados no site atual do hospital. A lista completa do corpo clínico, com convênios e agenda, será integrada ao sistema do HBSP.</p>
          </div>
          <DoctorFinder />
        </div>
      </section>
    </>
  );
}
