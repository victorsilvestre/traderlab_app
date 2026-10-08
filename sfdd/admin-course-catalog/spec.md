# Catálogo de cursos administrativos — Especificação

## Status

Primeira funcionalidade do ambiente administrativo para o papel administrador.
Esta entrega cobre consultar, cadastrar, editar e publicar/despublicar cursos.
A gestão de módulos, aulas e materiais será detalhada em uma etapa própria do
mesmo fluxo.

## Perfil e objetivo

O administrador precisa manter o catálogo de cursos do TraderLab em um espaço
protegido. Ele deve reconhecer rapidamente os cursos existentes, seu estado e
as ações disponíveis.

## Escopo desta entrega

- Listar cursos cadastrados, incluindo rascunhos e publicados.
- Pesquisar por título e filtrar pelo estado de publicação.
- Exibir 25 cursos por página, com paginação abaixo da tabela e rolagem natural da página.
- Cadastrar curso com título, descrição e upload opcional da imagem de capa.
- Editar esses dados sem perder o estado atual.
- Publicar e despublicar diretamente, sem etapa de aprovação.
- Mostrar estados vazios, carregamento, falha e sucesso.
- Registrar o administrador autenticado como autor do curso.

## Regras

- Somente um perfil autenticado com papel administrator pode consultar ou
  alterar o catálogo administrativo.
- A autorização é conferida pela API em cada requisição.
- Cursos novos são publicados ao salvar. Edições também salvam como publicados;
  para retirar o curso da área do aluno, o administrador usa a ação explícita de
  despublicar.
- Publicar torna o curso elegível para aparecer na plataforma conforme as
  regras de acesso e matrícula já existentes.
- Despublicar remove o curso da experiência de aprendizagem sem apagar dados.
- Não há exclusão de cursos nesta entrega; apagar um curso pode remover módulos,
  aulas, materiais, matrículas e progresso em cascata.
- Campos obrigatórios: título e descrição. A capa é opcional e enviada pelo painel em JPEG, PNG ou WebP, até 5 MB. O formulário informa proporção 16:9 e resolução recomendada de 1920 × 1080 px; outras dimensões podem ser recortadas na plataforma.
- A despublicação pede confirmação em modal; o modal explica que o curso deixa de aparecer aos alunos e que matrículas, dados e progresso permanecem.
- A listagem usa ícones compactos para editar, publicar/despublicar, filtrar e criar curso; cada ação possui rótulo ao passar o mouse e nome acessível.
- Na página de estrutura do curso, a seção é identificada como “Módulos do curso”. Configurações e criação de módulo usam botões minimalistas somente com ícone, com nome acessível e tooltip em uma linha.
- A área de trabalho da estrutura permanece centralizada e pode ocupar até 1320 px; a coluna de ordenação do módulo reserva largura própria para que os ícones não se sobreponham ao título ou à descrição.
- O botão de filtro tem a mesma altura dos campos de busca e publicação. A tabela não possui rolagem vertical própria.
- No cartão de curso, a capa mantém a proporção 16:9, sem zoom ou recorte no hover, para preservar textos e detalhes incorporados à arte.
- O catálogo exibe título, estado, quantidade de módulos e última atualização
  quando esses dados estiverem disponíveis.

## Critérios de aceite

- Um administrador pode abrir /courses e consultar todos os cursos.
- Busca e filtro atualizam a listagem sem expor dados de rascunho fora do admin.
- Cada página contém até 25 resultados filtrados; a navegação mantém os critérios de busca e estado.
- Criar curso persiste os campos e o curso aparece como publicado.
- Editar preserva os campos não alterados e publica o curso ao salvar.
- O formulário apresenta uma única ação principal chamada “Salvar”.
- Publicar/despublicar atualiza o banco e a listagem.
- Perfil sem autorização recebe 403 mesmo chamando a API diretamente.
- Falhas de API são apresentadas com uma ação de tentar novamente; não são
  confundidas com catálogo vazio.
- A tela do curso identifica a seção como “Módulos do curso” e mantém os botões de configurações e adicionar módulo somente com ícones e rótulos acessíveis.
- Em larguras amplas, a estrutura usa uma área centralizada de até 1320 px e os controles de ordenação não cobrem o texto do módulo.

## Fora desta entrega

- Criar, editar, ordenar ou publicar módulos, aulas e materiais.
- Gestão de módulos, aulas, seus formulários de imagem e materiais; os campos e a infraestrutura de armazenamento de imagem ficam preparados para essa etapa.
- Exclusão de cursos.
- Matrículas, alunos, pagamentos, notificações, banners e relatórios.
- Contas, configurações gerais e permissões.
