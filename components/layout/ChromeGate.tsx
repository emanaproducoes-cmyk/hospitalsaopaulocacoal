'use client';

import { usePathname } from 'next/navigation';

/** Áreas seguras (acesso, paciente, médico, admin) usam tela própria, sem o cabeçalho e o rodapé do site. */
export const SECURE_PATHS = /^\/(acesso|area-do-paciente|area-do-medico|admin)(\/|$)/;

export function ChromeGate({ top, bottom, children }: { top: React.ReactNode; bottom: React.ReactNode; children: React.ReactNode }) {
  const path = usePathname() || '';
  if (SECURE_PATHS.test(path)) return <div className="sx-root">{children}</div>;
  return (
    <>
      {top}
      <main id="conteudo" tabIndex={-1}>{children}</main>
      {bottom}
    </>
  );
}
