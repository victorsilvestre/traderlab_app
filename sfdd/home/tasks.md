# Página inicial do aluno — Tarefas

## Revisão e decisões de produto

- [x] Confirmar o perfil atendido pela página e o redirecionamento de aluno,
      mentor e administrador após autenticação.
- [x] Confirmar o mapeamento do termo “produto” para `course` nesta experiência.
- [x] Definir três banners demonstrativos nesta etapa e deixar cadastro e gestão
      dinâmica para o futuro.
- [x] Registrar que pagamento e gestão de acesso real não fazem parte desta
      entrega visual e serão integrados futuramente.
- [x] Aprovar a busca apenas por conteúdo publicado e acessível.
- [x] Definir até cinco sugestões com título e tipo de conteúdo.
- [x] Definir estados vazios explicativos e distintos de falhas técnicas.
- [ ] Revisar e aprovar a hierarquia do `wireframe.html`.
- [x] Manter `spec.md` como escrito pelo usuário até que ele solicite revisão;
      registrar decisões técnicas neste plano e alterações aprovadas em revisão
      posterior do spec.

## Preparação técnica

- [ ] Revisar a estrutura de rotas e decidir a colocação da home de aluno em
      `(student)`, mantendo mentor e administrador no `(workspace)`.
- [ ] Inventariar modelos, módulos, contratos e rotas existentes para curso,
      matrícula, acesso, progresso e notificação antes de criar estruturas novas.
- [ ] Mapear quais dados já existem e quais dependem de migração/schema ou
      integração ainda não implementada.
- [ ] Definir DTOs de leitura necessários e contratos compartilhados somente se
      forem consumidos tanto pela web quanto pela API.
- [ ] Definir limite, ordenação e estratégia de pesquisa antes de implementar a
      consulta.

## API — autenticação, acesso e pesquisa

- [ ] Implementar consulta autenticada dos cursos publicados e acessíveis pelo
      usuário no módulo apropriado.
- [ ] Implementar pesquisa por título/descrição em cursos, módulos e aulas,
      incluindo correspondência parcial, limite de resultados e ordenação
      aprovados.
- [ ] Garantir que rascunhos e recursos não autorizados não sejam expostos pela
      pesquisa nem pela consulta de home.
- [ ] Validar autorização do destino de curso/módulo/aula ao abrir o resultado;
      não depender da filtragem visual.
- [ ] Implementar ou reutilizar a consulta de perfil mínimo do usuário para
      nome/avatar, sem expor campos desnecessários.

## API — notificações e progresso

- [ ] Consultar notificações pertencentes ao usuário autenticado.
- [ ] Consultar quantidade de notificações não lidas do usuário autenticado.
- [ ] Implementar ação para marcar uma notificação como lida após validar sua
      propriedade e estado.
- [ ] Consultar os três conteúdos do próprio aluno com acesso mais recente em
      ordem cronológica decrescente.
- [ ] Garantir que progresso e notificações de outro usuário não possam ser
      consultados ou alterados por troca de identificadores.

## Banners e preparação da integração futura

- [x] Criar `apps/web/public/banners/` e adicionar três imagens demonstrativas
      para a vitrine, sem presumir CMS ou cadastro de banners.
- [ ] Decidir entre chamadas por módulo e consulta agregada da home, mantendo
      regras de negócio nos casos de uso e sem criar módulo de dashboard.
- [ ] Mapear falhas de cada consulta para que uma seção indisponível não esconda
      dados independentes que carregaram com sucesso.

## Web — página inicial e menu

- [x] Implementar a página autenticada demonstrativa do aluno na rota atual,
      preservando
      a página pública de entrada e os redirecionamentos por papel existentes.
- [x] Exibir logo/link para a home, pesquisa, notificações e avatar no cabeçalho.
- [x] Implementar menu do avatar com “Acessar Perfil” e logout, reutilizando o
      logout existente; manter `/profile` como destino futuro conforme a
      especificação.
- [x] Implementar expansão da pesquisa, até cinco sugestões locais, estado sem
      resultados, atalho `/` e fechamento por Escape; identificar dados como
      demonstrativos e abrir prévia local ao selecionar um resultado.
- [x] Implementar lista de notificações de exemplo e ação local de marcar como
      lida, atualizando a contagem sem persistência de servidor.
- [x] Implementar vitrine navegável com as três imagens estáticas aprovadas.
- [x] Implementar seções de demonstração “Continue Onde Parou” e “Meus Cursos”.
- [x] Implementar estados vazios com mensagem clara para busca, progresso,
      cursos e banners; a ausência não é apresentada como erro.
- [x] Aplicar layout responsivo e controles semânticos para as interações locais.
- [ ] Implementar estados de erro/repetição por seção quando as consultas reais
      forem integradas.
- [ ] Preservar componentes existentes e alterações locais do usuário.

## Organização estrutural da web

- [x] Colocar a home do aluno em /home dentro do grupo (student), mantendo app/page.tsx como entrada pública e dispatcher por papel.
- [x] Manter todos os componentes React em apps/web/components/, organizados somente em authentication/, forms/, ui/ e navigation/. Não criar _components nem pastas de componentes por rota, página ou funcionalidade.
- [x] Mover o formulário de autenticação para components/forms/ e preservar componentes de sessão/autenticação em components/authentication/.
- [x] Decompor a home em Server Component de composição e componentes menores por responsabilidade, usando Client Components somente para interações locais.
- [x] Colocar os controles do carrossel em components/navigation/ e elementos de interface da home em components/ui/.
- [x] Isolar os estilos específicos da home em CSS Module e manter dados demonstrativos fora dos componentes, em lib/home/.
- [x] Preservar a sessão, o logout, as rotas de autenticação, o comportamento demonstrativo e alterações preexistentes.
## Integrações futuras (não incluídas na entrega visual)

- [ ] Substituir exemplos de busca pela consulta autenticada a cursos, módulos e
      aulas publicados e acessíveis.
- [ ] Substituir notificações locais por consultas e atualização persistidas no
      módulo `notification`.
- [ ] Substituir cursos demonstrativos pela lista de cursos realmente adquiridos,
      confirmada por `payment`, `enrollment` e `access` no servidor.
- [ ] Substituir progresso local demonstrativo pelo histórico real do módulo
      `progress`.
- [ ] Conectar banners a uma futura funcionalidade de cadastro/publicação, depois
      de definir papéis, validade e regras editoriais.

## Testes e validação

- [ ] Testar unidade/API: pesquisa parcial, ordenação/limite e exclusão de
      rascunhos ou conteúdo sem acesso.
- [ ] Testar API: isolamento de notificações e progresso por usuário e marcação
      como lida somente pelo proprietário.
- [ ] Testar regra de cursos acessíveis para matrícula, concessão/convite e
      estados de assinatura definidos.
- [ ] Testar integração/interface: menu, abertura da pesquisa, sugestões,
      navegação, leitura de notificação, banners aprovados e estados vazios/erro.
- [ ] Validar que mentor/administrador seguem para o workspace e não recebem
      permissões de aluno por esta página.
- [ ] Validar responsividade e navegação por teclado/leitor de tela nos controles
      interativos.
- [ ] Executar typecheck, lint, testes e build nos pacotes afetados.
- [ ] Revisar limites de autorização na API e ausência de consultas diretas ao
      banco pela interface.
- [ ] Atualizar este arquivo com tarefas concluídas e documentar diferenças
      aprovadas entre comportamento e artefatos SFDD.
