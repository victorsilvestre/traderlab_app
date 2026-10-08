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
- Listar banners cadastrados, indicando prévia, nome interno, texto visível,
  estado, posição e link de destino quando houver.
- Reordenar os banners ativos entre as cinco posições disponíveis. A ordem é
  controlada por botões explícitos de mover para cima/baixo, sem depender de
  arrastar.
- Cadastrar um banner com nome interno, título, descrição, imagem, texto da
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

A listagem única apresenta cada banner em uma linha com prévia, nome interno,
textos relevantes, posição, coluna de status (Ativo/Inativo) e ações por ícone.
Inativos não ocupam posição na sequência visível da home. O ícone de edição
abre o formulário preenchido para consultar e alterar dados ou imagem. A ação
de inativar usa ícone de pausa vermelho.

Nos ativos, controles de subir/descer trocam a posição com o banner vizinho e
persistem a nova ordem. Os controles de extremos ficam desabilitados. A
listagem identifica as vagas disponíveis, por exemplo “3 de 5 ativos”, e
explica por que a ação de ativar/criar ativo está bloqueada quando as cinco
vagas estão ocupadas.

A ação **Novo banner** abre o formulário. Os campos são agrupados em
**Informações do sistema** (nome interno, link, texto alternativo e imagem) e
**Informações visualizadas pelo usuário** (kicker, título, texto de apoio e
texto sobre a imagem). A edição carrega os valores existentes e mantém a imagem
atual quando nenhuma nova imagem é escolhida. Se houver menos de cinco ativos, o
novo banner é ativado ao salvar e entra na última posição ativa. Se já houver
cinco, não é permitido salvar um sexto ativo; a interface informa que é
necessário inativar outro banner primeiro. Não se ativa outro banner
implicitamente nem se desativa um existente de forma automática.

### Cadastro

O formulário separa conteúdo editorial e identificação interna:

- **Nome interno** obrigatório, para localizar/gerir o registro no admin.
- **Título** obrigatório, conteúdo editorial associado ao banner.
- **Descrição** opcional, texto auxiliar/explicativo do conteúdo.
- **Chamada curta da vitrine** opcional, exibida acima do título.
- **Imagem** obrigatória.
- **Texto da vitrine/banner** opcional, texto mostrado sobre a imagem na home.
- **Texto alternativo** obrigatório, descrição acessível da imagem.
- **Link de destino** opcional; aceita apenas URL HTTP ou HTTPS válida.

Salvar um registro novo ativa-o automaticamente se houver menos de cinco ativos.
O sistema atribui a próxima posição disponível. Se todas as cinco vagas
estiverem ocupadas, cadastro ativo é bloqueado com orientação clara para
inativar um banner existente. Inativar um existente não apaga conteúdo nem
imagem.

Na home, o texto da vitrine é apresentado como título sobre a imagem quando
preenchido. A chamada curta pode aparecer acima e a descrição abaixo do título.
Sem texto da vitrine, a arte é mostrada sem texto sobreposto; se houver destino,
a imagem continua clicável. Sem destino, o banner é informativo e não aparenta
ser clicável. Link preenchido abre em nova aba com proteção contra acesso à
janela de origem.

O formulário mostra prévia na mesma área visível proporcional usada na home e
identifica falhas de seleção, envio ou persistência sem perder os demais campos.

### Imagem e área visível

- A composição usa a proporção da área de banner já existente na web, não 16:9.
- A área é responsiva; em desktop sua altura atual é
  `clamp(275px, 31vw, 390px)` e em viewport estreito é
  `clamp(280px, 43vw, 340px)`. A largura acompanha a área útil da página.
- A prévia do admin representa essa moldura visível. O autor deve posicionar o
  conteúdo importante dentro dela e conferir o preview antes de salvar.
- O recorte responsivo existente (`background-size: cover`) pode cortar as
  extremidades da imagem em outras proporções. Não distorcer nem mudar a área
  visível para acomodar um arquivo 1920×1080.
- Aceitar imagens JPEG, PNG e WebP de até 5 MB.
- Recomendar proporção 3:1 e resolução de referência 1440 × 480 px, conforme
  as artes SVG originais.
- Orientar o administrador a preparar a imagem na proporção do quadro mostrado
  na prévia. A largura e a altura de exibição se adaptam à tela; não há uma
  largura universal fixa em pixels.

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
2. Administrador consulta todos os banners, ativos e inativos, com posição,
   prévia e atributos editoriais.
3. A gestão apresenta uma listagem única com coluna de status e posição dos
   ativos; nunca há mais de cinco itens ativos.
4. Administrador cadastra nome interno, título, descrição, imagem, texto da
   vitrine, texto alternativo e destino opcional.
5. Banner novo é ativado e colocado na próxima posição se existir vaga; com
   cinco ativos, o cadastro ativo é impedido e a interface orienta inativar um.
6. Administrador inativa qualquer banner ativo sem apagar seus dados e ativa
   um inativo somente quando houver uma das cinco vagas livres.
7. Administrador altera e persiste a ordem dos ativos com controles de subir e
   descer; posição é sequencial e não pode haver duplicatas.
8. Administrador abre um banner para edição, consulta os valores existentes e
   altera campos ou imagem sem recriar o registro.
8. A home exibe somente banners ativos, ordenados, no máximo cinco.
9. Todo usuário autenticado que acessa a plataforma recebe a mesma vitrine,
   sem filtro por papel, matrícula ou curso.
10. A imagem preserva proporção e preview usa a mesma área visível responsiva
    existente na web; não se exige 1920×1080 nem recorte para 16:9.
11. O texto da vitrine é exibido sobre a imagem quando preenchido; chamada curta
    e descrição aparecem junto dele quando preenchidas.
12. Banner com destino abre URL HTTP(S) em nova aba; banner sem destino não
    aparenta ser clicável.
13. Sessão ausente recebe 401; perfil sem papel de administrador recebe 403
    nas rotas de gestão, inclusive em chamadas diretas.
14. A interface distingue carregamento, lista vazia, vagas, limite atingido,
    erro e falha de salvamento.
15. O admin mantém `← Voltar`, rolagem vertical natural e não introduz rolagem
    horizontal global.

## Alinhamentos confirmados

- Imagem em JPEG, PNG ou WebP até 5 MB.
- A moldura e proporção seguem a área responsiva existente na home; o
  administrador usa a prévia no mesmo formato para conferir o resultado, sem
  largura padrão fixa em pixels.
- O texto da vitrine sobreposto à imagem é opcional, pois a própria arte pode
  conter texto.

## Fora desta unidade

- Segmentação de banners por usuário, papel, curso ou matrícula.
- Agendamento, expiração automática ou calendário editorial.
- Exclusão definitiva, restauração e versionamento de imagem.
- Relatórios de impressões, cliques ou conversão.
- Publicação para visitantes sem autenticação; a home atual é autenticada.
- Envio de notificação associado ao banner.

