/**
 * Modelo de domínio do HBSP.
 * Espelha os contratos de docs/api/openapi.yaml (backend Java / Spring Boot).
 * Toda entidade editorial carrega status, data de atualização, revisor e fonte.
 */

export type PublicationStatus = 'draft' | 'review' | 'published' | 'expired';

export interface Editorial {
  status: PublicationStatus;
  updatedAt: string; // ISO 8601
  reviewedBy?: string; // nome + registro (CRM/COREN) quando houver conteúdo clínico
  source?: string; // origem da informação
  /** true quando o dado ainda precisa ser confirmado pelo hospital */
  pendingValidation?: boolean;
}

export type SpecialtyGroup =
  | 'clinicas'
  | 'cirurgicas'
  | 'mulher-crianca'
  | 'diagnostico'
  | 'multiprofissional';

export interface Specialty extends Editorial {
  slug: string;
  name: string;
  group: SpecialtyGroup;
  summary: string; // linguagem simples, 1–2 frases
  whenToSeek: string[];
  keywords: string[];
}

export interface Doctor extends Editorial {
  slug: string;
  name: string;
  title: 'Dr.' | 'Dra.' | '';
  specialties: string[]; // slugs de Specialty
  specialtyLabel: string;
  registry: string; // CRM / RQE / CRP literal
  bio?: string;
  acceptsScheduling: boolean;
  photo?: string;
  /** Fotos do perfil, exibidas em 1080×1080 (ex.: /images/equipe/<slug>-1.webp) */
  photos?: string[];
}

export interface Exam extends Editorial {
  slug: string;
  name: string;
  category: 'imagem' | 'laboratorio' | 'cardiologico' | 'endoscopia';
  summary: string;
  whatIsIt: string;
  preparation: string[] | null; // null = preparo a validar
  documents: string[];
  duration?: string | null;
  keywords: string[];
}

export interface Service extends Editorial {
  slug: string;
  name: string;
  short: string;
  description: string;
  highlights: string[];
  icon: IconName;
  cta: { label: string; href: string; hint: string };
}

export interface Article extends Editorial {
  slug: string;
  title: string;
  intent: 'prevencao' | 'gestacao-infancia' | 'exames' | 'comunidade' | 'servicos';
  excerpt: string;
  body: { heading?: string; text: string }[];
  author: string;
  readingMinutes: number;
  publishedAt: string;
  relatedSpecialty?: string;
  cta: { label: string; href: string };
  image: string;
}

export interface Campaign extends Editorial {
  slug: string;
  title: string;
  startsAt: string;
  endsAt: string;
  headline: string;
  text: string;
  utmCampaign: string;
}

export interface FAQ extends Editorial {
  question: string;
  answer: string;
  topic: 'atendimento' | 'agendamento' | 'internacao' | 'convenios' | 'privacidade';
}

export interface MediaAsset {
  id: string;
  kind: 'photo' | 'video';
  title: string;
  description: string;
  alt: string;
  src: string; // caminho em /public ou URL segura do CMS
  poster?: string;
  duration?: string;
  category: 'estrutura' | 'equipe' | 'cuidado' | 'tecnologia' | 'comunidade' | 'campanha';
  date: string;
  author: string;
  consent: 'pending' | 'approved';
  expiresAt?: string;
  approvedBy?: string;
}

export interface ContactRequest {
  name: string;
  phone: string;
  email?: string;
  topic: 'agendamento' | 'duvida' | 'internacao' | 'convenio' | 'outros';
  message: string;
  origin: string; // página / utm
  consent: ConsentRecord;
}

export interface Feedback {
  type: 'elogio' | 'sugestao' | 'reclamacao' | 'denuncia';
  anonymous: boolean;
  name?: string;
  contact?: string;
  message: string;
  consent: ConsentRecord;
}

export interface ConsentRecord {
  purpose: 'contato' | 'agendamento' | 'ouvidoria' | 'cookies-analytics' | 'cookies-marketing';
  granted: boolean;
  policyVersion: string;
  timestamp: string;
}

export interface ScheduleRequest {
  type: 'consulta' | 'exame' | 'retorno';
  specialty?: string;
  exam?: string;
  doctor?: string;
  period: 'manha' | 'tarde' | 'qualquer';
  insurance: 'particular' | 'convenio' | 'nao-sei';
  name: string;
  phone: string;
  origin: string;
  consent: ConsentRecord;
}

export type IconName =
  | 'emergency'
  | 'calendar'
  | 'microscope'
  | 'doctor'
  | 'surgery'
  | 'bed'
  | 'baby'
  | 'child'
  | 'heart'
  | 'scan'
  | 'phone'
  | 'whatsapp'
  | 'pin'
  | 'clock'
  | 'search'
  | 'shield'
  | 'users'
  | 'file'
  | 'chat'
  | 'arrow-right'
  | 'arrow-left'
  | 'close'
  | 'menu'
  | 'play'
  | 'pause'
  | 'info'
  | 'check'
  | 'star'
  | 'hotel'
  | 'lab'
  | 'accessibility'
  | 'instagram'
  | 'facebook'
  | 'mail'
  | 'route'
  | 'leaf'
  | 'drop'
  | 'plus'
  | 'minus'
  | 'contrast'
  | 'external';
