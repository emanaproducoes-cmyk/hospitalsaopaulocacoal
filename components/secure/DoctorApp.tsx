'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { asset } from '@/lib/asset';
import { ANAMNESIS, ENCOUNTER, PROFILE, type FormValue } from '@/lib/clinical/schema';
import { age, fmtDate, fmtDateTime, SessionError, sx } from './client';
import { FormRenderer } from './FormRenderer';
import { EncounterCard, FileRow, Uploader } from './PatientApp';
import { Empty, IdleWatch, LegalNote, Panel, Pill, Spinner, Tabs, Toast, type ToastT } from './SecureUI';
import { MyPhoto, PatientPhoto } from './ProfilePhoto';
import type { IconName } from '@/lib/domain/types';

interface FileV { id: string; nome: string; categoria: string; mime: string; tamanho: number; autor: string; origem: 'paciente' | 'medico'; compartilhado: boolean; criadoEm: string }
interface Chart {
  number: string;
  hasPhoto: boolean;
  status: 'ativo' | 'convidado';
  profile: FormValue;
  anamnesis: FormValue;
  anamnesisVersion: number;
  anamnesisHistory: number;
  highlights: { alergias: string[]; negaAlergias: boolean; riscos: string[]; comorbidades: string[]; medicacoesEmUso: string[] };
  encounters: { id: string; tipo: string; data: FormValue; medico: string; criadoEm: string }[];
  files: FileV[];
  patientFiles: FileV[] | null;
  patientFilesCount: number;
  grant: { status: string; expiraEm: string | null } | null;
}
interface Painel { medico: { nome: string; crm: string; rqe: string | null; especialidade: string }; recentes: { number: string; nome: string; em: string }[]; notifications: { id: string; titulo: string; texto: string; lida: boolean; em: string }[] }
type CTab = 'resumo' | 'cadastro' | `anam-${string}` | 'evolucao' | 'atendimentos' | 'exames' | 'documentos' | 'acessos';
type View = 'buscar' | 'novo';
const SEXOS = ['Feminino', 'Masculino', 'Intersexo', 'Prefiro não informar'];
const maskCpf = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
const maskCel = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 11); return d.length <= 2 ? d : d.length <= 7 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; };
const txt = (v: unknown) => (v === undefined || v === null || v === '' ? '—' : String(v));
const MOTIVOS = ['Consulta', 'Retorno', 'Urgência', 'Internação', 'Cirurgia', 'Interconsulta', 'Laudo de exame'];
const g = (v: FormValue, k: string) => (v[k] && !Array.isArray(v[k]) ? (v[k] as Record<string, unknown>) : {});

export function DoctorApp() {
  const [painel, setPainel] = useState<Painel | null>(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ number: string; nome: string; nascimento: string | null }[] | null>(null);
  const [pick, setPick] = useState<{ number: string; nome: string } | null>(null);
  const [motivo, setMotivo] = useState('Consulta');
  const [chart, setChart] = useState<Chart | null>(null);
  const [ctab, setCtab] = useState<CTab>('resumo');
  const [anam, setAnam] = useState<FormValue>({});
  const [enc, setEnc] = useState<FormValue | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastT>(null);
  const [view, setView] = useState<View>('buscar');
  const [prof, setProf] = useState<FormValue>({});
  const [log, setLog] = useState<{ em: string; quem: string; acao: string; detalhe: string | null }[] | null>(null);
  const [np, setNp] = useState({ nome: '', nascimento: '', sexo: '', cpf: '', email: '', celular: '' });

  const fail = useCallback((e: unknown) => {
    if (e instanceof SessionError) { window.location.assign('/acesso?area=medico'); return; }
    setToast({ kind: 'erro', text: (e as Error).message });
  }, []);
  const loadPainel = useCallback(() => sx<Painel>('medico/painel').then(setPainel).catch(fail), [fail]);
  useEffect(() => { sx<{ user: { role: string } | null }>('auth/me').then((m) => { if (!m.user || m.user.role !== 'medico') { window.location.replace(m.user?.role === 'admin' ? '/admin' : '/acesso?area=medico'); return; } loadPainel(); }).catch(fail); }, [loadPainel, fail]);
  const logout = useCallback(async () => { await sx('auth/logout', { method: 'POST', json: {} }).catch(() => {}); window.location.assign('/acesso?area=medico'); }, []);

  const search = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { const r = await sx<{ items: NonNullable<typeof results> }>('medico/busca', { json: { q } }); setResults(r.items); } catch (er) { fail(er); } finally { setBusy(false); } };
  const open = async (number: string, m = motivo, tab: CTab = 'resumo') => {
    setBusy(true);
    try {
      const c = await sx<Chart>('medico/prontuario', { json: { number, motivo: m } });
      setChart(c); setAnam(c.anamnesis); setProf(c.profile); setDirty(false); setEnc(null); setPick(null); setCtab(tab); setLog(null);
      window.scrollTo({ top: 0 });
    } catch (er) { fail(er); } finally { setBusy(false); }
  };
  const reload = (tab: CTab = ctab) => chart && open(chart.number, motivo, tab);
  useEffect(() => { if (chart && ctab === 'acessos') sx<{ items: NonNullable<typeof log> }>(`medico/prontuario/${chart.number}/acessos`).then((r) => setLog(r.items)).catch(fail); }, [chart, ctab, fail]);
  const addPatient = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await sx<{ number: string }>('medico/pacientes', { json: np });
      setNp({ nome: '', nascimento: '', sexo: '', cpf: '', email: '', celular: '' });
      setBusy(false);
      await open(r.number, 'Consulta', 'cadastro');
      setToast({ kind: 'ok', text: `Paciente ${r.number} cadastrado. O convite de acesso foi enviado ao e-mail dele.` });
    } catch (er) { fail(er); } finally { setBusy(false); }
  };
  const leave = () => { if (dirty && !window.confirm('Há alterações não salvas. Fechar o prontuário mesmo assim?')) return; setChart(null); setDirty(false); loadPainel(); };

  if (!painel) return <div className="sx-app"><Spinner label="Abrindo a área do médico…" /></div>;

  const id = chart ? g(chart.profile, 'identificacao') : {};
  const cv = chart ? g(chart.profile, 'convenio') : {};
  const ctabs: { key: CTab; label: string; icon: IconName; badge?: number }[] = chart ? [
    { key: 'resumo', label: 'Resumo', icon: 'heart' },
    { key: 'cadastro', label: 'Dados pessoais', icon: 'user' },
    ...ANAMNESIS.map((s) => ({ key: `anam-${s.key}` as CTab, label: s.title, icon: s.icon as IconName })),
    { key: 'evolucao', label: 'Evolução e prescrições', icon: 'pill' },
    { key: 'atendimentos', label: 'Atendimentos', icon: 'stethoscope', badge: chart.encounters.length },
    { key: 'exames', label: 'Exames e laudos', icon: 'scan', badge: chart.files.length },
    { key: 'documentos', label: 'Docs do paciente', icon: chart.patientFiles ? 'key' : 'lock', badge: chart.patientFilesCount },
    { key: 'acessos', label: 'Quem acessou', icon: 'history' },
  ] : [];
  const setTab = (k: CTab) => { if (ctab.startsWith('anam-') && k.startsWith('anam-')) { setCtab(k); return; } if (dirty && !window.confirm('Há alterações não salvas. Continuar?')) return; setDirty(false); if (chart) { setAnam(chart.anamnesis); setProf(chart.profile); } setCtab(k); };
  const vitals = chart ? chart.encounters.filter((e) => Object.values(g(e.data, 'vitais')).some((x) => x !== '' && x !== undefined)) : [];
  const prescs = chart ? chart.encounters.flatMap((e) => (Array.isArray(e.data.prescricao) ? (e.data.prescricao as Record<string, unknown>[]) : []).filter((x) => x.medicamento).map((x) => ({ ...x, em: e.criadoEm, medico: e.medico }) as Record<string, unknown> & { em: string; medico: string })) : [];
  const dx = chart ? chart.encounters.map((e) => ({ ...g(e.data, 'avaliacao'), em: e.criadoEm, medico: e.medico }) as Record<string, unknown> & { em: string; medico: string }).filter((x) => x.hipoteses || x.cid) : [];
  const solicitados = chart ? chart.encounters.flatMap((e) => { const ex = g(e.data, 'avaliacao').examesSolicitados; return Array.isArray(ex) ? ex.map((x) => ({ exame: String(x), em: e.criadoEm })) : []; }) : [];

  return (
    <div className="sx-app is-doctor">
      <IdleWatch minutes={20} onExpire={logout} />
      <aside className="sx-side">
        <div className="sx-brandrow">
          <a href="/" className="sx-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/brand/logo-hbsp-white.png')} alt="Hospital São Paulo" />
          </a>
          <MyPhoto name={painel.medico.nome} onMessage={(kind, text) => setToast({ kind, text })} />
        </div>
        <div className="sx-id">
          <p className="sx-id-label">Área do médico</p>
          <p className="sx-id-name is-strong">{painel.medico.nome}</p>
          <p className="sx-id-meta">{painel.medico.crm}{painel.medico.rqe ? ` · RQE ${painel.medico.rqe}` : ''}</p>
          <p className="sx-id-meta">{painel.medico.especialidade}</p>
        </div>
        {chart ? <Tabs items={ctabs} value={ctab} onChange={setTab} label="Seções do prontuário" /> : (
          <Tabs items={[{ key: 'buscar' as View, label: 'Pacientes', icon: 'search' as IconName }, { key: 'novo' as View, label: 'Adicionar paciente', icon: 'plus' as IconName }]} value={view} onChange={setView} label="Área do médico" />
        )}
        <button type="button" className="sx-logout" onClick={logout}><Icon name="logout" size={18} /> Sair com segurança</button>
      </aside>

      <main className="sx-main" id="conteudo">
        <header className="sx-top">
          <div>
            <p className="sx-kicker">{chart ? 'Prontuário' : 'Área do médico'}</p>
            <h1>{chart ? String(id.nomeSocial || id.nome || 'Paciente') : view === 'novo' ? 'Adicionar paciente' : 'Localizar paciente'}</h1>
          </div>
          <div className="sx-top-actions">
            {chart && <button type="button" className="sx-btn is-ghost is-sm" onClick={leave}><Icon name="close" size={16} /> Fechar prontuário</button>}
            {!chart && view === 'buscar' && <button type="button" className="sx-btn is-primary is-sm" onClick={() => setView('novo')}><Icon name="plus" size={16} /> Adicionar paciente</button>}
          </div>
        </header>

        {!chart && view === 'novo' && (
          <Panel title="Novo paciente" icon="plus">
            <p className="sx-muted">O paciente recebe um número (HB0001SP) e um convite por e-mail para criar a senha da área do paciente. Depois do cadastro, o prontuário abre para você completar os dados pessoais, a anamnese e o atendimento.</p>
            <form className="sx-grid" onSubmit={addPatient}>
              <div className="sx-field span-3"><label htmlFor="np-1">Nome completo *</label><input id="np-1" value={np.nome} onChange={(e) => setNp({ ...np, nome: e.target.value })} autoComplete="off" required /></div>
              <div className="sx-field"><label htmlFor="np-2">Data de nascimento *</label><input id="np-2" type="date" value={np.nascimento} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setNp({ ...np, nascimento: e.target.value })} required /></div>
              <div className="sx-field"><label htmlFor="np-3">Sexo</label><select id="np-3" value={np.sexo} onChange={(e) => setNp({ ...np, sexo: e.target.value })}><option value="">Selecione</option>{SEXOS.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div className="sx-field"><label htmlFor="np-4">CPF</label><input id="np-4" inputMode="numeric" value={np.cpf} onChange={(e) => setNp({ ...np, cpf: maskCpf(e.target.value) })} placeholder="000.000.000-00" /></div>
              <div className="sx-field span-2"><label htmlFor="np-5">E-mail do paciente *</label><input id="np-5" type="email" value={np.email} onChange={(e) => setNp({ ...np, email: e.target.value })} autoComplete="off" required /></div>
              <div className="sx-field"><label htmlFor="np-6">Celular com DDD *</label><input id="np-6" inputMode="tel" value={np.celular} onChange={(e) => setNp({ ...np, celular: maskCel(e.target.value) })} placeholder="(69) 90000-0000" required /></div>
              <div className="sx-form-actions">
                <button type="button" className="sx-btn is-ghost" onClick={() => setView('buscar')}>Cancelar</button>
                <button type="submit" className="sx-btn is-primary" disabled={busy}><Icon name="save" size={16} /> {busy ? 'Cadastrando…' : 'Cadastrar e abrir prontuário'}</button>
              </div>
            </form>
          </Panel>
        )}

        {!chart && view === 'buscar' && (
          <div className="sx-stack">
            <Panel title="Buscar paciente" icon="search">
              <form className="sx-search" onSubmit={search}>
                <Icon name="search" size={20} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nº do paciente (HB0001SP), CPF, e-mail ou nome completo" aria-label="Buscar paciente" />
                <button type="submit" className="sx-btn is-primary" disabled={busy || q.trim().length < 5}>Buscar</button>
              </form>
              <p className="sx-muted">Por proteção de dados, não há lista aberta de pacientes. Cada busca e cada abertura de prontuário ficam registradas e são visíveis ao paciente.</p>
              {results && (results.length ? (
                <ul className="sx-results">
                  {results.map((r) => (
                    <li key={r.number}>
                      <span className="sx-avatar">{r.nome.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span>
                      <div><p className="sx-file-name">{r.nome}</p><p className="sx-file-meta">{r.number}{r.nascimento ? ` · ${fmtDate(r.nascimento)} · ${age(r.nascimento)}` : ''}</p></div>
                      <button type="button" className="sx-btn is-primary is-sm" onClick={() => setPick({ number: r.number, nome: r.nome })}>Abrir prontuário</button>
                    </li>
                  ))}
                </ul>
              ) : <Empty icon="search">Nenhum paciente encontrado. Confira o número, o CPF ou o nome completo.</Empty>)}
            </Panel>
            <div className="sx-cards is-2">
              <Panel title="Abertos recentemente" icon="history">
                {painel.recentes.length ? <ul className="sx-results is-compact">{painel.recentes.map((r) => <li key={r.number}><div><p className="sx-file-name">{r.nome}</p><p className="sx-file-meta">{r.number} · {fmtDateTime(r.em)}</p></div><button type="button" className="sx-btn is-ghost is-sm" onClick={() => setPick({ number: r.number, nome: r.nome })}>Abrir</button></li>)}</ul> : <Empty icon="history">Nenhum prontuário aberto ainda.</Empty>}
              </Panel>
              <Panel title="Avisos" icon="bell">
                {painel.notifications.length ? painel.notifications.slice(0, 6).map((n) => <article key={n.id} className={`sx-note ${n.lida ? '' : 'is-new'}`}><Icon name="bell" size={16} /><div><p className="sx-note-title">{n.titulo}</p><p className="sx-muted">{n.texto}</p><p className="sx-note-date">{fmtDateTime(n.em)}</p></div></article>) : <Empty icon="bell">Sem avisos.</Empty>}
              </Panel>
            </div>
          </div>
        )}

        {pick && (
          <div className="sx-modal" role="dialog" aria-modal="true" aria-labelledby="mot-t">
            <div className="sx-modal-card">
              <h2 id="mot-t"><Icon name="shield" size={20} /> Motivo do acesso</h2>
              <p className="sx-muted">Para abrir o prontuário de <strong>{pick.nome}</strong> ({pick.number}), informe o motivo. O acesso fica registrado e o paciente pode vê-lo.</p>
              <div className="sx-chips is-radio">
                {MOTIVOS.map((m) => <label key={m} className={`sx-chip ${motivo === m ? 'is-on' : ''}`}><input type="radio" name="motivo" checked={motivo === m} onChange={() => setMotivo(m)} />{m}</label>)}
              </div>
              <div className="sx-modal-actions">
                <button type="button" className="sx-btn is-ghost" onClick={() => setPick(null)}>Cancelar</button>
                <button type="button" className="sx-btn is-primary" disabled={busy} onClick={() => open(pick.number)}><Icon name="lock" size={16} /> Abrir prontuário</button>
              </div>
            </div>
          </div>
        )}

        {chart && (
          <>
            <div className="sx-patient-head">
              <PatientPhoto number={chart.number} name={String(id.nome || 'Paciente')} has={chart.hasPhoto} />
              <div className="sx-ph-main">
                <p className="sx-ph-number">{chart.number}{chart.status === 'convidado' && <Pill tone="warn">Convite de acesso pendente</Pill>}</p>
                <p className="sx-ph-meta">{[id.nascimento ? `${fmtDate(String(id.nascimento))} · ${age(id.nascimento)}` : '', id.sexo, id.tipoSanguineo ? `Tipo ${id.tipoSanguineo}` : '', cv.tipo === 'Convênio' ? `Convênio ${cv.operadora || ''}` : cv.tipo].filter(Boolean).join(' · ')}</p>
              </div>
            </div>
            <div className="sx-alertline" aria-label="Alertas clínicos">
              {chart.highlights.alergias.length ? chart.highlights.alergias.map((a) => <Pill key={a} tone="alert"><Icon name="alert" size={13} /> Alergia: {a}</Pill>) : <Pill tone={chart.highlights.negaAlergias ? 'ok' : 'neutral'}>{chart.highlights.negaAlergias ? 'Nega alergias' : 'Alergias não informadas'}</Pill>}
              {chart.highlights.riscos.map((r) => <Pill key={r} tone="warn">{r}</Pill>)}
            </div>

            {ctab === 'resumo' && (
              <div className="sx-cards">
                <Panel title="Doenças de base" icon="heart">{chart.highlights.comorbidades.length ? <div className="sx-tags">{chart.highlights.comorbidades.map((c) => <Pill key={c}>{c}</Pill>)}</div> : <p className="sx-muted">Nenhuma informada.</p>}</Panel>
                <Panel title="Medicações em uso" icon="pill">{chart.highlights.medicacoesEmUso.length ? <ul className="sx-list">{chart.highlights.medicacoesEmUso.map((m) => <li key={m}>{m}</li>)}</ul> : <p className="sx-muted">Nenhuma informada.</p>}</Panel>
                <Panel title="Enfermidades" icon="history">
                  {Array.isArray(chart.anamnesis.enfermidades) ? <ul className="sx-list">{(chart.anamnesis.enfermidades as Record<string, unknown>[]).map((e, i) => <li key={i}><strong>{String(e.condicao || '')}</strong> · {String(e.status || '')}{e.desde ? ` · desde ${String(e.desde)}` : ''}</li>)}</ul> : <p className="sx-muted">Nenhuma registrada.</p>}
                </Panel>
                <Panel title="Cirurgias e internações" icon="surgery">
                  <ul className="sx-list">
                    {(Array.isArray(chart.anamnesis.cirurgias) ? (chart.anamnesis.cirurgias as Record<string, unknown>[]) : []).map((c, i) => <li key={'c' + i}>{String(c.procedimento || '')}{c.data ? ` · ${fmtDate(String(c.data))}` : ''}{c.hospital ? ` · ${String(c.hospital)}` : ''}</li>)}
                    {(Array.isArray(chart.anamnesis.internacoes) ? (chart.anamnesis.internacoes as Record<string, unknown>[]) : []).map((c, i) => <li key={'i' + i}>Internação: {String(c.motivo || '')}{c.entrada ? ` · ${fmtDate(String(c.entrada))}` : ''}</li>)}
                  </ul>
                </Panel>
                <Panel title="Último atendimento" icon="stethoscope" className="span-2">
                  {chart.encounters[0] ? <EncounterCard e={chart.encounters[0]} showPrivate /> : <Empty icon="stethoscope">Nenhum atendimento registrado.</Empty>}
                </Panel>
              </div>
            )}

            {ctab.startsWith('anam-') && (
              <>
                <FormRenderer schema={ANAMNESIS} only={ctab.slice(5)} value={anam} role="medico" onChange={(v) => { setAnam(v); setDirty(true); }} />
                <div className="sx-savebar">
                  <span>{dirty ? 'Alterações não salvas' : `Versão ${chart.anamnesisVersion} · ${chart.anamnesisHistory} versões anteriores preservadas`}</span>
                  <button type="button" className="sx-btn is-primary" disabled={!dirty || busy} onClick={async () => { setBusy(true); try { await sx(`medico/prontuario/${chart.number}/anamnese`, { method: 'PUT', json: { value: anam, version: chart.anamnesisVersion } }); setToast({ kind: 'ok', text: 'Informações de saúde salvas no prontuário.' }); await reload(); } catch (e) { fail(e); } finally { setBusy(false); } }}><Icon name="save" size={16} /> Salvar</button>
                </div>
              </>
            )}

            {ctab === 'atendimentos' && (
              <div className="sx-stack">
                {!enc ? <button type="button" className="sx-btn is-primary sx-new" onClick={() => setEnc({ atendimento: { tipo: motivo === 'Retorno' ? 'Retorno' : motivo === 'Urgência' ? 'Urgência' : 'Consulta' } })}><Icon name="plus" size={18} /> Novo atendimento</button> : (
                  <>
                    <FormRenderer schema={ENCOUNTER} value={enc} role="medico" onChange={(v) => { setEnc(v); setDirty(true); }} />
                    <div className="sx-savebar">
                      <button type="button" className="sx-btn is-ghost" onClick={() => { setEnc(null); setDirty(false); }}>Descartar</button>
                      <button type="button" className="sx-btn is-primary" disabled={busy} onClick={async () => { setBusy(true); try { await sx(`medico/prontuario/${chart.number}/atendimentos`, { json: { value: enc } }); setToast({ kind: 'ok', text: 'Atendimento registrado no prontuário.' }); setDirty(false); await reload('atendimentos'); } catch (e) { fail(e); } finally { setBusy(false); } }}><Icon name="save" size={16} /> Registrar atendimento</button>
                    </div>
                  </>
                )}
                {chart.encounters.length ? chart.encounters.map((e) => <EncounterCard key={e.id} e={e} showPrivate />) : !enc && <Empty icon="stethoscope">Nenhum atendimento registrado.</Empty>}
              </div>
            )}

            {ctab === 'exames' && (
              <div className="sx-stack">
                <Panel title="Anexar exame, laudo ou receita" icon="upload">
                  <Uploader categories={['exame', 'laudo', 'receita', 'atestado', 'outro']} extra="Enviar para a área do paciente e avisar por e-mail" onUpload={async (fd) => { try { await sx(`medico/prontuario/${chart.number}/arquivos`, { form: fd }); setToast({ kind: 'ok', text: fd.get('compartilhar') === '1' ? 'Arquivo anexado e paciente avisado.' : 'Arquivo anexado ao prontuário.' }); await reload('exames'); } catch (e) { fail(e); } }} />
                </Panel>
                <Panel title="Arquivos do prontuário" icon="scan">
                  {chart.files.length ? <ul className="sx-files">{chart.files.map((f) => (
                    <FileRow key={f.id} f={f} extra={f.compartilhado ? <Pill tone="ok">Liberado ao paciente</Pill> : <button type="button" className="sx-btn is-ghost is-sm" onClick={async () => { try { await sx(`medico/prontuario/${chart.number}/arquivos/${f.id}/compartilhar`, { method: 'POST', json: {} }); setToast({ kind: 'ok', text: 'Liberado. O paciente foi avisado.' }); await reload('exames'); } catch (e) { fail(e); } }}><Icon name="external" size={14} /> Liberar ao paciente</button>} />
                  ))}</ul> : <Empty icon="scan">Nenhum exame anexado.</Empty>}
                </Panel>
              </div>
            )}

            {ctab === 'documentos' && (
              <Panel title="Documentos enviados pelo paciente" icon={chart.patientFiles ? 'key' : 'lock'}>
                {chart.patientFiles ? (
                  <>
                    <p className="sx-muted">Acesso autorizado pelo paciente{chart.grant?.expiraEm ? ` até ${fmtDate(chart.grant.expiraEm)}` : ''}.</p>
                    {chart.patientFiles.length ? <ul className="sx-files">{chart.patientFiles.map((f) => <FileRow key={f.id} f={f} />)}</ul> : <Empty icon="file">O paciente ainda não enviou documentos.</Empty>}
                  </>
                ) : (
                  <div className="sx-locked">
                    <Icon name="lock" size={30} />
                    <p>{chart.patientFilesCount ? `O paciente enviou ${chart.patientFilesCount} ${chart.patientFilesCount === 1 ? 'documento' : 'documentos'}.` : 'Documentos enviados pelo paciente'} O acesso depende da autorização dele.</p>
                    {chart.grant?.status === 'pendente' ? <Pill tone="warn">Pedido enviado · aguardando o paciente</Pill> : (
                      <button type="button" className="sx-btn is-primary" onClick={async () => { try { await sx(`medico/prontuario/${chart.number}/permissao`, { method: 'POST', json: {} }); setToast({ kind: 'ok', text: 'Pedido enviado. O paciente recebeu um e-mail.' }); await reload('documentos'); } catch (e) { fail(e); } }}><Icon name="mail" size={16} /> Pedir autorização ao paciente</button>
                    )}
                  </div>
                )}
              </Panel>
            )}

            {ctab === 'cadastro' && (
              <>
                <FormRenderer schema={PROFILE} value={prof} role="medico" onChange={(v) => { setProf(v); setDirty(true); }} />
                <div className="sx-savebar">
                  <span>{dirty ? 'Alterações não salvas' : 'Dados pessoais, endereço, filiação, contatos de emergência e convênio'}</span>
                  <button type="button" className="sx-btn is-primary" disabled={!dirty || busy} onClick={async () => { setBusy(true); try { await sx(`medico/prontuario/${chart.number}/cadastro`, { method: 'PUT', json: { value: prof } }); setToast({ kind: 'ok', text: 'Cadastro do paciente atualizado.' }); setDirty(false); await reload('cadastro'); } catch (e) { fail(e); } finally { setBusy(false); } }}><Icon name="save" size={16} /> Salvar cadastro</button>
                </div>
              </>
            )}

            {ctab === 'evolucao' && (
              <div className="sx-stack">
                <Panel title="Sinais vitais" icon="heart">
                  {vitals.length ? (
                    <div className="sx-table-wrap"><table className="sx-table">
                      <thead><tr><th>Data</th><th>Tipo</th><th>PA</th><th>FC</th><th>FR</th><th>Temp.</th><th>SpO₂</th><th>Glicemia</th><th>Peso</th><th>Dor</th></tr></thead>
                      <tbody>{vitals.map((e) => { const v = g(e.data, 'vitais'); return <tr key={e.id}><td>{fmtDateTime(e.criadoEm)}</td><td>{e.tipo}</td><td>{txt(v.pa)}</td><td>{txt(v.fc)}</td><td>{txt(v.fr)}</td><td>{txt(v.temp)}</td><td>{txt(v.spo2)}</td><td>{txt(v.glicemia)}</td><td>{txt(v.peso)}</td><td>{txt(v.dor)}</td></tr>; })}</tbody>
                    </table></div>
                  ) : <Empty icon="heart">Nenhum sinal vital registrado nos atendimentos.</Empty>}
                </Panel>
                <div className="sx-cards is-2">
                  <Panel title="Prescrições registradas" icon="pill">
                    {prescs.length ? <ul className="sx-list">{prescs.map((x, i) => <li key={i}><strong>{txt(x.medicamento)}</strong>{x.posologia ? ` · ${String(x.posologia)}` : ''}<br /><span className="sx-muted">{fmtDate(x.em)} · {x.medico}</span></li>)}</ul> : <Empty icon="pill">Nenhuma prescrição registrada.</Empty>}
                  </Panel>
                  <Panel title="Hipóteses e CID" icon="stethoscope">
                    {dx.length ? <ul className="sx-list">{dx.map((x, i) => <li key={i}><strong>{txt(x.hipoteses)}</strong>{x.cid ? ` · CID ${String(x.cid)}` : ''}<br /><span className="sx-muted">{fmtDate(x.em)} · {x.medico}</span></li>)}</ul> : <Empty icon="stethoscope">Nenhum diagnóstico registrado.</Empty>}
                  </Panel>
                  <Panel title="Exames solicitados" icon="scan">
                    {solicitados.length ? <ul className="sx-list">{solicitados.map((x, i) => <li key={i}>{x.exame} <span className="sx-muted">· {fmtDate(x.em)}</span></li>)}</ul> : <Empty icon="scan">Nenhum exame solicitado.</Empty>}
                  </Panel>
                  <Panel title="Medicações em uso (anamnese)" icon="pill">
                    {chart.highlights.medicacoesEmUso.length ? <ul className="sx-list">{chart.highlights.medicacoesEmUso.map((m) => <li key={m}>{m}</li>)}</ul> : <Empty icon="pill">Nenhuma informada.</Empty>}
                  </Panel>
                </div>
              </div>
            )}

            {ctab === 'acessos' && (
              <Panel title="Registro de acessos a este prontuário" icon="history">
                <p className="sx-muted">O mesmo registro que o paciente vê. Não pode ser apagado nem alterado.</p>
                {!log ? <Spinner /> : log.length ? (
                  <div className="sx-table-wrap"><table className="sx-table">
                    <thead><tr><th>Quando</th><th>Quem</th><th>O quê</th><th>Motivo</th></tr></thead>
                    <tbody>{log.map((l, i) => <tr key={i}><td>{fmtDateTime(l.em)}</td><td>{l.quem}</td><td>{l.acao}</td><td>{l.detalhe || '—'}</td></tr>)}</tbody>
                  </table></div>
                ) : <Empty icon="history">Nenhum acesso registrado.</Empty>}
              </Panel>
            )}
          </>
        )}
        <LegalNote />
        <Toast toast={toast} onDone={() => setToast(null)} />
      </main>
    </div>
  );
}
