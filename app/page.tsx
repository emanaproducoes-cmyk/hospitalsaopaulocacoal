import Link from 'next/link';
import { HeroVideo51 } from '@/components/sections/HeroVideo51';
import { QuickDecision, EmergencyPanel, ServicesGrid, TrustSection, FinalCTA } from '@/components/sections/HomeSections';
import { UniversalSearch } from '@/components/sections/UniversalSearch';
import { DoctorFinder } from '@/components/sections/DoctorFinder';
import { JourneyTabs } from '@/components/sections/JourneyTabs';
import { PhotoGallery, VideoCard, MapConsent } from '@/components/sections/MediaSections';
import { ArticleCard, LocationCard } from '@/components/sections/ContentBlocks';
import { Carousel } from '@/components/ui/Carousel';
import { SectionHeading } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { articles } from '@/lib/data/articles';
import { gallery, videos } from '@/lib/data/media';

export default function HomePage() {
  return (
    <>
      <HeroVideo51 />
      <QuickDecision />
      <EmergencyPanel />

      <section className="section search-band" aria-labelledby="search-title">
        <div className="container narrow">
          <SectionHeading id="search-title" align="center" eyebrow="Busca" title="Encontre o atendimento certo para você" intro="Digite um sintoma comum, especialidade, exame, nome do médico ou serviço." />
          <UniversalSearch />
        </div>
      </section>

      <ServicesGrid />

      <section className="section alt" aria-labelledby="docs-title">
        <div className="container">
          <div className="section-head-row">
            <SectionHeading id="docs-title" eyebrow="Corpo clínico" title="Encontre um médico" intro="Todos os perfis exibem o registro profissional (CRM, RQE ou CRP) para você conferir." />
            <Link href="/especialidades" className="text-link">Ver as especialidades <Icon name="arrow-right" size={16} /></Link>
          </div>
          <DoctorFinder limit={6} />
        </div>
      </section>

      <section className="section" aria-labelledby="journey-title">
        <div className="container">
          <SectionHeading id="journey-title" eyebrow="Sua jornada" title="Antes, durante e depois do atendimento" intro="Tudo o que você e sua família precisam saber, na ordem em que vão precisar." align="center" />
          <JourneyTabs />
        </div>
      </section>

      <TrustSection />

      <section className="section" aria-labelledby="content-title">
        <div className="container">
          <div className="section-head-row">
            <SectionHeading id="content-title" eyebrow="Conteúdo e saúde" title="Informação que ajuda a decidir" intro="Textos em linguagem simples, organizados pelo que você precisa entender." />
            <Link href="/conteudo" className="text-link">Ver todos os conteúdos <Icon name="arrow-right" size={16} /></Link>
          </div>
          <Carousel label="Conteúdos de saúde">
            {articles.map((a) => <ArticleCard key={a.slug} a={a} />)}
          </Carousel>
        </div>
      </section>

      <section className="section alt" aria-labelledby="gallery-title">
        <div className="container">
          <SectionHeading id="gallery-title" eyebrow="Por dentro do HBSP" title="Pessoas, estrutura e cuidado" intro="Imagens reais do hospital serão publicadas aqui após autorização formal de uso de imagem." />
          <PhotoGallery items={gallery} />
          <h3 className="sub-title">Vídeos</h3>
          <ul className="video-grid">
            {videos.map((v) => <li key={v.id}><VideoCard v={v} /></li>)}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="loc-title">
        <div className="container location-grid">
          <div>
            <SectionHeading id="loc-title" eyebrow="Como chegar" title="Estamos no Jardim Clodoaldo, em Cacoal" />
            <LocationCard />
          </div>
          <MapConsent />
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
