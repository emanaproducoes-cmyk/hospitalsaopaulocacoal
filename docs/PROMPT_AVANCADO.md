# Prompt avançado — Novo ecossistema digital do Hospital Beneficente São Paulo de Cacoal (HBSP)

> Versão 2.0 · novembro de 2026 · evolução do "Prompt mestre" entregue pelo hospital.
> Uso: cole este documento integralmente como instrução para uma equipe (ou agente de IA) de design e engenharia. Ele já foi executado neste repositório; as seções 12 e 13 descrevem o que foi implementado e o que ainda depende de validação.

---

## 0. Diagnóstico de partida (o que analisamos)

| Fonte | O que encontramos | Implicação para o novo site |
|---|---|---|
| **hmsaopaulo.com.br** (site atual) | Menu institucional (Institucional, O Hospital, Serviços, Corpo clínico, Blog, Fale conosco). Carrossel no topo. 30 especialidades em grade com imagem. 8 médicos em destaque com CRM/RQE. Agendamento 100% via WhatsApp **(69) 99305-0030**. Plantão pediátrico **(69) 3441-4611**. Endereço: **Av. São Paulo, 2539, Jardim Clodoaldo, CEP 76963-617, Cacoal/RO**. História: fundado em **1975** pelo Dr. Toshio Shiokawa, com 8 leitos; ampliação em 1983 (UTI, laboratório, radiografia, endoscopia); gestão colegiada a partir de 1996. | O conteúdo existe, mas está organizado pela ótica do hospital ("quem somos") e não pela ótica do paciente ("o que eu preciso agora"). Não há busca, não há rota clara para urgência, o menu diz "Pronto atendimento 24H" e o card diz "todos os dias" — **divergência que precisa ser resolvida antes da publicação**. Convênios estão no menu, mas sem lista. |
| **Preview na Vercel** | Protegido por login da Vercel (302 → vercel.com/login). | Não foi possível auditar. Toda a experiência foi recriada a partir das fontes públicas e do prompt mestre. |
| **Instagram @hospitalsaopaulocacoal** | Bloqueado para leitura automatizada (exige login). | Mantido como canal de topo de funil: cada campanha do Instagram deve apontar para uma landing page com UTM (seção 9). |
| **Hospital dos Acidentados (Cacoal)** | Domínio não acessível nesta análise; fontes públicas indicam hospital privado da mesma cidade (Jardim Clodoaldo), com maternidade, ortopedia e cirurgia. | É o **benchmark competitivo local**. O HBSP vence pela clareza da jornada, pela transparência e pelo posicionamento beneficente — não por volume de superlativos. |
| **Nova identidade (PDF)** | Três assinaturas: completa ("Hospital Beneficente São Paulo de Cacoal"), reduzida 1 ("Hospital São Paulo de Cacoal") e reduzida 2 ("Hospital São Paulo"). Símbolo "hbsp" com coração entrelaçado no "o". Cores extraídas do vetor: **azul #294197** e **verde #2FA441**, com gradiente vertical verde→azul nas letras. | Base do sistema de design (seção 4). O verde da marca **não passa** contraste AA para texto pequeno em fundo branco (≈3,2:1), por isso o sistema cria um verde de texto mais escuro, sem alterar o logotipo. |

**Referências internacionais usadas como régua:** Cleveland Clinic (entrada por necessidade e orientação "não sei onde buscar atendimento"), Johns Hopkins Medicine (transparência, acesso financeiro, serviços de apoio), Mayo Clinic (busca universal e conteúdo com revisão clínica), Hospital Sírio-Libanês e Hospital Israelita Albert Einstein (pronto atendimento em destaque, portal do paciente, conteúdo como relacionamento).

---

## 1. Papel

Você é, ao mesmo tempo:

1. **Diretor(a) de marca hospitalar** com experiência em construção de *brand equity* em redes de saúde de referência.
2. **Estrategista de experiência do paciente** (Patient Experience) e de jornadas omnichannel.
3. **Designer UI/UX sênior** especialista em acessibilidade (WCAG 2.2 AA) e *mobile first*.
4. **Arquiteto(a) de informação** e redator(a) de saúde em português brasileiro.
5. **Engenheiro(a) full-stack** em Next.js (App Router, TypeScript), HTML semântico, CSS moderno e integrações com backend Java (Spring Boot) via API REST versionada.

Sua missão: transformar o site do HBSP em um **hub digital de cuidado** — o primeiro ponto de contato de uma relação de longo prazo — e não em um folder institucional.

---

## 2. Estratégia de marca: a pirâmide de ressonância aplicada ao HBSP

Use o modelo de **Customer-Based Brand Equity (pirâmide de ressonância de Keller)** como espinha dorsal. Cada nível tem uma tarefa de UX correspondente.

| Nível | Pergunta do paciente | Objetivo para o HBSP | Como o site entrega |
|---|---|---|---|
| **1. Saliência** (identidade) | "Quem é você?" | Ser lembrado como *o hospital de Cacoal que acolhe desde 1975*. | Logotipo correto por contexto, nome curto "Hospital São Paulo" no cabeçalho, assinatura completa no rodapé e em páginas institucionais. Presença consistente em Google Business Profile, Instagram e WhatsApp. |
| **2. Desempenho** (significado racional) | "Vocês resolvem o meu problema?" | Provar competência com fatos verificáveis. | Pronto atendimento, centro cirúrgico, internação, diagnóstico por imagem, 30 especialidades, corpo clínico com CRM/RQE visível. |
| **3. Imagem** (significado emocional) | "Que tipo de lugar é esse?" | Humano, próximo, beneficente, regional. | Fotos reais da equipe e da estrutura, linguagem acolhedora, histórias da comunidade. Zero banco de imagens genérico. |
| **4. Julgamentos** (razão) | "Posso confiar?" | Credibilidade e consideração. | Linha do tempo com fontes, indicadores com data, conteúdo revisado por médico com CRM e data de revisão, transparência sobre convênios e particular. |
| **5. Sentimentos** (emoção) | "Como me sinto aqui?" | Segurança, calma, acolhimento. | Interface calma, com respiro, poucos elementos por tela e uma ação principal por bloco. Mensagens que reduzem a incerteza ("o que acontece depois do clique"). |
| **6. Ressonância** (relação) | "Esse é o meu hospital." | Lealdade, engajamento ativo e senso de comunidade. | Conteúdo útil por fase da vida, campanhas sazonais (Outubro Rosa, Novembro Azul), doação de sangue, voluntariado, pós-atendimento com pesquisa de satisfação e retorno facilitado. |

**Proposta de valor (posicionamento):**
> *Para as famílias de Cacoal e da Zona da Mata rondoniense, o Hospital Beneficente São Paulo é o hospital que acolhe e acompanha — da urgência ao retorno — com a experiência de quem cuida da região desde 1975.*

**Assinatura de campanha (tagline):** "Cuidado que acolhe. Saúde que acompanha você."

**Pilares de mensagem:** (1) Acolhimento humano · (2) Competência comprovada · (3) Acesso simples · (4) Compromisso beneficente com a comunidade.

---

## 3. Estratégia de experiência: funil por intenção (não por página)

O visitante chega com uma **intenção**. O site deve reconhecer essa intenção em até 5 segundos e levar ao próximo passo em no máximo 3 cliques.

| Intenção | Sinal de entrada | Próximo passo seguro | Conversão | Evento |
|---|---|---|---|---|
| Urgência | "Estou com uma urgência", barra inferior mobile, botão vermelho | Endereço + rota + telefone + orientação SAMU 192 | Clique em rota/ligação | `click_emergency`, `view_location` |
| Consulta | "Quero agendar" | Assistente de 4 passos (tipo → especialidade → período → dados) | WhatsApp com mensagem pré-preenchida ou API | `click_schedule`, `click_whatsapp` |
| Exame | "Preciso fazer um exame" | Página do exame com preparo e documentos | Agendar exame | `view_exam_prep`, `click_schedule` |
| Médico | "Busco um médico" / busca universal | Perfil com CRM/RQE, especialidade e botão de agendamento | Agendar com o médico | `search_doctor`, `click_schedule` |
| Familiar | "Internação e visitas" | Guia antes / durante / depois | Contato ou rota | `view_service`, `view_location` |
| Conteúdo | Instagram, Google, campanha | Artigo revisado → CTA contextual | Agendamento ou inscrição | `content_engagement` |
| Institucional | Empresa, médico, imprensa, doador | Páginas dedicadas (trabalhe conosco, parcerias, ouvidoria) | Formulário | `submit_contact` |

**Microfunil da Home (ordem obrigatória):**
1. Barra superior (aviso + telefone + acessibilidade) → 2. Cabeçalho → 3. Hero com headline e 2 CTAs → 4. Decisão rápida (4 entradas) → 5. Pronto atendimento → 6. Busca universal → 7. Serviços → 8. Encontre um médico → 9. Jornada antes/durante/depois → 10. Confiança (história, números com fonte) → 11. Conteúdo por intenção (carrossel acessível) → 12. Galeria e vídeos → 13. Localização → 14. CTA final → 15. Rodapé completo.

---

## 4. Sistema de design (tokens)

### 4.1 Cores
| Token | HEX | Uso | Contraste em branco |
|---|---|---|---|
| `--brand-blue` | `#294197` | Primária: botões, links, títulos de destaque | 9,1:1 ✅ |
| `--brand-blue-700` | `#1F3278` | Hover / fundos escuros | 11,8:1 ✅ |
| `--brand-navy` | `#14214F` | Texto principal, rodapé | 15,4:1 ✅ |
| `--brand-green` | `#2FA441` | **Somente** decorativo, ícones grandes, marcadores, fundos com texto escuro | 3,2:1 (apenas ≥ 24 px ou não-texto) |
| `--brand-green-700` | `#1D7A2E` | Texto/ícone verde em fundo claro | 5,4:1 ✅ |
| `--surface` | `#FFFFFF` / `--surface-alt` `#F5F8FC` / `--surface-green` `#EEF7F0` | Fundos | — |
| `--ink-muted` | `#4A5876` | Texto secundário | 7,1:1 ✅ |
| `--alert` | `#C0262D` | **Exclusivo** para urgência, erro e avisos críticos | 5,9:1 ✅ |

**Gradiente da marca** (`#2FA441 → #294197`, vertical) apenas em detalhes: filete superior, borda de cartões em foco, ícone do símbolo. Nunca atrás de texto.

### 4.2 Tipografia
- **Títulos:** Poppins 500/700 — geométrica, conversa com o desenho das letras do logotipo.
- **Texto e interface:** Inter 400/500/600/700 — legibilidade máxima em telas pequenas.
- **Acento editorial:** Lora itálico — citações e depoimentos.
- Escala fluida com `clamp()`, base 17 px no mobile, altura de linha 1,6, máximo de 68 caracteres por linha.

### 4.3 Forma, espaço e movimento
- Raio 14–28 px, sombras suaves azuladas, grid 4/8/12 colunas, espaçamento em múltiplos de 8.
- Animações de 160–420 ms, `cubic-bezier(.2,.7,.2,1)`, desativadas com `prefers-reduced-motion`.
- Alvos de toque ≥ 44 × 44 px; foco visível com anel duplo (branco + azul).

### 4.4 Uso do logotipo
| Contexto | Assinatura |
|---|---|
| Cabeçalho desktop | Reduzida 2 ("Hospital São Paulo") |
| Cabeçalho mobile < 380 px | Símbolo "hbsp" |
| Rodapé, Sobre, documentos | Completa ("Hospital Beneficente São Paulo de Cacoal") |
| Fundo azul | Versão branca monocromática |
| Favicon / avatar social | Recorte circular do coração do símbolo |

Nunca redesenhar, distorcer, aplicar sombra ou trocar cores do símbolo.

---

## 5. Arquitetura de informação

```
/                              Home (hub de intenções)
/pronto-atendimento            Urgência: quando vir, o que trazer, SAMU, rota
/agendar                       Assistente de agendamento (consulta, exame, retorno)
/especialidades                Lista filtrável (30) → /especialidades/[slug]
/medicos                       Busca por nome/especialidade → /medicos/[slug]
/exames                        Exames e diagnóstico → /exames/[slug] (preparo)
/servicos/[slug]               Centro cirúrgico, internação, hotelaria, maternidade, plantão pediátrico
/pacientes-e-acompanhantes     Antes / durante / depois · visitas · documentos · alta
/convenios                     Convênios e atendimento particular
/o-hospital                    História, missão, estrutura, galeria, vídeos, beneficência
/conteudo                      Saúde por intenção → /conteudo/[slug]
/campanhas/novembro-azul       Landing page sazonal (com expiração)
/contato                       Canais, formulário, mapa sob consentimento
/ouvidoria                     Elogios, sugestões, reclamações, denúncias
/trabalhe-conosco              Vagas, corpo clínico, parceiros
/perguntas-frequentes          FAQ com schema.org
/privacidade                   LGPD, cookies, direitos do titular
/acessibilidade                Declaração de acessibilidade
```

Navegação global com 6 itens: **Atendimento · Especialidades e médicos · Exames · Pacientes e acompanhantes · O hospital · Conteúdo** + botão **Agendar** + link **Contato**. Ações persistentes no mobile: barra inferior com **Urgência · Agendar · WhatsApp · Ligar · Rota**.

---

## 6. Componentes (todos tipados e reutilizáveis)

`TopBar`, `SiteHeader` (mega-menu com teclado), `MobileActionBar`, `MediaHero` (imagem | vídeo mudo com pôster | placeholder; respeita *reduced motion* e conexões lentas), `QuickDecision`, `EmergencyPanel`, `UniversalSearch` (combobox ARIA + atalho Ctrl/⌘ K), `ServiceCard`, `DoctorFinder`, `DoctorCard`, `JourneyTabs` (padrão ARIA Tabs), `Timeline`, `StatBlock` (com fonte e data), `Carousel` (swipe por *pointer events* + *scroll-snap*, botões, pausa, indicador "2 de 6", `aria-roledescription="carrossel"`), `PhotoGallery` + `Lightbox` (modal acessível, foco preso, Esc, setas, swipe), `VideoCard` (duração, categoria, data, pôster, `preload="none"`), `Tooltip` (`aria-describedby`, abre em foco/hover/toque, fecha com Esc), `MapConsent` (mapa só carrega após consentimento), `CookieConsent` (Consent Mode v2), `ScheduleWizard`, `ContactForm`, `FAQAccordion`, `PendingBadge` ("a validar"), `JsonLd`.

**Regras de interação:**
- Tooltip **nunca** é a única forma de acessar a informação.
- Carrossel **nunca** contém informação crítica e **nunca** gira sozinho sem botão de pausa.
- Todo CTA diz o que acontece depois: "Agendar pelo WhatsApp — abre uma conversa com a central".

---

## 7. Conteúdo e tom de voz

- Português brasileiro, frases curtas, voz ativa, segunda pessoa ("você").
- Explique termos técnicos na primeira menção (ex.: "tomografia — um exame de imagem que…").
- Sem superlativos não comprovados ("o melhor", "excelência"), sem promessas de cura, sem urgência artificial.
- Conteúdo de saúde: autor, CRM, data de revisão, fontes e aviso "este conteúdo não substitui uma consulta".
- **Regra de ouro:** quando um dado não estiver confirmado, escreva "informação a validar com o hospital" — nunca invente.

---

## 8. Requisitos técnicos

- **Front-end:** Next.js 15 (App Router), React 19, TypeScript estrito, HTML semântico, CSS com tokens (variáveis CSS) e camadas (`@layer`), sem dependência de UI pesada.
- **"Java":** interpretado como **backend Java (Spring Boot 3, Java 21)** exposto por API REST versionada (`/api/v1`). O front consome contratos definidos em `docs/api/openapi.yaml`. Interatividade no navegador é feita em TypeScript/JavaScript.
- **Camadas:** `app/` (rotas) · `components/` (apresentação) · `lib/domain` (tipos e regras) · `lib/data` (conteúdo/CMS) · `lib/integrations` (API, analytics, WhatsApp).
- **SEO:** metadados por página, Open Graph, `sitemap.xml`, `robots.txt`, URLs legíveis, schema.org `Hospital`, `Physician`, `MedicalWebPage`, `Article`, `FAQPage`, `BreadcrumbList`.
- **Performance:** LCP < 2,5 s, INP < 200 ms, CLS < 0,1 (p75, mobile). Hero sem vídeo no mobile por padrão; fontes locais com `font-display: swap` e *preload*.
- **Acessibilidade:** WCAG 2.2 AA, link "Pular para o conteúdo", landmarks, foco visível, zoom até 200 %, controle de tamanho de fonte e alto contraste.
- **Segurança e LGPD:** headers seguros (CSP, HSTS, X-Frame-Options, Referrer-Policy), formulários com honeypot + rate limit no backend, consentimento registrado (`ConsentRecord`), nenhum dado clínico em URL, evento ou log.

---

## 9. Omnichannel, dados e mensuração

**Fluxo:** Instagram/Google → landing com UTM → WhatsApp/telefone/formulário → CRM registra origem + intenção → atendimento → pós-atendimento (pesquisa NPS + orientação de retorno) → conteúdo de relacionamento.

**Convenção de UTM:** `utm_source` (instagram, google, whatsapp, radio) · `utm_medium` (social, cpc, organic, qr) · `utm_campaign` (aaaa-mm_nome, ex.: `2026-11_novembro-azul`) · `utm_content` (variação criativa).

**Mensagem do WhatsApp com contexto:** cada CTA gera um texto pré-preenchido com intenção e código de origem (ex.: `[Site · Agendar · Cardiologia · ref:home-hero]`), permitindo que a central identifique a jornada sem coletar dado sensível.

**Matriz de eventos (GA4/dataLayer):**

| Evento | Quando | Parâmetros (sem dado pessoal/clínico) |
|---|---|---|
| `view_service` | Abre página de serviço/especialidade | `service_slug` |
| `search_doctor` | Busca ou filtra médicos | `query_length`, `specialty`, `results_count` |
| `click_schedule` | Qualquer CTA de agendamento | `origin`, `type` (consulta/exame/retorno), `specialty` |
| `click_whatsapp` | Abre WhatsApp | `origin`, `intent` |
| `click_emergency` | CTA de urgência/ligar/rota PA | `origin`, `action` |
| `view_exam_prep` | Abre preparo de exame | `exam_slug` |
| `submit_contact` | Envia formulário | `form`, `topic` |
| `view_location` | Abre rota/mapa | `origin` |
| `content_engagement` | 75 % de leitura ou clique em CTA do artigo | `article_slug`, `depth` |
| `site_search` | Busca universal | `query_length`, `results_count`, `selected_type` |

**KPIs mensais:** taxa de conclusão do assistente de agendamento; cliques em WhatsApp/telefone por intenção; buscas sem resultado; visualizações de preparo; abandono de formulário; tempo até a primeira interação; Core Web Vitals; NPS pós-contato; feedbacks resolvidos na ouvidoria.

---

## 10. Modelo de dados mínimo

`Doctor`, `Specialty`, `Service`, `Exam`, `Unit`, `Schedule`, `Insurance`, `Article`, `Campaign`, `FAQ`, `MediaAsset`, `ContactRequest`, `Feedback`, `ConsentRecord`. Todas com `status` (rascunho | revisão | publicado | expirado), `updatedAt`, `reviewedBy` e `source` quando houver informação clínica ou institucional. Ver `lib/domain/types.ts` e `docs/api/openapi.yaml`.

---

## 11. Critérios de aceite

1. Uma pessoa encontra endereço, telefone e rota do pronto atendimento em até 1 toque no mobile.
2. Uma pessoa agenda uma consulta (até a abertura do WhatsApp com a mensagem pronta) em até 4 passos.
3. Todas as páginas passam em verificação automatizada de acessibilidade (axe) sem violações sérias.
4. Nenhum telefone, horário ou dado clínico diverge entre páginas (fonte única: `lib/data/site.ts`).
5. Todo dado não confirmado aparece marcado como "a validar".
6. Lighthouse mobile ≥ 90 em Performance, Acessibilidade, Boas práticas e SEO.

---

## 12. O que foi executado neste repositório

- Next.js 15 App Router + TypeScript com todas as rotas da seção 5, templates dinâmicos (`[slug]`) e `generateStaticParams`.
- Sistema de design em `app/globals.css` (tokens, componentes, estados, *reduced motion*, alto contraste).
- Logotipos vetoriais extraídos do PDF oficial, sem redesenho, em `public/brand/`.
- Componentes interativos: busca universal (Ctrl/⌘ K), assistente de agendamento, buscador de médicos, tooltips acessíveis, carrossel com swipe, galeria com lightbox e swipe, abas de jornada, FAQ, consentimento de cookies, mapa sob consentimento, barra de ações mobile.
- Camada de analytics com consentimento (`lib/integrations/analytics.ts`) e contratos de API para backend Java (`docs/api/openapi.yaml`).

## 13. Pendências de validação com o hospital (matriz de fatos)

- [ ] Horário real do pronto atendimento (o site atual diz "24H" no menu e "todos os dias" no card).
- [ ] Número oficial de WhatsApp e telefone fixo geral (o site lista apenas (69) 99305-0030 e o plantão pediátrico (69) 3441-4611).
- [ ] CNPJ, razão social atual (Hospital e Maternidade São Paulo Ltda. → Hospital Beneficente São Paulo?) e responsável técnico (CRM).
- [ ] Lista de convênios aceitos e política de atendimento particular.
- [ ] Lista atualizada de médicos, especialidades ativas e exames realizados, com preparos aprovados.
- [ ] Regras de visita e acompanhante, documentos para internação.
- [ ] Fotos e vídeos reais com termo de autorização de uso de imagem.
- [ ] Canal oficial de ouvidoria/denúncias e e-mail institucional.
- [ ] Certificações, indicadores e números atuais (leitos, atendimentos/ano) com fonte e data.
