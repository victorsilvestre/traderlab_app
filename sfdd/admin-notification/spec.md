# Gestão de notificações no admin — Especificação

## Status

Implementada e validada pelo usuário. Esta unidade descreve a gestão
administrativa de notificações internas da plataforma.

## Perfil e objetivo

O administrador precisa consultar notificações já disparadas, abrir seus
detalhes para ver quem recebeu e criar uma nova notificação para os usuários,
usando as segmentações já existentes no produto.

## Escopo

- Adicionar “Notificações” à navegação do workspace administrativo.
- Oferecer três telas: listagem geral, detalhes da notificação e cadastro/envio.
- Abrir os detalhes ao selecionar uma notificação e o cadastro pelo botão
  “Nova notificação”.
- Listar notificações publicadas/disparadas, com data, público, curso associado
  quando aplicável e quantidade de destinatários.
- Permitir consultar quem recebeu cada notificação, o e-mail do aluno e quando
  cada entrega foi registrada.
- Criar e disparar uma notificação com título, descrição, link opcional e
  público geral ou de um curso.
- Apresentar estados de carregamento, lista vazia, falha, envio concluído e
  validação do formulário.
- Manter a rolagem vertical natural do admin e impedir rolagem horizontal na
  página.

## Conteúdo e comportamento

### Listagem

Cada item apresenta título, trecho da descrição, data do disparo, público,
curso quando houver e total de destinatários. Uma ação acessível abre os
detalhes dos destinatários, mostrando nome, data de entrega registrada e estado
de leitura quando disponível. A data individual vem de `deliveredAt`; a data do
disparo da notificação vem de `publishedAt`.

A listagem deve permitir encontrar os registros mais recentes primeiro e
carregar mais resultados sem criar uma área de rolagem vertical independente.
Busca, filtros e exportação não fazem parte desta proposta.

### Nova notificação

O formulário contém:

- Título (obrigatório, até 180 caracteres).
- Descrição (obrigatória, até 3.000 caracteres).
- Link de destino opcional (URL HTTP ou HTTPS, endereço iniciado com `www.`
  que será completado com `https://`, ou caminho interno; até 2.048 caracteres
  após normalização).
- Público: geral ou curso.
- Curso (obrigatório quando o público for curso).

As duas segmentações disponíveis são:

- **Todos os usuários cadastrados** (`geral`). São elegíveis os perfis de
  qualquer papel associados a uma identidade Supabase existente, incluindo
  alunos, administradores e futuros mentores. Confirmação de e-mail e estado
  de bloqueio da identidade não alteram essa segmentação.
- **Alunos com matrícula no curso** (`curso`). São elegíveis todos os usuários
  associados a uma identidade Supabase existente e com matrícula `ACTIVE` no
  curso selecionado, independentemente do papel. Um administrador ou mentor
  matriculado também recebe a notificação.

O admin oferece somente essas duas opções. Ao selecionar público curso, o
administrador também seleciona o curso. Antes de enviar, a tela confirma os
critérios de público escolhidos. A quantidade final e a criação dos registros
de destinatário são determinadas pela API no momento do envio.

Salvar envia e publica imediatamente a notificação, seguindo o padrão atual do
produto de tornar o conteúdo disponível ao salvar. Uma confirmação final
explica o público e o número estimado de pessoas que receberão o aviso. A ação
principal é “Enviar notificação”; não há rascunho, agendamento, aprovação ou
envio por e-mail nesta unidade. E-mails automáticos e comunicações com identidade
visual da empresa serão tratados em etapa futura após configuração do Supabase;
as notificações internas cobrem o fluxo previsto nesta etapa.

Na listagem, abrir uma notificação leva à tela de detalhes. Ela apresenta os
atributos do disparo e uma lista de destinatários com nome, e-mail e data
individual de envio. O botão “Nova notificação” abre uma tela de cadastro com o
padrão administrativo de retorno e formulário. “Cancelar” volta ao histórico
sem disparar a notificação.

## Regras de acesso

- Somente administradores podem ver a navegação, consultar o histórico,
  detalhes e enviar notificações nesta primeira versão.
- A API valida identidade, papel, curso permitido, público e destinatários em
  cada requisição. Restringir a interface não substitui autorização no
  servidor.
- A API só retorna dados pessoais dos destinatários para administradores
  autenticados.
- Notificações publicadas e seus registros de destinatário não são removidos
  nesta unidade.

## Estados

- Carregamento: indicar que o histórico está sendo consultado.
- Vazio: explicar que ainda não há notificações enviadas e oferecer “Nova
  notificação” a quem pode enviar.
- Erro: mensagem objetiva com opção para tentar novamente.
- Formulário inválido: indicar o campo e como corrigi-lo sem limpar os demais.
- Público sem usuários elegíveis: explicar se faltam usuários cadastrados ou
  matrículas ativas no curso selecionado.
- Envio em andamento: impedir submissão duplicada e informar que o disparo está
  sendo processado.
- Envio concluído: confirmar envio e quantidade final de destinatários; incluir
  o registro no histórico.
- Falha no envio: informar que não houve confirmação do disparo e permitir
  tentar novamente sem alegar sucesso.

## Critérios de aceite

- A navegação do workspace exibe “Notificações” somente para administradores.
- Um administrador consulta a lista, as datas e os públicos de notificações
  disparadas.
- A tela de detalhes identifica cada destinatário por nome e e-mail e exibe sua
  data individual de envio.
- O administrador pode enviar uma notificação geral ou associada a um curso.
- O campo de link aceita URL com protocolo ou iniciada por `www.`; neste caso,
  `https://` é incluído antes de validar e salvar.
- Perfil mentor, aluno ou sessão inválida não acessa telas nem endpoints
  administrativos, inclusive por chamada direta à API.
- A notificação publicada aparece para os destinatários elegíveis na área do
  aluno e o histórico registra destinatários e entregas.
- Público geral inclui todos os perfis de qualquer papel com identidade
  Supabase existente, independentemente de confirmação de e-mail ou bloqueio;
  público de curso inclui qualquer papel com matrícula `ACTIVE` no curso.
- Erros de API, lista vazia e envio sem destinatários são estados distintos e
  têm mensagem útil.
- O envio não duplica destinatários nem deixa uma notificação publicada sem os
  respectivos registros de destinatário em caso de falha transacional.
- A tela preserva scroll vertical natural e não introduz rolagem horizontal.

## Fora desta unidade

- E-mails de sistema personalizados e disparos de comunicação por e-mail; serão tratados após a configuração do Supabase.
- SMS, WhatsApp ou outros serviços externos.
- Notificações agendadas, recorrentes, editáveis após o disparo ou canceláveis.
- Segmentação além de público geral e alunos com matrícula ativa em um curso.
- Exportação, relatórios avançados, métricas de abertura e reenvio individual.
- E-mail como canal de envio; a notificação continua sendo interna à plataforma.

## Decisões de dados registradas

- “Usuário cadastrado” é qualquer perfil existente com identidade Supabase
  existente. Não há filtro por papel, confirmação de e-mail ou bloqueio da
  identidade; para o público de curso, acrescenta-se a matrícula `ACTIVE`.
- O schema não guarda e-mail no perfil de produto. A API precisará obter o
  endereço da identidade Supabase para apresentá-lo na tela de detalhes e
  persistir um snapshot no destinatário para o histórico.
- Se a entrega ao aluno incluir e-mail além da notificação interna, isso exige
  decisão e especificação separadas de canal, consentimento e falhas de entrega.
