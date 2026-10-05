# Fluxos de acesso — Plano técnico

## Escopo

Atualizar a apresentação web já existente de login, cadastro, recuperação, redefinição e confirmação de e-mail. A API e o módulo de autenticação não serão alterados.

## Aplicação afetada

- `apps/web`: `AuthShell`, `AuthForm`, estilos globais e arte visual local.
- Rotas App Router existentes: `/sign-in`, `/sign-up`, `/password-recovery`, `/password-reset` e `/email-confirmation`.

## Abordagem

- Reorganizar a casca compartilhada em painel de formulário à esquerda e painel fotográfico à direita, com proporção aproximada de 1:3 em desktop.
- Usar imagem local otimizada pelo componente `next/image`, com texto de apoio já presente no produto.
- Ocultar o painel de imagem em telas menores e manter marca e formulário legíveis.
- Ajustar os textos, a navegação entre fluxos, o aviso legal e a indicação de senha mínima conforme `spec.md`.
- Mostrar “Entrar com Google” como opção futura desabilitada, sem dependência ou integração.
- Preservar lógica de envio, sessão, callbacks e mensagens implementada em `AuthForm` e `authentication-page`.
- Atualizar o wireframe grayscale como referência estrutural independente de APIs e imagem real.

## Segurança e acessibilidade

- Manter validações e autenticação no servidor/API conforme os fluxos existentes.
- Expor a opção Google como desabilitada também para tecnologia assistiva.
- Preservar rótulos, mensagens `role="alert"`/`role="status"` e foco visível.
- Não criar links para páginas jurídicas que ainda não existem.

## Riscos

- O painel menor precisa acomodar formulários de cadastro e redefinição em alturas de viewport reduzidas; permitir rolagem vertical quando necessário.
- O aviso jurídico é apenas informativo até que as páginas e URLs legais sejam definidas.
