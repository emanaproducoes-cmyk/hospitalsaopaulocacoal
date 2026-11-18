'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { asset } from '@/lib/asset';
import { ANAMNESIS, PROFILE, ENCOUNTER, type FormValue } from '@/lib/clinical/schema';
import { age, fmtDate, fmtDateTime, fmtSize, SessionError, sx } from './client';
import { FormRenderer } from './FormRenderer';
import { Empty, IdleWatch, Panel, Pill, SecureBadge, Spinner, Tabs, Toast, type ToastT } from './SecureUI';
import type { IconName } from '@/lib/domain/types';

type Tab = 'inicio' | 'dados' | 'saude' | 'atendimentos' | 'arquivos' | 'permissoes' | 'avisos' | 'acessos';
interface FileV { id: string; nome: string; categoria: string; mime: string; tamanho: number; autor: string; origem: 'paciente' | 'medico'; criadoEm: string }
interface Summary {
  number: string;
  profile: FormValue;
  anamnesis: FormValue;
  anamnesisVersion: number;
  highlights: { alergias: string[]; negaAlergias: boolean; riscos: string[]; comorbidades: string[]; medicacoesEmUso: string[] };
  files: FileV[];
  encounters: { id: string; tipo: string; data: FormValue; medico: string; criadoEm: string }[];
  grants: { id: string; medico: string; especialidade?: string; status: string; solicitadoEm: string; expiraEm: string | null }[];
  notifications: { id: string; titulo: string; texto: string; lida: boolean; em: string; link: string | null }[];
}

const g = (v: FormValue, k: string) => (v[k] && !Array.isArray(v[k]) ? (v[k] as Record<string, unknown>) : {});

export function FileRow({ f, extra }: { f: FileV; extra?: React.ReactNode }) {
  const icon: IconName = f.mime === 'application/pdf' ? 'file' : 'scan';
  return (
    <li className="sx-file">
      <span className="sx-file-icon"><Icon name={icon} size={20} /></span>
      <div className="sx-file-info">
        <p className="sx-file-name">{f.nome}</p>
        <p className="sx-file-meta">{f.categoria} · {fmtSize(f.tamanho)} · {fmtDateTime(f.criadoEm)} · {f.autor}</p>
      </div>
      {extra}
      <a className="sx-btn is-ghost is-sm" href={`/api/secure/arquivos/${f.id}`} target="_blank" rel="noopener noreferrer"><Icon name="eye" size={16} /> Abrir</a>
    </li>
  );
}

export function Uploader({ categories, onUpload, extra }: { categories: string[]; onUpload: (fd: FormData) => Promise<void>; extra?: React.ReactNode }) {
  const [cat, setCat] = useState(categories[0]);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [share, setShare] = useState(true);
  const submit = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.set('arquivo', file);
    fd.set('categoria', cat);
    if (extra) fd.set('compartilhar', share ? '1' : '0');
    setBusy(true);
    try { await onUpload(fd); setFile(null); } finally { setBusy(false); }
  };
  return (
    <div className="sx-upload">
      <label className={`sx-drop ${drag ? 'is-drag' : ''} ${file ? 'has-file' : ''}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}>
        <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Icon name="upload" size={26} />
        <span>{file ? `${file.name} · ${fmtSize(file.size)}` : 'Arraste o arquivo ou clique para escolher'}</span>
        <em>PDF, JPG, PNG ou WEBP até 4 MB · criptografado antes de ser guardado</em>
      </label>
      <div className="sx-upload-row">
        <label className="sx-inline"><span>Tipo</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>{categories.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}</select>
        </label>
        {extra && (
          <label className="sx-switch sx-inline">
            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} />
            <span className="sx-switch-ui" aria-hidden="true" /><span>{extra}</span>
          </label>
        )}
        <button type="button" className="sx-btn is-primary" disabled={!file || busy} onClick={submit}><Icon name="upload" size={16} /> {busy ? 'Enviando…' : 'Enviar com segurança'}</button>
      </div>
    </div>
  );
}

export function EncounterCard({ e, showPrivate }: { e: { id: string; tipo: string; data: FormValue; medico: string; criadoEm: string }; showPrivate: boolean }) {
  const at = g(e.data, 'atendimento');
  const av = g(e.data, 'avaliacao');
  const vi = g(e.data, 'vitais');
  const ds = g(e.data, 'desfecho');
  const pres = Array.isArray(e.data.prescricao) ? (e.data.prescricao as Record<string, unknown>[]) : [];
  const vitais = ENCOUNTER[0].groups.find((x) => x.key === 'vitais')!.fields.filter((f) => vi[f.key] !== undefined).map((f) => `${f.label.split(' (')[0]} ${vi[f.key]}`);
  return (
    <article className="sx-enc">
      <header>
        <span className="sx-enc-date"><strong>{new Date(e.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</strong>{new Date(e.criadoEm).getFullYear()}</span>
        <div><p className="sx-enc-type">{e.tipo}</p><p className="sx-enc-doc">{e.medico}</p></div>
        {at.classificacao && at.classificacao !== 'Não se aplica' ? <Pill tone="warn">{String(at.classificacao)}</Pill> : null}
      </header>
      <dl>
        {at.queixa ? <><dt>Queixa</dt><dd>{String(at.queixa)}</dd></> : null}
        {at.hda ? <><dt>História</dt><dd>{String(at.hda)}</dd></> : null}
        {vitais.length ? <><dt>Sinais vitais</dt><dd>{vitais.join(' · ')}</dd></> : null}
        {av.exameFisico ? <><dt>Exame físico</dt><dd>{String(av.exameFisico)}</dd></> : null}
        {av.hipoteses ? <><dt>Hipóteses</dt><dd>{String(av.hipoteses)}{av.cid ? ` (CID ${av.cid})` : ''}</dd></> : null}
        {av.conduta ? <><dt>Conduta</dt><dd>{String(av.conduta)}</dd></> : null}
        {Array.isArray(av.examesSolicitados) ? <><dt>Exames pedidos</dt><dd>{(av.examesSolicitados as string[]).join(', ')}</dd></> : null}
        {pres.length ? <><dt>Prescrição</dt><dd><ul>{pres.map((p, i) => <li key={i}>{[p.medicamento, p.posologia, p.duracao].filter(Boolean).join(' · ')}</li>)}</ul></dd></> : null}
        {ds.orientacoes ? <><dt>Orientações</dt><dd>{String(ds.orientacoes)}</dd></> : null}
        {ds.retorno || ds.retornoData ? <><dt>Retorno</dt><dd>{[ds.retorno, ds.retornoData ? fmtDate(String(ds.retornoData)) : ''].filter(Boolean).join(' · ')}</dd></> : null}
        {showPrivate && ds.notaPrivada ? <><dt className="is-private"><Icon name="lock" size={14} /> Nota privada</dt><dd className="is-private">{String(ds.notaPrivada)}</dd></> : null}
      </dl>
    </article>
  );
}

function completeness(p: FormValue) {
  const id = g(p, 'identificacao'); const ct = g(p, 'contato'); const en = g(p, 'endereco'); const fi = g(p, 'filiacao');
  const checks = [id.nome, id.nascimento, id.cpf, id.sexo, ct.celular, en.cep, en.logradouro, en.cidade, fi.mae, Array.isArray(p.emergencia) && p.emergencia.length, g(p, 'convenio').tipo];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function PatientApp() {
  const [data, setData] = useState<Summary | null>(null);
  const [tab, setTab] = useState<Tab>('inicio');
  const [profile, setProfile] = useState<FormValue>({});
  const [anam, setAnam] = useState<FormValue>({});
  const [section, setSection] = useState(ANAMNESIS[0].key);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<ToastT>(null);
  const [log, setLog] = useState<{ em: string; quem: string; acao: string; detalhe: string | null }[] | null>(null);
  const [saving, setSaving] = useState(false);

  const fail = useCallback((e: unknown) => {
    if (e instanceof SessionError) { window.location.assign('/acesso?area=paciente'); return; }
    setToast({ kind: 'erro', text: (e as Error).message });
  }, []);

  const load = useCallback(() => sx<Summary>('paciente/resumo').then((d) => { setData(d); setProfile(d.profile); setAnam(d.anamnesis); setDirty(false); }).catch(fail), [fail]);
  useEffect(() => {
    sx<{ user: { role: string } | null }>('auth/me').then((m) => {
      if (!m.user || m.user.role !== 'paciente') { window.location.replace('/acesso?area=paciente'); return; }
      load();
      const h = window.location.hash.replace('#', '') as Tab;
      if (h) setTab(h);
    }).catch(fail);
  }, [load, fail]);
  useEffect(() => { if (tab === 'acessos') sx<{ items: NonNullable<typeof log> }>('paciente/acessos').then((r) => setLog(r.items)).catch(fail); }, [tab, fail]);
  useEffect(() => { const b = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', b); return () => window.removeEventListener('beforeunload', b); }, [dirty]);

  const logout = useCallback(async () => { await sx('auth/logout', { method: 'POST', json: {} }).catch(() => {}); window.location.assign('/acesso?area=paciente'); }, []);

  const pending = data?.grants.filter((x) => x.status === 'pendente').length || 0;
  const unread = data?.notifications.filter((n) => !n.lida).length || 0;
  const name = data ? String(g(data.profile, 'identificacao').nomeSocial || g(data.profile, 'identificacao').nome || '') : '';
  const pct = useMemo(() => completeness(profile), [profile]);

  if (!data) return <div className="sx-app"><Spinner label="Abrindo seu ambiente seguro…" /></div>;

  const saveProfile = async () => { setSaving(true); try { await sx('paciente/cadastro', { method: 'PUT', json: { value: profile } }); setToast({ kind: 'ok', text: 'Cadastro salvo com segurança.' }); await load(); } catch (e) { fail(e); } finally { setSaving(false); } };
  const saveAnam = async () => { setSaving(true); try { await sx('paciente/anamnese', { method: 'PUT', json: { value: anam, version: data.anamnesisVersion } }); setToast({ kind: 'ok', text: 'Informações de saúde salvas.' }); await load(); } catch (e) { fail(e); } finally { setSaving(false); } };
  const decide = async (id: string, decisao: string, dias?: number) => { try { await sx(`paciente/permissoes/${id}`, { json: { decisao, dias } }); setToast({ kind: 'ok', text: decisao === 'conceder' ? 'Acesso autorizado.' : decisao === 'negar' ? 'Pedido negado.' : 'Acesso revogado.' }); await load(); } catch (e) { fail(e); } };

  const tabs = [
    { key: 'inicio' as Tab, label: 'Início', icon: 'pin' as IconName },
    { key: 'dados' as Tab, label: 'Meus dados', icon: 'user' as IconName },
    { key: 'saude' as Tab, label: 'Minha saúde', icon: 'heart' as IconName },
    { key: 'atendimentos' as Tab, label: 'Atendimentos', icon: 'stethoscope' as IconName },
    { key: 'arquivos' as Tab, label: 'Exames e documentos', icon: 'file' as IconName },
    { key: 'permissoes' as Tab, label: 'Permissões', icon: 'key' as IconName, badge: pending },
    { key: 'avisos' as Tab, label: 'Avisos', icon: 'bell' as IconName, badge: unread },
    { key: 'acessos' as Tab, label: 'Quem acessou', icon: 'history' as IconName },
  ];
  const changeTab = (k: Tab) => {
    if (dirty && !window.confirm('Há alterações não salvas. Sair mesmo assim?')) return;
    setDirty(false); setProfile(data.profile); setAnam(data.anamnesis);
    setTab(k); window.history.replaceState(null, '', `#${k}`);
    if (k === 'avisos' && unread) sx('paciente/avisos/lidos', { method: 'POST', json: {} }).then(load).catch(() => {});
  };
  const fromDoctor = data.files.filter((f) => f.origem === 'medico');
  const mine = data.files.filter((f) => f.origem === 'paciente');
  const h = data.highlights;

  return (
    <div className="sx-app is-patient">
      <IdleWatch minutes={30} onExpire={logout} />
      <aside className="sx-side">
        <a href="/" className="sx-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset('/brand/logo-hbsp-white.png')} alt="Hospital São Paulo" />
        </a>
        <div className="sx-id">
          <p className="sx-id-label">Nº do paciente</p>
          <p className="sx-id-number">{data.number}</p>
          <p className="sx-id-name">{name}</p>
        </div>
        <Tabs items={tabs} value={tab} onChange={changeTab} label="Seções da área do paciente" />
        <button type="button" className="sx-logout" onClick={logout}><Icon name="logout" size={18} /> Sair com segurança</button>
      </aside>

      <main className="sx-main" id="conteudo">
        <header className="sx-top">
          <div>
            <p className="sx-kicker">Área do paciente</p>
            <h1>{tabs.find((t) => t.key === tab)!.label}</h1>
          </div>
          <SecureBadge compact />
        </header>

        {tab === 'inicio' && (
          <div className="sx-stack">
            <div className="sx-hello">
              <div>
                <p className="sx-kicker">Olá, {name.split(' ')[0]}</p>
                <h2>Seu prontuário, protegido e sempre à mão.</h2>
                <p>{age(g(data.profile, 'identificacao').nascimento)}{g(data.profile, 'identificacao').tipoSanguineo ? ` · Tipo sanguíneo ${g(data.profile, 'identificacao').tipoSanguineo}` : ''}</p>
              </div>
              <div className="sx-number-card">
                <span>Seu número</span>
                <strong>{data.number}</strong>
                <em>Informe na recepção e nas consultas</em>
              </div>
            </div>
            {pending > 0 && (
              <button type="button" className="sx-alert-bar" onClick={() => changeTab('permissoes')}>
                <Icon name="key" size={20} /> {pending === 1 ? 'Um médico pediu' : `${pending} médicos pediram`} acesso aos seus documentos. Toque para decidir.
              </button>
            )}
            <div className="sx-cards">
              <Panel title="Alergias" icon="alert" className={h.alergias.length ? 'is-alert' : ''}>
                {h.alergias.length ? <div className="sx-tags">{h.alergias.map((a) => <Pill key={a} tone="alert">{a}</Pill>)}</div> : <p className="sx-muted">{h.negaAlergias ? 'Nenhuma alergia conhecida.' : 'Não informado. Complete em Minha saúde.'}</p>}
              </Panel>
              <Panel title="Medicações em uso" icon="pill">
                {h.medicacoesEmUso.length ? <ul className="sx-list">{h.medicacoesEmUso.map((m) => <li key={m}>{m}</li>)}</ul> : <p className="sx-muted">Nenhuma informada.</p>}
              </Panel>
              <Panel title="Doenças de base" icon="heart">
                {h.comorbidades.length ? <div className="sx-tags">{h.comorbidades.map((c) => <Pill key={c}>{c}</Pill>)}</div> : <p className="sx-muted">Nenhuma informada.</p>}
              </Panel>
              <Panel title="Cadastro" icon="user">
                <div className="sx-progress"><span style={{ width: `${pct}%` }} /></div>
                <p className="sx-muted">{pct}% completo. {pct < 100 ? 'Completar ajuda a equipe a cuidar melhor de você.' : 'Tudo certo!'}</p>
                {pct < 100 && <button type="button" className="sx-btn is-ghost is-sm" onClick={() => changeTab('dados')}>Completar cadastro</button>}
              </Panel>
            </div>
            <Panel title="Últimos exames e documentos" icon="file" actions={<button type="button" className="sx-btn is-ghost is-sm" onClick={() => changeTab('arquivos')}>Ver todos</button>}>
              {data.files.length ? <ul className="sx-files">{data.files.slice(0, 3).map((f) => <FileRow key={f.id} f={f} />)}</ul> : <Empty icon="file">Quando a equipe liberar exames, eles aparecem aqui e você recebe um aviso.</Empty>}
            </Panel>
          </div>
        )}

        {tab === 'dados' && (
          <>
            <FormRenderer schema={PROFILE} value={profile} role="paciente" onChange={(v) => { setProfile(v); setDirty(true); }} />
            <div className="sx-savebar"><span>{dirty ? 'Alterações não salvas' : 'Tudo salvo'}</span><button type="button" className="sx-btn is-primary" disabled={!dirty || saving} onClick={saveProfile}><Icon name="save" size={16} /> {saving ? 'Salvando…' : 'Salvar cadastro'}</button></div>
          </>
        )}

        {tab === 'saude' && (
          <>
            <div className="sx-seg" role="tablist" aria-label="Partes da anamnese">
              {ANAMNESIS.map((s) => <button key={s.key} type="button" role="tab" aria-selected={section === s.key} className={section === s.key ? 'is-on' : ''} onClick={() => setSection(s.key)}>{s.title}</button>)}
            </div>
            <FormRenderer schema={ANAMNESIS} only={section} value={anam} role="paciente" onChange={(v) => { setAnam(v); setDirty(true); }} />
            <div className="sx-savebar"><span>{dirty ? 'Alterações não salvas' : `Versão ${data.anamnesisVersion} · salva`}</span><button type="button" className="sx-btn is-primary" disabled={!dirty || saving} onClick={saveAnam}><Icon name="save" size={16} /> {saving ? 'Salvando…' : 'Salvar informações de saúde'}</button></div>
          </>
        )}

        {tab === 'atendimentos' && (
          <div className="sx-stack">
            {data.encounters.length ? data.encounters.map((e) => <EncounterCard key={e.id} e={e} showPrivate={false} />) : <Empty icon="stethoscope">Seus atendimentos registrados pela equipe aparecem aqui.</Empty>}
          </div>
        )}

        {tab === 'arquivos' && (
          <div className="sx-stack">
            <Panel title="Enviar documento ou exame" icon="upload">
              <p className="sx-muted">Documentos que você envia só ficam visíveis para um médico depois que você autorizar, em Permissões.</p>
              <Uploader categories={['documento', 'exame', 'laudo', 'receita', 'outro']} onUpload={async (fd) => { try { await sx('paciente/arquivos', { form: fd }); setToast({ kind: 'ok', text: 'Arquivo criptografado e guardado.' }); await load(); } catch (e) { fail(e); } }} />
            </Panel>
            <Panel title="Do hospital para você" icon="stethoscope">
              {fromDoctor.length ? <ul className="sx-files">{fromDoctor.map((f) => <FileRow key={f.id} f={f} />)}</ul> : <Empty icon="file">Nenhum exame liberado ainda.</Empty>}
            </Panel>
            <Panel title="Enviados por você" icon="user">
              {mine.length ? <ul className="sx-files">{mine.map((f) => <FileRow key={f.id} f={f} />)}</ul> : <Empty icon="upload">Você ainda não enviou arquivos.</Empty>}
            </Panel>
          </div>
        )}

        {tab === 'permissoes' && (
          <div className="sx-stack">
            <p className="sx-lead">Você decide quem vê os documentos e exames que <strong>você</strong> enviou. Os registros feitos pelos médicos do hospital ficam no seu prontuário, e cada acesso aparece em “Quem acessou”.</p>
            {data.grants.length ? data.grants.map((gr) => (
              <article key={gr.id} className="sx-grant">
                <span className="sx-grant-icon"><Icon name="stethoscope" size={20} /></span>
                <div>
                  <p className="sx-grant-who">{gr.medico}</p>
                  <p className="sx-muted">{gr.especialidade} · pedido em {fmtDateTime(gr.solicitadoEm)}{gr.status === 'concedido' && gr.expiraEm ? ` · válido até ${fmtDate(gr.expiraEm)}` : ''}</p>
                </div>
                <Pill tone={gr.status === 'concedido' ? 'ok' : gr.status === 'pendente' ? 'warn' : 'neutral'}>{gr.status}</Pill>
                <div className="sx-grant-actions">
                  {gr.status === 'pendente' && <>
                    <button type="button" className="sx-btn is-primary is-sm" onClick={() => decide(gr.id, 'conceder', 30)}>Autorizar por 30 dias</button>
                    <button type="button" className="sx-btn is-ghost is-sm" onClick={() => decide(gr.id, 'conceder', 365)}>Por 1 ano</button>
                    <button type="button" className="sx-btn is-ghost is-sm" onClick={() => decide(gr.id, 'negar')}>Negar</button>
                  </>}
                  {gr.status === 'concedido' && <button type="button" className="sx-btn is-ghost is-sm" onClick={() => decide(gr.id, 'revogar')}>Revogar acesso</button>}
                </div>
              </article>
            )) : <Empty icon="key">Nenhum pedido de acesso até agora.</Empty>}
          </div>
        )}

        {tab === 'avisos' && (
          <div className="sx-stack">
            {data.notifications.length ? data.notifications.map((n) => (
              <article key={n.id} className={`sx-note ${n.lida ? '' : 'is-new'}`}>
                <Icon name="bell" size={18} />
                <div><p className="sx-note-title">{n.titulo}</p><p className="sx-muted">{n.texto}</p><p className="sx-note-date">{fmtDateTime(n.em)}</p></div>
                {n.link && <button type="button" className="sx-btn is-ghost is-sm" onClick={() => changeTab((n.link!.split('#')[1] || 'inicio') as Tab)}>Ver</button>}
              </article>
            )) : <Empty icon="bell">Sem avisos por enquanto.</Empty>}
          </div>
        )}

        {tab === 'acessos' && (
          <Panel title="Registro de acessos ao seu prontuário" icon="history">
            <p className="sx-muted">Transparência total: cada abertura do prontuário e cada arquivo visto fica registrado com data, hora e quem acessou. O registro não pode ser apagado nem alterado.</p>
            {!log ? <Spinner /> : log.length ? (
              <table className="sx-table">
                <thead><tr><th>Quando</th><th>Quem</th><th>O quê</th><th>Motivo</th></tr></thead>
                <tbody>{log.map((l, i) => <tr key={i}><td>{fmtDateTime(l.em)}</td><td>{l.quem}</td><td>{l.acao}</td><td>{l.detalhe || '—'}</td></tr>)}</tbody>
              </table>
            ) : <Empty icon="history">Nenhum acesso registrado.</Empty>}
          </Panel>
        )}
        <Toast toast={toast} onDone={() => setToast(null)} />
      </main>
    </div>
  );
}
