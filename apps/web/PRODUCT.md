# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Alunos atuais acessam a plataforma para estudar cursos comprados ou liberados
para suas contas. Pessoas interessadas também podem chegar à plataforma; a
compra de cursos é uma capacidade futura, ainda não disponível nesta etapa.

## Product Purpose

A plataforma web do TraderLab oferece aos alunos um lugar para acessar seus
cursos, acompanhar as aulas e continuar os estudos. O objetivo atual é tornar
o aprendizado disponível e organizado para cada aluno. No futuro, a plataforma
deve crescer para reunir várias áreas e atividades do ecossistema Trader de
Sucesso em um ponto central para o usuário.

## Positioning

Uma plataforma central de aprendizagem do ecossistema Trader de Sucesso,
começando pelo acesso aos cursos e conteúdos liberados para cada aluno e
podendo crescer com novas atividades ao longo do tempo.

## Operating Context

Esta é a aplicação web voltada aos alunos, separada do workspace administrativo
TraderLab Gestão. O aluno acessa a conta por navegador, consulta os cursos
disponíveis, percorre módulos e aulas, baixa materiais e acompanha seu
progresso. A aplicação Next.js usa a API e o projeto Supabase compartilhados
com o admin; o navegador não consulta o banco de dados diretamente.

## Capabilities and Constraints

- Cadastro, login, confirmação de e-mail, recuperação de senha e manutenção da
  sessão do aluno.
- Consulta dos cursos disponíveis para a conta e exploração de módulos, aulas
  e materiais publicados.
- Registro do progresso das aulas e retomada básica dos estudos.
- Consulta de notificações e comunicações essenciais relacionadas à conta e
  aos cursos.
- Edição dos dados do perfil do aluno.
- O acesso ao conteúdo depende das permissões e matrículas verificadas pela
  API.
- A compra de cursos pela plataforma web é uma possibilidade futura e não está
  disponível nesta etapa.
- A plataforma deve poder crescer com novas áreas e atividades do ecossistema
  Trader de Sucesso; quais serão essas áreas ainda não está definido.
- O produto atual é uma aplicação web responsiva. Aplicativo móvel nativo não
  faz parte do MVP.

## Brand Commitments

O produto é TraderLab e a experiência é voltada ao aluno. A interface e os
textos usam português do Brasil. As diretrizes de identidade visual fornecidas
para o produto definem Roboto Serif para títulos e Roboto para textos, com
logotipos em variações para fundos claros e escuros. A paleta de marca inclui
verde `#A2CB10`, vermelho `#A71619`, preto `#0C0D0E` e off-white `#FFFBF7`; o
uso deve preservar contraste adequado. Os arquivos de logo estão em
`public/logos/`.

## Evidence on Hand

- `../../traderlab_mvp.txt`: capacidades incluídas no MVP e itens adiados.
- `app/` e `components/`: implementação atual dos fluxos de autenticação,
  início do aluno, cursos, aulas, materiais, perfil e notificações.
- `public/logos/`: variações fornecidas dos logotipos Trader Bruno Borges.
- As referências de interface e identidade visual foram fornecidas pelo
  usuário nesta conversa. Não há depoimentos, métricas ou alegações de
  resultados confirmadas para uso na plataforma.

## Product Principles

- Ajudar o aluno a encontrar e continuar os cursos que estão disponíveis para
  sua conta.
- Tornar claros o curso, o módulo, a aula e o progresso de aprendizagem.
- Manter no produto somente funcionalidades disponíveis ou confirmadas para a
  etapa atual.
- Permitir a expansão futura da plataforma sem confundir capacidades futuras
  com as que o aluno já pode usar.
