# Fundação da aplicação administrativa — Especificação

## Status

Implementação local iniciada em 7 de outubro de 2026. A aplicação `apps/admin`
e sua página inicial já existem; a validação com contas reais de mentor e
administrador e os callbacks configurados no Supabase ainda estão pendentes.
Os fluxos de entrada, sessão e recuperação estão detalhados em
`sfdd/admin-authentication`; cada função de gestão terá seu próprio SFDD.

## Contexto e objetivo

O TraderLab terá duas aplicações web no mesmo repositório:

- `traderlab.traderbrunoborges.com.br`: plataforma de acesso, estudo e compra.
- `admin.traderbrunoborges.com.br`: ambiente de gestão e consulta.

O objetivo desta fundação é permitir que administrador e mentor entrem no
ambiente de gestão, reconheçam seu papel e encontrem uma estrutura própria para
as funções que serão acrescentadas. O aluno não pode acessar esse ambiente.

## Mapa inicial da visão administrativa

O MVP prevê gestão de cursos, módulos, aulas e materiais; consulta de alunos,
matrículas e pagamentos; comunicação essencial; configurações e segurança.
O repositório já possui tabelas de cursos, módulos, conteúdos, materiais,
matrículas, notificações e banners. A primeira entrega do catálogo está definida
em `sfdd/admin-course-catalog`.

O estado técnico ainda é parcial: a API de cursos atende a experiência de
aprendizagem, mas não possui operações administrativas de escrita; matrículas
não têm fluxo de consulta e gestão no módulo de API; notificações e banners têm
leitura para a plataforma, sem gestão pelo admin. Não foi encontrado modelo de
pagamento/assinatura nem módulo de pagamento no código atual. A consulta de
pagamentos depende da definição e implementação dessa persistência e da
integração comercial; a interface não deve inventar registros ou números.

## Perfis

- **Administrador:** tem acesso integral às funções de gestão do MVP e também
  pode entrar na plataforma TraderLab com a mesma conta, em uma sessão própria.
- **Mentor:** usa o mesmo ambiente de gestão, com opções e operações limitadas
  aos cursos e dados sob sua responsabilidade.
- **Aluno:** usa a plataforma TraderLab e não recebe acesso ao ambiente de gestão.

O endereço `admin` identifica a aplicação de gestão, não um papel exclusivo:
mentores também entram nele.

## Experiência inicial

1. Uma pessoa abre o endereço administrativo e encontra a página de entrada.
2. Informa e-mail e senha de uma conta existente. Não há cadastro público de
   mentor ou administrador nesse endereço.
3. Após autenticação e confirmação do papel pelo servidor, administrador ou
   mentor entra na página inicial de gestão.
4. A aplicação mostra identificação da conta, papel, navegação própria e a ação
   de sair. Mostra somente destinos já disponíveis para aquele papel.
5. Ao sair, a sessão deste endereço é encerrada e a pessoa volta à entrada.

A página inicial da fundação deve informar com clareza que as funções de gestão
serão disponibilizadas por etapas. Ela não deve exibir indicadores fictícios,
contagens inventadas ou botões que pareçam executar funções ainda ausentes.

O visual inicial pode usar a identidade já presente na plataforma TraderLab:
marca verde, superfícies claras e ícones discretos. Esse tratamento ajuda a
reconhecer o produto, sem definir o layout final do ambiente de gestão.

Todas as telas administrativas devem se ajustar à largura disponível sem
criar rolagem horizontal na página. Tabelas e grupos de ações devem se adaptar
à área útil, preservando todos os dados e controles.

A aplicação define esse comportamento no nível global: a rolagem vertical
permanece no documento e qualquer excesso horizontal é recortado no limite da
janela, sem deslocar o shell ou ocultar a barra lateral. Componentes devem se
ajustar à largura disponível em vez de criar uma segunda faixa de rolagem.

O shell administrativo ocupa a altura da janela. A barra lateral e o cabeçalho
permanecem estáveis enquanto apenas a área principal de conteúdo rola; expandir
uma aula ou outro conteúdo longo não deve aumentar a página inteira nem deslocar
a navegação ou as informações fixadas no rodapé da barra lateral.

O shell administrativo ocupa a altura da janela. A barra lateral e o cabeçalho
permanecem estáveis enquanto apenas a área principal de conteúdo rola; expandir
uma aula ou outro conteúdo longo não deve aumentar a página inteira nem deslocar
a navegação ou as informações fixadas no rodapé da barra lateral.

## Regras de acesso e sessão

- O mesmo cadastro no Supabase Auth e o mesmo perfil do produto identificam a
  pessoa nos dois sites.
- Cada site mantém sua própria sessão no navegador. Entrar ou sair em um site
  não exige entrar ou sair no outro; abrir o outro site pode pedir novo login.
- O acesso ao admin exige sessão válida e papel `mentor` ou `administrator`
  confirmado pela API. Dados de papel enviados pelo navegador não concedem acesso.
- Uma conta `student` que tente entrar no admin recebe uma mensagem de acesso
  indisponível para seu perfil e não recebe acesso ao ambiente protegido.
- Falha temporária ao consultar autenticação ou perfil é apresentada como erro
  recuperável; não é tratada como prova de que a pessoa perdeu permissão.
- Uma sessão expirada direciona à entrada administrativa e preserva, quando
  seguro, o destino interno solicitado.
- A navegação do mentor deve omitir funções exclusivas de administrador. Cada
  operação futura deverá validar papel e responsabilidade pela API, inclusive
  quando chamada sem a interface.
- O administrador pode entrar na plataforma TraderLab separadamente. O acesso
  dele ao catálogo e às aulas nessa plataforma precisa de regras próprias na
  API, pois as rotas atuais aceitam somente alunos com matrícula ativa. A
  fundação não define se esse acesso registra progresso ou cria matrícula.

## Estados da experiência

- **Sem sessão:** página de entrada administrativa.
- **Credenciais inválidas ou e-mail não confirmado:** orientação compreensível
  sem revelar qual dado estava correto.
- **Aluno autenticado:** acesso negado de forma clara, com ação para sair.
- **Sessão válida de gestor:** página inicial do ambiente correspondente ao papel.
- **Sessão expirada:** retorno à entrada, com caminho interno seguro preservado.
- **API ou Auth indisponível:** mensagem recuperável e opção de tentar novamente.
- **Saída:** sessão local do admin encerrada, seguida de retorno à entrada.

## Critérios de aceitação

- [x] `apps/admin` é uma aplicação web independente, iniciada separadamente de
      `apps/web` no mesmo monorepo e preparada para publicação própria.
- [x] O endereço administrativo mostra entrada e ambiente de gestão próprios,
      com layout e navegação distintos da plataforma do aluno.
- [ ] As telas administrativas se ajustam a larguras menores sem rolagem
      horizontal e sem ocultar conteúdo ou ações.
- [ ] Nenhuma rota administrativa permite deslocamento horizontal do documento;
      a rolagem vertical continua sendo a rolagem natural da página.
- [ ] O shell permanece limitado à altura da janela; conteúdo longo rola na
      área principal sem mover a barra lateral ou seu rodapé.
- [ ] O shell permanece limitado à altura da janela; conteúdo longo rola na
      área principal sem mover a barra lateral ou seu rodapé.
- [ ] Uma conta `administrator` existente entra e sai do admin.
- [ ] Uma conta `mentor` existente entra no admin e vê uma navegação adequada ao
      papel.
- [ ] Uma conta `student` não consegue abrir a área protegida do admin, mesmo
      quando possui credenciais válidas.
- [ ] Requisições protegidas futuras dependem de autorização na API; a
      interface não é a fonte de permissão.
- [ ] Os sites mantêm sessões independentes por endereço.
- [ ] A perda temporária de conectividade não é apresentada como perda de
      permissão nem apaga automaticamente a sessão.
- [x] Não existe cadastro público que atribua papel de mentor ou administrador.
- [ ] As configurações de domínio e autenticação admitem os dois endereços sem
      aceitar destinos arbitrários de redirecionamento.

## Fora desta unidade

- Criar, editar, publicar ou despublicar cursos, módulos, aulas e materiais.
- Gerir alunos, matrículas, pagamentos, notificações ou banners.
- Definir indicadores e relatórios do painel.
- Criar interface de concessão ou mudança de papéis.
- Implantar DNS, hospedagem e certificados de produção.
- Decidir matrícula e progresso do administrador ao visualizar aulas na
  plataforma TraderLab.

Esses itens pertencem ao MVP quando previstos em `traderlab_mvp.txt`, mas
precisam de especificações e decisões próprias antes da implementação.
