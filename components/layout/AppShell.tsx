import { TopBar, SiteHeader } from './SiteHeader';
import { Footer } from './Footer';
import { MobileActionBar } from './MobileActionBar';
import { CookieConsent } from './CookieConsent';
import { CampaignRibbon } from '@/components/sections/CampaignRibbon';
import { EcosystemBoot } from './EcosystemBoot';
import { AssistantWidget } from '@/components/assistant/AssistantWidget';

/** Estrutura comum a todas as páginas (landmarks, skip link, barras persistentes). */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <CampaignRibbon />
      <TopBar />
      <SiteHeader />
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <MobileActionBar />
      <AssistantWidget />
      <CookieConsent />
      <EcosystemBoot />
    </>
  );
}
