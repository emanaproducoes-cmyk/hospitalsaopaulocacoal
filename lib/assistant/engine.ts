import { normalize } from '@/lib/data/search-index';
import { site } from '@/lib/data/site';
import { articles } from '@/lib/data/articles';
import { actionFor, detectRedFlag, emergencyReply, matchCatalog, type AssistantAction } from './triage';
import { CLOSERS, EMPATHY, FACTS, FALLBACKS, HUMAN_TOPICS, NO, TOPICS, YES, type Topic } from './knowledge';

/**
 * Motor de conversa do Assistente HBSP (funciona no navegador, sem servidor).
 * - Escolhe o tema, sorteia uma forma de dizer que ainda não foi usada nesta conversa,
 *   acrescenta acolhimento quando percebe emoção e fecha com um convite diferente.
 * - Lembra o nome (se a pessoa disser), o último tema e a oferta feita, para entender "sim" e "não".
 * - Temas sensíveis vão para uma pessoa da central, sempre.
 */

export interface ConvContext {
  used: string[];
  lastTopic?: string;
  offer?: string;
  name?: string;
  turns: number;
  asked: string[];
}

export type ReplyKind = 'emergencia' | 'humano' | 'conversa' | 'tema' | 'catalogo' | 'oferta' | 'fallback';

export interface EngineReply {
  reply: string;
  actions: AssistantAction[];
  quick: string[];
  kind: ReplyKind;
  topic?: string;
  redFlag?: boolean;
  typingMs: number;
  ctx: ConvContext;
}

export const newContext = (): ConvContext => ({ used: [], turns: 0, asked: [] });

const SMALL_TALK = new Set(['saudacao', 'como_vai', 'obrigado', 'despedida', 'quem_e', 'ajuda', 'elogio_bot']);

function pick<T>(arr: T[], seed = Math.random()): T {
  return arr[Math.floor(seed * arr.length) % arr.length];
}

/** Sorteia uma variação ainda não usada; quando todas já foram, recomeça. */
function variant(topicId: string, replies: string[], ctx: ConvContext): string {
  const fresh = replies.map((r, i) => ({ r, k: `${topicId}#${i}` })).filter((x) => !ctx.used.includes(x.k));
  const pool = fresh.length ? fresh : replies.map((r, i) => ({ r, k: `${topicId}#${i}` }));
  if (!fresh.length) ctx.used = ctx.used.filter((k) => !k.startsWith(topicId + '#'));
  const chosen = pick(pool);
  ctx.used.push(chosen.k);
  return chosen.r;
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

function fill(s: string, ctx: ConvContext): string {
  return s
    .replace(/\{saudacao\}/g, greeting())
    .replace(/\{nome\}/g, ctx.name ? `, ${ctx.name}` : '')
    .replace(/\{anos\}/g, String(FACTS.anos))
    .replace(/\{ano\}/g, String(site.foundedYear))
    .replace(/\{fundador\}/g, FACTS.fundador)
    .replace(/\{tel\}/g, FACTS.tel)
    .replace(/\{pediatria\}/g, FACTS.pediatria)
    .replace(/\{endereco\}/g, FACTS.endereco)
    .replace(/\{especialidades\}/g, String(FACTS.especialidades));
}

const wa = (text: string): AssistantAction => ({
  label: 'Falar com a central no WhatsApp',
  href: `https://wa.me/${site.contacts.scheduling.whatsapp}?text=${encodeURIComponent(text + '\n\n[Site · assistente]')}`,
  kind: 'whatsapp',
});

/** Ações do repertório → botões. Aceita "agendar:pediatria" e "conteudo:slug". */
function toAction(key: string, _ctx: ConvContext, topicLabel?: string): AssistantAction | null {
  const [k, arg] = key.split(':');
  switch (k) {
    case 'humano': return wa(topicLabel ? `Olá! Vim pelo assistente do site e quero falar sobre ${topicLabel}.` : 'Olá! Vim pelo assistente do site e gostaria de ajuda.');
    case 'rota': return { label: 'Abrir rota no mapa', href: site.address.mapsUrl, kind: 'link' };
    case 'tel': return { label: `Ligar ${FACTS.tel}`, href: `tel:${site.contacts.scheduling.tel}`, kind: 'tel' };
    case 'historia': return { label: 'Nossa história', href: '/o-hospital', kind: 'link' };
    case 'especialidades': return { label: 'Ver especialidades', href: '/especialidades', kind: 'link' };
    case 'medicos': return { label: 'Encontre um médico', href: '/medicos', kind: 'link' };
    case 'maternidade': return { label: 'Maternidade', href: '/servicos/maternidade', kind: 'link' };
    case 'centro-cirurgico': return { label: 'Centro cirúrgico', href: '/servicos/centro-cirurgico', kind: 'link' };
    case 'internacao': return { label: 'Internação', href: '/servicos/internacao', kind: 'link' };
    case 'documentos': return { label: 'Documentos e orientações', href: '/pacientes-e-acompanhantes#documentos', kind: 'link' };
    case 'avaliar': return { label: 'Avaliar atendimento', href: '/avaliar', kind: 'link' };
    case 'minha-jornada': return { label: 'Minha jornada', href: '/minha-jornada', kind: 'link' };
    case 'privacidade': return { label: 'Privacidade', href: '/privacidade', kind: 'link' };
    case 'conteudo': {
      const a = articles.find((x) => x.slug === arg);
      return a ? { label: a.title.split(':')[0], href: `/conteudo/${a.slug}`, kind: 'link' } : null;
    }
    default: return actionFor(k, arg);
  }
}

const uniq = (a: (AssistantAction | null)[]) => {
  const out: AssistantAction[] = [];
  for (const x of a) if (x && !out.some((o) => o.href === x.href)) out.push(x);
  return out.slice(0, 4);
};

const DEFAULT_QUICK = ['Quero agendar uma consulta', 'Preciso fazer um exame', 'Como chego ao hospital?', 'Conte a história do hospital', 'Vocês têm cirurgia robótica?', 'Quero falar com uma pessoa', 'O que levar para a internação?', 'Horário de visitas'];

function quickFor(t: Topic | undefined, ctx: ConvContext): string[] {
  const base = [...(t?.quick ?? []), ...DEFAULT_QUICK].filter((q) => !ctx.asked.includes(normalize(q)));
  const seen = new Set<string>();
  const shuffled = base.filter((q) => (seen.has(q) ? false : (seen.add(q), true))).sort(() => Math.random() - 0.5);
  // os do tema vêm primeiro
  const own = (t?.quick ?? []).filter((q) => shuffled.includes(q));
  return [...own, ...shuffled.filter((q) => !own.includes(q))].slice(0, 3);
}

function empathyLine(t: string, ctx: ConvContext): string {
  for (const e of EMPATHY) {
    if (e.match.test(t)) return variant('emp-' + e.lines[0].slice(0, 8), e.lines, ctx) + ' ';
  }
  return '';
}

function closer(reply: string, ctx: ConvContext): string {
  if (/[?]/.test(reply) || ctx.turns < 2) return '';
  const c = pick(CLOSERS);
  return c ? ' ' + c : '';
}

const typing = (s: string) => Math.max(800, Math.min(2200, 450 + s.length * 11));

function matchTopic(list: Topic[], t: string): Topic | undefined {
  return list.filter((x) => x.match.test(t)).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0];
}

export function converse(text: string, prev: ConvContext = newContext()): EngineReply {
  const ctx: ConvContext = { ...prev, used: [...prev.used], asked: [...prev.asked], turns: prev.turns + 1 };
  const t = normalize(text);
  ctx.asked = [...ctx.asked, t].slice(-12);

  // 1. Segurança
  const rf = detectRedFlag(text);
  if (rf.hit) {
    const e = emergencyReply(rf.reply);
    ctx.offer = undefined;
    return { reply: e.reply, actions: e.actions, quick: [], kind: 'emergencia', redFlag: true, typingMs: 600, ctx };
  }

  // 2. Nome
  const nm = text.match(/(?:meu nome (?:e|é)|me chamo|pode me chamar de|aqui (?:e|é) (?:o|a))\s+([A-Za-zÀ-ÿ]{2,20})/i);
  let intro = '';
  if (nm) {
    ctx.name = nm[1][0].toUpperCase() + nm[1].slice(1).toLowerCase();
    intro = pick([`Muito prazer, ${ctx.name}! `, `Que bom te conhecer, ${ctx.name}! `, `Prazer, ${ctx.name}! `]);
    const rest = normalize(text.replace(nm[0], '')).replace(/[^a-z0-9 ]/g, ' ').replace(/\b(oi|ola|e|tudo bem|bom dia|boa tarde|boa noite)\b/g, '').trim();
    if (rest.length < 4) {
      const r = intro + pick(['Em que posso te ajudar hoje?', 'Me conta: do que você precisa?', 'Estou aqui para o que precisar. Por onde começamos?']);
      return { reply: r, actions: [], quick: quickFor(undefined, ctx), kind: 'conversa', topic: 'nome', typingMs: typing(r), ctx };
    }
  }

  // 3. Respostas curtas a uma oferta ("quer agendar?" → "sim")
  if (ctx.offer && t.split(' ').length <= 4) {
    if (YES.test(t)) {
      const key = ctx.offer;
      ctx.offer = undefined;
      const r = pick(['Perfeito! É só tocar no botão abaixo para começar.', 'Ótimo, vamos lá! O caminho está aqui embaixo.', 'Combinado! Separei o atalho para você.']);
      return { reply: intro + r, actions: uniq([toAction(key, ctx), toAction('chamar', ctx)]), quick: [], kind: 'oferta', typingMs: typing(r), ctx };
    }
    if (NO.test(t)) {
      ctx.offer = undefined;
      const r = pick(['Tudo bem! Fico por aqui caso precise.', 'Sem problema. Posso ajudar com outra coisa?', 'Tranquilo! Se mudar de ideia, é só chamar.']);
      return { reply: intro + r, actions: [], quick: quickFor(undefined, ctx), kind: 'conversa', typingMs: typing(r), ctx };
    }
  }

  // 4. Temas sensíveis → pessoa da central
  const human = matchTopic(HUMAN_TOPICS, t);
  if (human) {
    ctx.lastTopic = human.id;
    ctx.offer = human.offer;
    const body = intro + empathyLine(t, ctx) + fill(variant(human.id, human.replies, ctx), ctx);
    const actions = uniq([...(human.actions ?? []).map((k) => toAction(k, ctx, human.human)), toAction('humano', ctx, human.human), toAction('chamar', ctx), toAction('tel', ctx)]);
    return { reply: body, actions, quick: [], kind: 'humano', topic: human.id, typingMs: typing(body), ctx };
  }

  // 5. Temas do repertório
  const topic = matchTopic(TOPICS, t);
  const hits = matchCatalog(text);
  const spec = hits.find((h) => h.kind === 'especialidade');
  const exam = hits.find((h) => h.kind === 'exame');
  const doc = hits.find((h) => h.kind === 'medico');

  if (topic) {
    ctx.lastTopic = topic.id;
    ctx.offer = topic.offer;
    let body = intro + (SMALL_TALK.has(topic.id) ? '' : empathyLine(t, ctx)) + fill(variant(topic.id, topic.replies, ctx), ctx);
    const keys = [...(topic.actions ?? [])];
    // Personaliza com o que a pessoa citou (especialidade, exame, médico)
    if (topic.id === 'agendar' && spec) { body += ` Já deixei ${spec.name} selecionada para você.`; keys.splice(keys.indexOf('agendar'), 1, `agendar:${spec.slug}`); ctx.offer = `agendar:${spec.slug}`; }
    if (topic.id === 'exames' && exam) { body = intro + pick([`Encontrei ${exam.name}. `, `Sobre ${exam.name}: `, `Achei o exame: ${exam.name}. `]) + 'Na página dele estão o que é, o que levar e como agendar; o preparo exato é confirmado pela central.'; keys.unshift(`exame:${exam.slug}`); }
    if (doc && !SMALL_TALK.has(topic.id)) keys.push(`medico:${doc.slug}`);
    if (!SMALL_TALK.has(topic.id)) body += closer(body, ctx);
    return { reply: body, actions: uniq(keys.map((k) => toAction(k, ctx))), quick: quickFor(topic, ctx), kind: SMALL_TALK.has(topic.id) ? 'conversa' : 'tema', topic: topic.id, typingMs: typing(body), ctx };
  }

  // 6. Algo que lembra uma especialidade, exame ou médico
  if (spec || exam || doc) {
    const name = spec ? spec.name : exam ? exam.name : doc!.name;
    const lead = pick([
      `Pelo que você descreveu, ${spec ? `a especialidade de ${name}` : exam ? `o exame ${name}` : name} pode ser um bom caminho.`,
      `Acho que ${spec ? `${name}` : name} pode te ajudar.`,
      `Uma boa porta de entrada pode ser ${spec ? `${name}` : name}.`,
    ]);
    const tail = pick([' Quem confirma é o médico na consulta; eu só ajudo você a chegar até ele.', ' Lembrando: não faço diagnóstico, só te ajudo a encontrar o atendimento certo.', ' A avaliação de verdade é com o médico, combinado?']);
    const body = intro + empathyLine(t, ctx) + lead + tail;
    ctx.lastTopic = 'catalogo';
    ctx.offer = spec ? `agendar:${spec.slug}` : exam ? `exame:${exam.slug}` : undefined;
    return { reply: body, actions: uniq([spec ? toAction(`agendar:${spec.slug}`, ctx) : null, exam ? toAction(`exame:${exam.slug}`, ctx) : null, doc ? toAction(`medico:${doc.slug}`, ctx) : null, toAction('chamar', ctx)]), quick: quickFor(undefined, ctx), kind: 'catalogo', typingMs: typing(body), ctx };
  }

  // 7. Não entendi
  const body = intro + fill(variant('fallback', FALLBACKS, ctx), ctx);
  ctx.offer = undefined;
  return { reply: body, actions: uniq([toAction('agendar', ctx), toAction('humano', ctx)]), quick: quickFor(undefined, ctx), kind: 'fallback', typingMs: typing(body), ctx };
}

/** Respostas que o motor local resolve melhor que a IA (segurança, humano, conversa, ofertas). */
export const LOCAL_FIRST: ReplyKind[] = ['emergencia', 'humano', 'conversa', 'oferta'];
