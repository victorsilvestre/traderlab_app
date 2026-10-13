# Plataforma web autenticada — tarefas

## Especificação e direção

- [x] Inventariar rotas privadas e excluir autenticação pública do escopo.
- [x] Registrar comportamento, estados, critérios e limites em `spec.md`.
- [x] Definir composição técnica e autorização em `plan.md`.
- [x] Representar a biblioteca, detalhe, aula/material, pesquisa, notificações e perfil em wireframe responsivo.

## Navegação e sistema visual compartilhado

- [x] Criar o shell autenticado reutilizável com o dock aprovado e badge não lida.
- [x] Fazer itens do dock apontarem para rotas e indicar a área atual, incluindo subrotas de curso.
- [x] Reservar espaço desktop/mobile para dock em todos os conteúdos e manter foco/teclado.
- [x] Aplicar os tokens e linguagem visual da home ao detalhe e ao player; evitar alterações no fluxo de autenticação pública.

## Telas privadas

- [x] `/home`: reutilizar o shell e manter banner 3:1, retomada e cursos como aprovados.
- [x] `/courses`: integrar a biblioteca autenticada, imagens, títulos, descrições, links, estados vazio/erro.
- [x] `/courses/:courseId`: adaptar detalhe, progresso, retomada, módulos, visualizações e busca local.
- [x] `/courses/:courseId/contents/:contentId`: adaptar aula/material, player, descrição, materiais, progresso e currículo.
- [x] `/search`: adaptar busca global, resultados e estados sem mudar consulta/destinos.
- [x] `/notifications`: adaptar lista, filtros, leitura, paginação, links e estados.
- [x] `/profile`: adaptar perfil, avatar, edição, estado incompleto e logout.
- [x] Remover cabeçalhos duplicados apenas das telas internas abrangidas pelo shell; manter componentes e fluxos públicos intactos.

## Validação final

- [x] Confirmar typecheck da web, encoding UTF-8 e `git diff --check`.
- [ ] Inspecionar todas as telas em desktop e mobile no navegador; se `spawn EPERM` persistir, registrar a limitação sem declarar validação visual concluída.
- [x] Atualizar esta lista com o resultado e resumir telas/estados cobertos para aprovação do usuário.

## Resultado da validação

- `pnpm --filter @traderlab/web typecheck`, `pnpm check:text-encoding` e
  `git diff --check` passaram após a implementação.
- A tentativa de abrir `pnpm dev:web` terminou com `Error: spawn EPERM` no
  ambiente; a revisão visual no navegador desktop/mobile continua pendente.
- Não foram executadas suites de teste nesta etapa.

## Redesign de composição — nova execução

- [x] Registrar hierarquia e limites de cada tela interna em `spec.md` e `plan.md`.
- [x] Atualizar o wireframe responsivo com o leitor de aula e currículo.
- [x] Redesenhar o detalhe do curso e a navegação de módulos.
- [x] Redesenhar a leitura de aula/material em desktop e mobile.
- [x] Reorganizar notificações e perfil sem mudar suas ações.
- [x] Afinar biblioteca e pesquisa para consistência da família visual.
- [x] Validar tipagem, texto UTF-8 e diff; registrar indisponibilidade do navegador se persistir.

### Resultado desta execução

- A tela de aula agora usa hierarquia de leitura com título contextual, vídeo em
  destaque, texto fluido, materiais em linhas e currículo lateral/recolhível.
- Detalhe e perfil receberam composição e escalas tipográficas renovadas;
  notificações, pesquisa e biblioteca foram alinhadas ao acabamento da Home.
- Sinais de direção da interface usam ícones Lucide; removidas as duplicações
  de seta em texto e ícone.
- Typecheck, codificação e diff passaram. A inspeção em navegador segue
  pendente porque `pnpm dev:web` falha com `spawn EPERM` neste ambiente.

## Refinamento de escala e proporções

- [x] Registrar em `spec.md` e `plan.md` a redução da escala das telas internas,
  a capa 3:1 e a antecipação dos módulos.
- [x] Atualizar o wireframe e compactar o detalhe do curso preservando a capa
  inteira e trazendo os módulos para a primeira dobra.
- [x] Afinar títulos e espaçamentos excessivos em conteúdo, pesquisa,
  notificações e perfil sem alterar a Home aprovada.
- [x] Validar typecheck, UTF-8 e whitespace; registrar a limitação de inspeção
  visual se o servidor local continuar indisponível.

### Resultado deste refinamento

- Capa do detalhe fixada em 3:1 com imagem inteira; título, resumo de retomada
  e cartões de módulo compactados para antecipar os módulos na primeira dobra.
- Títulos e respiros refinados em aula/conteúdo, pesquisa, biblioteca,
  notificações e perfil. A Home aprovada permaneceu intacta.
- Typecheck, verificação UTF-8 e `git diff --check` passaram. A inspeção visual
  no navegador não foi repetida; a tentativa anterior de iniciar `pnpm dev:web`
  terminou com `spawn EPERM`.

## Correção de proporção das capas

- [x] Corrigir a especificação após confirmar que capas de curso e módulo são
  16:9; distinguir capas do player de vídeo, que também permanece em 16:9.
- [x] Ajustar molduras e preenchimento das capas de curso e módulo, sem barras
  laterais nem distorção.
- [x] Atualizar o wireframe e validar typecheck, UTF-8 e whitespace; registrar
  a limitação de inspeção visual se o servidor local seguir indisponível.

### Resultado desta correção

- Capas de curso e módulo usam molduras 16:9 com imagens preenchendo a área;
  o player de vídeo continua em 16:9.
- Esta correção substitui a decisão anterior de 3:1 para a capa do curso.
- Typecheck, UTF-8 e diff passaram. A visualização local segue indisponível
  devido ao erro `spawn EPERM` ao iniciar `pnpm dev:web`.

## Largura do título de aula

- [x] Registrar no escopo e no plano o alinhamento do título à coluna do vídeo.
- [x] Ampliar o cabeçalho da aula à largura disponível para o vídeo em desktop
  e usar a largura integral em telas estreitas.
- [x] Atualizar o wireframe e validar typecheck, UTF-8 e whitespace.

### Resultado

- Cabeçalho e título usam a mesma primeira coluna do vídeo no desktop; em telas
  estreitas, ambos ocupam a largura disponível. O título completo permanece
  visível e quebra naturalmente.
- Breadcrumbs foram inspecionados; proposta visual aguarda alinhamento antes de
  alterar sua apresentação.
