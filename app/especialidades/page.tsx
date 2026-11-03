import type { Metadata } from 'next';
import { SpecialtyExplorer } from '@/components/sections/SpecialtyExplorer';
import { PageHero } from '@/components/ui/primitives';
import { TrackedButton } from '@/components/ui/Tracked';
import { specialties } from '@/lib/data/specialties';

export const metadata: Metadata = {
  title: 'Especialidades',
  description: `Conheça as ${specialties.length} especialidades do Hospital São Paulo de Cacoal e agende sua consulta.`,
  alternates: { canonical: '/especialidades' },
};

export default function EspecialidadesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Especialidades' }]}
        eyebrow="Especialidades e médicos"
        title="Encontre a especialidade certa para você"
        intro="Explique o que você sente em poucas palavras ou navegue pelas áreas. Se ainda tiver dúvida, a central orienta."
      >
        <TrackedButton href="/medicos" event="search_doctor" params={{ origin: 'specialties-hero' }} icon="doctor">Buscar um médico</TrackedButton>
        <TrackedButton href="/agendar?especialidade=nao-sei&origem=especialidades" event="click_schedule" params={{ origin: 'specialties-hero' }} variant="secondary">Não sei qual escolher</TrackedButton>
      </PageHero>
      <section className="section">
        <div className="container">
          <SpecialtyExplorer />
        </div>
      </section>
    </>
  );
}
