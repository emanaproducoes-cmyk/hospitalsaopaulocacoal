'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromIso = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const formatDateBR = (s: string) => {
  if (!s) return '';
  const d = fromIso(s);
  return `${d.toLocaleDateString('pt-BR', { weekday: 'long' })}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};

/**
 * Calendário acessível (padrão APG "date picker dialog" simplificado, em linha):
 * - setas movem o foco entre os dias; PageUp/PageDown trocam o mês; Enter/Espaço selecionam;
 * - dias passados, domingos e datas além do limite ficam desabilitados.
 */
export function DatePicker({ value, onChange, maxDays = 90, disableSundays = true, invalid, describedBy }: { value: string; onChange: (v: string) => void; maxDays?: number; disableSundays?: boolean; invalid?: boolean; describedBy?: string }) {
  const id = useId();
  const today = useMemo(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }, []);
  const min = useMemo(() => { const t = new Date(today); t.setDate(t.getDate() + 1); return t; }, [today]); // a partir de amanhã
  const max = useMemo(() => { const t = new Date(today); t.setDate(t.getDate() + maxDays); return t; }, [today, maxDays]);
  const [view, setView] = useState(() => { const b = value ? fromIso(value) : min; return new Date(b.getFullYear(), b.getMonth(), 1); });
  const [focus, setFocus] = useState<string>(value || iso(min));
  const gridRef = useRef<HTMLDivElement>(null);

  const disabled = (d: Date) => d < min || d > max || (disableSundays && d.getDay() === 0);

  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [view]);

  const canPrev = new Date(view.getFullYear(), view.getMonth(), 0) >= min;
  const canNext = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= max;

  const moveFocus = (delta: number) => {
    const d = fromIso(focus); d.setDate(d.getDate() + delta);
    if (d < min || d > max) return;
    const k = iso(d); setFocus(k);
    if (d.getMonth() !== view.getMonth()) setView(new Date(d.getFullYear(), d.getMonth(), 1));
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${k}"]`)?.focus());
  };

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, PageUp: -30, PageDown: 30 };
    if (e.key in map) { e.preventDefault(); moveFocus(map[e.key]); }
  };

  const label = `${MONTHS[view.getMonth()]} de ${view.getFullYear()}`;

  return (
    <div className={`datepicker ${invalid ? 'is-invalid' : ''}`}>
      <div className="dp-head">
        <button type="button" className="icon-btn sm" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} disabled={!canPrev} aria-label="Mês anterior">
          <Icon name="arrow-left" size={18} />
        </button>
        <p className="dp-title" id={`${id}-title`} aria-live="polite">{label}</p>
        <button type="button" className="icon-btn sm" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} disabled={!canNext} aria-label="Próximo mês">
          <Icon name="arrow-right" size={18} />
        </button>
      </div>
      <div role="grid" aria-labelledby={`${id}-title`} aria-describedby={describedBy} className="dp-grid" ref={gridRef} onKeyDown={onKey}>
        <div role="row" className="dp-row dp-week">
          {WEEK.map((w) => <span role="columnheader" key={w} aria-label={w}>{w}</span>)}
        </div>
        {Array.from({ length: 6 }, (_, r) => (
          <div role="row" className="dp-row" key={r}>
            {days.slice(r * 7, r * 7 + 7).map((d) => {
              const k = iso(d);
              const out = d.getMonth() !== view.getMonth();
              const dis = disabled(d);
              const sel = value === k;
              return (
                <span role="gridcell" key={k} aria-selected={sel}>
                  <button
                    type="button"
                    data-day={k}
                    className={`dp-day ${out ? 'is-out' : ''} ${sel ? 'is-selected' : ''} ${iso(today) === k ? 'is-today' : ''}`}
                    disabled={dis}
                    tabIndex={k === focus ? 0 : -1}
                    aria-label={`${d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}${dis ? ', indisponível' : ''}`}
                    aria-pressed={sel}
                    onClick={() => { onChange(k); setFocus(k); }}
                  >
                    {d.getDate()}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <p className="dp-legend"><span className="dp-dot is-selected" /> Selecionado <span className="dp-dot is-today" /> Hoje <span className="dp-dot is-off" /> Indisponível</p>
    </div>
  );
}
