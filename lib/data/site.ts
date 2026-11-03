/**
 * FONTE ÚNICA de dados institucionais.
 * Qualquer telefone, endereço ou horário exibido no site deve vir daqui.
 * Fonte pública: hmsaopaulo.com.br (consultado em 02/11/2026).
 * Itens com `pending: true` precisam ser confirmados pelo hospital antes da publicação.
 */

export const SHOW_VALIDATION_FLAGS = process.env.NEXT_PUBLIC_SHOW_VALIDATION_FLAGS !== 'false';

export const site = {
  name: 'Hospital Beneficente São Paulo de Cacoal',
  shortName: 'Hospital São Paulo',
  acronym: 'HBSP',
  tagline: 'Cuidado que acolhe. Saúde que acompanha você.',
  description:
    'Hospital em Cacoal (RO) desde 1975, com pronto atendimento, centro cirúrgico, internação, diagnóstico e 30 especialidades. Agende pelo WhatsApp.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hmsaopaulo.com.br',
  foundedYear: 1975,
  founder: 'Dr. Toshio Shiokawa',
  legalName: { value: 'Razão social e CNPJ a validar com o hospital', pending: true },
  technicalDirector: { value: 'Responsável técnico (CRM) a validar', pending: true },

  address: {
    street: 'Av. São Paulo, 2539',
    district: 'Jardim Clodoaldo',
    city: 'Cacoal',
    state: 'RO',
    zip: '76963-617',
    full: 'Av. São Paulo, 2539 – Jardim Clodoaldo, Cacoal – RO, 76963-617',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Hospital+S%C3%A3o+Paulo+Av.+S%C3%A3o+Paulo+2539+Cacoal+RO',
    embedUrl:
      'https://maps.google.com/maps?q=Av.%20S%C3%A3o%20Paulo%2C%202539%2C%20Jardim%20Clodoaldo%2C%20Cacoal%20-%20RO&z=16&output=embed',
  },

  contacts: {
    scheduling: { label: '(69) 99305-0030', tel: '+5569993050030', whatsapp: '5569993050030' },
    pediatricOnCall: { label: '(69) 3441-4611', tel: '+556934414611' },
    email: { value: 'E-mail institucional a validar', pending: true },
    ombudsman: { value: 'Canal de ouvidoria a validar (use o formulário)', pending: true },
  },

  emergency: {
    status: 'Pronto atendimento todos os dias',
    hours: { value: '24 horas', pending: true }, // site atual: "24H" no menu x "todos os dias" no card
    publicEmergency: [
      { label: 'SAMU', number: '192' },
      { label: 'Bombeiros', number: '193' },
    ],
  },

  social: {
    instagram: 'https://www.instagram.com/hospitalsaopaulocacoal/',
    facebook: 'https://www.facebook.com/hospitalsaopaulocacoal',
  },

  policyVersion: '2026-11',
} as const;

export const nav = [
  {
    label: 'Atendimento',
    href: '/pronto-atendimento',
    children: [
      { label: 'Pronto atendimento', href: '/pronto-atendimento', desc: 'Quando vir, o que trazer e como chegar' },
      { label: 'Agendar consulta ou exame', href: '/agendar', desc: 'Assistente em 4 passos pelo WhatsApp' },
      { label: 'Centro cirúrgico', href: '/servicos/centro-cirurgico', desc: 'Cirurgias eletivas e de urgência' },
      { label: 'Internação', href: '/servicos/internacao', desc: 'Como funciona e o que levar' },
      { label: 'Plantão pediátrico', href: '/servicos/plantao-pediatrico', desc: 'Atendimento para crianças' },
      { label: 'Convênios e particular', href: '/convenios', desc: 'Formas de atendimento' },
    ],
  },
  {
    label: 'Especialidades e médicos',
    href: '/especialidades',
    children: [
      { label: 'Todas as especialidades', href: '/especialidades', desc: '30 áreas de cuidado' },
      { label: 'Encontre um médico', href: '/medicos', desc: 'Busque por nome ou especialidade' },
      { label: 'Saúde da mulher e maternidade', href: '/servicos/maternidade', desc: 'Gestação, parto e pós-parto' },
      { label: 'Saúde da criança', href: '/especialidades/pediatria', desc: 'Pediatria e subespecialidades' },
    ],
  },
  { label: 'Exames', href: '/exames' },
  { label: 'Pacientes e acompanhantes', href: '/pacientes-e-acompanhantes' },
  { label: 'O hospital', href: '/o-hospital' },
  { label: 'Conteúdo', href: '/conteudo' },
] as const;

export const footerLinks = {
  atendimento: [
    { label: 'Pronto atendimento', href: '/pronto-atendimento' },
    { label: 'Agendar consulta', href: '/agendar' },
    { label: 'Exames e preparo', href: '/exames' },
    { label: 'Convênios e particular', href: '/convenios' },
    { label: 'Pacientes e acompanhantes', href: '/pacientes-e-acompanhantes' },
  ],
  hospital: [
    { label: 'Nossa história', href: '/o-hospital' },
    { label: 'Especialidades', href: '/especialidades' },
    { label: 'Corpo clínico', href: '/medicos' },
    { label: 'Trabalhe conosco', href: '/trabalhe-conosco' },
    { label: 'Conteúdo e saúde', href: '/conteudo' },
  ],
  institucional: [
    { label: 'Contato e localização', href: '/contato' },
    { label: 'Ouvidoria e denúncias', href: '/ouvidoria' },
    { label: 'Perguntas frequentes', href: '/perguntas-frequentes' },
    { label: 'Privacidade e cookies (LGPD)', href: '/privacidade' },
    { label: 'Acessibilidade', href: '/acessibilidade' },
  ],
};
