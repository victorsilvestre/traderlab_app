# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mentores e administradores usam o workspace de gestão separado da experiência
do aluno. Administradores têm acesso total ao sistema; mentores gerenciam
conteúdos e atividades relacionadas aos cursos sob sua responsabilidade,
conforme as permissões aplicadas pela API.

## Product Purpose

O TraderLab Gestão permite que mentores e administradores operem a plataforma
de aprendizagem TraderLab. O workspace centraliza a gestão de cursos,
conteúdos, usuários, matrículas, banners e comunicações essenciais.

## Positioning

Uma plataforma simples, objetiva, minimalista e eficiente para gerir tudo o que
está relacionado ao TraderLab.

## Operating Context

O workspace é uma aplicação Next.js separada da aplicação voltada aos alunos.
Mentores e administradores acessam com uma sessão de gestão própria. A
aplicação usa a API e o projeto Supabase compartilhados com a plataforma do
aluno; o navegador não acessa o banco de dados diretamente. As operações e
regras de autorização são verificadas pela API.

## Capabilities and Constraints

- Autenticação de gestores, recuperação de senha e manutenção de sessão.
- Gestão de cursos, módulos, aulas e materiais, incluindo rascunho, publicação
  e despublicação conforme o papel e a responsabilidade pelo conteúdo.
- Consulta e gestão de usuários e matrículas; convites sem cadastro prévio e
  revogação ou reativação de matrículas estão fora da etapa atual.
- Gestão de banners, incluindo cadastro, ativação, inativação e ordenação.
- Envio e consulta de notificações relacionadas aos cursos.
- O acesso administrativo a pagamentos e recorrências não está implementado
  nesta etapa.
- A revitalização atual abrange somente o layout do workspace, sem mudanças de
  funcionalidades. O foco está nos menus e recursos já disponíveis de
  notificações, banners, alunos e cursos.
- A experiência de mentores e administradores deve permanecer em um workspace
  próprio, distinto da área do aluno.
- A aplicação é web. O suporte móvel é responsivo conforme a estrutura do
  produto; não existe aplicativo móvel no MVP.

## Brand Commitments

O nome do produto é TraderLab; o workspace administrativo é identificado como
TraderLab Gestão. A interface e os textos do produto usam português do Brasil.
As diretrizes de identidade visual fornecidas para o redesign definem Roboto
Serif para títulos e Roboto para textos. A paleta de marca inclui verde
`#A2CB10`, vermelho `#A71619`, preto `#0C0D0E` e off-white `#FFFBF7`; as
aplicações devem preservar contraste adequado. Os logotipos têm variações para
 fundos claros e escuros. No workspace, a assinatura TraderLab Gestão deve
 também incluir a marca Bruno Borges, usando a variação de logo adequada ao
 fundo.

## Evidence on Hand

- `README.md`: configuração, autenticação e limites atuais do workspace.
- `app/` e `components/`: implementação das rotas, telas e componentes de
  gestão existentes.
- `../../traderlab_mvp.txt`: escopo confirmado do MVP e funcionalidades
  explicitamente adiadas.
- `../../sfdd/`: especificações e planos das jornadas administrativas
  implementadas ou planejadas.

Não há depoimentos, métricas de mercado ou alegações comparativas confirmadas
para uso em futuras interfaces.

## Product Principles

- Separar claramente as atividades de gestão da experiência de aprendizagem do
  aluno.
- Aplicar permissões por papel e responsabilidade do conteúdo na API.
- Manter o trabalho de gestão concentrado nas tarefas de conteúdo, usuários,
  matrículas e comunicação previstas no MVP.
- Apresentar apenas capacidades disponíveis ou confirmadas para a etapa atual.
