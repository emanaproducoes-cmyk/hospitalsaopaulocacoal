/** Caminho de um arquivo em /public. No Next.js é o próprio caminho; no preview estático recebe o prefixo relativo. */
export function asset(src: string): string {
  if (!src || !src.startsWith('/')) return src;
  const base = (globalThis as { __HBSP_BASE__?: string }).__HBSP_BASE__;
  return base === undefined ? src : base + src.slice(1);
}
