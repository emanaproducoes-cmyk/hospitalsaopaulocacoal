import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms/ContactForm';
import { LocationCard } from '@/components/sections/ContentBlocks';
import { MapConsent } from '@/components/sections/MediaSections';
import { PageHero } from '@/components/ui/primitives';
import { TrackedButton } from '@/components/ui/Tracked';
import { site } from '@/lib/data/site';
import { whatsappLink } from '@/lib/integrations/whatsapp';

export const metadata: Metadata = {
  title: 'Contato e localização',
  description: `Endereço, telefone e WhatsApp do Hospital São Paulo: ${site.address.full}.`,
  alternates: { canonical: '/contato' },
};

export default function ContatoPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Contato e localização' }]} eyebrow="Fale com a gente" title="Como podemos ajudar?" intro="Escolha o canal que preferir. Para agendar, o WhatsApp é o caminho mais rápido.">
        <TrackedButton href={whatsappLink({ intent: 'Contato', origin: 'contato' })} event="click_whatsapp" params={{ origin: 'contact-hero' }} variant="green" icon="whatsapp" size="lg">WhatsApp {site.contacts.scheduling.label}</TrackedButton>
        <TrackedButton href={site.address.mapsUrl} event="view_location" params={{ origin: 'contact-hero' }} variant="secondary" icon="route" size="lg">Como chegar</TrackedButton>
      </PageHero>
      <section className="section">
        <div className="container grid-2">
          <div>
            <LocationCard />
            <div style={{ marginTop: '1.25rem' }}><MapConsent /></div>
          </div>
          <div>
            <h2>Envie uma mensagem</h2>
            <p className="muted">Respondemos em horário comercial. Para urgências, não use este formulário.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
