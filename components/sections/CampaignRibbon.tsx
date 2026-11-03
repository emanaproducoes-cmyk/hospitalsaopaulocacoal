import Link from 'next/link';
import { activeCampaign } from '@/lib/data/articles';

/** Faixa sazonal com publicação e expiração controladas por data (lib/data/articles.ts → campaigns). */
export function CampaignRibbon() {
  const c = activeCampaign();
  if (!c) return null;
  return (
    <div className="campaign-ribbon">
      <div className="container">
        <span className="campaign-dot" aria-hidden="true" />
        <span className="cr-long">{c.headline}</span>
        <span className="cr-short">{c.title}: cuide da sua saúde.</span>
        <Link href={`/campanhas/${c.slug}?utm_source=site&utm_medium=ribbon&utm_campaign=${c.utmCampaign}`}>Saiba mais<span className="sr-only"> sobre {c.title}</span></Link>
      </div>
    </div>
  );
}
