/**
 * FONTE ÚNICA de dados institucionais.
 * Qualquer telefone, endereço ou horário exibido no site deve vir daqui.
 * Fonte pública: hmsaopaulo.com.br (consultado em 02/11/2026).
 */

export const SHOW_VALIDATION_FLAGS = false;

export const site = {
  name: 'Hospital Beneficente São Paulo de Cacoal',
  shortName: 'Hospital São Paulo',
  acronym: 'HBSP',
  tagline: 'Cuidado que acolhe. Saúde que acompanha você.',
  description:
    'Hospital em Cacoal (RO) desde 1975, com pronto atendimento, centro cirúrgico, internação, diagnóstico e 30 especialidades. Agende pelo WhatsApp.',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://hospitalsaopaulocacoal.vercel.app',
  foundedYear: 1975,
  founder: 'Dr. Toshio Shiokawa',

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
  },

  emergency: {
    status: 'Pronto atendimento todos os dias',
  },

  social: {
    instagram: 'https://www.instagram.com/hospitalsaopaulocacoal/',
    facebook: 'https://www.facebook.com/hospitalsaopaulocacoal',
  },

  policyVersion: '2026-11',
} as const;

export interface NavLink { label: string; href: string; desc?: string }
export interface NavItem {
  label: string;
  href: string;
  /** Com children, vira submenu (abre ao passar o mouse); sem children, é um link simples. */
  children?: readonly NavLink[];
  aside?: { title: string; label: string; href: string };
}

export const nav: readonly NavItem[] = [
  {
    label: 'Atendimento',
    href: '/pronto-atendimento',
    children: [
      { label: 'Pronto atendimento', href: '/pronto-atendimento', desc: 'Quando vir, o que trazer e como chegar' },
      { label: 'Agendar consulta ou exame', href: '/agendar', desc: 'Assistente em 4 passos com calendário' },
      { label: 'Minha jornada', href: '/minha-jornada', desc: 'Seus pedidos, lembretes e avaliação' },
      { label: 'Centro cirúrgico', href: '/servicos/centro-cirurgico', desc: 'Cirurgias eletivas e de urgência' },
      { label: 'Cirurgia robótica', href: '/cirurgia-robotica', desc: 'Sistema Toumai: precisão e recuperação' },
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
  {
    label: 'Exames',
    href: '/exames',
    aside: { title: 'Dúvida sobre o preparo?', label: 'O assistente explica e agenda com você', href: '/exames' },
    children: [
      { label: 'Todos os exames', href: '/exames', desc: 'Preparo, documentos e agendamento' },
      { label: 'Tomografia computadorizada', href: '/exames/tomografia-computadorizada', desc: 'Imagens detalhadas em poucos minutos' },
      { label: 'Raio X', href: '/exames/radiografia', desc: 'Rápido e indolor' },
      { label: 'Endoscopia digestiva', href: '/exames/endoscopia-digestiva', desc: 'Esôfago, estômago e duodeno' },
      { label: 'Exames laboratoriais', href: '/exames/exames-laboratoriais', desc: 'Sangue, urina e outros' },
      { label: 'Ecocardiograma', href: '/exames/ecocardiograma', desc: 'Ultrassom do coração' },
    ],
  },
  {
    label: 'Pacientes e acompanhantes',
    href: '/pacientes-e-acompanhantes',
    aside: { title: 'Já agendou?', label: 'Acompanhe tudo em Minha jornada', href: '/minha-jornada' },
    children: [
      { label: 'Guia do paciente', href: '/pacientes-e-acompanhantes', desc: 'Documentos, internação, alta e retorno' },
      { label: 'Visitas e acompanhantes', href: '/pacientes-e-acompanhantes#documentos', desc: 'Direitos e orientações' },
      { label: 'Minha jornada', href: '/minha-jornada', desc: 'Pedidos, lembretes e preparo' },
      { label: 'Avaliar atendimento', href: '/avaliar', desc: 'Conte como foi, em 1 minuto' },
      { label: 'Perguntas frequentes', href: '/perguntas-frequentes', desc: 'Respostas rápidas' },
      { label: 'Ouvidoria', href: '/ouvidoria', desc: 'Elogios, sugestões e reclamações' },
    ],
  },
  {
    label: 'O hospital',
    href: '/o-hospital',
    aside: { title: '51 anos de história', label: 'Conheça quem cuida de Cacoal desde 1975', href: '/o-hospital' },
    children: [
      { label: 'Nossa história', href: '/o-hospital', desc: 'De 8 leitos em 1975 à referência regional' },
      { label: 'Cirurgia robótica', href: '/cirurgia-robotica', desc: 'Tecnologia a serviço do cuidado' },
      { label: 'Trabalhe conosco', href: '/trabalhe-conosco', desc: 'Faça parte da equipe' },
      { label: 'Contato e localização', href: '/contato', desc: 'Endereço, telefones e mapa' },
      { label: 'Privacidade (LGPD)', href: '/privacidade', desc: 'Como cuidamos dos seus dados' },
    ],
  },
  {
    label: 'Conteúdo',
    href: '/conteudo',
    aside: { title: 'Informação que cuida', label: 'Ver todos os conteúdos de saúde', href: '/conteudo' },
    children: [
      { label: 'Todos os conteúdos', href: '/conteudo', desc: 'Saúde em linguagem simples' },
      { label: 'Novembro Azul', href: '/conteudo/novembro-azul', desc: 'A saúde do homem' },
      { label: 'Outubro Rosa', href: '/conteudo/outubro-rosa', desc: 'Prevenção do câncer de mama' },
      { label: 'Parto humanizado', href: '/conteudo/parto-humanizado', desc: 'Como planejar o seu parto' },
      { label: 'Doe sangue', href: '/conteudo/doe-sangue', desc: 'Onde e como doar em Cacoal' },
    ],
  },
];

export const footerLinks = {
  atendimento: [
    { label: 'Pronto atendimento', href: '/pronto-atendimento' },
    { label: 'Agendar consulta', href: '/agendar' },
    { label: 'Minha jornada', href: '/minha-jornada' },
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
