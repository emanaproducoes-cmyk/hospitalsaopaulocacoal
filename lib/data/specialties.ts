import type { Specialty, SpecialtyGroup } from '@/lib/domain/types';

/**
 * 30 especialidades listadas publicamente em hmsaopaulo.com.br + Cirurgia Vascular (corpo clínico publicado).
 * Textos em linguagem simples e de caráter geral — revisar com o corpo clínico.
 */
const base = { status: 'review' as const, updatedAt: '2026-11-02', source: 'hmsaopaulo.com.br', pendingValidation: true };

const s = (
  slug: string,
  name: string,
  group: SpecialtyGroup,
  summary: string,
  whenToSeek: string[],
  keywords: string[] = [],
): Specialty => ({ ...base, slug, name, group, summary, whenToSeek, keywords });

export const specialtyGroups: Record<SpecialtyGroup, string> = {
  clinicas: 'Especialidades clínicas',
  cirurgicas: 'Especialidades cirúrgicas',
  'mulher-crianca': 'Mulher e criança',
  diagnostico: 'Diagnóstico e apoio',
  multiprofissional: 'Cuidado multiprofissional',
};

export const specialties: Specialty[] = [
  s('anestesiologia', 'Anestesiologia', 'cirurgicas', 'Cuida do seu conforto e da sua segurança antes, durante e depois de cirurgias e procedimentos.', ['Avaliação pré-anestésica antes de uma cirurgia', 'Dúvidas sobre tipos de anestesia'], ['anestesia', 'pré-operatório']),
  s('bioquimica', 'Bioquímica', 'diagnostico', 'Profissionais responsáveis pela análise de amostras no laboratório, garantindo resultados confiáveis.', ['Exames de sangue, urina e outros materiais'], ['laboratório', 'exame de sangue']),
  s('cardiologia', 'Cardiologia', 'clinicas', 'Prevenção, diagnóstico e tratamento de doenças do coração e da circulação.', ['Pressão alta', 'Dor ou aperto no peito (em crise, procure o pronto atendimento)', 'Palpitações e cansaço fora do comum', 'Check-up cardiológico'], ['coração', 'pressão', 'infarto', 'arritmia']),
  s('cardiopediatria', 'Cardiopediatria', 'mulher-crianca', 'Cuidado do coração de bebês, crianças e adolescentes.', ['Sopro no coração', 'Acompanhamento de cardiopatias congênitas'], ['coração infantil', 'sopro']),
  s('cirurgia-geral', 'Cirurgia Geral', 'cirurgicas', 'Cirurgias do abdômen e da parede abdominal, como vesícula, hérnias e apêndice.', ['Hérnias', 'Pedra na vesícula', 'Avaliação cirúrgica'], ['vesícula', 'hérnia', 'apendicite']),
  s('cirurgia-pediatrica', 'Cirurgia Pediátrica', 'mulher-crianca', 'Cirurgias em bebês, crianças e adolescentes, com cuidado adaptado a cada idade.', ['Hérnias na infância', 'Fimose', 'Avaliação cirúrgica infantil'], ['cirurgia infantil']),
  s('clinica-geral', 'Clínica Geral', 'clinicas', 'Porta de entrada para o cuidado: avalia, orienta e encaminha quando necessário.', ['Sintomas que você não sabe a qual especialista levar', 'Check-up de rotina'], ['clínico', 'check-up']),
  s('clinica-medica', 'Clínica Médica', 'clinicas', 'Cuidado integral do adulto, com atenção a doenças crônicas e a vários problemas de saúde ao mesmo tempo.', ['Diabetes, pressão alta e colesterol', 'Acompanhamento de doenças crônicas'], ['internista', 'adulto']),
  s('dermatologia', 'Dermatologia', 'clinicas', 'Saúde da pele, cabelos e unhas — do diagnóstico ao tratamento.', ['Manchas ou pintas que mudaram', 'Acne, alergias e queda de cabelo'], ['pele', 'pinta', 'acne']),
  s('ecocardiografia', 'Ecocardiografia', 'diagnostico', 'Exame de ultrassom do coração que mostra sua estrutura e funcionamento.', ['Solicitação médica de ecocardiograma'], ['ecocardiograma', 'ultrassom do coração']),
  s('endocrinologia', 'Endocrinologia', 'clinicas', 'Hormônios e metabolismo: diabetes, tireoide, obesidade e outros.', ['Diabetes', 'Alterações da tireoide', 'Controle de peso'], ['tireoide', 'diabetes', 'hormônio']),
  s('fisioterapia', 'Fisioterapia', 'multiprofissional', 'Reabilitação para recuperar movimento, força e autonomia.', ['Recuperação após cirurgia ou internação', 'Dores e lesões'], ['reabilitação']),
  s('gastroenterologia', 'Gastroenterologia', 'clinicas', 'Saúde do estômago, intestino, fígado e vias digestivas.', ['Azia e refluxo frequentes', 'Alterações do intestino', 'Indicação de endoscopia'], ['estômago', 'intestino', 'refluxo', 'endoscopia']),
  s('genetica', 'Genética Médica', 'diagnostico', 'Avaliação de doenças hereditárias e aconselhamento genético para famílias.', ['Histórico familiar de doenças genéticas', 'Planejamento familiar'], ['geneticista', 'hereditário']),
  s('ginecologia', 'Ginecologia', 'mulher-crianca', 'Saúde da mulher em todas as fases da vida.', ['Consulta preventiva anual', 'Alterações menstruais', 'Planejamento familiar'], ['mulher', 'preventivo']),
  s('nefrologia', 'Nefrologia', 'clinicas', 'Saúde dos rins: prevenção, diagnóstico e tratamento de doenças renais.', ['Alterações em exames de função renal', 'Pressão alta de difícil controle', 'Pedras nos rins recorrentes'], ['rim', 'renal']),
  s('neurocirurgia', 'Neurocirurgia', 'cirurgicas', 'Cirurgias do cérebro, da coluna e dos nervos.', ['Hérnia de disco com indicação cirúrgica', 'Avaliação neurocirúrgica'], ['coluna', 'cérebro']),
  s('neurologia', 'Neurologia', 'clinicas', 'Cuidado do sistema nervoso: dores de cabeça, crises, memória e movimento.', ['Dor de cabeça frequente', 'Formigamentos', 'Alterações de memória'], ['enxaqueca', 'AVC', 'cérebro']),
  s('neuropediatria', 'Neuropediatria', 'mulher-crianca', 'Desenvolvimento e sistema nervoso de bebês, crianças e adolescentes.', ['Atrasos no desenvolvimento', 'Convulsões na infância'], ['desenvolvimento infantil']),
  s('nutricao', 'Nutrição', 'multiprofissional', 'Alimentação planejada para prevenir doenças e apoiar tratamentos.', ['Orientação alimentar', 'Doenças crônicas'], ['nutricionista', 'dieta']),
  s('obstetricia', 'Obstetrícia', 'mulher-crianca', 'Acompanhamento da gestação, do parto e do pós-parto.', ['Pré-natal', 'Planejamento do parto'], ['gestante', 'parto', 'pré-natal']),
  s('oftalmologia', 'Oftalmologia', 'clinicas', 'Saúde dos olhos e da visão.', ['Visão embaçada', 'Consulta de rotina para óculos', 'Glaucoma e catarata'], ['olhos', 'visão']),
  s('ortopedia', 'Ortopedia', 'cirurgicas', 'Ossos, articulações, músculos e coluna.', ['Dores nas articulações', 'Lesões esportivas', 'Dor nas costas'], ['osso', 'joelho', 'coluna']),
  s('otorrinolaringologia', 'Otorrinolaringologia', 'clinicas', 'Ouvido, nariz e garganta.', ['Sinusite e rinite', 'Perda de audição', 'Dor de garganta recorrente'], ['otorrino', 'ouvido', 'nariz']),
  s('pediatria', 'Pediatria', 'mulher-crianca', 'Saúde e desenvolvimento de bebês, crianças e adolescentes.', ['Consultas de puericultura', 'Febre e sintomas na infância', 'Vacinação e crescimento'], ['criança', 'bebê', 'pediatra']),
  s('psicologia', 'Psicologia', 'multiprofissional', 'Apoio emocional e psicoterapia para pacientes e familiares.', ['Ansiedade e estresse', 'Apoio durante tratamentos e internações'], ['emocional', 'terapia']),
  s('psiquiatria', 'Psiquiatria', 'clinicas', 'Diagnóstico e tratamento médico da saúde mental.', ['Tristeza persistente', 'Ansiedade intensa', 'Alterações do sono'], ['saúde mental', 'depressão']),
  s('saude-da-pele', 'Saúde da Pele', 'clinicas', 'Cuidados preventivos e tratamentos para manter a pele saudável.', ['Prevenção do câncer de pele', 'Cuidados estéticos e clínicos'], ['pele']),
  s('cirurgia-vascular', 'Cirurgia Vascular e Endovascular', 'cirurgicas', 'Cuidado de artérias e veias, como varizes, má circulação e aneurismas.', ['Varizes', 'Inchaço e dor nas pernas', 'Má circulação'], ['varizes', 'circulação', 'veias']),
  s('traumatologia', 'Traumatologia', 'cirurgicas', 'Tratamento de fraturas, entorses e lesões causadas por acidentes.', ['Fraturas e torções (em caso agudo, procure o pronto atendimento)'], ['fratura', 'acidente']),
  s('urologia', 'Urologia', 'cirurgicas', 'Saúde do sistema urinário e saúde do homem.', ['Prevenção do câncer de próstata', 'Pedras nos rins', 'Alterações urinárias'], ['próstata', 'homem', 'novembro azul']),
];

export const getSpecialty = (slug: string) => specialties.find((x) => x.slug === slug);
