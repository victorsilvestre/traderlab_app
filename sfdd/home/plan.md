# Página inicial do aluno — Plano técnico

## Status

Plano atualizado com as decisões de produto recebidas. A especificação original
em `spec.md` foi preservada sem alterações. A primeira entrega implementa a
interface e interações locais com dados de exemplo. Integração de pagamento,
gestão de acessos, dados reais e cadastro de banners ficam para unidades futuras.

## Escopo e aderência ao MVP

Esta unidade cobre a experiência inicial do aluno autenticado: cabeçalho,
pesquisa de conteúdo, notificações, menu da conta, banners de comunicação,
retomada de estudo e cursos com acesso vigente.

| Necessidade da especificação | Aderência ao MVP e limite |
| --- | --- |
| Menu e avatar | Incluídos. Usar identidade/perfil já autenticados. |
| Pesquisar produtos, módulos e aulas | Incluído como pesquisa de cursos, módulos e aulas, usando o vocabulário do produto. Resultados só podem expor conteúdo publicado e autorizado ao aluno. |
| Caixa de entrada e leitura de notificações | Incluídas no módulo `notification`, limitado a comunicações essenciais do MVP. |
| Banner com até cinco comunicações | Exibir três imagens demonstrativas (`estudo.svg`, `analise.svg`, `progresso.svg`) em `apps/web/public/banners/`. Cadastro, publicação e origem dinâmica ficam para o futuro. |
| “Continue Onde Parou” | Incluído no módulo `progress`, para os três conteúdos mais recentemente acessados; não introduzir avaliação, anotação ou recomendação. |
| “Meus Cursos” | Nesta etapa, exibir cursos demonstrativos adquiridos. Prever integração posterior com `payment`, `enrollment` e `access`; não simular autorização real nem declarar acesso validado. |
| Acessar Perfil | Link para `/profile`, cuja tela fica fora desta unidade e será implementada depois, conforme indicado na especificação. |
| Sair da conta | Reutilizar o logout já implementado no módulo de autenticação. |

## Aplicações e arquitetura afetadas

### Web — apps/web (entrega visual atual)

- Manter app/page.tsx como entrada pública e dispatcher por papel. Alunos autenticados seguem para /home, implementada em app/(student)/home/page.tsx; a rota valida sessão e papel no servidor.
- Usar Server Components como padrão e limitar Client Components às interações locais que precisam de estado ou eventos do navegador.
- Manter todos os componentes em apps/web/components/, organizados somente por responsabilidade: authentication/, forms/, ui/ e navigation/. Não criar diretórios de componentes dentro de rotas ou pastas por página/funcionalidade.
- Compor a home a partir de componentes globais de UI; controles do carrossel ficam em navigation/. Dados demonstrativos ficam em lib/home/ e estilos específicos da tela em CSS Module.
- Usar exemplos locais para pesquisa, notificações, cursos e progresso nesta etapa; não apresentar esses exemplos como dados reais do aluno.
- Reutilizar os componentes e funções de logout existentes.
- Tratar o wireframe como referência de hierarquia e layout, não como dependência de APIs ou de dados reais.

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
  para marcar como lida.
- `authentication`/`user`: perfil mínimo para o avatar e identificação visual;
  não implementar a tela de perfil nesta unidade.
- `audit`: registrar operações importantes conforme as regras do módulo quando
  forem definidas para a ação correspondente.

Adicionar contratos neutros em `packages/contracts` apenas se web e API
compartilharem os DTOs. DTOs não devem expor linhas Prisma/Supabase nem objetos
do framework.

## Contratos de leitura e comportamento esperado (futuro)

Na entrega visual atual, nenhuma consulta de negócio nova é criada. As
interações usam exemplos fixos no cliente e são explicitamente identificadas.
Na integração futura, implementar casos de uso e rotas autenticadas nos módulos
existentes:

- Consultar dados da página inicial do aluno: perfil mínimo, até cinco banners
  ativos (se a origem for aprovada), três itens recentes e cursos acessíveis.
- Pesquisar cursos, módulos e aulas por texto em título/descrição, com
  correspondência parcial/palavras contidas. Definir limite, ordenação e
  comportamento para consulta vazia antes de codificar.
- Consultar notificações próprias, não lidas e contagem de não lidas; marcar
  notificação como lida validando propriedade no servidor.
- Consultar progresso recente próprio em ordem decrescente de acesso e cursos
  cujo acesso esteja vigente no momento da consulta.

Endpoints podem ser separados por módulo em vez de criar um endpoint agregado,
caso isso se ajuste melhor às convenções existentes. Evitar dependência de banco
ou chamada direta de API a partir de componentes visuais.

## Segurança e autorização

- Exigir sessão válida na API para os dados personalizados desta página.
- Garantir que o contexto de usuário venha da identidade autenticada no servidor,
  nunca de um `userId` enviado pelo navegador.
- Restringir progresso e notificações ao usuário autenticado; validar propriedade
  também ao marcar uma notificação como lida.
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
- Exibir três banners/imagens demonstrativas agora; cadastro e regras dinâmicas
  serão definidos futuramente.
- O curso deve ter sido adquirido. Como pagamento e gestão de acesso ainda não
  existem, esta etapa é apenas visual e deve prever a integração futura sem
  alegar autorização real.
- A busca retorna apenas conteúdo publicado e acessível.
- Exibir até cinco sugestões, com título e tipo, navegando ao conteúdo.
- Estados sem conteúdo devem ser positivos e claros, com ilustração/mensagem;
  falhas técnicas devem ter estado distinto.

Limites da primeira entrega visual:

- Pesquisa e notificações são demonstrações locais; busca não consulta catálogo
  nem garante autorização. As opções clicadas abrem uma prévia de exemplo.
- Cursos e progresso apresentados são conteúdo ilustrativo, não comprovam compra,
  matrícula ou direito de acesso.
- Os banners são SVG estáticos em `apps/web/public/banners/`, sem cadastro ou
  integração com dados.

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
