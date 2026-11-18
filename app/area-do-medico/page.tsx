import type { Metadata } from 'next';
import { DoctorApp } from '@/components/secure/DoctorApp';

export const metadata: Metadata = {
  title: 'Área do médico',
  description: 'Prontuário dos pacientes do Hospital São Paulo.',
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <DoctorApp />;
}
