import { site } from '@/lib/data/site';
import { specialties } from '@/lib/data/specialties';
import { doctors } from '@/lib/data/doctors';

/**
 * Repertório do Assistente HBSP.
 * Cada tema tem gatilhos, várias formas de responder (sorteadas sem repetir),
 * próximos passos (botões) e sugestões de continuação (perguntas rápidas).
 * Temas sensíveis (preço, pagamento, recuperação, cobertura, resultado, remédio…)
 * NUNCA recebem resposta do robô: vão para atendimento humano.
 *
 * Todo fato aqui vem do que o próprio site publica. Nada de números inventados.
 */

export type Tone = 'acolhedor' | 'informativo' | 'festivo';

export interface Topic {
  id: string;
  /** Gatilhos já normalizados (sem acento, minúsculas). */
  match: RegExp;
  /** Variações de resposta. {saudacao} {nome} {anos} {tel} {pediatria} {endereco} são preenchidos na hora. */
  replies: string[];
  actions?: string[]; // chaves de actionFor (triage.ts)
  quick?: string[]; // sugestões de continuação
  /** Assunto que depende do caso: vai para uma pessoa da central. */
  human?: string; // motivo mostrado ao paciente
  /** Oferta que um "sim" do paciente aceita. */
  offer?: string; // chave de ação
  tone?: Tone;
  priority?: number; // maior vence em empate
}

const anos = new Date().getFullYear() - site.foundedYear;
export const FACTS = {
  anos,
  tel: site.contacts.scheduling.label,
  pediatria: site.contacts.pediatricOnCall.label,
  endereco: `${site.address.street}, ${site.address.district}, ${site.address.city}/${site.address.state}`,
  fundador: site.founder,
  especialidades: specialties.length,
  medicos: doctors.length,
};

/* ------------------------------------------------------------------ */
/* Atendimento humano: temas sensíveis ou que dependem de cada caso    */
/* ------------------------------------------------------------------ */
export const HUMAN_TOPICS: Topic[] = [
  {
    id: 'preco', priority: 9,
    match: /\b(preco|precos|valor|valores|quanto (custa|fica|sai|e|cobra)|custo|orcamento|tabela|caro|barato)\b/,
    human: 'valores de consultas, exames e procedimentos',
    replies: [
      'Entendo que saber o valor ajuda a se planejar. Como o preço muda conforme o procedimento, o profissional e a forma de atendimento, quem passa o valor certinho é a nossa central. Já deixo o caminho pronto para você.',
      'Boa pergunta, e importante! Valores dependem de cada caso, então prefiro não arriscar um número. A equipe da central faz o orçamento com você, sem compromisso.',
      'Para não te passar uma informação imprecisa, o orçamento é feito por uma pessoa da nossa central, que olha o seu caso com calma. Posso te conectar agora?',
    ],
  },
  {
    id: 'pagamento', priority: 9,
    match: /\b(pagamento|pagar|parcel\w*|cartao|credito|debito|pix|boleto|dinheiro|a vista|desconto|nota fiscal|reembolso)\b/,
    human: 'formas de pagamento, parcelamento e reembolso',
    replies: [
      'Sobre formas de pagamento e parcelamento, quem orienta é a nossa central: as condições podem variar por procedimento. Vou te deixar pertinho de quem resolve isso.',
      'Pagamento é assunto que eu passo para a equipe humana, para você receber as condições certas e atualizadas. É rapidinho pelo WhatsApp.',
      'Para te dar as opções de pagamento corretas, chamo alguém da central. Prefere WhatsApp ou que te liguem?',
    ],
  },
  {
    id: 'recuperacao', priority: 9,
    match: /(tempo de recuperacao|quanto tempo (de|para|pra) (recuper|voltar|ficar)|recuperacao|repouso|resguardo|quando (posso|vou poder) (voltar|trabalhar|dirigir|andar|comer)|pos.?operatorio|quantos dias (internad|de atestado|de repouso)|atestado)/,
    human: 'tempo de recuperação e cuidados depois de um procedimento',
    replies: [
      'Cada corpo se recupera no seu ritmo, e o tempo depende do procedimento e da sua saúde. Quem pode te responder com segurança é o seu médico; a central te ajuda a falar com ele.',
      'Que bom que você está se planejando! O tempo de recuperação é individual e é definido pelo médico que acompanha o seu caso. Posso te encaminhar para a equipe.',
      'Essa resposta precisa vir de quem conhece o seu caso. Vou te conectar com a central, que agenda o retorno ou leva a dúvida ao seu médico.',
    ],
  },
  {
    id: 'cobertura', priority: 8,
    match: /(meu (plano|convenio) (cobre|paga|aceita)|cobre (a |o )?(cirurgia|exame|consulta|procedimento|robo)|autoriza\w*|guia|carencia|liberacao do convenio|plano (x|y)|unimed|ipam|bradesco|amil|sulamerica|hapvida|cassi|geap|saude caixa|postal saude)/,
    human: 'cobertura e autorização do seu convênio',
    replies: [
      'O hospital atende vários convênios, mas a cobertura muda de plano para plano e de procedimento para procedimento. A central confirma a sua cobertura e já orienta sobre a autorização.',
      'Para saber se o seu plano cobre, a central consulta direto com o convênio. Leve ou tenha em mãos a sua carteirinha. Te conecto?',
    ],
  },
  {
    id: 'resultado', priority: 8,
    match: /(resultado|laudo|retirar (o )?exame|pegar (o )?exame|exame (ficou|saiu) pronto|segunda via)/,
    human: 'resultados e laudos de exames',
    replies: [
      'Resultados e laudos são dados de saúde, então quem cuida disso é a nossa equipe, com segurança. A central informa o prazo e a forma de retirada.',
      'Para proteger a sua privacidade, resultados não passam por mim. A central te orienta como retirar o seu exame.',
    ],
  },
  {
    id: 'clinico', priority: 8,
    match: /(o que (eu )?tenho|e grave|sera que e|diagnostic|qual remedio|que remedio|posso tomar|dose|dosagem|mg\b|antibiotico|receita|bula|interacao|parar (de tomar|o remedio)|efeito colateral)/,
    human: 'diagnósticos, remédios e doses',
    replies: [
      'Sei que a dúvida aperta. Mas diagnóstico, remédio e dose só podem ser indicados por um médico que te examine, e eu não quero te orientar errado. Posso agendar uma consulta ou te conectar à central agora.',
      'Essa pergunta merece a avaliação de um profissional, e não de um assistente virtual. Se os sintomas forem fortes, venha ao pronto atendimento. Se não, vamos marcar uma consulta?',
    ],
    offer: 'agendar',
  },
  {
    id: 'reclamacao', priority: 7,
    match: /(erro medico|negligencia|processo|advogado|fui mal atendid|pessimo atendimento|denunci|maltrat|desrespeit)/,
    human: 'relatos sobre atendimento',
    replies: [
      'Sinto muito pelo que você passou. Isso é sério e merece atenção de uma pessoa. Pela ouvidoria você registra o relato (pode ser anônimo) e recebe um protocolo para acompanhar.',
      'Obrigado por confiar e contar. Quero que isso chegue a quem pode agir: a ouvidoria do hospital recebe o seu relato, com protocolo. Também posso te conectar à central.',
    ],
    actions: ['ouvidoria', 'humano'],
  },
  {
    id: 'luto', priority: 7,
    match: /(faleceu|falecimento|obito|morreu|perdi (meu|minha)|velorio|declaracao de obito)/,
    human: 'orientações em um momento de perda',
    replies: [
      'Meus sentimentos. Sinto muito por esse momento tão difícil. Para orientações e documentos, uma pessoa da nossa equipe vai te atender com todo o cuidado.',
    ],
  },
  {
    id: 'humano', priority: 6,
    match: /(falar com (uma )?(pessoa|atendente|humano|alguem|recepcao|central)|atendente|atendimento humano|quero uma pessoa|nao quero (falar com )?robo)/,
    human: 'o que você precisar',
    replies: [
      'Claro! Nada substitui uma boa conversa. Te deixo agora com a nossa central.',
      'Combinado, vou te passar para uma pessoa da equipe. Escolha o jeito mais confortável para você.',
      'Pode deixar! A central está pronta para te ajudar.',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Conversa e conhecimento                                             */
/* ------------------------------------------------------------------ */
export const TOPICS: Topic[] = [
  // ---- Conversa
  {
    id: 'saudacao', priority: 1,
    match: /^(oi+|ola|ole|opa|eai|e ai|hey|hello|bom dia|boa tarde|boa noite|salve|alo)\b/,
    replies: [
      '{saudacao}! Que bom ter você aqui. Sou o assistente do Hospital São Paulo. Em que posso te ajudar hoje?',
      '{saudacao}! Seja muito bem-vindo ao Hospital São Paulo. Me conte do que você precisa, que eu te levo pelo caminho mais curto.',
      '{saudacao}{nome}! Estou aqui para ajudar com agendamentos, exames, visitas, convênios e o que mais precisar.',
      'Olá{nome}! {saudacao} para você. Há {anos} anos cuidamos de Cacoal, e hoje quero cuidar da sua dúvida. Como posso ajudar?',
    ],
    quick: ['Quero agendar uma consulta', 'Preciso fazer um exame', 'Como chego ao hospital?', 'Conte a história do hospital'],
  },
  {
    id: 'como_vai', priority: 2,
    match: /(tudo bem|tudo bom|como vai|como voce esta|como esta voce|beleza\??$|td bem)/,
    replies: [
      'Tudo ótimo por aqui, obrigado por perguntar! E com você, como posso ajudar?',
      'Estou bem e pronto para te ajudar! Espero que você também esteja. Do que você precisa hoje?',
      'Que gentileza! Por aqui tudo certo. Me conta: o que te trouxe ao site do hospital?',
    ],
    quick: ['Quero agendar uma consulta', 'Tenho uma dúvida sobre exame'],
  },
  {
    id: 'obrigado', priority: 2,
    match: /\b(obrigad\w*|valeu|agradeco|muito grato|muito grata|show|perfeito|otimo|maravilha)\b/,
    replies: [
      'Imagina! Foi um prazer ajudar. Se precisar de mais alguma coisa, é só chamar.',
      'Eu que agradeço a confiança. Cuide-se bem, e conte com a gente sempre.',
      'Por nada! Estamos aqui todos os dias. Se surgir outra dúvida, volte quando quiser.',
      'Fico feliz em ajudar! Desejo saúde para você e sua família.',
    ],
  },
  {
    id: 'despedida', priority: 2,
    match: /\b(tchau|ate mais|ate logo|ate breve|falou|boa noite e obrigad|so isso|era so isso|nada mais)\b/,
    replies: [
      'Até logo! Cuide-se, e qualquer coisa estamos aqui.',
      'Tchau, e obrigado pela visita! Desejo um ótimo dia.',
      'Até a próxima! Lembre-se: em urgência, o pronto atendimento está aberto todos os dias.',
    ],
  },
  {
    id: 'quem_e', priority: 3,
    match: /(quem e voce|voce e (um )?robo|voce e (uma )?pessoa|o que voce faz|como (voce )?funciona|e uma ia|inteligencia artificial|com quem (eu )?falo)/,
    replies: [
      'Sou o assistente virtual do Hospital São Paulo. Ajudo a encontrar caminhos: agendar, entender exames, visitas, convênios e como chegar. Não faço diagnóstico, e quando o assunto pede, chamo uma pessoa da equipe.',
      'Sou um assistente digital do HBSP, criado para te orientar de forma rápida e acolhedora. Para assuntos que dependem do seu caso, te passo para a nossa central.',
    ],
    quick: ['O que você pode fazer?', 'Quero falar com uma pessoa'],
  },
  {
    id: 'ajuda', priority: 2,
    match: /(o que (voce )?pode fazer|me ajuda|preciso de ajuda|ajuda|help|opcoes|menu)/,
    replies: [
      'Posso te ajudar a: agendar consulta ou exame, achar um médico, entender preparos, visitas e internação, saber como chegar, conhecer a história do hospital e falar com a central. Por onde começamos?',
      'Estou aqui para isso! Escolha um caminho abaixo ou escreva com suas palavras.',
    ],
    quick: ['Agendar consulta', 'Preparo de exame', 'Visitas e acompanhantes', 'Falar com uma pessoa'],
  },
  {
    id: 'elogio_bot', priority: 1,
    match: /(voce e (muito )?(bom|boa|legal|util|incrivel)|gostei (de voce|do atendimento)|adorei)/,
    replies: [
      'Que bom ouvir isso! Fico feliz em ajudar. Se quiser, conte como foi sua experiência no hospital também: sua avaliação faz diferença.',
      'Obrigado! Quem merece o elogio é a equipe que cuida de você todos os dias.',
    ],
    actions: ['avaliar'],
  },

  // ---- Instituição
  {
    id: 'historia', priority: 5,
    match: /(historia|fundad\w*|fundacao|fundou|quando (foi|comecou)|quantos anos|tempo de existencia|origem do hospital|desde quando|toshio|shiokawa|aniversario)/,
    replies: [
      'O Hospital São Paulo nasceu em {ano}, quando o {fundador} começou com 8 leitos, 5 consultórios e 3 médicos. Desde então cresceu com Cacoal: são {anos} anos de gente cuidando de gente.',
      'Nossa história começa em {ano}, com o {fundador} e um hospital de 8 leitos. Em 1983 veio a primeira grande ampliação, com centro cirúrgico, UTI, laboratório, raio X e endoscopia. Em 1996 a gestão passou a um grupo de médicos. Hoje são {anos} anos de cuidado.',
      'São {anos} anos de história! Tudo começou em {ano}, pelas mãos do {fundador}, com 8 leitos. O hospital cresceu junto com a região, sem perder o jeito acolhedor de cuidar.',
    ],
    actions: ['historia'],
    quick: ['Quais especialidades vocês têm?', 'Vocês têm cirurgia robótica?'],
    tone: 'festivo',
  },
  {
    id: 'beneficente', priority: 4,
    match: /(beneficente|filantrop|sem fins lucrativos|o que significa hbsp|hbsp)/,
    replies: [
      'HBSP quer dizer Hospital Beneficente São Paulo, de Cacoal. O "beneficente" faz parte da nossa identidade: um hospital que cresceu com a comunidade e trabalha por ela.',
    ],
    actions: ['historia'],
  },
  {
    id: 'marca', priority: 3,
    match: /(logo|logotipo|marca nova|identidade visual|coracao entrelacado|cores do hospital)/,
    replies: ['O símbolo HBSP une as letras do nosso nome a um coração formado por um laço: cuidado, vínculo e continuidade. O azul fala de confiança; o verde, de vida.'],
    actions: ['historia'],
  },
  {
    id: 'especialidades', priority: 4,
    match: /(quais (sao as )?especialidades|tem (quais|que) especialidades|lista de especialidades|areas de atendimento|especialidades)/,
    replies: [
      'Temos {especialidades} especialidades e áreas de cuidado, de cardiologia e pediatria a ortopedia, oftalmologia, urologia e muito mais. Quer que eu ache a certa para você?',
      'São {especialidades} áreas de cuidado no hospital. Me diga o que você está sentindo ou qual especialista procura, que eu te indico o caminho.',
    ],
    actions: ['especialidades', 'medicos'],
    quick: ['Procuro um cardiologista', 'Preciso de pediatra'],
  },
  {
    id: 'medicos', priority: 4,
    match: /(quais medicos|lista de medicos|corpo clinico|encontrar (um )?medico|medico bom|indica (um )?medico)/,
    replies: [
      'No “Encontre um médico” você busca por nome ou especialidade e vê o registro profissional e a biografia de cada um. Quer que eu filtre por alguma especialidade?',
      'Todos os perfis mostram CRM, RQE ou CRP para você conferir. Me diga a especialidade que eu te mostro quem atende.',
    ],
    actions: ['medicos'],
  },

  // ---- Atendimento
  {
    id: 'pronto_atendimento', priority: 5,
    match: /(pronto atendimento|pronto socorro|\bps\b|\bpa\b|emergencia|urgencia|plantao|aberto agora|24 ?h|funciona (hoje|agora|domingo|feriado|de madrugada))/,
    replies: [
      'O pronto atendimento funciona todos os dias, na {endereco}. Na chegada, a enfermagem faz a classificação de risco: os casos mais graves são atendidos primeiro.',
      'Estamos de portas abertas todos os dias no pronto atendimento. Lá, quem chega passa pela classificação de risco, para que os casos mais urgentes sejam atendidos antes.',
    ],
    actions: ['pa', 'rota'],
    quick: ['Como funciona a classificação de risco?', 'O que levar?'],
  },
  {
    id: 'classificacao', priority: 6,
    match: /(classificacao de risco|triagem|por que (demora|esperar)|ordem de chegada|cores? da (pulseira|classificacao)|demora no pronto)/,
    replies: [
      'Na classificação de risco, a enfermagem avalia sinais e sintomas e define a prioridade. Quem está em situação mais grave é atendido primeiro, não pela ordem de chegada. Sei que esperar é difícil; é assim que garantimos segurança a todos.',
    ],
    actions: ['pa'],
  },
  {
    id: 'agendar', priority: 4,
    match: /(agend\w*|marcar|consulta|retorno|horario (com|para)|tem vaga|disponibilidade)/,
    replies: [
      'Vamos agendar! São 4 passos rapidinhos: tipo de atendimento, especialidade, data no calendário e seus dados. Depois você recebe um protocolo e pode colocar um lembrete na agenda.',
      'Agendar é simples: você escolhe a especialidade e a data de preferência, e a central confirma o horário. Quer começar agora?',
      'Claro! Pelo site você escolhe a data no calendário e sai com um protocolo. Se preferir, a central te liga para agendar.',
    ],
    actions: ['agendar', 'chamar'],
    offer: 'agendar',
  },
  {
    id: 'horarios', priority: 4,
    match: /(horario de funcionamento|que horas (abre|fecha)|abre (que|as) horas|horario (da central|do ambulatorio|de atendimento)|funciona (sabado|domingo))/,
    replies: [
      'O pronto atendimento funciona todos os dias. Para consultas e exames, os dias e horários de cada profissional são confirmados pela central no agendamento: {tel}.',
    ],
    actions: ['pa', 'humano'],
  },
  {
    id: 'localizacao', priority: 5,
    match: /(endereco|onde fica|onde voces ficam|como chego|como chegar|localiza\w*|rota|mapa|bairro|ponto de referencia|estacionamento|telefone|contato|numero do hospital|whatsapp)/,
    replies: [
      'Estamos na {endereco}. Central e WhatsApp: {tel}. Plantão pediátrico: {pediatria}.',
      'Fica fácil: {endereco}. Toque em “Abrir rota” e o mapa te leva até a porta. Se precisar, ligue {tel}.',
    ],
    actions: ['rota', 'contato', 'whatsapp'],
  },
  {
    id: 'pediatria', priority: 5,
    match: /(pediatr\w*|crianca|filho|filha|bebe|recem.?nascido|neto|neta|meu menino|minha menina)/,
    replies: [
      'Para os pequenos, temos plantão pediátrico: {pediatria}. Febre em bebê pequeno, dificuldade para respirar ou criança muito molinha? Venha direto ao pronto atendimento.',
      'Cuidar de criança pede carinho e atenção em dobro. O plantão pediátrico atende pelo {pediatria}, e você também pode agendar consulta com pediatra pelo site.',
    ],
    actions: ['pediatria', 'agendar:pediatria', 'pa'],
  },
  {
    id: 'maternidade', priority: 5,
    match: /(gravidez|gravida|gestante|gestacao|pre.?natal|parto|cesarea|cesaria|maternidade|parto normal|humanizado|plano de parto)/,
    replies: [
      'Que momento especial! O hospital acompanha pré-natal, parto e pós-parto. No nosso conteúdo sobre parto humanizado você vê como montar o seu plano de parto e conversar com a equipe.',
      'Parabéns pela gestação! Gestantes têm direito a acompanhante no parto e pós-parto. Posso te mostrar a maternidade ou agendar com obstetrícia.',
    ],
    actions: ['maternidade', 'agendar:obstetricia', 'conteudo:parto-humanizado'],
  },
  {
    id: 'cirurgia', priority: 4,
    match: /(cirurgia|operar|operacao|centro cirurgico|pre.?operatorio|anestesia|jejum para cirurgia|vou me operar)/,
    replies: [
      'O centro cirúrgico realiza cirurgias eletivas e de urgência. Antes de uma cirurgia, você passa pela avaliação com o cirurgião e, quando indicado, pela avaliação pré-anestésica; as orientações de jejum e remédios vêm do médico.',
      'Uma cirurgia pela frente? Respira fundo: a equipe orienta cada etapa, da avaliação ao pós-operatório. As dúvidas sobre o caso específico, o cirurgião responde com segurança.',
    ],
    actions: ['centro-cirurgico', 'agendar:cirurgia-geral'],
    quick: ['Vocês têm cirurgia robótica?', 'O que levar para a internação?'],
  },
  {
    id: 'robotica', priority: 6,
    match: /(robo|robotic\w*|toumai|medbot|da vinci)/,
    replies: [
      'Temos cirurgia robótica, com o sistema Toumai. O cirurgião comanda braços robóticos de alta precisão a partir de um console, com visão ampliada. O robô não opera sozinho: quem decide e conduz é sempre o médico.',
      'Sim! A cirurgia robótica chegou ao Hospital São Paulo. Cortes menores costumam significar menos dor e recuperação mais tranquila, mas a indicação é sempre individual, feita pelo cirurgião.',
    ],
    actions: ['robotica', 'agendar:cirurgia-geral'],
  },
  {
    id: 'internacao', priority: 4,
    match: /(internac\w*|internad\w*|vou ficar internad|leito|quarto|o que levar|mala)/,
    replies: [
      'Para a internação, leve: documento com foto, cartão do convênio ou guia, pedido médico e exames recentes, lista de remédios e alergias, itens de higiene, roupas confortáveis, chinelo antiderrapante e carregador. Evite joias e objetos de valor.',
      'Uma dica de quem cuida: separe documentos, exames recentes e a lista dos seus remédios. Para o conforto, roupas leves, chinelo antiderrapante e itens de higiene.',
    ],
    actions: ['internacao', 'documentos'],
  },
  {
    id: 'visitas', priority: 5,
    match: /(visita|visitar|acompanhante|acompanhar (meu|minha)|horario de visita|pode dormir|troca de acompanhante)/,
    replies: [
      'Têm direito a acompanhante: crianças e adolescentes, idosos, gestantes no parto e pós-parto e pessoas com deficiência. Horários de visita e número de visitantes são informados pela recepção da internação.',
      'Visitar quem a gente ama faz bem! Só lembre de higienizar as mãos e evitar a visita se estiver gripado. Os horários são passados pela recepção da internação.',
    ],
    actions: ['visitas'],
  },
  {
    id: 'documentos', priority: 4,
    match: /(documento|rg|cpf|carteirinha|cartao do sus|o que preciso levar|levar (o que|algo)|certidao)/,
    replies: [
      'Leve documento oficial com foto (certidão para crianças), o cartão do convênio ou guia, pedido médico, exames e receitas recentes, e a lista de remédios e alergias.',
    ],
    actions: ['documentos'],
  },
  {
    id: 'alta', priority: 4,
    match: /(\balta\b|receber alta|depois da alta|orientacoes de alta)/,
    replies: [
      'Na alta você recebe orientações por escrito: remédios, cuidados em casa, sinais de alerta e data de retorno. Guarde esse papel e leve na próxima consulta.',
    ],
    actions: ['minha-jornada'],
  },
  {
    id: 'exames', priority: 4,
    match: /(exame|tomografia|raio.?x|radiografia|ultrass\w*|endoscopia|ecocardiograma|laboratori\w*|coleta|sangue|preparo|jejum)/,
    replies: [
      'Fazemos exames de imagem, laboratório, endoscopia e do coração. Na página de cada exame você vê o que é, o que levar e como agendar; o preparo específico é confirmado pela central.',
      'Me diga qual exame você vai fazer que eu te levo direto à página dele. O preparo exato depende do pedido médico, e a central confirma no agendamento.',
    ],
    actions: ['exame', 'chamar'],
  },
  {
    id: 'convenios', priority: 5,
    match: /(convenio|plano de saude|particular|aceita (plano|convenio))/,
    replies: [
      'O hospital atende particular e convênios. Como a cobertura muda conforme o plano e o procedimento, a central confirma tudo antes do agendamento.',
      'Atendemos convênios e particular. Para ter certeza da sua cobertura, tenha a carteirinha em mãos e fale com a central.',
    ],
    actions: ['convenios', 'humano'],
  },
  {
    id: 'trabalho', priority: 5,
    match: /(vaga|emprego|curriculo|trabalhar (ai|no hospital|com voces)|estagio|processo seletivo)/,
    replies: [
      'Que bom que você quer fazer parte da equipe! As vagas e o envio de currículo ficam em Trabalhe conosco.',
      'Adoraríamos conhecer você! Veja as oportunidades em Trabalhe conosco.',
    ],
    actions: ['trabalho'],
  },
  {
    id: 'ouvidoria', priority: 5,
    match: /(ouvidoria|reclamar|reclamacao|sugest\w*|elogi\w*)/,
    replies: [
      'Sua voz ajuda o hospital a melhorar. Na ouvidoria você registra elogio, sugestão, reclamação ou denúncia, inclusive de forma anônima, e recebe um protocolo.',
    ],
    actions: ['ouvidoria', 'avaliar'],
  },
  {
    id: 'avaliar', priority: 4,
    match: /(avaliar|avaliacao|nota|pesquisa de satisfacao|como foi meu atendimento)/,
    replies: ['Adoraríamos saber como foi! A avaliação leva menos de um minuto, de 0 a 10.'],
    actions: ['avaliar'],
  },
  {
    id: 'minha_jornada', priority: 4,
    match: /(meu pedido|meu agendamento|protocolo|acompanhar|lembrete|minha jornada)/,
    replies: [
      'Em Minha jornada você acompanha seus pedidos: protocolo, data, lembrete na agenda, preparo do exame e o WhatsApp do pedido. Para confirmar horários, a central é o caminho mais rápido.',
    ],
    actions: ['minha-jornada', 'humano'],
  },
  {
    id: 'privacidade', priority: 4,
    match: /(lgpd|privacidade|meus dados|dados pessoais|cookies|apagar meus dados)/,
    replies: [
      'Seus dados são tratados conforme a LGPD. O site só mede visitas se você aceitar, e nunca envia nome ou telefone para ferramentas de medição. Na página de privacidade você vê como exercer seus direitos.',
    ],
    actions: ['privacidade'],
  },
  {
    id: 'doacao', priority: 5,
    match: /(doar sangue|doacao de sangue|doe sangue|hemocentro|fhemeron|doador)/,
    replies: [
      'Doar sangue salva vidas! Em Cacoal, a doação é feita na Fhemeron, ao lado do Hospital Regional. No nosso conteúdo “Doe sangue” você vê quem pode doar e como se preparar.',
    ],
    actions: ['conteudo:doe-sangue'],
  },
  {
    id: 'campanhas', priority: 4,
    match: /(novembro azul|outubro rosa|prostata|mamografia|cancer de mama|saude do homem|prevencao)/,
    replies: [
      'Prevenção é um gesto de cuidado. Preparamos conteúdos em linguagem simples sobre o Novembro Azul e o Outubro Rosa, com o que a ciência recomenda hoje.',
    ],
    actions: ['conteudo:novembro-azul', 'conteudo:outubro-rosa', 'agendar'],
  },
];

/* ------------------------------------------------------------------ */
/* Tecido da conversa: aberturas, fechos e reconhecimento de emoção    */
/* ------------------------------------------------------------------ */
export const EMPATHY: { match: RegExp; lines: string[] }[] = [
  { match: /(preocupad|ansios|nervos|com medo|assustad|aflit|apreensiv)/, lines: ['Imagino a preocupação, e isso é natural.', 'Respira com calma: vamos resolver juntos.', 'Entendo a preocupação. Estou aqui para te ajudar a dar o próximo passo.'] },
  { match: /(urgente|rapido|logo|hoje mesmo|pressa)/, lines: ['Entendi que é para logo.', 'Vou direto ao ponto para você ganhar tempo.'] },
  { match: /(minha mae|meu pai|minha avo|meu avo|minha esposa|meu marido|meu filho|minha filha)/, lines: ['Cuidar de quem a gente ama é o que mais importa.', 'Que bom que você está cuidando de quem ama.'] },
  { match: /(nao entendi|confus|complicad|dificil)/, lines: ['Vou explicar de um jeito mais simples.', 'Sem problema, vamos por partes.'] },
];

export const CLOSERS = [
  'Posso ajudar em mais alguma coisa?',
  'Se quiser, sigo com você no próximo passo.',
  'Estou por aqui se surgir outra dúvida.',
  'Quer que eu te ajude com mais algo?',
  '',
  '',
];

export const FALLBACKS = [
  'Hum, acho que não entendi direito. Pode me contar com outras palavras? Se preferir, escolha um dos caminhos abaixo.',
  'Quero te ajudar do jeito certo. Você pode escrever, por exemplo, “quero agendar cardiologia” ou “como faço o preparo da tomografia”.',
  'Essa eu ainda não sei responder, mas a nossa central sabe! Posso te conectar, ou você pode tentar perguntar de outro jeito.',
];

export const YES = /^(sim|s|claro|quero|pode|pode ser|ok|okay|beleza|bora|vamos|isso|com certeza|por favor|manda|desejo|gostaria)\b/;
export const NO = /^(nao|n|agora nao|depois|nao obrigad|deixa|esquece)\b/;
