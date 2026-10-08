# Gestão de alunos no admin — Plano de testes

## Preparação

Criar perfis de diferentes papéis com nomes, e-mails e telefones que permitam
testar correspondências no início, meio e fim dos campos, sem correspondência,
diferença de caixa e caracteres numéricos repetidos. Incluir usuários de todos
os papéis atuais, com/sem matrícula e com/sem progresso, além de perfil legado
sem identidade/e-mail.

## Cenários funcionais

1. Administrador abre `/users` e vê perfis de todos os papéis, com o papel
   identificado em tabela com cabeçalho, paginação e ordenação estável.
2. Buscar trecho como `vic` encontra ocorrências no meio do nome ou e-mail;
   buscar `981` encontra telefones que contêm a sequência.
3. Busca não diferencia maiúsculas/minúsculas, ignora espaços externos e
   combina nome, e-mail e telefone por OR.
4. Mudar o termo retorna à primeira página; paginação mantém o termo atual.
5. Busca sem resultados mostra estado próprio com ação para limpar o filtro.
6. Lista realmente vazia tem mensagem distinta de busca sem resultados e de
   falha da API.
7. Abrir um usuário mostra perfil e papel, e-mail, telefone, avatar, data de
   cadastro, todas as matrículas (ativas e revogadas), resumo de progresso e
   notificações, sempre em seções distintas e pertencentes ao mesmo usuário.
8. Usuário sem matrícula, progresso ou notificações continua acessível
   e cada seção mostra seu estado vazio sem erro.
9. E-mail indisponível não bloqueia detalhes dos demais dados.
10. Voltar dos detalhes preserva query e página quando possível.
10.1. Clicar na linha, no nome ou em “Visualizar” abre os detalhes do mesmo
     usuário.
11. Compras não aparecem nesta fase; último acesso corresponde a login válido,
    e a última atividade de aprendizagem permanece identificada separadamente.
12. Mudança de e-mail no fluxo de autenticação mantém o valor local pesquisável;
    validar backfill e comportamento de e-mail indisponível.

## Autorização e privacidade

1. Administrador autenticado acessa listagem, pesquisa e detalhes.
2. Sessão ausente/inválida recebe 401; mentor e aluno recebem 403 também por
   chamada direta à API.
3. Um usuário de qualquer papel é consultável pelo administrador; ID inexistente
   retorna 404.
4. DTOs não contêm senha, token, sessão, corpo de aula nem dados de outros
   alunos.
5. Falha na fonte de identidade é comunicada como falha operacional, não como
   zero resultados.

## Interface, acessibilidade e regressão

1. Busca tem rótulo acessível, submissão por teclado, foco visível e resultado
   anunciado de forma compreensível.
2. Listagem e detalhes funcionam em viewport estreito sem rolagem horizontal
   global.
3. “← Voltar” segue o padrão das telas administrativas.
4. Executar testes, typecheck, lint, validação de UTF-8 e `git diff --check`.
