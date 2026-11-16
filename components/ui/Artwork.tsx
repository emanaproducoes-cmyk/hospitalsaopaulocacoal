import { asset } from '@/lib/asset';

/**
 * Foto de apoio das seções (arquivos em /public/images/galeria).
 * Mantém a API antiga (<Artwork name="..."/>) para que todas as páginas usem as fotos reais.
 */
const photos: Record<string, { file: string; alt: string }> = {
  hero: { file: 'equipe', alt: 'Equipe do Hospital São Paulo' },
  equipe: { file: 'equipe', alt: 'Equipe multiprofissional do hospital' },
  recepcao: { file: 'recepcao', alt: 'Recepção do hospital atendendo pacientes' },
  cirurgia: { file: 'centro-cirurgico', alt: 'Equipe cirúrgica em sala de cirurgia' },
  'cirurgia-equipe': { file: 'cirurgia-equipe', alt: 'Cirurgiões durante procedimento' },
  tomografia: { file: 'tomografia', alt: 'Sala de exame de imagem com tomógrafo' },
  'tomografia-paciente': { file: 'tomografia-paciente', alt: 'Paciente realizando exame no tomógrafo' },
  'raio-x': { file: 'raio-x', alt: 'Profissional analisando radiografia de tórax' },
  'raio-x-leitura': { file: 'raio-x-leitura', alt: 'Médicos analisando radiografia no negatoscópio' },
  laboratorio: { file: 'laboratorio', alt: 'Laboratório de análises clínicas' },
  coleta: { file: 'coleta', alt: 'Tubo de coleta de sangue em mão com luva' },
  ultrassom: { file: 'ultrassom', alt: 'Médica realizando exame de ultrassom' },
  maternidade: { file: 'maternidade', alt: 'Equipe com recém-nascido na maternidade' },
  parto: { file: 'parto', alt: 'Pai e mãe com o recém-nascido logo após o parto' },
  pediatria: { file: 'pediatria', alt: 'Médico conversando com criança e mãe em consulta' },
  internacao: { file: 'internacao', alt: 'Médico e enfermeira atendendo paciente internada' },
  consulta: { file: 'consulta', alt: 'Médico conversando com paciente em consultório' },
  enfermagem: { file: 'enfermagem', alt: 'Equipe de enfermagem no corredor do hospital' },
  'sala-espera': { file: 'sala-espera', alt: 'Sala de espera do hospital' },
  hall: { file: 'hall', alt: 'Corredor do hospital' },
  'neuro-imagem': { file: 'neuro-imagem', alt: 'Médico analisando exame de imagem do cérebro' },
  institucional: { file: 'sala-espera', alt: 'Ambiente do hospital' },
  hospital: { file: 'sala-espera', alt: 'Ambiente do hospital' },
  comunidade: { file: 'equipe', alt: 'Equipe do hospital' },
  'campanha-azul': { file: 'consulta', alt: 'Médico em consulta com paciente' },
  doacao: { file: 'coleta', alt: 'Coleta de sangue' },
};

export function Artwork({ name, ratio = '4 / 3', className, alt, small = false }: { name: string; ratio?: string; className?: string; showTag?: boolean; alt?: string; small?: boolean }) {
  const p = photos[name] ?? photos.equipe;
  return (
    <div className={`artwork is-photo ${className ?? ''}`} style={{ aspectRatio: ratio }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(`/images/galeria/${p.file}${small ? '-sm' : ''}.webp`)} alt={alt ?? p.alt} loading="lazy" decoding="async" />
    </div>
  );
}
