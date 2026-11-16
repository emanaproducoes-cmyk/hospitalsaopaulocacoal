import type { FAQ } from '@/lib/domain/types';

const base = { status: 'review' as const, updatedAt: '2026-11-02' };

export const faqs: FAQ[] = [
  { ...base, topic: 'atendimento', question: 'O pronto atendimento funciona todos os dias?', answer: 'Sim. O pronto atendimento do HBSP funciona todos os dias, com equipe médica. Em caso de dúvida, ligue para (69) 99305-0030.' },
  { ...base, topic: 'atendimento', question: 'Quando devo vir direto ao pronto atendimento?', answer: 'Venha imediatamente se houver dor forte no peito, falta de ar intensa, sinais de AVC (boca torta, fraqueza de um lado do corpo, fala enrolada), desmaio, convulsão, sangramento intenso ou após um acidente. Se a pessoa não puder se deslocar com segurança, ligue para o hospital e peça orientação.' },
  { ...base, topic: 'agendamento', question: 'Como agendo uma consulta?', answer: 'Use o assistente "Agendar" do site: em 4 passos você escolhe o tipo de atendimento, a especialidade e o melhor período. Ao final, abrimos uma conversa no WhatsApp da central (69) 99305-0030 com a mensagem pronta.' },
  { ...base, topic: 'agendamento', question: 'Preciso de pedido médico para fazer exames?', answer: 'Na maioria dos exames, sim. Leve o pedido médico, documento com foto e cartão do convênio, se houver. Cada exame tem uma página com documentos e preparo.' },
  { ...base, topic: 'convenios', question: 'Quais convênios são aceitos?', answer: 'Antes de agendar, confirme a cobertura do seu plano com a central pelo WhatsApp (69) 99305-0030. Também atendemos particular.' },
  { ...base, topic: 'internacao', question: 'Quem pode acompanhar o paciente internado?', answer: 'Crianças, adolescentes, idosos, gestantes e pessoas com deficiência têm direito a acompanhante, conforme a legislação. Para horários de visita e troca de acompanhante, informe-se na recepção da internação.' },
  { ...base, topic: 'internacao', question: 'O que levar para a internação?', answer: 'Documento com foto, cartão do convênio, exames e receitas recentes, lista de remédios em uso, itens de higiene pessoal e roupas confortáveis. Evite levar objetos de valor.' },
  { ...base, topic: 'privacidade', question: 'Como o hospital usa meus dados?', answer: 'Usamos seus dados apenas para a finalidade informada (por exemplo, retornar seu contato), conforme a LGPD. Você pode pedir acesso, correção ou exclusão a qualquer momento. Veja a página de Privacidade.' },
];
