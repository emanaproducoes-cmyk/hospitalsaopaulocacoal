'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/lib/domain/types';
import { Artwork } from '@/components/ui/Artwork';
import { Icon } from '@/components/ui/Icon';
import { PendingBadge } from '@/components/ui/primitives';
import { site } from '@/lib/data/site';
import { track } from '@/lib/integrations/analytics';

/* ======================= GALERIA + LIGHTBOX ======================= */
export function PhotoGallery({ items }: { items: MediaAsset[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    const i = open;
    setOpen(null);
    if (i !== null) setTimeout(() => triggers.current[i]?.focus(), 0);
  }, [open]);

  return (
    <>
      <ul className="gallery">
        {items.map((it, i) => (
          <li key={it.id} className={`g-item g-${i}`}>
            <button type="button" ref={(el) => { triggers.current[i] = el; }} onClick={() => setOpen(i)} aria-label={`Ampliar foto: ${it.title}`}>
              <Artwork name={it.src} ratio={i === 0 ? '4 / 5' : '4 / 3'} showTag={false} />
              <span className="g-caption"><strong>{it.title}</strong><small>{it.description}</small></span>
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox items={items} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}

function Lightbox({ items, index, onIndex, onClose }: { items: MediaAsset[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const it = items[index];
  const prev = () => onIndex((index - 1 + items.length) % items.length);
  const next = () => onIndex((index + 1) % items.length);

  useEffect(() => {
    const el = ref.current;
    el?.querySelector<HTMLButtonElement>('.lb-close')?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Tab' && el) {
        const f = el.querySelectorAll<HTMLElement>('button');
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Galeria de fotos: ${it.title}`} ref={ref}>
      <div className="lb-backdrop" onClick={onClose} />
      <figure
        className="lb-figure"
        onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => {
          if (!start.current) return;
          const dx = e.clientX - start.current.x;
          const dy = e.clientY - start.current.y;
          start.current = null;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
        }}
      >
        <Artwork name={it.src} ratio="16 / 10" alt={it.alt} />
        <figcaption>
          <strong>{it.title}</strong> — {it.description}
          <span className="lb-meta">Foto {index + 1} de {items.length} · Autorização de uso: {it.consent === 'approved' ? 'aprovada' : 'pendente'}</span>
        </figcaption>
      </figure>
      <button type="button" className="lb-btn lb-close" onClick={onClose} aria-label="Fechar galeria"><Icon name="close" size={24} /></button>
      <button type="button" className="lb-btn lb-prev" onClick={prev} aria-label="Foto anterior"><Icon name="arrow-left" size={24} /></button>
      <button type="button" className="lb-btn lb-next" onClick={next} aria-label="Próxima foto"><Icon name="arrow-right" size={24} /></button>
    </div>
  );
}

/* ======================= VÍDEOS ======================= */
export function VideoCard({ v }: { v: MediaAsset }) {
  return (
    <article className="video-card">
      <div className="video-thumb">
        <Artwork name={v.poster ?? 'institucional'} ratio="16 / 9" showTag={false} />
        <span className="video-play" aria-hidden="true"><Icon name="play" size={26} /></span>
        <span className="video-duration">{v.duration}</span>
      </div>
      <div className="video-body">
        <p className="video-cat">{v.category}</p>
        <h3>{v.title}</h3>
        <p>{v.description}</p>
        <p className="video-meta">Vídeo em produção <PendingBadge text="a publicar" /></p>
      </div>
    </article>
  );
}

/* ======================= MAPA COM CONSENTIMENTO ======================= */
export function MapConsent() {
  const [load, setLoad] = useState(false);
  return (
    <div className="map-box">
      {load ? (
        <iframe title={`Mapa: ${site.address.full}`} src={site.address.embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="map-placeholder">
          <svg viewBox="0 0 400 260" aria-hidden="true" className="map-art">
            <defs>
              <pattern id="mapgrid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0v28" fill="none" stroke="#C9D5F2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="260" fill="#EEF3FB" />
            <rect width="400" height="260" fill="url(#mapgrid)" />
            <path d="M-10 170 C 90 150, 160 190, 240 140 S 360 90, 420 110" stroke="#fff" strokeWidth="18" fill="none" />
            <path d="M120 -10 L 170 280" stroke="#fff" strokeWidth="12" fill="none" />
            <path d="M-10 60 L 420 40" stroke="#fff" strokeWidth="8" fill="none" />
          </svg>
          <span className="map-pin" aria-hidden="true"><Icon name="pin" size={30} /></span>
          <div className="map-cta">
            <p>O mapa é fornecido pelo Google e pode usar cookies.</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => { setLoad(true); track('view_location', { origin: 'map-embed' }); }}>Carregar mapa</button>
          </div>
        </div>
      )}
    </div>
  );
}
