# Acesso público à plataforma

## Perfil e objetivo

Visitantes e alunos que ainda não iniciaram uma sessão precisam conhecer a
plataforma, criar uma conta, entrar ou recuperar o acesso com clareza.

## Escopo

Redesenhar visualmente a entrada pública `/` e os fluxos `/sign-in`,
`/sign-up`, `/password-recovery`, `/password-reset`, `/email-confirmation` e
`/auth/callback`. Preservar regras, integrações, mensagens e destinos atuais.
O login administrativo e qualquer alteração de autenticação no backend estão
fora deste trabalho.

## Elementos e comportamentos

- A entrada pública apresenta a marca TraderLab e caminhos claros para entrar
  ou criar conta. Usuários autenticados continuam sendo encaminhados ao destino
  atual.
- O login permite autenticar, preservar o destino seguro, abrir a recuperação
  de senha ou seguir para o cadastro. A opção Google permanece indisponível e
  identificada como “Em breve”.
- O cadastro mantém nome, e-mail, telefone, senha e confirmação de senha.
- A recuperação envia instruções para o e-mail informado.
- A redefinição mantém a validação da sessão do link e da confirmação da senha.
- A confirmação permite solicitar um novo e-mail de confirmação.
- O callback mantém a conclusão OAuth e apresenta estados de validação e erro.
- Todos os formulários conservam estados de envio, sucesso e erro, além de
  rótulos acessíveis e navegação entre fluxos.

## Estados

Cada formulário mantém seus estados atuais de repouso, envio, sucesso e erro.
O callback apresenta validação enquanto aguarda a conclusão e uma alternativa
para retornar ao login quando ocorre erro. A entrada autenticada conserva o
redirecionamento e o tratamento atual de falha ao consultar o perfil.

## Critérios de aceite

- A apresentação responde a telas largas e estreitas sem rolagem horizontal.
- As telas públicas compartilham uma linguagem visual coerente com a identidade
  aprovada da plataforma do aluno.
- Nenhuma integração, validação, rota ou destino existente perde comportamento.
- Foco de teclado, mensagens de estado e movimento reduzido são suportados.
- Os breadcrumbs de cursos e aulas usam separadores por ícone, hierarquia
  discreta, localização atual destacada e títulos longos truncados visualmente,
  preservando o nome integral para tecnologias assistivas.

## Fora de escopo

- Alterações no backend, contratos, política de sessão ou provedores OAuth.
- Alterações na área administrativa ou redesenho das telas autenticadas além dos
  breadcrumbs especificados.
- Disponibilizar o login Google antes que a integração esteja pronta.
