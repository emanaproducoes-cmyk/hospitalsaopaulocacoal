'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { TrackedButton } from '@/components/ui/Tracked';

/** Os dois vídeos do hero (últimas versões), tocados em sequência e em loop infinito. */
const VIDEOS = [
  {
    id: '51anos',
    name: 'hero-51anos',
    label: 'Hospital São Paulo, 51 anos: você não está sozinho.',
    phrases: [
      '51 anos cuidando de quem você ama.',
      'Centenas de histórias começaram aqui.',
      'Centenas de vidas, cuidadas pelo nome.',
      'Centenas de nascimentos. Um só carinho.',
      'Gerações de Cacoal confiam em nós.',
      'Cuidado que acolhe. Saúde que acompanha.',
    ],
  },
  {
    id: 'cuidado',
    name: 'hero-cuidado',
    label: 'Cuidado que acolhe. Saúde que acompanha você.',
    phrases: [
      'Cuidado que acolhe.',
      'Saúde que acompanha você.',
      'Desde 1975, cuidando de Cacoal e da região.',
      'Precisa de atendimento? Agende em minutos pelo WhatsApp. Pronto atendimento todos os dias.',
    ],
  },
];
const FADE = 0.9; // segundos de fusão entre um vídeo e o outro

/**
 * Hero em vídeo:
 * - dois <video> sobrepostos; ao final de um, o outro entra com fusão (crossfade) → loop infinito;
 * - escolhe 1280 ou 1920 conforme a tela; WebM com fallback MP4;
 * - botão de pausa (WCAG 2.2.2); "reduzir movimento" mostra só o pôster;
 * - o texto dos vídeos também existe em HTML (SEO e leitores de tela);
 * - botões de ação sobre a parte inferior do vídeo (no celular, logo abaixo).
 */
export function HeroVideo51() {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState<'1280' | '1920'>('1920');
  const switching = useRef(false);
  const prefix = ((globalThis as { __HBSP_BASE__?: string }).__HBSP_BASE__ ?? '/') + 'videos/hero/';

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setPaused(true); return; }
    // largura real do banner (container de até 1280 px) × densidade da tela
    const shown = Math.min(window.innerWidth, 1280) * window.devicePixelRatio;
    setSize(shown <= 1300 ? '1280' : '1920');
    setReady(true);
  }, []);

  // inicia o primeiro vídeo
  useEffect(() => {
    if (!ready) return;
    const v = refs.current[0];
    v?.load();
    v?.play().catch(() => setPaused(true));
  }, [ready, size]);

  const crossTo = useCallback((next: number) => {
    if (switching.current) return;
    const nv = refs.current[next];
    if (!nv) return;
    switching.current = true;
    const go = () => {
      nv.currentTime = 0;
      nv.play().catch(() => {});
      setActive(next);
      window.setTimeout(() => {
        refs.current[1 - next]?.pause();
        switching.current = false;
      }, FADE * 1000 + 100);
    };
    if (nv.readyState >= 2) go();
    else {
      // o próximo ainda não carregou: espera ficar pronto (o atual segura o último quadro)
      nv.addEventListener('canplay', go, { once: true });
      nv.preload = 'auto';
      nv.load();
    }
  }, []);

  // pré-carrega o próximo vídeo assim que o atual começa a tocar
  useEffect(() => {
    if (!ready) return;
    const next = refs.current[(active + 1) % VIDEOS.length];
    const t = window.setTimeout(() => {
      if (next && next.readyState < 2) { next.preload = 'auto'; next.load(); }
    }, 3000);
    return () => window.clearTimeout(t);
  }, [active, ready]);

  // perto do fim do vídeo ativo, faz a fusão com o próximo (loop infinito entre os dois)
  useEffect(() => {
    if (!ready) return;
    const v = refs.current[active];
    if (!v) return;
    const next = (active + 1) % VIDEOS.length;
    const onTime = () => {
      if (v.duration && isFinite(v.duration) && v.duration - v.currentTime <= FADE) crossTo(next);
    };
    const onEnded = () => crossTo(next);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    return () => { v.removeEventListener('timeupdate', onTime); v.removeEventListener('ended', onEnded); };
  }, [active, ready, crossTo]);

  const toggle = () => {
    const v = refs.current[active];
    if (!v) return;
    if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); }
  };

  return (
    <section className="hero51" aria-labelledby="hero51-title">
      <h1 id="hero51-title" className="sr-only">{VIDEOS[0].label}</h1>
      <div className="sr-only">
        {VIDEOS.map((v) => (
          <ul key={v.id}>{v.phrases.map((p) => <li key={p}>{p}</li>)}</ul>
        ))}
      </div>

      <div className="hero51-wrap">
      <div className="hero51-media">
        {VIDEOS.map((v, i) => (
          <video
            key={v.id}
            ref={(el) => { refs.current[i] = el; }}
            className={`hero51-video ${active === i ? 'is-active' : ''}`}
            style={{ transitionDuration: `${FADE}s` }}
            poster={`${prefix}${v.name}-poster.webp`}
            muted
            playsInline
            preload={i === 0 ? 'metadata' : 'none'}
            aria-hidden="true"
            tabIndex={-1}
          >
            {ready && size === '1920' && <source src={`${prefix}${v.name}-1920.webm`} type="video/webm" />}
            {ready && <source src={`${prefix}${v.name}-${size}.mp4`} type="video/mp4" />}
          </video>
        ))}

        <div className="hero51-overlay">
          <div className="hero51-actions">
            <TrackedButton href="/agendar?origem=hero-video" event="click_schedule" params={{ origin: 'hero-video' }} icon="calendar">Agendar consulta</TrackedButton>
            <TrackedButton href="/pronto-atendimento" event="click_emergency" params={{ origin: 'hero-video' }} variant="white" icon="emergency">Pronto atendimento</TrackedButton>
          </div>
          {ready && (
            <button type="button" className="hero51-toggle" onClick={toggle} aria-label={paused ? 'Reproduzir vídeos do banner' : 'Pausar vídeos do banner'}>
              <Icon name={paused ? 'play' : 'pause'} size={18} />
            </button>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}
