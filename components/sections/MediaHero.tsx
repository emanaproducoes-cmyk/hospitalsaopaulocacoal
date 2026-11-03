'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Artwork } from '@/components/ui/Artwork';
import { Icon } from '@/components/ui/Icon';

export type HeroMedia =
  | { kind: 'placeholder' }
  | { kind: 'image'; src: string; alt: string; width: number; height: number }
  | { kind: 'video'; src: string; poster: string; alt: string };

/**
 * Mídia do hero: imagem, vídeo mudo (com pôster e botão de pausa) ou ilustração provisória.
 * - Vídeo só toca em telas ≥ 900px, sem "reduzir movimento" e sem economia de dados.
 * - O texto do hero nunca depende da mídia.
 */
export function MediaHero({ media }: { media: HeroMedia }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (media.kind !== 'video') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wide = window.matchMedia('(min-width: 900px)').matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = conn?.saveData || /2g/.test(conn?.effectiveType ?? '');
    setCanPlay(!reduce && wide && !slow);
  }, [media.kind]);

  if (media.kind === 'placeholder') {
    return (
      <div className="hero-media">
        <Artwork name="hero" ratio="4 / 5" alt="Espaço reservado para foto real de acolhimento no hospital" />
      </div>
    );
  }
  if (media.kind === 'image') {
    return (
      <div className="hero-media">
        <Image src={media.src} alt={media.alt} width={media.width} height={media.height} priority sizes="(min-width: 900px) 45vw, 100vw" />
      </div>
    );
  }
  return (
    <div className="hero-media">
      {canPlay ? (
        <>
          <video ref={videoRef} src={media.src} poster={media.poster} autoPlay muted loop playsInline preload="metadata" aria-label={media.alt} />
          <button
            type="button"
            className="hero-video-toggle"
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); }
            }}
            aria-label={paused ? 'Reproduzir vídeo de fundo' : 'Pausar vídeo de fundo'}
          >
            <Icon name={paused ? 'play' : 'pause'} size={18} />
          </button>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.poster} alt={media.alt} />
      )}
    </div>
  );
}
