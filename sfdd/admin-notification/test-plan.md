# Gestão de notificações no admin — Plano de testes

## Objetivo

Definir a validação da gestão administrativa antes da implementação. Estes
cenários são critérios previstos; não foram executados.

## Preparação de dados

Preparar identidades de administrador, mentor e aluno; contas confirmadas,
pendentes de confirmação e bloqueadas; alunos com matrícula ativa, sem
matrícula e com matrícula revogada; notificações existentes para público geral e curso; e
destinatários lidos e não lidos. Usar ambiente de teste isolado e não enviar
notificações demonstrativas para usuários reais.

## Cenários funcionais

1. Administrador abre `/notifications` e vê notificações publicadas da mais
   recente para a mais antiga, com título, público, curso quando aplicável,
   data do disparo e total de destinatários.
2. Lista vazia mostra estado vazio distinto de erro e oferece criação a papel
   autorizado.
3. Falha ao carregar a lista mostra mensagem e ação de tentar novamente.
4. Administrador abre a tela de detalhes e consulta destinatários em uma lista
   separada, com nome, e-mail e `deliveredAt`; validar paginação.
5. Administrador envia notificação geral com dados válidos; ela é publicada,
   tem `publishedAt` e cria um destinatário por usuário com identidade
   existente, incluindo perfis de aluno, administrador e mentor. Confirmação
   de e-mail e bloqueio não removem usuários do público.
6. Administrador envia notificação associada a curso; qualquer usuário com
   identidade existente e matrícula `ACTIVE` recebe o registro, inclusive um
   administrador matriculado. Usuários sem matrícula ativa são excluídos.
   Confirmação de e-mail e bloqueio não removem usuários do público.
7. Envio de curso inexistente, link inválido, título/descrição vazios ou acima
   dos limites é rejeitado com feedback no campo/solicitação; não há publicação.
   URL válida iniciada por `www.` é normalizada para `https://`; links que já
   contêm protocolo permanecem inalterados.
8. Público “curso” sem curso associado não é aceito; público “geral” não exige
   seleção de curso.
9. Público sem destinatários resulta em erro claro e nenhum registro publicado
   incompleto.
10. Envio confirmado atualiza a lista sem exigir recarregamento completo da
    aplicação; falha não é apresentada como sucesso.

## Autorização e isolamento

1. Sessão ausente ou inválida não consulta lista, detalhes nem envia
   notificações.
2. Perfil `mentor` ou `student` recebe 403 também em chamada direta à API.
3. Mentor não pode abrir o item do menu nem acessar telas de histórico,
   detalhes ou criação.
4. Aluno não pode acessar rotas administrativas nem ver destinatários de
   terceiros.
5. DTO administrativo inclui nome/e-mail somente nas rotas de detalhes
   protegidas para administrador; não inclui tokens, segredos ou outros dados
   pessoais desnecessários.

## Consistência e concorrência

1. Falha durante gravação de destinatários desfaz também a notificação e não
   deixa estado parcialmente publicado.
2. Uma matrícula revogada antes da seleção não recebe notificação de curso.
3. Um aluno com mais de uma matrícula/associação elegível recebe apenas um
   registro por notificação.
4. Clique duplo não produz submissões simultâneas; validar que erro de rede não
   é exibido como sucesso.
5. A data global usa `publishedAt`; a data individual usa `deliveredAt`; o
   estado de leitura reflete `readAt` e não altera a data de disparo.
6. Falha ao consultar estado/e-mail de identidades Supabase não cria público
   incompleto nem apresenta envio parcial como sucesso.

## Interface, acessibilidade e regressão

1. Validar teclado, foco visível, rótulos de formulário, erros associados aos
   campos, nomes acessíveis dos controles e abertura/fechamento de detalhes.
2. Validar viewport amplo e estreito: sem rolagem horizontal global, rolagem
   vertical natural do admin e conteúdo de lista legível.
3. Confirmar que o fluxo atual de leitura e atualização de notificações do aluno
   permanece compatível com os DTOs e rotas existentes.
4. Executar typecheck, lint, testes do módulo/contratos e build dos projetos
   afetados; verificar UTF-8 e `git diff --check`.

## Critérios de seleção de usuários

Usuário cadastrado é qualquer perfil com identidade Supabase existente,
independentemente do papel. Público geral não filtra confirmação de e-mail ou
bloqueio. Público de curso exige também matrícula `ACTIVE` no curso escolhido,
independentemente de o perfil ser `STUDENT`, `ADMINISTRATOR` ou `MENTOR`.
