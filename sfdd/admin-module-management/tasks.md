# Gestão de módulos — Tarefas

## Documentação

- [x] Confirmar aderência ao MVP e restringir esta etapa à visão administrator.
- [x] Definir lista, criação, edição, ordenação, publicação e limites de escopo.
- [x] Criar wireframe grayscale independente de API, banco e autenticação.

## API e contratos

- [x] Criar DTOs administrativos de módulo e lista vinculada ao curso.
- [x] Implementar consulta de curso e módulos com contagem de conteúdos.
- [x] Implementar criação de módulo publicado no fim da ordem.
- [x] Implementar atualização validando associação ao curso e caminho da capa.
- [x] Implementar reordenação transacional com validação da lista completa.
- [x] Proteger todas as rotas com papel administrator.

## Aplicação admin

- [x] Incluir acesso à gestão de módulos na edição do curso.
- [x] Criar lista ordenada, estados vazio/erro e ações de mover para cima/baixo.
- [x] Criar formulários de módulo novo e edição com capa opcional.
- [x] Aplicar publicação/despublicação e confirmação modal de impacto.
- [x] Usar o upload e padrão de imagem já aprovado para cursos.
- [x] Unificar a ação principal do formulário em “Salvar” e aplicar o padrão
      administrativo `← Voltar` sem breadcrumbs.
- [x] Manter cada aula em uma linha horizontal com informações à esquerda e
      ações de ícone à direita.
- [x] Deixar materiais recolhidos inicialmente e permitir expandir/recolher por
      aula com estado acessível.
- [x] Atualizar o wireframe para mostrar a linha de aula e os estados dos
      materiais.
- [x] Mover “Criar aula” para a linha do módulo como ícone `+` e remover o
      subtítulo redundante da lista de aulas.
- [x] Mostrar o controle de materiais em todas as aulas, atenuado e desabilitado
      quando vazio, com ícone diferente dos controles de ordenação.
- [x] Manter tooltips em uma linha e posicioná-los acima no fim da lista.

## Validação

- [x] Executar typecheck nos pacotes afetados.
- [x] Executar lint da API e do admin e revisar textos corrompidos.
- [x] Integrar a consulta e as ações de módulo ao construtor do curso.
- [ ] Conferir autorização e isolamento de módulos entre cursos.
- [x] Conferir persistência da ordem e estados de publicação.
- [ ] Validar visualmente lista e formulários em desktop e mobile.
- [ ] Validar visualmente linha de aula e expansão dos materiais em desktop e
      mobile.
- [ ] Confirmar que a linha horizontal cabe em larguras estreitas sem barra de
      rolagem e que as ações continuam alcançáveis.
- [x] Conferir que despublicar não apaga conteúdos ou progresso.
