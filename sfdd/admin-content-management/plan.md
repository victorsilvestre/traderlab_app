# Gestão de aulas e materiais complementares — Plano técnico

## Aplicações e módulos

- `apps/admin`: formulários e ações no construtor integrado do curso.
- `apps/api`, módulo `course`: casos de uso, contratos de persistência,
  validação da hierarquia e rotas administrativas.
- `packages/contracts`: DTOs compartilhados apenas para dados que atravessem
  aplicações.
- `apps/api/prisma`: `CourseContent.imagePath` e a migration
  `20261007120000_add_course_image_paths` já existem; não criar coluna ou
  migration duplicada. Confirmar o estado dessa migration no banco configurado.

## Experiência e rotas

- Integrar ações de criar/editar aula no fluxo `/courses/[courseId]`, a partir
  do módulo correspondente, mantendo a página como composição de tela.
- Criar tela/formulário administrativo sob `apps/admin/components/forms/` e
  componentes de resumo/ordenação sob `components/ui/` ou
  `components/navigation/`, conforme a responsabilidade.
- Reutilizar a hierarquia visual e as consultas resumidas de conteúdos já
  apresentadas por `AdminCourseModules`; não criar uma segunda árvore curricular.
- Formulário de aula contém campos básicos, editor rico do texto principal com
  marcas inline (negrito, itálico, sublinhado) e blocos (parágrafo, título e
  subtítulo), URL de
  vídeo opcional e seção de materiais complementares em lista resumida. Um
  formulário contextual individual é aberto por “Adicionar material” ou
  “Editar”, com salvar/cancelar próprios, remoção local da aula e ordenação.
  Materiais novos e alterações em edição são identificados como pendentes até
  que a aula seja salva.
- O formulário exige capa JPEG/PNG/WebP até 5 MB, reutiliza o bucket privado
  `traderlab-course-images` e emite upload depois de criar/identificar a aula.
  A persistência associa `imagePath` somente após conferir o caminho e a
  existência do objeto. A capa substitui a imagem atual sem expor caminho na UI.
- O construtor do admin gera URLs assinadas de leitura para miniaturas de
  módulo e aula e as mostra antes dos títulos.
- Reutilizar os padrões de formulário, modal de publicação e tratamento de
  estados do admin. Usar CSS local conforme convenção existente.
- Padronizar a navegação secundária do workspace com `AdminBackLink` e o texto
  `← Voltar`; remover breadcrumbs da gestão do curso. A home `/` é a entrada e
  não recebe botão de voltar.
- Padronizar os formulários de curso, módulo e aula com uma ação `Salvar`; o
  fluxo persiste/publica o conteúdo, mantendo os controles atuais de
  despublicação nos resumos e listagens.
- O wireframe é referência de estrutura, sem API, autenticação ou dados reais.

## API, domínio e persistência

- Estender o módulo `course`, sem criar microserviço ou lógica de negócio no
  frontend.
- Definir DTOs de leitura e escrita para aula e material. Não expor linhas Prisma,
  caminhos privados do Storage ou URLs assinadas nas respostas de gestão.
- Criar operações administrativas para criar/editar aula, ordenar aulas,
  publicar/despublicar aula, solicitar autorização de upload e persistir
  metadados/ordem de materiais.
- Cada operação valida papel administrator e a cadeia curso → módulo → aula →
  material no servidor.
- Novos cursos, módulos e aulas usam estado publicado e data de publicação
  quando aplicável. Os formulários enviam `published` ao salvar alterações;
  despublicar continua sendo uma operação explícita e autorizada.
- Criar a aula antes de emitir upload para arquivos associados a ela; tratar
  falha parcial de upload de modo recuperável e evitar registros órfãos. Manter
  o registro intermediário como rascunho e publicar somente após associar a
  capa no salvamento final.
- Reutilizar o endpoint autenticado de upload de imagens para o destino `content`
  e armazenar o caminho em `course_contents.image_path`. O destino deve apontar
  para uma aula (não para conteúdo de material independente).
- Usar adaptador de armazenamento privado existente ou ampliá-lo com contrato
  específico de upload de material. Reutilizar o bucket configurado
  `traderlab-course-materials` e não a infraestrutura de imagens de capa.
- Armazenar metadados necessários ao download (nome, MIME, tamanho, caminho
  privado e posição). Aceitar qualquer extensão e usar limite de tamanho de
  50 MB por arquivo em novos envios; materiais antigos maiores permanecem
  editáveis sem novo upload. MIME é metadado e não deve bloquear formatos não
  reconhecidos pelo navegador.
- Manter compatibilidade de leitura com conteúdo rico e dados legados conforme
  `sfdd/contents`; restringir o documento rico a uma allowlist e nunca aceitar
  HTML arbitrário.
- Acrescentar URL assinada da capa ao DTO de resumo curricular para renderizar
  thumbnails na tela de conteúdo do aluno. Não devolver `imagePath` nesse DTO.
- Na listagem do aluno, manter a ordem miniatura → título → indicador de estado;
  fixar o indicador à direita e alinhar todos os elementos verticalmente.
- O editor administrativo serializa para o DTO `RichTextDocumentDto` já usado
  pela API e pelo leitor do aluno. O backend continua normalizando e filtrando
  nós, marcas e links permitidos.
- Avaliar transação para atualização de ordenação e de relações. Não apagar
  arquivos substituídos sem política de retenção aprovada.

## Segurança e publicação

- Autenticar e autorizar em cada rota administrativa, sem confiar em controles
  de interface.
- Rejeitar IDs fora da hierarquia requisitada e mudanças de estado inválidas.
- O download do aluno segue usando autorização e URL assinada curta existente.
- Publicação da aula permanece independente de curso e módulo; a consulta do
  aluno aplica todas as condições de publicação e matrícula já existentes.
- Não retornar paths ou tokens de upload a usuários não autorizados e não
  registrar credenciais ou URLs assinadas em logs.

## Validação técnica

- Testes de aplicação/API para autorização, isolamento entre cursos, validação
  de campos/arquivo, ordenação, publicação e falhas parciais.
- Testes de contrato para aula com zero, um e vários materiais.
- Typecheck, lint, testes relevantes, build dos pacotes afetados e
  `pnpm check:text-encoding`.
- Conferir visualmente desktop/mobile, teclado, foco e ausência de overflow.
- Não aplicar migrações nem gravar dados demonstrativos em ambiente remoto sem
  autorização operacional específica; para esta mudança, confirmar primeiro o
  estado da migration de capas que já existe.
