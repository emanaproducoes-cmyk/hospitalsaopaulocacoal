/**
 * Jornada do paciente e atribuição de origem — camada 1st-party, sem dados pessoais.
 *
 * - Guarda de onde a pessoa veio (UTM, referenciador, página de entrada) no primeiro
 *   e no último toque, para que o pedido enviado ao CRM carregue a origem mesmo depois
 *   de várias páginas navegadas.
 * - Calcula a etapa da jornada: descoberta → consideração → intenção → conversão → relacionamento.
 * - Sem consentimento de medição, tudo fica só na aba atual (sessionStorage) e é apagado
 *   ao fechar. Com consentimento, persiste por 90 dias neste aparelho (localStorage).
 * - Nunca guarda nome, telefone, e-mail ou texto livre.
 */

export type JourneyStage = 'descoberta' | 'consideracao' | 'intencao' | 'conversao' | 'relacionamento';

export interface Touch {
  source: string; // utm_source, domínio de referência ou "direto"
  medium: string; // utm_medium, "organico", "referencia" ou "direto"
  campaign?: string;
  content?: string;
  landing: string; // primeira página da visita
  paid?: boolean; // gclid / fbclid presentes (só o fato, não o valor)
  at: string; // ISO
}

export interface JourneyState {
  v: 1;
  first?: Touch;
  last?: Touch;
  stage: JourneyStage;
  pages: number;
  visits: number;
  interests: string[]; // slugs de especialidades/exames/serviços vistos (máx. 8)
  updatedAt: string;
}

const KEY = 'hbsp-journey';
const TTL_DAYS = 90;
const ORDER: JourneyStage[] = ['descoberta', 'consideracao', 'intencao', 'conversao', 'relacionamento'];

const empty = (): JourneyState => ({ v: 1, stage: 'descoberta', pages: 0, visits: 0, interests: [], updatedAt: new Date().toISOString() });

function analyticsAllowed(): boolean {
  try {
    const raw = localStorage.getItem('hbsp-consent');
    return !!raw && !!JSON.parse(raw).analytics;
  } catch {
    return false;
  }
}

export function readJourney(): JourneyState {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = sessionStorage.getItem(KEY) || (analyticsAllowed() ? localStorage.getItem(KEY) : null);
    if (!raw) return empty();
    const s = JSON.parse(raw) as JourneyState;
    if (s.v !== 1) return empty();
    const age = (Date.now() - new Date(s.updatedAt).getTime()) / 864e5;
    return age > TTL_DAYS ? empty() : s;
  } catch {
    return empty();
  }
}

function write(s: JourneyState) {
  s.updatedAt = new Date().toISOString();
  const raw = JSON.stringify(s);
  try {
    sessionStorage.setItem(KEY, raw);
    if (analyticsAllowed()) localStorage.setItem(KEY, raw);
    else localStorage.removeItem(KEY);
  } catch {
    /* modo privado: segue só em memória */
  }
}

/** Avança a etapa (nunca recua). Retorna true se mudou. */
export function advanceStage(stage: JourneyStage): boolean {
  if (typeof window === 'undefined') return false;
  const s = readJourney();
  if (ORDER.indexOf(stage) <= ORDER.indexOf(s.stage)) return false;
  s.stage = stage;
  write(s);
  return true;
}

export function addInterest(slug: string) {
  if (typeof window === 'undefined' || !slug) return;
  const s = readJourney();
  s.interests = [slug, ...s.interests.filter((x) => x !== slug)].slice(0, 8);
  if (s.stage === 'descoberta') s.stage = 'consideracao';
  write(s);
}

function touchFromLocation(): Touch | null {
  const url = new URL(window.location.href);
  const p = url.searchParams;
  const ref = document.referrer ? new URL(document.referrer) : null;
  const internal = ref && ref.host === url.host;
  const utm = p.get('utm_source');
  const paid = p.has('gclid') || p.has('fbclid') || p.has('wbraid') || p.has('gbraid');
  if (!utm && !paid && internal) return null; // navegação interna: não é um novo toque
  const searchEngines = /google\.|bing\.|yahoo\.|duckduckgo\.|ecosia\./;
  const social = /instagram\.|facebook\.|fb\.|tiktok\.|linkedin\.|youtube\.|wa\.me|whatsapp\./;
  let source = 'direto';
  let medium = 'direto';
  if (utm) {
    source = utm;
    medium = p.get('utm_medium') || 'campanha';
  } else if (paid) {
    source = p.has('fbclid') ? 'meta' : 'google';
    medium = 'pago';
  } else if (ref && !internal) {
    source = ref.host.replace(/^www\./, '');
    medium = searchEngines.test(ref.host) ? 'organico' : social.test(ref.host) ? 'social' : 'referencia';
  }
  const clip = (v: string | null) => (v ? v.slice(0, 60) : undefined);
  return { source: source.slice(0, 60), medium: medium.slice(0, 30), campaign: clip(p.get('utm_campaign')), content: clip(p.get('utm_content')), landing: url.pathname.slice(0, 120), paid: paid || undefined, at: new Date().toISOString() };
}

/** Chamar a cada página vista (o AppShell faz isso). */
export function recordPageView(pathname: string) {
  if (typeof window === 'undefined') return;
  const s = readJourney();
  const t = touchFromLocation();
  let newSession = false;
  try {
    newSession = !sessionStorage.getItem('hbsp-visit');
    sessionStorage.setItem('hbsp-visit', '1');
  } catch { /* */ }
  if (newSession) s.visits += 1;
  if (t) {
    if (!s.first) s.first = t;
    // Último toque NÃO direto: uma visita direta não apaga a campanha que trouxe a pessoa.
    if (t.source !== 'direto' || !s.last) s.last = t;
  } else if (!s.first) {
    const direct = { source: 'direto', medium: 'direto', landing: pathname, at: new Date().toISOString() };
    s.first = direct;
    s.last = direct;
  }
  s.pages += 1;
  const m = pathname.match(/^\/(especialidades|exames|servicos|medicos|cirurgia-robotica|conteudo)\/?([^/]*)/);
  if (m) {
    const slug = m[2] || m[1];
    s.interests = [slug, ...s.interests.filter((x) => x !== slug)].slice(0, 8);
    if (s.stage === 'descoberta') s.stage = 'consideracao';
  }
  if (/^\/agendar/.test(pathname) && ORDER.indexOf(s.stage) < ORDER.indexOf('intencao')) s.stage = 'intencao';
  write(s);
}

/** Resumo enviado junto com qualquer pedido ao CRM (sem dados pessoais). */
export function journeySnapshot(fallbackOrigin: string) {
  const s = readJourney();
  return {
    origin: fallbackOrigin,
    stage: s.stage,
    firstTouch: s.first,
    lastTouch: s.last,
    pagesViewed: s.pages,
    visits: s.visits,
    interests: s.interests,
  };
}

export type JourneySnapshot = ReturnType<typeof journeySnapshot>;

/** Texto curto de origem para a etiqueta do WhatsApp: origem|fonte|campanha. */
export function originTag(fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const p = new URLSearchParams(window.location.search);
  const s = readJourney();
  const src = p.get('utm_source') || s.last?.source;
  const camp = p.get('utm_campaign') || s.last?.campaign;
  return [p.get('origem') || fallback, src && src !== 'direto' ? src : undefined, camp].filter(Boolean).join('|');
}
