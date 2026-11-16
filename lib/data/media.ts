import type { MediaAsset } from '@/lib/domain/types';

/**
 * Biblioteca de mídia (fotos em /public/images/galeria, vídeos em /public/videos/hero).
 * Cada item guarda título, descrição, texto alternativo e categoria editorial.
 */
const m = (x: Omit<MediaAsset, 'author' | 'consent' | 'date'> & Partial<MediaAsset>): MediaAsset => ({
  author: 'Banco de imagens (licença livre)',
  consent: 'approved',
  date: '2026-11-16',
  ...x,
});
const g = (k: string) => `/images/galeria/${k}.webp`;

export const gallery: MediaAsset[] = [
  m({ id: 'g1', kind: 'photo', title: 'Equipe multiprofissional', description: 'Médicos, enfermagem e equipe de apoio trabalhando juntos em cada atendimento.', alt: 'Equipe de médicos e enfermeiros do hospital reunida e sorrindo', src: g('equipe'), category: 'equipe' }),
  m({ id: 'g2', kind: 'photo', title: 'Recepção e acolhimento', description: 'O primeiro contato: orientação clara desde a chegada.', alt: 'Recepcionista atendendo pacientes no balcão da recepção', src: g('recepcao'), category: 'estrutura' }),
  m({ id: 'g3', kind: 'photo', title: 'Centro cirúrgico', description: 'Salas preparadas para cirurgias eletivas e de urgência.', alt: 'Equipe cirúrgica operando em sala ampla e iluminada', src: g('centro-cirurgico'), category: 'estrutura' }),
  m({ id: 'g4', kind: 'photo', title: 'Diagnóstico por imagem', description: 'Exames de imagem analisados por especialistas.', alt: 'Médico analisando imagens de exame em monitores ao lado do equipamento', src: g('diagnostico-imagem'), category: 'tecnologia' }),
  m({ id: 'g5', kind: 'photo', title: 'Maternidade', description: 'Cuidado para a mãe e o bebê desde as primeiras horas.', alt: 'Equipe de enfermagem sorrindo com um recém-nascido no colo', src: g('maternidade'), category: 'cuidado' }),
  m({ id: 'g6', kind: 'photo', title: 'Internação', description: 'Acompanhamento médico e de enfermagem à beira do leito.', alt: 'Médico e enfermeira conversando com paciente internada', src: g('internacao'), category: 'cuidado' }),
  m({ id: 'g7', kind: 'photo', title: 'Laboratório', description: 'Análises clínicas que apoiam diagnósticos e tratamentos.', alt: 'Profissionais trabalhando em bancadas de laboratório', src: g('laboratorio'), category: 'tecnologia' }),
  m({ id: 'g8', kind: 'photo', title: 'Ultrassonografia', description: 'Exames de ultrassom com acompanhamento especializado.', alt: 'Médica realizando exame de ultrassom', src: g('ultrassom'), category: 'tecnologia' }),
  m({ id: 'g9', kind: 'photo', title: 'Ambientes de espera', description: 'Espaços limpos e confortáveis para pacientes e acompanhantes.', alt: 'Sala de espera clara com cadeiras e recepção', src: g('sala-espera'), category: 'estrutura' }),
];

export const videos: MediaAsset[] = [
  m({ id: 'v1', kind: 'video', title: 'Cuidado que acolhe', description: 'Nossa equipe em ação: do acolhimento ao centro cirúrgico.', alt: 'Vídeo institucional com cenas da equipe do hospital', src: '/videos/hero/hero-cuidado-1280.mp4', poster: '/videos/hero/hero-cuidado-poster.webp', duration: '0:27', category: 'estrutura' }),
  m({ id: 'v2', kind: 'video', title: '51 anos: você não está sozinho', description: 'Cinco décadas cuidando das famílias de Cacoal e da região.', alt: 'Vídeo da campanha de 51 anos do hospital', src: '/videos/hero/hero-51anos-1280.mp4', poster: '/videos/hero/hero-51anos-poster.webp', duration: '0:24', category: 'campanha' }),
];
