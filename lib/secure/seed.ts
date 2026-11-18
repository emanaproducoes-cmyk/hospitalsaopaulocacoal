import { DEMO, cfg } from './config';
import { db, now } from './db';
import { encryptJson, hashPassword, newToken, tokenHash } from './crypto';
import { sendMail } from './mail';
import { createPatient, createUser, findUserByEmail, saveAnamnesis, saveProfile, storeFile } from './services';
import type { FormValue } from '@/lib/clinical/schema';

/**
 * Dados FICTÍCIOS para o modo demonstração (homologação).
 * Contas de teste: veja DEMO_ACCOUNTS. Nunca roda quando o Supabase está configurado.
 */
export const DEMO_PASSWORD = 'Hbsp-Demo-2026';
export const DEMO_ACCOUNTS = {
  paciente: 'maria.ficticia@demo.hbsp',
  medico: 'dra.beatriz@demo.hbsp',
  admin: 'admin@demo.hbsp',
};

let seeding: Promise<void> | null = null;
export function ensureSeed() {
  return (seeding ??= (DEMO ? seed() : bootstrapAdmin()).catch((e) => { seeding = null; throw e; }));
}

/**
 * Produção: na primeira requisição, se ainda não existe administrador, envia um convite
 * para HBSP_ADMIN_EMAIL (o link cria a senha; o acesso exige código por e-mail).
 */
async function bootstrapAdmin() {
  if (!process.env.HBSP_ADMIN_EMAIL) return;
  if ((await db.select('users', { role: 'admin' }, { limit: 1 })).length) return;
  if (await findUserByEmail(cfg.adminEmail)) return;
  const user = await createUser(cfg.adminEmail, 'admin', { status: 'convidado' });
  const token = newToken();
  await db.insert('otps', { user_id: user.id, purpose: 'ativacao', code_hash: tokenHash('ativacao:' + token), expires_at: new Date(Date.now() + 72 * 3600_000).toISOString(), attempts: 0, consumed_at: null, created_at: now() });
  await sendMail({ to: cfg.adminEmail, subject: 'Ative a administração do ambiente seguro HBSP', title: 'Primeiro acesso da administração', lines: ['Este é o convite para criar a senha da conta de administração do ambiente seguro do Hospital São Paulo.', 'O convite vale por 72 horas. Depois, cada acesso também exige um código enviado a este e-mail.'], button: { label: 'Criar senha da administração', href: `${cfg.siteUrl}/acesso?etapa=ativar&token=${token}` }, kind: 'convite' });
}

/** PDF mínimo e válido, só com texto (para os exames fictícios). */
function pdf(lines: string[]): Buffer {
  const content = ['BT', '/F1 13 Tf', '50 780 Td', '16 TL', ...lines.map((l) => `(${l.replace(/[()\\]/g, '')}) Tj T*`), 'ET'].join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
  ];
  let out = '%PDF-1.4\n';
  const offs: number[] = [];
  objs.forEach((o, i) => { offs.push(Buffer.byteLength(out, 'latin1')); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(out, 'latin1');
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}
const asFile = (buf: Buffer, name: string) => new File([new Uint8Array(buf)], name, { type: 'application/pdf' });

async function seed() {
  if ((await db.select('users', {}, { limit: 1 })).length) return;
  const pw = await hashPassword(DEMO_PASSWORD);
  const active = { password_hash: pw, status: 'ativo' as const, email_verified_at: now() };

  await createUser(cfg.adminEmail, 'admin', active);

  const docUser = await createUser(DEMO_ACCOUNTS.medico, 'medico', active);
  const doc = await db.insert('doctors', { user_id: docUser.id, name: 'Dra. Beatriz Lima (fictícia)', crm: '00001', uf: 'RO', rqe: '0001', specialty: 'Cardiologia', created_at: now() });

  const patUser = await createUser(DEMO_ACCOUNTS.paciente, 'paciente', active);
  const p = await createPatient(patUser, DEMO_ACCOUNTS.paciente, { nome: 'Maria Aparecida Souza (fictícia)', nascimento: '1968-04-12', celular: '(69) 90000-0001' });
  const profile: FormValue = {
    identificacao: { nome: 'Maria Aparecida Souza (fictícia)', nascimento: '1968-04-12', sexo: 'Feminino', genero: 'Mulher cis', cpf: '52998224725', rg: '000000', rgOrgao: 'SSP/RO', estadoCivil: 'Casado(a)', racaCor: 'Parda', profissao: 'Professora', escolaridade: 'Superior completo', naturalidade: 'Cacoal/RO', tipoSanguineo: 'O+' },
    contato: { celular: '(69) 90000-0001', email: DEMO_ACCOUNTS.paciente, avisos: true },
    endereco: { cep: '76960000', logradouro: 'Rua Fictícia das Flores', numero: '100', bairro: 'Centro', cidade: 'Cacoal', uf: 'RO' },
    filiacao: { mae: 'Joana Souza (fictícia)', pai: 'Antônio Souza (fictício)' },
    emergencia: [{ nome: 'Carlos Souza (fictício)', parentesco: 'Cônjuge / companheiro(a)', telefone: '(69) 90000-0002' }],
    convenio: { tipo: 'Convênio', operadora: 'Plano Fictício Saúde', carteirinha: '000123', validade: '2027-12' },
  };
  await saveProfile(p, profile, { id: patUser.id, role: 'paciente' });
  const anamnesis: FormValue = {
    alergias: { medicamentos: ['Dipirona'], outras: ['Látex'] },
    alergiasDetalhe: [{ substancia: 'Dipirona', reacao: 'Urticária / coceira', gravidade: 'Moderada' }],
    riscos: { itens: ['Anticoagulado (sangra mais fácil)'] },
    comorbidades: { itens: ['Hipertensão arterial', 'Diabetes tipo 2'] },
    enfermidades: [
      { condicao: 'Hipertensão arterial', tipo: 'De base / crônica', status: 'Controlada', desde: '2012-03', medico: 'Clínica geral · HBSP' },
      { condicao: 'Fibrilação atrial', tipo: 'De base / crônica', status: 'Em tratamento', desde: '2023-08', medico: 'Cardiologia · HBSP' },
      { condicao: 'Pneumonia', tipo: 'Infecciosa', status: 'Tratada / curada', desde: '2021-06', ate: '2021-07' },
    ],
    medicacoes: [
      { nome: 'Losartana', dose: '50 mg', frequencia: '2x ao dia (12/12h)', via: 'Oral', inicio: '2012-03-10', status: 'Em uso', motivo: 'Pressão alta' },
      { nome: 'Metformina', dose: '850 mg', frequencia: '2x ao dia (12/12h)', via: 'Oral', inicio: '2018-05-02', status: 'Em uso', motivo: 'Diabetes' },
      { nome: 'Rivaroxabana', dose: '20 mg', frequencia: '1x ao dia', via: 'Oral', inicio: '2023-08-20', status: 'Em uso', motivo: 'Fibrilação atrial' },
      { nome: 'Amoxicilina', dose: '500 mg', frequencia: '3x ao dia (8/8h)', via: 'Oral', inicio: '2021-06-02', fim: '2021-06-12', status: 'Concluído', motivo: 'Pneumonia' },
    ],
    cirurgias: [{ procedimento: 'Colecistectomia (retirada da vesícula)', data: '2015-09-14', motivo: 'Cálculos na vesícula', tecnica: 'Videolaparoscopia', carater: 'Eletiva (programada)', medico: 'Dr. Fictício Cirurgião', hospital: 'Hospital São Paulo' }],
    internacoes: [{ motivo: 'Pneumonia', setor: 'Enfermaria', entrada: '2021-06-01', alta: '2021-06-06', hospital: 'Hospital São Paulo', desfecho: 'Alta com antibiótico oral' }],
    familia: { itens: ['Hipertensão', 'Diabetes', 'AVC'], obs: 'Mãe hipertensa; pai teve AVC aos 70 anos' },
    habitos: { tabagismo: 'Nunca fumou', alcool: 'Socialmente', atividade: '1–2x por semana', sono: 'Dorme bem' },
    vacinas: { itens: ['Covid-19', 'Influenza (anual)', 'Tétano / dT'], carteira: 'Em dia' },
    medidas: { peso: 72, altura: 162, pressao: '13 por 8' },
  };
  await saveAnamnesis(p, anamnesis, 0, { id: patUser.id, role: 'paciente' });

  await db.insert('encounters', {
    patient_id: p.id,
    doctor_id: docUser.id,
    kind: 'Consulta',
    data_enc: encryptJson({
      atendimento: { tipo: 'Consulta', classificacao: 'Não se aplica', queixa: 'Palpitações ocasionais', hda: 'Relata palpitações há 2 semanas, sem dor no peito. Em uso regular de anticoagulante.' },
      vitais: { pa: '130x80', fc: 88, spo2: 97, peso: 72 },
      avaliacao: { exameFisico: 'Ritmo irregular, sem sopros. Pulmões limpos.', hipoteses: 'Fibrilação atrial em acompanhamento', cid: 'I48', conduta: 'Mantida anticoagulação. Solicitado Holter e ecocardiograma.', examesSolicitados: ['Holter', 'Ecocardiograma', 'Hemograma'] },
      prescricao: [{ medicamento: 'Rivaroxabana', posologia: '20 mg 1x ao dia, com o jantar', duracao: 'Uso contínuo' }],
      desfecho: { retorno: 'Com resultado de exames', orientacoes: 'Evite pular doses do anticoagulante. Procure o pronto atendimento se tiver falta de ar ou dor no peito.', notaPrivada: 'Avaliar ajuste de betabloqueador no retorno.' },
    }, `consulta:${p.id}`),
    created_at: new Date(Date.now() - 6 * 864e5).toISOString(),
  });

  const fresh = (await db.one('patients', { id: p.id }))!;
  await storeFile(fresh, asFile(pdf(['HOSPITAL SAO PAULO - DOCUMENTO FICTICIO', '', 'Hemograma completo', 'Paciente: Maria Aparecida Souza (ficticia) - HB0001SP', '', 'Hemoglobina: 13,2 g/dL   (ref. 12,0 a 15,5)', 'Leucocitos: 7.100 /mm3  (ref. 4.000 a 11.000)', 'Plaquetas: 245.000 /mm3 (ref. 150.000 a 450.000)', '', 'Exame ficticio para demonstracao do sistema.']), 'Hemograma - resultado.pdf'), { uploadedBy: docUser.id, owner: 'medico', category: 'exame', share: true });
  await storeFile(fresh, asFile(pdf(['DOCUMENTO FICTICIO', '', 'Carteira do convenio - Plano Ficticio Saude', 'Titular: Maria Aparecida Souza (ficticia)', 'Numero: 000123']), 'Carteirinha do convênio.pdf'), { uploadedBy: patUser.id, owner: 'paciente', category: 'documento', share: true });
  await db.insert('grants', { patient_id: p.id, doctor_id: doc.id, scope: 'documentos', status: 'pendente', expires_at: null, requested_at: now(), decided_at: null });

  const u2 = await createUser('joao.ficticio@demo.hbsp', 'paciente', active);
  await createPatient(u2, 'joao.ficticio@demo.hbsp', { nome: 'João Pedro Almeida (fictício)', nascimento: '1990-11-02', celular: '(69) 90000-0003' });
}
