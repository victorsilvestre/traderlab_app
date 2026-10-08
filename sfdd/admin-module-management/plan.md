# Gestão de módulos — Plano técnico

## Aplicações e módulos afetados

- `apps/admin`: experiência integrada de curso em `/courses/[courseId]`,
  configurações em `/courses/[courseId]/settings`, criação
  `/courses/[courseId]/modules/new` e edição
  `/courses/[courseId]/modules/[moduleId]`.
- `apps/api/src/modules/course`: ampliar os casos de uso e repositório de gestão
  existentes, mantendo regras no módulo `course`.
- `packages/contracts`: DTOs de módulo administrativo compartilhados entre
  admin e API.
- Banco: reutilizar `course_modules` e os campos existentes `course_id`,
  `title`, `description`, `image_path`, `position` e `status`; não criar
  migração nesta etapa.
- Storage: reutilizar bucket privado `traderlab-course-images`, endpoint de
  upload existente e cache/URL assinada aprovados para imagens do curso.

## Contratos e API

- `GET /admin/courses/:courseId/modules`: retorna dados mínimos do curso e todos
  os módulos ordenados por `position`, depois `id`; cada item inclui contagem de
  conteúdos, resumos de conteúdo ordenados e metadados mínimos dos materiais
  complementares, além da URL assinada de leitura opcional da capa.
- `POST /admin/courses/:courseId/modules`: cria módulo publicado no final da
  ordem; recebe título e descrição opcional.
- `PATCH /admin/courses/:courseId/modules/:moduleId`: altera título, descrição,
  caminho da capa e/ou estado de publicação. Caminho de capa deve pertencer ao
  ID do módulo e ser verificado no Storage.
- `PATCH /admin/courses/:courseId/modules/order`: recebe a lista completa e
  ordenada de IDs. A API rejeita IDs repetidos, ausentes, extras ou de outro
  curso. A atualização de todas as posições ocorre em transação.
- Todas as rotas exigem papel `administrator`. Operações aninhadas verificam a
  existência do curso e pertencimento do módulo; não confiar no filtro da UI.
- Não aceitar caminhos de upload fora de `modules/{moduleId}/cover/{uuid}.{ext}`.

## Web admin

- `/courses/[courseId]` é a tela de gestão do curso: cabeçalho com capa, título,
  estado, contagens e acesso a configurações; abaixo, módulos expansíveis.
- A tela integrada e todas as telas secundárias administrativas usam o link
  comum `← Voltar`; não há breadcrumbs. A entrada `/` é a única exceção.
- A página `/courses/[courseId]/settings` reutiliza o formulário de dados gerais
  do curso. Salvar retorna à gestão integrada do curso.
- O formulário de módulo tem uma única ação `Salvar`; novo e editado são
  publicados ao salvar, e despublicar permanece uma ação explícita.
- Ao expandir módulo, mostrar aulas e materiais independentes; materiais
  complementares aparecem agrupados sob a aula. A linha da aula oferece editar,
  reordenar, publicar/despublicar e recolher/expandir os materiais por ícones.
  Materiais e conteúdos independentes permanecem somente para leitura nesta
  tela.
- Cada aula usa uma linha horizontal: ícone/tipo e informações à esquerda;
  status junto aos dados; ações compactas sem texto visível à direita. A linha
  não quebra as ações para uma segunda faixa.
- A lista de materiais de cada aula começa recolhida. Um botão de ícone alterna
  sua visibilidade, informa `aria-expanded` e aponta para a lista por
  `aria-controls`; o botão aparece em todas as aulas e fica desabilitado com
  menor opacidade quando não há materiais.
- A criação da aula fica no grupo de ações do módulo como ícone `+`, antes de
  editar, publicar/despublicar e recolher. O subtítulo redundante da lista é
  removido.
- Tooltips dos ícones permanecem em uma linha; quando o controle está no fim da
  lista, o tooltip aparece acima para permanecer legível.
- A rota antiga `/courses/[courseId]/modules` redireciona à tela integrada.
- `page.tsx` valida parâmetros, carrega dados pela API e compõe os componentes.
- A lista é um Server Component na leitura inicial. Ações de ordem e publicação
  usam componentes cliente pequenos e atualizam a tela após sucesso.
- Formulários usam o endpoint same-origin da aplicação admin; a API autentica
  novamente com o bearer token da sessão.
- Upload usa `kind: module`, prévia local e o mesmo `Cache-Control` de uma hora,
  limite de tamanho/tipos, bucket e proporção aprovados para capa de curso.
- A prévia e a plataforma reutilizam `CourseImage`, qualidade 90 e proporção
  preservada.
- A confirmação de despublicação explica que o módulo e seus conteúdos deixam
  de aparecer aos alunos e que os dados/progresso não são apagados.

## Persistência e consistência

- Criar módulo usa transação para obter a posição final atual e acrescentar o
  registro sem colisão; o estado inicial é `DRAFT`.
- Reordenação valida o conjunto completo dos IDs e grava posições contíguas em
  uma transação.
- Atualização exige `courseId` e `moduleId` em conjunto para impedir alteração
  de módulo pertencente a outro curso.
- Despublicação altera somente `status`; não remove conteúdos nem progresso.
- Publicação de módulo é independente do estado do curso. A leitura do aluno já
  exige curso publicado, módulo publicado e matrícula ativa.

## Validação

- Typecheck de contratos, API e admin.
- Validar cabeçalho do curso, módulos expansíveis e resumo somente leitura do
  conteúdo existente em desktop e mobile; não deve existir rolagem horizontal.
- Conferir operações com IDs válidos, curso inexistente e módulo de outro curso.
- Conferir ordem, posições de limite, estado inicial e transições de publicação.
- Validar upload, atualização de capa e retorno à plataforma com imagem
  otimizada, sem expor imagem de curso não autorizado.
