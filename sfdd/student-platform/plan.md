# Plataforma web autenticada — plano

## Limites de arquitetura

- Aplicação afetada: `apps/web`.
- Usar as consultas/API e DTOs atuais de `authentication`, `course`, `progress`,
  `notification` e `user`; nenhuma alteração é prevista em API, banco ou
  contratos.
- App Router mantém a composição das rotas. Componentes visuais continuam em
  `apps/web/components/ui/`; navegação reutilizável permanece no dock/área de
  navegação existente. CSS Module mantém os estilos por responsabilidade.
- Login, cadastro e demais rotas públicas não fazem parte desta unidade.

## Abordagem de interface

- Criar `StudentWorkspaceShell` Server Component para compor o dock aprovado e
  suas páginas filhas. Ele busca a contagem não lida pelo token autenticado, com
  falha isolada para que navegação principal continue disponível.
- Fazer o dock resolver rota inicial, área ativa, logo, badge e perfil; cursos
  e conteúdos pertencem à mesma área de navegação.
- Envolver cada tela privada existente no shell, removendo cabeçalhos duplicados
  com ações de conta e preservando a estrutura de conteúdo específica.
- Alinhar `CourseScreen.module.css`, `ProfileScreen.module.css` e os estilos
  compartilhados da home aos tokens aprovados. Reservar espaço para dock fixo em
  desktop e mobile; não transferir estilos de autenticação pública.
- Preservar `CourseImage`, imagens assinadas e classes de recorte atuais onde a
  imagem tenha função editorial/operacional; não alterar URL nem privacidade.

## Segunda rodada — composição visual

- Reestruturar o leitor dentro de `CourseContentView` sem mudar seu carregamento:
  masthead editorial, player com presença, leitura principal de medida limitada,
  lista de materiais operacional e currículo lateral recolhível.
- Refinar o detalhe para hierarquia imagem/título/progresso, retomada e módulos;
  manter os modos de visualização e busca local existentes.
- Reorganizar notificações como fluxo de leitura com metadados e ações
  escaneáveis; distinguir não lidas sem acento de borda espessa.
- Ajustar o formulário de perfil com identidade no topo e grade de campos em
  desktop, preservando validação, upload, salvamento, estado incompleto e logout.
- Alinhar biblioteca e busca ao ritmo editorial comum, sem alterar resultados,
  dados ou interação.
- Aplicar ajustes responsivos no CSS Module existente. Sem dependências,
  mudanças na API, alterações em rotas públicas ou substituição do dock.

## Refinamento de escala e proporções

- Ajustar apenas os CSS Modules das telas privadas, preservando a composição e
  os estilos da Home aprovada.
- No detalhe do curso e nas capas de módulos, fixar proporção 16:9 e usar
  `object-fit: cover` para eliminar barras sem distorção; manter o player de
  aula em 16:9.
- Reduzir escala, alturas e espaçamentos do cabeçalho e do bloco de retomada
  para antecipar a galeria de módulos.
- Alinhar o cabeçalho da aula à coluna do vídeo com a mesma grade responsiva do
  player e do currículo; liberar a largura integral do título dentro dessa
  coluna, sem truncar o texto.
- Afinar títulos e respiros do leitor, pesquisa, notificações e perfil conforme
  a varredura visual; manter estrutura de dados, ordem das ações e destinos.
- Atualizar o wireframe cinza do detalhe para registrar a abertura mais
  compacta e módulos visíveis cedo.

## Rotas

| Rota | Fonte atual | Estados/limites |
| --- | --- | --- |
| `/home` | Home autenticada | Composição aprovada; preservar consulta e seções |
| `/courses` | `getStudentCourses` | Biblioteca, vazio e falha |
| `/courses/:courseId` | `getStudentCourse` | Detalhe, não encontrado/não autorizado e falha |
| `/courses/:courseId/contents/:contentId` | `openStudentCourseContent` e `getStudentCourse` | Aula/material, conclusão, downloads, currículo e falha |
| `/search` | `searchAccessibleCourseContents` | Consulta, vazio, resultados e falha |
| `/notifications` | `getNotifications` e Server Actions | Filtros, leitura, paginação, vazio e falha |
| `/profile` | Consulta/perfil existente | Edição, avatar, conclusão cadastral e logout |

## Segurança e dados

- API segue impondo usuário, papel, publicação e matrícula; nenhuma filtragem de
  frontend substitui autorização.
- Usar a sessão servidor já disponível. Não passar tokens para componentes de
  navegador e não consultar Supabase diretamente na UI.
- Contagem do badge vem de `GET /notifications` autenticado; falha retorna
  contagem indisponível/zero sem derrubar a tela atual.

## Validação

- Tipagem da web, `pnpm check:text-encoding` e `git diff --check`.
- Inspecionar build/resultados desktop e móvel juntos quando navegador estiver
  disponível. Tentativa do servidor local: `pnpm dev:web`; o erro conhecido é
  `spawn EPERM` neste ambiente.
- Não ampliar para reformular rotas públicas ou criar capacidades novas.
