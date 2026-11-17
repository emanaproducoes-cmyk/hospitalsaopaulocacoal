import { specialties } from '@/lib/data/specialties';
import { exams } from '@/lib/data/exams';
import { doctors } from '@/lib/data/doctors';
import { site } from '@/lib/data/site';
import { normalize } from '@/lib/data/search-index';

/**
 * Regras do Assistente HBSP, usadas no navegador (resposta imediata e modo sem IA)
 * e no servidor (antes e depois do modelo de IA).
 * O assistente ORIENTA e ENCAMINHA: não faz diagnóstico, não indica remédio nem dose.
 */

export interface AssistantAction {
  label: string;
  href: string;
  kind: 'link' | 'whatsapp' | 'tel' | 'lead';
}

export interface AssistantReply {
  reply: string;
  actions: AssistantAction[];
  redFlag?: boolean;
  intent?: Intent;
  source: 'regras' | 'ia';
}

export type Intent = 'emergencia' | 'agendar' | 'exame' | 'convenio' | 'localizacao' | 'visita' | 'ouvidoria' | 'resultado' | 'trabalho' | 'robotica' | 'pediatria' | 'duvida';

const RED_FLAGS: { re: RegExp; reply?: string }[] = [
  { re: /dor (forte |intensa )?(no|n[oa] meio do|no lado esquerdo do)? ?peito|aperto no peito|infarto/ },
  { re: /falta de ar|nao consigo respirar|sufocad|labios? roxo|arroxead/ },
  { re: /boca torta|fala enrolada|fraqueza de um lado|perdi a forca|formigamento de um lado|avc|derrame/ },
  { re: /desmai|perdeu a consciencia|convuls|desacordad/ },
  { re: /sangramento (forte|intenso|que nao para)|hemorragia|vomit\w* sangue/ },
  { re: /acidente|atropel|queda (grave|de altura)|bateu a cabeca|fratura exposta|queimadura grave/ },
  { re: /envenen|intoxica|engoliu (produto|remedio|veneno)|overdose/ },
  { re: /gravida.*(sangr|perd\w* liquido|bolsa (rompeu|estourou))|bolsa (rompeu|estourou)/ },
  { re: /rosto inchad|garganta fechando|reacao alergica forte|anafilax/ },
  { re: /bebe.*febre|recem.?nascido.*(febre|nao mama|roxo)/ },
  { re: /suicid|me matar|tirar minha vida|nao quero mais viver|autoagress|me machucar/, reply: 'Sinto muito que você esteja passando por isso. Você não está sozinho. Se estiver em perigo agora, venha ao pronto atendimento do hospital, aberto todos os dias, ou peça a alguém de confiança para te acompanhar. Para conversar com alguém a qualquer hora, o CVV atende de graça pelo telefone 188 ou em cvv.org.br.' },
];

const STOP = new Set('dor dores sinto sentindo problema problemas a o os as de da do das dos e em no na nos nas um uma uns umas para pra por com sem que se eu meu minha estou to tenho ter ser qual quais como onde quando quero queria preciso gostaria sobre mais muito pouco hoje ja ai isso esse essa este esta favor ola oi bom dia boa tarde noite fazer marcar agendar consulta exame medico medica doutor doutora hospital'.split(' '));

export function detectRedFlag(text: string): { hit: boolean; reply?: string } {
  const t = normalize(text);
  for (const f of RED_FLAGS) if (f.re.test(t)) return { hit: true, reply: f.reply };
  return { hit: false };
}

export function emergencyReply(custom?: string): AssistantReply {
  return {
    reply: custom ?? 'Isso pode ser uma emergência. Não espere melhorar: venha agora ao pronto atendimento do Hospital São Paulo, aberto todos os dias, na Av. São Paulo, 2539. Se a pessoa não puder se deslocar com segurança, ligue para o hospital e peça orientação.',
    actions: [
      { label: 'Rota até o pronto atendimento', href: site.address.mapsUrl, kind: 'link' },
      { label: 'Ligar para o hospital', href: `tel:${site.contacts.scheduling.tel}`, kind: 'tel' },
    ],
    redFlag: true,
    intent: 'emergencia',
    source: 'regras',
  };
}

export function detectIntent(text: string): Intent {
  const t = normalize(text);
  if (/convenio|plano de saude|unimed|particular|aceita|cobre|valor|preco|quanto custa/.test(t)) return 'convenio';
  if (/endereco|onde fica|como chegar|localiza|rota|estacionamento|telefone/.test(t)) return 'localizacao';
  if (/visita|acompanhante|horario de visita|internad/.test(t)) return 'visita';
  if (/reclama|elogio|sugest|ouvidoria|denuncia/.test(t)) return 'ouvidoria';
  if (/resultado|laudo|retirar exame/.test(t)) return 'resultado';
  if (/vaga|emprego|curriculo|trabalhar/.test(t)) return 'trabalho';
  if (/robo|robotic/.test(t)) return 'robotica';
  if (/crianca|filho|filha|bebe|pediatr/.test(t)) return 'pediatria';
  if (/tomografia|raio.?x|ultrass|ecocardio|exame|laborator|sangue|coleta|mamograf|endoscop|preparo|jejum/.test(t)) return 'exame';
  if (/agend|marcar|consulta|retorno|especialista|medic|doutor/.test(t)) return 'agendar';
  return 'duvida';
}

type Hit = { kind: 'especialidade' | 'exame' | 'medico'; slug: string; name: string; score: number };

export function matchCatalog(text: string, limit = 3): Hit[] {
  const words = normalize(text).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));
  if (!words.length) return [];
  const items = [
    ...specialties.map((s) => ({ kind: 'especialidade' as const, slug: s.slug, name: s.name, hay: normalize([s.name, s.summary, ...s.keywords].join(' ')) })),
    ...exams.map((e) => ({ kind: 'exame' as const, slug: e.slug, name: e.name, hay: normalize([e.name, e.summary, ...e.keywords].join(' ')) })),
    ...doctors.map((d) => ({ kind: 'medico' as const, slug: d.slug, name: `${d.title} ${d.name}`.trim(), hay: normalize([d.name, d.specialtyLabel].join(' ')) })),
  ];
  return items
    .map((it) => {
      let score = 0;
      for (const w of words) {
        const stem = w.length > 6 ? w.slice(0, Math.max(6, Math.min(w.length - 2, 7))) : w;
        if (normalize(it.name).includes(stem)) score += 4;
        else if (it.hay.includes(stem)) score += 2;
      }
      return { kind: it.kind, slug: it.slug, name: it.name, score };
    })
    .filter((h) => h.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const wa = (text: string) => `https://wa.me/${site.contacts.scheduling.whatsapp}?text=${encodeURIComponent(text + '\n\n[Site · assistente]')}`;

export function actionFor(kind: string, slug?: string): AssistantAction | null {
  switch (kind) {
    case 'agendar': {
      const s = slug ? specialties.find((x) => x.slug === slug) : undefined;
      return { label: s ? `Agendar ${s.name}` : 'Agendar consulta', href: `/agendar?origem=assistente${s ? `&especialidade=${s.slug}` : ''}`, kind: 'link' };
    }
    case 'exame': {
      const e = slug ? exams.find((x) => x.slug === slug) : undefined;
      return e ? { label: `${e.name}: preparo e agendamento`, href: `/exames/${e.slug}`, kind: 'link' } : { label: 'Ver exames', href: '/exames', kind: 'link' };
    }
    case 'medico': {
      const d = slug ? doctors.find((x) => x.slug === slug) : undefined;
      return d ? { label: `Perfil de ${`${d.title} ${d.name}`.trim()}`, href: `/medicos/${d.slug}`, kind: 'link' } : null;
    }
    case 'especialidade': {
      const s = slug ? specialties.find((x) => x.slug === slug) : undefined;
      return s ? { label: s.name, href: `/especialidades/${s.slug}`, kind: 'link' } : null;
    }
    case 'pa': return { label: 'Pronto atendimento', href: '/pronto-atendimento', kind: 'link' };
    case 'convenios': return { label: 'Convênios e particular', href: '/convenios', kind: 'link' };
    case 'contato': return { label: 'Endereço e contato', href: '/contato', kind: 'link' };
    case 'visitas': return { label: 'Visitas e acompanhantes', href: '/pacientes-e-acompanhantes', kind: 'link' };
    case 'ouvidoria': return { label: 'Ouvidoria', href: '/ouvidoria', kind: 'link' };
    case 'robotica': return { label: 'Cirurgia robótica', href: '/cirurgia-robotica', kind: 'link' };
    case 'trabalho': return { label: 'Trabalhe conosco', href: '/trabalhe-conosco', kind: 'link' };
    case 'pediatria': return { label: 'Plantão pediátrico', href: '/servicos/plantao-pediatrico', kind: 'link' };
    case 'whatsapp': return { label: 'Falar com a central no WhatsApp', href: wa('Olá! Vim pelo assistente do site e gostaria de ajuda.'), kind: 'whatsapp' };
    case 'chamar': return { label: 'Quero que a central me chame', href: '#lead', kind: 'lead' };
    default: return null;
  }
}

const compact = (a: (AssistantAction | null)[]) => a.filter(Boolean).slice(0, 4) as AssistantAction[];

/** Resposta completa por regras: usada sem IA ou quando a IA falha. */
export function ruleReply(text: string): AssistantReply {
  const rf = detectRedFlag(text);
  if (rf.hit) return emergencyReply(rf.reply);
  const intent = detectIntent(text);
  const hits = matchCatalog(text);
  const spec = hits.find((h) => h.kind === 'especialidade');
  const exam = hits.find((h) => h.kind === 'exame');
  const doc = hits.find((h) => h.kind === 'medico');
  const base = { intent, source: 'regras' as const };
  switch (intent) {
    case 'convenio':
      return { ...base, reply: 'O hospital atende particular e convênios. Como a cobertura muda conforme o plano e o procedimento, a central confirma tudo antes do agendamento.', actions: compact([actionFor('convenios'), actionFor('whatsapp'), actionFor('chamar')]) };
    case 'localizacao':
      return { ...base, reply: `Estamos na ${site.address.street}, ${site.address.district}, ${site.address.city}/${site.address.state}. Central: ${site.contacts.scheduling.label} · Plantão pediátrico: ${site.contacts.pediatricOnCall.label}.`, actions: compact([{ label: 'Abrir rota no mapa', href: site.address.mapsUrl, kind: 'link' }, actionFor('contato'), actionFor('whatsapp')]) };
    case 'visita':
      return { ...base, reply: 'Horários de visita, regras para acompanhantes e o que levar para a internação estão reunidos numa página só.', actions: compact([actionFor('visitas'), actionFor('whatsapp')]) };
    case 'ouvidoria':
      return { ...base, reply: 'Sua opinião ajuda o hospital a melhorar. Pela ouvidoria você registra elogio, sugestão, reclamação ou denúncia, inclusive de forma anônima, e recebe um protocolo.', actions: compact([actionFor('ouvidoria')]) };
    case 'resultado':
      return { ...base, reply: 'Para resultados e laudos, fale com a central: ela informa o prazo e a forma de retirada do seu exame.', actions: compact([actionFor('whatsapp'), actionFor('contato')]) };
    case 'trabalho':
      return { ...base, reply: 'Que bom que você quer fazer parte da equipe! As vagas e o envio de currículo ficam em Trabalhe conosco.', actions: compact([actionFor('trabalho')]) };
    case 'robotica':
      return { ...base, reply: 'O Hospital São Paulo tem cirurgia robótica. A indicação é sempre do cirurgião, depois da avaliação do seu caso. Veja como funciona ou agende uma avaliação.', actions: compact([actionFor('robotica'), actionFor('agendar', 'cirurgia-geral'), actionFor('whatsapp')]) };
    case 'pediatria':
      return { ...base, reply: `Para crianças, o hospital tem plantão pediátrico (${site.contacts.pediatricOnCall.label}). Se houver febre em bebê pequeno, dificuldade para respirar ou a criança estiver muito prostrada, venha direto ao pronto atendimento.`, actions: compact([actionFor('pediatria'), actionFor('agendar', 'pediatria'), actionFor('pa')]) };
    case 'exame':
      return { ...base, reply: exam ? `Encontrei ${exam.name}. Na página dele estão o preparo e como agendar.` : 'Posso te levar à lista de exames, com preparo e agendamento de cada um.', actions: compact([actionFor('exame', exam?.slug), actionFor('agendar'), actionFor('chamar')]) };
    case 'agendar':
      return { ...base, reply: spec ? `Você pode agendar ${spec.name} em 4 passos, escolhendo a data no calendário.` : doc ? `Encontrei ${doc.name}. Você pode ver o perfil ou agendar direto.` : 'O agendamento leva 4 passos: tipo, especialidade, data e seus dados. Se preferir, a central te chama.', actions: compact([actionFor('agendar', spec?.slug), doc ? actionFor('medico', doc.slug) : null, actionFor('chamar')]) };
    default:
      if (spec || exam || doc) {
        return { ...base, intent: 'agendar', reply: `Pelo que você descreveu, ${spec ? `a especialidade de ${spec.name}` : exam ? `o exame ${exam.name}` : doc!.name} pode ser um bom caminho. Quem decide é o médico na consulta; eu só ajudo a chegar até ele.`, actions: compact([spec ? actionFor('agendar', spec.slug) : null, exam ? actionFor('exame', exam.slug) : null, doc ? actionFor('medico', doc.slug) : null, actionFor('chamar')]) };
      }
      return { ...base, reply: 'Posso ajudar a agendar consulta ou exame, achar um médico, explicar convênios, visitas e como chegar. Me conte em poucas palavras do que você precisa.', actions: compact([actionFor('agendar'), actionFor('exame'), actionFor('whatsapp')]) };
  }
}

/** Remove telefone, CPF e e-mail antes de qualquer envio ao modelo de IA. */
export function redact(text: string): string {
  return text
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[cpf]')
    .replace(/\(?\d{2}\)?\s?9?\d{4}-?\d{4}/g, '[telefone]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]');
}
