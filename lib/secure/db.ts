import { randomUUID } from 'node:crypto';
import { cfg, DEMO } from './config';

/**
 * Acesso ao banco. Em produção: Supabase (Postgres) via API REST com a chave de serviço,
 * que só existe no servidor. As tabelas têm RLS ligado e nenhuma política pública:
 * nem a chave pública do Supabase consegue ler nada (ver docs/secure/schema.sql).
 * No modo demonstração: memória do servidor, com dados fictícios.
 */

export type Role = 'paciente' | 'medico' | 'admin';

export interface UserRow {
  id: string;
  role: Role;
  email_enc: string;
  email_bidx: string;
  password_hash: string | null;
  google_sub: string | null;
  email_verified_at: string | null;
  status: 'ativo' | 'pendente' | 'bloqueado' | 'convidado';
  failed_attempts: number;
  locked_until: string | null;
  last_login_at: string | null;
  pending_enc: string | null; // dados do cadastro aguardando confirmação do e-mail (criptografados)
  created_at: string;
}

export interface PatientRow {
  id: string;
  user_id: string;
  number: string; // HB0001SP
  profile_enc: string; // dados pessoais criptografados
  name_bidx: string;
  cpf_bidx: string | null;
  anamnesis_enc: string | null;
  anamnesis_version: number;
  created_at: string;
  updated_at: string;
}

export interface DoctorRow {
  id: string;
  user_id: string;
  name: string;
  crm: string;
  uf: string;
  rqe: string | null;
  specialty: string;
  created_at: string;
}

export interface EncounterRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  kind: string; // consulta | retorno | internacao | cirurgia | anotacao
  data_enc: string;
  created_at: string;
}

export interface FileRow {
  id: string;
  patient_id: string;
  uploaded_by: string; // user id
  owner: 'paciente' | 'medico';
  category: string; // exame | laudo | documento | receita | outro
  name_enc: string;
  mime: string;
  size: number;
  sha256: string;
  storage_path: string;
  shared_with_patient: boolean;
  created_at: string;
}

export interface GrantRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  scope: 'documentos';
  status: 'pendente' | 'concedido' | 'negado' | 'revogado';
  expires_at: string | null;
  requested_at: string;
  decided_at: string | null;
}

export interface OtpRow {
  id: string;
  user_id: string;
  purpose: 'login' | 'verificar-email' | 'reset' | 'ativacao';
  code_hash: string;
  expires_at: string;
  attempts: number;
  consumed_at: string | null;
  created_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  role: Role;
  token_hash: string;
  mfa_ok: boolean;
  ua_hash: string;
  ip_hash: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
}

export interface AuditRow {
  id: string;
  seq: number;
  at: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  patient_id: string | null;
  detail: string | null;
  prev_hash: string;
  hash: string;
}

export interface SecurityEventRow {
  id: string;
  at: string;
  kind: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  user_id: string | null;
  ip_hash: string | null;
  detail: string | null;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Tables {
  users: UserRow;
  patients: PatientRow;
  doctors: DoctorRow;
  encounters: EncounterRow;
  files: FileRow;
  grants: GrantRow;
  otps: OtpRow;
  sessions: SessionRow;
  audit_log: AuditRow;
  security_events: SecurityEventRow;
  notifications: NotificationRow;
}
export type TableName = keyof Tables;
type Filter = Record<string, string | number | boolean | null>;
interface Opts { order?: string; desc?: boolean; limit?: number }

export interface Db {
  insert<K extends TableName>(t: K, row: Omit<Tables[K], 'id'> & { id?: string }): Promise<Tables[K]>;
  select<K extends TableName>(t: K, f: Filter, o?: Opts): Promise<Tables[K][]>;
  one<K extends TableName>(t: K, f: Filter): Promise<Tables[K] | null>;
  update<K extends TableName>(t: K, f: Filter, patch: Partial<Tables[K]>): Promise<Tables[K][]>;
  remove<K extends TableName>(t: K, f: Filter): Promise<void>;
  nextPatientSeq(): Promise<number>;
}

/* ------------------------------ Supabase ------------------------------ */
class SupabaseDb implements Db {
  private h(extra: Record<string, string> = {}) {
    return { apikey: cfg.supabaseKey, Authorization: `Bearer ${cfg.supabaseKey}`, 'Content-Type': 'application/json', ...extra };
  }
  private q(f: Filter, o?: Opts) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) p.set(k, v === null ? 'is.null' : `eq.${v}`);
    if (o?.order) p.set('order', `${o.order}.${o.desc ? 'desc' : 'asc'}`);
    if (o?.limit) p.set('limit', String(o.limit));
    return p.toString();
  }
  private async call<T>(url: string, init: RequestInit): Promise<T> {
    const res = await fetch(url, { ...init, cache: 'no-store' });
    if (!res.ok) throw new Error(`banco: ${res.status} ${(await res.text()).slice(0, 200)}`);
    const txt = await res.text();
    return (txt ? JSON.parse(txt) : null) as T;
  }
  async insert<K extends TableName>(t: K, row: Omit<Tables[K], 'id'> & { id?: string }) {
    const body = { id: row.id || randomUUID(), ...row };
    const r = await this.call<Tables[K][]>(`${cfg.supabaseUrl}/rest/v1/${t}`, { method: 'POST', headers: this.h({ Prefer: 'return=representation' }), body: JSON.stringify(body) });
    return r[0];
  }
  select<K extends TableName>(t: K, f: Filter, o?: Opts) {
    return this.call<Tables[K][]>(`${cfg.supabaseUrl}/rest/v1/${t}?${this.q(f, o)}`, { headers: this.h() });
  }
  async one<K extends TableName>(t: K, f: Filter) {
    return (await this.select(t, f, { limit: 1 }))[0] ?? null;
  }
  update<K extends TableName>(t: K, f: Filter, patch: Partial<Tables[K]>) {
    return this.call<Tables[K][]>(`${cfg.supabaseUrl}/rest/v1/${t}?${this.q(f)}`, { method: 'PATCH', headers: this.h({ Prefer: 'return=representation' }), body: JSON.stringify(patch) });
  }
  async remove<K extends TableName>(t: K, f: Filter) {
    await this.call(`${cfg.supabaseUrl}/rest/v1/${t}?${this.q(f)}`, { method: 'DELETE', headers: this.h() });
  }
  async nextPatientSeq() {
    return this.call<number>(`${cfg.supabaseUrl}/rest/v1/rpc/next_patient_seq`, { method: 'POST', headers: this.h(), body: '{}' });
  }
}

/* ------------------------- Memória (demonstração) ------------------------- */
type Mem = { tables: Record<string, Record<string, unknown>[]>; seq: number; files: Map<string, Buffer> };
const g = globalThis as unknown as { __hbspMem?: Mem };
export const mem = (): Mem => (g.__hbspMem ??= { tables: {}, seq: 0, files: new Map() });

const matches = (row: Record<string, unknown>, f: Filter) => Object.entries(f).every(([k, v]) => (v === null ? row[k] == null : row[k] === v));

class MemoryDb implements Db {
  private t(name: string) { return (mem().tables[name] ??= []); }
  async insert<K extends TableName>(t: K, row: Omit<Tables[K], 'id'> & { id?: string }) {
    const r = { id: row.id || randomUUID(), ...row } as unknown as Tables[K];
    this.t(t).push(r as unknown as Record<string, unknown>);
    return structuredClone(r);
  }
  async select<K extends TableName>(t: K, f: Filter, o?: Opts) {
    let rows = this.t(t).filter((r) => matches(r, f));
    if (o?.order) {
      const k = o.order;
      const cmp = (x: unknown, y: unknown) => (typeof x === 'number' && typeof y === 'number' ? x - y : String(x) < String(y) ? -1 : String(x) > String(y) ? 1 : 0);
      rows = [...rows].sort((a, b) => cmp(a[k], b[k]) * (o.desc ? -1 : 1));
    }
    if (o?.limit) rows = rows.slice(0, o.limit);
    return structuredClone(rows) as unknown as Tables[K][];
  }
  async one<K extends TableName>(t: K, f: Filter) { return (await this.select(t, f, { limit: 1 }))[0] ?? null; }
  async update<K extends TableName>(t: K, f: Filter, patch: Partial<Tables[K]>) {
    const out: Tables[K][] = [];
    for (const r of this.t(t)) if (matches(r, f)) { Object.assign(r, patch); out.push(structuredClone(r) as unknown as Tables[K]); }
    return out;
  }
  async remove<K extends TableName>(t: K, f: Filter) {
    const arr = this.t(t);
    mem().tables[t] = arr.filter((r) => !matches(r, f));
  }
  async nextPatientSeq() { return ++mem().seq; }
}

export const db: Db = DEMO ? new MemoryDb() : new SupabaseDb();

/** Número do paciente: HB + sequência com 4 dígitos (ou mais) + SP. Ex.: HB0001SP. */
export const formatPatientNumber = (seq: number) => `HB${String(seq).padStart(4, '0')}SP`;
export const isPatientNumber = (s: string) => /^HB\d{4,}SP$/i.test(s.trim());

/* ------------------------------ Arquivos ------------------------------ */
export const storage = {
  async put(path: string, data: Buffer) {
    if (DEMO) { mem().files.set(path, data); return; }
    const res = await fetch(`${cfg.supabaseUrl}/storage/v1/object/${cfg.bucket}/${path}`, {
      method: 'POST',
      headers: { apikey: cfg.supabaseKey, Authorization: `Bearer ${cfg.supabaseKey}`, 'Content-Type': 'application/octet-stream', 'x-upsert': 'false' },
      body: new Uint8Array(data),
    });
    if (!res.ok) throw new Error(`armazenamento: ${res.status}`);
  },
  async get(path: string): Promise<Buffer> {
    if (DEMO) {
      const b = mem().files.get(path);
      if (!b) throw new Error('arquivo não encontrado');
      return b;
    }
    const res = await fetch(`${cfg.supabaseUrl}/storage/v1/object/${cfg.bucket}/${path}`, { headers: { apikey: cfg.supabaseKey, Authorization: `Bearer ${cfg.supabaseKey}` }, cache: 'no-store' });
    if (!res.ok) throw new Error(`armazenamento: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  },
};

export const now = () => new Date().toISOString();
export const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000).toISOString();
