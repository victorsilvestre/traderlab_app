# TraderLab

Base funcional local do TraderLab. O projeto usa um monorepo TypeScript com web (Next.js), mobile (Expo), API Fastify, worker de importação e PostgreSQL/Supabase configurável por ambiente.

## Início rápido

1. Copie `.env.example` para `.env` e preencha um projeto Supabase temporário quando disponível.
2. Rode `pnpm install`.
3. Rode `pnpm dev:api` e `pnpm dev:web` em terminais separados.
4. Acesse `http://localhost:3000`.

Sem variáveis Supabase, a API inicializa em modo de demonstração para desenvolvimento de interface e parser. Dados reais exigem `DATABASE_URL` e as chaves Supabase.

## Estrutura

- `apps/web`: interface Next.js.
- `apps/mobile`: shell Expo/React Native.
- `apps/api`: API `/v1`.
- `apps/worker`: processamento assíncrono de lotes.
- `packages/domain`: regras de operação e custo.
- `packages/profit-importer`: identificação e leitura de CSVs Nelogica.
- `prisma`: modelo PostgreSQL inicial.

