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
- [x] Consultar os três conteúdos do próprio aluno com acesso mais recente em
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
- [x] Exibir três cursos por linha na grade de Meus Cursos em telas largas, com adaptação para duas e uma coluna em telas menores.
- [x] Restaurar explicitamente o fundo verde do símbolo T no cabeçalho do aluno.
- [x] Ampliar o painel e os itens de resultado da busca global, preservando o uso em telas menores.

- [x] Implementar a página autenticada demonstrativa do aluno na rota atual,
      preservando
      a página pública de entrada e os redirecionamentos por papel existentes.
- [x] Exibir logo/link para a home, pesquisa, notificações e avatar no cabeçalho.
- [x] Implementar menu do avatar com “Acessar Perfil” e logout, reutilizando o
      logout existente; a página `/profile` fica especificada nas tarefas de
      perfil do usuário abaixo.
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

- [x] Substituir exemplos de busca pela consulta autenticada a cursos, módulos e
      aulas publicados e acessíveis.
- [x] Substituir notificações locais por consultas e atualização persistidas no
      módulo `notification`.
- [x] Substituir cursos demonstrativos pela lista de cursos realmente adquiridos,
      confirmada por `payment`, `enrollment` e `access` no servidor.
- [x] Substituir progresso local demonstrativo pelo histórico real do módulo
      `progress`.
- [x] Conectar a vitrine à tabela `home_banners`, exibindo os registros
      publicados e respeitando a ordem e o limite definidos.

## Testes e validação

- [ ] Testar unidade/API: pesquisa parcial, ordenação/limite e exclusão de
      rascunhos ou conteúdo sem acesso.
- [ ] Testar API: isolamento de notificações e progresso por usuário e marcação
      como lida somente pelo proprietário.
- [ ] Testar regra de cursos acessíveis para matrícula, concessão/convite e
      estados de assinatura definidos.
- [ ] Testar integração/interface: menu, abertura da pesquisa, sugestões,
      navegação, leitura de notificação, banners aprovados e estados vazios/erro.
- [ ] Validar que aluno, mentor e administrador acessam a home e os próprios cursos, sem obter acesso a cursos sem matrícula ativa.

- [ ] Validar responsividade e navegação por teclado/leitor de tela nos controles
      interativos.
- [ ] Executar typecheck, lint, testes e build nos pacotes afetados.
- [ ] Revisar limites de autorização na API e ausência de consultas diretas ao
      banco pela interface.
- [ ] Atualizar este arquivo com tarefas concluídas e documentar diferenças
      aprovadas entre comportamento e artefatos SFDD.

## Retomada real de estudos — implementação autorizada

- [x] Confirmar que a abertura autenticada de conteúdo registra o acesso em
      `content_progress` com aluno, conteúdo e data atualizada.
- [x] Acrescentar ao contrato compartilhado o DTO mínimo de conteúdo recente,
      incluindo curso e módulo de destino.
- [x] Implementar consulta autenticada no módulo `progress`, limitada aos três
      acessos distintos mais recentes do aluno e ordenada com desempate estável.
- [x] Filtrar na API conteúdos, módulos e cursos publicados que ainda pertençam
      a um curso com matrícula ativa do aluno autenticado.
- [x] Conectar a home à API sem dados demonstrativos na seção de retomada;
      carregar progresso e cursos em paralelo e isolar falhas entre seções.
- [x] Tornar cada item um link para sua página real e mostrar a quantidade de
      itens retornados, inclusive quando houver somente um ou dois.
- [x] Exibir orientação motivacional quando não houver acessos e estado distinto
      quando a consulta falhar.
- [x] Atualizar o wireframe para incluir a lista de conteúdos e a alternativa
      vazia, preservando o padrão visual em tons de cinza.
- [ ] Validar no navegador os estados vazio, um/dois/três conteúdos, ordem após
      reabrir uma aula e navegação dos links.
- [ ] Validar autorização, isolamento entre alunos, matrícula revogada e
      conteúdo despublicado por testes de integração.
- [x] Executar typecheck da web, API e contratos e conferir whitespace.

## Banners — padronização da vitrine e destino

- [x] Fixar a altura do quadro do banner por breakpoint para que a arte não
      altere o layout; preencher o quadro com recorte proporcional `cover`.
- [x] Preparar o componente para abrir em nova aba um destino HTTP(S) quando
      fornecido, com isolamento `noopener noreferrer`; sem destino, manter o
      banner sem comportamento de link.
- [x] Atualizar especificação, plano e wireframe para refletir o quadro estável
      e o comportamento de destino.
- [x] Confirmar destino opcional: banner sem URL é informativo; URL HTTP(S)
      válida abre em nova aba com `noopener noreferrer`.
- [x] Confirmar administração por administradores e mentores no futuro sistema
      administrativo.
- [x] Aprovar contrato de dados: identificador, nome interno, referência da
      imagem, destino opcional, texto alternativo, estado de publicação, ordem,
      datas de criação/atualização e autoria de criação/atualização.
- [x] Definir que o banco guarda a referência do arquivo, não seus bytes; usar
      as imagens estáticas existentes inicialmente e preparar `imagePath` para
      futuras referências de upload administrativo.
- [x] Definir publicação/despublicação manual, sem agendamento por datas, e
      limite de cinco banners publicados na vitrine.
- [x] Criar migração/modelo persistido e contrato compartilhado de banner;
      inserir os três arquivos demonstrativos como registros publicados sem URL.
- [x] Implementar leitura autenticada dos banners publicados para a home de
      aluno, limitada aos cinco primeiros pela ordem de exibição.
- [x] Integrar os dados persistidos ao carrossel, preservando os caminhos dos
      arquivos demonstrativos existentes.
- [ ] Implementar autorização e operações de escrita para administradores e
      mentores junto com o futuro sistema administrativo.
- [ ] Implementar futuramente a interface administrativa de cadastro/edição,
      ordenação e publicação; upload de imagens não faz parte desta etapa.
- [ ] Validar o recorte em diferentes proporções/tamanhos de viewport, a abertura
      em nova aba, URLs não permitidas, persistência e limites de publicação.

## Notificações — entrega funcional autorizada

- [x] Definir canal apenas na plataforma, segmentação geral/curso, links
      opcionais e gestão pelo usuário sem exclusão.
- [x] Definir destinatários como fotografia no envio: todos os perfis existentes
      para avisos gerais e alunos com matrícula ativa para avisos do curso.
- [x] Atualizar especificação, plano e wireframe para incluir sino expandido,
      histórico completo e estados de leitura individuais.
- [x] Criar modelos e migração para mensagens e destinatários com `readAt`
      individual; sem criar tabela de e-mail nem rotina de agendamento.
- [x] Popular mensagens demonstrativas gerais e por curso, associando os
      destinatários disponíveis na migração.
- [x] Fechar o menu do sino ao clicar fora, pressionar Escape ou navegar por
      um link do próprio menu.
- [x] Adicionar um aviso geral demonstrativo da Black Friday TraderLab para os
      perfis existentes, sem especificar condições comerciais não definidas.
- [x] Criar DTO compartilhado com título, descrição, link opcional, público,
      curso relacionado, data de envio e estado de leitura pessoal.
- [x] Implementar consulta autenticada paginada, filtro de não lidas e contagem
      não lida no módulo `notification`.
- [x] Implementar mudança individual lida/não lida e ação de marcar todas como
      lidas, validando destinatário na API.
- [x] Conectar o sino da home e dos cabeçalhos de curso aos cinco avisos mais
      recentes e ampliar seu popover para leitura confortável.
- [x] Criar `/notifications` para qualquer perfil autenticado, com filtros,
      paginação, links e ações individuais/coletivas de leitura.
- [x] Validar caminhos internos e links HTTP(S) externos antes de renderizar;
      abrir somente destinos externos em nova aba com `noopener noreferrer`.
- [x] Aplicar as migrações de notificações e campos de auditoria ao banco
      Supabase configurado, com exemplos e destinatários iniciais.
- [x] Executar typecheck da API, da web e dos contratos compartilhados.
- [ ] Validar visualmente menu e histórico em larguras desktop e mobile.
- [ ] Validar isolamento por usuário, público geral/curso e alteração de leitura
      para destinatário próprio por testes de integração.
- [ ] Implementar em unidade futura a criação/edição/publicação e segmentação
      no sistema administrativo, incluindo geração dos destinatários no envio.
- [ ] Definir a permissão de mentor para enviar aviso apenas aos cursos sob sua
      responsabilidade e registrar a operação em auditoria na futura gestão.

## Perfil do usuário — visualização e edição

- [x] Ler a especificação existente sem alterar seu conteúdo e registrar no plano o menu de conta por hover/clique, a página completa /profile e o e-mail somente leitura.
- [x] Atualizar o wireframe para incluir o menu da conta e a tela de perfil com edição de nome/telefone e avatar.
- [x] Criar DTO de perfil detalhado com nome, telefone, e-mail somente leitura, avatar e papel, sem expor identificadores internos de armazenamento.
- [x] Criar migração para persistir a referência do avatar no perfil e aplicá-la ao Supabase.
- [x] Provisionar bucket privado traderlab-profile-avatars; aceitar JPEG/PNG/WebP até 5 MB.
- [x] Implementar no módulo user a consulta e a atualização autenticada de nome/telefone e avatar do próprio usuário.
- [x] Implementar emissão de upload autorizado, validação do arquivo e persistência do caminho do avatar no perfil.
- [x] Implementar /profile como página completa, protegida para usuário autenticado e acessível diretamente e pelo menu do avatar.
- [x] Reutilizar o cabeçalho completo da aplicação em home, /profile e /notifications.
- [x] Fazer o avatar navegar diretamente para /profile sem acrescentar símbolos visuais ao lado da imagem; abrir as opções da conta por hover ou foco de teclado.
- [x] Fechar o menu ao clicar fora e disponibilizar “Acessar Perfil” e logout nas opções da conta.
- [x] Exibir o avatar persistido nos locais da conta; manter as iniciais como fallback sem imagem.
- [x] Exibir o e-mail em campo travado com indicação discreta de que não pode ser alterado.
- [x] Exibir o telefone antes do e-mail e aplicar máscara brasileira para números com DDD.
- [x] Exibir estados de envio, sucesso e erro ao salvar; preservar os dados já preenchidos quando ocorrer uma falha.
- [ ] Validar leitura e atualização do próprio perfil para todos os papéis e rejeitar qualquer tentativa de acessar ou alterar perfil alheio.
- [ ] Validar upload, preview, armazenamento, exibição, fallback de iniciais, responsividade e navegação por teclado.
- [x] Executar typecheck da API e da web após a implementação.

## Acesso à aprendizagem por mentor e administrador

- [x] Encaminhar todos os perfis autenticados da entrada da plataforma para `/home`.
- [x] Remover a restrição de papel nas páginas de home, curso e conteúdo da web.
- [x] Permitir todos os perfis autenticados nas rotas de leitura e interação de curso, progresso e banners da API, preservando matrícula e publicação.
- [x] Fazer os links de retorno do perfil e das notificações apontarem para a home da plataforma.
- [ ] Validar manualmente a navegação de mentor e administrador e os estados de curso com e sem matrícula.

## Cache das capas de curso

- [x] Reutilizar por caminho as URLs assinadas de leitura do bucket privado,
      renovar com margem antes da expiração e compartilhar geração concorrente.
- [x] Limitar o cache em memória da API e documentar seu alcance por processo.
- [x] Definir cache de uma hora em uploads novos e reduzir a qualidade da capa
      otimizada para 90.
- [ ] Validar no navegador retorno à home após abrir um curso e conferir o
      reaproveitamento da imagem e sua nitidez em desktop e mobile.

## Ampliação aprovada do padrão de imagens

- [x] Aplicar o componente de imagem responsiva também ao detalhe do curso e aos módulos.
- [x] Registrar que o cache do adaptador atende imagens de cursos, módulos e conteúdos.
- [ ] Validar visualmente detalhe do curso e módulos em desktop e mobile.
- [ ] Usar o mesmo componente quando houver uma área visual para imagem de conteúdo.
