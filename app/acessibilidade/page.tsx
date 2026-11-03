import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Acessibilidade',
  description: 'Compromisso do Hospital São Paulo de Cacoal com a acessibilidade digital (WCAG 2.2 AA).',
  alternates: { canonical: '/acessibilidade' },
};

export default function AcessibilidadePage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Acessibilidade' }]} eyebrow="Para todas as pessoas" title="Declaração de acessibilidade" intro="Queremos que todas as pessoas consigam usar este site com autonomia." />
      <section className="section">
        <div className="container narrow prose">
          <h2>Nosso compromisso</h2>
          <p>Este site busca atender às diretrizes WCAG 2.2, nível AA, do W3C, e ao Modelo de Acessibilidade em Governo Eletrônico (eMAG) como referência.</p>
          <h2>Recursos disponíveis</h2>
          <ul>
            <li>Link &quot;Pular para o conteúdo&quot; no início de cada página.</li>
            <li>Botões A− e A+ para ajustar o tamanho do texto, e modo de alto contraste, na barra superior.</li>
            <li>Navegação completa por teclado, com foco visível.</li>
            <li>Textos alternativos em imagens e legendas em vídeos com fala.</li>
            <li>Animações reduzidas automaticamente quando o sistema pede menos movimento.</li>
            <li>Busca no site pelo atalho Ctrl + K (ou ⌘ + K).</li>
          </ul>
          <h2>Encontrou uma barreira?</h2>
          <p>Conte para a gente pela <Link href="/ouvidoria">ouvidoria</Link>. Vamos corrigir o mais rápido possível.</p>
        </div>
      </section>
    </>
  );
}
