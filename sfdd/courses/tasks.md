# Página de curso do aluno — Tarefas

## Definições confirmadas

- [x] Preservar o texto original de `spec.md` e acrescentar somente os
      comportamentos definidos pelo usuário nesta revisão.
- [x] Tratar conteúdo como unidade comum; aula, quiz, exercício, prova e outros
      são tipos, com implementação funcional de novos tipos deixada para o futuro.
- [x] Exigir acesso do aluno ao curso em todas as consultas e ações. O acesso
      atual é vitalício (sem expiração temporal) e depende de matrícula ativa.
- [x] Restringir esta unidade ao MVP. Pagamentos, criação/gestão de matrículas,
      quizzes, exercícios, provas e edição de cursos não são implementados aqui.
- [x] Escolher fluxo code-first para esta tela; `wireframe.html` permanece
      artefato SFDD independente de API, autenticação e banco.

## Avaliação técnica de identificadores

- [x] Avaliar o impacto de IDs numéricos sequenciais nas entidades atuais e nas
      rotas/contratos.
- [x] Confirmar IDs numéricos sequenciais para cursos, módulos, conteúdos,
      matrículas e progresso, mantendo o UUID de usuário do Supabase Auth.
- [x] Registrar que a troca altera as URLs antigas e preservar os dados e
      relações existentes durante a migração.
- [x] Converter o schema Prisma, os contratos, a API, as rotas e os componentes
      web para números nas entidades internas.
- [x] Atualizar o seed para buscar cursos, módulos e conteúdos pelos títulos e
      usar os IDs retornados pelo banco, sem depender de IDs literais.
- [x] Criar migração revisável que mapeia IDs antigos para novos e atualiza as
      chaves estrangeiras sem remover registros.
- [x] Revisar o SQL da migração e conferir a preservação das relações após a
      aplicação autorizada.
- [x] Aplicar a migração no Supabase configurado e confirmar que ficou em dia.
- [x] Confirmar por consulta que o usuário tester mantém acesso aos três cursos,
      agora com IDs numéricos, módulos, conteúdos e matrículas ativos.
- [x] Atualizar a página no navegador e confirmar visualmente a navegação com os
      novos IDs.

## Preparação e arquitetura

- [x] Ler `AGENTS.md`, `traderlab_mvp.txt`, esta especificação e `sfdd/README.md`.
- [x] Consultar a documentação local do App Router, navegação e Server/Client
      Components antes de alterar a aplicação web.
- [x] Identificar que a API atual só possui autenticação/perfis e que o schema
      Prisma ainda não contém cursos, matrículas ou progresso.
- [x] Definir a separação `course`, `access` e `progress` no monólito existente.
- [x] Criar este wireframe de baixa fidelidade sem dependência de integrações.
- [x] Revisar o wireframe e o plano técnico antes de expandir o escopo além da
      tela e consulta de curso descritas na especificação.

## Banco e contratos

- [x] Modelar curso, módulo, conteúdo, matrícula e progresso no Prisma, com
      publicação, ordenação e relações/índices necessários.
- [x] Criar migração aditiva sem alterar os perfis existentes e sem dados de
      demonstração em produção.
- [x] Definir DTOs compartilhados para lista de cursos, resumo detalhado,
      módulos/conteúdos, pesquisa e progresso.
- [x] Restringir os tipos funcionais de conteúdo ao escopo do MVP e deixar tipos
      futuros fora dos fluxos e validações ativos.
- [x] Aplicar a migração no banco Supabase configurado após autorização do
      usuário, em 05/10/2026.
- [x] Popular três cursos de exemplo, com módulos, conteúdos publicados e
      matrícula manual ativa apenas para `victorsilvestre@gmail.com`, usando um
      seed idempotente. A gestão de cursos e matrículas continua pertencendo a
      unidades futuras.

## API — acesso, curso e progresso

- [x] Revalidar bearer token e papel do usuário em cada endpoint.
- [x] Implementar leitura de cursos publicados com matrícula ativa do usuário.
- [x] Implementar detalhe do curso com resumo, contagens, progresso, módulos,
      conteúdos publicados e último conteúdo acessado.
- [x] Implementar busca por título/descrição dentro do curso, validando matrícula
      e publicação antes de retornar resultados.
- [x] Implementar abertura/retomada que registra último acesso antes de retornar
      conteúdo autorizado.
- [x] Implementar conclusão idempotente de conteúdo e calcular percentuais sobre
      conteúdos publicados, tratando denominador zero.
- [x] Não diferenciar curso inexistente de curso sem acesso em respostas que
      possam revelar metadados privados.
- [x] Não adicionar nesta unidade endpoints de pagamento, matrícula, gestão de
      cursos/conteúdos ou acesso com expiração.

## Web — página do curso

- [x] Criar `/courses/[courseId]` e a página mínima para abrir/retomar um
      conteúdo no grupo `(student)`, com sessão validada no servidor.
- [x] Compor menu existente, breadcrumb, imagem e descrição do curso, contagens,
      retomada, pesquisa, módulos, progresso e alternância grade/lista.
- [x] Manter todos os componentes em `apps/web/components/` nas categorias
      `authentication/`, `forms/`, `ui/` ou `navigation/`; não criar pastas de
      componentes dentro da rota.
- [x] Criar estados claros de carregamento, curso sem conteúdos, pesquisa sem
      resultados, erro recuperável, não encontrado e acesso negado.
- [x] Ligar “Meus Cursos” na home a `GET /courses` e ao destino real de cada
      curso, sem usar os dados demonstrativos como autorização.
- [x] Trocar a busca demonstrativa global por resultados autorizados de cursos
      adquiridos, sem expor conteúdo inacessível.
- [x] Aplicar responsividade, semântica e navegação por teclado ao menu,
      pesquisa, alternância de visualização e links de conteúdo.
- [x] Substituir os rótulos visíveis dos controles grade/lista por ícones SVG
      minimalistas com nomes acessíveis e colocar a lupa ao lado deles.
- [x] Abrir a busca interna em modal nativo com campo, botão, estados de
      carregamento/erro/vazio e resultados vindos da API autenticada.
- [x] Na grade, exibir somente imagem, título, descrição e progresso do módulo;
      na lista, empilhar módulos e permitir recolher/abrir conteúdos.
- [x] Incluir a descrição do módulo no DTO de leitura sem alterar o schema do
      banco, pois o campo já existia na tabela.
- [x] Confirmar que a descrição dos módulos de exemplo está persistida; corrigir
      o seletor da barra de progresso que recortava a contagem ao lado dela.
- [x] Pesquisar módulos publicados por título e descrição, além dos conteúdos,
      dentro do curso autorizado.
- [x] Combinar os resultados de módulo e conteúdo e diferenciá-los no contrato
      compartilhado.
- [x] Exibir resultados de módulo como links para a seção correspondente do
      módulo na página atual até a criação da tela própria.
- [x] Atualizar rota da pesquisa, estados e documentação SFDD para representar
      resultados de módulos e conteúdos.
- [x] Atualizar este `spec.md` apenas com os requisitos de grade/lista definidos
      pelo usuário; preservar os demais trechos e a linguagem existente.

## Validação e fechamento

- [ ] Revisar autorização, publicação, isolamento de progresso e acesso direto a
      conteúdo.
- [ ] Revisar contagens/progresso com curso e módulo vazios, conteúdo não
      publicado e aluno sem matrícula.
- [ ] Validar visualmente desktop e mobile e corrigir problemas materiais.
- [x] Executar typecheck e lint nos aplicativos web e API.
- [ ] Executar testes automatizados dos módulos de curso, acesso e progresso.
- [ ] Executar build dos aplicativos afetados.
- [ ] Marcar as tarefas de validação após sua execução.
