# Dados de demonstração para usuários e matrículas — Especificação

## Objetivo

Popular a base de desenvolvimento com usuários fictícios de aparência realista
e usar os três cursos de validação já existentes para conferir listagem,
detalhes, matrículas e acesso no admin e na plataforma.

## Comportamento esperado

- Manter 12 identidades confirmadas no Supabase Auth e seus perfis locais.
- Usar nomes brasileiros plausíveis, telefones variados e endereços fictícios
  no domínio reservado `example.test`, sem rótulos de demonstração visíveis.
- Reutilizar os cursos publicados `Fundamentos do Day Trade`, `Leitura de
  Mercado e Price Action` e `Gestão de Risco na Prática`, preservando seus
  conteúdos e imagens existentes.
- Remover os três cursos duplicados criados pela versão anterior do seed,
  somente após confirmar que não contêm capas, imagens, progresso, materiais,
  notificações ou matrículas fora do próprio conjunto de usuários fictícios.
- Distribuir 12 perfis de estudante em grupos com zero, uma, duas e três
  matrículas ativas nos cursos de validação existentes.
- Permitir executar o seed novamente sem criar duplicatas ou alterar dados não
  pertencentes a este conjunto de demonstração.
- Exigir modo de aplicação e indicação explícita de ambiente de desenvolvimento;
  sem esses argumentos, apenas descrever a carga que seria feita.
- Gerar senhas aleatórias para identidades novas e mostrá-las uma única vez na
  saída do seed. Não enviar convites nem e-mails.

## Regras e implicações

- As contas de demonstração são usuários reais da base de desenvolvimento e
  aparecerão na listagem administrativa.
- Cursos publicados podem ser descobertos na plataforma. As matrículas ativas
  concedem acesso às respectivas aulas.
- Novas notificações gerais poderão incluir esses perfis. Notificações já
  enviadas não ganham destinatários retroativamente.
- Matrículas são criadas com origem manual e não representam compra ou pagamento.
- Não criar registros sem identidade no Supabase Auth.
- Atualizar nome, e-mail e telefone apenas nas identidades/perfis com o marcador
  do seed; preservar os IDs e as senhas já geradas.
- Se um e-mail, curso ou relação de demonstração existir com dados divergentes,
  interromper em vez de assumir propriedade ou sobrescrever.

## Critérios de aceite

- O modo padrão não grava dados.
- Aplicação só é aceita com confirmação explícita do alvo de desenvolvimento.
- Há 12 identidades e perfis de demonstração, com e-mails do domínio reservado
  `example.test` e papel estudante.
- Os alunos ficam matriculados nos três cursos de validação já existentes, sem
  criar cursos adicionais nem alterar conteúdo ou imagens deles.
- A carga cria 18 matrículas ativas distribuídas entre os grupos de zero a três.
- A distribuição inclui usuários com zero, uma, duas e três matrículas ativas.
- Duas execuções consecutivas não duplicam identidades, cursos ou matrículas.
- Nenhuma conta real, conteúdo/imagem dos cursos de validação ou matrícula fora
  do conjunto de usuários fictícios é alterada ou removida.

## Fora de escopo

- Dados de compra, pagamento, progresso ou notificações fictícias.
- Criação de contas administrativas de demonstração.
- Remoção automática de outros cursos ou dados além dos três registros duplicados
  da execução anterior, identificados e verificados pelo seed.
- Separação dos ambientes de desenvolvimento e produção.
