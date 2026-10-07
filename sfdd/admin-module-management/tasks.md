# Gestão de módulos — Tarefas

## Documentação

- [x] Confirmar aderência ao MVP e restringir esta etapa à visão administrator.
- [x] Definir lista, criação, edição, ordenação, publicação e limites de escopo.
- [x] Criar wireframe grayscale independente de API, banco e autenticação.

## API e contratos

- [x] Criar DTOs administrativos de módulo e lista vinculada ao curso.
- [x] Implementar consulta de curso e módulos com contagem de conteúdos.
- [x] Implementar criação de módulo como rascunho no fim da ordem.
- [x] Implementar atualização validando associação ao curso e caminho da capa.
- [x] Implementar reordenação transacional com validação da lista completa.
- [x] Proteger todas as rotas com papel administrator.

## Aplicação admin

- [x] Incluir acesso à gestão de módulos na edição do curso.
- [x] Criar lista ordenada, estados vazio/erro e ações de mover para cima/baixo.
- [x] Criar formulários de módulo novo e edição com capa opcional.
- [x] Aplicar publicação/despublicação e confirmação modal de impacto.
- [x] Usar o upload e padrão de imagem já aprovado para cursos.

## Validação

- [x] Executar typecheck nos pacotes afetados.
- [x] Executar lint da API e do admin e revisar textos corrompidos.
- [x] Integrar a consulta e as ações de módulo ao construtor do curso.
- [ ] Conferir autorização e isolamento de módulos entre cursos.
- [ ] Conferir persistência da ordem e estados de publicação.
- [ ] Validar visualmente lista e formulários em desktop e mobile.
- [ ] Conferir que despublicar não apaga conteúdos ou progresso.
