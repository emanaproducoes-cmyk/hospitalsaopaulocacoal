'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { asset } from '@/lib/asset';
import { UF } from '@/lib/clinical/schema';
import { fmtDateTime, SessionError, sx } from './client';
import { Empty, IdleWatch, Panel, Pill, SecureBadge, Spinner, Toast, type ToastT } from './SecureUI';

interface Admin {
  medicos: { nome: string; crm: string; rqe: string | null; especialidade: string; status: string; email: string }[];
  eventos: { em: string; tipo: string; gravidade: 'baixa' | 'media' | 'alta' | 'critica'; detalhe: string | null }[];
  auditoria: { ok: boolean; total: number; brokenAt?: number };
  totais: { pacientes: number; medicos: number; alertas24h: number };
}
const TONE = { baixa: 'neutral', media: 'info', alta: 'warn', critica: 'alert' } as const;

export function AdminApp() {
  const [d, setD] = useState<Admin | null>(null);
  const [f, setF] = useState({ nome: '', email: '', crm: '', uf: 'RO', rqe: '', especialidade: '' });
  const [toast, setToast] = useState<ToastT>(null);
  const [demoLink, setDemoLink] = useState('');
  const fail = useCallback((e: unknown) => { if (e instanceof SessionError) { window.location.assign('/acesso?area=medico'); return; } setToast({ kind: 'erro', text: (e as Error).message }); }, []);
  const load = useCallback(() => sx<Admin>('admin/painel').then(setD).catch(fail), [fail]);
  useEffect(() => { sx<{ user: { role: string } | null }>('auth/me').then((m) => { if (!m.user || m.user.role !== 'admin') { window.location.replace('/acesso?area=medico'); return; } load(); }).catch(fail); }, [load, fail]);
  const logout = useCallback(async () => { await sx('auth/logout', { method: 'POST', json: {} }).catch(() => {}); window.location.assign('/acesso?area=medico'); }, []);
  if (!d) return <div className="sx-app"><Spinner label="Abrindo a administração…" /></div>;

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await sx<{ demoLink?: string }>('admin/medicos', { json: f });
      setToast({ kind: 'ok', text: 'Médico cadastrado. O convite foi enviado por e-mail.' });
      setDemoLink(r.demoLink || '');
      setF({ nome: '', email: '', crm: '', uf: 'RO', rqe: '', especialidade: '' });
      await load();
    } catch (er) { fail(er); }
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="sx-app is-admin">
      <IdleWatch minutes={15} onExpire={logout} />
      <aside className="sx-side">
        <a href="/" className="sx-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset('/brand/logo-hbsp-white.png')} alt="Hospital São Paulo" />
        </a>
        <div className="sx-id"><p className="sx-id-label">Administração</p><p className="sx-id-name is-strong">Segurança e acessos</p></div>
        <button type="button" className="sx-logout" onClick={logout}><Icon name="logout" size={18} /> Sair com segurança</button>
      </aside>
      <main className="sx-main" id="conteudo">
        <header className="sx-top"><div><p className="sx-kicker">Administração</p><h1>Painel de segurança</h1></div><SecureBadge compact /></header>
        <div className="sx-cards">
          <Panel title="Pacientes" icon="users"><p className="sx-big">{d.totais.pacientes}</p></Panel>
          <Panel title="Médicos" icon="stethoscope"><p className="sx-big">{d.totais.medicos}</p></Panel>
          <Panel title="Alertas em 24 h" icon="alert" className={d.totais.alertas24h ? 'is-alert' : ''}><p className="sx-big">{d.totais.alertas24h}</p></Panel>
          <Panel title="Trilha de auditoria" icon="history" className={d.auditoria.ok ? '' : 'is-alert'}>
            <p className="sx-big is-sm">{d.auditoria.ok ? 'Íntegra' : `Quebrada no registro ${d.auditoria.brokenAt}`}</p>
            <p className="sx-muted">{d.auditoria.total} registros encadeados por hash</p>
          </Panel>
        </div>
        <div className="sx-cards is-2">
          <Panel title="Cadastrar médico" icon="plus">
            <form className="sx-grid" onSubmit={invite}>
              <div className="sx-field span-3"><label htmlFor="ad-n">Nome completo</label><input id="ad-n" value={f.nome} onChange={set('nome')} required /></div>
              <div className="sx-field span-3"><label htmlFor="ad-e">E-mail institucional</label><input id="ad-e" type="email" value={f.email} onChange={set('email')} required /></div>
              <div className="sx-field"><label htmlFor="ad-c">CRM</label><input id="ad-c" inputMode="numeric" value={f.crm} onChange={set('crm')} required /></div>
              <div className="sx-field"><label htmlFor="ad-u">UF</label><select id="ad-u" value={f.uf} onChange={set('uf')}>{UF.map((u) => <option key={u}>{u}</option>)}</select></div>
              <div className="sx-field"><label htmlFor="ad-r">RQE</label><input id="ad-r" value={f.rqe} onChange={set('rqe')} /></div>
              <div className="sx-field span-3"><label htmlFor="ad-s">Especialidade</label><input id="ad-s" value={f.especialidade} onChange={set('especialidade')} /></div>
              <div className="span-3"><button type="submit" className="sx-btn is-primary"><Icon name="mail" size={16} /> Cadastrar e enviar convite</button></div>
              {demoLink && <p className="span-3 sx-muted">Demonstração: <a href={demoLink}>abrir o link do convite</a></p>}
            </form>
            <p className="sx-muted">Confira o CRM no portal do Conselho antes de cadastrar. O médico cria a senha pelo convite (válido por 72 h) e sempre entra com código por e-mail.</p>
          </Panel>
          <Panel title="Médicos cadastrados" icon="stethoscope">
            {d.medicos.length ? <ul className="sx-results is-compact">{d.medicos.map((m) => <li key={m.crm}><div><p className="sx-file-name">{m.nome}</p><p className="sx-file-meta">{m.crm}{m.rqe ? ` · RQE ${m.rqe}` : ''} · {m.especialidade} · {m.email}</p></div><Pill tone={m.status === 'ativo' ? 'ok' : 'warn'}>{m.status}</Pill></li>)}</ul> : <Empty icon="stethoscope">Nenhum médico cadastrado.</Empty>}
          </Panel>
        </div>
        <Panel title="Eventos de segurança" icon="shield">
          <p className="sx-muted">Eventos de gravidade alta ou crítica também geram e-mail de alerta. IPs são guardados só como identificador anônimo.</p>
          {d.eventos.length ? (
            <table className="sx-table">
              <thead><tr><th>Quando</th><th>Evento</th><th>Gravidade</th><th>Detalhe</th></tr></thead>
              <tbody>{d.eventos.map((e, i) => <tr key={i}><td>{fmtDateTime(e.em)}</td><td>{e.tipo}</td><td><Pill tone={TONE[e.gravidade]}>{e.gravidade}</Pill></td><td>{e.detalhe || '—'}</td></tr>)}</tbody>
            </table>
          ) : <Empty icon="shield">Nenhum evento registrado.</Empty>}
        </Panel>
        <Toast toast={toast} onDone={() => setToast(null)} />
      </main>
    </div>
  );
}
