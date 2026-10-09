# Login com Google — Especificação

## Status

Escopo aprovado para implementação. A integração de provedor depende da
configuração de credenciais no Google Cloud e no Supabase antes da validação
OAuth ponta a ponta.

## Perfil e objetivo

Visitantes e usuários existentes querem entrar na plataforma TraderLab usando
sua conta Google. O login social deve reutilizar o perfil e os dados já
existentes, permitir cadastro mais rápido e evitar contas duplicadas.

## Escopo

- Oferecer “Continuar com Google” no login e no cadastro da aplicação `apps/web`.
- Usar Supabase Auth como intermediário OAuth entre TraderLab e Google.
- Usar o callback e a sessão SSR já existentes na plataforma.
- Criar perfil de aluno para uma nova identidade autenticada, sem conceder
  papéis com privilégios.
- Usar nome, e-mail verificado e foto de perfil fornecidos pelo Google quando
  disponíveis.
- Direcionar à página de perfil após autenticação social somente quando o perfil
  ainda não tiver telefone e abrir um modal obrigatório para completar o dado.
- Preservar os dados editados no TraderLab em acessos posteriores.
- Manter o login por e-mail e senha e a recuperação de senha atuais.

Este fluxo pertence à plataforma em `apps/web`. O ambiente administrativo
continua usando sua própria tela de entrada e não recebe login social nesta
unidade.

## Identidade e prevenção de duplicidade

- O identificador canônico da pessoa continua sendo o UUID do usuário no
  Supabase Auth, usado como `user_profiles.id`.
- Quando um usuário existente com e-mail confirmado inicia OAuth e o Google
  comprova o mesmo endereço, o Supabase Auth vincula a identidade Google à
  identidade existente. O TraderLab não deve criar outro perfil nem tentar
  juntar usuários por comparação feita no frontend.
- Depois da vinculação, login Google e login por e-mail/senha chegam ao mesmo
  UUID e ao mesmo perfil, matrículas, progresso e notificações.
- Um endereço não confirmado, conflito de identidade ou falha de vinculação
  nunca deve provocar fusão manual nem concessão de acesso à conta encontrada
  apenas pelo texto do e-mail. Exibir uma orientação segura para entrar pela
  forma de acesso já cadastrada, confirmar o e-mail e tentar novamente.
- Uma identidade Google sem conta correspondente cria uma única identidade Auth
  e um perfil de aluno no primeiro acesso autenticado.
- Não confiar em papel, autorização ou dados de matrícula enviados pelo Google.
  O perfil e as permissões continuam vindo do banco e da API.

## Dados do Google e perfil TraderLab

- Solicitar somente os escopos básicos `openid`, `email` e `profile`.
- Usar nome e foto apenas como valores iniciais no primeiro provisionamento do
  perfil. Nome e avatar que já existam no TraderLab nunca são sobrescritos pelo
  Google em logins posteriores.
- A foto é opcional. Quando fornecida, importá-la para o bucket privado de
  avatares existente e persistir somente o caminho interno. Se estiver ausente,
  inválida ou indisponível, usar as iniciais do nome; a falha de imagem não
  impede o login.
- O escopo básico de login não fornece telefone. Não solicitar escopos de APIs
  adicionais do Google para tentar obter esse dado.
- Se o perfil não tiver telefone, após o callback abrir a página `/profile` com
  um modal obrigatório “Complete seus dados”. Mostrar nome, e-mail e avatar
  carregados do Google; pedir o telefone que falta e salvá-lo pelo endpoint
  autenticado do próprio perfil. Preservar o telefone existente quando já
  estiver preenchido.
- O modal não pode ser dispensado por clique fora, tecla Escape ou botão de
  fechar enquanto houver dados obrigatórios pendentes. Se a pessoa sair da
  página e voltar, a conclusão continua pendente.
- Ao confirmar “Salvar e ir para a home”, validar e persistir os dados. Em
  sucesso, fechar o modal e navegar para `/home`. Em erro, manter o modal e os
  valores preenchidos, mostrar a mensagem e permitir tentar novamente.
- Usuário com perfil completo não vê o modal e segue para `/home` ou para o
  destino interno seguro que iniciou o login.
- Até concluir o telefone, manter a pessoa na página de perfil. A API também
  deve impedir que uma identidade com perfil incompleto consuma operações
  destinadas a um perfil completo, permitindo apenas conclusão do perfil e
  saída.

## Comportamento dos fluxos

### Login ou cadastro com Google

1. A pessoa seleciona “Continuar com Google” em `/sign-in` ou `/sign-up`.
2. O navegador inicia OAuth pelo cliente Supabase público e redireciona para o
   Google; o TraderLab não recebe nem armazena a senha Google.
3. Após consentimento, o Supabase retorna ao callback permitido da web. O
   callback atual troca o código PKCE por uma sessão e trata cancelamento,
   erro ou link inválido com uma mensagem recuperável.
4. A API valida a sessão e garante o perfil correspondente ao UUID Auth. Uma
   conta existente vinculada mantém seu perfil; uma conta nova recebe o papel
   padrão de aluno.
5. Se faltar telefone, encaminhar diretamente a `/profile` e abrir o modal
   obrigatório “Complete seus dados”. Se o perfil estiver completo, encaminhar
   ao destino interno solicitado ou à home.
6. No modal, a pessoa confirma os dados e informa o telefone pendente. Ao salvar
   com sucesso, fechar o modal e redirecionar à home (`/home`). Falha mantém a
   pessoa no perfil com os dados preenchidos e uma mensagem para tentar de novo.
7. A aplicação atualiza a sessão SSR e carrega o perfil da API como no login
   atual.

### Login por e-mail e senha

- Continua disponível para todos os usuários que tenham senha configurada.
- Uma conta criada originalmente por Google pode definir uma senha usando a
  recuperação de senha existente. Depois disso, Google e e-mail/senha podem ser
  usados na mesma conta.
- Não criar identidade por e-mail/senha paralela quando a identidade Google já
  existir com o mesmo e-mail.

### Sessão e saída

- A sessão da plataforma segue armazenada nos cookies SSR já usados pela web.
- Logout remove a sessão local normalmente e não altera as identidades
  vinculadas no Supabase.
- Login Google não concede acesso a Gmail, Drive ou outros produtos Google.

## Estados e erros

- **Redirecionando:** informar que o acesso está sendo iniciado.
- **Google cancelado ou indisponível:** permitir tentar de novo ou usar e-mail e
  senha, sem limpar uma sessão existente por falha transitória.
- **Callback inválido/expirado:** apresentar orientação para iniciar o login
  novamente.
- **E-mail existente não vinculado:** orientar a entrar pela conta atual,
  confirmar o e-mail e tentar Google novamente; não criar ou fundir perfis à
  força.
- **Perfil sem telefone:** abrir `/profile` com o modal de conclusão; não
  permitir dismiss enquanto o dado obrigatório faltar.
- **Erro ao salvar:** manter modal e dados preenchidos, explicar o problema e
  permitir nova tentativa sem perder a sessão.
- **Foto indisponível:** exibir as iniciais sem erro bloqueante.
- **Falha na API ou no Supabase:** mensagem recuperável, sem expor tokens,
  segredos ou dados internos.

## Critérios de aceite

- Login e cadastro exibem uma ação Google funcional e acessível, sem iniciar uma
  integração de APIs Google além da autenticação básica.
- Um usuário existente com e-mail confirmado entra com Google e permanece no
  mesmo UUID, perfil, matrículas e progresso.
- Login por e-mail/senha continua funcionando para a conta vinculada.
- Usuário novo recebe uma identidade Auth e um único perfil de aluno.
- Nome e foto do Google são valores iniciais, respeitando campos já
  personalizados no TraderLab.
- Foto ausente ou falha ao importá-la usa as iniciais e não bloqueia a entrada.
- Perfil incompleto abre `/profile` com modal obrigatório; telefone salvo com
  sucesso fecha o modal e leva a pessoa à `/home`.
- Perfil completo segue diretamente à home ou ao destino interno solicitado,
  sem modal de conclusão.
- Uma identidade Google não cria papel de mentor/administrador nem ignora a
  matrícula e as permissões aplicadas pela API.
- Callback, destino de retorno, sessão SSR, logout, erros e cancelamento seguem
  seguros e compatíveis com os fluxos existentes.
- A recuperação de senha permite definir senha para uma conta Google, para que
  ela possa também usar e-mail/senha.

## Fora de escopo

- Login Google no ambiente `apps/admin`.
- Acesso a serviços Google como Gmail, Drive, Calendar ou Contacts.
- Obter telefone via APIs adicionais Google.
- Vinculação manual de identidades com e-mails diferentes, desvinculação de
  provedores ou tela de gestão de provedores conectados.
- Alteração de dados de perfil já personalizados em logins seguintes.
- Alterações de matrícula, papel ou regra de autorização.
