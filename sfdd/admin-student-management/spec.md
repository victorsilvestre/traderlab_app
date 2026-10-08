# Gestão de alunos no admin — Especificação

## Status

Fase 1: consulta, pesquisa e detalhes de usuários. Cadastro de usuários e
criação de matrículas ficam fora desta fase e serão especificados como fase
posterior. O histórico de compras fica para a futura funcionalidade de
pagamentos e não faz parte desta entrega.

## Perfil e objetivo

O administrador precisa localizar qualquer usuário cadastrado, identificar seu
papel e consultar seus dados, matrículas e atividade de aprendizagem sem editar
esses registros nesta primeira entrega.

## Escopo desta fase

- Adicionar o menu **Alunos** ao workspace administrativo, antes de **Cursos**.
- Criar uma tela de listagem paginada de todos os perfis cadastrados,
  independentemente do papel.
- Permitir pesquisa parcial por nome, e-mail ou telefone.
- Criar uma tela de detalhes do usuário com seções separadas de dados
  cadastrais, matrículas, resumo do progresso e notificações.
- Mostrar a data do último login/acesso à plataforma na listagem e nos detalhes,
  registrando-a no servidor quando a fonte de autenticação não fornecer um
  valor confiável.
- Mostrar a atividade de aprendizagem separadamente da data de último acesso.
- Restringir listagem, busca e detalhes a administradores, com autorização na API.
- Preservar navegação vertical natural e impedir rolagem horizontal global.

## Listagem e pesquisa

Os resultados aparecem em uma tabela com cabeçalho e uma linha por usuário,
apresentando nome, e-mail, papel, telefone, data de cadastro, último login e
ação “Visualizar”. A linha inteira, o nome ou a ação abre os detalhes. A lista
é ordenada por nome e identificador de forma estável e paginada no servidor.

A busca ignora maiúsculas/minúsculas, espaços no início/fim e procura o termo
em qualquer trecho do nome, e-mail ou telefone. Exemplos: `vic` encontra nomes
ou e-mails que contenham `vic`; `981` encontra telefones que contenham essa
sequência. A pesquisa combina os campos com OR. Não é necessário preencher mais
de um campo; existe uma única caixa de pesquisa.

Uma busca somente por nome, telefone ou e-mail é aceita; o texto informado é
pesquisado nos três campos em conjunto. Resultados, total e paginação refletem
o filtro aplicado. Alterar o termo inicia
uma nova busca a partir da primeira página. Uma busca sem resultados apresenta
estado vazio específico e opção de limpar o termo. A consulta não deve carregar
todos os perfis no navegador.

## Detalhes do usuário

A tela organiza as informações em quatro seções empilhadas verticalmente. A
quantidade de matrículas não deve alterar a disposição das demais seções.

- **Dados cadastrais:** nome, e-mail, telefone, papel, avatar quando disponível,
  data de cadastro e último login. Apresentar os campos lado a lado em uma faixa
  horizontal responsiva.
- **Matrículas:** todas as matrículas, ativas ou revogadas, com curso, estado,
  origem e data da concessão.
- **Progresso:** resumo do progresso de aprendizagem em seção independente,
  incluindo aulas acessadas/concluídas e última atividade de aprendizagem.
- **Notificações:** quantidade de notificações recebidas e não lidas do próprio
  usuário.

Na listagem, a tabela permanece em linha única por usuário em telas amplas. Em
telas estreitas, cada linha pode reformatar seus campos em bloco rotulado, sem
criar rolagem horizontal global.

Não exibir senha, tokens, metadados internos de autenticação nem dados de outros
usuários. O e-mail fica persistido no perfil para pesquisa e consulta, mantendo
o Supabase Auth como fonte de autenticação. Se estiver indisponível, exibir
“E-mail indisponível”, sem impedir o restante da consulta.
Datas usam o fuso horário da interface administrativa.

A tela deve manter a ação padrão “← Voltar” para retornar à listagem,
preservando termo de pesquisa e página quando possível.

## Acesso e perfis

- Somente administradores podem ver o menu, a listagem, a pesquisa e os detalhes.
- Mentor, aluno e sessão inválida não podem obter dados através de chamadas
  diretas à API.
- A listagem inclui todos os perfis cadastrados, qualquer que seja o papel
  (aluno, administrador, mentor ou papel futuro), e identifica o papel de cada
  pessoa.
- A autorização é validada no servidor em cada endpoint.

## Estados

- Carregamento: indicar que a lista ou detalhes estão sendo consultados.
- Lista vazia: explicar que ainda não existem usuários cadastrados.
- Busca sem resultados: informar que não foram encontrados alunos para o termo
  e permitir limpar a busca.
- Erro: mensagem objetiva e ação para tentar novamente.
- Perfil sem matrícula, compras, atividade ou notificações: exibir estado vazio
  por seção, sem falha.
- Identidade/e-mail indisponível: mostrar os demais dados e sinalizar a ausência
  do e-mail.
- Identificador inválido ou usuário inexistente: estado de não encontrado, sem
  expor dados.

## Critérios de aceite

- “Alunos” aparece no menu administrativo antes de “Cursos”.
- Um administrador consulta uma lista paginada de todos os perfis e identifica
  o papel de cada usuário.
- Busca parcial encontra correspondências no nome, e-mail e telefone sem
  diferenciar maiúsculas/minúsculas.
- A busca ocorre no servidor e combina os campos por OR.
- A tela de detalhes apresenta dados cadastrais, todas as matrículas, resumo do
  progresso e resumo das notificações em seções distintas, sem dados de
  autenticação sensíveis.
- A navegação de retorno preserva a busca/página quando possível.
- Chamadas diretas sem sessão ou de perfil não administrador são rejeitadas.
- Estados vazio, sem resultado, erro e dados auxiliares ausentes são distintos.
- A interface não cria rolagem horizontal global.

## Fora desta fase

- Criar ou editar perfis de aluno.
- Enviar convite, definir senha ou alterar credenciais.
- Criar, revogar ou editar matrículas.
- Consultar ou alterar pagamentos.
- Exportação, filtros avançados, ações em massa e relatórios.
- Exibir histórico além dos registros de matrícula e progresso já disponíveis.

## Decisões e pontos técnicos

- O modelo local `UserProfile` contém nome, telefone, avatar, papel e data de
  cadastro. Não contém e-mail; este fica no provedor de identidade.
- Matrículas e progresso são relações já presentes no banco. Não é esperada
  migration para a consulta básica, salvo se a investigação de implementação
  identificar necessidade concreta.
- O schema atual define os papéis `STUDENT`, `ADMINISTRATOR` e `MENTOR`. A
  interface deve exibir todos os valores recebidos e usar um rótulo legível
  para papéis futuros sem ocultar o usuário.
- O fluxo normal vincula o perfil local e a identidade Supabase pelo mesmo UUID.
  Um perfil sem identidade seria um registro inconsistente ou legado; deverá
  continuar visível, com e-mail indisponível, em vez de ser ocultado.
- O histórico de compras está explicitamente reservado para a futura
  funcionalidade de pagamentos e não será exibido nesta fase.
- O último acesso à plataforma é diferente da última atividade de aprendizagem.
  A implementação deve usar o campo de último login da identidade se for
  confiável; caso não esteja disponível ou não represente sessões da plataforma
  de forma adequada, registrar o último login no servidor durante autenticação.
- Cadastro e matrícula devem ser uma unidade posterior com fluxo e regras
  próprias, especialmente integração de identidade, senha/convite e origem da
  matrícula.
