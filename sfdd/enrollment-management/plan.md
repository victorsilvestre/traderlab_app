# Plano técnico — Gestão de matrículas

## Limites arquiteturais

- Feature faz parte do MVP, autorizada pelo usuário.
- O schema Prisma já contém `Enrollment`, `EnrollmentSource.MANUAL`, `EnrollmentStatus.ACTIVE`, `grantedAt` e unicidade por usuário/curso. Não é necessária migration para o escopo aprovado.
- Não remover estados preexistentes do modelo. A gestão desta entrega não expõe mutações de matrícula existente.

## API (`apps/api`)

- Criar o módulo `enrollment` com domínio/contrato do repositório, serviço de aplicação, repositório Prisma e rotas Fastify.
- Expor consulta paginada `GET /admin/enrollments` com busca parcial sobre nome, e-mail, telefone e curso, filtros por `courseId` e estado.
- Expor pesquisa de usuários existentes, incluindo todos os papéis, cursos para filtros da listagem e uma relação separada de cursos publicados para o formulário.
- Expor `POST /admin/enrollments`, recebendo `userId` e `courseId`; exigir administrador, validar perfil/curso publicado e criar `ACTIVE` + `MANUAL`.
- Mapear erros de domínio no handler central da API; tratar corrida de duplicidade de forma segura via chave única do banco.
- A concessão passa a valer imediatamente. A autorização de acesso existente continua sendo a fonte da verdade.
- Não armazenar ator concessor nesta versão: o schema atual não possui esse campo; auditoria foi excluída do escopo.

## Contratos compartilhados

- Adicionar DTOs para linha/lista paginada, opções para matrícula e entrada de criação em `packages/contracts`.
- Não expor registros Prisma ou tipos de framework através do contrato.

## Admin (`apps/admin`)

- Adicionar menu administrativo **Matrículas** entre **Alunos** e **Cursos**.
- Criar páginas `/enrollments` e `/enrollments/new`, API BFF autenticada e componentes em `components/ui/` e `components/forms/` conforme responsabilidades existentes.
- Tabela com busca, filtro de curso/situação, paginação e links para aluno/curso.
- Formulário de criação com busca de usuário existente e seletor de curso publicado; suportar `userId`/`courseId` via query string para pré-seleção.
- Adicionar atalhos no detalhe do aluno e na gestão do curso.
- Proteger páginas no layout administrativo e validar novamente o papel no endpoint da API.
- Seguir o padrão visual existente, layout sem rolagem horizontal e navegação vertical padronizada.

## Dados e compatibilidade

- Sem alteração de banco/migration: os campos e constraints já dão suporte ao fluxo.
- Registros legados revogados, se existirem, são apenas consultáveis. A chave única impede criar uma segunda matrícula ou converter silenciosamente uma antiga em ativa.
- Nenhuma mudança necessária em `apps/web`: matrícula ativa em curso publicado já é reconhecida pela verificação de acesso.

## Riscos e decisões

- Os papéis são retornados dinamicamente em forma legível, evitando restringir a inclusão aos estudantes.
- A unicidade existente torna impossível coexistirem duas linhas para o mesmo par, mesmo após status revogado. O sistema deve informar conflito sem reativar.
- A busca e as opções de usuários devem ser servidas pela API, nunca filtradas apenas no cliente.
