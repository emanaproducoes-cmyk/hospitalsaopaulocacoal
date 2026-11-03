'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';

/**
 * Carrossel "sweep" acessível:
 * - scroll-snap nativo (swipe no touch, trackpad e arrastar com o mouse);
 * - botões anterior/próximo visíveis, indicador "2 de 6", teclado (setas);
 * - autoplay opcional, sempre com botão de pausa e pausado em hover/foco/reduced-motion;
 * - nenhum conteúdo crítico deve depender dele.
 */
export function Carousel({ label, children, autoplay = false, interval = 6000 }: { label: string; children: React.ReactNode[]; autoplay?: boolean; interval?: number }) {
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);
  const [playing, setPlaying] = useState(autoplay);
  const [hovering, setHovering] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const total = children.length;
  const maxIndex = Math.max(0, total - perView);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el || !el.children[0]) return;
    const w = (el.children[0] as HTMLElement).getBoundingClientRect().width;
    setPerView(Math.max(1, Math.round(el.clientWidth / w)));
    const i = Math.round(el.scrollLeft / (w + parseFloat(getComputedStyle(el).columnGap || '0')));
    setIndex(Math.min(i, total - 1));
  }, [total]);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const child = el.children[Math.max(0, Math.min(i, total - 1))] as HTMLElement;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }, [total]);

  useEffect(() => {
    if (!playing || hovering) return;
    const t = setInterval(() => goTo(index >= maxIndex ? 0 : index + 1), interval);
    return () => clearInterval(t);
  }, [playing, hovering, index, maxIndex, interval, goTo]);

  // arrastar com o mouse (desktop)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !track.current) return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
    track.current.classList.add('is-dragging');
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !track.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    track.current.scrollLeft = drag.current.left - dx;
  };
  const endDrag = () => {
    if (!drag.current || !track.current) return;
    track.current.classList.remove('is-dragging');
    const moved = drag.current.moved;
    drag.current = null;
    if (moved) measure();
  };

  return (
    <section
      className="carousel"
      aria-roledescription="carrossel"
      aria-label={label}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      <div className="carousel-controls">
        <p className="carousel-pos" aria-live="polite">
          <span className="sr-only">Item </span>{Math.min(index + 1, total)}<span aria-hidden="true"> / </span><span className="sr-only"> de </span>{total}
        </p>
        <div className="carousel-dots" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={i >= index && i < index + perView ? 'is-on' : ''} />
          ))}
        </div>
        {autoplay && (
          <button type="button" className="icon-btn sm" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar rotação automática' : 'Iniciar rotação automática'}>
            <Icon name={playing ? 'pause' : 'play'} size={18} />
          </button>
        )}
        <button type="button" className="icon-btn sm" onClick={() => goTo(index - 1)} disabled={index <= 0} aria-controls={id} aria-label="Anterior">
          <Icon name="arrow-left" size={18} />
        </button>
        <button type="button" className="icon-btn sm" onClick={() => goTo(index + 1)} disabled={index >= maxIndex} aria-controls={id} aria-label="Próximo">
          <Icon name="arrow-right" size={18} />
        </button>
      </div>
      <ul
        id={id}
        ref={track}
        className="carousel-track"
        aria-live={playing ? 'off' : 'polite'}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => { if (track.current?.classList.contains('is-dragging')) e.preventDefault(); }}
      >
        {children.map((c, i) => (
          <li key={i} className="carousel-slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} de ${total}`}>
            {c}
          </li>
        ))}
      </ul>
    </section>
  );
}
