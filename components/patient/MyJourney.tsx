'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { formatDateBR } from '@/components/forms/DatePicker';
import { clearRequests, downloadIcs, listRequests, removeRequest, requestStatus, type SavedRequest } from '@/lib/integrations/myRequests';
import { readJourney, type JourneyStage } from '@/lib/integrations/journey';
import { track } from '@/lib/integrations/analytics';
import { whatsappLink } from '@/lib/integrations/whatsapp';
import { exams } from '@/lib/data/exams';
import { site } from '@/lib/data/site';
import { NpsForm } from './NpsForm';
import { openAssistant } from '@/components/assistant/AssistantWidget';

const STEPS = ['Pedido enviado', 'Central confirma', 'Atendimento', 'Avaliação'];
const STAGE_LABEL: Record<JourneyStage, string> = { descoberta: 'Conhecendo o hospital', consideracao: 'Pesquisando o atendimento', intencao: 'Pronto para agendar', conversao: 'Pedido feito', relacionamento: 'Em acompanhamento' };

/** Autogestão do paciente: acompanha pedidos, lembretes, preparo de exame e avaliação. */
export function MyJourney() {
  const [items, setItems] = useState<SavedRequest[] | null>(null);
  const [stage, setStage] = useState<JourneyStage>('descoberta');
  const [rating, setRating] = useState<string | null>(null);

  useEffect(() => { setItems(listRequests()); setStage(readJourney().stage); }, []);
  const refresh = () => setItems(listRequests());
  const address = `${site.address.street}, ${site.address.city}/${site.address.state}`;

  if (items === null) return <p className="muted">Carregando…</p>;

  return (
    <div className="journey">
      <div className="journey-stage card is-blue">
        <Icon name="route" size={22} />
        <p><strong>Sua etapa agora:</strong> {STAGE_LABEL[stage]}. Tudo aqui fica só neste aparelho.</p>
      </div>

      {items.length === 0 ? (
        <div className="journey-empty card">
          <h2>Nenhum pedido guardado ainda</h2>
          <p>Quando você agendar pelo site, toque em “Acompanhar em Minha jornada” para ver aqui o protocolo, a data, o preparo do exame e o lembrete na agenda.</p>
          <div className="page-hero-actions">
            <Link href="/agendar?origem=minha-jornada" className="btn btn-primary"><Icon name="calendar" size={18} /> Agendar agora</Link>
            <button type="button" className="btn btn-ghost" onClick={() => openAssistant()}><Icon name="chat" size={18} /> Falar com o assistente</button>
          </div>
        </div>
      ) : (
        <ul className="journey-list">
          {items.map((r) => {
            const st = requestStatus(r);
            const exam = r.kind === 'exame' ? exams.find((e) => e.slug === r.slug) : undefined;
            return (
              <li key={r.protocol} className="card journey-item">
                <div className="ji-head">
                  <div>
                    <p className="eyebrow">{r.kind === 'exame' ? 'Exame' : r.kind === 'retorno' ? 'Retorno' : 'Consulta'}</p>
                    <h2>{r.title}</h2>
                    <p className="muted">Protocolo <strong>{r.protocol}</strong>{r.date && <> · preferência: {formatDateBR(r.date)}</>}{r.doctor && <> · {r.doctor}</>}</p>
                  </div>
                  <span className={`ji-badge s${st.step}`}>{st.label}</span>
                </div>
                <ol className="ji-steps" aria-label="Andamento">
                  {STEPS.map((s, i) => <li key={s} className={i < st.step ? 'is-done' : i === st.step ? 'is-current' : ''}>{s}</li>)}
                </ol>
                <div className="ji-actions">
                  {r.date && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { downloadIcs(r, address); track('calendar_add', { origin: 'minha-jornada' }); }}><Icon name="calendar" size={16} /> Lembrete na agenda</button>}
                  {exam && <Link href={`/exames/${exam.slug}`} className="btn btn-ghost btn-sm" onClick={() => track('view_exam_prep', { exam_slug: exam.slug, origin: 'minha-jornada' })}><Icon name="file" size={16} /> Preparo do exame</Link>}
                  <a href={whatsappLink({ intent: 'acompanhamento', origin: 'minha-jornada', text: `Olá! Quero saber do meu pedido ${r.protocol} (${r.title}).` })} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" onClick={() => track('click_whatsapp', { origin: 'minha-jornada' })}><Icon name="whatsapp" size={16} /> Falar sobre este pedido</a>
                  <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" onClick={() => track('view_location', { origin: 'minha-jornada' })}><Icon name="route" size={16} /> Como chegar</a>
                  <button type="button" className="linklike" onClick={() => { removeRequest(r.protocol); refresh(); }}>Apagar deste aparelho</button>
                </div>
                {st.step >= 3 && r.nps === undefined && (
                  rating === r.protocol ? <NpsForm protocol={r.protocol} compact onDone={() => { refresh(); }} /> : <button type="button" className="btn btn-primary btn-sm" onClick={() => setRating(r.protocol)}><Icon name="star" size={16} /> Avaliar atendimento</button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="journey-help">
        <h2>Antes de vir ao hospital</h2>
        <ul className="check-list">
          <li>Documento oficial com foto e cartão do SUS ou carteirinha do convênio.</li>
          <li>Pedido médico e exames anteriores, se houver.</li>
          <li>Lista dos remédios que você usa.</li>
          <li>Para exames, confira o preparo na página do exame ou com a central.</li>
        </ul>
        {items.length > 0 && <button type="button" className="linklike" onClick={() => { clearRequests(); refresh(); }}>Apagar tudo deste aparelho</button>}
      </div>
    </div>
  );
}
