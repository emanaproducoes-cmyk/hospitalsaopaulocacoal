import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/primitives';
import { TrackedButton } from '@/components/ui/Tracked';
import { examCategories, exams } from '@/lib/data/exams';
import type { IconName } from '@/lib/domain/types';

export const metadata: Metadata = {
  title: 'Exames e diagnóstico',
  description: 'Tomografia, raio X, endoscopia, ecocardiograma e exames laboratoriais no Hospital São Paulo de Cacoal. Veja preparo e documentos.',
  alternates: { canonical: '/exames' },
};

const catIcon: Record<string, IconName> = { imagem: 'scan', laboratorio: 'lab', cardiologico: 'heart', endoscopia: 'microscope' };

export default function ExamesPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Exames' }]} eyebrow="Exames e diagnóstico" title="Prepare-se para o seu exame" intro="Entenda como cada exame funciona, o que levar e como se preparar. Depois, agende com a central.">
        <TrackedButton href="/agendar?tipo=exame&origem=exames" event="click_schedule" params={{ origin: 'exams-hero', type: 'exame' }} icon="calendar" size="lg">Agendar exame</TrackedButton>
      </PageHero>
      <section className="section">
        <div className="container">
          <ul className="services-grid">
            {exams.map((e) => (
              <li key={e.slug}>
                <article className="service-card">
                  <span className="service-icon"><Icon name={catIcon[e.category]} size={28} /></span>
                  <p className="article-intent">{examCategories[e.category]}</p>
                  <h2 style={{ fontSize: 'var(--fs-h3)' }}>{e.name}</h2>
                  <p>{e.summary}</p>
                  <Link href={`/exames/${e.slug}`} className="text-link">Ver preparo do exame <Icon name="arrow-right" size={16} /></Link>
                </article>
              </li>
            ))}
          </ul>
          <p className="source-note" style={{ marginTop: '1.5rem' }}>Lista baseada nos exames citados publicamente pelo hospital. Outros exames podem estar disponíveis — consulte a central.</p>
        </div>
      </section>
    </>
  );
}
