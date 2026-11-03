import type { Metadata } from 'next';
import { TrustSection } from '@/components/sections/HomeSections';
import { PhotoGallery, VideoCard } from '@/components/sections/MediaSections';
import { Icon } from '@/components/ui/Icon';
import { Logo, PageHero, PendingBadge, SectionHeading } from '@/components/ui/primitives';
import { gallery, videos } from '@/lib/data/media';
import { site } from '@/lib/data/site';

export const metadata: Metadata = {
  title: 'O hospital',
  description: 'Fundado em 1975 em Cacoal, o Hospital Beneficente São Paulo cresceu com a região. Conheça nossa história, propósito e estrutura.',
  alternates: { canonical: '/o-hospital' },
};

const values = [
  { icon: 'heart' as const, title: 'Acolhimento', text: 'Receber cada pessoa como gostaríamos que a nossa família fosse recebida.' },
  { icon: 'shield' as const, title: 'Segurança', text: 'Protocolos baseados em boas práticas e atenção a cada detalhe do cuidado.' },
  { icon: 'users' as const, title: 'Comunidade', text: 'Um hospital beneficente que cresce junto com Cacoal e a região.' },
  { icon: 'leaf' as const, title: 'Continuidade', text: 'Acompanhar você antes, durante e depois do atendimento.' },
];

export default function HospitalPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'O hospital' }]} eyebrow={`Desde ${site.foundedYear}`} title="Um hospital que nasceu e cresceu com Cacoal" intro={`Fundado pelo ${site.founder} com 8 leitos, o HBSP se tornou referência regional sem perder o que o define: gente cuidando de gente.`} art={<div className="brand-plate"><Logo variant="completa" height={150} /></div>} />

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Propósito" title="Levar saúde, qualidade de vida e esperança a cada família" align="center" />
          <ul className="services-grid cols-4">
            {values.map((v) => (
              <li key={v.title}><article className="service-card"><span className="service-icon"><Icon name={v.icon} size={28} /></span><h3>{v.title}</h3><p>{v.text}</p></article></li>
            ))}
          </ul>
          <p className="center source-note" style={{ marginTop: '1.5rem' }}>Missão, visão e valores oficiais a validar com a diretoria. <PendingBadge /></p>
        </div>
      </section>

      <TrustSection />

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Nova identidade" title="Um coração entrelaçado: cuidado, vínculo e continuidade" intro="O símbolo HBSP une as letras do nosso nome a um coração formado por um laço. O azul representa confiança e segurança; o verde, vida, esperança e acolhimento." />
          <div className="brand-row">
            <div className="brand-tile"><Logo variant="completa" height={110} /><span>Assinatura completa</span></div>
            <div className="brand-tile"><Logo variant="cacoal" height={110} /><span>Assinatura reduzida 1</span></div>
            <div className="brand-tile is-dark"><Logo variant="white" height={110} /><span>Versão em fundo azul</span></div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHeading eyebrow="Estrutura" title="Por dentro do hospital" />
          <PhotoGallery items={gallery} />
          <h2 className="sub-title">Vídeos institucionais</h2>
          <ul className="video-grid">{videos.map((v) => <li key={v.id}><VideoCard v={v} /></li>)}</ul>
        </div>
      </section>
    </>
  );
}
