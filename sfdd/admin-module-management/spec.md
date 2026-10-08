# Gestão de módulos — Especificação

## Perfil e objetivo

O administrador precisa organizar os módulos de um curso, controlar sua ordem
e publicação e manter os dados e a capa de cada módulo.

## Escopo

- Consultar os módulos no contexto da página de gestão do curso, em sua ordem
  atual, incluindo rascunhos.
- Expandir um módulo para consultar títulos, tipos, publicação e materiais já
  associados às aulas; oferecer atalhos para as ações de aula previstas na
  gestão de conteúdo.
- Exibir cada aula em uma linha única, com suas informações à esquerda e ações
  representadas por ícones compactos à direita.
- Oferecer a criação de aula pelo ícone `+` na própria linha do módulo.
- Manter um controle de materiais em todas as linhas de aula; ele fica atenuado
  e desabilitado quando a aula não tem materiais, e ativo quando há itens para
  consultar.
- Manter os materiais de cada aula recolhidos inicialmente, com um controle
  visualmente distinto dos botões de ordenação para expandir ou recolher a lista.
- Cadastrar módulo com título, descrição opcional e capa opcional.
- Editar título, descrição e capa sem alterar o curso ao qual o módulo pertence.
- Reordenar módulos com ações de mover para cima/baixo.
- Publicar e despublicar módulos diretamente.
- Exibir quantidade de conteúdos e um resumo dos itens do módulo; a edição
  detalhada da aula e a gestão de materiais permanecem em suas telas próprias.
- Mostrar estados vazio, carregamento, falha, envio, sucesso e confirmação.

## Regras de produto

- Somente administrador autenticado pode consultar ou alterar módulos nesta etapa.
- A API verifica o papel e a relação do módulo com o curso em cada operação.
- Um módulo novo é publicado ao salvar e acrescentado ao fim da ordem atual.
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
- As informações e ações de cada aula permanecem na mesma linha; os controles
  usam ícones sem texto visível e nomes acessíveis.
- A linha do módulo reúne criar aula, editar, publicar/despublicar e recolher;
  não há uma faixa redundante de título para a lista de conteúdos.
- Os materiais começam recolhidos em cada aula e só aparecem após a ação de
  expandir; o controle indica seu estado com `aria-expanded`. A ação continua
  visível e desabilitada quando a aula não possui materiais.
- Um módulo pode ser criado publicado, editado, reordenado e despublicado.
- O formulário oferece uma única ação principal “Salvar”; salvar uma edição
  publica o módulo. A ação explícita de despublicar continua disponível.
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
