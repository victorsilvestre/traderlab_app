# Fundação da aplicação administrativa — Plano técnico

## Sequência administrativa registrada

1. Catálogo de cursos e estrutura de conteúdo; primeira fatia em
   `sfdd/admin-course-catalog`.
2. Consulta de alunos e matrículas usando autenticação, perfil e tabela de
   matrículas existentes, com API administrativa própria.
3. Gestão de notificações e banners aproveitando os modelos e serviços existentes.
4. Pagamentos depois de especificar e implementar o modelo de dados e a
   integração correspondente; hoje não há entidade ou módulo de pagamento.

Cada área terá seu próprio SFDD antes da implementação. A prioridade poderá ser
reordenada conforme a validação do produto.

## Refinamento visual provisório

O admin reutiliza a paleta verde e os neutros da plataforma web por meio de
tokens próprios em `apps/admin/app/globals.css`. Os CSS Modules do login,
estados de sessão e workspace aplicam esses papéis de cor; a marca “T” usa a
mesma forma da plataforma. Ícones SVG simples identificam apenas ações reais.
O wireframe permanece em escala de cinza e a navegação continua limitada às
rotas já implementadas.

## Base existente e decisão arquitetural

Antes desta unidade, o monorepo continha `apps/web` (Next.js 16), `apps/api`
(Fastify), `packages/contracts` e o workspace pnpm `apps/*`. A API usa Supabase Auth para
identidade, Prisma/PostgreSQL para perfis e dados do produto, e Supabase Storage
para arquivos. O perfil já distingue `STUDENT`, `MENTOR` e `ADMINISTRATOR`.

Esta unidade cria `apps/admin` como **segunda aplicação Next.js** no mesmo
repositório. `apps/web` atende a plataforma TraderLab; `apps/admin` atende o
ambiente de gestão. Ambas usam a API e os contratos existentes. Não se cria
outro backend, projeto Supabase ou banco de dados.

```text
admin.traderbrunoborges.com.br      -> apps/admin ─┐
                                                   ├-> apps/api -> Supabase Auth
traderlab.traderbrunoborges.com.br  -> apps/web ───┘             -> PostgreSQL/Prisma
                                                                -> Supabase Storage
```

A implantação terá dois serviços ou projetos web, cada um com seu diretório
raiz, domínio e variáveis. A escolha do provedor de hospedagem e a configuração
real de DNS ficam para uma unidade operacional posterior.

## Limites desta fundação

A fundação entrega o aplicativo executável, layout e página inicial de gestão.
Entrada, saída, sessão, recuperação e barreira por papel são detalhadas em
`sfdd/admin-authentication` e serão integradas à fundação. A página inicial
contém somente a estrutura de navegação para funções efetivamente
implementadas. CRUD, publicação, consulta administrativa e regras de
propriedade entram em unidades SFDD por fluxo.

## Organização proposta

```text
apps/
  web/                 plataforma TraderLab
  admin/               aplicação administrativa Next.js
    app/               rotas, layouts e composição das páginas
    components/        autenticação, UI e navegação do admin
    lib/               sessão, acesso à API e mapeamento de DTOs
    public/            recursos públicos próprios
  api/                 autenticação e regras de negócio compartilhadas
packages/
  contracts/           DTOs compartilhados
sfdd/
  admin-foundation/    esta unidade
```

Em `apps/admin`, usar App Router e Server Components por padrão. As rotas
resolvem sessão e compõem a página; componentes interativos ficam em subárvores
cliente pequenas. Estilos específicos permanecem locais. Contratos comuns
ficam em `packages/contracts` apenas quando cruzam fronteiras; componentes
visuais não devem ser compartilhados prematuramente entre as aplicações.

## Autenticação e sessões

- Reaproveitar o Supabase Auth e a API de autenticação existentes. O papel vem
  de `user_profiles`, consultado pela API após validar o token.
- Criar o fluxo de login do admin com persistência de sessão SSR em cookies do
  próprio host, sem expor tokens na resposta ao navegador. Conferir a técnica
  efetivamente usada por `apps/web` antes de adaptá-la.
- Manter cookies restritos ao host de cada aplicação; não configurar
  `Domain=.traderbrunoborges.com.br`. Confirmar o comportamento de renovação e
  saída nas duas aplicações.
- A entrada administrativa exige um caso de uso próprio na API, conforme
  `sfdd/admin-authentication`, que só devolve sessão para perfis de gestor já
  persistidos. Rotas e layout protegidos consultam novamente a API para
  confirmar papel; uma checagem no navegador ou no Proxy não substitui isso.
- Usar destinos de retorno internos validados; nunca aceitar uma URL externa
  fornecida na query como destino de login.
- Definir recuperação de senha e callbacks de e-mail para os dois hosts com
  origens explicitamente permitidas. A API usa hoje `WEB_APP_URL` fixo para
  esses links; adaptar esse ponto sem permitir redirecionamento aberto. O
  cadastro público continua criando somente aluno na plataforma.
- Provisionar perfis de mentor e administrador por um procedimento autorizado
  e restrito, a ser especificado em unidade própria. A fundação usa contas já
  existentes e não adiciona uma rota pública para promovê-las.

## API e autorização

- A API hoje aceita apenas `WEB_APP_URL` em CORS. Passar a aceitar as duas
  origens web por lista explícita de configuração; validar o caso local com
  hosts distintos. Endpoints sem uso de navegador direto podem continuar
  sendo chamados pelo servidor de cada aplicação.
- Criar um ponto reutilizável de verificação de papéis na API apenas se for
  necessário para rotas reais da fundação. Para futuras operações de gestão,
  a API deve verificar `mentor` ou `administrator` e, no caso do mentor, a
  responsabilidade pelo recurso dentro do caso de uso apropriado.
- Não dar ao admin acesso ao banco, ao Prisma ou a chaves de serviço. Cada tela
  administrativa consulta a API com token válido.
- A API de cursos, progresso e banners atualmente exige `student`; a web
  também redireciona outros perfis. O requisito de um administrador entrar na
  plataforma do aluno exige uma unidade de acesso/visualização própria para
  definir catálogo, aulas, matrícula e progresso antes de alterar essas rotas.

## Domínios e configuração

- Produção: `admin.traderbrunoborges.com.br` aponta para `apps/admin` e
  `traderlab.traderbrunoborges.com.br` para `apps/web`.
- Desenvolvimento: usar hosts locais distintos para web e admin, além de
  portas próprias se necessário. Cookies não são isolados por porta quando o
  host é o mesmo. Ambos apontam para a API local e o mesmo projeto Supabase de
  desenvolvimento.
- Documentar exemplos de variáveis para URL da API, URL/chave publicável do
  Supabase e origens permitidas. Segredos ficam apenas em `apps/api`.
- Configurar no Supabase somente os callbacks de autenticação necessários para
  cada aplicação, sem curingas abrangentes.
- A configuração do ambiente de produção exige HTTPS e origens exatas.

## Impacto na documentação existente

`AGENTS.md` foi atualizado para refletir `apps/admin` e suas responsabilidades.
A especificação de autenticação pública recebeu uma nota de evolução que
preserva o histórico do fluxo já implementado e aponta para
`sfdd/admin-authentication`.

## Riscos e decisões em aberto

- A mudança de origem dos callbacks pode afetar confirmação e recuperação de
  senha; revisar esses fluxos antes da implantação.
- A persistência de cookies SSR atual usa detalhes da biblioteca Supabase;
  confirmar compatibilidade e isolamento por host na implementação.
- A concessão inicial dos papéis de gestor precisa de procedimento auditável;
  não deve depender de alteração manual improvisada em produção.
- O administrador na plataforma TraderLab é uma capacidade desejada, mas
  ainda não tem semântica definida para matrícula e progresso.
- A página inicial de gestão é uma estrutura de navegação, não um dashboard
  analítico. Dados e indicadores dependem de unidades de produto próprias.
