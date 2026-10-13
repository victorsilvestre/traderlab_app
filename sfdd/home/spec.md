
Menu
- O símbolo “T” no cabeçalho autenticado deverá manter o fundo verde da identidade visual pública;
- Na grade de Meus Cursos, organizar três cursos por linha em telas largas e continuar os itens excedentes nas linhas seguintes;
- O usuário deverá visualizar a logo no canto superior esquerdo;
- O usuário poderá clicar na logo e ser direcionado para a página inicial do site;
- O usário deverá visualizar a ferramenta de pesquisa no canto superior direito;
- O usuário deverá visualizar o símbolo de notificação no canto superior direito;
- O usuário deverá visualizar a imagem de profile no canto superior direito;

Pesquisa
- Ao abrir a busca, o campo e os resultados deverão ter largura suficiente para leitura confortável, sem ultrapassar a tela em dispositivos menores;
- O usuário poderá pesquisar produtos, módulos e aulas;
- O usuário poderá pesquisar por título, descrição e/ou partes/palavras contidas;
- O usuário deverá visualizar a barra de pesquisa extendida após o clique;
- O usuário deverá visualizar a lista de sugestões a partir do que for digitado;
- O usuário poderá clicar e visualizar o produto, módulo ou aula pesquisado;

Notificação
- O menu do sino deverá fechar ao clicar fora dele, pressionar Escape ou navegar por um link do próprio menu;
- O usuário deverá visualizar o símbolo de notificação;
- O usuário deverá visualizar a quantidade de notificações não lidas;
- Ao abrir o sino, o usuário visualizará somente notificações não lidas, com
  no máximo quatro itens; ao marcar uma como lida, a lista será atualizada e
  poderá preencher a vaga com outra notificação ainda não lida;
- O usuário poderá visualizar no sino as notificações não lidas mais recentes,
  com largura e espaço suficientes para ler título e descrição;
- O usuário poderá acessar uma página com todas as notificações recebidas, ordenadas das mais recentes para as mais antigas;
- A página deverá permitir filtrar notificações não lidas, marcar uma notificação como lida ou não lida e marcar todas como lidas; não haverá exclusão pelo usuário;
- Em cada card, a ação de marcar como lida/não lida ficará à esquerda e o link opcional ficará à direita;
- Notificações serão exibidas somente dentro da plataforma nesta etapa;
- Uma notificação poderá ser geral, destinada a todos os usuários, ou vinculada a um curso e destinada aos alunos com matrícula ativa no momento do envio;
- Cada usuário deverá ter seu próprio estado de leitura. A leitura de uma pessoa não deverá alterar a notificação para os demais destinatários;
- O conteúdo da notificação deverá ter título, descrição em texto simples e link opcional. Links internos abrirão na mesma aba; links externos HTTP(S) abrirão em nova aba;
- A gestão de criação e envio pelo administrador/mentor ficará para o sistema administrativo, a ser especificado em breve;

Profile
- O usário deverá visualizar a imagem de avatar da sua conta;
- O usuário poderá clicar na imagem de avatar para acessar "/profile";
- O usuário deverá visualizar as opções "Acessar Perfil" e "Sair da conta" com mouse over no avatar;
- O usuário poderá clicar na imagem de avatar para ver as opções sem precisar deixar o mouse over;
- O usuário poderá clicar fora ou em algum outro lugar do modal de profile para que ele seja fechado;
- O usuário deverá visualizar seus dados cadastrados no momento da criação da conta;
- O usuário poderá editar/alterar seus dados de cadastro;
- O usuário poderá realizar o envio de uma imagem de avatar para que o sistema salve no profile e exiba como avatar para o usuário;

Página Inicial
- O usuário deverá visualizar a vitrine de banners com até 5 comunicações;
- O usuário poderá navegar entre os banners;
- A área visual do banner deverá manter proporção e altura padronizadas por tamanho de tela; a imagem deverá ocupar o quadro sem alterar o espaço reservado, com recorte proporcional quando necessário;
- Quando o banner tiver URL de destino, clicar nele deverá abrir o destino em uma nova aba; banners sem destino não deverão parecer clicáveis;
- O usuário deverá visualizar a lista "Continue Onde Parou", que deverá exibir até 3 conteúdos distintos acessados por ele, em ordem cronológica decrescente, sendo o primeiro o último acessado; se houver menos de 3, deverá visualizar somente os conteúdos acessados e a quantidade correspondente;
- Ao selecionar um conteúdo recente, o usuário deverá ser direcionado para a página desse conteúdo;
- Se o usuário ainda não tiver acessado conteúdos, a seção deverá exibir uma mensagem motivacional para iniciar os estudos; falhas ao carregar o histórico deverão ser informadas separadamente desse estado vazio;
- O usuário deverá visualizar a lista "Meus Cursos", que deverá exibir os produtos comprados por ele e que ele possui direito de acessar;
## Acesso à plataforma por todos os papéis

- Aluno, mentor e administrador autenticados podem usar a mesma experiência de aprendizagem da plataforma: home, busca, cursos, módulos, aulas, materiais, progresso, notificações e perfil.
- O papel de mentor ou administrador acrescenta acesso ao sistema administrativo e não elimina o acesso à plataforma.
- “Meus Cursos”, busca e navegação de conteúdo continuam limitados aos cursos publicados com matrícula ativa do próprio usuário. O papel administrativo, por si só, não cria uma matrícula nem exibe cursos sem vínculo.
- Progresso e estado de leitura de notificações pertencem à própria conta, independentemente do papel.

## Direção visual aprovada para a home — 09/10/2026

- A composição mantém somente os blocos existentes, nesta ordem: banner,
  “Continue Onde Parou” e “Meus Cursos”.
- A navegação da home usa um dock lateral flutuante, recolhido por padrão, com
  rótulos disponíveis ao expandir. Em telas estreitas, ele se posiciona como
  barra flutuante inferior; expandir mostra os rótulos em um painel vertical.
- A retomada usa capa do curso e progresso já disponíveis na resposta da home,
  sem inventar conteúdo ou percentuais.
- Cada card em “Meus Cursos” deve exibir a barra e o percentual de progresso
  retornado para aquele curso.
- O restante da experiência mantém os fluxos, consultas, permissões e destinos
  existentes. O dock navega por âncoras da home e não cria novas funcionalidades.

## Ajustes aprovados durante a validação da home — 13/10/2026

- Remover as marcas TraderLab que sobraram na navegação da experiência de
  aprendizagem, incluindo o logo do dock e a marca textual no cabeçalho/rodapé.
- Manter o cabeçalho sem logo; busca e notificações ficam como ícones no menu
  flutuante, acompanhados por rótulos ao expandir.
- O item de busca do menu não mostra badge. O item de notificações mostra badge
  quando a caixa autenticada tiver notificações não lidas.
- Selecionar busca navega para `/search`; selecionar notificações navega para
  `/notifications`. Remover o popover da busca e o popover de notificações do
  cabeçalho da experiência da home.
- `/search` preserva a busca autenticada atual: cursos, módulos, aulas e
  materiais publicados dentro dos cursos disponíveis para a própria conta;
  consulta parcial por título/descrição; no máximo cinco resultados; estados
  de vazio, sem resultados e falha; seleção navega ao destino existente.
- A página de busca permite digitar e consultar resultados sem modal. A busca
  continua limitada a 120 caracteres e mantém o debounce atual. O atalho `/`
  foca o campo quando o usuário não está digitando em outro controle; Escape
  não fecha uma página/modal, então não tem ação associada.
- As notificações permanecem na página existente com filtros e ações atuais;
  o badge usa a contagem não lida já fornecida pela API.

## Ajustes aprovados do dock e do perfil — 13/10/2026

- O dock mostra somente o ícone BB quando recolhido e a logo completa Trader
  Bruno Borges quando expandido.
- O dock não oferece atalho “Continue de onde parou”; a seção de retomada da
  home permanece disponível e com seu conteúdo atual.
- O menu do avatar permanece aberto enquanto o cursor transita do avatar para
  o painel e enquanto estiver sobre ele, permitindo acessar perfil ou sair.
- A página de perfil também oferece ação para encerrar a sessão, reutilizando
  o fluxo de logout existente.

## Página autenticada de cursos — 13/10/2026

- A opção “Cursos” do dock abre `/courses`, uma página interna com todos os
  cursos publicados e liberados para a conta autenticada.
- Cada curso é apresentado em um cartão organizado em grade responsiva, com capa
  ou imagem neutra quando não houver capa, nome e descrição.
- Selecionar o cartão ou sua ação principal abre o detalhe existente em
  `/courses/:courseId`; não há ações de compra nem descoberta de cursos não
  vinculados à conta.
- A página informa a quantidade real de cursos quando a lista carrega.
- Se a consulta falhar, mostrar estado de erro separado do estado vazio e
  orientar atualizar a página. Se retornar zero cursos, explicar que os cursos
  liberados aparecerão ali quando disponíveis. A lista carregada não recebe um
  limite visual ou paginação artificial nesta etapa.
- As regras de publicação, matrícula, perfil e autorização da API permanecem
  responsáveis por determinar quais cursos aparecem. A mesma página atende os
  perfis autenticados já autorizados a consumir a plataforma.

## Ajustes visuais da home — 13/10/2026

- Dar espaço vertical entre o cabeçalho/navegação e o início do banner para a
  composição não parecer colada ao topo.
- Exibir a arte na proporção original 1440:480 (3:1), com altura resultante da
  largura disponível. Em telas estreitas, preservar a proporção e reduzir a
  largura, sem cortar a cabeça ou os pés da pessoa da imagem.
- Os textos e controles do carrossel permanecem sobrepostos à arte, legíveis e
  dentro do quadro; os banners seguem fluindo até os limites do conteúdo.

## Vitrine e entrega de imagens — validação posterior

- Limitar a vitrine a no máximo 1440 pixels e manter a proporção 3:1 em todos
  os tamanhos responsivos.
- Exibir a imagem completa dentro do quadro, centralizada quando a proporção do
  arquivo não coincidir com a do banner. Não cortar a arte nem completar o
  quadro com uma faixa colorida; qualquer área de respiro usa um tom escuro da
  própria identidade visual.
- Banners, capas e avatares gerenciados são servidos por URLs públicas estáveis
  com transformação do Supabase. As imagens podem ser acessadas diretamente por
  quem possuir o link, sem autenticação; materiais de curso continuam privados.
- A variante transformada é dimensionada conforme o uso e otimizada pelo CDN,
  sem passar por um segundo proxy de imagem no Next.js. Se a transformação falhar,
  a interface mantém o placeholder neutro sem ícone quebrado.
- Uploads novos de avatar e imagens administrativas são redimensionados e
  comprimidos quando possível, com nomes únicos e cache de longa duração.
- No cadastro pelo admin, banners são redimensionados proporcionalmente para
  caber em 1440 × 480 e capas de curso, módulo e conteúdo em 1920 × 1080. A
  conversão para WebP reduz o peso quando suportada; falha na conversão mantém
  o arquivo original e não impede o envio.
