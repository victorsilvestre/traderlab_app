# Autenticação do usuário — Plano técnico

## Status

Plano técnico aprovado para implementação após a solicitação explícita do
usuário para implementar o fluxo de autenticação e suas integrações.

## Decisão técnica aprovada

- Reutilizar o projeto Supabase já existente.
- Usar Supabase Auth para identidade, credenciais, confirmação de e-mail e
  recuperação de senha.
- Usar Prisma na API para os dados próprios do TraderLab no PostgreSQL do
  projeto Supabase, com schema e migrações versionados no repositório.
- Inventariar o banco antes da limpeza. O usuário autorizou descartar os dados
  antigos do produto e confirmou que o único usuário Auth é um login de teste.
  Preservar os serviços e schemas gerenciados pelo Supabase.
- Fazer as consultas de negócio pela API, que valida autenticação, perfil e
  autorização. O helper do projeto ativa RLS por padrão; os clientes públicos
  não recebem políticas de acesso às tabelas de produto.
- Persistir em `public.UserProfile` o UUID igual ao ID de Supabase Auth, nome,
  telefone e papel. E-mail e senha permanecem somente no Supabase Auth; o papel
  `student` é atribuído exclusivamente no servidor.
- Usar Prisma ORM 7 com `@prisma/adapter-pg`. `DIRECT_URL` é usada para
  migrações e `DATABASE_URL` para conexões da API.
- Usar sessão SSR do Supabase em cookies na aplicação web. A API recebe bearer
  token em requests autenticados, valida-o com Supabase Auth e consulta o perfil
  no Prisma. A API não confia em IDs ou papéis fornecidos pelo navegador.
- Para links de confirmação e recuperação solicitados pela API, configurar o
  cliente Supabase servidor para fluxo implícito e redirecionar para o callback
  da web. O callback lê o token do fragmento no navegador, persiste a sessão em
  cookie via `@supabase/ssr` e encaminha para a página apropriada.
- O logout pertence ao módulo `authentication`: um componente cliente chama
  `supabase.auth.signOut({ scope: 'local' })`, limpa a sessão/cookies deste
  navegador e redireciona para `/sign-in`. Não é necessária uma rota de API,
  pois a sessão é mantida pelo Supabase SSR no navegador.

## Inventário pré-limpeza somente de leitura do Supabase

- O schema `public` contém 15 tabelas: `CostRule`, `Execution`,
  `FieldDefinition`, `Identity`, `ImportBatch`, `ImportFile`, `ImportJob`,
  `Operation`, `OperationFieldValue`, `OperationTag`, `Tag`, `TagCategory`,
  `TradingAccount`, `User` e `_prisma_migrations`.
- Os nomes indicam um schema legado de trading, que não será reutilizado no
  TraderLab educacional. Nenhuma linha de dados foi consultada.
- Todas as 15 tabelas têm RLS ativado; não foram encontradas políticas RLS no
  schema `public`.
- Os schemas gerenciados `auth`, `storage`, `realtime` e `vault` também existem.
  Eles não fazem parte da limpeza das tabelas antigas do produto.
- Foi contado um registro em Supabase Auth; o usuário confirmou que é um login
  de teste e autorizou sua exclusão. Nenhum e-mail foi consultado.
- O bucket privado `traderlab-private` contém quatro objetos. Nenhum conteúdo
  dos arquivos foi lido.
- O schema `public` tem quatro enums legados e a função `rls_auto_enable()`,
  vinculada ao event trigger `ensure_rls`. Os demais event triggers observados
  pertencem ao schema de extensões e devem ser preservados.

## Estado da preparação para o TraderLab novo

| Preservado                                                                                                                  | Removido ou criado                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| O projeto Supabase e o banco PostgreSQL existentes.                                                                         | As 15 tabelas e dados legados de trading em `public`, o histórico Prisma antigo e os quatro enums legados foram removidos. |
| Os schemas gerenciados `auth`, `storage`, `realtime` e `vault`; não apagar esses schemas.                                   | O único usuário Auth de teste, o bucket privado antigo e seus quatro arquivos foram removidos.                             |
| Os serviços Supabase Auth e Storage para os novos cadastros e materiais de curso.                                           | A migração Prisma criou `public.user_profiles`, `public.user_role` e um novo `_prisma_migrations`.                         |
| Os event triggers do schema `extensions` e o helper customizado `ensure_rls`/`rls_auto_enable()`, que ativa RLS por padrão. | O schema próprio do produto passa a ser criado por migrações Prisma versionadas.                                           |

Não excluir o projeto Supabase, schemas de serviço, configurações da plataforma
ou objetos de extensões. O usuário autorizou remover os dados antigos do
produto, o login de teste e os arquivos do bucket legado. A operação foi
executada pelas APIs administrativas de Auth/Storage e por SQL transacional,
sem apagar linhas diretamente das tabelas internas gerenciadas. O event trigger
`ensure_rls` e a função `rls_auto_enable()` permanecem ativos para habilitar RLS
por padrão nas novas tabelas públicas.

### Estado da execução da limpeza

- Concluída em 2 de outubro de 2026, após validar novamente o escopo no projeto.
- Excluído o único usuário Auth de teste pela API administrativa do Supabase.
- Excluídos os quatro objetos e o bucket privado legado `traderlab-private`
  pela API do Storage.
- Removidas as 15 tabelas legadas de `public` e os quatro enums por uma
  transação PostgreSQL. A transação não usou `CASCADE`.
- Confirmado após a operação que não restaram tabelas nem enums legados em
  `public`; o helper de RLS e os schemas/serviços gerenciados foram preservados.

### Implementação do fluxo e schema inicial

- Prisma ORM 7 foi configurado com `@prisma/adapter-pg`; migrações usam
  `DIRECT_URL` e a API usa `DATABASE_URL`.
- Aplicada a migração `20261002182000_create_user_profiles`, criando
  `public.user_profiles`, o enum `public.user_role` e `_prisma_migrations`.
- A tabela de perfil guarda o UUID Auth, nome, telefone e papel. E-mail e senha
  continuam no Supabase Auth. O cadastro público atribui `STUDENT` no servidor.
- RLS está ativo em `user_profiles` e `_prisma_migrations` devido ao helper
  preservado. As operações de produto passam pela API com credenciais de servidor.
- A web usa `@supabase/ssr` e cookies de sessão. A API valida bearer tokens com
  Supabase Auth antes de consultar o perfil ou concluir a redefinição de senha.
- Cadastro, login, logout, recuperação, reenvio de confirmação, redefinição,
  callback de confirmação e endpoint de sessão foram implementados. O usuário
  não pode escolher papel no cadastro.
- As suítes automatizadas passaram com 14 testes da API e 7 testes da web;
  typecheck, lint e builds de produção também passaram.
- O Next.js precisa de acesso de rede ao Supabase para validar os cookies de
  sessão no proxy e nos Server Components. Sem essa conectividade, o login pode
  retornar sucesso na API enquanto a página inicial trata a sessão como ausente.
- O painel Supabase precisa permitir `http://localhost:3000/auth/callback` em
  Authentication → URL Configuration → Redirect URLs para os links locais de
  confirmação e recuperação funcionarem.

### Correção do estabelecimento e leitura de sessão (6 de outubro de 2026)

O login aceito pela API ainda podia falhar: `supabase.auth.setSession()` fazia uma chamada adicional a `/user` do Supabase e falhava em determinadas condições de rede. A primeira correção tentou executar a operação numa Server Action, mas manteve a chamada externa e ainda passou tokens como argumentos da action; foi substituída. O fluxo atual envia e-mail e senha a uma rota interna da web, que chama a API e persiste os tokens devolvidos diretamente no armazenamento de cookies compatível com `@supabase/ssr`, sem uma chamada extra ao Supabase e sem expor os tokens na resposta ou nos argumentos de uma Server Action. A página inicial e o redirecionamento das telas de autenticação consultam `/authentication/me`, que continua sendo a autoridade para validar sessão e papel. O proxy só executa `getClaims()` quando há cookies Supabase, evitando a chamada de rede em visitas anônimas. A compatibilidade do cookie e o ciclo de renovação ainda precisam de validação manual após reiniciar a web.

## Aplicações e módulos afetados

- `apps/web`: telas e interação dos fluxos públicos de autenticação.
- `apps/api`: módulo `authentication` para cadastro, login, recuperação e
  validação da sessão.
- `apps/api`: módulo `access` e políticas de papel serão implementados junto
  com as primeiras rotas protegidas de produto; não há endpoints de curso ou
  matrícula neste fluxo de autenticação.
- `apps/api`: módulo `user` somente se for necessário persistir ou consultar
  dados de perfil que não sejam responsabilidade do provedor de autenticação.
- `apps/api`: Prisma como cliente de dados do PostgreSQL para tabelas próprias
  da aplicação, isolado em `infrastructure` nos módulos correspondentes.
- `infrastructure`: nenhuma alteração prevista; integrações específicas ficam
  no módulo de autenticação.

## Abordagem

### API

- Criar o módulo `apps/api/src/modules/authentication/` com as camadas
  necessárias entre `application`, `infrastructure` e `presentation`.
- Definir contratos internos para operações de cadastro, confirmação de e-mail,
  login, solicitação e conclusão da recuperação e consulta da sessão.
- Integrar Supabase Auth para cadastro, confirmação de e-mail, login e
  recuperação de senha por meio de um adaptador em `infrastructure`; não expor
  objetos do SDK aos casos de uso ou contratos compartilhados.
- Usar Prisma na API para persistir e consultar dados próprios do TraderLab no
  PostgreSQL do projeto Supabase. Manter o schema e as migrações versionados no
  repositório; não mapear nem alterar tabelas internas gerenciadas pelo Supabase.
- Manter consultas Prisma atrás da API. Validar autenticação, perfil, propriedade
  e autorização na API; tratar RLS como defesa adicional apenas quando o
  contexto de usuário e as políticas estiverem configurados e verificados.
- Validar sessão em rotas protegidas e resolver o perfil por fonte confiável do
  servidor. Nunca aceitar perfil enviado pelo formulário como autoridade.
- Criar `UserProfile` após cadastro bem-sucedido, usando o UUID e metadados
  retornados pelo próprio Supabase Auth; não aceitar papel no payload público.
- Usar o Supabase Secret Key apenas no servidor para atualizar a senha após
  validar o token de recuperação; aceitar também o nome legado
  `SUPABASE_SERVICE_ROLE_KEY` como fallback local durante a migração de chave.
- Responder com DTOs próprios e erros que não revelem se um e-mail está
  cadastrado.
- Manter autorização de recurso no API, junto aos módulos que protegem os
  recursos, usando o módulo `access` para regras transversais.

### Aplicação web

- Criar rotas públicas no App Router para cadastro, login, solicitação e
  redefinição de senha, além do retorno de confirmação de e-mail.
- Usar Server Components por padrão e componentes cliente apenas para os
  formulários interativos.
- Encaminhar qualquer usuário autenticado à página inicial, conforme a
  especificação; manter a autorização por perfil nas áreas e ações protegidas.
- Não armazenar chaves privadas nem depender apenas de verificações de rota no
  navegador para proteger recursos.
- Configurar `lang="pt-BR"` para a interface em português.
- Usar `@supabase/ssr` para sessão em cookies e formulários cliente para ações
  interativas. A web nunca recebe a chave secreta do Supabase.

## Segurança e privacidade

- Usar Supabase Auth para credenciais, confirmação de e-mail e fluxo seguro de
  recuperação, sem criar armazenamento próprio de senha.
- Manter `SUPABASE_SECRET_KEY` (ou a variável local legada
  `SUPABASE_SERVICE_ROLE_KEY`) restrita ao servidor e fora do bundle web.
- Validar entradas no limite da API e renderizar erros sem expor detalhes
  internos do provedor.
- Retornar confirmação genérica na solicitação de recuperação para reduzir
  enumeração de contas.
- Não permitir seleção pública de perfis privilegiados.
- Exigir confirmação de e-mail antes de estabelecer acesso autenticado às áreas
  protegidas.
- Validar senha com pelo menos 6 caracteres nos limites apropriados, mantendo
  requisitos adicionais de complexidade fora do escopo atual.
- Comparar senha e confirmação no cadastro e na redefinição antes de enviar os
  dados; não persistir nem enviar a confirmação como credencial separada.
- Definir a estratégia de sessão, cookies e proteção contra CSRF com base na
  integração disponível e na topologia web/API antes de implementá-la.
- Não declarar rotas protegidas como seguras até que a API valide a sessão e as
  permissões independentemente do frontend.

## Dados e integrações

- Provedor de identidade: Supabase Auth, conforme decisão da fundação do
  projeto.
- Configuração da API: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (chave publicável),
  `SUPABASE_SECRET_KEY` ou a variável legada já preenchida,
  `DATABASE_URL`, `DIRECT_URL`, `WEB_APP_URL` e `API_PORT`.
- Configuração pública da web: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_API_URL`.
- Cadastro público sempre cria perfil de aluno em `UserProfile`; perfis
  privilegiados nunca vêm do formulário público.
- Envio de e-mail: usar o mecanismo configurado para recuperação/confirmacão no
  Supabase; não adicionar integração Brevo sem tarefa e decisão específicas.

## Validação

- Testar validação de entradas, respostas genéricas de recuperação e resolução
  de perfil nos limites da API.
- Testar cadastro, login e recuperação em nível de integração com dependências
  substituíveis ou ambiente de teste, sem usar contas reais.
- Validar redirecionamento por perfil e estados inicial, envio, sucesso e erro.
- Executar typecheck, lint e build dos aplicativos afetados.
- Revisar que segredos não são entregues ao cliente e que rotas protegidas
  verificam a sessão no servidor.

## Riscos e decisões técnicas

- O cadastro, o recebimento do e-mail de confirmação e o login foram exercitados
  com a conta real; o teste inicial encontrou falhas no callback e na validação
  de sessão pelo Next.js, ambas corrigidas e cobertas por testes automatizados.
- A API pública de Auth confirmou e-mail habilitado, cadastro aberto e
  confirmação obrigatória (`mailer_autoconfirm=false`). Um e-mail real chegou ao
  callback local, confirmando que o redirecionamento está funcional.
- O callback agora persiste a sessão do fragmento implícito e também troca um
  código PKCE; testes cobrem ambos. Ainda falta repetir a confirmação com um novo
  link após a correção e validar recuperação/redefinição de senha com e-mail real.
- Os templates e as configurações privadas do SMTP não são disponibilizados
  pela API pública. É necessário inspecioná-los no painel Supabase.
- O login real retornou sucesso pela API, mas o processo Next.js sem rede não
  conseguia validar os cookies. Com a rede liberada, o log confirmou o
  redirecionamento de uma tela de autenticação para a raiz como usuário autenticado.
- Prisma acessa o PostgreSQL com credenciais de servidor. As consultas da
  aplicação continuam atrás da API, que valida sessão e carrega o perfil.
- O gatilho existente ativa RLS, mas não cria políticas. Cliente web e chaves
  públicas não recebem acesso direto às tabelas de `public`.
- Nome e telefone são mantidos no perfil de aplicação e nos metadados iniciais
  de Auth usados para construir esse perfil; não são credenciais.
- Os endereços de retorno, confirmação de e-mail e redefinição dependem da
  configuração do Supabase e dos domínios de desenvolvimento.
- A criação/atribuição segura de perfis privilegiados deve ser resolvida no
  servidor e não faz parte do cadastro público. Regras de autorização por
  recurso ainda dependem da implementação dos endpoints de produto.

## Configuração necessária (sem valores secretos)

- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_ANON_KEY` ou chave publicável: chave de acesso público do Supabase.
- `DATABASE_URL`: conexão PostgreSQL usada pelo Prisma em runtime.
- `DIRECT_URL`: conexão direta para migrações Prisma, quando necessária.
- `NEXT_PUBLIC_API_URL` e `API_PORT`: endereço e porta da API em desenvolvimento.
- `SUPABASE_SECRET_KEY` (ou a variável legada `SUPABASE_SERVICE_ROLE_KEY`):
  segredo exclusivo do servidor; não registrar em documentação nem expor ao
  frontend.

Guardar valores reais em arquivo local ignorado pelo Git ou em um gerenciador de segredos. Não inserir senhas, chaves privadas ou URLs de conexão completas em arquivos versionados.

### Evolução: renovação e recuperação de sessão

- O Supabase Auth continua sendo a autoridade para emissão, duração e renovação de access/refresh tokens. A aplicação persiste os tokens devolvidos e usa @supabase/ssr no proxy para atualizar cookies. Não alterar JWT expirations manipulando tokens no cliente.
- A validação de identidade na API distingue token inválido (401) de indisponibilidade do Auth (503); detalhes do provedor ficam nos logs, não na resposta pública.
- A leitura do perfil e as consultas de conteúdo têm limites de espera. Em timeout/5xx, renderizar erro recuperável e manter cookies; somente 401 confirmado encaminha ao login.
- A rota de login aceita somente destinos internos permitidos e preserva a aula/curso através do fluxo. Validar o destino tanto no servidor quanto no redirecionamento do cliente.
- O layout persistente mostra um indicador compacto para navegações internas demoradas; não adicionar fallback loading.tsx de tela cheia nas rotas de curso.
- Configurações de expiração do JWT e limites gerais de sessão pertencem ao painel/configuração do Supabase. Política própria de duração da aplicação exigiria controle de sessão server-side separado e está fora desta alteração.
