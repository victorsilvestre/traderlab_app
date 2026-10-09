# Autenticação do usuário — Tarefas

## Correção do fluxo de login (6 de outubro de 2026)

- [x] Persistir os tokens retornados pela API nos cookies SSR por uma rota interna da web, sem chamada extra ao endpoint `/user` do Supabase e sem retornar tokens ao navegador.
- [x] Resolver autenticação e perfil pelo endpoint `/authentication/me` em vez de depender de `getClaims()` na decisão das páginas.
- [x] Evitar validação de claims pelo proxy em visitas sem cookies de sessão.
- [x] Validar manualmente login, autenticação e logout no ambiente local após a correção da persistência dos cookies SSR.
- [ ] Confirmar o comportamento quando API ou Supabase estiver indisponível e ajustar mensagens de erro conforme necessário.

## Revisão e preparação

- [x] Registrar as decisões de produto aprovadas em `spec.md`.
- [x] Revisar os artefatos SFDD; a implementação foi autorizada pelo usuário.
- [x] Consultar as configurações públicas de Auth: e-mail habilitado, cadastro
      aberto e confirmação obrigatória (`mailer_autoconfirm=false`).
- [x] Confirmar que o e-mail de confirmação foi entregue e redirecionou para o
      callback local durante o teste manual.
- [ ] Revisar os templates de e-mail e a configuração exata do SMTP no painel;
      essas configurações não são expostas pela API pública nem estão no repositório.
- [x] Inventariar buckets e arquivos do Storage antes de decidir se há conteúdo
      antigo que deve ser removido.
- [x] Inventariar em modo somente de leitura os schemas, tabelas e colunas
      públicas e as políticas RLS; nenhuma linha de dados foi consultada.
- [x] Registrar que nenhuma conta ou dado antigo será preservado; manter o
      serviço e o schema gerenciado `auth`.
- [x] Confirmar com o usuário a exclusão do único usuário Auth, identificado
      apenas por contagem como login de teste.
- [x] Confirmar o escopo de descarte dos dados antigos do produto e dos quatro
      arquivos do bucket legado, preservando o projeto e os serviços gerenciados.
- [x] Configurar a chave administrativa somente no `.env` local de
      `apps/api` para usar as APIs administrativas de Auth e Storage.
- [x] Excluir o usuário Auth de teste pela API administrativa do Supabase Auth.
- [x] Excluir o bucket legado `traderlab-private` e seus quatro objetos pela
      API do Supabase Storage.
- [x] Preservar o helper customizado `ensure_rls` e `rls_auto_enable()` como
      proteção padrão para novas tabelas públicas.
- [x] Remover as tabelas e tipos legados do schema `public` por SQL transacional,
      preservando schemas gerenciados e objetos de extensões.
- [x] Configurar Prisma na API para o PostgreSQL Supabase e definir migrações
      versionadas para o schema próprio da aplicação, após revisar o inventário.
- [x] Definir estratégia de sessão entre `apps/web` e `apps/api`, incluindo
      cookies/domínios e validação no servidor.
- [x] Definir persistência de nome, telefone e perfil padrão de aluno, alinhada
      ao schema e às políticas Supabase existentes.
- [x] Documentar o modelo de autorização da API e decidir onde RLS acrescenta
      proteção sem presumir que chamadas Prisma carregam automaticamente o contexto
      do usuário Supabase.
- [x] Atualizar o plano técnico com o inventário, a exclusão autorizada e os
      pré-requisitos operacionais de Auth/Storage.

## API

- [x] Criar os contratos e casos de uso do módulo `authentication` para cadastro,
      confirmação de e-mail, login, solicitação e conclusão de recuperação e
      consulta de sessão.
- [x] Implementar adaptadores Supabase isolados em `infrastructure`.
- [x] Criar rotas de autenticação com validação de entrada e mapeamento seguro
      das respostas.
- [x] Resolver perfil de usuário em fonte confiável do servidor; atribuir aluno
      ao cadastro público e impedir atribuição de mentor ou administrador.
- [x] Exigir confirmação de e-mail antes do acesso autenticado e implementar os
      retornos de confirmação e redefinição por link.
- [x] Processar no callback a sessão de confirmação retornada no fragmento da
      URL pelo fluxo de cadastro iniciado na API.
- [x] Implementar solicitação segura de reenvio do link de confirmação.
- [x] Proteger `/authentication/me` e a redefinição de senha com sessão validada
      no servidor; recursos de produto ainda serão protegidos nos módulos próprios.
- [x] Implementar o encerramento local da sessão por meio do cliente Supabase
      SSR, sem criar rota de API para estado mantido no navegador.
- [ ] Definir e aplicar políticas de papel para rotas de produto quando os
      módulos `course`, `enrollment` e demais recursos forem implementados.
- [x] Adicionar testes para casos de uso, validações, respostas de erro e
      proteção contra atribuição pública de perfil.

## Web

- [x] Criar telas de cadastro, login, solicitação de recuperação e redefinição
      de senha conforme a especificação aprovada.
- [x] Criar tela para solicitar novo link de confirmação e conectá-la ao
      callback e ao formulário de login.
- [x] Implementar estados de validação, envio, sucesso e erro acessíveis.
- [x] Validar que senha e confirmação coincidem no cadastro e na redefinição.
- [x] Implementar consulta de sessão, redirecionamento de todos os perfis à
      página inicial e bloqueio de acesso para e-mail não confirmado.
- [x] Confirmar manualmente o login: identificar que o processo Next.js sem
      acesso ao Supabase não reconhecia os cookies no servidor; reiniciá-lo com a
      rede liberada e confirmar o redirecionamento da tela pública para a raiz.
- [x] Garantir que segredos de servidor não sejam importados ou serializados para
      componentes cliente.
- [x] Adicionar testes dos fluxos de sessão, callback e redirecionamento da
      interface para todos os perfis.
- [x] Exibir a ação “Sair” na página autenticada, com estado de processamento,
      erro acessível e redirecionamento para `/sign-in` após a limpeza da sessão.
- [x] Cobrir em teste que o logout limpa primeiro a sessão local e não redireciona
      quando essa limpeza falha.

## Validação e documentação

- [x] Validar os critérios funcionais de autenticação, sessão e recuperação de senha conforme confirmação do usuário.
- [x] Validar manualmente o login e o redirecionamento após autenticação no
      ambiente local.
- [x] Executar typecheck, lint e build dos aplicativos afetados.
- [x] Revisar proteção contra enumeração de contas, exposição de segredos e
      bypass de autorização pela API.
- [x] Marcar as tarefas concluídas e atualizar `spec.md`/`plan.md` se o
      comportamento implementado divergir do aprovado.
- [x] Adicionar e executar testes automatizados para API e web.
- [x] Confirmar que o link de confirmação foi redirecionado para
      `http://localhost:3000/auth/callback`; o callback corrigido também é coberto
      por testes com a sessão do fragmento e o código PKCE.
- [x] Validar de ponta a ponta confirmação e recuperação por links de e-mail conforme confirmação do usuário.

## Renovação e recuperação de sessão

- [x] Exibir indicador discreto e atrasado para navegações internas, sem trocar o conteúdo atual por uma tela de carregamento.
- [x] Preservar a rota interna no redirecionamento de sessão inválida e voltar a ela após o login.
- [x] Validar os destinos de retorno e rejeitar URLs externas, rotas públicas e valores malformados.
- [x] Diferenciar 401 confirmado de falha transitória/timeout ao validar identidade no Supabase.
- [x] Limitar o tempo de espera da validação de perfil e das chamadas de conteúdo; fornecer tentativa manual sem limpar cookies.
- [x] Mostrar uma mensagem recuperável de indisponibilidade da sessão em vez de redirecionar ao login.
- [ ] Conferir no painel do Supabase as configurações de expiração de JWT e duração/inatividade da sessão.
- [x] Validar manualmente sessão, renovação e recuperação de acesso conforme confirmação do usuário.
