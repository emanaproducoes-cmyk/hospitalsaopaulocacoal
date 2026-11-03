import type { Metadata } from 'next';
import { ArticleCard } from '@/components/sections/ContentBlocks';
import { PageHero } from '@/components/ui/primitives';
import { articleIntents, articles } from '@/lib/data/articles';

export const metadata: Metadata = {
  title: 'Conteúdo e saúde',
  description: 'Prevenção, gestação e infância, exames e comunidade: conteúdos de saúde em linguagem simples do Hospital São Paulo de Cacoal.',
  alternates: { canonical: '/conteudo' },
};

export default function ConteudoPage() {
  const intents = Object.entries(articleIntents).filter(([k]) => articles.some((a) => a.intent === k));
  return (
    <>
      <PageHero crumbs={[{ label: 'Conteúdo e saúde' }]} eyebrow="Conteúdo e saúde" title="Informação clara para decisões mais seguras" intro="Organizamos os conteúdos pelo que você precisa entender — não apenas pela data. Todo texto passa por revisão de um profissional de saúde." />
      {intents.map(([k, label], i) => (
        <section key={k} className={`section ${i % 2 ? 'alt' : ''}`} aria-labelledby={`int-${k}`}>
          <div className="container">
            <h2 id={`int-${k}`}>{label}</h2>
            <ul className="article-grid">
              {articles.filter((a) => a.intent === k).map((a) => <li key={a.slug}><ArticleCard a={a} /></li>)}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}
