'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/lib/data/site';
import { api } from '@/lib/integrations/api';
import { currentOrigin, track } from '@/lib/integrations/analytics';
import { whatsappLink } from '@/lib/integrations/whatsapp';
import { Icon } from '@/components/ui/Icon';

type Mode = 'contato' | 'ouvidoria';

/** Formulário genérico de contato/ouvidoria com validação, honeypot, estados e consentimento rastreável. */
export function ContactForm({ mode = 'contato' }: { mode?: Mode }) {
  const [v, setV] = useState({ name: '', phone: '', email: '', topic: mode === 'ouvidoria' ? 'elogio' : 'duvida', message: '', anonymous: false, consent: false, website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'fallback'>('idle');
  const [protocol, setProtocol] = useState('');
  const set = (k: string, val: string | boolean) => setV((x) => ({ ...x, [k]: val }));
  const anon = mode === 'ouvidoria' && v.anonymous;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!anon && v.name.trim().length < 3) er.name = 'Informe seu nome.';
    if (!anon && v.phone.replace(/\D/g, '').length < 10 && !/^\S+@\S+\.\S+$/.test(v.email)) er.phone = 'Informe um telefone com DDD ou um e-mail válido.';
    if (v.message.trim().length < 10) er.message = 'Escreva sua mensagem (mínimo 10 caracteres).';
    if (!v.consent) er.consent = 'Precisamos da sua autorização para tratar esta mensagem.';
    setErrors(er);
    if (Object.keys(er).length) {
      setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    if (v.website) return;
    setState('sending');
    const consent = { purpose: mode === 'ouvidoria' ? ('ouvidoria' as const) : ('contato' as const), granted: true, policyVersion: site.policyVersion, timestamp: new Date().toISOString() };
    const res =
      mode === 'ouvidoria'
        ? await api.feedback({ type: v.topic as 'elogio', anonymous: v.anonymous, name: anon ? undefined : v.name, contact: anon ? undefined : v.phone || v.email, message: v.message, consent })
        : await api.contactRequest({ name: v.name, phone: v.phone, email: v.email || undefined, topic: v.topic as 'duvida', message: v.message, origin: currentOrigin('contato'), consent });
    track('submit_contact', { form: mode, topic: v.topic });
    if (res.ok) { setProtocol(res.protocol); setState('ok'); } else setState('fallback');
  };

  if (state === 'ok') {
    return <div className="form-result ok" role="status"><Icon name="check" size={28} /><p><strong>Mensagem recebida.</strong> Protocolo {protocol}. Responderemos em até 2 dias úteis.</p></div>;
  }
  if (state === 'fallback') {
    const text = `${mode === 'ouvidoria' ? `Ouvidoria (${v.topic})` : `Contato (${v.topic})`}: ${v.message}`;
    return (
      <div className="form-result" role="status">
        <Icon name="info" size={28} />
        <div>
          <p><strong>Quase lá.</strong> O envio direto pelo site ainda está sendo integrado ao sistema do hospital. Envie sua mensagem pelo WhatsApp — o texto já está pronto:</p>
          <a className="btn btn-green" href={whatsappLink({ intent: mode, origin: 'form-fallback', text })} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={20} /> Enviar pelo WhatsApp</a>
        </div>
      </div>
    );
  }

  const topics = mode === 'ouvidoria'
    ? [['elogio', 'Elogio'], ['sugestao', 'Sugestão'], ['reclamacao', 'Reclamação'], ['denuncia', 'Denúncia']]
    : [['duvida', 'Dúvida geral'], ['agendamento', 'Agendamento'], ['internacao', 'Internação e visitas'], ['convenio', 'Convênios'], ['outros', 'Outros assuntos']];

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="f-topic">Assunto</label>
        <select id="f-topic" value={v.topic} onChange={(e) => set('topic', e.target.value)}>
          {topics.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      {mode === 'ouvidoria' && (
        <label className="check"><input type="checkbox" checked={v.anonymous} onChange={(e) => set('anonymous', e.target.checked)} /> <span>Quero me manter anônimo(a). Sem contato, não conseguiremos dar retorno.</span></label>
      )}
      {!anon && (
        <div className="field-row">
          <div className="field">
            <label htmlFor="f-name">Nome</label>
            <input id="f-name" autoComplete="name" value={v.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'fe-name' : undefined} />
            {errors.name && <p className="error" id="fe-name">{errors.name}</p>}
          </div>
          <div className="field">
            <label htmlFor="f-phone">Telefone</label>
            <input id="f-phone" type="tel" autoComplete="tel" value={v.phone} onChange={(e) => set('phone', e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'fe-phone' : undefined} />
            {errors.phone && <p className="error" id="fe-phone">{errors.phone}</p>}
          </div>
          <div className="field">
            <label htmlFor="f-email">E-mail <span className="optional">(opcional)</span></label>
            <input id="f-email" type="email" autoComplete="email" value={v.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>
      )}
      <div className="field">
        <label htmlFor="f-msg">Mensagem</label>
        <textarea id="f-msg" rows={5} value={v.message} onChange={(e) => set('message', e.target.value)} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'fe-msg' : 'fh-msg'} />
        <span className="hint" id="fh-msg">Não inclua resultados de exames ou dados de saúde detalhados.</span>
        {errors.message && <p className="error" id="fe-msg">{errors.message}</p>}
      </div>
      <div className="hp" aria-hidden="true"><label htmlFor="f-web">Não preencha</label><input id="f-web" tabIndex={-1} value={v.website} onChange={(e) => set('website', e.target.value)} /></div>
      <label className="check">
        <input type="checkbox" checked={v.consent} onChange={(e) => set('consent', e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'fe-consent' : undefined} />
        <span>Autorizo o uso destes dados apenas para tratar esta mensagem, conforme a <Link href="/privacidade" target="_blank">Política de Privacidade</Link>.</span>
      </label>
      {errors.consent && <p className="error" id="fe-consent">{errors.consent}</p>}
      <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Enviar mensagem'}</button>
    </form>
  );
}
