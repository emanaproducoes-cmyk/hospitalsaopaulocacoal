import type { MediaAsset } from '@/lib/domain/types';

/**
 * Biblioteca de mídia com metadados editoriais.
 * Todos os itens estão com consent: 'pending' e usam ilustrações provisórias da marca.
 * Substitua `src` por fotos/vídeos reais em /public/images e /public/videos após autorização de uso de imagem.
 */
const m = (x: Omit<MediaAsset, 'author' | 'consent' | 'date'> & Partial<MediaAsset>): MediaAsset => ({
  author: 'A definir',
  consent: 'pending',
  date: '2026-11-02',
  ...x,
});

export const gallery: MediaAsset[] = [
  m({ id: 'g1', kind: 'photo', title: 'Recepção e acolhimento', description: 'Espaço onde pacientes e famílias são recebidos.', alt: 'Recepção do hospital (imagem provisória)', src: 'recepcao', category: 'estrutura' }),
  m({ id: 'g2', kind: 'photo', title: 'Equipe de enfermagem', description: 'Profissionais que acompanham o paciente 24 horas durante a internação.', alt: 'Equipe de enfermagem (imagem provisória)', src: 'equipe', category: 'equipe' }),
  m({ id: 'g3', kind: 'photo', title: 'Centro cirúrgico', description: 'Salas preparadas para cirurgias eletivas e de urgência.', alt: 'Centro cirúrgico (imagem provisória)', src: 'cirurgia', category: 'estrutura' }),
  m({ id: 'g4', kind: 'photo', title: 'Diagnóstico por imagem', description: 'Tomografia e radiografia para apoiar o diagnóstico.', alt: 'Sala de tomografia (imagem provisória)', src: 'tomografia', category: 'tecnologia' }),
  m({ id: 'g5', kind: 'photo', title: 'Maternidade', description: 'Cuidado para a mãe e o bebê desde as primeiras horas.', alt: 'Maternidade (imagem provisória)', src: 'maternidade', category: 'cuidado' }),
  m({ id: 'g6', kind: 'photo', title: 'Ações na comunidade', description: 'Campanhas de prevenção e doação de sangue em Cacoal.', alt: 'Ação comunitária (imagem provisória)', src: 'comunidade', category: 'comunidade' }),
];

export const videos: MediaAsset[] = [
  m({ id: 'v1', kind: 'video', title: 'Conheça o Hospital São Paulo', description: 'Um passeio pela estrutura e pelas pessoas que fazem o cuidado acontecer.', alt: '', src: '', poster: 'institucional', duration: 'a definir', category: 'estrutura' }),
  m({ id: 'v2', kind: 'video', title: 'Como se preparar para a tomografia', description: 'Orientações práticas antes do exame.', alt: '', src: '', poster: 'tomografia', duration: 'a definir', category: 'tecnologia' }),
  m({ id: 'v3', kind: 'video', title: 'Novembro Azul com a urologia', description: 'Conversa sobre prevenção e saúde do homem.', alt: '', src: '', poster: 'campanha-azul', duration: 'a definir', category: 'campanha' }),
];
