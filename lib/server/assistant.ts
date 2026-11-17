import { specialties } from '@/lib/data/specialties';
import { exams } from '@/lib/data/exams';
import { doctors } from '@/lib/data/doctors';
import { site } from '@/lib/data/site';
import { actionFor, detectIntent, detectRedFlag, emergencyReply, redact, ruleReply, type AssistantAction, type AssistantReply } from '@/lib/assistant/triage';

/**
 * Assistente HBSP no servidor.
 * 1. Sinal de alerta → resposta fixa de emergência (a IA nunca decide isso).
 * 2. Com ANTHROPIC_API_KEY → modelo de IA com regras do hospital e catálogo real.
 *    As ações sugeridas pelo modelo só viram botões se existirem no catálogo.
 * 3. Sem chave, erro ou tempo esgotado → respostas por regras.
 * Telefone, CPF e e-mail são removidos antes de qualquer envio ao modelo.
 */

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

function systemPrompt(): string {
  const specs = specialties.map((s) => `${s.slug}=${s.name}`).join('; ');
  const ex = exams.map((e) => `${e.slug}=${e.name}`).join('; ');
  const docs = doctors.map((d) => `${d.slug}=${`${d.title} ${d.name}`.trim()} (${d.specialtyLabel})`).join('; ');
  return [
    `Você é o Assistente HBSP, do ${site.name} (Cacoal/RO, ${new Date().getFullYear() - site.foundedYear} anos). Fala português do Brasil, com acolhimento, frases curtas e no máximo 90 palavras.`,
    'Seu papel: orientar e encaminhar. Ajude a agendar consulta ou exame, achar médico e especialidade, explicar convênios, visitas, internação, localização e o que fazer em seguida.',
    'Regras inegociáveis:',
    '- Nunca faça diagnóstico, não diga qual doença a pessoa tem, não indique remédio, dose nem tratamento. Diga que quem avalia é o médico.',
    '- Sinais de gravidade (dor no peito, falta de ar, sinais de AVC, desmaio, convulsão, sangramento intenso, acidente, intoxicação, gestante com sangramento, alergia com inchaço no rosto, febre em bebê pequeno, ideação suicida): mande vir AGORA ao pronto atendimento, aberto todos os dias. Não existe SAMU em Cacoal: não cite 192.',
    '- Não peça nem repita CPF, número de carteirinha ou dados de saúde detalhados. Se a pessoa quiser retorno, ofereça a ação "chamar".',
    '- Não invente preços, horários de médicos, convênios aceitos ou resultados: diga que a central confirma.',
    '- Não fale de outros hospitais nem de política.',
    `Contatos: central e WhatsApp ${site.contacts.scheduling.label}; plantão pediátrico ${site.contacts.pediatricOnCall.label}; endereço ${site.address.street}, ${site.address.district}, ${site.address.city}/${site.address.state}.`,
    `Especialidades (slug=nome): ${specs}.`,
    `Exames: ${ex}.`,
    `Médicos: ${docs}.`,
    'Ao final, em uma linha separada, escreva AÇÕES: seguido de até 3 itens separados por ";" escolhidos SOMENTE desta lista: agendar:<slug-especialidade>, agendar, exame:<slug-exame>, medico:<slug-medico>, especialidade:<slug>, pa, convenios, contato, visitas, ouvidoria, robotica, pediatria, trabalho, whatsapp, chamar.',
  ].join('\n');
}

function parseActions(line: string): AssistantAction[] {
  const out: AssistantAction[] = [];
  for (const raw of line.split(';').map((x) => x.trim().toLowerCase()).filter(Boolean)) {
    const [k, slug] = raw.split(':').map((x) => x?.trim());
    const a = actionFor(k, slug);
    if (a && !out.some((o) => o.href === a.href)) out.push(a);
  }
  return out.slice(0, 3);
}

export async function answer(messages: ChatMessage[]): Promise<AssistantReply> {
  const last = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const rf = detectRedFlag(last);
  if (rf.hit) return emergencyReply(rf.reply);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return ruleReply(last);

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: systemPrompt(),
        messages: messages.slice(-10).map((m) => ({ role: m.role, content: redact(m.content).slice(0, 600) })),
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) return ruleReply(last);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text || '').join('\n').trim();
    if (!text) return ruleReply(last);
    const [body, acts = ''] = text.split(/\n?\s*AÇÕES:/i);
    let actions = parseActions(acts);
    if (!actions.length) actions = ruleReply(last).actions;
    // Rede de segurança: se a resposta da IA mencionar emergência, garante os botões certos.
    if (/pronto atendimento|emerg/i.test(body) && detectRedFlag(body).hit) return emergencyReply();
    return { reply: body.trim().slice(0, 900), actions, intent: detectIntent(last), source: 'ia' };
  } catch {
    return ruleReply(last);
  } finally {
    clearTimeout(t);
  }
}
