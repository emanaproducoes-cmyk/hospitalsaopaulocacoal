# Ecossistema digital HBSP — jornada, funil, CRM e IA

O site deixou de ser vitrine: cada visita vira uma jornada medida, cada pedido vira um registro no CRM e o paciente acompanha o próprio atendimento.

```
Visita ──► Jornada (1st-party) ──► Assistente / Agendamento / Contato ──► /api/leads ──► Backend HBSP + CRM
   │            │                         │                                  │
   │            └─ etapa, origem, interesses          protocolo · prioridade ◄┘
   └─ GTM/GA4 (só com aceite)              └─► Minha jornada (lembrete .ics, preparo, WhatsApp) ──► Avaliação NPS ──► CRM
```

## 1. Jornada e atribuição — `lib/integrations/journey.ts`
- Registra **primeiro e último toque não direto** (UTM, Google/Meta pago, busca orgânica, redes sociais, referência), página de entrada, páginas vistas, visitas e interesses (especialidades, exames, serviços vistos).
- **Etapas**: descoberta → consideração → intenção → conversão → relacionamento. Só avançam. Cada mudança gera o evento `funnel_stage`.
- Sem aceite de medição, os dados ficam **só na aba** (sessionStorage). Com aceite, 90 dias no aparelho. Nunca guarda nome, telefone ou texto livre.
- Tudo segue junto com o pedido (`journey` no envelope), então o CRM sabe de onde veio cada paciente.

## 2. Funil e medição — `lib/integrations/analytics.ts` + `components/layout/EcosystemBoot.tsx`
- GTM é carregado com `NEXT_PUBLIC_GTM_ID`, com **Consent Mode v2 negado por padrão**.
- Eventos: `page_view` (com origem e etapa), `click_schedule` (por passo do assistente), `lead_submitted` (entregue ao CRM ou WhatsApp, faixa de prioridade), `funnel_stage`, `assistant_open`, `assistant_message`, `assistant_handoff`, `calendar_add`, `journey_saved`, `nps_submitted`, além dos anteriores (busca, urgência, rota, leitura…).
- Funil sugerido no GA4 (Exploração de funil): `page_view` → `funnel_stage=consideracao` → `click_schedule step=1` → `click_schedule step=4` → `lead_submitted` → `nps_submitted`.

## 3. Hub de pedidos → CRM — `app/api/leads/route.ts` + `lib/server/leadHub.ts`
- Porta única para agendamento, contato, ouvidoria, NPS e pedidos do assistente.
- Valida, bloqueia robôs (honeypot + limite por IP), **gera protocolo** `HBSP-AAMMDD-XXXXX` e calcula a **prioridade** (0–100 → quente/morno/frio) com regras auditáveis: tipo de pedido, serviço definido, data próxima, particular/convênio, campanha, recorrência, engajamento.
- Entrega a `HBSP_API_URL` (backend Java) e/ou `CRM_WEBHOOK_URL` (qualquer CRM via n8n, Make, Zapier, RD Station, HubSpot, Kommo). O webhook é assinado com HMAC-SHA256 (`X-HBSP-Signature`) quando há `CRM_WEBHOOK_SECRET`.
- Formato `hbsp.lead.v1`: `{ protocol, kind, receivedAt, priority{score,band,reasons}, data, journey, source, schema }`.
- Sem destino configurado (ou fora do ar), o site **não perde o pedido**: abre o WhatsApp com a mensagem pronta e o protocolo.

## 4. Assistente com IA — `components/assistant/AssistantWidget.tsx`, `app/api/assistant/route.ts`
- Presente em todas as páginas. Orienta e encaminha: agenda, exame, médico, convênio, visitas, rota, ouvidoria, cirurgia robótica, pediatria.
- **Segurança primeiro**: sinais de alerta (dor no peito, falta de ar, AVC, desmaio, sangramento, acidente, intoxicação, gestante, alergia grave, bebê com febre, ideação suicida) geram resposta fixa de emergência **no próprio navegador**, antes de qualquer IA. Sem diagnóstico, sem remédio, sem citar SAMU.
- Com `ANTHROPIC_API_KEY`, usa IA com o catálogo real do hospital; as ações sugeridas só viram botões se existirem no site. CPF, telefone e e-mail são removidos antes do envio. Sem chave, funciona por regras.
- Captação: “Quero que a central me chame” → pedido com consentimento no hub (`kind: assistente`).

## 5. Autogestão do paciente — `/minha-jornada` e `/avaliar`
- Depois de agendar: **lembrete na agenda** (.ics, com aviso 1 dia antes), **Minha jornada** (protocolo, data, andamento, preparo do exame, WhatsApp sobre o pedido, rota) — guardado só no aparelho, por escolha do paciente.
- Passada a data, pede a **avaliação NPS**, que volta ao CRM. A central pode enviar `/avaliar?p=PROTOCOLO` depois do atendimento.

## 6. Para ligar em produção (Vercel → Settings → Environment Variables)
1. `NEXT_PUBLIC_GTM_ID` e, no GTM, a tag do GA4 com os eventos acima.
2. `CRM_WEBHOOK_URL` (+ `CRM_WEBHOOK_SECRET`) apontando para a automação do CRM escolhido, ou `HBSP_API_URL` do backend.
3. `ANTHROPIC_API_KEY` para o assistente com IA (opcional).
4. Revisar com o DPO: textos de consentimento, retenção no CRM e o RIPD do assistente.
