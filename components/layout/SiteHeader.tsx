'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { nav, site } from '@/lib/data/site';
import { track } from '@/lib/integrations/analytics';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/primitives';
import { SearchDialog } from './SearchDialog';

function A11yControls() {
  const [scale, setScale] = useState(100);
  const [contrast, setContrast] = useState(false);
  useEffect(() => {
    document.documentElement.style.fontSize = scale === 100 ? '' : `${scale}%`;
  }, [scale]);
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', contrast);
  }, [contrast]);
  return (
    <div className="a11y-controls" role="group" aria-label="Acessibilidade">
      <button type="button" onClick={() => setScale((s) => Math.max(90, s - 10))} aria-label="Diminuir texto">A−</button>
      <button type="button" onClick={() => setScale((s) => Math.min(140, s + 10))} aria-label="Aumentar texto">A+</button>
      <button type="button" onClick={() => setContrast((c) => !c)} aria-pressed={contrast} aria-label="Alto contraste">
        <Icon name="contrast" size={15} />
      </button>
    </div>
  );
}

export function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <p className="topbar-status">
          <span className="pulse" aria-hidden="true" />
          <strong>{site.emergency.status}</strong>
          <span className="topbar-addr"> · {site.address.street}, Cacoal</span>
        </p>
        <div className="topbar-right">
          <a href={`tel:${site.contacts.scheduling.tel}`} onClick={() => track('click_emergency', { origin: 'topbar', action: 'call' })}>
            <Icon name="phone" size={15} /> {site.contacts.scheduling.label}
          </a>
          <Link href="/acessibilidade" className="topbar-link">Acessibilidade</Link>
          <A11yControls />
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setDrawer(false);
      }
    };
    const onDoc = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDoc);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDoc);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
  }, [drawer]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container header-inner">
          <Link href="/" className="header-logo" aria-label="Hospital São Paulo — página inicial">
            <Logo variant="header" height={46} priority className="logo-full" />
          </Link>

          <nav ref={navRef} className="main-nav" aria-label="Principal">
            <ul>
              {nav.map((item, i) => (
                <li key={item.href} className={'children' in item ? 'has-children' : ''}>
                  {'children' in item ? (
                    <>
                      <button
                        type="button"
                        className={`nav-link ${isActive(item.href) ? 'is-active' : ''}`}
                        aria-expanded={openMenu === i}
                        aria-controls={`mega-${i}`}
                        onClick={() => setOpenMenu(openMenu === i ? null : i)}
                      >
                        {item.label}
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                      </button>
                      <div id={`mega-${i}`} className={`mega ${openMenu === i ? 'is-open' : ''}`} hidden={openMenu !== i}>
                        <ul>
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link href={c.href} onClick={() => setOpenMenu(null)}>
                                <strong>{c.label}</strong>
                                <span>{c.desc}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div className="mega-aside">
                          <p>Não sabe por onde começar?</p>
                          <Link href="/agendar" onClick={() => setOpenMenu(null)} className="text-link">
                            Fale com a central e nós orientamos <Icon name="arrow-right" size={16} />
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link href={item.href} className={`nav-link ${isActive(item.href) ? 'is-active' : ''}`} aria-current={isActive(item.href) ? 'page' : undefined}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            <button type="button" className="icon-btn search-btn" onClick={() => setSearchOpen(true)} aria-label="Buscar no site (Ctrl+K)">
              <Icon name="search" size={20} />
              <span className="search-btn-label">Buscar</span>
              <kbd>Ctrl K</kbd>
            </button>
            <Link href="/agendar" className="btn btn-primary btn-sm header-cta" onClick={() => track('click_schedule', { origin: 'header' })}>
              <Icon name="calendar" size={18} />
              <span>Agendar</span>
            </Link>
            <button type="button" className="icon-btn menu-btn" aria-expanded={drawer} aria-controls="drawer" onClick={() => setDrawer(true)} aria-label="Abrir menu">
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      <div className={`drawer-backdrop ${drawer ? 'is-open' : ''}`} onClick={() => setDrawer(false)} aria-hidden="true" />
      <div id="drawer" className={`drawer ${drawer ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!drawer}>
        <div className="drawer-head">
          <Logo variant="header" height={38} />
          <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label="Fechar menu">
            <Icon name="close" size={24} />
          </button>
        </div>
        <Link href="/pronto-atendimento" className="drawer-emergency" onClick={() => { setDrawer(false); track('click_emergency', { origin: 'drawer' }); }}>
          <Icon name="emergency" size={22} /> Estou com uma urgência
        </Link>
        <nav aria-label="Menu móvel">
          <ul className="drawer-nav">
            {nav.map((item) => (
              <li key={item.href}>
                {'children' in item ? (
                  <details>
                    <summary>{item.label}</summary>
                    <ul>
                      {item.children.map((c) => (
                        <li key={c.href}><Link href={c.href} onClick={() => setDrawer(false)}>{c.label}</Link></li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link href={item.href} onClick={() => setDrawer(false)}>{item.label}</Link>
                )}
              </li>
            ))}
            <li><Link href="/contato" onClick={() => setDrawer(false)}>Contato e localização</Link></li>
          </ul>
        </nav>
        <div className="drawer-foot">
          <Link href="/agendar" className="btn btn-primary btn-lg" onClick={() => setDrawer(false)}>Agendar consulta</Link>
          <a href={`tel:${site.contacts.scheduling.tel}`} className="btn btn-secondary btn-lg"><Icon name="phone" size={20} /> {site.contacts.scheduling.label}</a>
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
