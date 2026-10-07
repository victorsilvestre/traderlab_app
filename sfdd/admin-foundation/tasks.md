# Fundação da aplicação administrativa — Tarefas

Implementação autorizada e iniciada em 7 de outubro de 2026. As tarefas ainda
abertas dependem de validação com contas gestoras, configuração externa ou
unidades SFDD posteriores.

## Preparação e alinhamento

- [x] Revisar `spec.md`, `wireframe.html` e `plan.md` com a decisão de duas
      aplicações web e sessões independentes.
- [x] Atualizar `AGENTS.md` para substituir o workspace dentro de `apps/web`
      pelo ambiente de gestão em `apps/admin`, preservando os limites de API,
      contratos e autorização.
- [x] Atualizar `sfdd/authentication/spec.md` e seu plano para registrar a
      entrada administrativa e os redirecionamentos por aplicação, sem apagar
      o histórico do fluxo já entregue.

## Aplicação admin

- [x] Criar a aplicação Next.js em `apps/admin` com App Router, TypeScript,
      scripts de desenvolvimento e validação e dependências já justificadas
      pelo projeto.
- [x] Configurar host local distinto, porta própria se necessária, variáveis
      de exemplo e comandos do workspace para iniciar `apps/admin` sem impedir
      o uso de `apps/web` e `apps/api`.
- [x] Criar layout e página inicial de gestão responsivos, com identidade,
      papel, navegação real e estado inicial honesto para funções pendentes.
- [x] Mostrar apenas destinos disponíveis ao papel autenticado, sem apresentar
      itens de gestão inexistentes como ações funcionais.
- [x] Integrar as rotas protegidas e o layout com os fluxos de
      `sfdd/admin-authentication` antes de disponibilizar a página inicial.

## Autenticação compartilhada e API

- [ ] Executar as tarefas de autenticação, sessão, CORS e callbacks descritas
      em `sfdd/admin-authentication/tasks.md` antes de liberar acesso ao admin.
- [ ] Especificar em unidade SFDD própria o provisionamento de contas gestoras
      antes de depender de contas novas em produção.

## Validação da fundação

- [ ] Validar acesso e saída do admin com contas existentes de administrador e
      mentor e conferir as diferenças de navegação.
- [ ] Validar que uma conta de aluno recebe acesso negado no login e em
      acesso direto a URL protegida.
- [ ] Validar que sessão expirada volta ao login com destino interno seguro e
      que indisponibilidade temporária exibe tentativa de recuperação.
- [ ] Validar isolamento de sessão entre os dois hosts e o comportamento do
      callback de autenticação em cada um.
- [x] Executar typecheck, lint e build das aplicações afetadas e os testes
      pertinentes às regras de acesso e autenticação.
- [x] Conferir que nenhuma função de gestão ou dado demonstrativo aparece como
      funcionalidade concluída na página inicial.

## Unidades seguintes

- [x] Abrir SFDD específico para o catálogo administrativo inicial de cursos.
- [ ] Expandir o SFDD de conteúdo para módulos, aulas e materiais.
- [ ] Abrir SFDD para consulta de alunos e gestão de matrículas.
- [ ] Abrir SFDD para gestão administrativa de notificações e banners.
- [ ] Definir modelo de dados, integração de pagamento e depois o SFDD de
      consulta de pagamentos.
- [ ] Abrir SFDD de acesso do administrador à plataforma TraderLab, definindo
      visualização de cursos, matrícula e comportamento de progresso.
- [ ] Especificar gestão de usuários e auditoria conforme a prioridade do MVP.
- [ ] Planejar hospedagem, DNS, HTTPS e variáveis de produção para os dois
      subdomínios quando a implantação for autorizada.

## Registro da validação local

- [x] Aplicar tratamento visual provisório alinhado à plataforma web no login,
      estados de sessão e workspace, sem acrescentar funções de gestão fictícias.

- `apps/admin` iniciou em `http://admin.localhost:3001`; `/sign-in` respondeu
  200 e a raiz sem sessão redirecionou para entrada.
- Build, typecheck, lint e testes da aplicação admin e da API passaram.
- A validação com gestores reais, o isolamento observado no navegador e os
  links de e-mail dependem de contas apropriadas e do callback liberado no
  projeto Supabase. Essas tarefas permanecem abertas.
