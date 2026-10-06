# Conteúdo do aluno — tipo aula: plano técnico

## Objetivo e escopo

Documentar a evolução da página de leitura de conteúdo existente para atender à aula do MVP: vídeo do YouTube incorporado, título, descrição, texto complementar e materiais de apoio. A especificação original em `spec.md` é a fonte do escopo de produto e deve ser preservada. Este plano detalha a tradução técnica, sem autorizar implementação por si só.

O MVP inclui aulas, materiais, acesso às aulas e progresso. Exercícios e provas permanecem fora do MVP conforme `traderlab_mvp.txt`. Tipos futuros devem poder ser acrescentados em unidades SFDD próprias, depois de definidos seus comportamentos.

## Estado atual observado

- A página do aluno já usa `/courses/[courseId]/contents/[contentId]` e delega a apresentação a `CourseContentView`.
- O modelo `CourseContent` possuía `kind`, `title`, `description`, `body` e um `resourceUrl` opcional; esta implementação acrescenta `videoUrl` dedicado e relação ordenada um-para-muitos com `CourseMaterial`.
- `CourseContentKind` contém `LESSON` e `MATERIAL`; o campo legado `resourceUrl` continua disponível para conteúdos do tipo material e compatibilidade. A aula usa `videoUrl` e a coleção `materials`.
- A API já localiza conteúdo publicado dentro de curso publicado, exige acesso ativo do aluno e oferece registro de abertura e conclusão explícita. O DTO inclui metadados da aula, `body`, URL e estado de conclusão.
- A view anterior renderizava texto e um link HTTP(S) genérico. Esta unidade adiciona player YouTube, lista de arquivos e navegação curricular.

Essas observações identificam lacunas; não determinam comportamento de produto além do especificado.

## Abordagem proposta

### Web — `apps/web`

- Manter a rota App Router e a página como Server Component responsável por sessão, carregamento autenticado e composição da tela.
- Evoluir `CourseContentView` e seu CSS Module em `components/ui/`; manter o cabeçalho e breadcrumb nos componentes de navegação existentes. Extrair apenas unidades com responsabilidade/interação independente.
- No topo, apresentar breadcrumb, retorno ao curso, módulo, título e descrição da aula em largura total. Logo abaixo, alinhar o início do vídeo à esquerda e o início da listagem curricular à direita, na mesma linha. A coluna principal segue com vídeo, “Sobre esta aula”, materiais de apoio e conclusão; a coluna direita contém módulos e aulas navegáveis.
- A listagem à direita deve refletir a hierarquia do curso (módulos com aulas), indicar a aula atual e o estado concluído/não concluído das aulas, e permitir abrir outra aula publicada do curso. Cada módulo é recolhível/expansível independentemente para facilitar cursos extensos. Usar a lista já conhecida da página de curso; não incluir quizzes, exercícios, provas ou materiais avulsos como se fossem aulas nesta etapa.
- A coluna curricular acompanha o fluxo normal da página, sem `position: sticky`, altura limitada ou rolagem interna. A tela mantém uma única rolagem vertical do documento: a lista pode ficar longa, mas módulos fechados reduzem seu comprimento e evitam um segundo eixo de rolagem concorrente.
- Em viewport estreito, empilhar as colunas e apresentar a listagem em seção recolhível/expansível acessível para que a aula continue prioritária. Preservar foco e localização quando navegar para outra aula.
- O player será uma incorporação responsiva de vídeo YouTube. Validar e normalizar a URL no servidor ou em helper compartilhado apropriado; converter somente IDs/URLs reconhecidos para `https://www.youtube-nocookie.com/embed/{videoId}`. Rejeitar protocolos não HTTP(S), hosts não permitidos, URLs inválidas e entradas que não representem vídeo suportado. Nunca interpolar URL arbitrária diretamente no `src` do iframe.
- Usar iframe com título acessível, `loading="lazy"`, `referrerPolicy` apropriada e permissões mínimas necessárias ao player. Incluir link acessível para abrir o vídeo no YouTube em nova aba e mensagem clara se URL ausente/inválida ou incorporação indisponível.
- Conteúdo textual usa JSON estruturado versionável: documento `doc` com parágrafos, títulos 2/3, listas, itens, citação, texto marcado em negrito/itálico/sublinhado e links HTTP(S). A API valida/normaliza por allowlist e limita profundidade, número de nós e tamanho de texto. O frontend renderiza elementos React correspondentes; HTML recebido nunca é executado. Texto legado sem JSON válido vira parágrafos simples. A tela de edição/editor permanece em unidade futura de gestão de conteúdo.
- Uma aula tem no máximo um vídeo, representado por URL/ID próprio de YouTube; duas aulas e dois vídeos são dois registros de aula. Shorts e playlists não são aceitos. Materiais de apoio são entidades/arquivos diferentes do vídeo e podem ser múltiplos por aula.
- Decisão de implementação: materiais são arquivos no bucket privado `traderlab-course-materials` do Supabase Storage. Metadados guardam nome, caminho de objeto, MIME, tamanho e posição; o caminho nunca é exposto ao aluno. A API revalida papel de aluno, matrícula, curso/aula publicados e vínculo do material, então emite URL assinada de 60 segundos com download forçado. O app web redireciona para essa URL só depois de validar sua origem Supabase. Segredos de armazenamento permanecem exclusivamente na API.
- O bucket precisa ser provisionado como privado no projeto Supabase antes de downloads reais; o servidor não cria buckets nem altera configuração do serviço implicitamente. Configure `SUPABASE_COURSE_MATERIALS_BUCKET` caso use outro nome.
- Upload e associação de novos arquivos pela interface do mentor, gestão do conteúdo rico, validação de tipo/tamanho no upload e política de remoção pertencem à futura unidade de gestão de conteúdo. Esta unidade implementa leitura e download seguro dos registros existentes, sem criar essa tela administrativa.
- Estados sem material mostram mensagem discreta, sem esconder a aula. Falha no carregamento/abertura de um arquivo não deve bloquear vídeo ou texto.
- Continuar usando a ação existente de conclusão explícita e indicar visualmente quando concluída. Abertura registra retomada conforme o caso de uso atual; assistir ao vídeo não conclui automaticamente a aula nesta unidade.
- Criar estados visuais responsivos e acessíveis: carregamento (aproveitar `loading.tsx`), erro de carregamento, conteúdo/aula indisponível, vídeo indisponível, sem materiais e conteúdo concluído/não concluído. Erro de player não deve bloquear texto ou anexos.

### API e contratos

- Manter regras de leitura no módulo `course`; autorização permanece em API, conferindo identidade, papel de estudante, matrícula ativa e publicação do curso/módulo/aula em cada acesso.
- A rota de conteúdo precisa obter também a estrutura publicada do curso para construir a navegação lateral. Reutilizar a consulta autenticada de detalhe do curso ou criar um DTO agregado apropriado; evitar uma consulta por aula/módulo. O retorno de conteúdo e a estrutura curricular devem obedecer à mesma matrícula ativa e regra de publicação.
- Os itens de navegação devem apontar somente para aulas publicadas acessíveis no curso. A API já omite rascunhos na consulta de curso; validar novamente ao abrir cada item. A tela não deve simular autorização por ocultação no cliente.
- Expandir DTOs em `packages/contracts` para expressar os dados necessários sem vazar linhas Prisma. A aula precisa identificar o vídeo de forma explícita, distinta de `resourceUrl` genérico. Materiais de apoio devem ser uma coleção de DTOs públicos mínimos (ID estável se necessário, nome, URL, e metadados de apresentação opcionais).
- A associação dos materiais à aula está definida conceitualmente como relação própria de um para muitos, ordenada e separada do vídeo. Falta escolher a origem dos arquivos (armazenamento privado ou links externos transitórios) e, então, fechar metadados e fluxo de entrega correspondentes. A forma atual `resourceUrl` singular não comporta o requisito; não serializar anexos em `body` nem reutilizar o campo de vídeo.
- A API retorna metadados de materiais apenas quando associados a uma aula publicada no curso autorizado. O endpoint de download repete validações de autorização e usa URL assinada curta. Não incluir storage path, segredo ou URL permanente no DTO do aluno.
- Validar formato e domínio do vídeo na fronteira de escrita/gestão quando essa funcionalidade existir. Na leitura, validar novamente antes de gerar URL de incorporação para tolerar dados legados inválidos.
- Não aceitar `studentId` do navegador. Progresso continua isolado pelo usuário derivado da sessão verificada.

## Dependências e decisões para implementação

1. Confirmado: suportar URLs de vídeos individuais do YouTube, incluindo `youtube.com/watch?v=`, `youtu.be/` e `youtube.com/embed/`; excluir Shorts e playlists.
2. Confirmado: aula tem um vídeo próprio e zero ou mais materiais de apoio independentes. Implementar relação própria e coleção ordenada de materiais.
3. Confirmado e implementado: materiais em bucket privado Supabase Storage, URL assinada de download de 60 segundos; bucket exige provisionamento privado no painel/projeto Supabase.
4. Confirmado e implementado: corpo em JSON estruturado com allowlist; texto legado continua sendo apresentado como parágrafos. Interface de autoria fica na unidade de gestão.
5. Migração aditiva criada: `video_url` é preenchido apenas para URLs reconhecidas como vídeos YouTube individuais; Shorts, playlists e URLs não reconhecidas continuam no campo legado sem conversão.
6. Confirmado e implementado: tela de aula inclui listagem navegável dos módulos e aulas publicadas em coluna à direita, alinhada ao topo do vídeo no desktop; cada módulo recolhe independentemente. A lateral não é fixa e não tem rolagem própria, mantendo uma única rolagem vertical. Em telas estreitas, lista recolhível antes da aula.

Esses pontos devem ser fechados no escopo das tarefas antes de implementar alterações de banco/API que dependam deles. A implementação visual pode avançar contra contratos fictícios apenas após a autorização das tarefas correspondentes.

## Segurança, privacidade e acessibilidade

- A API deve revalidar publicação e matrícula ativa para leitura direta; indisponibilidade por acesso negado não pode revelar conteúdo privado.
- Não permitir iframe arbitrário nem esquemas `javascript:`, `data:` ou outros. Restringir a construção da origem do embed aos hosts YouTube aprovados e escapar/validar o ID.
- Não inserir segredos de API YouTube no navegador; um embed público não necessita de chave.
- Iframe deve ter título descritivo e foco/teclado utilizável. Links de materiais e ação de conclusão precisam de rótulos claros, foco visível e contraste adequado. Estrutura semântica deve seguir título principal único e regiões/heading ordenados.
- Fornecer alternativa de abertura no YouTube e estados textuais que não dependam apenas de cor/ícone.

## Riscos

- Dados antigos armazenavam uma URL genérica singular; a migração cria campo distinto de vídeo e tabela de materiais sem remover nem sobrescrever o valor legado.
- URLs do YouTube têm formatos variados e podem estar inválidas, removidas ou com incorporação desativada. A tela precisa falhar parcialmente, preservando o restante da aula.
- Conteúdo rico sem um formato estruturado e renderizador com allowlist cria risco de XSS; bloquear interpretação de HTML arbitrário.
- Bucket não provisionado, chave de storage ausente ou objeto removido impede download; a tela deve apresentar o erro sem expor caminho interno.
- A experiência de player depende de rede e políticas do YouTube/navegador; testes de layout não devem depender da reprodução real.

## Validação prevista (na etapa autorizada)

- Cobrir acesso autorizado/negado, publicação e isolamento do aluno na API.
- Cobrir mapeamento do DTO para aula, URL YouTube válida/inválida e materiais zero/um/vários.
- Revisar teclado, leitor de tela, foco, layout móvel, erro do player e links externos.
- Executar typecheck, lint, testes e build dos pacotes afetados quando a implementação e as tarefas de validação estiverem autorizadas.

## Estado da implementação

A leitura da aula, navegação curricular, normalização do player, renderer de conteúdo estruturado, persistência de materiais e fluxo de download autorizado estão implementados. A migração `20261006120000_lesson_video_and_materials` foi aplicada ao banco Supabase configurado e o status confirma schema em dia. O bucket `traderlab-course-materials` foi provisionado como privado e verificado. A tela/endpoint do mentor para upload e edição permanece na unidade de gestão de conteúdo.
