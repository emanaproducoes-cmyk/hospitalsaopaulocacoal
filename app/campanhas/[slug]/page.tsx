import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Artwork } from '@/components/ui/Artwork';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/primitives';
import { TrackedButton } from '@/components/ui/Tracked';
import { campaigns } from '@/lib/data/articles';
import { whatsappLink } from '@/lib/integrations/whatsapp';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return campaigns.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const c = campaigns.find((x) => x.slug === slug);
  return c ? { title: c.title, description: c.text, alternates: { canonical: `/campanhas/${c.slug}` } } : {};
}

/** Landing page de campanha (destino de anúncios e posts com UTM). */
export default async function CampaignPage({ params }: Props) {
  const slug = (await params).slug;
  const camp = campaigns.find((x) => x.slug === slug);
  if (!camp) notFound();
  const origin = `campanha-${camp.slug}`;
  return (
    <>
      <PageHero crumbs={[{ label: 'Campanhas' }, { label: camp.title }]} eyebrow={`Campanha · até ${new Date(camp.endsAt + 'T12:00:00').toLocaleDateString('pt-BR')}`} title={camp.headline} intro="O câncer de próstata é o tipo mais comum entre homens brasileiros, depois do câncer de pele não melanoma. Conversar com o urologista é o primeiro passo para decidir, com informação, sobre os exames certos para você." art={<Artwork name="campanha-azul" ratio="4 / 3" />}>
        <TrackedButton href={`/agendar?especialidade=urologia&origem=${origin}`} event="click_schedule" params={{ origin, specialty: 'urologia' }} icon="calendar" size="lg">Agendar com a urologia</TrackedButton>
        <TrackedButton href={whatsappLink({ intent: 'Novembro Azul', origin })} event="click_whatsapp" params={{ origin }} variant="secondary" icon="whatsapp" size="lg">Tirar dúvidas</TrackedButton>
      </PageHero>
      <section className="section">
        <div className="container grid-2">
          <div className="prose">
            <h2>Cuidar da saúde é para todos os homens</h2>
            <ul className="icon-list">
              {['Pressão arterial, glicose e colesterol em dia', 'Conversa com o urologista sobre histórico familiar', 'Saúde mental: falar sobre o que sente também é cuidado', 'Atividade física e alimentação equilibrada'].map((t) => <li key={t}><Icon name="check" size={20} /><span>{t}</span></li>)}
            </ul>
            <p><Link href="/conteudo/novembro-azul">Leia o conteúdo completo sobre Novembro Azul</Link>.</p>
          </div>
          <div className="card is-blue">
            <h2>Como funciona</h2>
            <ol className="prose" style={{ paddingLeft: '1.1rem' }}>
              <li>Escolha o período no assistente de agendamento.</li>
              <li>A central confirma a consulta pelo WhatsApp.</li>
              <li>Na consulta, o médico avalia e orienta sobre exames.</li>
            </ol>
            <p className="source-note">Fonte do dado epidemiológico: Instituto Nacional de Câncer (INCA).</p>
          </div>
        </div>
        <div className="container" style={{ marginTop: '3rem' }}>
          <div className="empty">
            <p><strong>Urologistas do HBSP</strong></p>
            <p>A lista de profissionais de urologia está sendo atualizada. A central indica o profissional e o melhor horário para você.</p>
            <Link href={`/agendar?especialidade=urologia&origem=${origin}`} className="btn btn-primary btn-sm">Agendar com a urologia</Link>
          </div>
        </div>
      </section>
    </>
  );
}
