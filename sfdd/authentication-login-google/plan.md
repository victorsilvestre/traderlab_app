# Login com Google — Plano técnico

## Aplicações e módulos

- `apps/web`: ativar a opção Google nas telas públicas e reaproveitar o cliente
  Supabase de navegador, callback, cookies SSR, mensagens e rotas existentes.
- `apps/api`, módulo `authentication`: validar a identidade/sessão, registrar o
  primeiro login e garantir o perfil vinculado ao UUID Auth.
- `apps/api`, módulo `user`: completar telefone e persistir avatar no bucket
  privado de perfil existente.
- `packages/contracts`: alterar contratos somente se a conclusão de perfil ou
  a indicação de perfil incompleto exigir DTO novo.
- `apps/admin`: sem mudança; a autenticação social está fora do escopo.
- Banco: preferir o schema existente (`user_profiles.phone`, `avatar_path` e
  `id`) e evitar migration, a menos que a implementação revele uma necessidade
  concreta aprovada.

## Fluxo técnico

1. O botão da web chama `supabase.auth.signInWithOAuth({ provider: 'google' })`
   com redirect para o callback da aplicação e `next` validado como caminho
   interno.
2. Solicitar escopos `openid email profile`. Não solicitar acesso a telefone,
   Gmail, Drive ou outras APIs.
3. O Supabase Auth trata a troca com Google, vinculação automática de e-mails
   confirmados e emissão de sessão. A aplicação não compara e-mails para fundir
   perfis.
4. O callback PKCE existente (`completeAuthCallback`) troca o código por sessão.
   Antes de voltar à home, chamar uma operação única de conclusão OAuth na API
   com o token da sessão. Essa operação valida a identidade, garante o perfil,
   registra o login bem-sucedido uma vez e retorna o estado de telefone
   incompleto/completo. Não registrar login em `/authentication/me`, que pode
   ser consultado repetidamente durante a navegação.
5. No provisionamento, persistir nome e e-mail validados. Se houver foto, usar
   uma porta de importação de avatar no servidor para copiar a imagem ao bucket
   privado existente e persistir `avatarPath`. A porta deve falhar de forma
   tolerante: foto inválida/indisponível não falha a autenticação.
6. O importador de foto aceita apenas HTTPS e hosts Google de imagem permitidos,
   aplica timeout e limite de bytes, valida MIME real JPEG/PNG/WebP e gera nome
   de objeto aleatório sob o UUID do usuário. Não aceitar URL de imagem enviada
   pelo navegador como fonte confiável nem fazer fetch arbitrário (SSRF).
7. Se `phone` estiver vazio, redirecionar diretamente para a página existente
   `/profile?complete=1`. A página abre um modal obrigatório “Complete seus
   dados”, com o telefone como campo pendente e dados Google preenchidos para
   conferência. Salvar pelo endpoint autenticado `PATCH /users/me/profile`.
8. Após salvar com sucesso, fechar o modal e navegar para `/home`. Em caso de
   erro, permanecer em `/profile`, manter os dados digitados e apresentar uma
   ação de nova tentativa. Usuários com perfil completo seguem ao destino
   interno seguro ou a `/home` sem ver o modal.
9. Restringir páginas e operações autenticadas enquanto o telefone estiver
   vazio, com retorno explícito de perfil incompleto para `/profile`; permitir
   a conclusão e logout. O modal obrigatório não pode ser fechado enquanto o
   telefone faltar. Evitar duplicar regras em componentes clientes.
10. Se o perfil já existir, não atualizar nome, telefone ou avatar do TraderLab
   com valores de metadados Google. A identidade vinculada serve para
   autenticação; os dados próprios do perfil são a fonte de verdade.
11. Para definir senha em contas criadas por Google, reaproveitar o fluxo de
   recuperação existente e confirmar seu comportamento real com Supabase Auth.

## Vinculação e segurança

- O Supabase Auth mantém os providers como identidades associadas ao mesmo
  usuário. O UUID Auth permanece o identificador usado pelo produto.
- A vinculação automática só pode ser aceita pelo Auth após verificação do
  endereço. Nunca implementar `find user where email = providerEmail` seguido
  de fusão ou transferência de matrícula na aplicação.
- Preservar os papéis já persistidos em `user_profiles`; perfil novo usa o
  padrão `STUDENT`. Google não participa da autorização de recursos.
- O login Google na web pode autenticar um gestor em `apps/web` se esse UUID já
  possuir papel de gestor, conforme o comportamento atual da plataforma. Isso
  não altera o login administrativo próprio em `apps/admin`.
- Restringir `next` aos destinos internos já permitidos pelo helper atual.
- Manter tokens apenas na sessão Supabase SSR; nunca expor client secret Google
  ou chave administrativa Supabase ao navegador.
- Não registrar tokens, códigos OAuth, client secrets ou URLs assinadas nos
  logs.

## Dados e avatar

- O modelo atual já contém `user_profiles.name`, `email`, `phone` e
  `avatar_path`; a API já emite URL assinada de avatar e a web já mostra
  iniciais como fallback.
- A criação de perfil deve aceitar telefone inicialmente vazio somente para
  permitir o passo obrigatório de conclusão do cadastro OAuth. A política de
  perfil incompleto deve ser validada também na fronteira da API.
- Adicionar à porta de armazenamento a operação mínima para importar bytes
  validados ao bucket existente, sem expor seu caminho ao navegador.
- O avatar importado é uma cópia privada inicial; mudanças posteriores no
  avatar Google não substituem a imagem escolhida no TraderLab.
- Falha de download/storage deve deixar `avatarPath` nulo e continuar a
  autenticação; informar de forma não bloqueante apenas se fizer sentido na
  interface.

## Configuração externa obrigatória antes de habilitar OAuth nos ambientes

### Google Cloud

1. No Google Cloud Console, selecionar/criar um projeto da empresa e configurar
   a tela de consentimento (nome, e-mail de suporte, domínios e política de
   privacidade conforme o ambiente).
2. Criar credencial OAuth 2.0 do tipo **Web application**.
3. Cadastrar origens autorizadas para os hosts web reais e locais usados no
   desenvolvimento/validação.
4. Cadastrar como URI de redirecionamento autorizada o callback do Supabase no
   formato `https://<project-ref>.supabase.co/auth/v1/callback` (usar o valor
   exato mostrado pelo projeto Supabase).
5. Guardar o Client ID e Client Secret para inserção no painel Supabase. O
   segredo não deve ser salvo em arquivos versionados nem enviado ao frontend.

### Supabase

1. Em **Authentication → Sign In / Providers → Google**, habilitar Google e
   preencher Client ID e Client Secret gerados no Google Cloud.
2. Em **Authentication → URL Configuration → Redirect URLs**, permitir os
   callbacks exatos da web, incluindo o host usado para validação e o domínio
   de produção, sem curingas amplos.
3. Conferir o Site URL do projeto e confirmar que o provider usa somente os
   escopos básicos. Não habilitar vinculação manual de identidades para este
   fluxo.
4. Salvar e validar primeiro em ambiente de desenvolvimento; depois repetir as
   origens/redirects de produção quando os domínios estiverem definidos.

O endereço local do callback Google é o callback do **projeto Supabase**, não
`/auth/callback` da aplicação. O Google retorna ao Supabase; o Supabase então
retorna ao callback da web autorizado.

## Validação

- Testes de unidade/API para provisionamento único, perfil existente,
  preservação de dados, telefone pendente e importação de avatar tolerante.
- Testes de integração para callback PKCE, destinos internos, sessão SSR,
  identidade duplicada e autorização por papel.
- Teste manual com conta existente confirmada, conta Google nova, telefone
  ausente, foto ausente/indisponível, cancelamento, provedor indisponível,
  logout e recuperação de senha.
- Confirmar no Supabase Auth que os dois providers apontam para o mesmo UUID e
  conferir que matrícula/progresso antigos continuam associados a esse UUID.
- Validar host de desenvolvimento e produção, consentimento e retorno sem
  exibir tokens ou segredos.

## Referências oficiais

- [Login com Google no Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Vinculação de identidades no Supabase](https://supabase.com/docs/guides/auth/auth-identity-linking)
- [OpenID Connect do Google e dados padrão](https://developers.google.com/identity/openid-connect/openid-connect)
- [Referência do UserInfo do Google](https://developers.google.com/identity/openid-connect/reference)
