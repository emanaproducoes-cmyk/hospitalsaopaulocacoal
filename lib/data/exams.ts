import type { Exam } from '@/lib/domain/types';

/**
 * Exames citados em fontes públicas do hospital (história e blog).
 * Preparos NÃO foram publicados pelo hospital: `preparation: null` exibe o aviso "a validar".
 */
const base = { status: 'review' as const, updatedAt: '2026-11-02', pendingValidation: true };
const docs = ['Documento oficial com foto', 'Cartão do convênio (se houver)', 'Pedido médico', 'Exames anteriores relacionados'];

export const exams: Exam[] = [
  {
    ...base,
    slug: 'tomografia-computadorizada',
    name: 'Tomografia computadorizada',
    category: 'imagem',
    summary: 'Imagens detalhadas do interior do corpo em poucos minutos.',
    whatIsIt:
      'A tomografia é um exame de imagem que usa raios X e computador para formar "fatias" do corpo. Ajuda o médico a avaliar órgãos, ossos e vasos com mais detalhe que uma radiografia comum.',
    preparation: null,
    documents: docs,
    duration: null,
    keywords: ['tomografia', 'tc', 'imagem', 'raio x'],
    source: 'hmsaopaulo.com.br/tomografia-computadorizada',
  },
  {
    ...base,
    slug: 'radiografia',
    name: 'Radiografia (raio X)',
    category: 'imagem',
    summary: 'Exame rápido para avaliar ossos, tórax e outras estruturas.',
    whatIsIt:
      'A radiografia usa uma pequena dose de raios X para gerar uma imagem. É muito usada para avaliar fraturas, pulmões e articulações.',
    preparation: null,
    documents: docs,
    duration: null,
    keywords: ['raio x', 'rx', 'fratura'],
    source: 'hmsaopaulo.com.br/o-hospital/nossa-historia',
  },
  {
    ...base,
    slug: 'endoscopia-digestiva',
    name: 'Endoscopia digestiva alta',
    category: 'endoscopia',
    summary: 'Avaliação do esôfago, estômago e início do intestino.',
    whatIsIt:
      'Na endoscopia, um tubo fino e flexível com câmera passa pela boca para examinar o esôfago, o estômago e o duodeno. Normalmente é feita com sedação.',
    preparation: null,
    documents: [...docs, 'Acompanhante maior de idade (em exames com sedação)'],
    duration: null,
    keywords: ['endoscopia', 'estômago', 'gastrite', 'refluxo'],
    source: 'hmsaopaulo.com.br/o-hospital/nossa-historia',
  },
  {
    ...base,
    slug: 'exames-laboratoriais',
    name: 'Exames laboratoriais',
    category: 'laboratorio',
    summary: 'Sangue, urina e outros materiais analisados pelo laboratório.',
    whatIsIt:
      'Os exames laboratoriais analisam amostras como sangue e urina. Eles ajudam no diagnóstico, no acompanhamento de tratamentos e em check-ups.',
    preparation: null,
    documents: docs,
    duration: null,
    keywords: ['exame de sangue', 'hemograma', 'urina', 'laboratório', 'glicose'],
    source: 'hmsaopaulo.com.br/o-hospital/nossa-historia',
  },
  {
    ...base,
    slug: 'ecocardiograma',
    name: 'Ecocardiograma',
    category: 'cardiologico',
    summary: 'Ultrassom do coração, sem radiação e sem dor.',
    whatIsIt:
      'O ecocardiograma usa ultrassom para mostrar o coração em movimento: tamanho das cavidades, funcionamento das válvulas e força de contração.',
    preparation: null,
    documents: docs,
    duration: null,
    keywords: ['eco', 'ecocardiograma', 'coração', 'ultrassom'],
    source: 'hmsaopaulo.com.br/equipe (ecocardiografista)',
  },
];

export const examCategories: Record<Exam['category'], string> = {
  imagem: 'Diagnóstico por imagem',
  laboratorio: 'Laboratório',
  cardiologico: 'Cardiológicos',
  endoscopia: 'Endoscopia',
};

export const getExam = (slug: string) => exams.find((e) => e.slug === slug);
