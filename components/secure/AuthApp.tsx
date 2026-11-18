'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { asset } from '@/lib/asset';
import { sx } from './client';
import { SecureBadge } from './SecureUI';

type Area = 'paciente' | 'medico';
type Step = 'entrar' | 'criar' | 'verificar' | 'esqueci' | 'redefinir' | 'ativar';

const ERR: Record<string, string> = {
  google: 'Não foi possível entrar com o Google. Tente de novo ou use e-mail e senha.',
  'google-indisponivel': 'O login com Google será ativado assim que o hospital concluir a configuração. Use e-mail e senha.',
  'sem-cadastro': 'Não há médico cadastrado com esta conta Google. O acesso médico é liberado pela administração.',
  area: 'Esta conta não tem acesso a esta área.',
};

function strength(pw: string): { score: number; label: string } {
  let s = 0;
  if (pw.length >= 10) s++;
  if (pw.length >= 14) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (/(123456|abcdef|qwerty|senha|password|hospital)/i.test(pw)) s = Math.min(s, 1);
  return { score: Math.min(4, s), label: ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][Math.min(4, s)] };
}

function PasswordInput({ id, value, onChange, autoComplete, meter }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; meter?: boolean }) {
  const [show, setShow] = useState(false);
  const st = strength(value);
  return (
    <>
      <div className="ax-pass">
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required minLength={meter ? 10 : undefined} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={show}><Icon name="eye" size={18} /></button>
      </div>
      {meter && value && (
        <div className="ax-meter" aria-live="polite">
          <span className={`s${st.score}`} style={{ width: `${(st.score + 1) * 20}%` }} />
          <em>{st.label} · use 10+ caracteres com letras e números</em>
        </div>
      )}
    </>
  );
}

function CodeInput({ onComplete, disabled }: { onComplete: (c: string) => void; disabled: boolean }) {
  const [d, setD] = useState<string[]>(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);
  const set = (i: number, v: string) => {
    const digits = v.replace(/\D/g, '');
    if (digits.length > 1) {
      const n = digits.slice(0, 6).split('');
      const full = [...n, ...Array(6 - n.length).fill('')];
      setD(full);
      refs.current[Math.min(5, n.length)]?.focus();
      if (n.length === 6) onComplete(n.join(''));
      return;
    }
    const n = [...d];
    n[i] = digits;
    setD(n);
    if (digits && i < 5) refs.current[i + 1]?.focus();
    if (n.every(Boolean)) onComplete(n.join(''));
  };
  return (
    <div className="ax-code" role="group" aria-label="Código de 6 dígitos">
      {d.map((v, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} value={v} disabled={disabled} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={6} aria-label={`Dígito ${i + 1}`}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Backspace' && !d[i] && i > 0) refs.current[i - 1]?.focus(); }} />
      ))}
    </div>
  );
}

const DEMO_ACCOUNTS: { area: Area; label: string; email: string }[] = [
  { area: 'paciente', label: 'Paciente', email: 'maria.ficticia@demo.hbsp' },
  { area: 'medico', label: 'Médica', email: 'dra.beatriz@demo.hbsp' },
  { area: 'medico', label: 'Administração', email: 'admin@demo.hbsp' },
];

function DemoBox({ refreshKey, onPick }: { refreshKey: number; onPick: (area: Area, email: string) => void }) {
  const [items, setItems] = useState<{ para: string; assunto: string; codigo: string | null; link: string | null; em: string }[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () => sx<{ items: typeof items }>('demo/caixa').then((r) => alive && setItems(r.items)).catch(() => {});
    load();
    const t = setInterval(load, 2500);
    return () => { alive = false; clearInterval(t); };
  }, [refreshKey]);
  return (
    <aside className="ax-demo" aria-label="Ambiente de demonstração">
      <p className="ax-demo-title"><Icon name="info" size={16} /> Modo demonstração · dados fictícios</p>
      <p>Senha de todas as contas de teste: <code>Hbsp-Demo-2026</code></p>
      <ul className="ax-demo-accounts">
        {DEMO_ACCOUNTS.map((a) => (
          <li key={a.email}><button type="button" className="ax-demo-pick" onClick={() => onPick(a.area, a.email)}><strong>{a.label}:</strong> {a.email} <span>usar</span></button></li>
        ))}
      </ul>
      <p className="ax-demo-title"><Icon name="mail" size={16} /> Caixa de e-mails de teste</p>
      {items.length === 0 ? <p className="ax-demo-empty">Os códigos enviados aparecem aqui.</p> : (
        <ul className="ax-demo-mail">
          {items.slice(0, 4).map((m, i) => (
            <li key={i}><span>{m.para} · {m.assunto.replace(/^\d{6} é o /, '')}</span>{m.codigo && <code>{m.codigo}</code>}{m.link && m.link.startsWith('/acesso') && <a href={m.link}>abrir link</a>}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export function AuthApp() {
  const [area, setArea] = useState<Area>('paciente');
  const [step, setStep] = useState<Step>('entrar');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [nome, setNome] = useState('');
  const [nasc, setNasc] = useState('');
  const [cel, setCel] = useState('');
  const [aceite, setAceite] = useState(false);
  const [code, setCode] = useState('');
  const [masked, setMasked] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [demo, setDemo] = useState(false);
  const [google, setGoogle] = useState(false);
  const [cool, setCool] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('area') === 'medico') setArea('medico');
    if (q.get('erro')) setErr(ERR[q.get('erro')!] || 'Não foi possível concluir o acesso.');
    if (q.get('etapa') === 'ativar' && q.get('token')) { setStep('ativar'); setToken(q.get('token')!); setArea('medico'); }
    sx<{ demo: boolean; google: boolean; user: { role: string } | null; pending?: { email: string } }>('auth/me').then((r) => {
      setDemo(r.demo);
      setGoogle(r.google);
      if (r.user) window.location.replace(r.user.role === 'paciente' ? '/area-do-paciente' : r.user.role === 'medico' ? '/area-do-medico' : '/admin');
      else if (r.pending || q.get('etapa') === 'verificar') { setMasked(r.pending?.email || ''); setStep('verificar'); setCool(45); }
    }).catch(() => {});
  }, []);

  useEffect(() => { if (cool <= 0) return; const t = setTimeout(() => setCool((c) => c - 1), 1000); return () => clearTimeout(t); }, [cool]);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true); setErr(''); setInfo('');
    try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); setTick((t) => t + 1); }
  }, []);

  const go = (s: Step) => { setStep(s); setErr(''); setInfo(''); setPw(''); setPw2(''); };

  const submitLogin = (e: React.FormEvent) => { e.preventDefault(); run(async () => { const r = await sx<{ email: string }>('auth/login', { json: { email, password: pw, area } }); setMasked(r.email); setPw(''); setStep('verificar'); setCool(45); }); };
  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) return setErr('As senhas não conferem.');
    run(async () => { const r = await sx<{ email: string }>('auth/register', { json: { nome, email, password: pw, nascimento: nasc, celular: cel, aceite } }); setMasked(r.email); setPw(''); setPw2(''); setStep('verificar'); setCool(45); });
  };
  const verify = (c: string) => run(async () => { const r = await sx<{ redirect: string }>('auth/verify', { json: { code: c } }); setInfo('Verificado! Abrindo seu ambiente seguro…'); window.location.assign(r.redirect); });
  const resend = () => run(async () => { await sx('auth/resend', { method: 'POST', json: {} }); setInfo('Enviamos um novo código.'); setCool(60); });
  const forgot = (e: React.FormEvent) => { e.preventDefault(); run(async () => { const r = await sx<{ email: string }>('auth/forgot', { json: { email } }); setMasked(r.email); setStep('redefinir'); setInfo('Se houver uma conta com este e-mail, enviamos um código.'); }); };
  const reset = (e: React.FormEvent) => { e.preventDefault(); if (pw !== pw2) return setErr('As senhas não conferem.'); run(async () => { await sx('auth/reset', { json: { email, code, password: pw } }); go('entrar'); setInfo('Senha alterada. Entre com a nova senha.'); }); };
  const activate = (e: React.FormEvent) => { e.preventDefault(); if (pw !== pw2) return setErr('As senhas não conferem.'); run(async () => { await sx('auth/activate', { json: { token, password: pw } }); go('entrar'); setInfo('Conta ativada. Entre com seu e-mail e a nova senha.'); window.history.replaceState(null, '', '/acesso?area=medico'); }); };

  const titles: Record<Step, [string, string]> = {
    entrar: [area === 'paciente' ? 'Área do paciente' : 'Área do médico', area === 'paciente' ? 'Seu prontuário, exames e documentos em um só lugar.' : 'Prontuário completo dos seus pacientes, com segurança.'],
    criar: ['Criar conta de paciente', 'Leva 1 minuto. Depois confirmamos seu e-mail.'],
    verificar: ['Verificação em duas etapas', `Digite o código de 6 dígitos que enviamos para ${masked || 'o seu e-mail'}.`],
    esqueci: ['Esqueci minha senha', 'Informe o e-mail da conta para receber um código.'],
    redefinir: ['Criar nova senha', `Digite o código enviado para ${masked || 'o seu e-mail'} e a nova senha.`],
    ativar: ['Ativar acesso médico', 'Crie sua senha. Em todo acesso você também receberá um código por e-mail.'],
  };

  return (
    <div className="ax">
      <div className="ax-visual" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset('/images/galeria/equipe.webp')} alt="" />
        <div className="ax-visual-shade" />
        <div className="ax-visual-copy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ax-logo" src={asset('/brand/logo-hbsp-white.png')} alt="" />
          <p className="ax-kicker">Ambiente seguro HBSP</p>
          <h2>Cuidado de perto,<br />há 51 anos.</h2>
          <ul>
            <li><Icon name="heart" size={20} /> Cuidando de Cacoal e região desde 1975</li>
            <li><Icon name="stethoscope" size={20} /> 30 especialidades em um só lugar</li>
            <li><Icon name="emergency" size={20} /> Pronto atendimento, centro cirúrgico e internação</li>
            <li><Icon name="baby" size={20} /> Maternidade, diagnóstico e exames</li>
          </ul>
        </div>
        <div className="ax-visual-foot">
          <span><Icon name="fingerprint" size={15} /> Verificação em duas etapas em todo acesso</span>
          <span><Icon name="lock" size={15} /> Dados e arquivos criptografados (AES-256)</span>
          <span><Icon name="key" size={15} /> Você decide quem vê seus documentos</span>
          <span><Icon name="history" size={15} /> Registro de cada acesso ao prontuário</span>
        </div>
      </div>

      <main className="ax-main" id="conteudo">
        <Link href="/" className="ax-back"><Icon name="arrow-left" size={16} /> Voltar ao site</Link>
        <div className="ax-card">
          {(step === 'entrar') && (
            <div className="ax-switch" role="tablist" aria-label="Escolha a área">
              {(['paciente', 'medico'] as Area[]).map((a) => (
                <button key={a} role="tab" type="button" aria-selected={area === a} className={area === a ? 'is-on' : ''} onClick={() => { setArea(a); setErr(''); }}>
                  <Icon name={a === 'paciente' ? 'user' : 'stethoscope'} size={17} /> {a === 'paciente' ? 'Sou paciente' : 'Sou médico'}
                </button>
              ))}
            </div>
          )}
          <h1>{titles[step][0]}</h1>
          <p className="ax-sub">{titles[step][1]}</p>

          {err && <p className="ax-msg is-err" role="alert"><Icon name="alert" size={16} /> {err}</p>}
          {info && <p className="ax-msg is-ok" role="status"><Icon name="check" size={16} /> {info}</p>}

          {step === 'entrar' && (
            <form onSubmit={submitLogin} className="ax-form">
              <label htmlFor="ax-email">E-mail</label>
              <input id="ax-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="ax-pw">Senha</label>
              <PasswordInput id="ax-pw" value={pw} onChange={setPw} autoComplete="current-password" />
              <button type="button" className="ax-link ax-forgot" onClick={() => go('esqueci')}>Esqueci minha senha</button>
              <button type="submit" className="ax-primary" disabled={busy}>{busy ? 'Verificando…' : 'Entrar'} <Icon name="arrow-right" size={18} /></button>
              <div className="ax-or"><span>ou</span></div>
              {google ? (
                <a className="ax-google" href={`/api/secure/auth/google/start?area=${area}`}><Icon name="globe" size={18} /> Entrar com Google</a>
              ) : (
                <button type="button" className="ax-google" onClick={() => setErr(ERR['google-indisponivel'])}><Icon name="globe" size={18} /> Entrar com Google</button>
              )}
              <p className="ax-note">Mesmo com Google, confirmamos o acesso com um código no seu e-mail.</p>
              {area === 'paciente' ? (
                <p className="ax-alt">Ainda não tem conta? <button type="button" className="ax-link" onClick={() => go('criar')}>Criar conta</button></p>
              ) : (
                <p className="ax-alt">O acesso médico é criado pela administração do hospital.</p>
              )}
            </form>
          )}

          {step === 'criar' && (
            <form onSubmit={submitRegister} className="ax-form">
              <label htmlFor="ax-nome">Nome completo</label>
              <input id="ax-nome" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={3} />
              <div className="ax-row">
                <div><label htmlFor="ax-nasc">Nascimento</label><input id="ax-nasc" type="date" value={nasc} onChange={(e) => setNasc(e.target.value)} required /></div>
                <div><label htmlFor="ax-cel">Celular</label><input id="ax-cel" type="tel" inputMode="tel" autoComplete="tel" value={cel} onChange={(e) => setCel(e.target.value)} required /></div>
              </div>
              <label htmlFor="ax-email2">E-mail</label>
              <input id="ax-email2" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="ax-pw2">Senha</label>
              <PasswordInput id="ax-pw2" value={pw} onChange={setPw} autoComplete="new-password" meter />
              <label htmlFor="ax-pw3">Repita a senha</label>
              <PasswordInput id="ax-pw3" value={pw2} onChange={setPw2} autoComplete="new-password" />
              <label className="ax-check"><input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} required /> <span>Li e aceito a <Link href="/privacidade" target="_blank">política de privacidade</Link>. Autorizo o tratamento dos meus dados de saúde para o meu atendimento, conforme a LGPD.</span></label>
              <button type="submit" className="ax-primary" disabled={busy}>{busy ? 'Criando…' : 'Criar conta'} <Icon name="arrow-right" size={18} /></button>
              <p className="ax-alt">Já tem conta? <button type="button" className="ax-link" onClick={() => go('entrar')}>Entrar</button></p>
            </form>
          )}

          {step === 'verificar' && (
            <div className="ax-form">
              <CodeInput onComplete={(c) => verify(c)} disabled={busy} />
              <p className="ax-note"><Icon name="clock" size={14} /> O código vale por 10 minutos. Nunca o informe por telefone ou WhatsApp.</p>
              <button type="button" className="ax-secondary" disabled={busy || cool > 0} onClick={resend}>{cool > 0 ? `Reenviar código em ${cool}s` : 'Reenviar código'}</button>
              <p className="ax-alt"><button type="button" className="ax-link" onClick={() => { sx('auth/logout', { method: 'POST', json: {} }).catch(() => {}); go('entrar'); }}>Usar outra conta</button></p>
            </div>
          )}

          {step === 'esqueci' && (
            <form onSubmit={forgot} className="ax-form">
              <label htmlFor="ax-email3">E-mail da conta</label>
              <input id="ax-email3" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className="ax-primary" disabled={busy}>Enviar código <Icon name="arrow-right" size={18} /></button>
              <p className="ax-alt"><button type="button" className="ax-link" onClick={() => go('entrar')}>Voltar</button></p>
            </form>
          )}

          {step === 'redefinir' && (
            <form onSubmit={reset} className="ax-form">
              <label htmlFor="ax-code">Código recebido</label>
              <input id="ax-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required />
              <label htmlFor="ax-npw">Nova senha</label>
              <PasswordInput id="ax-npw" value={pw} onChange={setPw} autoComplete="new-password" meter />
              <label htmlFor="ax-npw2">Repita a nova senha</label>
              <PasswordInput id="ax-npw2" value={pw2} onChange={setPw2} autoComplete="new-password" />
              <button type="submit" className="ax-primary" disabled={busy}>Salvar nova senha</button>
              <p className="ax-note">Ao trocar a senha, todas as sessões abertas são encerradas.</p>
            </form>
          )}

          {step === 'ativar' && (
            <form onSubmit={activate} className="ax-form">
              <label htmlFor="ax-apw">Crie sua senha</label>
              <PasswordInput id="ax-apw" value={pw} onChange={setPw} autoComplete="new-password" meter />
              <label htmlFor="ax-apw2">Repita a senha</label>
              <PasswordInput id="ax-apw2" value={pw2} onChange={setPw2} autoComplete="new-password" />
              <button type="submit" className="ax-primary" disabled={busy}>Ativar acesso</button>
            </form>
          )}

          <SecureBadge />
        </div>
        {demo && <DemoBox refreshKey={tick} onPick={(a, e) => { setArea(a); setEmail(e); setPw('Hbsp-Demo-2026'); setErr(''); setStep('entrar'); }} />}
      </main>
    </div>
  );
}
