# Gestão integrada do curso — plano técnico

## Escopo desta implementação

- Reorganizar a rota `/courses/[courseId]` como a experiência integrada de
  curso aprovada no wireframe.
- Mostrar dados do curso no cabeçalho, incluindo capa, estado e contagens.
- Manter as operações já implementadas para criar/editar/publicar/despublicar e
  ordenar módulos.
- Expandir módulos para exibir conteúdos já cadastrados em ordem, com tipo,
  estado e materiais complementares. Essa consulta é somente para leitura.
- Mover a edição do curso para `/courses/[courseId]/settings` e manter a rota
  antiga `/courses/[courseId]/modules` como redirecionamento para a tela
  integrada.
- Não implementar formulário, upload, edição, ordenação ou publicação de
  aulas e materiais nesta etapa.

## Contratos e API

- Expandir `ManagedCourseModuleDto` com resumos administrativos dos conteúdos:
  ID, título, descrição, tipo, estado, posição e metadados mínimos dos arquivos
  complementares (ID, nome, MIME, tamanho e posição).
- Atualizar `PrismaCourseManagementRepository.listManagedModules` para buscar
  todos os módulos e conteúdos, inclusive rascunhos, ordenados por posição e
  ID. Buscar metadados de arquivos complementares em ordem.
- Não retornar `storagePath`, URL assinada ou URL de download dos materiais ao
  construtor. A tela apresenta apenas seus nomes e tamanhos.
- Manter as rotas e verificações administrativas atuais. Nenhuma nova migração
  de banco é necessária.

## Admin

- `/courses/[courseId]` carrega curso e módulos por meio dos helpers
  administrativos já existentes e compõe a tela com `AdminCourseModules`.
- Reutilizar a API existente de cursos e módulos; a tela não acessa Prisma nem
  Supabase diretamente.
- `AdminCourseModules` apresenta card do curso, configurações, seção Conteúdo e
  acordeões de módulos; usa ações de mover para cima/baixo já autorizadas e o
  modal já aprovado para despublicação.
- Exibir conteúdo e materiais anexados somente para leitura. Não apresentar
  botões inertes para funcionalidades futuras.
- Criar `/courses/[courseId]/settings` reutilizando `AdminCourseForm`.
  Salvar/cancelar retorna à tela integrada.
- Após criação ou edição de módulo, retornar à tela integrada do curso.
- Preservar layout responsivo e impedir overflow horizontal no grid principal,
  formulários e lista.

## Segurança e consistência

- A API autentica cada consulta e exige papel `administrator`.
- O conteúdo retornado permanece vinculado ao curso solicitado; a consulta
  aninhada impede associação cruzada.
- Não expor caminhos internos do storage ou credenciais.
- A publicação de módulo permanece independente do curso e do estado dos
  conteúdos.

## Validação

- Executar typecheck do monorepo e lint da API/admin.
- Executar verificação de codificação, formatação e `git diff --check`.
- Conferir visualmente a experiência em desktop e mobile e a ausência de
  rolagem horizontal; a verificação visual em navegador é uma validação
  pendente quando não houver sessão local disponível.
