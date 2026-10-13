# Plano técnico — acesso público

## Aplicação e fronteiras

- Alterar apenas `apps/web` e os artefatos SFDD deste fluxo.
- Não há mudança nas camadas da API, contratos, banco de dados ou provedores.
- Manter App Router responsável pelas rotas e os componentes existentes como
  fronteira para formulários e callback.

## Implementação

- Criar CSS Modules para a composição compartilhada de acesso e para os
  formulários, mantendo estilos específicos fora de `globals.css`.
- Reformular `AuthShell` com a identidade aprovada, composição editorial e
  adaptação para telas menores.
- Aplicar classes locais aos controles de `AuthForm`, sem alterar submissões,
  nomes de campo, acessibilidade ou mensagens.
- Reutilizar o shell compartilhado no callback; preservar sua lógica cliente.
- Redesenhar a apresentação não autenticada da rota `/`; manter despacho de
  usuários autenticados e estado de falha do perfil.
- Atualizar `CourseBreadcrumbs` e os estilos locais existentes: separador
  `ChevronRight`, links ancestrais sutis, folha atual realçada com truncamento
  visual, título completo no DOM e entrada breve respeitando movimento reduzido.

## Segurança e validação

- Preservar `getSafeReturnPath`, validação do lado da API e sessão Supabase.
- Manter controles de foco visível, `role="alert"`, `role="status"` e rótulos.
- Validar a codificação dos textos com `pnpm check:text-encoding` e executar
  verificação de tipos da aplicação; inspeção visual no navegador se o ambiente
  local permitir iniciar o servidor.
