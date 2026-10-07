# Autenticação do ambiente de gestão — Tarefas

Implementação local iniciada em 7 de outubro de 2026, em conjunto com a
fundação. As tarefas abertas exigem validação de ponta a ponta ou configuração
do Supabase fora do repositório.

## Alinhamento e configuração

- [x] Revisar esta especificação e o wireframe com `sfdd/admin-foundation` e
      atualizar `AGENTS.md` para a arquitetura com `apps/admin`.
- [x] Definir e documentar hosts locais distintos, URLs exatas de produção e
      variáveis de exemplo de `apps/admin` e `apps/api`.
- [ ] Configurar as URLs exatas de callback das duas aplicações no Supabase do
      ambiente usado para validação.

## API e dados

- [x] Criar caso de uso de entrada de gestor no módulo `authentication`,
      reutilizando Supabase Auth e exigindo perfil persistido de mentor ou
      administrador antes de devolver tokens.
- [x] Expor rota de entrada administrativa com validação de entrada e resposta
      segura; preservar a rota pública de login da plataforma.
- [x] Adicionar seleção fechada `web`/`admin` para destino de recuperação de
      senha e reenvio de confirmação, com padrão compatível com a web atual.
- [x] Configurar na API as origens explícitas da plataforma e do admin para
      CORS, sem aceitar curingas ou URL arbitrária informada pelo navegador.
- [x] Confirmar que as operações de perfil usam o UUID Auth e o papel de
      `user_profiles`, sem acesso direto ao banco por `apps/admin`.

## Aplicação administrativa

- [x] Criar formulários de entrada, recuperação, reenvio de confirmação e
      redefinição de senha conforme `wireframe.html`.
- [x] Criar Route Handler de login que chama a entrada de gestor na API e só
      persiste cookies SSR após autorização; não devolver tokens ao navegador.
- [x] Implementar callback do admin para links de confirmação e recuperação,
      com destinos internos permitidos e estados de link inválido ou expirado.
- [x] Implementar recuperação e redefinição com resposta genérica, validação de
      senha/confirmação e retorno à entrada após sucesso.
- [x] Implementar leitura e renovação de sessão SSR, consulta de
      `/authentication/workspace/me` e barreira de papel nas páginas protegidas.
- [x] Implementar saída local que remove a sessão do admin e volta à entrada.
- [x] Diferenciar sessão expirada, perfil sem acesso e indisponibilidade
      temporária, preservando a sessão em falhas transitórias.

## Validação de regras sensíveis

- [x] Cobrir entrada autorizada de mentor e administrador e rejeição de aluno,
      perfil ausente e e-mail não confirmado, sem emissão de sessão nos casos
      rejeitados.
- [ ] Cobrir alteração/revogação de papel após entrada e acesso direto a uma
      rota protegida.
- [ ] Cobrir destino de callback permitido, rejeição de URL externa e resposta
      genérica de recuperação/reenvio para e-mail não cadastrado.
- [ ] Cobrir link de recuperação válido, inválido e expirado, inclusive conta
      de aluno: senha própria pode mudar, acesso de gestão continua negado.
- [ ] Conferir no navegador que os hosts locais mantêm cookies separados e
      que sair do admin não encerra a sessão da plataforma.
- [ ] Conferir que 401 confirmado pede novo login e que timeout/5xx oferece
      nova tentativa sem apagar cookies.
- [x] Executar os testes relevantes, typecheck, lint e build das aplicações
      afetadas; revisar logs e respostas para ausência de senhas e tokens.

## Encerramento da unidade

- [x] Atualizar os critérios de aceitação e os documentos SFDD conforme o
      comportamento entregue; registrar validações que dependem de contas de
      gestor provisionadas por fluxo próprio.

## Registro da validação local

- A suíte da API passou com 22 testes; a aplicação admin passou com 2 testes
  de origem. Builds, typecheck e lint dos aplicativos afetados passaram.
- A API respondeu 401 para `/authentication/workspace/me` sem token e aceitou
  apenas a origem administrativa configurada no preflight de CORS.
- Não há token de administração do projeto Supabase no ambiente para alterar
  a lista de callbacks pelo repositório. A configuração do callback e os testes
  com links reais e contas de gestor permanecem pendentes.
