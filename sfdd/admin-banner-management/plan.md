# Gestão de banners no admin — Plano técnico

## Status e decisões aprovadas

Implementado conforme esta abordagem. A feature pertence ao MVP. O schema
Prisma, a tabela `home_banners`, o DTO público, o endpoint autenticado
`GET /home/banners` e a integração da home já existiam.

Decisões confirmadas: no máximo cinco banners ativos; cadastro cria ativo e
ocupa a próxima posição quando houver vaga; com cinco ativos não há ativação ou
cadastro ativo até o administrador inativar um; nome interno é separado do
título, descrição e texto visível da vitrine; a arte segue a área responsiva já
implementada na web, sem formato de arquivo 16:9 obrigatório; upload aceita
JPEG/PNG/WebP até 5 MB; texto sobreposto é opcional. A prévia do formulário usa
a própria proporção do carrossel e orienta o enquadramento sem impor largura
fixa em pixels. As artes SVG originais usam quadro 1440 × 480 px (3:1), que o
formulário passa a informar como resolução de referência.

## Aplicações e módulos afetados

### API (`apps/api`)

- Manter a leitura de banners no módulo atual `notification`, que já contém
  `HomeBannerService`, `PrismaHomeBannerRepository` e `homeBannerRoutes`.
- Acrescentar contratos de gestão específicos em `packages/contracts`, sem
  expor linhas Prisma.
- Implementar consulta administrativa individual e lista única de ativos e
  inativos; incluir imagePath somente no DTO de gestão.
- Implementar criação, edição dos dados e imagem, alteração de status e reordenação em serviço de
  aplicação/repositório Prisma.
- Fazer criação e checagem de vagas na mesma transação: se já existem cinco
  ativos, retornar erro de domínio/API compreensível, sem gravar cadastro
  ativo parcialmente.
- Ao ativar um inativo, contar ativos de forma concorrente segura e recusar
  quando o limite de cinco for atingido.
- Inativação libera vaga e compacta as posições restantes. A ativação coloca o
  banner na última posição disponível.
- Proteger cada endpoint de gestão para `administrator`; leitura da vitrine
  permanece disponível a qualquer usuário autenticado.
- Validar URL HTTP(S), tamanhos dos campos, ordem e associação do objeto de
  imagem no servidor.

### Armazenamento de imagens

- Reutilizar o bucket privado `traderlab-course-images`, com paths sob `banners/`
  e URL assinada para leitura; emitir upload assinado apenas após validar tipo,
  tamanho e papel administrativo.
- Implementar endpoint autenticado para emissão de upload autorizado, seguindo
  o padrão já usado para capas de curso, módulo e aula, aceitando JPEG/PNG/WebP
  até 5 MB, sem aceitar MIME/tamanho
  ou path arbitrário.
- Persistir no banco apenas o identificador/path validado, mantendo o DTO da
  vitrine compatível ou atualizando-o em conjunto com a web.
- Planejar substituição de imagem sem excluir objetos antigos automaticamente,
  salvo regra aprovada de limpeza.

### Admin (`apps/admin`)

- Adicionar item **Banners** antes de **Notificações**, visível somente a
  administradores.
- Criar `/banners` para listagem, ordem e estado, `/banners/new` para cadastro e
  `/banners/[bannerId]` para edição, com BFF autenticado e componentes nas
  categorias `ui`, `forms` e `navigation` existentes.
- Manter cada banner em uma linha horizontal com ações iconográficas; o botão
  de criação e os botões de salvar/cancelar também usam ícones com rótulos de
  acessibilidade e tooltip.
- Usar o padrão `← Voltar` e retorno contextual validado.
- Apresentar uma tabela única com coluna de status, indicador `n de 5` e posição dos ativos.
- Em cinco ativos, bloquear ativação/cadastro ativo com instrução para inativar
  primeiro; não desativar nenhum banner automaticamente.
- Oferecer mover para cima/baixo apenas para ativos; operações persistem ordem
  em uma transação.
- Mostrar prévia na área visível responsiva do banner web, além de nome interno,
  campos editoriais e destino.
- Upload, formulários e ações preservam o padrão global de rolagem e não criam
  overflow horizontal.

### Web (`apps/web`)

- Preservar o carrossel e o contrato de leitura já existentes.
- Confirmar que todos os perfis autenticados recebem a mesma consulta,
  filtrada por `PUBLISHED`, ordenada por posição e limitada a cinco.
- Atualizar DTO/leitor para retornar título, descrição e texto de vitrine
  separadamente, se esses campos tiverem papéis distintos aprovados.
- Renderizar texto de vitrine sobre a imagem somente quando preenchido; manter
  imagem informativa/clicável conforme a presença de destino.
- Usar a mesma área responsiva da home: desktop
  `height: clamp(275px, 31vw, 390px)`; viewport estreito
  `height: clamp(280px, 43vw, 340px)`. Preview do admin deve compartilhar ou
  reproduzir fielmente proporção, posicionamento e recorte existentes.
- Adaptar resolução de `imagePath` se Storage exigir URL assinada; nunca expor
  path privado ao browser.

## Banco e migration

O modelo `HomeBanner` agora também tem `internalName`, `description`,
`eyebrowText` e `overlayText`. As migrations aditivas foram aplicadas no Supabase
de desenvolvimento e mantiveram os três banners originais, suas imagens,
chamadas, títulos e descrições.

O limite de cinco deve ser garantido na camada de aplicação usando transação e
tratamento de concorrência, não somente por validação de UI. Reordenar e
ativar/inativar deve deixar posições dos ativos únicas e sequenciais.

## Ordem de implementação

1. Mapear o modelo atual e os três registros de banner.
2. Definir/provisionar armazenamento e política de leitura da imagem.
3. Atualizar schema/migration e DTOs aprovados, preservando seed legado.
4. Implementar consulta, criação, ativação/inativação e ordem na API.
5. Implementar upload e associação validados pelo servidor.
6. Criar BFF e telas do admin com capacidade, erros e prévia.
7. Integrar os campos editoriais e imagem ao carrossel mantendo o contrato
   autenticado global e limite de cinco.
8. Validar autorização, concorrência no limite, ordenação, upload e vitrine.

## Segurança e riscos

- A checagem exclusiva na navegação não basta; todas as rotas administrativas
  verificam sessão e papel.
- Não confiar em URLs, MIME types, paths, IDs ou ordem fornecidos pelo cliente.
- Operações concorrentes de ativação/criação podem ultrapassar cinco sem
  transação/serialização; testar o caso de duas ativações simultâneas.
- Quando cheia, a seção inativa precisa continuar descoberta e fácil de usar,
  permitindo inativar rapidamente um item e então ativar/cadastrar.
- URL de leitura assinada tem validade de uma hora e cache no adaptador de
  Storage; a leitura renova URLs próximas da expiração.
- A imagem mantém área visual responsiva e recorte `cover` atuais; prévia deve
  evitar divergência entre o admin e a home.
- Evitar quebrar os banners iniciais referenciados como `/banners/*.svg`.
