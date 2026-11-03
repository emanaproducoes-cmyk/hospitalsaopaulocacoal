import Link from 'next/link';
import type { Article, FAQ } from '@/lib/domain/types';
import { articleIntents } from '@/lib/data/articles';
import { Artwork } from '@/components/ui/Artwork';
import { Icon } from '@/components/ui/Icon';
import { PendingBadge } from '@/components/ui/primitives';
import { site } from '@/lib/data/site';

const fmt = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export function ArticleCard({ a }: { a: Article }) {
  return (
    <article className="article-card">
      <Link href={`/conteudo/${a.slug}`} className="article-link">
        <Artwork name={a.image} ratio="16 / 10" showTag={false} />
        <div className="article-body">
          <p className="article-intent">{articleIntents[a.intent]}</p>
          <h3>{a.title}</h3>
          <p>{a.excerpt}</p>
          <p className="article-meta"><Icon name="clock" size={14} /> {a.readingMinutes} min de leitura · {fmt(a.publishedAt)}</p>
        </div>
      </Link>
    </article>
  );
}

export function FAQList({ items }: { items: FAQ[] }) {
  return (
    <div className="faq">
      {items.map((f, i) => (
        <details key={i} className="faq-item">
          <summary>
            <span>{f.question}</span>
            <span className="faq-icon" aria-hidden="true"><Icon name="plus" size={18} /></span>
          </summary>
          <div className="faq-answer">
            <p>{f.answer} {f.pendingValidation && <PendingBadge />}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function LocationCard() {
  return (
    <div className="location-card">
      <h3>Hospital São Paulo · Cacoal</h3>
      <ul className="loc-list">
        <li><Icon name="pin" size={20} /><span>{site.address.street} – {site.address.district}<br />{site.address.city} – {site.address.state} · CEP {site.address.zip}</span></li>
        <li><Icon name="clock" size={20} /><span>Pronto atendimento: todos os dias <PendingBadge text="horário a validar" /></span></li>
        <li><Icon name="whatsapp" size={20} /><span>Central e agendamentos: <a href={`tel:${site.contacts.scheduling.tel}`}>{site.contacts.scheduling.label}</a></span></li>
        <li><Icon name="child" size={20} /><span>Plantão pediátrico: <a href={`tel:${site.contacts.pediatricOnCall.tel}`}>{site.contacts.pediatricOnCall.label}</a></span></li>
      </ul>
      <a href={site.address.mapsUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer"><Icon name="route" size={20} /> Traçar rota no mapa<span className="sr-only"> (abre em nova aba)</span></a>
    </div>
  );
}
