import { TopBar, SiteHeader } from './SiteHeader';
import { Footer } from './Footer';
import { MobileActionBar } from './MobileActionBar';
import { CookieConsent } from './CookieConsent';
import { CampaignRibbon } from '@/components/sections/CampaignRibbon';
import { EcosystemBoot } from './EcosystemBoot';
import { AssistantWidget } from '@/components/assistant/AssistantWidget';
import { ChromeGate } from './ChromeGate';

/** Estrutura comum a todas as páginas (landmarks, skip link, barras persistentes). */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <ChromeGate
        top={<><CampaignRibbon /><TopBar /><SiteHeader /></>}
        bottom={<><Footer /><MobileActionBar /><AssistantWidget /><CookieConsent /></>}
      >
        {children}
      </ChromeGate>
      <EcosystemBoot />
    </>
  );
}
