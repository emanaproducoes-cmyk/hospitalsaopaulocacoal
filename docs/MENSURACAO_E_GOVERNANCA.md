# Mensuração, omnichannel e governança — HBSP

## 1. Eventos (implementados em `lib/integrations/analytics.ts`)

Os eventos só chegam ao `dataLayer` depois que a pessoa aceita cookies de medição. Os parâmetros passam por uma lista de permissões: o código descarta nome, telefone, e-mail e qualquer texto livre.

| Evento | Onde dispara no código | Parâmetros |
|---|---|---|
| `click_schedule` | Hero, cabeçalho, barra mobile, cards de médico, especialidade, exame, passos do assistente | `origin`, `type`, `specialty`, `step` |
| `click_whatsapp` | CTA final, barra mobile, conclusão do assistente, páginas de serviço | `origin`, `intent` |
| `click_emergency` | Barra superior, painel PA, drawer, barra mobile, botão 192 | `origin`, `action` (`call`/`samu`) |
| `view_location` | Rota, carregar mapa | `origin` |
| `view_service` | Páginas de serviço e especialidade | `service_slug` |
| `view_exam_prep` | Página de exame | `exam_slug` |
| `search_doctor` | Filtros do buscador de médicos | `query_length`, `specialty`, `results_count` |
| `site_search` | Busca universal (inclui buscas sem resultado) | `query_length`, `results_count`, `selected_type` |
| `submit_contact` | Contato, ouvidoria, trabalhe conosco | `form`, `topic` |
| `content_engagement` | 75% de leitura e CTA do artigo | `article_slug`, `depth`, `action` |

**GTM:** crie uma tag GA4 para cada evento e ative o Consent Mode v2. O padrão é `denied`; o banner envia `consent update`.

## 2. Convenção de campanhas (UTM)

`?utm_source=instagram&utm_medium=social&utm_campaign=2026-11_novembro-azul&utm_content=reels-01`

- O assistente de agendamento lê `origem`, `utm_source` e `utm_campaign`. Ele envia esses valores para a API e os inclui na referência da mensagem de WhatsApp (`[Site · intenção · ref:...]`).
- Cada campanha tem sua landing page em `/campanhas/[slug]`, com data de início e de expiração (`lib/data/articles.ts → campaigns`).

## 3. KPIs mensais (leitura por intenção e por canal)

1. Conclusão do assistente: passo 1 → mensagem pronta.
2. Cliques em WhatsApp e telefone por `origin`.
3. Cliques em urgência e rota.
4. Buscas sem resultado: viram demanda de conteúdo.
5. Visualizações de preparo de exame comparadas com agendamentos de exame.
6. Abandono de formulário.
7. Core Web Vitals (LCP, INP, CLS) no p75 mobile.
8. NPS pós-atendimento e manifestações resolvidas na ouvidoria.

## 4. Checklist editorial, jurídico e LGPD (antes de publicar)

- [ ] Telefones, endereço e horários batem com `lib/data/site.ts` (fonte única).
- [ ] Nenhum selo "a validar" visível em produção (`NEXT_PUBLIC_SHOW_VALIDATION_FLAGS=false` somente após validar tudo).
- [ ] Conteúdo clínico tem autor, registro profissional, data de revisão e fonte.
- [ ] Toda foto ou vídeo tem termo de autorização de uso de imagem e está com `consent: 'approved'` em `lib/data/media.ts`.
- [ ] Nenhuma promessa de cura ou superlativo sem comprovação. Peças publicitárias seguem a Resolução CFM nº 2.336/2023.
- [ ] A Política de Privacidade foi revisada pelo jurídico e o encarregado (DPO) está nomeado.
- [ ] O banner de cookies permite recusar com o mesmo esforço que aceitar.
- [ ] Os formulários não pedem dados de saúde.
- [ ] O canal de denúncias permite anonimato.

## 5. Revisão crítica feita nesta entrega

| Verificação | Resultado |
|---|---|
| Telefone ou horário divergente | O site atual diz "24H" no menu e "todos os dias" no card. O novo site mostra "todos os dias" e marca "24 horas" como **a validar**. |
| CTA sem destino | 72 páginas rastreadas: nenhum link interno quebrado. |
| Contraste | Os textos usam azul #294197 (9,1:1), navy #14214F (15,4:1) e verde de texto #1D7A2E (5,4:1). O verde da marca #2FA441 aparece só em elementos decorativos. |
| Dado inventado | Leitos, convênios, preparos, horários de visita, CNPJ e DPO aparecem como "a validar". |
| Imagem sem consentimento | O site não publica nenhuma foto de pessoa. Os espaços de foto usam ilustrações provisórias identificadas. |
| Acessibilidade | Skip link, landmarks, foco visível, abas ARIA, combobox ARIA, modal com foco preso, tooltips acessíveis por teclado e toque, `prefers-reduced-motion`. |
