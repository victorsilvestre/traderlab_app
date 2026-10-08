# Dados de demonstração para usuários e matrículas — Plano

## Aplicação

- Adicionar um script operacional em `apps/api/prisma/` usando as dependências
  já instaladas `pg` e `@supabase/supabase-js`.
- Conectar ao Supabase Auth com a chave secreta somente no processo Node e usar
  `DIRECT_URL` para a transação PostgreSQL.
- Usar o domínio reservado `example.test` e um marcador em `user_metadata` para
  reconhecer identidades próprias em execuções futuras.
- Atualizar nome, e-mail e telefone de identidades já marcadas pelo seed sem
  alterar seus IDs ou senhas; atualizar os perfis `STUDENT` correspondentes.
- Consultar por título os três cursos de validação existentes e associar
  matrículas `ACTIVE` com origem `MANUAL` conforme uma matriz determinística.
- Remover os cursos duplicados da versão anterior somente se a descrição,
  capa, módulo, aulas e imagens ainda corresponderem ao seed original e não
  houver materiais, progresso, notificações ou matrículas pertencentes a
  usuários reais.
- Executar alterações relacionais em uma transação. Se ela falhar, remover
  somente identidades criadas pela execução atual.
- Em modo de simulação, imprimir apenas o resumo da carga. No modo de aplicação,
  exigir `--apply --target development`.
- Não alterar o seed de cursos existente, que edita cursos e matrícula da conta
  de teste atual.

## Segurança e idempotência

- Nunca imprimir chaves ou URLs com credenciais.
- Recusar e-mails de demonstração existentes sem o marcador do seed.
- Recusar colisões de título com cursos cujo conteúdo não corresponda aos dados
  de demonstração esperados.
- Usar `ON CONFLICT` apenas para garantir perfil/matrícula do próprio conjunto.
- Não resetar senhas nem apagar contas ao repetir a carga.
- Restaurar e-mail/metadados do Supabase Auth se a atualização relacional falhar.
- Validar tabelas e administrador criador antes de iniciar alterações.

## Validação

- Executar modo de simulação sem acesso de escrita.
- Executar seed no alvo de desenvolvimento autorizado e conferir somente
  contagens agregadas e a distribuição de matrículas.
- Executar novamente para conferir idempotência.
- Rodar lint, verificação de codificação e `git diff --check`.
