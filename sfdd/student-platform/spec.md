# Plataforma web autenticada — especificação

## Objetivo

Oferecer uma experiência visual contínua nas telas privadas da plataforma para
que cada pessoa encontre seus cursos, estude, acompanhe progresso e acesse as
áreas de conta. Esta etapa aplica o dock e o mundo visual aprovados na home sem
alterar os recursos e regras de negócio existentes.

## Escopo

- Home `/home`, já aprovada visualmente; manter sua composição e funcionamento.
- Biblioteca `/courses`.
- Detalhe `/courses/:courseId`.
- Aula ou material `/courses/:courseId/contents/:contentId`.
- Pesquisa `/search`.
- Notificações `/notifications`.
- Perfil `/profile`, incluindo o estado de conclusão cadastral.
- Navegação lateral persistente entre essas áreas autenticadas.

Login, cadastro, confirmação de e-mail, recuperação de senha e páginas
públicas ficam explicitamente fora desta etapa.

## Comportamento e limites

- Todas as telas privadas mantêm o dock aprovado, com marca BB compacta, marca
  Trader Bruno Borges expandida, links de Início, Cursos, Pesquisa e
  Notificações, badge real de não lidas e ações da conta no avatar.
- A seleção ativa do dock acompanha a rota atual; detalhes de curso e conteúdo
  mantêm Cursos como área ativa. Em telas estreitas o dock continua como barra
  inferior e deixa espaço para rolagem do conteúdo.
- A biblioteca lista todos os cursos publicados e autorizados, com capa, nome e
  descrição; cartões levam ao detalhe atual. Lista vazia e falha continuam
  estados distintos.
- O detalhe mantém resumo, progresso, retomada, exploração de módulos e busca
  dentro do curso. A aula/material mantém vídeo, conteúdo, downloads,
  conclusão/progresso e currículo lateral.
- Pesquisa mantém consulta autenticada, debounce, limite e resultados atuais.
- Notificações mantêm filtros, leitura individual/coletiva, paginação, links
  seguros, estados vazios e erro.
- Perfil mantém edição, avatar, e-mail somente leitura e logout. Cadastro
  incompleto continua obrigatório antes de entrar nas demais áreas.
- Autorização, sessão, matrícula, publicação, dados, textos e destinos da API
  não mudam. Não acrescentar compra, descoberta de cursos ou outras capacidades.
- Cada rota mostra carregamento, vazio, falha e conteúdo conforme os estados já
  existentes; o redesenho não mascara erro como ausência de dados.

## Direção visual aprovada

- Herdar a Galeria imersiva da home: canvas `#F5F3EF`, superfícies `#FFFBF7`,
  texto `#0C0D0E`, verde `#A2CB10`, ícones `#354604`, Roboto Serif nos títulos
  e Roboto no corpo.
- Reusar dock e menu da conta em todas as telas privadas; no desktop, reservar
  coluna visual para o dock; no mobile, reservar espaço para a barra inferior.
- Usar hierarquia editorial, respiro generoso, superfícies simples e imagens de
  capa existentes. Preservar densidade suficiente para módulos, materiais e
  notificações sem transformar áreas operacionais em vitrines.
- Usar estados de foco de teclado, alvos de toque confortáveis, contraste e
  respeito à preferência por movimento reduzido.

## Redesign de composição — aprovado em 13/10/2026

- Aplicar a qualidade visual da Home e do dock nas telas internas; reutilizar a
  identidade aprovada em vez de introduzir outra estética.
- `/courses`: manter uma galeria editorial responsiva, com capas amplas,
  títulos legíveis e descrições sem truncamento que esconda informação.
- `/courses/:courseId`: tornar capa, título e progresso uma abertura editorial;
  dar à retomada uma ação evidente e organizar módulos e aulas em uma galeria
  que continua clara quando a quantidade cresce.
- `/courses/:courseId/contents/:contentId`: privilegiar a sessão de estudo.
  Dar protagonismo ao vídeo, título e contexto; manter texto complementar em
  coluna de leitura confortável, materiais como linhas operacionais claras e
  currículo como trilho lateral no desktop que recolhe no mobile.
- `/search`: manter entrada de pesquisa como foco principal e apresentar
  resultados em linhas arejadas com hierarquia entre tipo, título e curso.
- `/notifications`: abrir com título, filtros e ação coletiva bem organizados;
  distinguir avisos não lidos com ponto/tom discreto, sem faixa lateral grossa.
- `/profile`: organizar identidade e avatar no início, agrupar campos em grade
  no desktop e manter formulário, logout e conclusão cadastral legíveis no
  mobile.
- Dar acabamento com escala tipográfica editorial, superfícies quentes,
  elevação suave, raio consistente, foco visível e estados próprios sem
  transformar áreas de estudo e gestão da conta em vitrines.
- Preservar conteúdo, dados, ações, destinos, ordem da API e integração. Não
  adicionar promessas, filtros, compra nem capacidades de negócio.

## Refinamento de escala e proporções — 13/10/2026

- Reduzir a escala dos títulos e os espaços verticais que deixam as telas
  internas visualmente grandes demais, mantendo intacta a composição aprovada
  da Home.
- No detalhe do curso e nos cartões de módulo, manter as capas em proporção
  16:9 e preencher a moldura sem barras laterais. Reduzir o bloco de abertura e
  a retomada para que os módulos comecem a aparecer na primeira dobra em telas
  desktop comuns.
- O player de vídeo das aulas mantém sua proporção 16:9 própria; não tratar o
  player como capa nem distorcer o vídeo.
- Na tela de aula, o título e o contexto usam a largura da coluna do vídeo para
  reduzir quebras excessivas e manter o título completo.
- Reduzir títulos e espaçamentos excessivos também em aula/conteúdo, pesquisa,
  notificações e perfil; preservar ações, conteúdo e responsividade.

## Critérios de aceite

- As sete áreas autenticadas compartilham o dock, identidade, tokens e margens
  responsivas aprovados; login/cadastro mantêm o layout atual.
- Todas as ações existentes continuam disponíveis e suas rotas/dados não mudam.
- A biblioteca de cursos segue navegável com qualquer quantidade devolvida pela
  API e mantém imagem, título, descrição, vazio e erro.
- Em largura desktop e móvel não há rolagem horizontal, sobreposição ao dock,
  corte de conteúdo funcional ou perda de controles.
- Tipagem, codificação UTF-8 e whitespace do diff passam; validação visual é
  feita em navegador quando o servidor local puder iniciar.
