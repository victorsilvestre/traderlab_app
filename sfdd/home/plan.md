# Página inicial do aluno — Plano técnico

## Status

Plano atualizado com as decisões de produto recebidas. A primeira entrega da
home usou dados demonstrativos. A seção “Continue Onde Parou” agora lê os
acessos reais do aluno pelo módulo `progress`; cursos e conteúdos são obtidos
com validação de matrícula e publicação. A vitrine de banners lê até cinco
registros publicados do banco. Notificações usam persistência, segmentação e
estado individual de leitura; a criação/envio administrativo fica para uma
unidade futura.

## Escopo e aderência ao MVP

Esta unidade cobre a experiência inicial do aluno autenticado: cabeçalho,
pesquisa de conteúdo, notificações, menu da conta, banners de comunicação,
retomada de estudo e cursos com acesso vigente.

| Necessidade da especificação | Aderência ao MVP e limite |
| --- | --- |
| Menu e avatar | Incluídos. Usar identidade/perfil já autenticados. |
| Pesquisar produtos, módulos e aulas | Incluído como pesquisa de cursos, módulos e aulas, usando o vocabulário do produto. Resultados só podem expor conteúdo publicado e autorizado ao aluno. |
| Caixa de entrada e leitura de notificações | Incluídas no módulo `notification`: mensagens gerais ou por curso, histórico, filtros e estado individual de leitura. Envio por e-mail e tela administrativa não fazem parte desta etapa. |
| Banner com até cinco comunicações | O carrossel consulta `home_banners` e exibe até cinco registros publicados, usando as três imagens de exemplo em `apps/web/public/banners/`, em um quadro responsivo de altura fixa por breakpoint e recorte `cover`. |
| “Continue Onde Parou” | Integrado ao módulo `progress`, para até três conteúdos distintos mais recentemente acessados, em ordem decrescente; links levam ao conteúdo real e o estado vazio orienta o aluno a iniciar os estudos. Não introduzir avaliação, anotação ou recomendação. |
| “Meus Cursos” | Consultar cursos publicados com matrícula ativa do aluno; a API calcula progresso e a home mostra estado vazio ou erro separado. |
| Acessar Perfil | Link para `/profile`, cuja tela fica fora desta unidade e será implementada depois, conforme indicado na especificação. |
| Sair da conta | Reutilizar o logout já implementado no módulo de autenticação. |

## Aplicações e arquitetura afetadas

### Web — apps/web (entrega visual atual)

- Manter app/page.tsx como entrada pública e dispatcher por papel. Alunos autenticados seguem para /home, implementada em app/(student)/home/page.tsx; a rota valida sessão e papel no servidor.
- Usar Server Components como padrão e limitar Client Components às interações locais que precisam de estado ou eventos do navegador.
- Manter todos os componentes em apps/web/components/, organizados somente por responsabilidade: authentication/, forms/, ui/ e navigation/. Não criar diretórios de componentes dentro de rotas ou pastas por página/funcionalidade.
- Compor a home a partir de componentes globais de UI; controles do carrossel ficam em navigation/. Dados demonstrativos ficam em lib/home/ e estilos específicos da tela em CSS Module.
- A pesquisa consulta o catálogo publicado e acessível pela API; notificações, cursos, banners e progresso usam consultas reais e autenticadas.
- Reutilizar os componentes e funções de logout existentes.
- Tratar o wireframe como referência de hierarquia e layout, não como dependência de APIs ou de dados reais.

### Banners — interface atual e integração de cadastro pendente

- O quadro do carrossel define altura responsiva independentemente das dimensões
  do arquivo. A imagem preenche a área com `background-size: cover`, preservando
  a proporção e recortando excedentes sem redimensionar o restante da página.
- O componente reconhece apenas URLs absolutas HTTP(S) como destinos e, quando
  presente, oferece um link que abre nova aba com `noopener noreferrer`. Um
  banner sem destino permanece informativo e não recebe affordance de link.
- Hoje não há entidade/tabela, endpoint de leitura ou tela de cadastro de banner;
  os três itens SVG demonstrativos ficam em `apps/web/public/banners/` e são
  referenciados por registros publicados da tabela `home_banners`.
- Contrato aprovado para a modelagem: `id`, `title` (nome interno), `imagePath`
  (referência ao arquivo, sem armazenar bytes no banco), `destinationUrl`
  opcional, `altText`, `status` (rascunho/publicado), `displayOrder`,
  `createdAt`, `updatedAt`, `createdBy` e `updatedBy`.
- `imagePath` deverá aceitar referências aos arquivos estáticos atuais e também
  referências aos arquivos carregados pelo futuro sistema administrativo, sem
  exigir mudança no contrato da vitrine. A implementação de upload fica fora
  desta etapa.
- Administradores e mentores poderão gerenciar banners no sistema
  administrativo. A vitrine da home exibirá até cinco banners publicados na
  ordem definida; destino vazio significa banner informativo e não clicável.
- Não haverá agendamento por datas nesta modelagem inicial. Publicação e
  despublicação serão manuais. A URL de destino é opcional e, quando preenchida,
  deve aceitar apenas HTTP(S) e abrir em nova aba com `noopener noreferrer`.
- Quando a implementação persistida for iniciada, revisar a fronteira de
  negócio e a autorização no módulo `access`. A primeira fatia já cria a tabela,
  o DTO compartilhado e a leitura autenticada de até cinco banners publicados
  para alunos, consumida pela home. O cadastro/edição, as rotas de escrita e a
  interface de gestão no `(workspace)` ficam para o sistema administrativo; não
  criar módulo de dashboard nem executar upload nesta etapa.

### Organização web aplicada

- A home autenticada do aluno fica em app/(student)/home/page.tsx; a página pública/dispatcher permanece em app/page.tsx.
- components/ui/StudentHome.tsx é a composição Server Component da tela. Busca, menu da conta, notificações, banners, listas, estados vazios e prévia ficam em componentes menores em ui/; controles do carrossel ficam em navigation/.
- O formulário de autenticação fica em components/forms/; componentes de sessão/autenticação permanecem em components/authentication/.
- Todos os componentes React ficam sob components/. Não criar _components, components/home ou outra pasta de componentes dentro das rotas ou agrupada por tela/funcionalidade.
- Estilos específicos da home ficam em components/ui/StudentHome.module.css; dados demonstrativos ficam em lib/home/demoHomeData.ts.

A reorganização preserva as interações locais e os dados de exemplo. Eles não têm persistência e não implementam autorização real; essa responsabilidade permanece na API quando as integrações futuras forem realizadas.
### API — `apps/api`

Criar apenas os módulos e casos de uso necessários para servir esta experiência,
sem concentrar consultas ou regras nos handlers:

- `course`: pesquisa/listagem de cursos, módulos e aulas publicados.
- `enrollment` e `access`: cursos aos quais o aluno tem direito vigente.
- `progress`: últimos conteúdos acessados do próprio aluno.
- `notification`: notificações do próprio aluno, contagem de não lidas e ação
  para marcar como lida/não lida e marcar todas como lidas; envio por e-mail e
  tela de gestão administrativa ficam fora desta entrega.
- `authentication`/`user`: perfil mínimo para o avatar e identificação visual;
  não implementar a tela de perfil nesta unidade.
- `audit`: registrar operações importantes conforme as regras do módulo quando
  forem definidas para a ação correspondente.

Adicionar contratos neutros em `packages/contracts` apenas se web e API
compartilharem os DTOs. DTOs não devem expor linhas Prisma/Supabase nem objetos
do framework.

## Contratos de leitura e comportamento

As consultas personalizadas são autenticadas pela API. Identidade e
destinatários vêm do servidor, sem aceitar `userId` do navegador:

- Consultar dados da página inicial do aluno: perfil mínimo, até cinco banners
  ativos (se a origem for aprovada), três itens recentes e cursos acessíveis.
- Pesquisar cursos, módulos e aulas por texto em título/descrição, com
  correspondência parcial/palavras contidas. Definir limite, ordenação e
  comportamento para consulta vazia antes de codificar.
- Consultar histórico de notificações do usuário autenticado, com filtro de
  não lidas, paginação e contagem total de não lidas.
- Fixar destinatários no envio: avisos gerais alcançam os perfis existentes no
  momento da publicação; avisos por curso alcançam alunos com matrícula ativa
  nesse momento. A tabela de destinatários preserva essa fotografia, mesmo se
  uma matrícula mudar depois.
- Marcar uma notificação como lida/não lida e todas como lidas, sempre
  confirmando na API que o usuário é destinatário.
- Validar links opcionais: caminhos internos relativos permanecem na mesma aba;
  URLs HTTP(S) externas abrem em nova aba com `noopener noreferrer`.
- Consultar progresso recente próprio em ordem decrescente de acesso e cursos
  cujo acesso esteja vigente no momento da consulta.

Endpoints podem ser separados por módulo em vez de criar um endpoint agregado,
caso isso se ajuste melhor às convenções existentes. Evitar dependência de banco
ou chamada direta de API a partir de componentes visuais.

## Segurança e autorização

- Exigir sessão válida na API para notificações. Usuários gerais podem acessar
  sua caixa de entrada; conteúdo por curso exige que estejam entre os
  destinatários fixados no envio.
- Garantir que o contexto de usuário venha da identidade autenticada no servidor,
  nunca de um `userId` enviado pelo navegador.
- Restringir progresso e notificações ao usuário autenticado; validar
  destinatário também ao alterar leitura. Um identificador de outra pessoa não
  deve revelar se a notificação existe.
- Aplicar regra de matrícula/acesso vigente no servidor para cursos e conteúdos,
  inclusive nos resultados de pesquisa e na navegação ao destino.
- Não revelar conteúdo em rascunho nem conteúdo de cursos sem autorização.
- Filtrar destinos e ações de acordo com papel. Esta página é de aluno; mentor e
  administrador devem seguir suas áreas `(workspace)` sem herdar permissões do
  aluno.
- Não expor credenciais, tokens ou objetos internos do provedor de identidade.

## Estados sem conteúdo

Ausência de conteúdo é um estado normal, nunca uma mensagem de erro. Cada seção
mantém seu título e exibe uma ilustração simples em tons neutros, uma frase
direta e, quando fizer sentido, uma próxima ação:

- Banners: ocultar a navegação quando não houver itens.
- Progresso: “Você ainda não começou uma aula. Seus conteúdos recentes vão
  aparecer aqui.”
- Cursos: “Você ainda não tem cursos por aqui. Quando adquirir um curso, ele
  aparecerá nesta seção.” Não oferecer ação de compra nesta entrega.
- Notificações: “Você está em dia. Suas notificações aparecerão aqui.”
- Busca: orientar a digitação antes da consulta e, sem correspondências,
  “Não encontramos resultados para essa busca.”
- Avatar: usar iniciais do nome em um círculo neutro quando não houver imagem.

Falha de carregamento é diferente: informar que a seção não pôde ser carregada e
oferecer tentar novamente, sem confundir com falta de conteúdo.

## Wireframe

`wireframe.html` representa uma proposta de baixa fidelidade, em escala de
cinza, com dados fictícios, estados vazios explícitos e sem integrações. As três
ilustrações SVG da vitrine são exemplos visuais reutilizáveis e independentes de
API.

## Decisões confirmadas e pendências de execução

Decisões confirmadas pelo usuário:

- Home exclusiva do aluno; mentor/administrador têm workspace próprio.
- “Produto” significa curso.
- Exibir três banners/imagens demonstrativas agora. Para a integração futura,
  ficam aprovados o contrato e as regras de publicação descritos acima; a tela
  administrativa e o upload continuam fora desta etapa.
- O curso deve ter sido adquirido. Como pagamento e gestão de acesso ainda não
  existem, esta etapa é apenas visual e deve prever a integração futura sem
  alegar autorização real.
- A busca retorna apenas conteúdo publicado e acessível.
- Exibir até cinco sugestões, com título e tipo, navegando ao conteúdo.
- Estados sem conteúdo devem ser positivos e claros, com ilustração/mensagem;
  falhas técnicas devem ter estado distinto.

Limites da primeira entrega visual:

- As notificações eram demonstrações locais; a seção “Notificações — entrega
  funcional” abaixo descreve a evolução aprovada.
- A pesquisa consulta cursos, módulos e aulas publicados em cursos com matrícula
  ativa; abrir cada resultado continua sujeito à revalidação de acesso na API.
- Cursos e progresso exibidos pela home são consultados com identidade e acesso
  validados no servidor.
- A home lê os banners publicados do banco; os três arquivos atuais são artes
  demonstrativas referenciadas pelos registros iniciais.

Antes da integração real, definir contratos e regras de `payment`, `enrollment`
e `access`, inclusive concessões, convites e estados de assinatura.

## Riscos e decisões técnicas

- Pesquisa e home podem expor conteúdo protegido se a filtragem ocorrer apenas
  no frontend; autorização deve ser imposta no servidor.
- “Comprado” e “com direito de acessar” divergem em concessões, convites,
  expiração e status da assinatura; usar a decisão de `access`/`enrollment`.
- Módulos de notificação/progresso/cursos podem ainda não oferecer todas as
  consultas necessárias; implementar os casos de uso mínimos nos módulos
  existentes, sem criar módulo de dashboard.
- Banners e cursos demonstrativos não representam cadastro, compra ou acesso
  real; a interface deve deixar claro seu caráter de exemplo nesta etapa.
- Perfil e logout devem reutilizar autenticação existente; `/profile` é apenas um
  destino futuro nesta entrega.
- Busca deve ter limite de resultados e estados de teclado/acessibilidade, a
  definir antes da implementação interativa.

## Notificações — entrega funcional

- **Contrato da mensagem:** `id`, `title` (até 180 caracteres), `description`
  (texto simples, até 3000 caracteres), `linkUrl` opcional (caminho interno ou
  URL HTTP(S)), `audience` (`GENERAL` ou `COURSE`), `courseId` obrigatório apenas
  para público de curso, `status` (`DRAFT`/`PUBLISHED`), `createdById`,
  `updatedById`, `createdAt`, `updatedAt` e `publishedAt`.
- **Destinatários e leitura:** tabela `notification_recipients` associa cada
  mensagem ao usuário no envio/publicação, com `deliveredAt` e `readAt`. Geral
  inclui perfis existentes no momento; curso inclui alunos com matrícula ativa
  naquele curso. A leitura/não leitura é individual. A tela administrativa de
  criação/envio será feita depois.
- **API:** `GET /notifications` retorna lista paginada, filtro `all`/`unread` e
  contagem não lida. `PATCH /notifications/:id/read-state` muda apenas o estado
  do destinatário autenticado. `POST /notifications/read-all` marca sua caixa
  como lida. A API aceita qualquer usuário autenticado e nunca recebe o
  identificador do usuário nos parâmetros.
- **Home e sino:** mostrar até cinco mensagens recentes em um popover de 440px,
  com título, descrição e ação de leitura; indicar a contagem não lida e
  fornecer acesso ao histórico completo. Falha na contagem deve ser discreta e
  não bloquear o restante da tela.
- **Interação do sino:** fechar o popover ao clicar fora, pressionar Escape ou
  navegar por um link do próprio menu.
- **Histórico:** rota `/notifications`, acessível a qualquer usuário
  autenticado, ordenação mais recente primeiro, filtros Todas/Não lidas,
  paginação de 20 itens, ações de marcar lida/não lida e marcar todas como
  lidas. Em cada card, a ação de leitura fica à esquerda e o link opcional à
  direita. O usuário não exclui avisos nesta etapa.
- **Links:** caminhos relativos internos abrem na mesma aba; externos aceitam
  apenas HTTP(S) e abrem em nova aba com `noopener noreferrer`. Nenhuma
  notificação exige link.
- **Persistência de exemplos:** criar mensagens gerais para todos os perfis
  existentes, incluindo um aviso demonstrativo da Black Friday TraderLab, e uma
  mensagem vinculada ao primeiro curso publicado com alunos matriculados
  ativamente, associando os destinatários na migração.
- **Escopo excluído:** envio por e-mail, agendamento e interface de gestão no
  sistema administrativo. O estado publicado e o modelo de autoria deixam essa
  futura gestão preparada sem criar rotas de escrita agora.

## Validação

- Validar critérios da especificação e decisões aprovadas desta unidade.
- Cobrir autenticação/autorização, isolamento por usuário e regra de acesso nos
  casos de uso/rotas da API.
- Cobrir pesquisa parcial, conteúdo publicado, itens inacessíveis e consulta sem
  resultados.
- Cobrir ordenação/limite de progresso e contagem/leitura de notificações.
- Verificar estados de carregamento, vazio, erro e responsividade da página.
- Executar typecheck, lint, testes e build dos aplicativos/pacotes afetados.
- Revisar que os componentes de UI não consultem banco diretamente e que a API
  não confie em identidade fornecida pelo cliente.

## Integração implementada — “Continue Onde Parou”

- `POST /courses/:courseId/contents/:contentId/open` já registra ou atualiza o
  progresso por aluno e conteúdo, incluindo `lastAccessedAt`. Cada conteúdo
  aparece uma vez na retomada; um novo acesso atualiza sua posição recente.
- O módulo `progress` expõe `GET /progress/recent-contents`, autenticado e
  restrito a alunos. A consulta retorna no máximo três itens do próprio aluno,
  ordenados por `lastAccessedAt` decrescente e `contentId` decrescente para
  desempate; exige curso, módulo e conteúdo publicados e matrícula ativa.
- O DTO compartilhado contém somente os identificadores e títulos necessários
  para navegar, o tipo do conteúdo, data do acesso e estado de conclusão. A API
  deriva o aluno do token validado, sem aceitar `studentId` do navegador.
- A home consulta histórico e cursos em paralelo e trata a falha de cada seção
  de forma independente. A lista usa links para a rota real do conteúdo, exibe
  a quantidade efetivamente retornada e mantém mensagem motivacional quando o
  histórico está vazio; falha técnica tem estado próprio.
- Conteúdos inacessíveis por matrícula revogada ou publicação removida deixam
  de aparecer no histórico. A rota de destino continua revalidando autorização
  e publicação no módulo `course`.
