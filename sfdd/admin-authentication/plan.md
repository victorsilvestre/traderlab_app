# Autenticação do ambiente de gestão — Plano técnico

## Estado inicial que orientou o plano

- `apps/api/src/modules/authentication` usa Supabase Auth para credenciais e
  validação de token; `user_profiles` no PostgreSQL, consultado por Prisma,
  guarda o papel. O cadastro público cria `STUDENT`.
- `/authentication/sign-in` autentica qualquer papel confirmado. A função
  atual cria um perfil `STUDENT` caso uma identidade Auth não tenha perfil.
- `/authentication/me` valida bearer token e devolve o papel persistido.
- A web atual guarda sessão Supabase em cookies SSR próprios e usa a API para
  confirmar identidade. Recuperação e reenvio de confirmação usam
  `WEB_APP_URL` fixo para construir callbacks.
- A API aceitava uma única origem web em CORS. `apps/admin` ainda não continha
  código de aplicação.

## Estado da implementação local

`apps/admin` já contém as páginas e a sessão SSR. A API tem entrada e consulta
de perfil específicas para gestores, além de origens configuradas para os dois
sites. Testes de caso de uso e rota, typecheck, lint e builds locais passaram.
Ainda faltam cadastrar o callback administrativo no painel Supabase e validar
entrada, saída e recuperação com contas gestoras reais no navegador.

## Limites e fluxo de dados

```text
Navegador em admin.traderbrunoborges.com.br
  -> apps/admin (formulários, callback, cookies e páginas)
  -> apps/api (autenticação, perfil e autorização)
     -> Supabase Auth (credenciais, tokens e e-mails de autenticação)
     -> Prisma / PostgreSQL (user_profiles: UUID e papel)
```

`apps/admin` não consulta Prisma, tabelas Supabase nem chaves de serviço.
Recebe apenas contratos da API. O perfil persistido é a fonte de papel; claims
ou dados enviados pelo navegador não concedem acesso administrativo.

| Evento               | Supabase Auth                                        | PostgreSQL via Prisma                                          |
| -------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| Entrada              | Confere e-mail, senha e confirmação; emite tokens.   | Busca `user_profiles` pelo UUID Auth e lê o papel existente.   |
| Página protegida     | Valida ou renova a identidade associada ao token.    | Lê o papel atual; a permissão pode ter mudado desde a entrada. |
| Recuperação de senha | Envia o link e altera a senha da própria identidade. | Não altera papel nem cria matrícula ou perfil.                 |
| Saída                | Encerra a sessão local do admin.                     | Não altera dados do produto.                                   |

Não há sincronização de senha com o PostgreSQL: a senha permanece sob
responsabilidade do Supabase Auth. O vínculo entre as fontes é o UUID do
usuário. Perfil ausente impede entrada de gestor; o fluxo administrativo não
cria perfil automaticamente.

## Entrada administrativa na API

Adicionar uma operação de entrada específica para o ambiente de gestão no
módulo `authentication`, por exemplo `POST /authentication/workspace/sign-in`.
Ela reutiliza o provedor Supabase e o contrato de sessão existente, mas exige
que `UserProfileRepository.findById` devolva um perfil já existente com papel
`MENTOR` ou `ADMINISTRATOR`. Não chama `createForStudent` nesse fluxo. E-mail
não confirmado continua bloqueado. Para um perfil não autorizado, não devolve
tokens. O endpoint público de entrada da plataforma continua com seu
comportamento atual.

O Route Handler de `apps/admin` recebe e-mail/senha, chama essa operação no
servidor e só então persiste a sessão Supabase SSR em cookies do host admin.
A resposta ao navegador contém apenas dados necessários à navegação e erros
seguros, nunca access ou refresh token. Em caso de falha, nenhum cookie de
sessão administrativa é emitido.

## Verificação contínua de sessão e papel

- Em páginas protegidas, ler a sessão SSR e chamar
  `/authentication/workspace/me` com o bearer token. Exigir `mentor` ou
  `administrator` no servidor antes de renderizar o ambiente. Essa consulta
  não cria perfil de aluno se o perfil do gestor tiver sido removido.
- Não usar o Proxy do Next.js como única proteção. Ele pode renovar cookies;
  a decisão de papel vem da API. A camada de autorização da API verificará
  papel e propriedade em cada rota de gestão quando essas rotas existirem.
- Tratar 401 confirmado como sessão inválida. Tratar 5xx, timeout e falha de
  rede como indisponibilidade recuperável, preservando cookies.
- Se o token é válido, mas o perfil não é mais de gestor, impedir acesso e
  limpar a sessão local do admin. A mudança de papel deve ser percebida na
  próxima navegação ou operação protegida.
- Usar `cache: 'no-store'` para consultas de identidade e respostas privadas;
  não compartilhar HTML ou respostas com `Set-Cookie` por cache público.

## Recuperação, confirmação e callback

- Manter os endpoints de recuperação e reenvio existentes, acrescentando um
  discriminador fechado de aplicação, como `destination: 'web' | 'admin'`.
  O servidor mapeia cada valor para uma origem configurada. O padrão continua
  sendo `web` para compatibilidade com a plataforma atual. Nunca aceitar URL
  arbitrária do pedido.
- Configurar as duas URLs de callback exatas na lista permitida do Supabase.
  Cadastro público continua enviando confirmação para a plataforma; reenvio
  solicitado no admin pode voltar ao admin.
- Implementar `/auth/callback` no admin para os formatos de link suportados
  pela integração atual. Após o callback de recuperação, abrir
  `/password-reset`; após confirmação, limpar a sessão transitória do link e
  abrir `/sign-in`. Limitar `next` a caminhos internos previstos.
- Na página de redefinição, enviar o token validado ao endpoint existente de
  senha. Concluída a alteração, encerrar a sessão local criada pelo link e
  pedir nova entrada. O reset pode ser concluído por uma conta sem papel de
  gestor; ele altera a senha da própria conta, sem conceder acesso ao admin.
- Preservar resposta genérica de recuperação e confirmação e os tratamentos
  atuais para falha/rate limit do provedor.

## Independência das sessões

Produção usa cookies sem atributo `Domain`, restritos a cada host. Não usar
domínio compartilhado para sessão. O admin e a plataforma usam o mesmo projeto
Supabase e podem autenticar a mesma pessoa separadamente. Saída usa escopo
local no admin e não deve encerrar a sessão da plataforma.

No desenvolvimento, **portas diferentes no mesmo `localhost` não isolam
cookies**. Usar hosts locais distintos e verificar no navegador o isolamento,
o ciclo de renovação e a saída. Se necessário, definir também chaves de
armazenamento distintas para cada aplicação após conferir a versão instalada
de `@supabase/ssr`. Documentar os hosts escolhidos em exemplos de ambiente.

## Origem, configuração e segurança

- Atualizar a API para origens exatas da plataforma e do admin em CORS. As
  rotas chamadas apenas pelo servidor do Next.js não dependem de CORS, mas
  chamadas futuras do navegador precisam da origem autorizada.
- Variáveis de URL para os dois frontends devem ser validadas na inicialização
  da API. Segredos de Supabase e `DATABASE_URL` ficam apenas em `apps/api`.
- Requisições que alteram estado e usam cookies no admin precisam de proteção
  de origem/CSRF apropriada. Operações de produto devem preferir token bearer
  para a API e sempre aplicar autorização nela.
- Não registrar senhas, tokens, cookies ou links completos de recuperação em
  logs. Mensagens públicas não revelam se um e-mail existe.
- O provisionamento de gestores deve criar a identidade Auth confirmada e o
  perfil correspondente com papel apropriado, ou promover uma conta existente
  por procedimento restrito. Esta unidade apenas exige a presença do perfil;
  a operação de provisionamento pertence a SFDD próprio.

## Aplicações, módulos e contratos afetados

| Área                                  | Mudança prevista                                                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `apps/admin`                          | Rotas de entrada, recuperação, confirmação, callback e redefinição; sessão SSR; proteção de páginas; saída e estados de erro. |
| `apps/api/src/modules/authentication` | Caso de uso e rota de entrada para gestores; seleção fechada do destino de e-mails; validação de identidade e perfil.         |
| `apps/api/src/modules/access`         | Verificação de papel reutilizável quando a primeira rota de gestão for criada; não criar abstração vazia nesta unidade.       |
| `packages/contracts`                  | Reutilizar `SignInDto` e `UserProfileDto`; alterar contratos somente se a fronteira exigir.                                   |
| `apps/web`                            | Manter o fluxo público atual; ajustar chamadas de recuperação somente se o novo contrato exigir.                              |
| Configuração da API                   | Origens exatas para os dois sites e URLs de callback.                                                                         |

Não há migração de banco prevista para esta unidade. A tabela `user_profiles`
já guarda o papel e o UUID da identidade Auth.

## Dependências e pontos de atenção

- `sfdd/admin-foundation` define a criação e o layout de `apps/admin`; este
  plano define os fluxos de autenticação que a fundação precisa usar.
- `AGENTS.md` foi atualizado para refletir a decisão de duas aplicações web.
- A técnica de gravação de cookies da web atual usa detalhes internos do
  cliente Supabase; revisar a integração instalada antes de reutilizá-la.
- O provisionamento de perfis de gestor é pré-requisito para validar o fluxo
  completo com contas reais, mas não autoriza criar ou promover contas nesta
  unidade.

## Referências técnicas

- [Supabase: autenticação com renderização no servidor](https://supabase.com/docs/guides/auth/server-side).
- [Supabase: URLs permitidas de redirecionamento](https://supabase.com/docs/guides/auth/redirect-urls).
- [RFC 6265: cookies não oferecem isolamento por porta](https://www.rfc-editor.org/rfc/rfc6265.html).
