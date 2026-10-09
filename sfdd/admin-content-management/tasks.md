# Gestão de aulas e materiais complementares — Tarefas

## Documentação e decisões de produto

- [x] Confirmar aderência ao MVP para gestão de aulas e materiais.
- [x] Delimitar esta unidade à gestão administrativa de aulas e materiais
      complementares associados à aula.
- [x] Registrar material independente e gestão por mentor como fora desta
      unidade.
- [x] Criar wireframe grayscale independente de API, banco e autenticação.
- [x] Definir que qualquer extensão é aceita, inclusive `.ntsl`, com limite de
      50 MB por arquivo; MIME não restringe formatos desconhecidos.
- [x] Reutilizar a allowlist e os limites já aplicados pelo leitor do texto rico.
- [x] Definir que substituição/remoção desassocia o arquivo sem exclusão
      destrutiva de registros ou dados já usados.
- [x] Revisar a especificação e o plano antes da implementação autorizada.
- [x] Confirmar que `course_contents.image_path` e sua migration já existem;
      evitar uma migration redundante.

## API e contratos — após aprovação

- [x] Inspecionar contratos, schema e rotas existentes e registrar lacunas
      concretas antes de alterar banco ou criar contratos redundantes.
- [x] Definir DTOs administrativos para leitura e gravação de aula e material.
- [x] Implementar criação/edição de aula com validação da relação curso/módulo.
- [x] Implementar ordenação persistida das aulas dentro do módulo.
- [x] Implementar publicação/despublicação da aula com autorização no servidor.
- [x] Implementar emissão autorizada de upload e persistência ordenada de
      metadados dos materiais no bucket privado existente.
- [x] Validar limite de tamanho e associação do arquivo na API, sem restringir
      extensões ou tipos MIME desconhecidos.
- [x] Evitar associações de material entre cursos, módulos ou aulas diferentes.

## Aplicação administrativa — após aprovação

- [x] Integrar ações de aula ao módulo correto no construtor do curso.
- [x] Criar formulário de aula com título, descrição, texto e vídeo opcional.
- [x] Criar controles para adicionar, editar, ordenar e anexar materiais
      complementares.
- [x] Distinguir materiais salvos do seletor de novos anexos e permitir editar
      metadados de arquivos legados maiores que o limite de upload.
- [x] Mostrar mensagens específicas para tamanho de novos arquivos e limite da
      descrição do material.
- [x] Trocar o campo simples de conteúdo da aula por editor rico com negrito,
      itálico, sublinhado e blocos de título/subtítulo.
- [x] Preservar formatação existente ao editar e quebras de linha ao salvar e
      exibir o conteúdo para o aluno.
- [x] Separar a lista de materiais do formulário de inclusão/edição; deixar
      explícito o modo atual, o estado pendente e incluir ações de
      salvar/cancelar por material.
- [x] Padronizar a navegação de todas as telas secundárias administrativas com
      `← Voltar` sem breadcrumbs; a home permanece como entrada sem voltar.
- [x] Unificar os formulários de curso, módulo e aula em uma ação `Salvar` que
      publica o conteúdo; manter a ação explícita de despublicar.
- [x] Exibir estados vazio, envio, sucesso e erro recuperável.
- [x] Confirmar despublicação e explicar o impacto para o aluno.
- [x] Preservar acessibilidade, layout responsivo e rolagem natural da página.

## Validação — após implementação autorizada

- [ ] Testar 401/403, IDs manipulados e isolamento entre curso, módulo, aula e
      material.
- [x] Validar aula sem materiais, com um material e com vários materiais.
- [ ] Testar limite de tamanho, extensão não comum (por exemplo, `.ntsl`),
      falha e repetição do upload.
- [x] Validar ordenação persistida e estados de publicação sem perda de progresso.
- [x] Validar criação e edição publicando curso, módulo e aula, e confirmar a
      despublicação pelos controles existentes.
- [x] Confirmar que aulas não publicadas e materiais privados não são expostos
      na experiência do aluno.
- [x] Validar download autorizado pelo fluxo existente de URL assinada curta.
- [ ] Validar desktop/mobile, teclado, foco e ausência de rolagem horizontal.
- [x] Confirmar execução da migration `20261007120000_add_course_image_paths`
      no banco configurado; o Prisma informou que o schema está atualizado.
- [x] Executar typecheck, lint, build e verificação de
      codificação dos pacotes afetados.
- [x] Atualizar esta lista e a especificação com diferenças verificadas.

## Capas de aula e miniaturas

- [x] Usar a coluna nullable `course_contents.image_path` já existente e
      validar o escopo para manter compatibilidade com aulas antigas.
- [x] Reutilizar o endpoint autenticado de upload para imagens de conteúdo e
      validar formato, tamanho, registro-alvo e caminho na API.
- [x] Incluir capa obrigatória no formulário de aula e associar a imagem ao
      registro após o upload privado.
- [x] Exibir capas de módulo e aula na listagem administrativa, antes dos
      respectivos títulos.
- [x] Expor URL assinada (sem caminho privado) no resumo de aula do aluno e
      ordenar a linha como miniatura, título e estado à direita.
- [ ] Conferir visualmente a listagem de módulos/aulas do admin e a lista de
      aulas da plataforma em desktop e mobile.
- [x] Validar typecheck das aplicações admin/web e API; validar lint da API,
      do admin e do componente web alterado; verificar codificação UTF-8.
- [x] Executar `prisma migrate deploy`; o banco informou que não havia
      migrations pendentes.
