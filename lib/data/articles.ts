import type { Article, Campaign } from '@/lib/domain/types';

/**
 * Conteúdos de saúde do HBSP — textos informativos em linguagem simples.
 * Capas em /public/images/conteudo/<slug>-capa.webp (com título) e <slug>.webp (foto limpa para cards).
 */
const base = { status: 'published' as const, updatedAt: '2026-11-16', author: 'Equipe de Saúde do Hospital São Paulo' };
const img = (slug: string) => `/images/conteudo/${slug}`;

export const articles: Article[] = [
  {
    ...base,
    slug: 'novembro-azul',
    title: 'Novembro Azul: a saúde do homem começa com uma conversa',
    intent: 'prevencao',
    excerpt: 'Por que vale ir ao médico mesmo sem sintomas, o que se sabe sobre o câncer de próstata e como cuidar da saúde do homem o ano todo.',
    readingMinutes: 6,
    publishedAt: '2026-11-01',
    relatedSpecialty: 'urologia',
    image: img('novembro-azul'),
    cover: img('novembro-azul-capa'),
    cta: { label: 'Agendar consulta com a urologia', href: '/agendar?especialidade=urologia&origem=artigo-novembro-azul' },
    body: [
      { text: 'Novembro é o mês de lembrar que cuidar da saúde também é coisa de homem. A campanha Novembro Azul nasceu para chamar atenção para o câncer de próstata, mas o convite é mais amplo: pressão arterial, colesterol, diabetes, peso, saúde mental e hábitos de vida também entram na conversa.' },
      { text: 'Muitos homens só procuram o médico quando a dor aparece. O problema é que várias doenças começam em silêncio. Uma consulta de rotina permite olhar para o histórico familiar, pedir exames quando fazem sentido e combinar, com calma, o que acompanhar daqui para frente.' },
      { heading: 'O que é a próstata e por que ela importa', text: 'A próstata é uma glândula do tamanho de uma noz, localizada abaixo da bexiga. Com a idade, é comum que ela aumente de tamanho (hiperplasia benigna), o que pode causar jato urinário fraco e vontade frequente de urinar, principalmente à noite. Isso não é câncer, mas merece avaliação.' },
      { text: 'Entre os homens brasileiros, o câncer de próstata é o tipo mais frequente, atrás apenas do câncer de pele não melanoma. O Instituto Nacional de Câncer (INCA) estima cerca de 71,7 mil casos novos por ano no triênio 2023–2025.' },
      { heading: 'Quais sinais pedem atenção', text: 'Na fase inicial, o câncer de próstata costuma não dar sintomas. Quando aparecem, os sinais mais comuns são:', list: ['dificuldade para começar a urinar ou jato fraco', 'vontade de urinar muitas vezes, inclusive à noite', 'sensação de que a bexiga não esvaziou', 'sangue na urina ou no sêmen', 'dor persistente na região lombar ou nos ossos'] },
      { callout: 'Esses sintomas também podem ter outras causas, como infecção ou aumento benigno da próstata. Só a avaliação médica diferencia uma situação da outra.' },
      { heading: 'Exame de rotina: decisão compartilhada', text: 'Os exames mais usados na investigação são o PSA (um exame de sangue) e o toque retal, além de exames de imagem quando indicados. O Ministério da Saúde não recomenda o rastreamento populacional em homens sem sintomas. Já sociedades médicas de urologia orientam conversar sobre o tema a partir dos 50 anos, ou dos 45 para quem tem pai ou irmão com a doença e para homens negros, que têm risco maior.' },
      { text: 'Na prática, a melhor decisão é tomada junto com o médico: ele explica benefícios e limites dos exames para o seu caso e define o melhor momento para cada um.' },
      { heading: 'Saúde do homem vai além da próstata', list: ['Pressão arterial: meça pelo menos uma vez por ano.', 'Glicose e colesterol: acompanhe conforme orientação médica.', 'Peso e cintura: o excesso de gordura abdominal aumenta o risco cardiovascular.', 'Álcool e tabaco: reduzir ou parar faz diferença em qualquer idade.', 'Saúde mental: tristeza persistente, irritabilidade e insônia também são motivos para consulta.', 'Atividade física: pelo menos 150 minutos por semana de atividade moderada.'] },
      { heading: 'O que levar para a consulta', list: ['Documento com foto e cartão do convênio, se houver', 'Lista de remédios que você usa', 'Exames anteriores', 'Histórico de doenças na família (pai, irmãos, avós)', 'As dúvidas anotadas antes de sair de casa'] },
      { heading: 'Quando procurar atendimento logo', text: 'Dificuldade total para urinar, dor intensa ou sangue na urina em grande quantidade merecem avaliação rápida. Nesses casos, venha ao pronto atendimento do Hospital São Paulo, aberto todos os dias.' },
    ],
    sources: [
      { label: 'INCA — Estimativa 2023: Incidência de Câncer no Brasil', url: 'https://www.gov.br/inca/pt-br' },
      { label: 'INCA — Nota técnica sobre detecção precoce do câncer de próstata' },
    ],
  },
  {
    ...base,
    slug: 'outubro-rosa',
    title: 'Outubro Rosa o ano todo: prevenção do câncer de mama',
    intent: 'prevencao',
    excerpt: 'Autoconhecimento, consulta e mamografia na idade certa: o que mudou nas recomendações e como cuidar das mamas o ano inteiro.',
    readingMinutes: 6,
    publishedAt: '2026-10-04',
    relatedSpecialty: 'ginecologia',
    image: img('outubro-rosa'),
    cover: img('outubro-rosa-capa'),
    cta: { label: 'Agendar consulta ginecológica', href: '/agendar?especialidade=ginecologia&origem=artigo-outubro-rosa' },
    body: [
      { text: 'O câncer de mama é o tipo de câncer mais comum entre as mulheres brasileiras, depois do câncer de pele não melanoma. O INCA estima cerca de 73,6 mil casos novos por ano no triênio 2023–2025. A boa notícia é que, quando descoberto cedo, as chances de tratamento bem-sucedido são muito maiores.' },
      { text: 'Por isso o Outubro Rosa não termina em 31 de outubro. Prevenção e diagnóstico precoce são cuidados para o ano inteiro.' },
      { heading: 'Conheça o seu corpo', text: 'Observar e tocar as mamas no dia a dia — no banho, ao trocar de roupa — ajuda a perceber mudanças. Isso não substitui os exames, mas é um aliado. Procure avaliação se notar:', list: ['caroço (nódulo) fixo e geralmente indolor na mama ou na axila', 'pele da mama avermelhada, retraída ou parecida com casca de laranja', 'alteração no bico do peito (mamilo), como retração ou feridas', 'saída espontânea de líquido pelo mamilo', 'mudança no tamanho ou no formato de uma das mamas'] },
      { heading: 'Mamografia: o que mudou', text: 'Em 2025, o Ministério da Saúde ampliou as recomendações de mamografia no SUS. O rastreamento ativo — mamografia a cada dois anos, mesmo sem sintomas — passou a abranger mulheres de 50 a 74 anos. Mulheres de 40 a 49 anos também passaram a ter acesso ao exame sem sinais ou sintomas, sem periodicidade fixa, em decisão compartilhada com o médico.' },
      { text: 'A Sociedade Brasileira de Mastologia recomenda mamografia anual a partir dos 40 anos. Mulheres com histórico familiar importante podem precisar começar antes. A consulta ginecológica é o momento de definir o plano certo para você.' },
      { heading: 'Fatores que aumentam o risco', list: ['idade acima de 50 anos', 'casos de câncer de mama ou de ovário na família, principalmente antes dos 50 anos', 'excesso de peso após a menopausa', 'sedentarismo', 'consumo de bebida alcoólica', 'primeira menstruação precoce ou menopausa tardia'] },
      { heading: 'O que você pode fazer hoje', list: ['Manter o peso adequado e praticar atividade física regularmente.', 'Evitar ou reduzir o consumo de álcool.', 'Amamentar, quando possível: a amamentação é um fator de proteção.', 'Manter as consultas ginecológicas em dia.', 'Fazer a mamografia na periodicidade combinada com o seu médico.'] },
      { callout: 'Encontrou alguma alteração? Não espere a próxima consulta de rotina. Agende uma avaliação.' },
      { heading: 'Como é a mamografia', text: 'O exame dura poucos minutos. A mama é comprimida entre duas placas por alguns segundos para que a imagem fique nítida — pode causar desconforto, mas passa rápido. No dia, evite desodorante, talco ou cremes nas mamas e nas axilas, porque podem interferir na imagem. Leve os exames anteriores para comparação.' },
    ],
    sources: [
      { label: 'Agência Gov — SUS amplia acesso à mamografia e ao tratamento do câncer de mama (29/10/2026)', url: 'https://agenciagov.ebc.com.br/noticias/202610/sus-amplia-acesso-a-mamografia-e-ao-tratamento-do-cancer-de-mama' },
      { label: 'INCA — Estimativa 2023: Incidência de Câncer no Brasil', url: 'https://www.gov.br/inca/pt-br' },
    ],
  },
  {
    ...base,
    slug: 'parto-humanizado',
    title: 'Parto humanizado: o que é e como se preparar',
    intent: 'gestacao-infancia',
    excerpt: 'Informação, respeito às escolhas e segurança para a mãe e o bebê. Entenda o plano de parto, seus direitos e o que levar para a maternidade.',
    readingMinutes: 7,
    publishedAt: '2026-08-23',
    relatedSpecialty: 'obstetricia',
    image: img('parto-humanizado'),
    cover: img('parto-humanizado-capa'),
    cta: { label: 'Conhecer a maternidade', href: '/servicos/maternidade' },
    body: [
      { text: 'Parto humanizado não é um tipo de parto: é uma forma de cuidar. Significa colocar a gestante no centro das decisões, com informação de qualidade, respeito ao tempo do corpo e ao vínculo com o bebê — sempre com segurança. Ele pode acontecer em um parto normal e também em uma cesárea, quando ela é necessária.' },
      { heading: 'Os pilares do cuidado humanizado', list: ['Informação clara em cada etapa, para decisões conscientes.', 'Respeito às escolhas da gestante, dentro do que é seguro para mãe e bebê.', 'Acompanhante de livre escolha durante o trabalho de parto, o parto e o pós-parto, direito garantido pela Lei nº 11.108/2005.', 'Liberdade de movimento e posição durante o trabalho de parto.', 'Intervenções apenas quando há indicação.', 'Contato pele a pele e amamentação logo após o nascimento, quando mãe e bebê estão bem.'] },
      { heading: 'Plano de parto: o que é e como fazer', text: 'O plano de parto é um documento simples em que a gestante registra suas preferências: quem será o acompanhante, posições que gostaria de experimentar, métodos de alívio da dor, desejo de contato pele a pele imediato, clampeamento do cordão e primeira mamada. Ele é construído durante o pré-natal, em conversa com a equipe.' },
      { callout: 'O plano de parto é um guia, não um contrato. Se a saúde da mãe ou do bebê exigir mudanças, a equipe explica o motivo e decide junto com a família.' },
      { heading: 'Alívio da dor', text: 'Existem métodos não farmacológicos que ajudam muito no trabalho de parto: caminhar, banho morno, bola de exercício, massagem, respiração e o apoio contínuo do acompanhante. Quando desejada e indicada, a analgesia (anestesia) também é uma possibilidade. Converse sobre isso com antecedência.' },
      { heading: 'Pré-natal: a preparação começa cedo', text: 'Um pré-natal completo é a base de um parto seguro. Nas consultas, a equipe acompanha a pressão, o crescimento do bebê, os exames e as vacinas, e também tira dúvidas sobre o parto e a amamentação. Comece o pré-natal assim que souber da gravidez.' },
      { heading: 'Quando ir para a maternidade', list: ['contrações regulares e ritmadas, que ficam mais fortes e próximas', 'perda de líquido pela vagina (a bolsa rompeu)', 'sangramento vaginal', 'diminuição ou ausência dos movimentos do bebê', 'dor de cabeça forte, visão embaçada ou inchaço repentino', 'febre'] },
      { heading: 'Mala da maternidade', list: ['Documento com foto, cartão do pré-natal e exames', 'Cartão do convênio, se houver', 'Roupas confortáveis e que facilitem a amamentação', 'Itens de higiene pessoal e absorventes pós-parto', 'Roupinhas, fraldas e manta para o bebê', 'Uma roupa para a saída da maternidade'] },
      { heading: 'Depois do nascimento', text: 'Nas primeiras horas, o contato pele a pele ajuda a regular a temperatura do bebê, acalma e favorece a amamentação. A equipe de enfermagem e a pediatria acompanham mãe e bebê até a alta, com orientações sobre amamentação, cuidados com o umbigo, vacinas e o teste do pezinho.' },
    ],
    sources: [
      { label: 'Lei nº 11.108/2005 — direito a acompanhante no parto' },
      { label: 'Ministério da Saúde — Diretrizes de atenção à gestante e ao parto normal', url: 'https://www.gov.br/saude/pt-br' },
    ],
  },
  {
    ...base,
    slug: 'plantao-pediatrico',
    title: 'Febre em criança: quando procurar o plantão pediátrico',
    intent: 'gestacao-infancia',
    excerpt: 'Febre é uma defesa do corpo, mas alguns sinais pedem avaliação rápida. Veja o que observar e como cuidar em casa.',
    readingMinutes: 5,
    publishedAt: '2026-06-22',
    relatedSpecialty: 'pediatria',
    image: img('plantao-pediatrico'),
    cover: img('plantao-pediatrico-capa'),
    cta: { label: 'Ver plantão pediátrico', href: '/servicos/plantao-pediatrico' },
    body: [
      { text: 'A febre é uma das principais razões que levam pais e mães ao pronto atendimento. Ela assusta, mas é importante saber: a febre é uma reação de defesa do organismo, geralmente contra infecções. Na maioria das vezes, pode ser acompanhada em casa com orientação médica.' },
      { heading: 'O que é considerado febre', text: 'Em geral, considera-se febre a temperatura a partir de 37,8 °C medida na axila. Use um termômetro digital e meça com a criança em repouso, sem muitas roupas. Mais importante do que o número é observar como a criança está: brincando, se alimentando e interagindo, ou abatida e sonolenta.' },
      { heading: 'Procure atendimento rapidamente se houver', list: ['bebê com menos de 3 meses com qualquer febre', 'dificuldade para respirar, respiração muito rápida ou "costelas aparecendo"', 'manchas roxas ou avermelhadas na pele que não somem ao pressionar', 'sonolência excessiva, dificuldade para acordar ou choro inconsolável', 'convulsão', 'recusa total de líquidos, boca seca, pouco xixi ou choro sem lágrimas', 'rigidez no pescoço ou dor de cabeça muito forte', 'febre que dura mais de 3 dias'] },
      { callout: 'Nesses casos, venha ao Hospital São Paulo. O plantão pediátrico atende pelo telefone (69) 3441-4611 para orientar sobre o atendimento.' },
      { heading: 'Como cuidar em casa', list: ['Ofereça líquidos com frequência: água, leite materno, sucos e sopas.', 'Vista a criança com roupas leves e mantenha o ambiente arejado.', 'Use antitérmico apenas na dose orientada pelo pediatra, de acordo com o peso da criança.', 'Não dê ácido acetilsalicílico (AAS) para crianças sem orientação médica.', 'Não use álcool nem banho frio para baixar a febre: eles causam desconforto e podem ser perigosos.', 'Anote os horários da febre e dos remédios para informar ao médico.'] },
      { heading: 'Febre e convulsão', text: 'Algumas crianças pequenas podem ter convulsão associada à febre. Se acontecer, deite a criança de lado, em local seguro, afaste objetos, não coloque nada na boca dela e procure atendimento imediatamente.' },
      { heading: 'O que levar para o atendimento', list: ['Documento da criança e do responsável', 'Cartão do convênio, se houver', 'Caderneta de vacinação', 'Nome e horário dos remédios que já foram dados'] },
    ],
    sources: [
      { label: 'Sociedade Brasileira de Pediatria — orientações sobre febre na infância', url: 'https://www.sbp.com.br' },
    ],
  },
  {
    ...base,
    slug: 'tomografia-computadorizada',
    title: 'Tomografia: entenda o exame antes de fazer',
    intent: 'exames',
    excerpt: 'Como a tomografia funciona, quanto tempo leva, quando é usado contraste e o que avisar à equipe antes do exame.',
    readingMinutes: 5,
    publishedAt: '2026-02-07',
    image: img('tomografia-computadorizada'),
    cover: img('tomografia-computadorizada-capa'),
    cta: { label: 'Ver exame de tomografia', href: '/exames/tomografia-computadorizada' },
    body: [
      { text: 'A tomografia computadorizada é um exame de imagem que usa raios X e computador para formar "fatias" do corpo. Com elas, o médico consegue ver órgãos, ossos, vasos e tecidos com muito mais detalhe do que em uma radiografia comum.' },
      { heading: 'Para que serve', text: 'A tomografia ajuda a investigar dores, traumas, infecções, tumores, alterações nos pulmões, no abdômen, na cabeça e na coluna, além de orientar tratamentos e cirurgias. Em situações de urgência, como acidentes e suspeita de AVC, é um exame rápido e decisivo.' },
      { heading: 'Como é o exame', text: 'Você fica deitado em uma mesa que se move devagar por dentro de um aparelho em formato de anel — aberto, diferente da ressonância. O exame em si leva poucos minutos e não dói. Durante as imagens, é importante ficar imóvel e, às vezes, prender a respiração por alguns segundos, conforme a orientação do técnico.' },
      { heading: 'Com ou sem contraste', text: 'Alguns exames usam contraste iodado, uma substância aplicada na veia que realça vasos e órgãos. Nesse caso, pode haver orientação de jejum e você pode sentir calor pelo corpo ou gosto metálico por alguns instantes — é normal e passa rápido.' },
      { heading: 'Avise a equipe antes do exame se você', list: ['tem alergia a contraste, a iodo ou a outros medicamentos', 'tem problema nos rins', 'tem diabetes e usa metformina', 'está grávida ou pode estar grávida', 'está amamentando', 'tem asma ou outras doenças alérgicas'] },
      { callout: 'O preparo (jejum, suspensão de remédios, hidratação) varia conforme o tipo de tomografia e o pedido médico. A central informa o preparo completo no agendamento.' },
      { heading: 'E a radiação?', text: 'A tomografia usa uma dose de radiação maior que a de uma radiografia simples, mas ela é calculada para ser a menor possível para cada exame. O médico só pede a tomografia quando o benefício da informação supera o risco. Por isso, informe sempre exames recentes semelhantes, para evitar repetições.' },
      { heading: 'Depois do exame', text: 'Em geral, você retoma suas atividades normalmente. Se recebeu contraste, beba bastante água ao longo do dia, salvo orientação contrária. O laudo é feito por um médico radiologista e entregue conforme o prazo informado na recepção.' },
      { heading: 'O que levar', list: ['Pedido médico', 'Documento com foto e cartão do convênio, se houver', 'Exames anteriores da mesma região do corpo', 'Lista de remédios em uso'] },
    ],
    sources: [
      { label: 'Colégio Brasileiro de Radiologia — orientações ao paciente' },
    ],
  },
  {
    ...base,
    slug: 'doe-sangue',
    title: 'Doe sangue: um gesto simples que salva vidas',
    intent: 'comunidade',
    excerpt: 'Quem pode doar, como se preparar, quanto tempo leva e onde doar em Cacoal.',
    readingMinutes: 4,
    publishedAt: '2026-06-22',
    image: img('doe-sangue'),
    cover: img('doe-sangue-capa'),
    cta: { label: 'Falar com o hospital', href: '/contato' },
    body: [
      { text: 'Cirurgias, partos, tratamentos de câncer, acidentes e pacientes com doenças do sangue dependem dos estoques dos hemocentros. Não existe substituto para o sangue humano — por isso cada doação faz tanta diferença. Uma única bolsa pode beneficiar até quatro pessoas.' },
      { heading: 'Quem pode doar', list: ['Pessoas de 16 a 69 anos (menores de 18 com autorização do responsável; a primeira doação deve ser feita até os 60 anos)', 'Peso a partir de 50 kg', 'Estar bem de saúde, descansado e alimentado', 'Apresentar documento oficial com foto'] },
      { heading: 'Como se preparar', list: ['Durma bem na noite anterior.', 'Não doe em jejum: faça uma refeição leve.', 'Evite alimentos gordurosos nas horas que antecedem a doação.', 'Não consuma bebida alcoólica nas 12 horas anteriores.', 'Beba bastante água antes e depois.'] },
      { heading: 'Como funciona', text: 'Na unidade de coleta, você faz um cadastro, uma triagem com perguntas sobre sua saúde e uma checagem rápida, como a verificação de anemia. A coleta em si leva de 10 a 15 minutos. Depois, há um lanche e alguns minutos de descanso.' },
      { heading: 'Intervalo entre doações', list: ['Homens: a cada 2 meses, até 4 vezes por ano', 'Mulheres: a cada 3 meses, até 3 vezes por ano'] },
      { heading: 'Impedimentos temporários mais comuns', list: ['gripe, resfriado ou febre recente', 'gravidez e período de amamentação', 'tatuagem ou piercing feitos recentemente', 'procedimentos cirúrgicos ou odontológicos recentes', 'uso de alguns medicamentos'] },
      { callout: 'A equipe do hemocentro avalia cada caso na triagem. Na dúvida, procure a unidade antes de ir.' },
      { heading: 'Onde doar em Cacoal', text: 'Em Cacoal, a doação é feita na Unidade de Coleta e Transfusão da Fhemeron, na Avenida Malaquita, s/nº, bairro Josino Brito, ao lado do Hospital Regional. Ela atende também municípios vizinhos, como Espigão d’Oeste, Ministro Andreazza e Castanheiras.' },
    ],
    sources: [
      { label: 'Fhemeron — Fundação de Hematologia e Hemoterapia de Rondônia' },
      { label: 'Ministério da Saúde — critérios para doação de sangue', url: 'https://www.gov.br/saude/pt-br' },
    ],
  },
];

export const articleIntents: Record<Article['intent'], string> = {
  prevencao: 'Prevenção',
  'gestacao-infancia': 'Gestação e infância',
  exames: 'Entenda seu exame',
  comunidade: 'Comunidade',
  servicos: 'Nossos serviços',
};

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export const campaigns: Campaign[] = [
  {
    slug: 'novembro-azul',
    title: 'Novembro Azul 2026',
    startsAt: '2026-11-01',
    endsAt: '2026-11-30',
    headline: 'Novembro Azul: cuidar de você também é coragem.',
    text: 'Agende sua consulta com a urologia e converse sobre prevenção.',
    utmCampaign: '2026-11_novembro-azul',
    status: 'published',
    updatedAt: '2026-11-16',
  },
];

/** Campanha ativa na data de hoje (controle de publicação e expiração). */
export const activeCampaign = (date = new Date()) =>
  campaigns.find((c) => c.status === 'published' && new Date(c.startsAt) <= date && date <= new Date(c.endsAt + 'T23:59:59'));
