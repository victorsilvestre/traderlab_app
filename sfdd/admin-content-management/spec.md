# Gestão de aulas e materiais complementares — Especificação

## Status

Implementação em andamento. A coluna `course_contents.image_path` já existe,
foi introduzida pela migration `20261007120000_add_course_image_paths` e o banco
configurado foi verificado como atualizado. Esta unidade conclui o fluxo de
capas e miniaturas em todas as aplicações.

## Perfil e objetivo

O administrador precisa criar e manter aulas de um módulo e anexar materiais
complementares que os alunos consigam consultar na aula. Deve conseguir
conferir como o conteúdo ficará organizado e publicado sem perder a relação com
o curso e o módulo.

## Escopo

- Criar e editar uma aula dentro do módulo selecionado.
- Informar título obrigatório, descrição opcional, texto principal e URL de vídeo
  opcional do YouTube.
- Adicionar uma imagem de capa obrigatória antes de salvar a aula. Usar JPEG,
  PNG ou WebP até 5 MB, com proporção recomendada de 16:9.
- Formatar o conteúdo da aula com negrito, itálico, sublinhado, parágrafos e
  títulos em níveis distintos; a leitura do aluno deve preservar essa estrutura.
- Associar zero ou mais materiais complementares à aula, cada um com nome,
  descrição opcional e arquivo para download.
- Consultar materiais existentes em uma lista resumida e usar ações explícitas
  para adicionar um novo material ou editar um material selecionado.
- Consultar aulas e materiais complementares no construtor integrado do curso,
  preservando a ordem de consumo existente.
- Visualizar a capa do módulo antes do título e a capa da aula como primeira
  informação da linha no construtor administrativo.
- Reordenar aulas dentro do módulo e materiais dentro da aula.
- Publicar e despublicar aulas diretamente; materiais acompanham a aula e não
  têm publicação independente.
- Mostrar estados de carregamento, vazio, envio, sucesso e erro, com opção de
  tentar novamente quando a operação puder ser repetida com segurança.

## Conceitos e limites

- Uma aula pertence a exatamente um módulo.
- Materiais complementares pertencem a uma aula e são apresentados junto dela.
- Material independente no módulo é outro tipo de conteúdo e fica fora desta
  unidade.
- O MVP permite aulas com vídeo, texto e arquivos complementares. Exercícios,
  avaliações, lives e outros tipos interativos continuam fora do escopo.
- A unidade cobre a experiência do administrador, coerente com as entregas
  atuais do ambiente admin. Gestão por mentor exige definição de escopo e
  autorização em etapa própria; não deve ser inferida desta especificação.
- A exclusão de aulas e materiais não está aprovada. Não oferecer ação destrutiva
  até que impacto em progresso e arquivos seja definido.

## Regras de produto

- Somente administrador autenticado pode consultar ou alterar aulas nesta
  unidade. A API deve revalidar papel e vínculo curso/módulo em cada operação.
- IDs trocados não podem permitir mover, editar, reordenar ou anexar material em
  outro curso, módulo ou aula.
- Uma aula nova entra no fim da ordem do módulo. O registro intermediário fica
  como rascunho durante o upload; ao salvar com a capa associada, a aula é
  publicada. A ação explícita de despublicar a torna indisponível aos alunos sem
  apagar seus dados.
- Publicar uma aula não publica módulo nem curso. O aluno só a recebe conforme
  as regras de publicação e acesso já existentes.
- Despublicar exige confirmação explícita, informa que a aula deixa de aparecer
  aos alunos e preserva conteúdo, materiais e progresso.
- Materiais são privados no armazenamento. O navegador não recebe caminhos
  internos nem URLs permanentes; o download continua condicionado à autorização
  já aplicada ao aluno.
- A lista de materiais mantém uma ordem explícita e cada arquivo fica associado
  a um único registro de material.
- A edição de um material abre seus dados em formulário próprio; a inclusão
  começa com formulário vazio. Salvar/cancelar nesse formulário não se confunde
  com salvar/cancelar a aula. A confirmação do material prepara a alteração na
  aula; a persistência final ocorre ao salvar a aula, e a interface identifica
  materiais novos ou editados ainda pendentes.
- O formulário valida campos obrigatórios e arquivo antes do envio e comunica
  falhas sem apagar valores já preenchidos.
- O editor de conteúdo oferece controles acessíveis para negrito, itálico,
  sublinhado, parágrafo, título e subtítulo. O aluno vê a estrutura aplicada,
  com quebras de linha preservadas.
- Anexos aceitam qualquer extensão, inclusive formatos de ferramentas de
  terceiros como `.ntsl`; novos envios têm limite de 50 MB por arquivo.
- Ao editar um material já salvo, a tela identifica o anexo e seu tamanho. O
  seletor do navegador serve somente para adicionar arquivos novos, pois não
  pode ser preenchido com arquivos já armazenados.
- Materiais antigos acima do limite de novos envios continuam editáveis; alterar
  a descrição ou a ordem não exige reenviar o arquivo.
- O tipo MIME é armazenado como metadado e não é usado para bloquear extensões
  não reconhecidas pelo navegador.
- Capas de aula usam o bucket privado de imagens existente. A API valida
  formato, tamanho, existência do registro e associação do caminho à aula;
  respostas do aluno recebem somente URL assinada curta, sem caminho interno.
- A listagem de aulas na plataforma apresenta miniatura à esquerda, título no
  centro e estado de progresso à direita, centralizado verticalmente. A capa é
  cortada proporcionalmente para formar uma miniatura; aulas antigas sem imagem
  exibem um placeholder até receberem uma capa.
- Texto rico segue a allowlist e os limites de profundidade/nós existentes no
  leitor (`sfdd/contents`); HTML arbitrário não é aceito.
- Substituir ou remover um arquivo retira sua associação com a aula; não apaga
  fisicamente o objeto do Storage nesta primeira versão.
- O bucket privado `traderlab-course-materials` e a leitura por URL assinada
  curta já estão definidos na unidade de consumo de conteúdo.

## Padrões do workspace administrativo

- A página inicial `/` é a entrada do workspace e não exibe controle de voltar.
  Todas as demais telas administrativas secundárias exibem um único link
  `← Voltar` abaixo do cabeçalho global, com destino estável à tela-pai; não
  usam breadcrumbs.
- Formulários de curso, módulo e aula oferecem uma única ação principal
  `Salvar`. A criação inicia publicada e salvar alterações também publica o
  conteúdo. A ação separada de despublicar continua disponível na listagem ou
  no resumo do conteúdo.
- O texto da tela informa que salvar publicará o conteúdo, para que a
  disponibilidade não seja implícita.

## Critérios de aceite

- Um administrador abre um curso, expande um módulo e inicia a criação de uma
  aula nesse módulo.
- A aula salva publicada com título e aceita descrição, texto principal,
  vídeo opcional e zero ou mais materiais complementares.
- O administrador aplica negrito, itálico, sublinhado e títulos de níveis
  diferentes no conteúdo; ao abrir a aula como aluno, a formatação é preservada.
- Linhas digitadas em sequência são exibidas como parágrafos ou quebras de linha,
  sem serem concatenadas.
- Editar uma aula preserva campos e materiais não alterados.
- Materiais já salvos são identificados separadamente do seletor de novos
  arquivos; editar seus metadados não é bloqueado pelo limite de novos envios.
- Novos envios acima de 50 MB e descrições acima de 500 caracteres recebem
  mensagens de validação específicas.
- Materiais podem ser incluídos e ordenados dentro da aula; nome e associação
  são apresentados corretamente no resumo administrativo.
- O usuário identifica os materiais existentes em uma lista e distingue as
  ações “Adicionar material” e “Editar”; os formulários mostram claramente se
  estão criando ou editando e oferecem ações próprias para concluir ou cancelar.
- Todas as telas secundárias do workspace seguem o link `← Voltar` e não usam
  breadcrumbs; a página inicial do workspace é a única exceção.
- Cursos, módulos e aulas recém-criados ficam publicados ao salvar; formulários
  de edição exibem uma só ação `Salvar`, e a despublicação permanece explícita.
- A ordem das aulas e dos materiais persiste após recarregar a página.
- A administração exige uma capa válida ao salvar aula nova ou editar uma aula
  ainda sem imagem; capas existentes são preservadas sem novo upload.
- A API não publica aula sem capa associada; falha no upload deixa o registro
  intermediário como rascunho recuperável.
- A gestão de módulos e aulas mostra miniaturas à esquerda dos respectivos
  títulos, sem sobrepor os controles ou o texto.
- Na lista de aulas do aluno, a miniatura aparece à esquerda, o título no meio
  e os indicadores de concluída/atual à direita, alinhados verticalmente.
- Publicar/despublicar atualiza o estado da aula sem alterar os estados de curso
  ou módulo e sem apagar progresso ou arquivos.
- Sessão inválida recebe 401 e papel sem autorização recebe 403, inclusive em
  chamadas diretas à API.
- Requisições com identificadores de outro curso, módulo ou aula são rejeitadas.
- Falha no envio ou salvamento mostra erro recuperável e mantém os dados do
  formulário sempre que possível.
- O aluno continua recebendo apenas aulas publicadas, dentro de curso e módulo
  publicados e com acesso permitido; downloads continuam autorizados pela API.
- A tela permanece utilizável em desktop e mobile, sem rolagem horizontal e com
  controles acessíveis por teclado.

## Fora desta unidade

- Gestão de material independente do módulo.
- Gestão de conteúdo por mentor e políticas de propriedade do mentor.
- Exclusão de aulas ou materiais.
- Provisionamento de buckets; o bucket de imagens privado já é compartilhado
  com capas de curso e módulo.
- Alterações ao fluxo de matrícula, pagamento, progresso ou consumo do aluno,
  salvo ajustes necessários para compatibilidade com os dados geridos aqui.
