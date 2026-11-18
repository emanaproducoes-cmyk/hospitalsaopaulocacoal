import type { Metadata } from 'next';
import { PatientApp } from '@/components/secure/PatientApp';

export const metadata: Metadata = {
  title: 'Área do paciente',
  description: 'Seu prontuário, exames e documentos com segurança.',
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <PatientApp />;
}
