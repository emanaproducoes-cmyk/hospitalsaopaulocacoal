'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { asset } from '@/lib/asset';
import { ANAMNESIS, ENCOUNTER, PROFILE, type FormValue } from '@/lib/clinical/schema';
import { age, fmtDate, fmtDateTime, SessionError, sx } from './client';
import { FormRenderer } from './FormRenderer';
import { EncounterCard, FileRow, Uploader } from './PatientApp';
import { Empty, IdleWatch, Panel, Pill, SecureBadge, Spinner, Tabs, Toast, type ToastT } from './SecureUI';
import type { IconName } from '@/lib/domain/types';

interface FileV { id: string; nome: string; categoria: string; mime: string; tamanho: number; autor: string; origem: 'paciente' | 'medico'; compartilhado: boolean; criadoEm: string }
interface Chart {
  number: string;
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
type CTab = 'resumo' | 'anamnese' | 'atendimentos' | 'exames' | 'documentos' | 'cadastro';
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
  const [section, setSection] = useState(ANAMNESIS[0].key);
  const [enc, setEnc] = useState<FormValue | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastT>(null);

  const fail = useCallback((e: unknown) => {
    if (e instanceof SessionError) { window.location.assign('/acesso?area=medico'); return; }
    setToast({ kind: 'erro', text: (e as Error).message });
  }, []);
  const loadPainel = useCallback(() => sx<Painel>('medico/painel').then(setPainel).catch(fail), [fail]);
  useEffect(() => { sx<{ user: { role: string } | null }>('auth/me').then((m) => { if (!m.user || m.user.role !== 'medico') { window.location.replace(m.user?.role === 'admin' ? '/admin' : '/acesso?area=medico'); return; } loadPainel(); }).catch(fail); }, [loadPainel, fail]);
  const logout = useCallback(async () => { await sx('auth/logout', { method: 'POST', json: {} }).catch(() => {}); window.location.assign('/acesso?area=medico'); }, []);

  const search = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { const r = await sx<{ items: NonNullable<typeof results> }>('medico/busca', { json: { q } }); setResults(r.items); } catch (er) { fail(er); } finally { setBusy(false); } };
  const open = async (number: string, m = motivo) => {
    setBusy(true);
    try {
      const c = await sx<Chart>('medico/prontuario', { json: { number, motivo: m } });
      setChart(c); setAnam(c.anamnesis); setDirty(false); setEnc(null); setPick(null); setCtab('resumo');
      window.scrollTo({ top: 0 });
    } catch (er) { fail(er); } finally { setBusy(false); }
  };
  const reload = () => chart && open(chart.number, motivo);
  const leave = () => { if (dirty && !window.confirm('Há alterações não salvas. Fechar o prontuário mesmo assim?')) return; setChart(null); setDirty(false); loadPainel(); };

  if (!painel) return <div className="sx-app"><Spinner label="Abrindo a área do médico…" /></div>;

  const id = chart ? g(chart.profile, 'identificacao') : {};
  const cv = chart ? g(chart.profile, 'convenio') : {};
  const ctabs: { key: CTab; label: string; icon: IconName; badge?: number }[] = chart ? [
    { key: 'resumo', label: 'Resumo', icon: 'heart' },
    { key: 'anamnese', label: 'Anamnese', icon: 'edit' },
    { key: 'atendimentos', label: 'Atendimentos', icon: 'stethoscope', badge: chart.encounters.length },
    { key: 'exames', label: 'Exames e laudos', icon: 'scan', badge: chart.files.length },
    { key: 'documentos', label: 'Docs do paciente', icon: chart.patientFiles ? 'key' : 'lock', badge: chart.patientFilesCount },
    { key: 'cadastro', label: 'Cadastro', icon: 'user' },
  ] : [];
  const setTab = (k: CTab) => { if (dirty && !window.confirm('Há alterações não salvas. Continuar?')) return; setDirty(false); if (chart) setAnam(chart.anamnesis); setCtab(k); };

  return (
    <div className="sx-app is-doctor">
      <IdleWatch minutes={20} onExpire={logout} />
      <aside className="sx-side">
        <a href="/" className="sx-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset('/brand/logo-hbsp-white.png')} alt="Hospital São Paulo" />
        </a>
        <div className="sx-id">
          <p className="sx-id-label">Área do médico</p>
          <p className="sx-id-name is-strong">{painel.medico.nome}</p>
          <p className="sx-id-meta">{painel.medico.crm}{painel.medico.rqe ? ` · RQE ${painel.medico.rqe}` : ''}</p>
          <p className="sx-id-meta">{painel.medico.especialidade}</p>
        </div>
        {chart ? <Tabs items={ctabs} value={ctab} onChange={setTab} label="Seções do prontuário" /> : (
          <nav className="sx-tabs"><span className="sx-tab is-active"><Icon name="search" size={18} /><span>Pacientes</span></span></nav>
        )}
        <button type="button" className="sx-logout" onClick={logout}><Icon name="logout" size={18} /> Sair com segurança</button>
      </aside>

      <main className="sx-main" id="conteudo">
        <header className="sx-top">
          <div>
            <p className="sx-kicker">{chart ? 'Prontuário' : 'Área do médico'}</p>
            <h1>{chart ? String(id.nomeSocial || id.nome || 'Paciente') : 'Localizar paciente'}</h1>
          </div>
          <div className="sx-top-actions">
            {chart && <button type="button" className="sx-btn is-ghost is-sm" onClick={leave}><Icon name="close" size={16} /> Fechar prontuário</button>}
            <SecureBadge compact />
          </div>
        </header>

        {!chart && (
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
              <span className="sx-avatar is-lg">{String(id.nome || 'P').split(' ').slice(0, 2).map((p) => p[0]).join('')}</span>
              <div className="sx-ph-main">
                <p className="sx-ph-number">{chart.number}</p>
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

            {ctab === 'anamnese' && (
              <>
                <div className="sx-seg" role="tablist" aria-label="Partes da anamnese">
                  {ANAMNESIS.map((s) => <button key={s.key} type="button" role="tab" aria-selected={section === s.key} className={section === s.key ? 'is-on' : ''} onClick={() => setSection(s.key)}>{s.title}</button>)}
                </div>
                <FormRenderer schema={ANAMNESIS} only={section} value={anam} role="medico" onChange={(v) => { setAnam(v); setDirty(true); }} />
                <div className="sx-savebar">
                  <span>{dirty ? 'Alterações não salvas' : `Versão ${chart.anamnesisVersion} · ${chart.anamnesisHistory} versões anteriores preservadas`}</span>
                  <button type="button" className="sx-btn is-primary" disabled={!dirty || busy} onClick={async () => { setBusy(true); try { await sx(`medico/prontuario/${chart.number}/anamnese`, { method: 'PUT', json: { value: anam, version: chart.anamnesisVersion } }); setToast({ kind: 'ok', text: 'Anamnese atualizada.' }); await reload(); } catch (e) { fail(e); } finally { setBusy(false); } }}><Icon name="save" size={16} /> Salvar anamnese</button>
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
                      <button type="button" className="sx-btn is-primary" disabled={busy} onClick={async () => { setBusy(true); try { await sx(`medico/prontuario/${chart.number}/atendimentos`, { json: { value: enc } }); setToast({ kind: 'ok', text: 'Atendimento registrado no prontuário.' }); setDirty(false); await reload(); setCtab('atendimentos'); } catch (e) { fail(e); } finally { setBusy(false); } }}><Icon name="save" size={16} /> Registrar atendimento</button>
                    </div>
                  </>
                )}
                {chart.encounters.length ? chart.encounters.map((e) => <EncounterCard key={e.id} e={e} showPrivate />) : !enc && <Empty icon="stethoscope">Nenhum atendimento registrado.</Empty>}
              </div>
            )}

            {ctab === 'exames' && (
              <div className="sx-stack">
                <Panel title="Anexar exame, laudo ou receita" icon="upload">
                  <Uploader categories={['exame', 'laudo', 'receita', 'atestado', 'outro']} extra="Enviar para a área do paciente e avisar por e-mail" onUpload={async (fd) => { try { await sx(`medico/prontuario/${chart.number}/arquivos`, { form: fd }); setToast({ kind: 'ok', text: fd.get('compartilhar') === '1' ? 'Arquivo anexado e paciente avisado.' : 'Arquivo anexado ao prontuário.' }); await reload(); setCtab('exames'); } catch (e) { fail(e); } }} />
                </Panel>
                <Panel title="Arquivos do prontuário" icon="scan">
                  {chart.files.length ? <ul className="sx-files">{chart.files.map((f) => (
                    <FileRow key={f.id} f={f} extra={f.compartilhado ? <Pill tone="ok">Liberado ao paciente</Pill> : <button type="button" className="sx-btn is-ghost is-sm" onClick={async () => { try { await sx(`medico/prontuario/${chart.number}/arquivos/${f.id}/compartilhar`, { method: 'POST', json: {} }); setToast({ kind: 'ok', text: 'Liberado. O paciente foi avisado.' }); await reload(); setCtab('exames'); } catch (e) { fail(e); } }}><Icon name="external" size={14} /> Liberar ao paciente</button>} />
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
                      <button type="button" className="sx-btn is-primary" onClick={async () => { try { await sx(`medico/prontuario/${chart.number}/permissao`, { method: 'POST', json: {} }); setToast({ kind: 'ok', text: 'Pedido enviado. O paciente recebeu um e-mail.' }); await reload(); setCtab('documentos'); } catch (e) { fail(e); } }}><Icon name="mail" size={16} /> Pedir autorização ao paciente</button>
                    )}
                  </div>
                )}
              </Panel>
            )}

            {ctab === 'cadastro' && <FormRenderer schema={PROFILE} value={chart.profile} role="medico" readOnly onChange={() => {}} />}
          </>
        )}
        <Toast toast={toast} onDone={() => setToast(null)} />
      </main>
    </div>
  );
}
