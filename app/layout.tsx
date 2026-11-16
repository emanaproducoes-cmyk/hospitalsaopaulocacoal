import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { JsonLd } from '@/components/ui/primitives';
import { site } from '@/lib/data/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.shortName} de Cacoal · Pronto atendimento, consultas e exames`, template: `%s · ${site.shortName} de Cacoal` },
  description: site.description,
  applicationName: site.name,
  icons: { icon: [{ url: '/brand/favicon-64.png', type: 'image/png' }, { url: '/brand/favicon.svg', type: 'image/svg+xml' }], apple: '/brand/apple-touch-icon.png' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: site.name,
    title: `${site.shortName} de Cacoal · 51 anos cuidando de você`,
    description: site.description,
    images: [{ url: '/images/og/default.jpg', width: 1200, height: 630, alt: 'Hospital São Paulo de Cacoal — 51 anos: você não está sozinho' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.shortName} de Cacoal · 51 anos cuidando de você`,
    description: site.description,
    images: ['/images/og/default.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#294197',
  width: 'device-width',
  initialScale: 1,
};

const hospitalLd = {
  '@context': 'https://schema.org',
  '@type': 'Hospital',
  name: site.name,
  alternateName: [site.shortName, site.acronym],
  url: site.url,
  logo: `${site.url}/brand/logo-hbsp-completa.svg`,
  foundingDate: String(site.foundedYear),
  telephone: site.contacts.scheduling.tel,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.zip,
    addressCountry: 'BR',
  },
  medicalSpecialty: ['Cardiovascular', 'Pediatric', 'Obstetric', 'Surgical', 'Emergency'],
  sameAs: [site.social.instagram, site.social.facebook],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preload" href="/fonts/Poppins-Bold.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Inter-Regular.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <JsonLd data={hospitalLd} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
