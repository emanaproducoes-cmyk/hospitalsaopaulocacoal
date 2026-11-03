import type { Article, Campaign } from '@/lib/domain/types';

/**
 * Temas publicados pelo hospital no blog (hmsaopaulo.com.br/blog).
 * Textos reescritos em linguagem simples — precisam de revisão clínica (autor + CRM) antes de publicar.
 */
const base = { status: 'review' as const, updatedAt: '2026-11-02', pendingValidation: true, author: 'Equipe HBSP · revisão médica a validar' };

export const articles: Article[] = [
  {
    ...base,
    slug: 'novembro-azul',
    title: 'Novembro Azul: a saúde do homem começa com uma conversa',
    intent: 'prevencao',
    excerpt: 'Por que vale agendar uma consulta com o urologista, mesmo sem sintomas, e o que esperar dela.',
    readingMinutes: 4,
    publishedAt: '2026-11-01',
    relatedSpecialty: 'urologia',
    image: 'campanha-azul',
    cta: { label: 'Agendar consulta com urologia', href: '/agendar?especialidade=urologia&origem=artigo-novembro-azul' },
    body: [
      { text: 'Novembro é o mês de lembrar que cuidar da saúde também é coisa de homem. A campanha chama atenção para o câncer de próstata, mas o convite é mais amplo: pressão, colesterol, diabetes, saúde mental e hábitos de vida.' },
      { heading: 'Por que ir ao médico sem sintomas?', text: 'Muitas doenças começam silenciosas. Uma consulta de rotina permite conversar sobre histórico familiar, solicitar exames quando indicados e decidir, junto com o médico, o melhor momento para cada rastreamento.' },
      { heading: 'O que levar para a consulta', text: 'Documento com foto, cartão do convênio (se houver), lista de remédios em uso e exames anteriores. Anote as dúvidas antes de sair de casa.' },
      { heading: 'Quando procurar atendimento logo', text: 'Dificuldade para urinar, sangue na urina ou dor intensa merecem avaliação rápida. Em caso de dúvida, procure o pronto atendimento.' },
    ],
    source: 'hmsaopaulo.com.br/novembro-azul',
  },
  {
    ...base,
    slug: 'outubro-rosa',
    title: 'Outubro Rosa o ano todo: prevenção do câncer de mama',
    intent: 'prevencao',
    excerpt: 'Autoconhecimento, consulta ginecológica e mamografia na idade certa: entenda cada passo.',
    readingMinutes: 4,
    publishedAt: '2026-10-04',
    relatedSpecialty: 'ginecologia',
    image: 'campanha-rosa',
    cta: { label: 'Agendar consulta ginecológica', href: '/agendar?especialidade=ginecologia&origem=artigo-outubro-rosa' },
    body: [
      { text: 'O diagnóstico precoce amplia as possibilidades de tratamento. Por isso, a prevenção do câncer de mama não termina em outubro.' },
      { heading: 'Conheça o seu corpo', text: 'Observar as mamas no dia a dia ajuda a perceber mudanças. Isso não substitui os exames, mas é um aliado.' },
      { heading: 'Converse com a ginecologista', text: 'A idade e a frequência da mamografia dependem do seu histórico. A consulta é o momento de definir o plano certo para você.' },
    ],
    source: 'hmsaopaulo.com.br/outubro-rosa',
  },
  {
    ...base,
    slug: 'parto-humanizado',
    title: 'Parto humanizado: o que é e como se preparar',
    intent: 'gestacao-infancia',
    excerpt: 'Informação, respeito às escolhas e segurança para a mãe e o bebê.',
    readingMinutes: 5,
    publishedAt: '2026-08-23',
    relatedSpecialty: 'obstetricia',
    image: 'maternidade',
    cta: { label: 'Conhecer a maternidade', href: '/servicos/maternidade' },
    body: [
      { text: 'Parto humanizado é um modelo de cuidado que coloca a gestante no centro das decisões, com informação de qualidade e respeito ao tempo do corpo — sempre com segurança.' },
      { heading: 'Plano de parto', text: 'Converse com a equipe durante o pré-natal sobre suas preferências: acompanhante, posições, alívio da dor e contato pele a pele.' },
      { heading: 'Segurança em primeiro lugar', text: 'A equipe pode recomendar mudanças no plano quando a saúde da mãe ou do bebê exigir. Essa decisão é sempre explicada.' },
    ],
    source: 'hmsaopaulo.com.br/parto-humanizado',
  },
  {
    ...base,
    slug: 'plantao-pediatrico',
    title: 'Febre em criança: quando procurar o plantão pediátrico',
    intent: 'gestacao-infancia',
    excerpt: 'Sinais que pedem avaliação rápida e o que observar em casa.',
    readingMinutes: 3,
    publishedAt: '2026-06-22',
    relatedSpecialty: 'pediatria',
    image: 'pediatria',
    cta: { label: 'Ver plantão pediátrico', href: '/servicos/plantao-pediatrico' },
    body: [
      { text: 'Febre é uma reação comum do corpo a infecções. Na maioria das vezes, pode ser acompanhada em casa com orientação médica.' },
      { heading: 'Procure atendimento rapidamente se houver', text: 'Bebê com menos de 3 meses com febre, dificuldade para respirar, manchas roxas na pele, sonolência excessiva, convulsão ou recusa total de líquidos.' },
      { heading: 'Ligue antes', text: 'O plantão pediátrico atende pelo telefone (69) 3441-4611 para orientar sobre o atendimento.' },
    ],
    source: 'hmsaopaulo.com.br/plantao-pediatrico',
  },
  {
    ...base,
    slug: 'tomografia-computadorizada',
    title: 'Tomografia: entenda o exame antes de fazer',
    intent: 'exames',
    excerpt: 'Como funciona, quanto tempo leva e por que o preparo importa.',
    readingMinutes: 3,
    publishedAt: '2026-02-07',
    image: 'tomografia',
    cta: { label: 'Ver preparo da tomografia', href: '/exames/tomografia-computadorizada' },
    body: [
      { text: 'A tomografia computadorizada gera imagens em "fatias" do corpo. É rápida, indolor e ajuda o médico a ver detalhes que a radiografia comum não mostra.' },
      { heading: 'Contraste', text: 'Alguns exames usam contraste, uma substância que realça vasos e órgãos. Informe alergias, problemas nos rins e se você está grávida.' },
    ],
    source: 'hmsaopaulo.com.br/tomografia-computadorizada',
  },
  {
    ...base,
    slug: 'doe-sangue',
    title: 'Doe sangue: um gesto simples que salva vidas',
    intent: 'comunidade',
    excerpt: 'Quem pode doar, como se preparar e onde doar em Rondônia.',
    readingMinutes: 3,
    publishedAt: '2026-06-22',
    image: 'doacao',
    cta: { label: 'Falar com o hospital', href: '/contato' },
    body: [
      { text: 'Uma única doação pode ajudar vários pacientes. Cirurgias, partos e atendimentos de urgência dependem dos estoques de sangue.' },
      { heading: 'Antes de doar', text: 'Esteja descansado, alimentado (evite gordura) e leve documento com foto. Os critérios completos são definidos pelo hemocentro.' },
    ],
    source: 'hmsaopaulo.com.br/doe-sangue',
  },
];

export const articleIntents: Record<Article['intent'], string> = {
  prevencao: 'Prevenção',
  'gestacao-infancia': 'Gestação e infância',
  exames: 'Entenda seu exame',
  comunidade: 'Comunidade',
  servicos: 'Nossos serviços',
};

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export const campaigns: Campaign[] = [
  {
    slug: 'novembro-azul',
    title: 'Novembro Azul 2026',
    startsAt: '2026-11-01',
    endsAt: '2026-11-30',
    headline: 'Novembro Azul: cuidar de você também é coragem.',
    text: 'Agende sua consulta com a urologia e converse sobre prevenção.',
    utmCampaign: '2026-11_novembro-azul',
    status: 'published',
    updatedAt: '2026-11-02',
  },
];

/** Campanha ativa na data informada (controle de publicação e expiração). */
export const activeCampaign = (date = new Date('2026-11-02')) =>
  campaigns.find((c) => c.status === 'published' && new Date(c.startsAt) <= date && date <= new Date(c.endsAt + 'T23:59:59'));
