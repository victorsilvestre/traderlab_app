# Fluxos de acesso — Especificação

## Status

Em implementação visual; os fluxos de autenticação já existem em `sfdd/authentication/`.

## Perfil do usuário

Visitante que deseja entrar, criar uma conta ou recuperar a senha.

## Objetivo

Apresentar os fluxos de login, cadastro e recuperação de senha em uma experiência visual consistente, clara e responsiva.

## Elementos e ações

### Login

- Formulário à esquerda, centralizado no painel, com título, subtítulo, e-mail e senha.
- Ação principal para entrar e link “Esqueceu a senha?” para `/password-recovery`.
- Opção “Entrar com Google” identificada como indisponível por enquanto, seguida pelo separador “ou” e pelos campos de login.
- Link “Não possui conta? Cadastre-se.” para `/sign-up`.
- Aviso sobre os Termos de Uso e a Política de Privacidade.
- Não exibir na tela de login o reenvio do link de confirmação de e-mail, que é um fluxo de exceção.
- Área visual com imagem ampla à direita, ocupando aproximadamente três quartos da tela em desktop.

### Cadastro

- Formulário com nome, e-mail, telefone, senha e confirmação de senha.
- Requisito mínimo de senha visível: 6 caracteres.
- Opção “Entrar com Google” identificada como indisponível por enquanto, seguida pelo separador “ou”.
- Link “Possui conta? Faça login.” para `/sign-in`.

### Recuperação de senha

- Título, subtítulo, campo de e-mail e ação para enviar instruções.
- Link “Possui conta? Faça login.” para `/sign-in`.

### Redefinição e confirmação

As telas existentes de redefinição de senha e reenvio de confirmação mantêm seus comportamentos e passam a usar a mesma organização visual. Não alterar regras do fluxo técnico documentadas em `sfdd/authentication/`.

## Comportamento esperado

- A navegação entre login, cadastro e recuperação abre a rota correspondente.
- O acesso com Google é apenas informativo e não inicia autenticação.
- Os formulários existentes continuam submetendo para os fluxos já implementados.
- Em telas menores, a imagem é ocultada e o formulário ocupa a largura disponível.
- Estados de envio, sucesso e erro existentes permanecem visíveis e acessíveis.

## Critérios de aceitação

- [ ] Login, cadastro, recuperação, redefinição e confirmação usam uma apresentação consistente.
- [ ] Em desktop, o formulário aparece à esquerda e a imagem ocupa cerca de 75% da largura à direita.
- [ ] Em dispositivos móveis, os formulários permanecem legíveis e utilizáveis sem a imagem.
- [ ] Os links entre login, cadastro e recuperação levam às rotas existentes.
- [ ] A opção Google aparece antes do separador “ou”, como indisponível e sem iniciar uma integração.
- [ ] A tela de login não exibe uma ação para reenviar o link de confirmação de e-mail.
- [ ] O cadastro informa visualmente o requisito mínimo atual de senha.
- [ ] O aviso de Termos de Uso e Política de Privacidade aparece no login.
- [ ] Os estados de validação, envio, sucesso e erro dos formulários continuam funcionando.

## Exclusões explícitas

- Autenticação com Google ou qualquer outro provedor social.
- Alterações à API, regras de autenticação, cadastro, recuperação ou autorização.
- Criação do conteúdo jurídico de Termos de Uso ou Política de Privacidade.
- Alterações aos critérios de senha aprovados em `sfdd/authentication/`.
