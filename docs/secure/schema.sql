-- =====================================================================
-- HBSP · Ambiente seguro (área do paciente, área do médico, administração)
-- Banco: Supabase (Postgres) · região São Paulo (sa-east-1)
--
-- Princípios:
--  * Dados pessoais e clínicos chegam JÁ criptografados pela aplicação (AES-256-GCM,
--    chave fora do banco). O banco nunca vê nome, CPF, e-mail ou dado de saúde em claro.
--  * RLS ligado em TODAS as tabelas e nenhuma política: a chave pública (anon) não lê nada.
--    Só o servidor do site, com a service role, acessa.
--  * Trilha de auditoria só aceita INSERT (sem UPDATE/DELETE) e é encadeada por hash.
-- Execute no SQL Editor do Supabase, uma vez.
-- =====================================================================

create table if not exists users (
  id uuid primary key,
  role text not null check (role in ('paciente','medico','admin')),
  email_enc text not null,
  email_bidx text not null unique,
  password_hash text,
  google_sub text unique,
  email_verified_at timestamptz,
  status text not null check (status in ('ativo','pendente','bloqueado','convidado')),
  failed_attempts int not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  pending_enc text,
  created_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key,
  user_id uuid not null unique references users(id) on delete restrict,
  number text not null unique check (number ~ '^HB[0-9]{4,}SP$'),
  profile_enc text not null,
  name_bidx text not null,
  cpf_bidx text,
  anamnesis_enc text,
  anamnesis_version int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists patients_name_bidx on patients(name_bidx);
create index if not exists patients_cpf_bidx on patients(cpf_bidx);

create table if not exists doctors (
  id uuid primary key,
  user_id uuid not null unique references users(id) on delete restrict,
  name text not null,
  crm text not null,
  uf char(2) not null,
  rqe text,
  specialty text not null,
  created_at timestamptz not null default now(),
  unique (crm, uf)
);

create table if not exists encounters (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete restrict,
  doctor_id uuid not null,            -- usuário autor (médico, ou paciente nas versões de anamnese)
  kind text not null,
  data_enc text not null,
  created_at timestamptz not null default now()
);
create index if not exists encounters_patient on encounters(patient_id, created_at desc);

create table if not exists files (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete restrict,
  uploaded_by uuid not null,
  owner text not null check (owner in ('paciente','medico')),
  category text not null,
  name_enc text not null,
  mime text not null,
  size int not null check (size > 0 and size <= 4194304),
  sha256 char(64) not null,
  storage_path text not null unique,
  shared_with_patient boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists files_patient on files(patient_id, created_at desc);

create table if not exists grants (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete cascade,
  scope text not null check (scope = 'documentos'),
  status text not null check (status in ('pendente','concedido','negado','revogado')),
  expires_at timestamptz,
  requested_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists grants_lookup on grants(patient_id, doctor_id, status);

create table if not exists otps (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  purpose text not null check (purpose in ('login','verificar-email','reset','ativacao')),
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists otps_user on otps(user_id, created_at desc);

create table if not exists sessions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  role text not null,
  token_hash text not null unique,
  mfa_ok boolean not null default false,
  ua_hash text not null,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_user on sessions(user_id);

create table if not exists audit_log (
  id uuid primary key,
  seq bigint not null unique,
  at timestamptz not null,
  actor_id uuid,
  actor_role text,
  action text not null,
  patient_id uuid,
  detail text,
  prev_hash text not null,
  hash text not null
);
create index if not exists audit_patient on audit_log(patient_id, seq desc);
create index if not exists audit_actor on audit_log(actor_id, seq desc);

create table if not exists security_events (
  id uuid primary key,
  at timestamptz not null default now(),
  kind text not null,
  severity text not null check (severity in ('baixa','media','alta','critica')),
  user_id uuid,
  ip_hash text,
  detail text
);
create index if not exists security_events_at on security_events(at desc);

create table if not exists notifications (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user on notifications(user_id, created_at desc);

-- Número do paciente: HB0001SP, HB0002SP... (a aplicação formata a partir da sequência)
create sequence if not exists patient_seq start 1;
create or replace function next_patient_seq() returns bigint language sql security definer set search_path = public as $$ select nextval('patient_seq') $$;
revoke all on function next_patient_seq() from public, anon, authenticated;

-- Trilha de auditoria imutável
create or replace function audit_immutable() returns trigger language plpgsql as $$
begin raise exception 'audit_log é somente inserção'; end $$;
drop trigger if exists audit_no_update on audit_log;
create trigger audit_no_update before update or delete on audit_log for each row execute function audit_immutable();

-- RLS: ligado em tudo, nenhuma política (somente a service role do servidor acessa)
do $$ declare t text; begin
  foreach t in array array['users','patients','doctors','encounters','files','grants','otps','sessions','audit_log','security_events','notifications'] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
    execute format('revoke all on %I from anon, authenticated', t);
  end loop;
end $$;

-- Armazenamento de arquivos: bucket PRIVADO (os arquivos já chegam criptografados)
insert into storage.buckets (id, name, public, file_size_limit) values ('prontuario', 'prontuario', false, 5242880)
on conflict (id) do update set public = false;

-- Limpeza periódica (agende com pg_cron, se disponível): sessões e códigos vencidos
-- select cron.schedule('limpeza-hbsp', '*/30 * * * *', $$ delete from sessions where expires_at < now(); delete from otps where expires_at < now() - interval '1 day'; $$);
