import type { Metadata } from 'next';
import { AdminApp } from '@/components/secure/AdminApp';

export const metadata: Metadata = {
  title: 'Administração',
  description: 'Painel de segurança e acessos.',
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <AdminApp />;
}
