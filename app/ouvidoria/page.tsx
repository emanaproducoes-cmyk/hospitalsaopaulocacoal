import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms/ContactForm';
import { Icon } from '@/components/ui/Icon';
import { PageHero, PendingBadge } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Ouvidoria, elogios e denúncias',
  description: 'Envie elogios, sugestões, reclamações ou denúncias ao Hospital São Paulo de Cacoal, com opção de anonimato.',
  alternates: { canonical: '/ouvidoria' },
};

export default function OuvidoriaPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Ouvidoria' }]} eyebrow="Sua voz importa" title="Ouvidoria" intro="Elogios, sugestões, reclamações e denúncias nos ajudam a cuidar melhor. Toda manifestação é tratada com sigilo." />
      <section className="section">
        <div className="container with-aside">
          <div>
            <ContactForm mode="ouvidoria" />
          </div>
          <aside>
            <div className="card is-blue">
              <h2>Como tratamos sua mensagem</h2>
              <ol className="prose" style={{ paddingLeft: '1.1rem' }}>
                <li>Registro com número de protocolo.</li>
                <li>Análise pela ouvidoria, com sigilo.</li>
                <li>Resposta pelo canal informado.</li>
              </ol>
              <p className="source-note">Prazos de resposta e canal oficial da ouvidoria: <PendingBadge /></p>
            </div>
            <div className="card">
              <h2><Icon name="shield" size={20} /> Canal de denúncias</h2>
              <p>Denúncias podem ser anônimas. Não é preciso se identificar para relatar condutas que violem a ética ou a lei.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
