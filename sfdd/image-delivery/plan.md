# Entrega rápida de imagens — plano técnico

## Aplicações e integração

- `apps/api`: os adaptadores Supabase de imagens de curso e avatar retornam
  `getPublicUrl` com transformação. Banners usam largura máxima de 1440 px,
  capas até 1600 px e avatares 256 × 256 px. A leitura passa a dispensar URLs
  assinadas e o cache de token em memória.
- Supabase Storage: os buckets `traderlab-course-images` e
  `traderlab-profile-avatars` são públicos e recebem cache longo em novos
  uploads. O bucket `traderlab-course-materials` permanece privado. As imagens
  podem ser vistas diretamente quando alguém compartilha a URL.
- `apps/web`: imagens gerenciadas recebem URLs transformadas do CDN e são
  exibidas diretamente, sem um segundo processamento no otimizador do Next.js.
  Preservar placeholders e URLs legadas de outros domínios.
- `apps/admin`: aplicar a mesma entrega direta para imagens do armazenamento;
  previews locais continuam usando object URLs.
- Uploads: redimensionar avatares a 512 px e comprimir para WebP quando
  suportado; manter os limites de formato e tamanho já validados na API.

## Dados existentes e cache

- Caminhos atuais não mudam. A API constrói a variante pública a partir do
  caminho já armazenado, então não é necessário reescrever registros nem copiar
  os objetos existentes.
- Arquivos de imagem usam nomes versionados/únicos; novos uploads recebem
  cache-control de um ano. Materiais e seus controles de acesso não mudam.
- As transformações do Supabase devem estar habilitadas; validar as respostas
  reais antes de concluir a entrega.

## Segurança

- A URL das imagens de curso, banner e avatar passa a ser acessível sem sessão.
  Essa exposição foi aceita para essas imagens. Não colocar documentos ou
  materiais privados nos buckets públicos.
- A mudança de leitura não altera autenticação nem autorização de cursos e
  conteúdos na API.
