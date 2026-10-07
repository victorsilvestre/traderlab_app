# TraderLab Gestão

Aplicação Next.js separada para mentores e administradores. Usa a API e o
projeto Supabase já utilizados pela plataforma TraderLab.

## Desenvolvimento local

1. Copie `.env.example` para `.env.local` e preencha as três variáveis públicas
   com os valores do mesmo ambiente usado por `apps/web`.
2. Configure `ADMIN_APP_URL=http://admin.localhost:3001` em `apps/api/.env`.
3. Inicie a API e a aplicação com `pnpm dev:api` e `pnpm dev:admin` na raiz.
4. Abra `http://admin.localhost:3001`.

Use um host diferente do `localhost` usado pela plataforma do aluno. Portas
distintas no mesmo host compartilham cookies. Configure também
`http://admin.localhost:3001/auth/callback` entre as URLs permitidas de
redirecionamento do Supabase do ambiente local.

O login de gestão requer uma identidade Supabase com e-mail confirmado e um
perfil correspondente em `user_profiles` com papel `MENTOR` ou
`ADMINISTRATOR`. Esta aplicação não cria nem promove contas gestoras.

## Limites

A fundação oferece entrada, recuperação, sessão e a página inicial do espaço
de gestão. As operações sobre cursos, alunos e pagamentos serão adicionadas
pelas unidades SFDD correspondentes. A API é responsável pela autorização de
cada operação; a aplicação não acessa o banco diretamente.
