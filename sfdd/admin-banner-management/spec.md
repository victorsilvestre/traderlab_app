# Gestão de banners no admin — Especificação

## Status

Implementada após alinhamento do usuário. A gestão faz parte do MVP, conforme
`traderlab_mvp.txt`. O banco e a leitura da vitrine já existiam; esta unidade
descreve a gestão no admin e a ligação do cadastro aos dados da plataforma.

## Perfil e objetivo

O administrador precisa manter as comunicações visuais da página inicial:
consultar os banners cadastrados, ordenar a sequência, cadastrar banners e
ativar ou inativar sua exibição.

A gestão desta primeira versão é exclusiva de administradores. A vitrine não
segmenta por papel ou curso: todo perfil autenticado que acesse a plataforma
recebe a mesma lista de banners ativos, na ordem definida.

## Escopo

- Adicionar o menu **Banners** no admin, imediatamente antes de **Notificações**.
  Na ordem atual dos cinco itens, fica como o penúltimo item.
- Listar banners cadastrados com miniatura e nome administrativo; manter status,
  posição e ações nos controles alinhados à direita.
- Reordenar os banners ativos entre as cinco posições disponíveis. A ordem é
  controlada por botões explícitos de mover para cima/baixo, sem depender de
  arrastar.
- Cadastrar um banner com nome administrativo, descrição, imagem, texto da
  vitrine/banner, texto alternativo acessível e link de destino opcional.
- Ativar e inativar um banner por ação explícita. Inativar não apaga cadastro,
  imagem nem dados editoriais; libera uma das cinco vagas.
- Exibir na plataforma no máximo cinco banners ativos, em ordem, para todos os
  usuários autenticados, sem segmentação.
- Apresentar carregamento, estado vazio, erro, validação e processamento. Ações
  bem-sucedidas refletem imediatamente na linha sem mensagem persistente abaixo
  do título.
- Preservar os padrões do admin: retorno `← Voltar`, rolagem vertical natural e
  ausência de rolagem horizontal.

## Conteúdo e comportamento

### Listagem e organização

A listagem única apresenta cada banner em uma linha com miniatura 3:1 e nome
administrativo. Status, posição e ações ficam em colunas próprias alinhadas à
direita. Não exibir kicker, texto sobre a imagem, texto de apoio ou link na
linha; esses dados ficam no formulário de edição.
Inativos não ocupam posição na sequência visível da home. O ícone de edição
abre o formulário preenchido para consultar e alterar dados ou imagem. A ação
de inativar usa ícone de pausa vermelho.

Nos ativos, controles de subir/descer trocam a posição com o banner vizinho,
atualizam a listagem imediatamente e persistem a nova ordem. Em caso de falha,
a listagem restaura as posições confirmadas. Os controles de extremos ficam desabilitados. A
listagem identifica as vagas disponíveis, por exemplo “3 de 5 ativos”, e
explica por que a ação de ativar/criar ativo está bloqueada quando as cinco
vagas estão ocupadas. O botão **Novo banner** fica desabilitado e a listagem
exibe junto a ele: “Já tem cinco banners. Você precisa inativar um para
cadastrar outro.”

A ação **Novo banner** abre o formulário. Os campos são agrupados em
**Informações do sistema** (nome, link, texto alternativo e imagem) e
**Informações visualizadas pelo usuário** (kicker, texto sobre a imagem e
texto de apoio). A edição carrega os valores existentes e
mantém a imagem atual quando nenhuma nova imagem é escolhida. Se houver menos de cinco ativos, o
novo banner é ativado ao salvar na posição 1, e os demais ativos avançam uma
posição. Se já houver
cinco, não é permitido salvar um sexto ativo; a interface informa que é
necessário inativar outro banner primeiro. Não se ativa outro banner
implicitamente nem se desativa um existente de forma automática.

### Cadastro

O formulário separa os metadados administrativos do conteúdo visualizado na
vitrine:

- **Nome** obrigatório, para localizar e gerir o registro no admin.
- **Descrição** opcional, texto auxiliar/explicativo do conteúdo.
- **Chamada curta da vitrine** opcional, exibida acima do título.
- **Imagem** obrigatória.
- **Texto da vitrine/banner** opcional, texto mostrado sobre a imagem na home.
- **Texto alternativo** obrigatório, descrição acessível da imagem.
- **Link de destino** opcional; aceita apenas URL HTTP ou HTTPS válida.

Salvar um registro novo ativa-o automaticamente na posição 1 se houver menos de
cinco ativos, avançando as posições dos banners existentes. Se todas as cinco vagas
estiverem ocupadas, cadastro ativo é bloqueado com orientação clara para
inativar um banner existente. Inativar um existente não apaga conteúdo nem
imagem.

Na home, o texto sobre a imagem é apresentado como título principal quando
preenchido. A chamada curta aparece acima e o texto de apoio abaixo. Esses são
os três campos exibidos ao usuário. O nome do banner não é renderizado
na vitrine.
Sem texto da vitrine, a arte é mostrada sem texto sobreposto; se houver destino,
a imagem continua clicável. Sem destino, o banner é informativo e não aparenta
ser clicável. Link preenchido abre em nova aba com proteção contra acesso à
janela de origem.

O formulário mostra prévia em caixa 3:1, com a imagem inteira e sem distorção,
e identifica falhas de seleção, envio ou persistência sem perder os demais
campos.

### Imagem e área visível

- A vitrine, a prévia do admin e as miniaturas usam a mesma moldura 3:1.
- Imagens em 3:1 preenchem a moldura sem faixas vazias nem corte. Arquivos em
  outra proporção são centralizados e ajustados para preencher, podendo perder
  partes das bordas.
- Aceitar imagens JPEG, PNG e WebP de até 5 MB.
- Recomendar 1440 × 480 px (3:1), conforme as artes SVG originais. A proporção
  importa para a exibição uniforme; a resolução pode variar sem mudar o
  enquadramento.

## Regras de acesso e integridade

- Somente administradores podem consultar a gestão e executar cadastro,
  ordenação ou ativação/inativação. A API valida o papel em cada chamada.
- A leitura da vitrine continua exigindo autenticação e retorna somente os
  campos necessários, sem dados administrativos ou caminhos privados.
- A lista da home é global e comum a alunos, mentores e administradores
  autenticados. Não há estado por usuário, matrícula ou curso.
- Nunca pode haver mais de cinco banners ativos; cadastro novo ativa quando há
  vaga e é recusado como ativo quando as cinco estão ocupadas.
- As posições ativas são únicas e sequenciais. Inativos não ocupam posições na
  ordem da vitrine.
- Atualizações de ordem validam que IDs não sejam duplicados e pertençam ao
  conjunto de banners; a operação persiste uma ordem consistente.
- A imagem é armazenada fora do banco; o registro guarda uma referência
  validada. Não expor credenciais nem aceitar paths arbitrários enviados pelo
  navegador.
- Ativar/inativar não exclui. Exclusão permanente não faz parte desta versão.
- Não há agendamento, datas de validade, segmentação, métricas de impressão ou
  clique, histórico de versões nem publicação automática além da ativação
  imediata do cadastro quando há vaga.

## Estados

- Carregamento: indicar que os banners estão sendo consultados.
- Lista vazia: informar que nenhum banner foi cadastrado e oferecer **Novo banner**.
- Vagas disponíveis: mostrar quantidade de vagas restantes entre cinco.
- Limite atingido: desabilitar ativação/criação ativa e explicar que é preciso
  inativar um banner antes.
- Erro: mensagem objetiva e ação para tentar novamente.
- Imagem ausente/inválida: impedir salvar, aceitar JPEG/PNG/WebP e informar o
  limite de 5 MB.
- Link inválido: indicar que se aceita URL HTTP(S) válida.
- Salvando/enviando: bloquear submissões repetidas e indicar processamento.
- Ordem salva ou status alterado: refletir a mudança na listagem sem feedback
  textual persistente.
- Falha ao reordenar ou atualizar estado: manter a ordem/estado confirmado e
  oferecer nova tentativa.
- Sem banners ativos: a home mantém o estado vazio já existente.

## Critérios de aceite

1. **Banners** aparece no menu entre **Cursos** e **Notificações**, antes desta.
2. Administrador consulta todos os banners, ativos e inativos, com miniatura,
   nome administrativo, posição e status.
3. A gestão apresenta uma listagem única com coluna de status e posição dos
   ativos; nunca há mais de cinco itens ativos.
4. Administrador cadastra nome, descrição, imagem, texto da
   vitrine, texto alternativo e destino opcional.
5. Banner novo é ativado na posição 1 e desloca os demais se existir vaga; com
   cinco ativos, o cadastro ativo é impedido e a interface orienta inativar um.
6. Administrador inativa qualquer banner ativo sem apagar seus dados e ativa
   um inativo somente quando houver uma das cinco vagas livres.
7. Administrador altera e persiste a ordem dos ativos com controles de subir e
   descer; posição é sequencial e não pode haver duplicatas.
8. Administrador abre um banner para edição, consulta os valores existentes e
   altera campos ou imagem sem recriar o registro.
9. A home exibe somente banners ativos, ordenados, no máximo cinco.
10. Todo usuário autenticado que acessa a plataforma recebe a mesma vitrine,
   sem filtro por papel, matrícula ou curso.
11. A prévia, a miniatura e a vitrine usam moldura 3:1. Arquivos 3:1 preenchem
    as três áreas sem faixas ou cortes.
12. Todas as linhas da listagem têm estrutura uniforme: miniatura, nome, status,
    posição e ações; não incluem textos editoriais.
13. O texto da vitrine é exibido sobre a imagem quando preenchido; chamada curta
    e descrição aparecem junto dele quando preenchidas.
14. Banner com destino abre URL HTTP(S) em nova aba; banner sem destino não
    aparenta ser clicável.
15. Sessão ausente recebe 401; perfil sem papel de administrador recebe 403
    nas rotas de gestão, inclusive em chamadas diretas.
16. A interface distingue carregamento, lista vazia, vagas, limite atingido,
    erro e falha de salvamento.
17. O admin mantém `← Voltar`, rolagem vertical natural e não introduz rolagem
    horizontal global.

## Alinhamentos confirmados

- Imagem em JPEG, PNG ou WebP até 5 MB.
- A vitrine, prévia e miniaturas usam moldura 3:1. Arquivos 3:1 preenchem as
  áreas sem faixas ou cortes; outras proporções podem perder partes das bordas.
- O texto da vitrine sobreposto à imagem é opcional, pois a própria arte pode
  conter texto.

## Fora desta unidade

- Segmentação de banners por usuário, papel, curso ou matrícula.
- Agendamento, expiração automática ou calendário editorial.
- Exclusão definitiva, restauração e versionamento de imagem.
- Relatórios de impressões, cliques ou conversão.
- Publicação para visitantes sem autenticação; a home atual é autenticada.
- Envio de notificação associado ao banner.
