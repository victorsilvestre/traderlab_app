# Catálogo de cursos administrativos — Plano técnico

## Aplicações e módulos

- apps/admin: páginas /courses, /courses/new e /courses/[courseId];
  layout permanece compartilhado no grupo (workspace).
- apps/api/src/modules/course: manter regras e persistência no módulo
  existente; acrescentar casos de uso de gestão sem alterar as consultas da
  plataforma de aprendizagem.
- packages/contracts: DTOs de listagem, entrada e atualização administrativa.
- Banco: acrescentar caminhos de imagem em courses, course_modules e course_contents. Manter as colunas de URL existentes durante a compatibilidade e gravar novos uploads somente nos campos de caminho.
- A página de estrutura do curso usa largura centralizada de até 1320 px. Botões de configuração e adição exibem somente ícones, com nomes acessíveis/tooltips, e a coluna dos controles de ordenação tem largura reservada.
- Storage: bucket privado `traderlab-course-images`, URLs assinadas de upload/leitura, JPEG/PNG/WebP até 5 MB; o navegador envia o arquivo usando token temporário criado pela API. O caminho persistido é associado ao registro alvo. A interface recomenda proporção 16:9 e 1920 × 1080 px; não rejeita outras dimensões porque a apresentação usa `background-size: cover`.

## API

Adicionar rotas administrativas próprias sob /admin/courses:

- GET /admin/courses?query=&status=&page=: filtra antes de paginar; retorna até 25 itens, total e páginas.
- POST /admin/courses: cria como publicado e associa createdById à identidade
  validada no servidor.
- PATCH /admin/courses/:courseId: atualiza dados do curso e, quando solicitado,
  estado de publicação e publishedAt.
- POST /admin/course-images/upload-url: administrador solicita token temporário para curso, módulo ou conteúdo existente; API valida destino, MIME e tamanho.

A camada de apresentação exige identidade válida e papel administrator.
O cliente não pode enviar o autor como autoridade. O serviço valida e normaliza
entrada, e o repositório Prisma mapeia os registros para DTOs. Não aceitar
campos desconhecidos.

## Web

- Páginas Server Component carregam o catálogo por helper de apps/admin/lib.
- Ações de busca, filtro, formulário e publicação usam Client Components
  pequenos onde há estado/interação.
- O helper obtém a sessão Supabase do host admin e chama a API com bearer token;
  a API repete a autorização.
- Componentes seguem as categorias ui/ e forms/.
- Estados de erro e vazio têm mensagens diferentes.
- Paginação no servidor usa tamanho fixo de 25, mantém os parâmetros de busca e status, e renderiza controles fora da tabela para usar o scroll normal da página.
- O formulário de curso cria/atualiza como publicado, solicita autorização de upload, envia o arquivo ao bucket privado e associa o caminho ao curso. Se houver falha no upload após criar o registro, a tela informa o estado parcial e encaminha para retomar a edição.
- Estilos ficam em CSS Modules, seguindo os tokens provisórios do admin.

## Segurança e consistência

- Não consultar Prisma/Supabase diretamente pela aplicação admin.
- Não aceitar createdById do navegador.
- Rascunhos continuam ocultos nas rotas de consumo da plataforma.
- Despublicação é uma ação explícita e reversível; salvar cria ou publica o
  curso. Exclusão não faz parte da interface.
- A atualização de publishedAt acompanha a transição para publicado e é limpa
  ao despublicar.
- Imagens da plataforma são assinadas somente depois da autorização de curso existente; nenhuma URL pública de arquivo de aula é criada.
- O cartão usa `next/image` com `sizes` responsivos e qualidade 100 para capas assinadas do bucket privado. O domínio e caminho do bucket são limitados por `remotePatterns`; imagens legadas permanecem no caminho atual. O quadro é 16:9 com `object-fit: contain` e sem escala no hover para preservar toda a arte.

## Padrão de entrega de imagens aprovado posteriormente

A entrega aprovada para capas de curso também vale para imagens de módulos e conteúdos: bucket privado, caminho persistido, URL assinada reutilizada pelo adaptador compartilhado, `Cache-Control` de uma hora em novos uploads e exibição responsiva com `CourseImage`/qualidade 90. O item anterior que mencionava qualidade máxima foi substituído por esta decisão. A tela administrativa de módulo/conteúdo ainda será especificada e deverá consumir o mesmo endpoint e as mesmas opções de upload.
