import type { Doctor } from '@/lib/domain/types';

/** Profissionais em destaque publicados em hmsaopaulo.com.br/equipe (consultado em 02/11/2026). */
const base = { status: 'review' as const, updatedAt: '2026-11-02', source: 'hmsaopaulo.com.br/equipe', pendingValidation: true, acceptsScheduling: true };

export const doctors: Doctor[] = [
  { ...base, slug: 'paulo-andre', name: 'Paulo André', title: 'Dr.', specialties: ['clinica-geral'], specialtyLabel: 'Clínica Geral', registry: 'CRM 2015 RO' },
  { ...base, slug: 'marja-carolina-rufino', name: 'Marja Carolina Rufino', title: 'Dra.', specialties: ['oftalmologia'], specialtyLabel: 'Oftalmologia', registry: 'CRM-RO 7256 · RQE 2825' },
  { ...base, slug: 'jean-michel-couto', name: 'Jean Michel Couto', title: 'Dr.', specialties: ['nefrologia'], specialtyLabel: 'Nefrologia', registry: 'CRM-RO 4948 · RQE 2947/2948' },
  { ...base, slug: 'arthur-ramalho-monfredinho', name: 'Arthur Ramalho Monfredinho', title: 'Dr.', specialties: ['nefrologia'], specialtyLabel: 'Nefrologia', registry: 'CRM-RO 2412 · RQE 2690' },
  { ...base, slug: 'douglas-bazzi', name: 'Douglas Bazzi', title: 'Dr.', specialties: ['cirurgia-vascular'], specialtyLabel: 'Cirurgia Vascular e Endovascular', registry: 'CRM-RO 4634 · RQE 1270 · RQE 1291' },
  { ...base, slug: 'marcela-aguiar-de-carvalho', name: 'Marcela Aguiar de Carvalho', title: 'Dra.', specialties: ['cardiologia', 'ecocardiografia'], specialtyLabel: 'Cardiologia e Ecocardiografia', registry: 'CRM-RO 6824' },
  { ...base, slug: 'renan-attilio-santos-marquiori', name: 'Renan Attilio Santos Marquiori', title: 'Dr.', specialties: ['cardiologia'], specialtyLabel: 'Cardiologia', registry: 'CRM-RO 6431 · RQE 2499' },
  { ...base, slug: 'christiano-thomaz-barbosa', name: 'Christiano Thomaz de A. Monteiro Barbosa', title: '', specialties: ['psicologia'], specialtyLabel: 'Psicologia', registry: 'CRP 24/04047' },
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
