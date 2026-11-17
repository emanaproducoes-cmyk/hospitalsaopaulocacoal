'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { api } from '@/lib/integrations/api';
import { track } from '@/lib/integrations/analytics';
import { updateRequest } from '@/lib/integrations/myRequests';
import { site } from '@/lib/data/site';

/** Pesquisa de satisfação (NPS 0–10) que fecha o ciclo da jornada e alimenta o CRM. */
export function NpsForm({ protocol, compact = false, onDone }: { protocol?: string; compact?: boolean; onDone?: (score: number) => void }) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === null) return;
    setState('sending');
    await api.nps({ protocol, score, comment: comment.trim().slice(0, 600) || undefined, consent: { purpose: 'ouvidoria', granted: true, policyVersion: site.policyVersion, timestamp: new Date().toISOString() } });
    track('nps_submitted', { nps: score, origin: protocol ? 'minha-jornada' : 'avaliar' });
    if (protocol) updateRequest(protocol, { nps: score });
    setState('done');
    onDone?.(score);
  };

  if (state === 'done') {
    return (
      <div className="nps-done" role="status">
        <Icon name="heart" size={24} />
        <p><strong>Obrigado por contar como foi.</strong> {score !== null && score <= 6 ? 'Sentimos muito pelo que não foi bem. Se quiser, registre os detalhes na ouvidoria para receber um retorno.' : 'Sua avaliação ajuda o hospital a cuidar cada vez melhor.'}</p>
      </div>
    );
  }

  return (
    <form className={`nps ${compact ? 'is-compact' : ''}`} onSubmit={submit}>
      <fieldset>
        <legend>De 0 a 10, quanto você recomendaria o Hospital São Paulo a um amigo ou familiar?</legend>
        <div className="nps-scale" role="radiogroup">
          {Array.from({ length: 11 }, (_, i) => (
            <label key={i} className={`nps-n ${score === i ? 'is-on' : ''} ${i <= 6 ? 'lo' : i <= 8 ? 'mid' : 'hi'}`}>
              <input type="radio" name={`nps-${protocol || 'geral'}`} value={i} checked={score === i} onChange={() => setScore(i)} />
              {i}
            </label>
          ))}
        </div>
        <div className="nps-legend" aria-hidden="true"><span>Nada provável</span><span>Muito provável</span></div>
      </fieldset>
      <div className="field">
        <label htmlFor={`nps-c-${protocol || 'g'}`}>Quer contar algo? (opcional)</label>
        <textarea id={`nps-c-${protocol || 'g'}`} rows={compact ? 2 : 3} maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Sem dados pessoais ou de saúde, por favor." />
      </div>
      <button type="submit" className="btn btn-primary" disabled={score === null || state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Enviar avaliação'}</button>
    </form>
  );
}
