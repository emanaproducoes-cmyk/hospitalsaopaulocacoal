import type { Metadata } from 'next';
import { AuthApp } from '@/components/secure/AuthApp';

export const metadata: Metadata = {
  title: 'Acesso seguro',
  description: 'Entre na área do paciente ou na área do médico do Hospital São Paulo.',
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <AuthApp />;
}
