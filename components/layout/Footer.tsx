import Link from 'next/link';
import { footerLinks, site } from '@/lib/data/site';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/primitives';
import { CookieSettingsButton } from './CookieConsent';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-band">
        <div className="footer-band-glow" aria-hidden="true" />
        <div className="container footer-band-inner">
          <span className="footer-band-icon" aria-hidden="true"><Icon name="siren" size={22} /></span>
          <p><strong>Dor no peito, falta de ar, sinais de AVC ou acidente?</strong> Venha imediatamente ao pronto atendimento, aberto todos os dias.</p>
          <Link href="/pronto-atendimento" className="text-link on-dark">Ver orientações <Icon name="arrow-right" size={16} /></Link>
        </div>
      </div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo variant="white" height={86} />
          <p>Cuidando de Cacoal e da região desde {site.foundedYear}. Uma instituição beneficente, feita de pessoas que acolhem.</p>
          <ul className="footer-social">
            <li><a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram (abre em nova aba)"><Icon name="instagram" /></a></li>
            <li><a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook (abre em nova aba)"><Icon name="facebook" /></a></li>
            <li><a href={`https://wa.me/${site.contacts.scheduling.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp (abre em nova aba)"><Icon name="whatsapp" /></a></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Atendimento</h2>
          <ul className="footer-links">{footerLinks.atendimento.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="footer-title">O hospital</h2>
          <ul className="footer-links">{footerLinks.hospital.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="footer-title">Institucional</h2>
          <ul className="footer-links">{footerLinks.institucional.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </div>
        <address className="footer-contact">
          <h2 className="footer-title">Fale com a gente</h2>
          <p><Icon name="pin" size={18} /> <span>{site.address.street} – {site.address.district}<br />{site.address.city} – {site.address.state}, {site.address.zip}</span></p>
          <p><Icon name="whatsapp" size={18} /> <span>Agendamentos: <a href={`tel:${site.contacts.scheduling.tel}`}>{site.contacts.scheduling.label}</a></span></p>
          <p><Icon name="child" size={18} /> <span>Plantão pediátrico: <a href={`tel:${site.contacts.pediatricOnCall.tel}`}>{site.contacts.pediatricOnCall.label}</a></span></p>
        </address>
      </div>
      <div className="container footer-legal">
        <p>© 2026 {site.name}. Todos os direitos reservados.</p>
        <p>Conteúdo informativo: não substitui a consulta com um profissional de saúde.</p>
        <p className="footer-legal-links">
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/privacidade#cookies">Cookies</Link>
          <CookieSettingsButton />
          <Link href="/acessibilidade">Acessibilidade</Link>
          <Link href="/ouvidoria">Ouvidoria</Link>
        </p>
      </div>
    </footer>
  );
}
