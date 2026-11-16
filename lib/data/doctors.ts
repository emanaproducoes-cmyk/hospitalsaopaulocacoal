import type { Doctor } from '@/lib/domain/types';

/** Corpo clínico em destaque (registro profissional conforme publicado pelo hospital). */
const base = { status: 'published' as const, updatedAt: '2026-11-16', source: 'hmsaopaulo.com.br/equipe', acceptsScheduling: true };
const photo = (slug: string) => `/images/equipe/${slug}`;

export const doctors: Doctor[] = [
  {
    ...base, slug: 'paulo-andre', name: 'Paulo André', title: 'Dr.', specialties: ['clinica-geral'], specialtyLabel: 'Clínica Geral', registry: 'CRM 2015 RO', photo: photo('paulo-andre'),
    approach: 'Escuta com calma, explica com clareza e acompanha de perto.',
    bio: [
      'O Dr. Paulo André é clínico geral do Hospital São Paulo e, para muitos pacientes, a porta de entrada para o cuidado. Na consulta, ele olha para a saúde como um todo: ouve a história com atenção, examina, pede exames apenas quando fazem diferença e explica cada passo de forma simples.',
      'Acompanha adultos em check-ups, queixas do dia a dia e doenças crônicas como pressão alta, diabetes e colesterol. Quando o caso pede um especialista, faz o encaminhamento certo e segue acompanhando o paciente.',
    ],
    focus: ['Check-up e prevenção', 'Hipertensão, diabetes e colesterol', 'Sintomas sem diagnóstico definido', 'Orientação e encaminhamento a especialistas'],
  },
  {
    ...base, slug: 'marja-carolina-rufino', name: 'Marja Carolina Rufino', title: 'Dra.', specialties: ['oftalmologia'], specialtyLabel: 'Oftalmologia', registry: 'CRM-RO 7256 · RQE 2825', photo: photo('marja-carolina-rufino'),
    approach: 'Cuidar da visão é cuidar da autonomia de cada pessoa.',
    bio: [
      'A Dra. Marja Carolina Rufino é oftalmologista, com Registro de Qualificação de Especialista (RQE) na área. Atende crianças, adultos e idosos, da consulta de rotina para óculos à investigação de doenças que podem comprometer a visão.',
      'Dá atenção especial à prevenção: muitas doenças oculares, como o glaucoma, evoluem sem sintomas no início. Por isso, orienta cada paciente sobre a frequência ideal das consultas de acordo com a idade e o histórico.',
    ],
    focus: ['Consulta de rotina e prescrição de óculos', 'Glaucoma e catarata', 'Avaliação da retina em pessoas com diabetes', 'Olho seco, alergias e infecções oculares'],
  },
  {
    ...base, slug: 'jean-michel-couto', name: 'Jean Michel Couto', title: 'Dr.', specialties: ['nefrologia'], specialtyLabel: 'Nefrologia', registry: 'CRM-RO 4948 · RQE 2947/2948', photo: photo('jean-michel-couto'),
    approach: 'Rim saudável se cuida antes dos sintomas.',
    bio: [
      'O Dr. Jean Michel Couto é nefrologista, especialista no cuidado dos rins. Acompanha pacientes com alterações nos exames de função renal, pressão alta de difícil controle e doenças que afetam os rins ao longo do tempo, como o diabetes.',
      'Sua consulta tem foco em prevenção e acompanhamento contínuo: ajustar o tratamento, orientar a alimentação e o uso de medicamentos e evitar que a doença renal avance.',
    ],
    focus: ['Doença renal crônica', 'Pressão alta de difícil controle', 'Proteção dos rins em pessoas com diabetes', 'Cálculos renais de repetição'],
  },
  {
    ...base, slug: 'arthur-ramalho-monfredinho', name: 'Arthur Ramalho Monfredinho', title: 'Dr.', specialties: ['nefrologia'], specialtyLabel: 'Nefrologia', registry: 'CRM-RO 2412 · RQE 2690', photo: photo('arthur-ramalho-monfredinho'),
    approach: 'Explicar bem é parte do tratamento.',
    bio: [
      'O Dr. Arthur Ramalho Monfredinho é nefrologista com Registro de Qualificação de Especialista. Atende pacientes com alterações renais, inchaço, alterações na urina e doenças que exigem acompanhamento prolongado dos rins.',
      'Trabalha de forma integrada com as outras especialidades do hospital, especialmente cardiologia e clínica médica, para que o paciente receba um plano de cuidado único e fácil de seguir.',
    ],
    focus: ['Avaliação de alterações nos exames de urina e sangue', 'Doença renal crônica', 'Hipertensão arterial', 'Acompanhamento de pacientes internados com alterações renais'],
  },
  {
    ...base, slug: 'douglas-bazzi', name: 'Douglas Bazzi', title: 'Dr.', specialties: ['cirurgia-vascular'], specialtyLabel: 'Cirurgia Vascular e Endovascular', registry: 'CRM-RO 4634 · RQE 1270 · RQE 1291', photo: photo('douglas-bazzi'),
    approach: 'Circulação em dia, pernas leves e mais qualidade de vida.',
    bio: [
      'O Dr. Douglas Bazzi é cirurgião vascular e endovascular, com dois Registros de Qualificação de Especialista. Cuida das artérias e veias: das varizes que incomodam no dia a dia às doenças que comprometem a circulação e exigem tratamento especializado.',
      'Sempre que possível, prioriza tratamentos menos invasivos, como os procedimentos endovasculares, realizados por dentro dos vasos, que costumam permitir recuperação mais rápida.',
    ],
    focus: ['Varizes e insuficiência venosa', 'Má circulação nas pernas', 'Trombose venosa', 'Procedimentos endovasculares'],
  },
  {
    ...base, slug: 'marcela-aguiar-de-carvalho', name: 'Marcela Aguiar de Carvalho', title: 'Dra.', specialties: ['cardiologia', 'ecocardiografia'], specialtyLabel: 'Cardiologia e Ecocardiografia', registry: 'CRM-RO 6824', photo: photo('marcela-aguiar-de-carvalho'),
    approach: 'Prevenir é a forma mais gentil de cuidar do coração.',
    bio: [
      'A Dra. Marcela Aguiar de Carvalho atua em cardiologia e ecocardiografia. Na consulta, avalia o risco cardiovascular de cada paciente e monta, junto com ele, um plano de prevenção e tratamento possível de seguir.',
      'Também realiza o ecocardiograma, o ultrassom do coração, que mostra o tamanho das cavidades, o funcionamento das válvulas e a força de contração do músculo cardíaco.',
    ],
    focus: ['Prevenção cardiovascular', 'Pressão alta e colesterol', 'Palpitações e cansaço', 'Ecocardiograma'],
  },
  {
    ...base, slug: 'renan-attilio-santos-marquiori', name: 'Renan Attilio Santos Marquiori', title: 'Dr.', specialties: ['cardiologia'], specialtyLabel: 'Cardiologia', registry: 'CRM-RO 6431 · RQE 2499', photo: photo('renan-attilio-santos-marquiori'),
    approach: 'Cada coração tem uma história — e ela orienta o tratamento.',
    bio: [
      'O Dr. Renan Attilio Santos Marquiori é cardiologista com Registro de Qualificação de Especialista. Atende pacientes que querem cuidar do coração antes que os problemas apareçam e também quem já convive com doenças cardíacas.',
      'Valoriza a conversa franca sobre hábitos, sintomas e exames, para que o paciente entenda o próprio tratamento e participe das decisões.',
    ],
    focus: ['Check-up cardiológico', 'Dor no peito e falta de ar (fora da urgência)', 'Arritmias', 'Insuficiência cardíaca'],
  },
  {
    ...base, slug: 'christiano-thomaz-barbosa', name: 'Christiano Thomaz de A. Monteiro Barbosa', title: '', specialties: ['psicologia'], specialtyLabel: 'Psicologia', registry: 'CRP 24/04047', photo: photo('christiano-thomaz-barbosa'),
    approach: 'Um espaço seguro para falar, ser ouvido e encontrar caminhos.',
    bio: [
      'Christiano Thomaz de A. Monteiro Barbosa é psicólogo. Oferece acolhimento e psicoterapia para quem enfrenta ansiedade, estresse, luto, mudanças importantes ou o impacto emocional de uma doença.',
      'No hospital, também apoia pacientes e familiares durante internações e tratamentos, ajudando a atravessar momentos difíceis com mais informação e equilíbrio.',
    ],
    focus: ['Ansiedade e estresse', 'Luto e situações de crise', 'Apoio emocional durante tratamentos e internações', 'Orientação a familiares'],
  },
];

export const getDoctor = (slug: string) => doctors.find((d) => d.slug === slug);
export const doctorsBySpecialty = (slug: string) => doctors.filter((d) => d.specialties.includes(slug));
export const initials = (name: string) =>
  name
    .split(' ')
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
