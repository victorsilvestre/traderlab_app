# Gestão integrada do curso — tarefas

## Especificação e experiência

- [x] Confirmar que cursos, módulos, aulas e materiais pertencem ao MVP.
- [x] Definir a hierarquia de material independente e material complementar.
- [x] Aprovar e atualizar wireframe sem abas na primeira versão.

## API e contratos

- [x] Expor resumo administrativo de conteúdos nos módulos do curso.
- [x] Incluir status, ordem e metadados mínimos dos materiais complementares.
- [x] Manter caminhos internos e URLs de download fora do DTO.

## Admin

- [x] Transformar `/courses/[courseId]` em gestão integrada do curso.
- [x] Mostrar card do curso, configurações e módulos expansíveis.
- [x] Listar aulas, materiais independentes e complementos em modo somente leitura.
- [x] Preservar ordenação, publicação, edição e criação de módulos.
- [x] Mover os dados gerais do curso para `/courses/[courseId]/settings`.
- [x] Remover breadcrumbs e padronizar telas secundárias com `← Voltar`.
- [x] Redirecionar a rota antiga da lista de módulos.
- [x] Remover overflow horizontal estrutural dos containers e formulários.

## Validação

- [x] Executar typecheck do monorepo.
- [x] Executar lint da API e do admin após a última alteração.
- [ ] Conferir visualmente a tela integrada em desktop e mobile.
- [ ] Conferir no navegador que as telas não têm rolagem horizontal.
