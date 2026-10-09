# Gestão de alunos no admin — Tarefas

## Definição e preparação

- [x] Confirmar que a consulta administrativa de alunos pertence ao MVP.
- [x] Dividir consulta (fase 1) de cadastro/matrícula (fase posterior).
- [x] Alinhar listagem para todos os papéis e incluir o papel do usuário.
- [x] Separar dados cadastrais, matrículas, compras e progresso nos detalhes.
- [x] Documentar listagem, busca parcial, detalhes, autorização e exclusões.
- [x] Criar wireframe grayscale independente de dados e APIs de produção.
- [x] Registrar o modelo atual e o risco de busca de e-mail no Supabase Auth.

## Implementação autorizada após revisão

- [x] Reservar o histórico de compras para o futuro trabalho do módulo de
      pagamentos.
- [x] Persistir e-mail local, normalizar e preencher perfis existentes via
      backfill Supabase Auth para busca sem varrer identidades por consulta.
- [x] Registrar último login após autenticação bem-sucedida em login web e
      workspace, sem atualizar a cada requisição.
- [x] Adicionar DTOs administrativos compartilhados.
- [x] Implementar consultas paginadas e agregados no módulo `user`.
- [x] Adicionar endpoints administrativos de usuários com autorização em cada
      chamada.
- [x] Adicionar item “Alunos” como primeiro item do menu administrativo.
- [x] Criar listagem/pesquisa parcial e paginação no admin.
- [x] Criar detalhes em seções separadas com perfil, matrículas, resumo de
      progresso e notificações.
- [x] Apresentar a listagem em tabela com cabeçalho e linha clicável; empilhar
      as quatro seções dos detalhes e alinhar os dados cadastrais horizontalmente.
- [x] Adicionar estados de carregamento, vazio, sem resultado e erro.
- [x] Aplicar migration `20261008160000_add_user_email_and_last_login` e
      confirmar que o schema do banco está atualizado.
- [x] Validar critérios funcionais e cenários de gestão de alunos conforme confirmação do usuário.

## Fase posterior, fora da autorização atual

- [ ] Especificar e implementar cadastro de aluno e identidade.
- [ ] Especificar e implementar matrícula em curso, origem e regras de acesso.
