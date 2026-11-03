import type { Service } from '@/lib/domain/types';

const base = { status: 'review' as const, updatedAt: '2026-11-02', source: 'hmsaopaulo.com.br/servicos', pendingValidation: true };

export const services: Service[] = [
  {
    ...base,
    slug: 'pronto-atendimento',
    name: 'Pronto atendimento',
    short: 'Atendimento todos os dias, com equipe médica.',
    description:
      'O pronto atendimento do HBSP funciona todos os dias e é formado por médicos. Ele recebe situações que precisam de avaliação rápida, mas que não exigem resgate no local.',
    highlights: ['Funciona todos os dias', 'Equipe médica no local', 'Acesso a exames e internação quando necessário'],
    icon: 'emergency',
    cta: { label: 'Ver como chegar', href: '/pronto-atendimento', hint: 'Abre a página com endereço, rota e orientações' },
  },
  {
    ...base,
    slug: 'centro-cirurgico',
    name: 'Centro cirúrgico',
    short: 'Cirurgias eletivas, de urgência e emergência.',
    description:
      'O centro cirúrgico é equipado para cirurgias eletivas (agendadas), de urgência e de emergência, com equipe especializada em anestesia e enfermagem cirúrgica.',
    highlights: ['Cirurgias eletivas e de urgência', 'Avaliação pré-anestésica', 'Recuperação acompanhada pela equipe'],
    icon: 'surgery',
    cta: { label: 'Entender a cirurgia', href: '/servicos/centro-cirurgico', hint: 'Abre a página do centro cirúrgico' },
  },
  {
    ...base,
    slug: 'internacao',
    name: 'Internação',
    short: 'Cuidado contínuo com protocolos baseados em boas práticas.',
    description:
      'A internação segue padrões de conduta baseados nas melhores práticas nacionais, com acompanhamento médico e de enfermagem e orientação clara para a família.',
    highlights: ['Acompanhamento médico e de enfermagem', 'Orientação para acompanhantes', 'Planejamento da alta'],
    icon: 'bed',
    cta: { label: 'Entender a internação', href: '/servicos/internacao', hint: 'Abre o guia de internação e visitas' },
  },
  {
    ...base,
    slug: 'diagnostico',
    name: 'Diagnóstico e exames',
    short: 'Tomografia, raio X, endoscopia e laboratório.',
    description:
      'Exames de imagem, endoscopia e análises laboratoriais para apoiar o diagnóstico e o acompanhamento de tratamentos.',
    highlights: ['Tomografia computadorizada', 'Radiografia e endoscopia', 'Laboratório de análises clínicas'],
    icon: 'scan',
    cta: { label: 'Ver exames e preparo', href: '/exames', hint: 'Abre a lista de exames' },
  },
  {
    ...base,
    slug: 'plantao-pediatrico',
    name: 'Plantão pediátrico',
    short: 'Atendimento para bebês, crianças e adolescentes.',
    description:
      'O plantão pediátrico atende crianças com sintomas que precisam de avaliação. Ligue antes para confirmar o pediatra de plantão.',
    highlights: ['Pediatras de plantão', 'Telefone direto (69) 3441-4611', 'Integração com internação pediátrica'],
    icon: 'child',
    cta: { label: 'Falar com o plantão', href: '/servicos/plantao-pediatrico', hint: 'Abre telefone e orientações do plantão' },
  },
  {
    ...base,
    slug: 'maternidade',
    name: 'Maternidade e saúde da mulher',
    short: 'Pré-natal, parto humanizado e pós-parto.',
    description:
      'Cuidado da gestante do pré-natal ao pós-parto, com obstetrícia, pediatria e orientação para a família. O hospital publica conteúdos sobre parto humanizado.',
    highlights: ['Obstetrícia e ginecologia', 'Orientação sobre parto humanizado', 'Pediatria para o recém-nascido'],
    icon: 'baby',
    cta: { label: 'Planejar o parto', href: '/servicos/maternidade', hint: 'Abre a página de maternidade' },
  },
  {
    ...base,
    slug: 'hotelaria',
    name: 'Hotelaria hospitalar',
    short: 'Conforto, limpeza e alimentação durante a estadia.',
    description:
      'A hotelaria hospitalar cuida do ambiente, da rouparia, da alimentação e do conforto de pacientes e acompanhantes durante a internação.',
    highlights: ['Ambientes higienizados', 'Alimentação orientada por nutrição', 'Apoio ao acompanhante'],
    icon: 'hotel',
    cta: { label: 'Conhecer a estrutura', href: '/servicos/hotelaria', hint: 'Abre a página de hotelaria' },
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
