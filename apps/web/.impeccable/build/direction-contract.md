# Direção aprovada — home da plataforma web

**Escolha do usuário:** Galeria imersiva (`percurso-de-estudo.html`), proposta
code-led selecionada em 09/10/2026.

## Primeiro viewport

- Usar o mundo visual TraderLab compartilhado com o administrativo: canvas
  `#F5F3EF`, superfícies `#FFFBF7`, texto `#0C0D0E`, verde `#A2CB10`, ícones
  em `#354604`, títulos editoriais e cantos arredondados.
- Mostrar um dock lateral flutuante, separado das bordas e elevado por sombra
  difusa. O estado inicial é recolhido, com o monograma e os ícones. Um controle
  explícito expande o dock e revela os rótulos; o estado também funciona por
  teclado e informa `aria-expanded`.
- Manter busca, notificações e identificação da conta acessíveis no cabeçalho;
  o avatar e as ações da conta também ficam no fim do dock.
- Após o cabeçalho, mostrar as mesmas três áreas e nesta ordem: banner;
  “Continue Onde Parou”; “Meus Cursos”. Não inserir conteúdo entre elas.
- Dar mais presença às capas dos cursos em uma galeria com pesos visuais
  variados. Cada curso mostra a barra e o percentual real de progresso.

## Interação de assinatura

O dock abre e recolhe por botão, preserva uma área de toque confortável e mantém
os nomes acessíveis mesmo quando os rótulos estão visualmente recolhidos. Em
telas estreitas, o estado compacto vira uma barra flutuante inferior; expandir
mostra um painel vertical com os rótulos.

## Limites e conteúdo

- Preservar consultas autenticadas, acesso, ordenação, banners, busca,
  notificações, retomada, cursos e destinos existentes.
- Links do dock levam às seções da própria home; nenhuma rota ou capacidade nova
  é introduzida.
- A retomada usa a capa do curso e o percentual já carregados pela home; sem
  capa, mantém um quadro neutro. Não inventar imagem nem dado de progresso.
- Não transformar a galeria em vitrine de compra: a compra permanece futura.

## Risco conhecido

Capas em proporção diferente podem sofrer recorte na galeria; a composição
responsiva precisa manter títulos e barras de progresso legíveis em desktop e
mobile.
