import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/sections/ContentBlocks';
import { ArticleProgress } from '@/components/sections/ArticleProgress';
import { asset } from '@/lib/asset';
import { Icon } from '@/components/ui/Icon';
import { Breadcrumbs, JsonLd } from '@/components/ui/primitives';
import { TrackedButton } from '@/components/ui/Tracked';
import { articleIntents, articles, getArticle } from '@/lib/data/articles';
import { site } from '@/lib/data/site';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getArticle((await params).slug);
  if (!a) return {};
  return { title: a.title, description: a.excerpt, alternates: { canonical: `/conteudo/${a.slug}` }, openGraph: { type: 'article', title: a.title, description: a.excerpt, publishedTime: a.publishedAt, images: [{ url: `/images/og/${a.slug}.jpg`, width: 1200, height: 630, alt: a.title }] }, twitter: { card: 'summary_large_image', title: a.title, description: a.excerpt, images: [`/images/og/${a.slug}.jpg`] } };
}

const fmt = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export default async function ArticlePage({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const more = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  return (
    <>
      <ArticleProgress slug={a.slug} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, datePublished: a.publishedAt, dateModified: a.updatedAt, author: { '@type': 'Organization', name: site.name }, publisher: { '@type': 'Organization', name: site.name } }} />
      <article>
        <header className="page-hero">
          <div className="container narrow">
            <Breadcrumbs items={[{ label: 'Conteúdo', href: '/conteudo' }, { label: a.title }]} />
            <p className="eyebrow">{articleIntents[a.intent]}</p>
            <h1>{a.title}</h1>
            <p className="lead">{a.excerpt}</p>
            <div className="meta-row">
              <span><Icon name="users" size={16} /> {a.author}</span>
              <span><Icon name="calendar" size={16} /> Publicado em {fmt(a.publishedAt)}</span>
              <span><Icon name="clock" size={16} /> {a.readingMinutes} min de leitura</span>
            </div>
          </div>
        </header>
        <div className="container narrow section tight">
          <figure className="article-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(`${a.cover ?? a.image}.webp`)} alt={a.title} width={1600} height={1000} />
          </figure>
          <div className="prose" style={{ marginTop: '2rem' }}>
            {a.body.map((b, i) => (
              <div key={i}>
                {b.heading && <h2>{b.heading}</h2>}
                {b.text && <p>{b.text}</p>}
                {b.list && <ul>{b.list.map((li) => <li key={li}>{li}</li>)}</ul>}
                {b.callout && <p className="callout"><Icon name="info" size={20} /> <span>{b.callout}</span></p>}
              </div>
            ))}
            {a.sources && a.sources.length > 0 && (
              <div className="article-sources">
                <h2>Fontes</h2>
                <ul>
                  {a.sources.map((src) => (
                    <li key={src.label}>{src.url ? <a href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a> : src.label}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="card is-blue article-cta">
            <h2>Próximo passo</h2>
            <p>Converse com um profissional sobre o seu caso.</p>
            <TrackedButton href={a.cta.href} event="content_engagement" params={{ article_slug: a.slug, action: 'cta' }} iconRight="arrow-right">{a.cta.label}</TrackedButton>
          </div>
          <p className="disclaimer">Este conteúdo é informativo e não substitui uma consulta. Em caso de urgência, procure o <Link href="/pronto-atendimento">pronto atendimento</Link>. Última atualização: {fmt(a.updatedAt)}.</p>
        </div>
      </article>
      <section className="section alt">
        <div className="container">
          <h2>Continue lendo</h2>
          <ul className="article-grid">{more.map((x) => <li key={x.slug}><ArticleCard a={x} /></li>)}</ul>
        </div>
      </section>
    </>
  );
}
