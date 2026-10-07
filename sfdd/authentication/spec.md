# Autenticação do usuário — Especificação

## Evolução: aplicação administrativa

O fluxo já entregue nesta unidade continua sendo a autenticação pública da
plataforma. A entrada de mentor e administrador no endereço separado
`admin.traderbrunoborges.com.br`, com sessão própria e sem cadastro público,
é definida em `sfdd/admin-authentication`. O redirecionamento de todos os
papéis para a raiz descrito abaixo registra o comportamento original desta
unidade; o admin usa uma entrada específica e papel persistido na API.

## Status

Escopo de autenticação implementado e coberto por testes automatizados. Ainda
faltam validar a recuperação de senha com e-mail real e revisar templates/SMTP
no painel Supabase. A autorização por papel em rotas de produto será aplicada
quando esses endpoints forem implementados. O fluxo também inclui encerrar a
sessão local e retornar ao login.

## Perfil do usuário

- Visitante que deseja criar uma conta ou entrar na plataforma.
- Usuário existente que precisa recuperar o acesso à conta.
- Usuário autenticado com perfil de aluno, mentor ou administrador.

## Objetivo

Permitir que uma pessoa crie uma conta, entre na plataforma e recupere o acesso
à conta. Após o login, todo usuário autenticado segue para a página inicial.

## Escopo

Esta especificação cobre os fluxos de cadastro, login e recuperação de senha
previstos no MVP, além do comportamento de navegação associado à sessão e ao
perfil autenticado.

## Elementos e ações visíveis

### Cadastro

- Formulário para informar nome, e-mail, telefone e senha.
- Campo para confirmar a senha; os dois valores devem coincidir antes do envio.
- Ação para criar a conta.
- Orientação sobre a confirmação do endereço de e-mail antes do primeiro acesso.
- Opção para reenviar o link de confirmação quando necessário.
- Link para ir ao login.
- Mensagens de validação, sucesso e erro.

### Login

- Formulário para informar as credenciais da conta.
- Ação para entrar.
- Link para iniciar a recuperação de senha.
- Link para ir ao cadastro.
- Mensagens de validação, sucesso e erro.

### Recuperação de senha

- Formulário para solicitar a recuperação da conta.
- Fluxo para redefinir a senha por meio de link enviado por e-mail.
- Confirmação de que a solicitação foi recebida, sem revelar se o endereço
  informado está cadastrado.
- Mensagens de validação e erro.

### Encerrar sessão

- Ação “Sair” na área autenticada.
- Estado de processamento e mensagem de erro caso a sessão não possa ser
  encerrada.

## Comportamento esperado

### Cadastro

1. O visitante informa nome, e-mail, telefone e senha e confirma a senha.
2. O sistema rejeita o envio se os valores da senha não coincidirem.
3. O sistema valida os dados e cria a conta quando forem válidos.
4. A nova conta recebe o perfil de aluno.
5. O sistema envia uma mensagem para confirmação do endereço de e-mail e
   orienta o usuário a confirmar o endereço antes do primeiro acesso.
6. Após confirmar o endereço, o usuário pode entrar na plataforma.
7. Se o link expirou ou não foi recebido, o visitante pode solicitar outro link
   informando o e-mail; a resposta não revela se a conta existe.

### Login

1. O usuário informa suas credenciais e envia o formulário.
2. O sistema valida as credenciais.
3. Em caso de sucesso, o sistema estabelece a sessão autenticada e encaminha o
   usuário à página inicial, independentemente do perfil.
4. Até que o endereço de e-mail seja confirmado, o usuário não pode acessar as
   áreas autenticadas; a interface informa como concluir a confirmação.
5. Em caso de falha, o sistema exibe uma mensagem clara sem revelar se uma conta
   existe ou qual parte da credencial estava correta.
6. Um usuário já autenticado que abre uma tela de autenticação é encaminhado à
   página inicial.

### Recuperação de senha

1. O usuário informa o endereço associado à conta.
2. O sistema recebe a solicitação e apresenta uma confirmação genérica,
   independentemente de existir uma conta para o endereço informado.
3. O usuário recebe por e-mail um link seguro para redefinir a senha.
4. A conclusão da redefinição permite que o usuário entre com a nova senha.

### Encerrar sessão

1. O usuário autenticado escolhe “Sair” na página inicial.
2. O sistema encerra a sessão neste navegador, remove os cookies de autenticação
   e encaminha o usuário para `/sign-in`.
3. Se não for possível limpar a sessão, o usuário permanece na página e recebe
   uma mensagem com opção de tentar novamente.

### Senha

- A senha deve ter no mínimo 6 caracteres.
- No cadastro e na redefinição, a confirmação da senha deve coincidir com a
  senha informada.
- Requisitos adicionais de complexidade ficam fora do escopo atual e poderão
  ser definidos em uma evolução futura.

## Regras de negócio e acesso

- Os perfis contemplados pelo MVP são aluno, mentor e administrador.
- O cadastro público não permite que o visitante escolha ou atribua a si mesmo
  os perfis de mentor ou administrador.
- Toda conta criada pelo cadastro público recebe o perfil de aluno.
- A confirmação de e-mail é necessária antes do primeiro acesso autenticado.
- O cadastro exige nome, e-mail, telefone e senha.
- A senha deve ter no mínimo 6 caracteres.
- A senha e sua confirmação devem coincidir no cadastro e na redefinição.
- Após o login, todos os perfis são encaminhados à página inicial neste momento.
- A autenticação identifica o usuário; permissões sobre áreas, ações e recursos
  devem respeitar o perfil e ser verificadas também pela API.
- O mentor e o administrador compartilham o ambiente de trabalho, mas as opções
  disponíveis devem respeitar suas permissões.
- A recuperação de senha não deve revelar se um endereço possui cadastro.
- Sair encerra a sessão do navegador atual; não revoga sessões de outros
  dispositivos.

## Estados da experiência

- **Inicial:** formulário pronto para preenchimento.
- **Validação:** campos inválidos recebem orientação específica e acessível.
- **Envio:** a ação fica identificada como em andamento para evitar envios
  repetidos acidentais.
- **Sucesso:** o sistema confirma o cadastro, login ou recebimento da solicitação
  de recuperação e indica o próximo passo.
- **Erro:** o sistema apresenta uma mensagem compreensível e permite tentar
  novamente quando apropriado.
- **Sessão encerrada ou inválida:** o usuário precisa autenticar-se novamente
  para acessar áreas protegidas.

## Critérios de aceitação

- [x] Um visitante consegue criar uma conta com os dados exigidos.
- [x] O cadastro exige nome, e-mail, telefone e senha.
- [x] A senha com menos de 6 caracteres é rejeitada.
- [x] O cadastro é rejeitado quando a senha e sua confirmação forem diferentes.
- [x] Uma nova conta recebe o perfil de aluno.
- [x] O sistema envia instruções para confirmar o e-mail informado.
- [x] Uma conta sem e-mail confirmado não consegue acessar áreas autenticadas.
- [x] Após a confirmação do e-mail, o usuário consegue entrar.
- [x] Um usuário existente consegue entrar com credenciais válidas.
- [x] Credenciais inválidas geram uma mensagem segura e compreensível.
- [x] Aluno, mentor e administrador são encaminhados à página inicial após o login.
- [x] Um usuário autenticado não permanece nas telas de cadastro ou login.
- [ ] O usuário consegue solicitar a recuperação de senha.
- [x] A resposta à solicitação de recuperação não confirma nem nega a existência
      da conta informada.
- [ ] O usuário recebe por e-mail um link seguro e consegue concluir a
      redefinição e acessar a conta com a nova senha.
- [x] O usuário consegue solicitar outro link de confirmação sem expor se a
      conta existe.
- [x] A redefinição é rejeitada quando a nova senha e sua confirmação forem
      diferentes.
- [x] A API valida a sessão em `/authentication/me` e na redefinição de senha,
      carrega o perfil pelo banco e ignora qualquer papel enviado no cadastro.
- [x] Um usuário autenticado consegue encerrar a sessão deste navegador e é
      encaminhado à tela de login.
- [x] A ação de logout apresenta estado de processamento e erro acessível caso
      a limpeza da sessão falhe.

As políticas de autorização específicas para cursos, matrículas e outros
recursos serão verificadas na API junto com a implementação dessas rotas.

## Exclusões explícitas

- Autenticação em dois fatores.
- Login por redes sociais ou provedores externos.
- Convites e concessão de matrícula; pertencem a fluxos de acesso ou matrícula.
- Administração de usuários e alteração de perfis por interface administrativa.
- Regras avançadas de sessão, como limite de dispositivos simultâneos.
- Termos de uso, consentimento de marketing ou fluxos de privacidade, até que
  sejam especificados separadamente.

## Decisões aprovadas

- Dados obrigatórios: nome, e-mail, telefone e senha.
- A confirmação do e-mail é exigida antes do primeiro acesso autenticado.
- O perfil padrão do cadastro público é aluno.
- Todos os perfis são encaminhados à página inicial após o login, nesta etapa.
- A recuperação de senha é feita por link enviado por e-mail.
- O requisito inicial de senha é mínimo de 6 caracteres; regras mais rígidas
  poderão ser definidas futuramente.

## Fora de escopo desta etapa

- Requisitos adicionais de complexidade de senha.
- Destinos diferentes de navegação pós-login por perfil.
- Revogação de sessões em outros navegadores ou dispositivos.

## Sessão expirada ou validação indisponível

1. Ao navegar para uma área protegida, a página atual permanece visível e um indicador discreto aparece somente se o carregamento demorar.
2. Se a sessão puder ser renovada, o usuário continua na rota solicitada.
3. Se o servidor confirmar que a sessão expirou ou foi revogada, o sistema encaminha ao login e preserva a rota interna solicitada.
4. Após login bem-sucedido, o usuário retorna à rota interna preservada. Destinos inválidos ou externos levam à página inicial.
5. Se a validação falhar por indisponibilidade ou timeout, a sessão local é mantida e a interface oferece uma nova tentativa, sem redirecionamento automático ao login.

### Critérios adicionais de aceitação

- [ ] Durante a navegação protegida, um indicador discreto não substitui a página atual nem apresenta uma tela exclusiva de carregamento.
- [ ] Sessão confirmada como expirada direciona ao login e, após autenticação, retorna à rota interna originalmente solicitada.
- [ ] Falha temporária ou timeout de API/Auth apresenta erro recuperável, preserva cookies e não é tratado como sessão expirada.
