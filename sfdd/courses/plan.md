# Página de curso do aluno — Plano técnico

## Status

Plano e implementação inicial concluídos preservando o texto original de
`spec.md`; a revisão atual acrescenta somente os comportamentos definidos pelo
usuário. A migração foi aplicada ao banco Supabase configurado em 05/10/2026. Um
seed idempotente criou
três cursos de exemplo, cada um com dois módulos e três conteúdos publicados, e
uma matrícula manual ativa por curso apenas para `victorsilvestre@gmail.com`.
Typecheck e lint passaram nos dois aplicativos; testes não foram executados. A
gestão de cursos e matrículas continua pertencendo a unidades posteriores.

Na revisão de 05/10/2026, foram detalhados os comportamentos de grade/lista na
especificação e implementados controles por ícones, busca em modal e listagem
vertical expansível. A revisão atual amplia a busca do curso para títulos e
descrições de módulos e conteúdos publicados, mantendo a validação de acesso na
API. Resultados de módulos levam temporariamente à seção do módulo na própria
página do curso, até existir a tela de conteúdo. O DTO do módulo inclui a
descrição já persistida no banco. Foi corrigido um seletor CSS que cortava a
contagem de progresso ao lado da barra; a descrição já vinha corretamente do
banco e da API. A checagem visual em navegador está pendente porque nenhum
navegador está conectado à sessão.

Conteúdo é a unidade comum do curso; aula, quiz, exercício e prova são tipos
futuros dessa unidade. Cursos adquiridos dão acesso sem prazo de expiração. Quiz,
exercício e prova continuam fora da implementação funcional do MVP.

## Escopo e aderência ao MVP

### Grade de módulos

- A grade de módulos usa três colunas em telas largas, duas em telas intermediárias e uma em telas estreitas. A visualização em lista permanece vertical.

Esta unidade entrega a consulta autenticada de um curso adquirido, seus módulos,
conteúdos publicados, progresso, retomada e pesquisa. O modelo representa
conteúdos de forma extensível, mas esta primeira implementação só atende os
tipos já cobertos pelo MVP. Novos tipos e suas regras próprias entram em unidades
futuras.

O acesso será verificado no servidor por uma matrícula ativa associada ao aluno
e ao curso. Não haverá `expiresAt` nem cálculo de vigência temporal nesta etapa.
A origem da matrícula será registrada para permitir integração futura com compra,
convite e concessão manual; processamento de pagamentos e criação/gestão de
matrículas não fazem parte desta unidade.

## Aplicações e arquitetura afetadas

### Web — `apps/web`

- Criar `/courses/[courseId]` e a rota mínima de leitura do conteúdo usado para
  retomar estudos (`/courses/[courseId]/contents/[contentId]`) sob
  `app/(student)/`.
- A página Server Component obtém a sessão e chama a API com o token existente.
  A API revalida identidade, papel e acesso; a checagem do frontend é apenas
  navegação e apresentação.
- Manter os componentes exclusivamente em `apps/web/components/`, organizados
  nas categorias existentes (`authentication`, `forms`, `ui`, `navigation`).
  A página compõe breadcrumb, cabeçalho/retomada, pesquisa, resumo de progresso
  e módulos. Busca e alternância grade/lista ficam em ilhas Client Component
  pequenas; listas e conteúdo inicial permanecem Server Components sempre que
  possível.
- Colocar estilos em CSS Modules sob `components/ui/` e não criar pastas de
  componentes dentro das rotas.
- O breadcrumb volta ao curso e ao início do aluno. Pesquisa de módulos e
  conteúdos envia o termo à API por uma Server Action; não filtra somente dados
  carregados no navegador.
  O acionador usa ícone de lupa ao lado dos controles de grade/lista e abre um
  `<dialog>` nativo com campo, botão de pesquisa, estados de carregamento/erro/
  vazio e resultados. A API consulta títulos e descrições dos módulos e
  conteúdos publicados do curso autorizado. Cada resultado de conteúdo abre o
  conteúdo; cada resultado de módulo navega à sua seção na página do curso até
  que exista uma tela própria.
- Os controles de visualização mostram ícones SVG minimalistas com rótulos
  acessíveis. A grade exibe somente imagem, título, descrição e progresso dos
  módulos. A lista empilha cada módulo em uma coluna e apresenta seus conteúdos
  abertos por padrão dentro de `<details>`, permitindo expandir/recolher por
  módulo.
- A rota mínima de conteúdo é necessária para tornar “Retomar estudos” e os links
  da pesquisa funcionais. Ela exibe aula/material publicado, recurso http(s)
  opcional e ação explícita de conclusão; não implementa player especializado,
  quiz, exercício ou prova.
- Implementar estados de carregamento, sem conteúdo, erro, curso não encontrado
  e acesso negado, sem revelar existência de curso privado a usuários sem acesso.

### API — `apps/api`

Manter o monólito modular e criar apenas as partes necessárias:

- `course`: leitura autorizada do resumo do curso, módulos/conteúdos publicados
  e pesquisa por título/descrição dentro do curso.
- `access`: consulta de matrícula ativa do usuário autenticado para o curso.
- `progress`: registro de último acesso e conclusão por conteúdo e consulta dos
  totais/progresso usados pela página.
- Reutilizar a validação de bearer token e perfil do módulo de autenticação.
  A identidade do aluno vem do token validado; nenhum endpoint aceita `userId`
  do navegador para escolher a matrícula ou o progresso consultado.
- A rota de detalhe retorna somente cursos publicados e matrículas ativas. A
  ausência de matrícula e curso inexistente têm resposta indistinguível para
  impedir enumeração. Conteúdos não publicados não aparecem em resumo, busca,
  acesso direto nem contagens.
- Não criar fluxo de pagamento, tela de gestão de curso, quiz, exercício, prova,
  assinatura ou expiração.

### Persistência — Prisma/PostgreSQL

Acrescentar relações para `Course`, `CourseModule`, `CourseContent`, `Enrollment`
e `ContentProgress`, mantendo `UserProfile` como raiz de identidade local:

```text
UserProfile 1 ── * Enrollment * ── 1 Course
Course 1 ── * CourseModule 1 ── * CourseContent
UserProfile 1 ── * ContentProgress * ── 1 CourseContent
```

- Cursos, módulos e conteúdos têm estado de publicação e posição ordenável.
- Cada conteúdo tem tipo e metadados comuns (título, descrição, posição). Os
  tipos suportados nesta entrega são apenas os já necessários ao MVP; a estrutura
  permite adicionar tipos depois sem criar tabelas por tipo.
- A descrição do módulo é incluída no DTO de leitura para apresentação em ambos
  os modos; o campo já existe no schema e não exige migração.
- Matrícula representa o direito adquirido, tem origem e estado ativo/revogado,
  sem data de expiração. Um índice único por aluno/curso evita matrículas
  duplicadas.
- O progresso é único por aluno/conteúdo, guarda último acesso e conclusão. A
  porcentagem usa conteúdos publicados do curso/módulo no denominador e
  conteúdos concluídos no numerador. Curso/módulo sem conteúdo exibem 0% sem
  divisão por zero.
- Criar migração Prisma revisável. Dados demonstrativos só podem ser inseridos
  em ambiente autorizado pelo usuário; os três cursos atuais foram gravados no
  Supabase configurado para uso do tester.

## Contratos previstos

- `GET /courses`: cursos publicados aos quais o usuário autenticado tem matrícula
  ativa, para ligar a seção “Meus Cursos” da home a destinos reais.
- `GET /courses/:courseId`: resumo do curso, contagens, módulos publicados,
  progresso por módulo e último conteúdo acessado/concluído.
- `GET /courses/search?query=...`: até cinco resultados de cursos, módulos e
  conteúdos publicados que correspondem a título/descrição, para a busca global
  já visível na home. Curso e matrícula são filtrados no servidor.
- `GET /courses/:courseId/search?query=...`: módulos e conteúdos publicados do
  curso que correspondem a título/descrição; escopo e acesso ao curso são
  revalidados no servidor. Os resultados são combinados e ordenados por
  relevância do título.
- `POST /courses/:courseId/contents/:contentId/open`: registra acesso e
  retorna o conteúdo autorizado para abertura/retomada.
- `POST /courses/:courseId/contents/:contentId/completion`: registra conclusão
  explícita do conteúdo atualmente suportado. Repetir a operação é idempotente.
- DTOs em `packages/contracts` contêm somente dados públicos de apresentação e
  progresso; nunca expõem linhas Prisma nem objetos Supabase.
- Os resultados da pesquisa usam uma união discriminada para diferenciar
  módulos de conteúdos. Resultados de módulo incluem progresso agregado e
  direcionam à âncora do módulo na página atual.
- A descrição do módulo já existia e era corretamente mapeada pela API; o
  problema visual era um seletor CSS genérico que afetava a contagem vizinha da
  barra de progresso. O seletor foi limitado à trilha da barra.
- A home substitui a lista demonstrativa de cursos por `GET /courses`; a busca
  global troca a prévia fictícia por resultados autorizados. Outras seções da
  home ainda identificadas como exemplos permanecem fora desta unidade.

Os contratos devem ser ajustados às convenções encontradas ao implementar os
módulos. Pagamento futuro cria/atualiza matrícula ativa após confirmação; esta
unidade apenas consome o estado de acesso persistido.

## Regras de leitura e progresso

- Decisão técnica desta implementação: `LESSON` e `MATERIAL` são os tipos
  disponíveis no recorte atual e ambos entram na contagem do progresso. A
  conclusão é uma ação explícita do aluno; acessar o material não conclui
  automaticamente. Novos tipos exigem definir sua regra antes de entrar na
  contagem funcional.
- Considerar um conteúdo concluído quando houver `completedAt`, gravado por uma
  ação autenticada do aluno. Abrir/retomar conteúdo atualiza `lastAccessedAt`,
  mas não conclui automaticamente.
- A retomada escolhe o registro de progresso com maior `lastAccessedAt` dentro
  do curso, inclusive se o conteúdo já foi concluído. Se não houver acesso
  anterior, não exibir a ação de retomada.
- A listagem e a busca incluem conteúdo publicado pertencente ao curso e omitem
  rascunhos. A navegação direta repete todas as verificações de acesso.
- Enquanto apenas os tipos de conteúdo já cobertos pelo MVP existirem, as
  contagens são calculadas sobre eles. Tipos futuros entram automaticamente nas
  contagens somente quando suas regras de publicação e conclusão forem definidas.

## Wireframe

`wireframe.html` é a referência de baixa fidelidade, em escala de cinza, com
conteúdo fictício. Ele descreve hierarquia e interação sem depender de APIs,
autenticação ou banco de dados.

## Riscos técnicos

- Os módulos de consulta de curso, acesso e progresso e a migração aditiva foram
  criados; a migração está aplicada no Supabase configurado e a base de teste
  contém três cursos publicados com matrículas do tester.
- Ainda não há fluxo de pagamento nem de matrícula. A leitura real só mostrará
  cursos quando houver uma matrícula ativa criada pelo mecanismo de acesso
  autorizado do sistema; nenhum fallback de mock deve contornar essa regra.
- Progresso percentual tem de usar o mesmo conjunto de conteúdos no numerador e
  denominador, aplicando publicação e acesso no servidor.
- Curso inexistente e curso sem acesso devem resultar em experiência indistinta
  para evitar vazamento de metadados.
- A origem da matrícula deve ser compatível com futura confirmação de pagamento,
  mas pagamentos e revogação por estorno ficam fora desta unidade.

## Decisão sobre identificadores

Decisão confirmada pelo usuário: manter `UserProfile.id` como UUID, pois essa
chave acompanha a identidade do Supabase Auth. Cursos, módulos, conteúdos,
matrículas e registros de progresso usarão IDs inteiros sequenciais como chaves
primárias e referências entre tabelas. Essa será também a convenção para novas
entidades de negócio internas do TraderLab. Os contratos JSON e as rotas
receberão esses IDs como números; a autenticação continua usando o UUID do
perfil e identificadores próprios de provedores externos permanecem como vierem
da integração.

A migração atribui novos números de forma determinística pela data de criação e
pelo ID anterior, atualiza as chaves estrangeiras e preserva os registros e suas
relações. Os valores das URLs atuais mudarão; links que contenham os antigos
CUIDs deixam de ser válidos. Os seeds não podem depender de IDs fixos: devem
localizar os registros pelos dados estáveis do exemplo e usar os IDs retornados
pelo banco. A API continua revalidando papel, matrícula e acesso ao recurso; o
formato numérico não substitui autorização.

A migração `20261005190000_sequential_internal_ids` foi aplicada ao Supabase
configurado após autorização do usuário. O Prisma confirmou que o schema está
em dia. A conferência somente leitura encontrou 3 cursos, 6 módulos, 9
conteúdos e 3 matrículas, sem relações órfãs; os três cursos continuam ativos
para o usuário tester e receberam IDs 1, 2 e 3. Todas as chaves internas e
referências consultadas agora são `integer`. Não havia registros de progresso a
preservar no momento da migração. A navegação ainda deve ser atualizada no
navegador para confirmar visualmente a experiência com as novas URLs.

## Validação prevista

- Cobrir autorização de estudante, matrícula ativa, curso/conteúdo publicado e
  isolamento de progresso por usuário.
- Cobrir cálculo de progresso, curso/módulo sem conteúdos, retomada e busca sem
  resultados.
- Validar estados de acesso negado/curso indisponível, responsividade, teclado e
  leitor de tela.
- Executar typecheck, lint, testes e build dos pacotes afetados quando a etapa de
  implementação estiver concluída e autorizada para validação.


## Navegação por módulo

A capa e o título de cada módulo apontam para o primeiro conteúdo publicado desse módulo. Os links permanecem no cabeçalho do módulo nos modos grade e lista. Módulos sem conteúdo publicado não oferecem esses links. O destino continua protegido pela validação de acesso existente na abertura do conteúdo.

## Padrão aprovado de imagens de cursos, módulos e conteúdos — 07/10/2026

- O bucket `traderlab-course-images` permanece privado. O banco persiste o caminho do objeto, e a API só gera URL assinada depois de validar o acesso ao curso.
- O adaptador `SupabaseCourseImageStorage` atende capas de cursos, imagens de módulos e imagens de conteúdos. Ele reutiliza por caminho a mesma URL assinada por até 50 minutos, renova com margem antes do vencimento de uma hora, compartilha chamadas simultâneas e mantém no máximo 1.000 caminhos em memória por processo.
- Os caminhos usam UUID; substituir uma imagem cria outro caminho e invalida a associação anterior sem depender de limpeza de cache.
- Uploads novos devem definir `Cache-Control` de uma hora. O fluxo administrativo de capa já aplica essa configuração; os futuros formulários de módulo/conteúdo devem reutilizar o mesmo bucket e as mesmas opções de upload.
- `CourseImage` centraliza a exibição com `next/image`, `sizes` responsivos e qualidade 90. A arte usa `object-fit: contain` para evitar corte de texto incorporado. URLs legadas seguem o fallback atual até serem substituídas por arquivos do Storage.
- O detalhe do curso e as capas de módulo já usam `CourseImage`. A API já retorna URLs assinadas para imagens de conteúdo, mas a interface ainda não tem uma região visual aprovada para exibi-las; quando ela for definida, deve reutilizar `CourseImage`.
- A aprovação visual da capa na home confirma o padrão de leitura/cache e qualidade. Detalhe do curso e módulos ainda precisam de conferência visual desktop/mobile. Avatar permanece fora desta decisão.
