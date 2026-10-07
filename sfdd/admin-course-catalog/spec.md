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
- Cursos novos começam como rascunho.
- Publicar torna o curso elegível para aparecer na plataforma conforme as
  regras de acesso e matrícula já existentes.
- Despublicar remove o curso da experiência de aprendizagem sem apagar dados.
- Não há exclusão de cursos nesta entrega; apagar um curso pode remover módulos,
  aulas, materiais, matrículas e progresso em cascata.
- Campos obrigatórios: título e descrição. A capa é opcional e enviada pelo painel em JPEG, PNG ou WebP, até 5 MB. O formulário informa proporção 16:9 e resolução recomendada de 1920 × 1080 px; outras dimensões podem ser recortadas na plataforma.
- A despublicação pede confirmação em modal; o modal explica que o curso deixa de aparecer aos alunos e que matrículas, dados e progresso permanecem.
- A listagem usa ícones compactos para editar, publicar/despublicar, filtrar e criar curso; cada ação possui rótulo ao passar o mouse e nome acessível.
- O botão de filtro tem a mesma altura dos campos de busca e publicação. A tabela não possui rolagem vertical própria.
- No cartão de curso, a capa mantém a proporção 16:9, sem zoom ou recorte no hover, para preservar textos e detalhes incorporados à arte.
- O catálogo exibe título, estado, quantidade de módulos e última atualização
  quando esses dados estiverem disponíveis.

## Critérios de aceite

- Um administrador pode abrir /courses e consultar todos os cursos.
- Busca e filtro atualizam a listagem sem expor dados de rascunho fora do admin.
- Cada página contém até 25 resultados filtrados; a navegação mantém os critérios de busca e estado.
- Criar curso persiste os campos e o curso aparece como rascunho.
- Editar preserva os campos não alterados e o estado atual.
- Publicar/despublicar atualiza o banco e a listagem.
- Perfil sem autorização recebe 403 mesmo chamando a API diretamente.
- Falhas de API são apresentadas com uma ação de tentar novamente; não são
  confundidas com catálogo vazio.

## Fora desta entrega

- Criar, editar, ordenar ou publicar módulos, aulas e materiais.
- Gestão de módulos, aulas, seus formulários de imagem e materiais; os campos e a infraestrutura de armazenamento de imagem ficam preparados para essa etapa.
- Exclusão de cursos.
- Matrículas, alunos, pagamentos, notificações, banners e relatórios.
- Contas, configurações gerais e permissões.
