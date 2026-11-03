import type { MetadataRoute } from 'next';
import { site } from '@/lib/data/site';
import { specialties } from '@/lib/data/specialties';
import { doctors } from '@/lib/data/doctors';
import { exams } from '@/lib/data/exams';
import { articles, campaigns } from '@/lib/data/articles';
import { services } from '@/lib/data/services';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ['', '/pronto-atendimento', '/agendar', '/especialidades', '/medicos', '/exames', '/pacientes-e-acompanhantes', '/convenios', '/o-hospital', '/conteudo', '/contato', '/ouvidoria', '/trabalhe-conosco', '/perguntas-frequentes', '/privacidade', '/acessibilidade'];
  return [
    ...staticRoutes.map((r) => ({ url: `${site.url}${r}`, lastModified: now, changeFrequency: 'weekly' as const, priority: r === '' ? 1 : r === '/pronto-atendimento' || r === '/agendar' ? 0.9 : 0.7 })),
    ...specialties.map((s) => ({ url: `${site.url}/especialidades/${s.slug}`, lastModified: new Date(s.updatedAt) })),
    ...doctors.map((d) => ({ url: `${site.url}/medicos/${d.slug}`, lastModified: new Date(d.updatedAt) })),
    ...exams.map((e) => ({ url: `${site.url}/exames/${e.slug}`, lastModified: new Date(e.updatedAt) })),
    ...services.filter((s) => !['pronto-atendimento', 'diagnostico'].includes(s.slug)).map((s) => ({ url: `${site.url}/servicos/${s.slug}`, lastModified: new Date(s.updatedAt) })),
    ...articles.map((a) => ({ url: `${site.url}/conteudo/${a.slug}`, lastModified: new Date(a.updatedAt) })),
    ...campaigns.map((c) => ({ url: `${site.url}/campanhas/${c.slug}`, lastModified: new Date(c.updatedAt) })),
  ];
}
