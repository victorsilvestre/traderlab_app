# Conteúdo do aluno — tipo aula: tarefas

## Documentação

- [x] Preservar `spec.md` como criado pelo usuário; concentrar detalhamento técnico e questões de execução neste plano e nesta lista.
- [x] Registrar o estado atual de rota, view, modelo, DTO e progresso, destacando lacunas de vídeo e materiais.
- [x] Criar wireframe independente, em escala de cinza, com conteúdo fictício.
- [x] Restringir a unidade à visualização de aula do aluno dentro do MVP.

## Decisões necessárias antes da implementação dependente

- [x] Confirmar URLs YouTube de vídeo individual; Shorts e playlists ficam fora.
- [x] Confirmar que cada aula possui no máximo um vídeo e pode ter zero ou vários materiais de apoio distintos.
- [x] Confirmar que o texto complementar exige formatação rica.
- [x] Confirmar composição: título/descrição em largura total; no desktop, vídeo e conteúdo à esquerda com navegação curricular alinhada ao topo do vídeo à direita. Cada módulo recolhe/expande independentemente. A lateral acompanha a página sem fixação ou rolagem interna, mantendo um único scroll; em telas estreitas, lista recolhível acima da aula.
- [x] Escolher armazenamento privado do Supabase Storage como primeira origem; baixar via URL assinada de curta duração.
- [x] Definir o bucket padrão como `traderlab-course-materials`; ele deve ser provisionado privado no ambiente Supabase.
- [x] Definir contrato do corpo rico como documento JSON restrito com allowlist e compatibilidade de leitura para texto legado.
- [x] Criar migração aditiva para `video_url` e coleção ordenada `course_materials`, copiando somente URLs de vídeo YouTube reconhecidas.
- [ ] Definir limites/tipos e fluxo de upload pela área do mentor na unidade futura de gestão de conteúdo.

## Implementação — executar apenas após autorização

Dependência: concluir decisões necessárias acima e autorizar a implementação destas tarefas.

- [x] Atualizar contratos públicos da aula para identificar vídeo, corpo estruturado e materiais, sem expor estruturas Prisma ou caminhos privados.
- [x] Implementar persistência e consulta ordenada de vários materiais associados independentemente ao vídeo da aula.
- [x] Implementar download pelo bucket privado com verificação de acesso e URL assinada curta; preparar redirecionamento autenticado no app web.
- [x] Normalizar texto legado e conteúdo JSON rico por allowlist; renderizar estrutura permitida sem interpretar HTML arbitrário.
- [x] Validar formatos aceitos de URL/ID do YouTube no cliente e criar iframe `youtube-nocookie.com` apenas para vídeo individual válido.
- [x] Atualizar consulta autenticada da aula para retornar vídeo e materiais publicados após validação de publicação e matrícula.
- [x] Atualizar a tela com player responsivo, metadados, corpo rico, materiais/estado vazio, conclusão e retorno ao curso.
- [x] Carregar a estrutura publicada de módulos e aulas na lateral, destacar a aula atual e estados de conclusão, com painel recolhível em telas estreitas.
- [x] Manter a lista em fluxo normal sem altura fixa ou rolagem interna, preservando rolagem única da página.
- [x] Fazer cada link lateral abrir uma aula e revalidar o acesso na API.
- [x] Implementar apresentação de vídeo sem URL válida, erro de leitura e ausência de materiais sem esconder as demais informações da aula.
- [x] Aplicar rótulos semânticos, foco visível e comportamento responsivo nos controles implementados.
- [x] Não modificar serviços externos ou gravar dados demonstrativos em ambiente remoto.
- [x] Remover `Content-Type: application/json` de requisições POST sem corpo; a API Fastify rejeitava a abertura da aula como corpo JSON vazio.
- [ ] Confirmar no navegador a abertura da aula e a gravação de acesso/progresso após a correção.

## Validação — executar após implementação autorizada

- [ ] Testar autorização e publicação para leitura direta e garantir que curso/aula privados não sejam revelados.
- [ ] Testar normalização de formatos YouTube aceitos e rejeição de URLs/domínios/esquemas não permitidos.
- [ ] Testar mapeamento da aula e apresentação com zero, um e vários materiais, e impedir associação de segundo vídeo à mesma aula.
- [ ] Testar conteúdo rico com formatação permitida, dados malformados e tentativas de inserir HTML/script não permitido.
- [ ] Testar estados de vídeo indisponível e erro da API sem bloquear descrição, texto ou anexos.
- [ ] Validar navegação por teclado, leitor de tela, foco e viewport móvel.
- [x] Executar typecheck dos contratos e aplicativos afetados.
- [x] Executar lint dos aplicativos afetados.
- [ ] Executar suíte de testes e build dos pacotes afetados.
- [x] Conferir whitespace e integridade do `spec.md` preservado.
- [x] Aplicar `20261006120000_lesson_video_and_materials` ao banco Supabase autorizado e confirmar schema em dia.
- [x] Provisionar e verificar o bucket privado `traderlab-course-materials` com o script idempotente da API.
- [x] Popular as nove aulas publicadas com vídeo YouTube; usar as sete URLs informadas em ordem e repetir as duas primeiras nas aulas 8 e 9.
- [x] Enviar a apostila e os dois indicadores ao bucket privado e associá-los às aulas cobrindo zero, um, dois e três materiais por aula.

## Fora desta unidade / configuração necessária

- [x] Provisionar o bucket privado `traderlab-course-materials` no Supabase do ambiente antes de disponibilizar downloads.
- [x] Aplicar a migration ao banco Supabase autorizado; o status final indica schema em dia.
- [x] Implementar upload e associação/edição dos arquivos na unidade
      `admin-content-management`; o formulário preserva o texto rico existente
      quando ele não é alterado.
- [ ] Aplicar a migração ao banco autorizado após revisão e janela própria de implantação.

## Ajuste de retorno

- [x] Simplificar o link de retorno da aula para exibir somente “← Voltar” e mantê-lo em linha própria.
- [ ] Validar visualmente o link de retorno da aula no navegador.
