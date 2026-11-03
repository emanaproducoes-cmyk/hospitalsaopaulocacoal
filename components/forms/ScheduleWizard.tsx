'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { specialties } from '@/lib/data/specialties';
import { exams } from '@/lib/data/exams';
import { doctors } from '@/lib/data/doctors';
import { site } from '@/lib/data/site';
import { api } from '@/lib/integrations/api';
import { currentOrigin, track } from '@/lib/integrations/analytics';
import { whatsappLink } from '@/lib/integrations/whatsapp';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ScheduleRequest } from '@/lib/domain/types';

type Data = {
  type: ScheduleRequest['type'] | '';
  specialty: string;
  exam: string;
  doctor: string;
  period: ScheduleRequest['period'];
  insurance: ScheduleRequest['insurance'];
  name: string;
  phone: string;
  consent: boolean;
  website: string; // honeypot anti-spam
};

const steps = ['Tipo', 'O quê', 'Preferências', 'Seus dados'];
const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
};

/** Assistente de agendamento em 4 passos. Envia à API Java quando configurada; senão abre o WhatsApp com a mensagem pronta. */
export function ScheduleWizard() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [result, setResult] = useState<{ protocol?: string; wa: string } | null>(null);
  const [d, setD] = useState<Data>({ type: '', specialty: '', exam: '', doctor: '', period: 'qualquer', insurance: 'nao-sei', name: '', phone: '', consent: false, website: '' });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const esp = p.get('especialidade') ?? '';
    const med = p.get('medico') ?? '';
    const exame = p.get('exame') ?? '';
    const tipo = p.get('tipo') as Data['type'] | null;
    setD((x) => ({ ...x, specialty: esp, doctor: med, exam: exame, type: tipo ?? (exame ? 'exame' : esp ? 'consulta' : '') }));
    if ((esp || exame) && !tipo) setStep(esp || exame ? 2 : 0);
    if (tipo) setStep(1);
  }, []);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((x) => ({ ...x, [k]: v }));
  const docOptions = useMemo(() => doctors.filter((x) => !d.specialty || x.specialties.includes(d.specialty)), [d.specialty]);

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0 && !d.type) e.type = 'Escolha o tipo de atendimento.';
    if (s === 1 && d.type !== 'exame' && !d.specialty) e.specialty = 'Escolha uma especialidade ou "Não sei".';
    if (s === 1 && d.type === 'exame' && !d.exam) e.exam = 'Escolha o exame.';
    if (s === 3) {
      if (d.name.trim().length < 3) e.name = 'Informe seu nome (mínimo 3 letras).';
      if (d.phone.replace(/\D/g, '').length < 10) e.phone = 'Informe um telefone com DDD.';
      if (!d.consent) e.consent = 'Precisamos da sua autorização para retornar o contato.';
    }
    setErrors(e);
    if (Object.keys(e).length) {
      setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validate(step)) return;
    track('click_schedule', { origin: 'wizard', step: step + 1, type: d.type || undefined });
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const label = {
    spec: specialties.find((s) => s.slug === d.specialty)?.name ?? (d.specialty === 'nao-sei' ? 'Ainda não sei — preciso de orientação' : ''),
    exam: exams.find((x) => x.slug === d.exam)?.name ?? '',
    doctor: doctors.find((x) => x.slug === d.doctor)?.name ?? '',
    period: { manha: 'Manhã', tarde: 'Tarde', qualquer: 'Qualquer horário' }[d.period],
    ins: { particular: 'Particular', convenio: 'Convênio', 'nao-sei': 'Ainda não sei' }[d.insurance],
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return next();
    if (!validate(3) || d.website) return;
    setStatus('sending');
    const origin = currentOrigin('agendar');
    const text = [
      `Olá! Meu nome é ${d.name.trim()}. Gostaria de agendar ${d.type === 'exame' ? 'um exame' : d.type === 'retorno' ? 'um retorno' : 'uma consulta'}.`,
      d.type === 'exame' ? `Exame: ${label.exam}` : `Especialidade: ${label.spec}`,
      label.doctor ? `Profissional de preferência: ${label.doctor}` : '',
      `Período: ${label.period} · Atendimento: ${label.ins}`,
    ].filter(Boolean).join('\n');
    const wa = whatsappLink({ intent: `Agendar ${d.type}`, origin, text });
    const res = await api.scheduleRequest({
      type: d.type as ScheduleRequest['type'],
      specialty: d.specialty || undefined,
      exam: d.exam || undefined,
      doctor: d.doctor || undefined,
      period: d.period,
      insurance: d.insurance,
      name: d.name.trim(),
      phone: d.phone,
      origin,
      consent: { purpose: 'agendamento', granted: true, policyVersion: site.policyVersion, timestamp: new Date().toISOString() },
    });
    track('click_whatsapp', { origin: 'wizard-submit', intent: d.type });
    setResult({ protocol: res.ok ? res.protocol : undefined, wa });
    setStatus('done');
  };

  if (status === 'done' && result) {
    return (
      <div className="wizard wizard-done" role="status">
        <span className="done-icon"><Icon name="check" size={34} /></span>
        <h2>Tudo pronto, {d.name.split(' ')[0]}!</h2>
        {result.protocol ? (
          <p>Recebemos sua solicitação (protocolo <strong>{result.protocol}</strong>). A central vai confirmar data e horário pelo telefone informado.</p>
        ) : (
          <p>Preparamos a mensagem com o que você escolheu. Toque no botão abaixo para enviá-la à central pelo WhatsApp — a equipe confirma data e horário na conversa.</p>
        )}
        <a href={result.wa} target="_blank" rel="noopener noreferrer" className="btn btn-green btn-lg">
          <Icon name="whatsapp" size={22} /> Enviar pelo WhatsApp
        </a>
        <p className="muted">Prefere ligar? <a href={`tel:${site.contacts.scheduling.tel}`}>{site.contacts.scheduling.label}</a></p>
        <button type="button" className="linklike" onClick={() => { setStatus('idle'); setStep(0); }}>Fazer outro agendamento</button>
      </div>
    );
  }

  return (
    <form className="wizard" onSubmit={submit} noValidate aria-labelledby="wizard-title">
      <h2 id="wizard-title" className="sr-only">Agendamento</h2>
      <ol className="wizard-steps" aria-label="Etapas">
        {steps.map((s, i) => (
          <li key={s} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
            <span className="ws-num">{i < step ? <Icon name="check" size={14} /> : i + 1}</span>
            <span className="ws-label">{s}</span>
          </li>
        ))}
      </ol>
      <div className="wizard-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>

      {step === 0 && (
        <fieldset className="wizard-panel" aria-describedby={errors.type ? 'err-type' : undefined}>
          <legend>O que você precisa agendar?</legend>
          <div className="choice-grid">
            {([
              ['consulta', 'Consulta', 'Com um especialista', 'doctor'],
              ['exame', 'Exame', 'Imagem, laboratório e outros', 'scan'],
              ['retorno', 'Retorno', 'Voltar ao mesmo profissional', 'calendar'],
            ] as const).map(([v, t, s, ic]) => (
              <label key={v} className={`choice ${d.type === v ? 'is-checked' : ''}`}>
                <input type="radio" name="type" value={v} checked={d.type === v} onChange={() => set('type', v)} aria-invalid={!!errors.type} />
                <Icon name={ic} size={26} />
                <strong>{t}</strong>
                <small>{s}</small>
              </label>
            ))}
          </div>
          {errors.type && <p className="error" id="err-type">{errors.type}</p>}
          <p className="wizard-alert"><Icon name="emergency" size={18} /> É uma urgência? Não agende — <Link href="/pronto-atendimento">veja o pronto atendimento</Link> ou ligue 192.</p>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="wizard-panel">
          <legend>{d.type === 'exame' ? 'Qual exame?' : 'Qual especialidade?'}</legend>
          {d.type === 'exame' ? (
            <div className="field">
              <label htmlFor="w-exam">Exame</label>
              <select id="w-exam" value={d.exam} onChange={(e) => set('exam', e.target.value)} aria-invalid={!!errors.exam} aria-describedby={errors.exam ? 'err-exam' : 'hint-exam'}>
                <option value="">Selecione</option>
                {exams.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
                <option value="outro">Outro exame</option>
              </select>
              <span id="hint-exam" className="hint">Tenha o pedido médico em mãos.</span>
              {errors.exam && <p className="error" id="err-exam">{errors.exam}</p>}
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="w-spec">Especialidade</label>
                <select id="w-spec" value={d.specialty} onChange={(e) => { set('specialty', e.target.value); set('doctor', ''); }} aria-invalid={!!errors.specialty} aria-describedby={errors.specialty ? 'err-spec' : undefined}>
                  <option value="">Selecione</option>
                  <option value="nao-sei">Ainda não sei — preciso de orientação</option>
                  {specialties.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
                {errors.specialty && <p className="error" id="err-spec">{errors.specialty}</p>}
              </div>
              {docOptions.length > 0 && d.specialty && d.specialty !== 'nao-sei' && (
                <div className="field">
                  <label htmlFor="w-doc">Profissional (opcional)</label>
                  <select id="w-doc" value={d.doctor} onChange={(e) => set('doctor', e.target.value)}>
                    <option value="">Sem preferência</option>
                    {docOptions.map((x) => <option key={x.slug} value={x.slug}>{`${x.title} ${x.name}`.trim()}</option>)}
                  </select>
                </div>
              )}
            </>
          )}
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="wizard-panel">
          <legend>Suas preferências</legend>
          <div className="field">
            <span className="label" id="lbl-period">Melhor período</span>
            <div className="seg" role="radiogroup" aria-labelledby="lbl-period">
              {(['manha', 'tarde', 'qualquer'] as const).map((p) => (
                <label key={p} className={d.period === p ? 'is-checked' : ''}>
                  <input type="radio" name="period" checked={d.period === p} onChange={() => set('period', p)} />
                  {{ manha: 'Manhã', tarde: 'Tarde', qualquer: 'Qualquer' }[p]}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label" id="lbl-ins">
              Forma de atendimento
              <Tooltip content="A lista oficial de convênios aceitos está sendo atualizada. Se escolher convênio, a central confirma a cobertura antes de marcar." label="Sobre convênios" />
            </span>
            <div className="seg" role="radiogroup" aria-labelledby="lbl-ins">
              {(['particular', 'convenio', 'nao-sei'] as const).map((p) => (
                <label key={p} className={d.insurance === p ? 'is-checked' : ''}>
                  <input type="radio" name="ins" checked={d.insurance === p} onChange={() => set('insurance', p)} />
                  {{ particular: 'Particular', convenio: 'Convênio', 'nao-sei': 'Não sei' }[p]}
                </label>
              ))}
            </div>
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="wizard-panel">
          <legend>Para a central falar com você</legend>
          <div className="summary">
            <p><strong>Resumo:</strong> {d.type === 'exame' ? label.exam : label.spec}{label.doctor && ` · ${label.doctor}`} · {label.period} · {label.ins}</p>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="w-name">Nome completo</label>
              <input id="w-name" autoComplete="name" value={d.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
              {errors.name && <p className="error" id="err-name">{errors.name}</p>}
            </div>
            <div className="field">
              <label htmlFor="w-phone">Telefone / WhatsApp</label>
              <input id="w-phone" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} placeholder="(69) 9 0000-0000" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'err-phone' : undefined} />
              {errors.phone && <p className="error" id="err-phone">{errors.phone}</p>}
            </div>
          </div>
          <div className="hp" aria-hidden="true">
            <label htmlFor="w-web">Não preencha</label>
            <input id="w-web" tabIndex={-1} autoComplete="off" value={d.website} onChange={(e) => set('website', e.target.value)} />
          </div>
          <label className="check">
            <input type="checkbox" checked={d.consent} onChange={(e) => set('consent', e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'err-consent' : 'consent-text'} />
            <span id="consent-text">Autorizo o HBSP a usar meu nome e telefone apenas para retornar este pedido de agendamento, conforme a <Link href="/privacidade" target="_blank">Política de Privacidade</Link>. Não informe sintomas ou dados de saúde aqui.</span>
          </label>
          {errors.consent && <p className="error" id="err-consent">{errors.consent}</p>}
        </fieldset>
      )}

      <div className="wizard-nav">
        {step > 0 && <button type="button" className="btn btn-ghost" onClick={back}><Icon name="arrow-left" size={18} /> Voltar</button>}
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          {step < 3 ? <>Continuar <Icon name="arrow-right" size={18} /></> : status === 'sending' ? 'Preparando…' : <>Concluir e abrir WhatsApp <Icon name="whatsapp" size={18} /></>}
        </button>
      </div>
      <p className="wizard-foot">O que acontece depois: abrimos uma conversa com a central {site.contacts.scheduling.label}; a equipe confirma data, horário e cobertura.</p>
    </form>
  );
}
