# Catálogo de cursos administrativos — Tarefas

## Documentação

- [x] Confirmar que cursos fazem parte do MVP e que o banco já tem os campos
      necessários para cadastro básico.
- [x] Definir autorização exclusiva do administrador nesta primeira entrega.
- [x] Registrar exclusão e gestão de módulos/conteúdos como fora do escopo desta unidade.
- [x] Criar wireframe grayscale sem API, banco ou autenticação.

## API e contratos — primeira entrega

- [x] Criar contratos para consulta, criação e atualização do catálogo.
- [x] Implementar autorização administrativa nas rotas de catálogo.
- [x] Implementar listagem com busca e filtro de publicação.
- [x] Implementar criação publicada, edição e publicação/despublicação.
- [x] Usar uma única ação “Salvar” no formulário de curso.
- [x] Persistir autoria e data de publicação no servidor.

## Aplicação administrativa — primeira entrega

- [x] Criar /courses com busca, filtro, listagem e estados vazio/erro.
- [x] Criar formulário para novo curso e edição de dados básicos.
- [x] Adicionar ação explícita de publicar/despublicar com estado de sucesso/erro.
- [x] Adicionar navegação para a rota real do catálogo.

## Validação

- [ ] Validar autorização de administrador e rejeição de sessão inválida.
- [ ] Validar cadastro, edição, busca, filtro e transições de publicação.
- [ ] Confirmar que rascunhos continuam indisponíveis na plataforma de aprendizagem.
- [x] Executar typecheck, lint e build da API, contratos e aplicação admin.
- [ ] Executar testes pertinentes para regras de autorização e publicação.

## Próximas etapas de conteúdo

- [ ] Especificar e implementar módulos, ordenação e publicação.
- [x] Especificar e implementar aulas e materiais na unidade
      `admin-content-management`.
- [ ] Definir upload e validação de capas e arquivos de material.

## Ajustes da experiência e capas

- [x] Alinhar verticalmente ações à linha correspondente e usar ícones com rótulos acessíveis/tooltips.
- [x] Substituir confirmação inline de despublicação por modal com impacto, confirmar/cancelar e chamada de API apenas após confirmação.
- [x] Trocar campo URL da capa por seletor de arquivo, prévia, validação JPEG/PNG/WebP até 5 MB e estados de envio.
- [x] Criar bucket privado de imagens com upload e URLs de leitura assinadas.
- [x] Adicionar caminho de capa para cursos, módulos e conteúdos com migração compatível.
- [x] Proteger emissão de upload por autorização de administrador e existência do registro-alvo.
- [ ] Provisionar e verificar o bucket de imagens no Supabase do ambiente.
- [ ] Aplicar a migração de caminhos de imagem no banco do ambiente.
- [ ] Validar visualmente ações/modal e testar cadastro, upload, atualização e exibição da capa.

## Paginação do catálogo

- [x] Ajustar a altura do botão Filtrar à altura dos campos de busca e publicação.
- [x] Remover rolagem vertical interna da listagem e usar rolagem normal da página.
- [x] Implementar paginação no servidor, 25 cursos por página, preservando busca e status.
- [x] Posicionar a navegação abaixo da tabela e limitar os números de páginas visíveis.
- [x] Validar listagem por build, tipos e lint; validar visualmente com mais de 25 registros após inserção de dados de catálogo no ambiente de demonstração.

## Orientação de dimensão da capa

- [x] Confirmar proporção visual da capa nos componentes da plataforma.
- [x] Informar 16:9 e resolução recomendada de 1920 × 1080 px no formulário, mantendo os limites atuais de tipo e tamanho.
- [x] Preservar proporção 16:9 na capa do cartão, remover zoom no hover e usar otimização responsiva com qualidade máxima.
- [ ] Conferir visualmente a imagem cadastrada em resolução comum e tela de alta densidade após atualização do cartão.

## Ajustes da página de estrutura do curso

- [x] Renomear “Estrutura do curso” para “Módulos do curso”.
- [x] Exibir somente ícones nos botões de configurações do curso e adicionar módulo, preservando nomes acessíveis e tooltips.
- [x] Ampliar a área centralizada da estrutura e reservar largura para os controles de ordenação dos módulos.
- [ ] Conferir visualmente em tela ampla e estreita que a coluna de ordenação não sobrepõe o texto.

## Padrão de imagens aprovado para módulo e conteúdo

- [x] Aprovar o cache limitado de URLs assinadas e a qualidade 90 como padrão para imagens de curso, módulo e conteúdo.
- [x] Reutilizar esse comportamento para imagens já servidas pela API e registrar a integração com `CourseImage` na plataforma web.
- [ ] Garantir que os futuros formulários administrativos de módulo e conteúdo usem o mesmo endpoint de upload, bucket e `Cache-Control` de uma hora.
