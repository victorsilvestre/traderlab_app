# Gestão de notificações no admin — Tarefas

## Documentação e revisão

- [x] Confirmar que comunicações administrativas fazem parte do MVP.
- [x] Inspecionar o modelo Prisma, contratos e API existentes de notificação.
- [x] Documentar listagem, formulário, estados, critérios de aceite e exclusões.
- [x] Criar wireframe grayscale independente de produção.
- [x] Registrar plano técnico e plano de testes.
- [x] Confirmar acesso exclusivo de administradores na primeira versão.
- [x] Confirmar os públicos geral e por curso, e os campos de destinatário
      nome, e-mail e data individual de envio.
- [x] Alinhar segmentação: público geral inclui alunos cadastrados; público de
      curso inclui alunos cadastrados com matrícula ACTIVE.
- [x] Definir as telas separadas de listagem, detalhes com nome/e-mail/data e
      cadastro/envio.
- [x] Atualizar escopo, regras de segmentação e wireframe conforme alinhamentos
      do usuário.
- [x] Autorizar a implementação após os alinhamentos no chat.

## Implementação

- [x] Criar DTOs administrativos sem alterar desnecessariamente os contratos
      consumidos pelo aluno.
- [x] Implementar casos de uso e repositório para histórico, destinatários e
      disparo transacional no módulo de notificação.
- [x] Integrar listagem paginada de identidades Supabase para resolver
      elegibilidade e e-mails sem consultas individuais sequenciais.
- [x] Implementar autorização exclusiva de administrador na API, incluindo
      validação de público e destinatários.
- [x] Criar rotas administrativas para listagem, detalhes e envio.
- [x] Adicionar helper de API e rotas `/notifications`,
      `/notifications/[notificationId]` e `/notifications/new` no admin.
- [x] Adicionar “Notificações” à navegação somente para administradores.
- [x] Construir telas de listagem, detalhes com dados dos destinatários e
      formulário, com paginação e estados de sucesso, erro, vazio e carregamento.
- [x] Confirmar público antes de persistir, evitar dupla submissão e apresentar
      a quantidade final de destinatários.
- [x] Preservar a experiência atual de leitura das notificações no aluno.
- [x] Criar migration aditiva para snapshot do e-mail do destinatário.
- [x] Incluir alunos cadastrados com identidade existente, independente da
      confirmação de e-mail ou bloqueio da identidade.
- [x] Normalizar links iniciados por `www.` para HTTPS e alinhar os controles
      do formulário.
- [x] Tornar explícito quando o público não contém perfis de aluno e cobrir o
      caso com teste de serviço.
- [x] Atualizar os públicos para incluir qualquer perfil: todos os usuários
      cadastrados no público geral e todas as pessoas matriculadas no público
      de curso, independentemente do papel.
- [x] Remover filtros de papel da seleção e revalidação transacional de
      destinatários; alinhar rótulos, mensagens e documentação SFDD.

## Validação

- [ ] Executar os cenários funcionais e de borda do `test-plan.md`.
- [ ] Validar autorização e isolamento por papel, curso e destinatário.
- [ ] Validar transação, deduplicação de destinatários e proteção contra clique
      duplo.
- [ ] Validar acessibilidade, responsividade e padrão global de rolagem do admin.
- [ ] Executar os testes pertinentes e build dos pacotes afetados.
- [x] Cobrir com testes de serviço os e-mails salvos e a indisponibilidade do
      provedor de identidade ao abrir notificações antigas.
- [x] Executar typecheck e lint do admin e da API.
- [x] Executar check de codificação UTF-8 e `git diff --check`.
- [x] Aplicar a migration `20261008140000_notification_recipient_email` ao banco
      autorizado depois de verificar migrations pendentes; aplicada em
      2026-10-08 e confirmada pelo Prisma.
