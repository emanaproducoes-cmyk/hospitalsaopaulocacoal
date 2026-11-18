/**
 * Esquema do cadastro, da anamnese e da consulta (prontuário).
 * Um só esquema alimenta os formulários do paciente e do médico, a validação no servidor
 * e o resumo do prontuário. Listas suspensas e caixas de seleção agilizam o preenchimento.
 */

export type FieldType = 'text' | 'textarea' | 'date' | 'month' | 'select' | 'multi' | 'check' | 'number' | 'tel' | 'email' | 'cpf' | 'cep' | 'uf';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  suggestions?: readonly string[]; // lista de sugestões (datalist) em campos de texto
  placeholder?: string;
  hint?: string;
  span?: 1 | 2 | 3; // largura na grade de 6 colunas: 1 = terço, 2 = dois terços, 3 = inteira
  doctorOnly?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

export interface GroupDef {
  key: string;
  label: string;
  repeat?: boolean; // lista de itens (ex.: medicações)
  addLabel?: string;
  summary?: string[]; // campos que formam o título do item
  intro?: string;
  fields: FieldDef[];
}

export interface SectionDef {
  key: string;
  title: string;
  icon: string;
  intro?: string;
  groups: GroupDef[];
}

export type FormValue = Record<string, Record<string, unknown> | Record<string, unknown>[]>;

/* ----------------------------- Vocabulários ----------------------------- */
export const UF = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'] as const;
const STATUS_CONDICAO = ['Em tratamento', 'Controlada', 'Tratada / curada', 'Em investigação', 'Sem tratamento'] as const;
const PARENTESCO = ['Mãe', 'Pai', 'Cônjuge / companheiro(a)', 'Filho(a)', 'Irmão(ã)', 'Avô / avó', 'Tio(a)', 'Amigo(a)', 'Responsável legal', 'Outro'] as const;

export const COMORBIDADES = ['Hipertensão arterial', 'Diabetes tipo 1', 'Diabetes tipo 2', 'Colesterol alto (dislipidemia)', 'Obesidade', 'Asma', 'DPOC / enfisema', 'Insuficiência cardíaca', 'Arritmia', 'Infarto prévio', 'AVC prévio', 'Doença renal crônica', 'Hipotireoidismo', 'Hipertireoidismo', 'Epilepsia', 'Depressão', 'Ansiedade', 'Câncer (atual ou prévio)', 'Doença hepática', 'Artrite reumatoide', 'Osteoporose', 'HIV', 'Hepatite B', 'Hepatite C', 'Anemia', 'Doença autoimune'] as const;
export const CONGENITAS = ['Cardiopatia congênita', 'Síndrome de Down', 'Fenda labiopalatina', 'Hipotireoidismo congênito', 'Fibrose cística', 'Anemia falciforme', 'Talassemia', 'Hemofilia', 'Luxação congênita do quadril', 'Pé torto congênito', 'Espinha bífida', 'Surdez congênita'] as const;
export const ALERGIA_MED = ['Dipirona', 'Penicilina / amoxicilina', 'Cefalosporinas', 'Sulfa', 'AAS (aspirina)', 'Anti-inflamatórios (AINEs)', 'Paracetamol', 'Morfina / opioides', 'Contraste iodado', 'Anestésicos locais', 'Insulina', 'Vacinas', 'Iodo'] as const;
export const ALERGIA_ALIM = ['Leite / lactose', 'Ovo', 'Amendoim', 'Castanhas', 'Frutos do mar', 'Peixe', 'Trigo / glúten', 'Soja', 'Corantes'] as const;
export const ALERGIA_OUTRAS = ['Látex', 'Esparadrapo / adesivos', 'Picada de insetos', 'Poeira / ácaros', 'Pelos de animais', 'Pólen', 'Níquel / metais'] as const;
export const REACOES = ['Urticária / coceira', 'Inchaço (angioedema)', 'Falta de ar', 'Anafilaxia', 'Náusea / vômito', 'Diarreia', 'Queda de pressão', 'Manchas na pele', 'Outra'] as const;
export const MEDICAMENTOS = ['Losartana', 'Enalapril', 'Anlodipino', 'Hidroclorotiazida', 'Metformina', 'Glibenclamida', 'Insulina NPH', 'Insulina regular', 'Sinvastatina', 'Atorvastatina', 'AAS 100 mg', 'Clopidogrel', 'Varfarina', 'Rivaroxabana', 'Levotiroxina', 'Omeprazol', 'Pantoprazol', 'Sertralina', 'Fluoxetina', 'Escitalopram', 'Clonazepam', 'Salbutamol (bombinha)', 'Budesonida', 'Furosemida', 'Espironolactona', 'Carvedilol', 'Metoprolol', 'Prednisona', 'Dipirona', 'Paracetamol'] as const;
export const FREQUENCIA = ['1x ao dia', '2x ao dia (12/12h)', '3x ao dia (8/8h)', '4x ao dia (6/6h)', 'Semanal', 'Mensal', 'Se necessário', 'Outra'] as const;
export const VIAS = ['Oral', 'Sublingual', 'Inalatória', 'Injetável intramuscular', 'Injetável intravenosa', 'Subcutânea', 'Tópica (pele)', 'Ocular', 'Nasal', 'Retal', 'Outra'] as const;
export const RISCOS = ['Alergia grave', 'Anticoagulado (sangra mais fácil)', 'Risco de queda', 'Imunossuprimido', 'Marcapasso / dispositivo implantado', 'Prótese metálica', 'Dificuldade de via aérea', 'Risco de broncoaspiração', 'Gestante', 'Lactante', 'Doença transmissível', 'Restrição a transfusão de sangue', 'Diabetes de difícil controle', 'Uso de oxigênio domiciliar', 'Mobilidade reduzida'] as const;
export const FAMILIA = ['Hipertensão', 'Diabetes', 'Infarto / doença cardíaca', 'AVC', 'Câncer de mama', 'Câncer de próstata', 'Câncer de intestino', 'Outros cânceres', 'Doença mental', 'Doença genética', 'Morte súbita', 'Alzheimer / demência'] as const;
export const VACINAS = ['Covid-19', 'Influenza (anual)', 'Hepatite B', 'Tétano / dT', 'Febre amarela', 'Tríplice viral', 'HPV', 'Pneumocócica', 'Meningocócica', 'Herpes-zóster'] as const;
export const EXAMES_COMUNS = ['Hemograma', 'Glicemia de jejum', 'Hemoglobina glicada', 'Colesterol e frações', 'Triglicerídeos', 'Creatinina / ureia', 'TSH / T4 livre', 'Urina tipo 1', 'PSA', 'Eletrocardiograma', 'Ecocardiograma', 'Raio X de tórax', 'Ultrassom de abdome', 'Tomografia', 'Ressonância', 'Mamografia', 'Endoscopia', 'Colonoscopia', 'Teste ergométrico', 'Holter'] as const;
export const CONDICOES_SUGESTOES = [...COMORBIDADES, 'Enxaqueca', 'Gastrite', 'Refluxo', 'Hérnia de disco', 'Artrose', 'Rinite alérgica', 'Sinusite crônica', 'Pedra nos rins', 'Gota', 'Fibromialgia', 'Glaucoma', 'Catarata', 'Varizes', 'Trombose prévia'] as const;

/* ------------------------------ Cadastro ------------------------------ */
export const PROFILE: SectionDef[] = [
  {
    key: 'identificacao', title: 'Identificação', icon: 'user',
    groups: [{
      key: 'identificacao', label: 'Dados pessoais',
      fields: [
        { key: 'nome', label: 'Nome completo', type: 'text', span: 2, required: true },
        { key: 'nomeSocial', label: 'Nome social', type: 'text', span: 1, hint: 'Como você prefere ser chamado(a)' },
        { key: 'nascimento', label: 'Data de nascimento', type: 'date', span: 1, required: true },
        { key: 'sexo', label: 'Sexo', type: 'select', options: ['Feminino', 'Masculino', 'Intersexo', 'Prefiro não informar'], span: 1 },
        { key: 'genero', label: 'Identidade de gênero', type: 'select', options: ['Mulher cis', 'Homem cis', 'Mulher trans', 'Homem trans', 'Não binário', 'Outra', 'Prefiro não informar'], span: 1 },
        { key: 'cpf', label: 'CPF', type: 'cpf', span: 1 },
        { key: 'rg', label: 'RG', type: 'text', span: 1 },
        { key: 'rgOrgao', label: 'Órgão emissor / UF', type: 'text', span: 1, placeholder: 'SSP/RO' },
        { key: 'cns', label: 'Cartão Nacional de Saúde (SUS)', type: 'text', span: 1 },
        { key: 'estadoCivil', label: 'Estado civil', type: 'select', options: ['Solteiro(a)', 'Casado(a)', 'União estável', 'Divorciado(a)', 'Viúvo(a)'], span: 1 },
        { key: 'racaCor', label: 'Raça / cor (IBGE)', type: 'select', options: ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Prefiro não informar'], span: 1 },
        { key: 'profissao', label: 'Profissão', type: 'text', span: 1 },
        { key: 'escolaridade', label: 'Escolaridade', type: 'select', options: ['Sem escolaridade', 'Fundamental incompleto', 'Fundamental completo', 'Médio incompleto', 'Médio completo', 'Superior incompleto', 'Superior completo', 'Pós-graduação'], span: 1 },
        { key: 'naturalidade', label: 'Naturalidade (cidade/UF)', type: 'text', span: 1 },
        { key: 'tipoSanguineo', label: 'Tipo sanguíneo', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Não sei'], span: 1 },
      ],
    }],
  },
  {
    key: 'contato', title: 'Contato e endereço', icon: 'pin',
    groups: [
      {
        key: 'contato', label: 'Contatos',
        fields: [
          { key: 'celular', label: 'Celular (WhatsApp)', type: 'tel', span: 1, required: true },
          { key: 'telefone', label: 'Outro telefone', type: 'tel', span: 1 },
          { key: 'email', label: 'E-mail da conta', type: 'email', span: 1, readOnly: true, hint: 'Alterado só pela central, por segurança' },
          { key: 'avisos', label: 'Quero receber avisos de exames e consultas por e-mail', type: 'check', span: 3 },
        ],
      },
      {
        key: 'endereco', label: 'Endereço',
        fields: [
          { key: 'cep', label: 'CEP', type: 'cep', span: 1 },
          { key: 'logradouro', label: 'Rua / avenida', type: 'text', span: 2 },
          { key: 'numero', label: 'Número', type: 'text', span: 1 },
          { key: 'complemento', label: 'Complemento', type: 'text', span: 1 },
          { key: 'bairro', label: 'Bairro', type: 'text', span: 1 },
          { key: 'cidade', label: 'Cidade', type: 'text', span: 2 },
          { key: 'uf', label: 'UF', type: 'uf', span: 1 },
          { key: 'referencia', label: 'Ponto de referência', type: 'text', span: 3 },
        ],
      },
    ],
  },
  {
    key: 'familia', title: 'Filiação e emergência', icon: 'users',
    groups: [
      {
        key: 'filiacao', label: 'Filiação',
        fields: [
          { key: 'mae', label: 'Nome da mãe', type: 'text', span: 3 },
          { key: 'pai', label: 'Nome do pai', type: 'text', span: 3 },
          { key: 'responsavel', label: 'Responsável legal (menores ou tutelados)', type: 'text', span: 2 },
          { key: 'responsavelCpf', label: 'CPF do responsável', type: 'cpf', span: 1 },
        ],
      },
      {
        key: 'emergencia', label: 'Contatos de emergência', repeat: true, addLabel: 'Adicionar contato', summary: ['nome', 'parentesco'],
        fields: [
          { key: 'nome', label: 'Nome', type: 'text', span: 2 },
          { key: 'parentesco', label: 'Parentesco', type: 'select', options: PARENTESCO, span: 1 },
          { key: 'telefone', label: 'Telefone', type: 'tel', span: 1 },
        ],
      },
    ],
  },
  {
    key: 'convenio', title: 'Convênio', icon: 'shield',
    groups: [{
      key: 'convenio', label: 'Forma de atendimento',
      fields: [
        { key: 'tipo', label: 'Atendimento', type: 'select', options: ['Particular', 'Convênio'], span: 1 },
        { key: 'operadora', label: 'Operadora / plano', type: 'text', span: 1 },
        { key: 'carteirinha', label: 'Nº da carteirinha', type: 'text', span: 1 },
        { key: 'validade', label: 'Validade', type: 'month', span: 1 },
      ],
    }],
  },
];

/* ------------------------------ Anamnese ------------------------------ */
export const ANAMNESIS: SectionDef[] = [
  {
    key: 'alertas', title: 'Alergias e alertas', icon: 'alert', intro: 'Informações que a equipe precisa ver primeiro.',
    groups: [
      {
        key: 'alergias', label: 'Alergias',
        fields: [
          { key: 'nega', label: 'Não tenho alergias conhecidas', type: 'check', span: 3 },
          { key: 'medicamentos', label: 'Medicamentos', type: 'multi', options: ALERGIA_MED, span: 3 },
          { key: 'alimentos', label: 'Alimentos', type: 'multi', options: ALERGIA_ALIM, span: 3 },
          { key: 'outras', label: 'Outras', type: 'multi', options: ALERGIA_OUTRAS, span: 3 },
        ],
      },
      {
        key: 'alergiasDetalhe', label: 'Detalhe das reações', repeat: true, addLabel: 'Adicionar reação', summary: ['substancia', 'gravidade'],
        fields: [
          { key: 'substancia', label: 'Substância', type: 'text', suggestions: [...ALERGIA_MED, ...ALERGIA_ALIM, ...ALERGIA_OUTRAS], span: 1 },
          { key: 'reacao', label: 'Reação', type: 'select', options: REACOES, span: 1 },
          { key: 'gravidade', label: 'Gravidade', type: 'select', options: ['Leve', 'Moderada', 'Grave'], span: 1 },
        ],
      },
      {
        key: 'riscos', label: 'Riscos e alertas',
        fields: [{ key: 'itens', label: 'Marque o que se aplica', type: 'multi', options: RISCOS, span: 3 }],
      },
    ],
  },
  {
    key: 'condicoes', title: 'Doenças e condições', icon: 'heart',
    groups: [
      {
        key: 'comorbidades', label: 'Doenças de base (comorbidades)',
        fields: [
          { key: 'itens', label: 'Marque as que você tem ou já teve', type: 'multi', options: COMORBIDADES, span: 3 },
          { key: 'outras', label: 'Outras', type: 'text', span: 3 },
        ],
      },
      {
        key: 'congenitas', label: 'Condições congênitas',
        fields: [
          { key: 'itens', label: 'Presentes desde o nascimento', type: 'multi', options: CONGENITAS, span: 3 },
          { key: 'outras', label: 'Outras', type: 'text', span: 3 },
        ],
      },
      {
        key: 'enfermidades', label: 'Enfermidades: em tratamento e tratadas', repeat: true, addLabel: 'Adicionar enfermidade', summary: ['condicao', 'status'],
        intro: 'Detalhe cada condição: tipo, situação atual, desde quando e quem acompanha.',
        fields: [
          { key: 'condicao', label: 'Condição / doença', type: 'text', suggestions: CONDICOES_SUGESTOES, span: 2 },
          { key: 'tipo', label: 'Tipo', type: 'select', options: ['De base / crônica', 'Aguda', 'Congênita', 'Genética', 'Infecciosa', 'Saúde mental', 'Outra'], span: 1 },
          { key: 'status', label: 'Situação', type: 'select', options: STATUS_CONDICAO, span: 1 },
          { key: 'desde', label: 'Desde', type: 'month', span: 1 },
          { key: 'ate', label: 'Até (se tratada)', type: 'month', span: 1 },
          { key: 'medico', label: 'Médico / serviço que acompanha', type: 'text', span: 2 },
          { key: 'obs', label: 'Observações', type: 'text', span: 1 },
        ],
      },
    ],
  },
  {
    key: 'medicacoes', title: 'Medicações', icon: 'pill',
    groups: [{
      key: 'medicacoes', label: 'Medicações em uso e já utilizadas', repeat: true, addLabel: 'Adicionar medicação', summary: ['nome', 'dose', 'status'],
      fields: [
        { key: 'nome', label: 'Medicamento', type: 'text', suggestions: MEDICAMENTOS, span: 1 },
        { key: 'dose', label: 'Dose', type: 'text', placeholder: 'ex.: 50 mg', span: 1 },
        { key: 'frequencia', label: 'Frequência', type: 'select', options: FREQUENCIA, span: 1 },
        { key: 'via', label: 'Via', type: 'select', options: VIAS, span: 1 },
        { key: 'inicio', label: 'Início', type: 'date', span: 1 },
        { key: 'fim', label: 'Término', type: 'date', span: 1 },
        { key: 'status', label: 'Situação', type: 'select', options: ['Em uso', 'Suspenso', 'Concluído'], span: 1 },
        { key: 'motivo', label: 'Para quê', type: 'text', span: 1 },
        { key: 'prescritor', label: 'Quem prescreveu', type: 'text', span: 1 },
      ],
    }],
  },
  {
    key: 'historico', title: 'Cirurgias e internações', icon: 'surgery',
    groups: [
      {
        key: 'cirurgias', label: 'Cirurgias e intervenções', repeat: true, addLabel: 'Adicionar cirurgia', summary: ['procedimento', 'data'],
        fields: [
          { key: 'procedimento', label: 'Procedimento', type: 'text', span: 2 },
          { key: 'data', label: 'Data', type: 'date', span: 1 },
          { key: 'motivo', label: 'Motivo', type: 'text', span: 2 },
          { key: 'tecnica', label: 'Técnica', type: 'select', options: ['Aberta', 'Videolaparoscopia', 'Robótica', 'Endoscópica', 'Percutânea', 'Não sei'], span: 1 },
          { key: 'carater', label: 'Caráter', type: 'select', options: ['Eletiva (programada)', 'Urgência', 'Emergência'], span: 1 },
          { key: 'medico', label: 'Médico responsável', type: 'text', span: 1 },
          { key: 'hospital', label: 'Hospital', type: 'text', span: 1 },
          { key: 'intercorrencias', label: 'Intercorrências / complicações', type: 'text', span: 3 },
        ],
      },
      {
        key: 'internacoes', label: 'Internações', repeat: true, addLabel: 'Adicionar internação', summary: ['motivo', 'entrada'],
        fields: [
          { key: 'motivo', label: 'Motivo', type: 'text', span: 2 },
          { key: 'setor', label: 'Setor', type: 'select', options: ['Enfermaria', 'UTI', 'Semi-intensiva', 'Maternidade', 'Pediatria', 'Pronto atendimento (observação)'], span: 1 },
          { key: 'entrada', label: 'Entrada', type: 'date', span: 1 },
          { key: 'alta', label: 'Alta', type: 'date', span: 1 },
          { key: 'hospital', label: 'Hospital', type: 'text', span: 1 },
          { key: 'desfecho', label: 'Desfecho / observações', type: 'text', span: 3 },
        ],
      },
      {
        key: 'tratamentos', label: 'Médicos e serviços onde já se tratou', repeat: true, addLabel: 'Adicionar médico ou serviço', summary: ['medico', 'especialidade'],
        fields: [
          { key: 'medico', label: 'Médico', type: 'text', span: 1 },
          { key: 'especialidade', label: 'Especialidade', type: 'text', span: 1 },
          { key: 'servico', label: 'Hospital / clínica', type: 'text', span: 1 },
          { key: 'periodo', label: 'Período', type: 'text', placeholder: 'ex.: 2019 a 2023', span: 1 },
          { key: 'motivo', label: 'Motivo', type: 'text', span: 2 },
        ],
      },
    ],
  },
  {
    key: 'vida', title: 'Família e hábitos', icon: 'leaf',
    groups: [
      {
        key: 'familia', label: 'Histórico familiar',
        fields: [
          { key: 'itens', label: 'Doenças em pais, irmãos ou avós', type: 'multi', options: FAMILIA, span: 3 },
          { key: 'obs', label: 'Detalhes (quem e qual)', type: 'text', span: 3 },
        ],
      },
      {
        key: 'habitos', label: 'Hábitos',
        fields: [
          { key: 'tabagismo', label: 'Tabagismo', type: 'select', options: ['Nunca fumou', 'Ex-fumante', 'Fumante', 'Cigarro eletrônico'], span: 1 },
          { key: 'alcool', label: 'Bebida alcoólica', type: 'select', options: ['Não bebe', 'Socialmente', 'Semanalmente', 'Diariamente', 'Ex-etilista'], span: 1 },
          { key: 'atividade', label: 'Atividade física', type: 'select', options: ['Sedentário', '1–2x por semana', '3–4x por semana', '5x ou mais'], span: 1 },
          { key: 'dieta', label: 'Alimentação', type: 'multi', options: ['Vegetariana', 'Vegana', 'Sem lactose', 'Sem glúten', 'Para diabéticos', 'Com pouco sal'], span: 3 },
          { key: 'sono', label: 'Sono', type: 'select', options: ['Dorme bem', 'Insônia', 'Ronco / apneia', 'Sono excessivo'], span: 1 },
        ],
      },
      {
        key: 'vacinas', label: 'Vacinação',
        fields: [
          { key: 'itens', label: 'Vacinas que você tomou', type: 'multi', options: VACINAS, span: 3 },
          { key: 'carteira', label: 'Carteira de vacinação', type: 'select', options: ['Em dia', 'Atrasada', 'Não sei'], span: 1 },
        ],
      },
      {
        key: 'medidas', label: 'Medidas',
        fields: [
          { key: 'peso', label: 'Peso (kg)', type: 'number', span: 1 },
          { key: 'altura', label: 'Altura (cm)', type: 'number', span: 1 },
          { key: 'pressao', label: 'Pressão habitual', type: 'text', placeholder: 'ex.: 12 por 8', span: 1 },
        ],
      },
      {
        key: 'mulher', label: 'Saúde da mulher (se aplicável)',
        fields: [
          { key: 'gestante', label: 'Gestante agora', type: 'select', options: ['Não', 'Sim', 'Não sei'], span: 1 },
          { key: 'dum', label: 'Data da última menstruação', type: 'date', span: 1 },
          { key: 'gestacoes', label: 'Gestações / partos / abortos', type: 'text', placeholder: 'ex.: G2 P2 A0', span: 1 },
          { key: 'contracepcao', label: 'Método contraceptivo', type: 'select', options: ['Nenhum', 'Pílula', 'DIU de cobre', 'DIU hormonal', 'Injetável', 'Implante', 'Preservativo', 'Laqueadura', 'Menopausa'], span: 1 },
        ],
      },
      {
        key: 'adicional', label: 'Informações adicionais',
        fields: [{ key: 'texto', label: 'Algo mais que a equipe deve saber', type: 'textarea', span: 3 }],
      },
    ],
  },
];

/* ------------------------------ Consulta ------------------------------ */
export const ENCOUNTER: SectionDef[] = [
  {
    key: 'consulta', title: 'Atendimento', icon: 'stethoscope',
    groups: [
      {
        key: 'atendimento', label: 'Dados do atendimento',
        fields: [
          { key: 'tipo', label: 'Tipo', type: 'select', options: ['Consulta', 'Retorno', 'Urgência', 'Internação (evolução)', 'Pós-operatório', 'Teleconsulta'], span: 1, required: true },
          { key: 'classificacao', label: 'Classificação de risco', type: 'select', options: ['Não se aplica', 'Vermelho · emergência', 'Laranja · muito urgente', 'Amarelo · urgente', 'Verde · pouco urgente', 'Azul · não urgente'], span: 1 },
          { key: 'queixa', label: 'Queixa principal', type: 'text', span: 3, required: true },
          { key: 'hda', label: 'História da doença atual', type: 'textarea', span: 3 },
        ],
      },
      {
        key: 'vitais', label: 'Sinais vitais',
        fields: [
          { key: 'pa', label: 'PA (mmHg)', type: 'text', placeholder: '120x80', span: 1 },
          { key: 'fc', label: 'FC (bpm)', type: 'number', span: 1 },
          { key: 'fr', label: 'FR (irpm)', type: 'number', span: 1 },
          { key: 'temp', label: 'Temperatura (°C)', type: 'number', span: 1 },
          { key: 'spo2', label: 'SpO₂ (%)', type: 'number', span: 1 },
          { key: 'glicemia', label: 'Glicemia (mg/dL)', type: 'number', span: 1 },
          { key: 'peso', label: 'Peso (kg)', type: 'number', span: 1 },
          { key: 'dor', label: 'Dor (0–10)', type: 'select', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], span: 1 },
        ],
      },
      {
        key: 'avaliacao', label: 'Avaliação e conduta',
        fields: [
          { key: 'exameFisico', label: 'Exame físico', type: 'textarea', span: 3 },
          { key: 'hipoteses', label: 'Hipóteses diagnósticas', type: 'text', span: 2 },
          { key: 'cid', label: 'CID-10', type: 'text', placeholder: 'ex.: I10', span: 1 },
          { key: 'conduta', label: 'Conduta', type: 'textarea', span: 3 },
          { key: 'examesSolicitados', label: 'Exames solicitados', type: 'multi', options: EXAMES_COMUNS, span: 3 },
        ],
      },
      {
        key: 'prescricao', label: 'Prescrição', repeat: true, addLabel: 'Adicionar item', summary: ['medicamento', 'posologia'],
        fields: [
          { key: 'medicamento', label: 'Medicamento', type: 'text', suggestions: MEDICAMENTOS, span: 1 },
          { key: 'posologia', label: 'Posologia', type: 'text', placeholder: 'ex.: 1 comprimido 12/12h', span: 1 },
          { key: 'duracao', label: 'Duração', type: 'text', placeholder: 'ex.: 7 dias / uso contínuo', span: 1 },
        ],
      },
      {
        key: 'desfecho', label: 'Retorno e orientações',
        fields: [
          { key: 'retorno', label: 'Retorno', type: 'select', options: ['Sem retorno', 'Em 7 dias', 'Em 15 dias', 'Em 30 dias', 'Em 60 dias', 'Em 90 dias', 'Com resultado de exames'], span: 1 },
          { key: 'retornoData', label: 'Data do retorno', type: 'date', span: 1 },
          { key: 'orientacoes', label: 'Orientações ao paciente', type: 'textarea', span: 3, hint: 'Aparece para o paciente na área dele' },
          { key: 'notaPrivada', label: 'Anotação privada da equipe médica', type: 'textarea', span: 3, doctorOnly: true, hint: 'Não aparece para o paciente' },
        ],
      },
    ],
  },
];

/** Campos que o paciente nunca vê nos atendimentos. */
export const PRIVATE_ENCOUNTER_KEYS = ['notaPrivada'];

/** Resumo clínico em destaque (cabeçalho do prontuário). */
export function clinicalHighlights(a: FormValue) {
  const g = (k: string) => (a[k] && !Array.isArray(a[k]) ? (a[k] as Record<string, unknown>) : {});
  const list = (k: string) => (Array.isArray(a[k]) ? (a[k] as Record<string, unknown>[]) : []);
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  const al = g('alergias');
  const alergias = al.nega ? [] : [...arr(al.medicamentos), ...arr(al.alimentos), ...arr(al.outras)];
  return {
    alergias,
    negaAlergias: !!al.nega,
    riscos: arr(g('riscos').itens),
    comorbidades: arr(g('comorbidades').itens),
    medicacoesEmUso: list('medicacoes').filter((m) => m.status === 'Em uso' || !m.status).map((m) => [m.nome, m.dose].filter(Boolean).join(' ')),
    tipoSanguineo: '',
  };
}
