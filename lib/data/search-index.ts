import { specialties } from './specialties';
import { doctors } from './doctors';
import { exams } from './exams';
import { services } from './services';
import { articles } from './articles';

export type SearchType = 'Especialidade' | 'Médico' | 'Exame' | 'Serviço' | 'Conteúdo' | 'Atalho';

export interface SearchItem {
  type: SearchType;
  title: string;
  subtitle: string;
  href: string;
  terms: string;
}

export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const shortcuts: SearchItem[] = [
  { type: 'Atalho', title: 'Pronto atendimento', subtitle: 'Endereço, rota e quando vir', href: '/pronto-atendimento', terms: 'urgencia emergencia pronto socorro ps dor febre acidente' },
  { type: 'Atalho', title: 'Agendar consulta', subtitle: 'Assistente em 4 passos', href: '/agendar', terms: 'agendar marcar consulta horario' },
  { type: 'Atalho', title: 'Como chegar', subtitle: 'Av. São Paulo, 2539 – Cacoal', href: '/contato', terms: 'endereco localizacao mapa rota telefone contato' },
  { type: 'Atalho', title: 'Convênios', subtitle: 'Convênios e atendimento particular', href: '/convenios', terms: 'convenio plano de saude particular unimed' },
  { type: 'Atalho', title: 'Visitas e acompanhantes', subtitle: 'Regras e orientações', href: '/pacientes-e-acompanhantes', terms: 'visita horario acompanhante internacao documentos alta' },
  { type: 'Atalho', title: 'Ouvidoria', subtitle: 'Elogios, sugestões e reclamações', href: '/ouvidoria', terms: 'ouvidoria reclamacao elogio denuncia' },
];

export const searchIndex: SearchItem[] = [
  ...shortcuts,
  ...specialties.map((s) => ({ type: 'Especialidade' as const, title: s.name, subtitle: s.summary, href: `/especialidades/${s.slug}`, terms: normalize([s.name, ...s.keywords].join(' ')) })),
  ...doctors.map((d) => ({ type: 'Médico' as const, title: `${d.title} ${d.name}`.trim(), subtitle: `${d.specialtyLabel} · ${d.registry}`, href: `/medicos/${d.slug}`, terms: normalize([d.name, d.specialtyLabel, d.registry].join(' ')) })),
  ...exams.map((e) => ({ type: 'Exame' as const, title: e.name, subtitle: e.summary, href: `/exames/${e.slug}`, terms: normalize([e.name, ...e.keywords].join(' ')) })),
  ...services.map((s) => ({ type: 'Serviço' as const, title: s.name, subtitle: s.short, href: s.slug === 'pronto-atendimento' ? '/pronto-atendimento' : s.slug === 'diagnostico' ? '/exames' : `/servicos/${s.slug}`, terms: normalize(s.name + ' ' + s.short) })),
  ...articles.map((a) => ({ type: 'Conteúdo' as const, title: a.title, subtitle: a.excerpt, href: `/conteudo/${a.slug}`, terms: normalize(a.title + ' ' + a.excerpt) })),
];

export function search(query: string, limit = 8): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(/\s+/);
  return searchIndex
    .map((item) => {
      const hay = normalize(item.title) + ' ' + item.terms;
      let score = 0;
      for (const w of words) {
        if (normalize(item.title).startsWith(w)) score += 5;
        if (hay.includes(w)) score += 2;
        else return { item, score: -1 };
      }
      if (item.type === 'Atalho') score += 1;
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}
