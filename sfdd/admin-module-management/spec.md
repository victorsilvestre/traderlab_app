# Gestão de módulos — Especificação

## Perfil e objetivo

O administrador precisa organizar os módulos de um curso, controlar sua ordem
e publicação e manter os dados e a capa de cada módulo.

## Escopo

- Consultar os módulos no contexto da página de gestão do curso, em sua ordem
  atual, incluindo rascunhos.
- Expandir um módulo para consultar títulos, tipos, publicação e materiais já
  associados aos conteúdos, sem editar aulas ou materiais nesta etapa.
- Cadastrar módulo com título, descrição opcional e capa opcional.
- Editar título, descrição e capa sem alterar o curso ao qual o módulo pertence.
- Reordenar módulos com ações de mover para cima/baixo.
- Publicar e despublicar módulos diretamente.
- Exibir quantidade de conteúdos e um resumo somente para leitura dos itens do
  módulo; a gestão de aulas e materiais será feita em etapa própria.
- Mostrar estados vazio, carregamento, falha, envio, sucesso e confirmação.

## Regras de produto

- Somente administrador autenticado pode consultar ou alterar módulos nesta etapa.
- A API verifica o papel e a relação do módulo com o curso em cada operação.
- Um módulo novo é criado como rascunho e acrescentado ao fim da ordem atual.
- Publicar ou despublicar um módulo não altera o estado do curso nem dos conteúdos.
- Um módulo publicado só aparece na plataforma quando o curso também está
  publicado e o aluno tem acesso ativo a ele.
- Despublicar um módulo o oculta da experiência do aluno junto com seus
  conteúdos; registros e progresso permanecem armazenados.
- A despublicação exige confirmação em modal, antes de qualquer chamada que
  altere o estado.
- A ordem é única dentro do curso. Mover um módulo atualiza a ordem persistida;
  os botões de mover para cima/baixo ficam desabilitados nos limites da lista.
- Não há exclusão de módulos nesta etapa, pois ela poderia remover conteúdos e
  progresso relacionados.
- Título é obrigatório. Descrição e capa são opcionais.
- A capa aceita JPEG, PNG ou WebP até 5 MB. O formulário informa proporção 16:9
  e resolução recomendada de 1920 × 1080 px, sem rejeitar outras dimensões.
- A substituição da imagem cria um novo arquivo versionado e não expõe caminhos
  internos ou credenciais ao navegador.
- A listagem cresce com a página e não cria rolagem interna.

## Critérios de aceite

- Um administrador abre o curso e encontra a lista de módulos no mesmo fluxo.
- A lista mostra nome, descrição, posição, estado, quantidade de conteúdos e
  capa quando houver.
- Ao expandir um módulo, o administrador consulta seus conteúdos em ordem,
  seus tipos e estados; materiais complementares aparecem agrupados sob a aula.
- Um módulo pode ser criado como rascunho, editado, reordenado e publicado.
- Despublicar exige confirmação explícita e informa o impacto para os alunos.
- Módulo de outro curso não pode ser consultado, editado, reordenado ou receber
  upload de imagem por meio de troca de identificadores.
- Falhas de API são apresentadas como erro e não como lista vazia.
- Cursos e matrículas não são alterados pelas operações de módulos.

## Fora desta etapa

- Gestão de aulas, materiais e outros conteúdos.
- Exclusão de módulos.
- Gestão por mentor.
- Edição dos dados gerais do curso dentro da listagem; ela permanece em
  configurações próprias acessadas pelo cabeçalho do curso.
