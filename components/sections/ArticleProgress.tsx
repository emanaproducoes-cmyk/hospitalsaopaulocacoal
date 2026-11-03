'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/integrations/analytics';

/** Barra de progresso de leitura + evento content_engagement a 75%. */
export function ArticleProgress({ slug }: { slug: string }) {
  const [p, setP] = useState(0);
  const sent = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const v = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      setP(v);
      if (v > 0.75 && !sent.current) {
        sent.current = true;
        track('content_engagement', { article_slug: slug, depth: 75 });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);
  return <div className="read-progress" aria-hidden="true" style={{ transform: `scaleX(${p})` }} />;
}
