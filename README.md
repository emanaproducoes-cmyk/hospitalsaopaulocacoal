# Hospital Beneficente São Paulo de Cacoal — novo site

Este é o ecossistema digital do HBSP: Next.js 15 (App Router) com React 19 e TypeScript, HTML semântico e CSS com tokens de design. Os contratos de API estão prontos para um backend Java (Spring Boot).

## Como rodar

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # build de produção (SSR/SSG)
NEXT_OUTPUT=export npm run build   # exportação estática para a pasta out/
```

Copie `.env.example` para `.env.local` e preencha as variáveis:

- `NEXT_PUBLIC_API_URL`: endereço da API Java. Se ficar vazio, os formulários abrem o WhatsApp com a mensagem pronta.
- `NEXT_PUBLIC_SHOW_VALIDATION_FLAGS=false`: esconde os selos "a validar". Use só depois de validar todos os dados.

Para gerar uma prévia estática sem o Next.js instalado (útil para revisão visual), rode `node scripts/build-preview.mjs`. O resultado fica em `preview/`.

## Estrutura

```
app/                 rotas (home, pronto-atendimento, agendar, especialidades/[slug], medicos/[slug],
                     exames/[slug], servicos/[slug], conteudo/[slug], campanhas/[slug], contato, ouvidoria…)
components/layout    TopBar, SiteHeader (mega-menu, drawer), Footer, MobileActionBar, CookieConsent
components/sections  Hero, decisão rápida, painel PA, busca universal, DoctorFinder, JourneyTabs,
                     galeria + lightbox, vídeos, mapa com consentimento
components/forms     ScheduleWizard (4 passos), ContactForm (contato/ouvidoria)
components/ui        Icon, Tooltip, Carousel (swipe), Reveal, Artwork (placeholder), primitives
lib/domain/types.ts  modelo de dados (Doctor, Specialty, Exam, Campaign, ConsentRecord…)
lib/data/            conteúdo; site.ts é a FONTE ÚNICA de telefones, endereço e horários
lib/integrations/    analytics (Consent Mode), whatsapp (links com contexto), api (cliente Java)
public/brand         logotipos oficiais extraídos do PDF da marca (sem redesenho)
public/images|videos pastas para as mídias reais autorizadas
docs/                PROMPT_AVANCADO.md, MENSURACAO_E_GOVERNANCA.md, api/openapi.yaml
```

## Fotos e vídeos reais

O componente `<Artwork name="..."/>` mostra uma ilustração provisória da marca. Quando houver uma foto autorizada:

1. Salve a foto em `public/images/<pasta>/arquivo.webp`.
2. Troque `<Artwork/>` por `<Image src="/images/..." width height alt="..."/>`.
3. Em `lib/data/media.ts`, marque o item com `consent: 'approved'` e preencha `approvedBy`.

O hero aceita imagem, vídeo mudo com pôster ou placeholder (`MediaHero`).

## Hero em vídeo

A home abre com dois vídeos em sequência, em loop infinito, com fusão entre eles. O componente é `components/sections/HeroVideo51.tsx` e os arquivos ficam em `public/videos/hero/`:

- `hero-51anos-*`: banner "51 anos" com as frases animadas.
- `hero-cuidado-*`: vídeo dos clipes com transições film burn.

Os vídeos estão em 21:9 (1920 × 822, com versão leve de 1280 × 548), em MP4 e WebM, cada um com um pôster em `.webp`. O banner fica num container de até 1280 px (≈1216 × 520 no desktop), sem moldura. Os botões "Agendar consulta" e "Pronto atendimento" ficam sobre a parte inferior do vídeo; no celular, ficam logo abaixo dele.

## Fotos dos médicos (1080×1080)

O perfil do médico (`/medicos/[slug]`) mostra as fotos em 1080×1080. Para cada médico:

1. Salve as fotos em `public/images/equipe/<slug>-1.webp`, `<slug>-2.webp` etc., em formato quadrado de 1080 px.
2. Em `lib/data/doctors.ts`, preencha `photos: ['/images/equipe/<slug>-1.webp']`.

Enquanto não houver foto, o perfil mostra um quadro provisório com as iniciais.
