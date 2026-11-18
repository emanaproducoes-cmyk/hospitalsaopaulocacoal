# Ambiente seguro HBSP · Área do paciente e Área do médico

Este documento descreve como o ambiente protege os dados, o que já está pronto e o que falta antes de usar **dados reais**.

> **Situação atual: homologação com dados fictícios.** Sem o Supabase configurado, o sistema roda em *modo demonstração*:
> - os dados ficam só na memória do servidor;
> - os códigos de acesso aparecem numa caixa de testes na tela de login;
> - tudo é apagado quando o servidor reinicia.
>
> Nunca digite dados reais nesse modo.

## 1. Acesso

| Camada | Como funciona |
|---|---|
| Senha | Mínimo de 10 caracteres, com letras e números, sem sequências óbvias. É guardada com **scrypt** (N=32768, sal único). O login não revela se o e-mail existe e tem o mesmo tempo de resposta nos dois casos. |
| 2ª etapa obrigatória | Em **todo** login, inclusive com Google, o usuário digita um código de 6 dígitos enviado ao e-mail. O código vale 10 minutos, é de uso único e permite 5 tentativas. O banco guarda só o HMAC do código. |
| Confirmação de e-mail | Toda conta nova só é ativada depois do código enviado ao e-mail. |
| Google | OAuth 2.0 + OpenID Connect com `state`, `nonce` e PKCE. A assinatura RS256 do token é verificada com as chaves públicas do Google. Depois disso, ainda vale a 2ª etapa por e-mail. |
| Médicos | Só a administração cadastra, com CRM e UF. O médico recebe um convite de 72 h para criar a senha. |
| Sessão | Token de 256 bits no cookie `__Host-` (HttpOnly, Secure, SameSite=Strict); o banco guarda só o HMAC. O token é trocado após a 2ª etapa e fica preso ao navegador que o criou: cookie copiado para outro navegador não funciona e gera alerta. |
| Expiração da sessão | Por inatividade: 30 min (paciente), 20 min (médico) e 15 min (admin). Também há tempo máximo de sessão. A tela avisa 90 segundos antes de encerrar. |
| Bloqueio | 5 senhas erradas bloqueiam a conta por 15 min, avisam o titular por e-mail e geram alerta à administração. |
| Limites por origem | Excesso de tentativas, de requisições, de buscas ou de aberturas de prontuário gera bloqueio temporário e alerta. |
| CSRF | Toda gravação exige origem do próprio site; tentativa de outra origem é bloqueada e registrada. |

## 2. Dados

- **Criptografia por campo (AES-256-GCM).**
  - O que é criptografado: cadastro completo, anamnese, cada atendimento, versões anteriores da anamnese, e-mail e nome dos arquivos.
  - A chave fica fora do banco, em variável de ambiente, e tem versão: dá para trocá-la sem perder dados (`HBSP_DATA_KEYS` + `HBSP_ACTIVE_KEY`).
  - O GCM detecta qualquer alteração no dado gravado.
- **Índices cegos (HMAC-SHA256).** Permitem achar o paciente por CPF, e-mail ou nome completo sem guardar esses dados em claro.
- **Arquivos.**
  - São criptografados antes de chegar ao armazenamento, num bucket privado.
  - O servidor confere se o conteúdo real corresponde ao tipo declarado (PDF, JPG, PNG, WEBP), para barrar arquivo disfarçado, e guarda o SHA-256 de cada arquivo.
  - A integridade é verificada a cada abertura; o arquivo é entregue com cabeçalhos que impedem execução.
- **Foto de perfil.** Reduzida no navegador, criptografada como os arquivos e servida só ao próprio usuário. O médico vê a foto do paciente apenas com o prontuário aberto (com motivo) nas últimas 12 horas.
- **Banco.**
  - RLS ligado em todas as tabelas, sem nenhuma política: a chave pública do Supabase não lê nada.
  - Só o servidor, com a chave de serviço, acessa.
- **Auditoria imutável.**
  - Registra login, busca, abertura de prontuário (com motivo), alterações, arquivos e permissões.
  - Cada registro carrega o hash do anterior. O banco recusa UPDATE e DELETE. O painel admin verifica a cadeia inteira.
- **Minimização.**
  - O CRM recebe só cadastro e contato (número do paciente, nome, e-mail, celular, cidade, convênio), nunca dados clínicos.
  - E-mails só avisam e levam ao ambiente seguro: não carregam resultado de exame.
  - IPs ficam guardados só como identificador anônimo.

## 3. Regras de acesso

| Quem | Vê |
|---|---|
| Paciente | Os próprios dados, anamnese, atendimentos (sem as notas privadas da equipe), exames liberados, documentos que enviou, pedidos de permissão e **quem acessou o seu prontuário**. |
| Médico | Cadastra pacientes novos: o paciente recebe número e convite por e-mail (7 dias) para criar a senha. Edita dados pessoais, anamnese, atendimentos, vê evolução (sinais vitais, prescrições, CID) e quem acessou o prontuário. Busca por número (HB0001SP), CPF, e-mail ou nome completo. Não há lista aberta de pacientes. Para abrir um prontuário informa o **motivo**, e o acesso fica visível ao paciente. Edita a anamnese, registra atendimentos e anexa e libera exames. |
| Médico × documentos do paciente | Só com **autorização do paciente**. O médico pede, o paciente recebe e-mail, entra no ambiente seguro e autoriza por 30 dias ou 1 ano, nega ou revoga quando quiser. |
| Administração | Cadastra médicos, vê eventos de segurança e o estado da trilha de auditoria. **Não** vê prontuários. |

## 4. Alertas automáticos

Eventos **altos ou críticos** geram e-mail para `SECURITY_ALERT_EMAIL`:
- conta bloqueada;
- força bruta no código de verificação;
- excesso de tentativas de uma origem;
- cookie usado em outro navegador;
- arquivo disfarçado;
- tentativa de abrir arquivo sem permissão;
- busca ou acesso em massa a prontuários;
- falha de integridade de arquivo.

Todos os eventos ficam no painel da administração.

## 5. Para colocar em produção (antes de qualquer dado real)

1. **Supabase**:
   - criar o projeto na região **São Paulo**;
   - rodar `docs/secure/schema.sql` no SQL Editor;
   - ativar backups diários e PITR.
2. **Chaves de criptografia**: gerar 3 chaves com `openssl rand -base64 32` e configurar na Vercel `HBSP_DATA_KEYS=k1:...`, `HBSP_ACTIVE_KEY=k1`, `HBSP_INDEX_KEY`, `HBSP_SESSION_PEPPER`.
   - Guardar cópia **offline** em cofre (sem a chave, os dados não podem ser lidos).
   - Nunca trocar `HBSP_INDEX_KEY` depois de começar: as buscas param de funcionar.
3. **E-mail**: Resend com domínio próprio verificado (SPF, DKIM e DMARC) e `MAIL_FROM`.
4. **Google**: criar o cliente OAuth com o endereço de retorno `https://<domínio>/api/secure/auth/google/callback`.
5. **Pessoas**: `HBSP_ADMIN_EMAIL` recebe o convite do primeiro administrador; `SECURITY_ALERT_EMAIL` recebe os alertas.
6. **Governança** (fora do código):
   - RIPD (relatório de impacto) e aval do DPO;
   - termo de uso e política de privacidade revisados pelo jurídico;
   - **teste de invasão (pentest) independente**;
   - plano de resposta a incidentes (ANPD: comunicação em até 3 dias úteis).
7. **Prontuário com valor legal**:
   - Para substituir o papel, a CFM exige sistema certificado (**SBIS/CFM, NGS2**) e assinatura digital **ICP-Brasil** dos registros.
   - Até lá, este ambiente funciona como **registro clínico de apoio e portal do paciente**.

## 6. Limites conhecidos desta versão

- Arquivos de até 4 MB, por causa do limite de requisição da Vercel. Exames maiores pedem envio direto ao armazenamento, previsto para a próxima etapa.
- A 2ª etapa é só por e-mail. O código por WhatsApp entra quando houver conta oficial do WhatsApp Business, e o app autenticador (TOTP) pode ser adicionado para médicos.
- Os limites de tentativas ficam na memória de cada instância do servidor. Para tráfego alto, mover para um armazenamento compartilhado (Upstash/Redis).
- No modo demonstração na Vercel, várias instâncias podem não compartilhar a memória. Para homologar com estabilidade, configure o Supabase **mesmo com dados fictícios**.

## 7. Nota legal exibida no ambiente

O rodapé das telas de acesso e das áreas do paciente, do médico e da administração informa:
- a proteção dos dados pela LGPD (Lei 13.709/2018, arts. 11 e 46), pelo sigilo profissional e pelas normas do CFM;
- o crime de invasão de dispositivo informático (art. 154-A do Código Penal, Lei 12.737/2012 com a redação da Lei 14.155/2021);
- o crime de violação de segredo profissional (art. 154 do Código Penal);
- o registro das tentativas de acesso indevido.

O texto fica em `components/secure/SecureUI.tsx` (`LEGAL_TEXT`). Ele deve ser revisado pelo jurídico do hospital.
