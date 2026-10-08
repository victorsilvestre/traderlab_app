# Gestão de notificações no admin — Plano técnico

## Fronteira e estado atual

A funcionalidade pertence ao módulo existente `apps/api/src/modules/notification`.
Não criar um novo módulo de backend. O schema Prisma já contém `Notification`,
`NotificationRecipient`, `NotificationAudience` e `PublicationStatus`. Os
campos disponíveis cobrem título, descrição, link, público, curso, estado,
autoria, criação/atualização, data de publicação, destinatário, entrega e
leitura. A API atual implementa apenas consulta e atualização de leitura para o
aluno; ainda não há endpoints administrativos para histórico ou criação.

O admin não acessa Prisma diretamente. Contratos compartilhados ficam em
`packages/contracts`; regras, consultas e persistência ficam no módulo de
notificação da API.

## Aplicações e componentes

### `apps/admin`

- Criar rotas `/notifications` (histórico), `/notifications/[notificationId]`
  (detalhes) e `/notifications/new` (cadastro/envio) no grupo `(workspace)`.
- Exibir “Notificações” somente para administradores na
  `WorkspaceNavigation`; proteger também todas as rotas e chamadas do servidor.
- Compor telas separadas para lista paginada, detalhes com lista de
  destinatários e formulário. Usar Server Components para carregar as telas e
  Client Components para paginação, confirmação e edição interativa do
  formulário.
- Colocar componentes em `components/ui/` e `components/forms/`; manter chamadas
  à API em `apps/admin/lib/notifications/`.
- Usar CSS Modules, largura responsiva e rolagem vertical do documento. Não
  criar overflow horizontal nem rolagem vertical interna para a tabela.

### `packages/contracts`

Adicionar DTOs de gestão separados dos DTOs da experiência do aluno. Prever:

- Filtros/paginação do histórico e dados de cada item, incluindo público,
  curso, `publishedAt` e contagem de destinatários.
- Consulta paginada dos destinatários com nome, e-mail, data individual do
  envio (`deliveredAt`) e, se mantido na interface, `readAt`.
- Entrada de criação com título, descrição, link opcional, público e curso
  opcional.
- Resultado do envio com identificador, data e quantidade efetivamente
  registrada.

Não retornar linhas Prisma, identificadores de autenticação desnecessários ou
dados pessoais sem propósito. Não alterar o DTO do aluno sem necessidade.

## API e arquitetura

Adicionar rotas administrativas sob `/admin/notifications`, protegidas por
identidade verificada e autorização no servidor:

- `GET /admin/notifications`: listar publicados com ordenação decrescente por
  `publishedAt`, paginação e filtros mínimos aprovados.
- `GET /admin/notifications/:notificationId`: consultar metadados da
  notificação e seus destinatários paginados.
- `POST /admin/notifications`: validar, resolver o público elegível e criar a
  notificação publicada junto aos registros `NotificationRecipient`.
- `GET /admin/notifications/courses`: obter cursos cadastrados que podem ser
  usados como segmentação, sem expor listas de alunos.

O caso de uso de envio valida título, descrição, link, público, existência e
permissão do curso. A criação da notificação e dos destinatários ocorre em uma
transação. `publishedAt` é a data do disparo; cada `deliveredAt` registra a
inclusão/entrega ao destinatário. `status` fica `PUBLISHED`. A API calcula os
destinatários a partir do banco no instante da operação e não aceita uma lista
de `userId` enviada pelo navegador.

O repositório seleciona destinatários por cadastro e matrícula, sem restringir
por papel. Público geral seleciona qualquer perfil cuja identidade Supabase
exista, sem filtrar confirmação de e-mail ou bloqueio. Público curso seleciona
qualquer usuário com identidade Supabase existente e matrícula `ACTIVE` no
curso, também sem filtrar confirmação de e-mail ou bloqueio.
O schema não mantém status da identidade nem e-mail no perfil; estender o
adaptador `AuthenticationProvider` com enumeração administrativa paginada dos
usuários do Supabase Auth. Cruzar os resultados com os IDs de perfil candidatos
para confirmar identidade existente e resolver o endereço de e-mail. Não
consultar Supabase Auth por aluno individualmente em sequência sem limite; usar
a paginação fornecida pelo serviço e não expor dados de autenticação além do DTO
administrativo autorizado.

## Autorização

Somente o papel `administrator` tem acesso a listagem, detalhes e envio. A API
deve rejeitar `mentor`, `student`, sessão inválida e campos de escopo enviados
para tentar elevar acesso. Não é necessário inventar uma relação mentor-curso
nem usar `Course.createdById` como autorização.

## Destinatários e consistência

- Público geral: selecionar todos os perfis com identidade Supabase existente,
  independentemente do papel, da confirmação de e-mail ou do bloqueio.
- Público de curso: selecionar todos os usuários com identidade Supabase
  existente e matrícula `ACTIVE` no curso, independentemente do papel e também
  sem filtrar confirmação ou bloqueio; deduplicar por usuário.
- Resolver, pela listagem paginada administrativa do Supabase, a existência e
  o endereço dos usuários candidatos. Tratar falha da fonte de identidade
  como falha do envio, sem criar um público parcial silenciosamente.
- Revalidar cadastro, identidade e matrícula na API sem aplicar filtro por
  papel; o cliente nunca escolhe nem
  envia diretamente os IDs dos destinatários.
- Gravar notificação e todos os destinatários atomicamente. Se não houver
  destinatários, rejeitar com erro de domínio claro e não publicar registro
  vazio.
- Preservar comportamento da plataforma do aluno: somente notificações
  publicadas com vínculo em `NotificationRecipient` aparecem para a pessoa.
- Evitar envio repetido por double-click através de submissão bloqueada no
  cliente; avaliar idempotência do servidor se houver retry automático.

## Validação prevista

Consultar `test-plan.md` para cenários funcionais, de autorização, consistência,
privacidade e acessibilidade. Antes da entrega: typecheck, lint, testes
pertinentes do módulo de notificação e contratos, build dos pacotes afetados,
check de codificação e validação visual em larguras ampla e estreita.

## Migração e serviços externos

Adicionar `recipient_email` nullable em `notification_recipients` para preservar
o e-mail da identidade no momento do disparo. Registros antigos permanecem
válidos; para eles, a tela tenta resolver o e-mail atual no Supabase Auth e
mostra “E-mail indisponível” quando a identidade já não existir. Não adicionar
dependência nem integração de e-mail como canal nesta unidade.
