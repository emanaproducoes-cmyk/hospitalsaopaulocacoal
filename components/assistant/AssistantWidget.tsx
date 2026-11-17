'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { AssistantAction, AssistantReply } from '@/lib/assistant/triage';
import { converse, newContext, LOCAL_FIRST, type ConvContext } from '@/lib/assistant/engine';
import { track } from '@/lib/integrations/analytics';
import { api } from '@/lib/integrations/api';
import { whatsappLink } from '@/lib/integrations/whatsapp';
import { site } from '@/lib/data/site';

type Msg = { role: 'user' | 'assistant'; content: string; actions?: AssistantAction[]; redFlag?: boolean; quick?: string[] };

const KEY = 'hbsp-assistant';
const ENDPOINT = process.env.NEXT_PUBLIC_ASSISTANT_ENDPOINT || '/api/assistant';
function hello(): Msg {
  const h = new Date().getHours();
  const g = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const lines = [
    `${g}! Sou o assistente do Hospital São Paulo. Posso ajudar a agendar, achar um médico ou exame, e tirar dúvidas sobre visitas, internação e como chegar. Em urgência, venha direto ao pronto atendimento.`,
    `${g}! Que bom ter você aqui. Sou o assistente virtual do Hospital São Paulo: me conte do que você precisa, que eu te ajudo a encontrar o caminho.`,
    `${g}! Há mais de cinco décadas cuidamos de Cacoal, e agora também por aqui. Como posso ajudar você hoje?`,
  ];
  return { role: 'assistant', content: lines[Math.floor(Math.random() * lines.length)], quick: ['Quero agendar uma consulta', 'Preciso fazer um exame', 'Conte a história do hospital', 'Como chego ao hospital?'] };
}

/** Abre o assistente de qualquer lugar: window.dispatchEvent(new CustomEvent('hbsp:assistant', { detail: 'texto' })) */
export function openAssistant(text?: string) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('hbsp:assistant', { detail: text }));
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => [hello()]);
  const ctxRef = useRef<ConvContext>(newContext());
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [lead, setLead] = useState<{ open: boolean; name: string; phone: string; consent: boolean; state: 'idle' | 'sending' | 'done'; protocol?: string; ok?: boolean; error?: string }>({ open: false, name: '', phone: '', consent: false, state: 'idle' });
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) setMsgs(saved);
        else if (saved && Array.isArray(saved.msgs)) { setMsgs(saved.msgs); if (saved.ctx) ctxRef.current = saved.ctx; }
      }
    } catch { /* */ }
    const onOpen = (e: Event) => {
      setOpen(true);
      const t = (e as CustomEvent<string | undefined>).detail;
      if (t) setTimeout(() => send(t), 50);
    };
    window.addEventListener('hbsp:assistant', onOpen);
    return () => window.removeEventListener('hbsp:assistant', onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify({ msgs: msgs.slice(-24), ctx: ctxRef.current })); } catch { /* */ }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, lead.open, lead.state]);

  useEffect(() => {
    if (open) {
      track('assistant_open', { page_path: window.location.pathname });
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const close = () => { setOpen(false); setTimeout(() => launcherRef.current?.focus(), 0); };

  async function send(textArg?: string) {
    const text = (textArg ?? input).trim().slice(0, 500);
    if (!text || busy) return;
    setInput('');
    const history: Msg[] = [...msgs, { role: 'user', content: text }];
    setMsgs(history);
    setBusy(true);
    const started = Date.now();
    const turn = history.filter((m) => m.role === 'user').length;

    // 1. Repertório local: segurança, atendimento humano, conversa e temas do hospital.
    const local = converse(text, ctxRef.current);
    ctxRef.current = local.ctx;
    let reply: Msg = { role: 'assistant', content: local.reply, actions: local.actions, redFlag: local.redFlag, quick: local.quick };
    let source = 'repertorio';

    // 2. Perguntas abertas: tenta a IA do servidor; se não houver, fica o repertório.
    if (!LOCAL_FIRST.includes(local.kind) && local.kind !== 'tema') {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 14000);
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history.slice(-10).map(({ role, content }) => ({ role, content })) }),
          signal: ctrl.signal,
        });
        clearTimeout(t);
        if (res.ok && (res.headers.get('content-type') || '').includes('json')) {
          const r = (await res.json()) as AssistantReply;
          if (r.source === 'ia' || r.redFlag) {
            reply = { role: 'assistant', content: r.reply, actions: r.actions, redFlag: r.redFlag, quick: r.redFlag ? [] : local.quick };
            source = 'ia';
          }
        }
      } catch { /* segue com o repertório */ }
    }

    // 3. "Digitando…" com tempo natural, proporcional ao tamanho da resposta.
    const wait = Math.max(0, local.typingMs - (Date.now() - started));
    await new Promise((r) => setTimeout(r, wait));
    setBusy(false);
    track('assistant_message', { turn, red_flag: !!reply.redFlag, intent: local.topic || local.kind, channel: source });
    if (reply.redFlag) track('click_emergency', { origin: 'assistente', action: 'orientacao' });
    if (local.kind === 'humano') track('assistant_handoff', { action: 'sugerido', origin: local.topic });
    setMsgs((m) => [...m, reply]);
  }

  const onAction = (a: AssistantAction) => {
    if (a.kind === 'lead') { setLead((l) => ({ ...l, open: true })); return; }
    track('assistant_handoff', { action: a.kind, origin: a.href.startsWith('/') ? a.href.split('?')[0] : a.kind });
    if (a.href.startsWith('/')) setOpen(false);
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = lead.phone.replace(/\D/g, '');
    if (lead.name.trim().length < 2 || phone.length < 10) return setLead((l) => ({ ...l, error: 'Informe nome e telefone com DDD.' }));
    if (!lead.consent) return setLead((l) => ({ ...l, error: 'Precisamos da sua autorização para a central entrar em contato.' }));
    setLead((l) => ({ ...l, state: 'sending', error: undefined }));
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user')?.content || '';
    const intent = /exame/i.test(lastUser) ? 'exame' : /conv[eê]nio|plano/i.test(lastUser) ? 'convenio' : 'agendar';
    const res = await api.assistantLead({ intent, name: lead.name.trim(), phone: lead.phone, consent: { purpose: 'contato', granted: true, policyVersion: site.policyVersion, timestamp: new Date().toISOString() } });
    setLead((l) => ({ ...l, state: 'done', protocol: res.protocol, ok: res.ok }));
  };

  return (
    <>
      <button ref={launcherRef} type="button" className={`assistant-launcher ${open ? 'is-hidden' : ''}`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <span className="al-icon"><Icon name="chat" size={22} /></span>
        <span className="al-text">Assistente</span>
      </button>

      {open && (
        <div className="assistant" role="dialog" aria-modal="false" aria-labelledby={titleId} onKeyDown={(e) => { if (e.key === 'Escape') close(); }}>
          <div className="as-head">
            <span className="as-avatar" aria-hidden="true"><Icon name="sparkle" size={20} /></span>
            <div>
              <p className="as-title" id={titleId}>Assistente HBSP</p>
              <p className="as-sub">Orienta e encaminha · não faz diagnóstico</p>
            </div>
            <button type="button" className="as-close" onClick={close} aria-label="Fechar assistente"><Icon name="close" size={20} /></button>
          </div>

          <div className="as-list" ref={listRef} aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`as-msg is-${m.role} ${m.redFlag ? 'is-alert' : ''}`}>
                <p>{m.content}</p>
                {m.actions && m.actions.length > 0 && (
                  <div className="as-actions">
                    {m.actions.map((a) =>
                      a.kind === 'lead' ? (
                        <button key={a.href} type="button" className="as-act" onClick={() => onAction(a)}><Icon name="phone" size={16} /> {a.label}</button>
                      ) : a.href.startsWith('/') ? (
                        <Link key={a.href} href={a.href} className="as-act" onClick={() => onAction(a)}>{a.label} <Icon name="arrow-right" size={14} /></Link>
                      ) : (
                        <a key={a.href} href={a.href} className={`as-act ${a.kind === 'tel' && m.redFlag ? 'is-alert' : ''}`} target={a.kind === 'tel' ? undefined : '_blank'} rel="noopener noreferrer" onClick={() => onAction(a)}>
                          <Icon name={a.kind === 'whatsapp' ? 'whatsapp' : a.kind === 'tel' ? 'phone' : 'route'} size={16} /> {a.label}
                        </a>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="as-typing-row" role="status">
                <span className="as-typing" aria-hidden="true"><span /><span /><span /></span>
                <span className="as-typing-label">Assistente HBSP está digitando…</span>
              </div>
            )}

            {!busy && !lead.open && (() => {
              const last = msgs[msgs.length - 1];
              return last && last.role === 'assistant' && last.quick && last.quick.length > 0 ? (
                <div className="as-chips" aria-label="Sugestões">
                  {last.quick.map((c) => <button key={c} type="button" onClick={() => send(c)}>{c}</button>)}
                </div>
              ) : null;
            })()}

            {lead.open && (
              <div className="as-lead">
                {lead.state === 'done' ? (
                  lead.ok ? (
                    <p><strong>Pronto!</strong> A central vai te chamar no telefone informado{lead.protocol && <> · protocolo <strong>{lead.protocol}</strong></>}.</p>
                  ) : (
                    <>
                      <p>Para agilizar, envie seu pedido pelo WhatsApp{lead.protocol && <> (protocolo <strong>{lead.protocol}</strong>)</>}:</p>
                      <a className="btn btn-green" target="_blank" rel="noopener noreferrer" href={whatsappLink({ intent: 'assistente', origin: 'assistente-lead', text: `Olá! Sou ${lead.name.trim()} e gostaria que a central me ajudasse.${lead.protocol ? `\nProtocolo do site: ${lead.protocol}` : ''}` })} onClick={() => track('assistant_handoff', { action: 'whatsapp', origin: 'lead' })}>
                        <Icon name="whatsapp" size={18} /> Enviar pelo WhatsApp
                      </a>
                    </>
                  )
                ) : (
                  <form onSubmit={submitLead} noValidate>
                    <p className="as-lead-t">A central te chama</p>
                    <label>Nome<input value={lead.name} onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))} autoComplete="name" maxLength={80} /></label>
                    <label>Telefone com DDD<input value={lead.phone} onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value }))} inputMode="tel" autoComplete="tel" maxLength={20} /></label>
                    <label className="as-consent"><input type="checkbox" checked={lead.consent} onChange={(e) => setLead((l) => ({ ...l, consent: e.target.checked }))} /> Autorizo o hospital a me contatar sobre este pedido (<Link href="/privacidade">privacidade</Link>).</label>
                    {lead.error && <p className="as-error">{lead.error}</p>}
                    <button type="submit" className="btn btn-primary" disabled={lead.state === 'sending'}>{lead.state === 'sending' ? 'Enviando…' : 'Pedir contato'}</button>
                  </form>
                )}
              </div>
            )}
          </div>

          <form className="as-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <label htmlFor="as-text" className="sr-only">Escreva sua mensagem</label>
            <input id="as-text" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escreva sua dúvida…" maxLength={500} autoComplete="off" />
            <button type="submit" disabled={!input.trim() || busy} aria-label="Enviar"><Icon name="arrow-right" size={20} /></button>
          </form>
          <p className="as-foot">Não escreva CPF nem detalhes de saúde. Em urgência, venha ao pronto atendimento.</p>
        </div>
      )}
    </>
  );
}
