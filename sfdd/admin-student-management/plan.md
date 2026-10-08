# Gestão de alunos no admin — Plano técnico

## Escopo e arquitetura

Esta fase implementa leitura administrativa no módulo existente
`apps/api/src/modules/user`; não cria novo serviço nem altera persistência sem
necessidade demonstrada. Criação de conta e matrícula ficam para fase posterior.

## Aplicações e rotas

### `apps/admin`

- Adicionar o item `/users` com rótulo “Alunos” antes de “Cursos” em
  `WorkspaceNavigation`, visível apenas para administradores nesta fase.
- Criar `/users` para lista, pesquisa e paginação e `/users/[userId]`
  para detalhes.
- Implementar telas com Server Components e helpers em
  `apps/admin/lib/users/`; extrair UI para `components/ui/`.
- A busca envia um termo único ao servidor e preserva query e página nos links.
- Manter o padrão “← Voltar”, largura responsiva e sem overflow horizontal.

### `packages/contracts`

Definir DTOs explícitos para página de usuários, item resumido e detalhes. Não
expor estruturas Prisma ou resposta bruta do provedor de identidade. Incluir
contagem/paginação e relações de matrícula/progresso que a interface realmente
apresenta.

## API e módulo `user`

Adicionar endpoints administrativos, por exemplo:

- `GET /admin/users?query=&offset=&limit=` para busca/listagem paginada de
  todos os perfis e seus papéis.
- `GET /admin/users/:userId` para dados do perfil, matrículas,
  resumo de progresso e notificações do usuário.

A apresentação autentica e exige papel administrador em cada chamada. O caso
de uso valida parâmetros e coordena repositório de perfil com fonte de
identidade, depois mapeia os dados para DTO.

O repositório Prisma não filtra por papel e retorna o papel cadastrado; a busca
por trecho em nome e telefone é feita no banco com comparação sem distinção de
caixa. A paginação é estável e inclui contagem. Matrículas incluem estados
ativos e revogados e são ordenadas por data. Progresso é agregado em resumo, sem
carregar corpos de aula nem materiais.

## Pesquisa do e-mail e identidade

E-mail reside no Supabase Auth e hoje o adaptador atual expõe `listAll()` sem
filtro e sem paginação por termo. A implementação deve evitar enumerar toda a
base para cada consulta. Como a busca parcial por e-mail é requisito, avaliar
persistir uma cópia normalizada no perfil local, sincronizada com Auth, para
permitir busca indexada pelo banco local. Antes de criar migration, definir:

1. Se o campo local será a fonte de leitura e Supabase Auth continuará fonte de
   autenticação e verdade para credenciais.
2. Como preencher e sincronizar cadastro atual, mudanças futuras de e-mail e
   perfis já existentes (backfill controlado).
3. Como tratar conflitos, e-mail ausente e falha de sincronização.
4. Índice apropriado para busca por substring, como `pg_trgm`, somente se a
   busca em `contains` precisar de otimização após medir o volume.

Não assumir que busca prefixada equivale à busca parcial solicitada. E-mail
deve ser normalizado sem distinção de caixa. Falha no provedor de identidade
não deve transformar erro em “nenhum resultado”; retornar erro operacional
claro. A implementação não pode vazar chave administrativa ao navegador.

O cadastro normal cria o perfil local usando o UUID da identidade Supabase
como seu próprio `id`; portanto, perfil sem identidade significa registro
legado/inconsistente e não é o fluxo esperado. A listagem deve manter esses
perfis visíveis e detalhes devem indicar e-mail indisponível.

## Detalhes, autorização e privacidade

- Consultar qualquer papel associado ao usuário. Um perfil sem identidade deve
  continuar visível com e-mail indisponível, pois o cadastro normal usa o mesmo
  UUID em Auth e `UserProfile`.
- Incluir matrículas e progresso do mesmo `studentId`, sem conteúdo privado de
  terceiros.
- Usar storage de avatar para URL temporária/signed URL conforme implementação
  existente.
- Exigir administrador também na camada API; não confiar em menu/rota do admin.
- Não retornar senha, tokens, dados de sessão nem metadados internos.

## Último acesso e compras

Compras ficam fora desta fase e serão tratadas junto ao módulo de pagamentos.
O schema atual não possui entidade de pagamentos/compras.

Adicionar `lastLoginAt` ao `UserProfile`. A migration usa
`auth.users.last_sign_in_at` para preencher o histórico existente. Depois disso,
atualizar `lastLoginAt` no servidor somente após autenticação e validação
bem-sucedidas, tanto para login web quanto workspace. Não atualizar a cada
requisição nem inferir login de `ContentProgress.lastAccessedAt`.

Mudanças de schema para e-mail ou `lastLoginAt` exigem migration aditiva e
backfill quando aplicável. Buscar substring em coleções grandes pode requerer
índice trigram; confirmar por medição, sem antecipar dependência se o volume não
justificar.

## Validação prevista

Consultar `test-plan.md`. Validar papel administrador na API, busca parcial para
cada campo, paginação e ordenação, detalhes isolados por usuário, estados sem
matrícula/progresso/e-mail, acessibilidade, viewport estreito, typecheck, lint,
testes, codificação e `git diff --check`.
