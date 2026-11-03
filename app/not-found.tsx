import Link from 'next/link';
import { UniversalSearch } from '@/components/sections/UniversalSearch';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container narrow center">
        <p className="eyebrow">Erro 404</p>
        <h1>Não encontramos esta página</h1>
        <p className="lead">Ela pode ter mudado de endereço. Busque o que você precisa ou volte para o início.</p>
        <UniversalSearch />
        <p style={{ marginTop: '2rem' }}><Link href="/" className="btn btn-primary">Voltar para o início</Link></p>
      </div>
    </section>
  );
}
