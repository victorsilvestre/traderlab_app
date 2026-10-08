# Gestão do conteúdo do curso — experiência-alvo

## Status

Wireframe aprovado. A experiência integrada do curso, a consulta de conteúdos
e a gestão administrativa de aulas e materiais estão documentadas em unidades
SFDD próprias. As ações de criação e edição são integradas ao construtor.

## Perfil e objetivo

O administrador precisa entender e organizar a estrutura completa de um curso
em um único lugar: módulos, aulas e materiais. Deve conseguir criar itens no
nível correto, ver seus estados e acessar as configurações do curso sem alternar
entre listas desconectadas.

## Hierarquia do conteúdo

```text
Curso
└── Módulo
    ├── Aula
    │   └── Materiais complementares (zero ou mais arquivos)
    └── Material independente (arquivo disponível para download)
```

- **Aula** é um conteúdo do módulo que pode apresentar título, descrição, texto,
  vídeo e materiais complementares anexados.
- **Material independente** é um conteúdo do módulo cujo propósito é oferecer
  um arquivo para download, sem pertencer a uma aula.
- **Material complementar** é um ou mais arquivos associados a uma aula e
  apresentados junto dela ao aluno.
- Os tipos interativos — exercícios, provas, quizzes, certificados e lives —
  não fazem parte desta experiência do MVP.

## Experiência proposta

- Ao abrir um curso, o administrador encontra um cabeçalho com capa, nome,
  estado e ações gerais do curso.
- A tela integrada e todas as demais telas secundárias administrativas usam um
  link `← Voltar` com destino estável; a tela integrada não exibe breadcrumbs.
- A ação **Configurações do curso** abre a edição dos dados gerais: nome,
  descrição e capa.
- Abaixo do cabeçalho do curso, a seção **Conteúdo** lista módulos empilhados e
  expansíveis diretamente. Não há abas nesta primeira versão; novas áreas
  podem ser adicionadas quando existirem outras funcionalidades.
- O administrador pode criar um módulo pelo botão principal da área.
- O cabeçalho do módulo exibe estado, contagem de itens e ações de editar,
  publicar/despublicar e adicionar conteúdo.
- Um módulo expandido lista aulas e materiais independentes na ordem de
  consumo. Materiais complementares aparecem visualmente dentro da aula à qual
  pertencem.
- A ação de adicionar conteúdo permite escolher entre **Aula** e
  **Material independente**. Dentro da edição da aula, o administrador pode
  anexar materiais complementares.
- Aulas, materiais independentes e materiais complementares mostram seus
  próprios estados quando aplicável e oferecem ações contextuais.
- A estrutura pode ser reordenada no nível de módulos e de itens do módulo;
  materiais complementares podem ser reordenados dentro da aula.
- Estados de vazio orientam a criação no nível certo: primeiro módulo, primeiro
  item do módulo ou primeiro material complementar da aula.
- A página tem rolagem natural, sem áreas internas com rolagem concorrente.
- A página inicial do workspace é a única tela sem `← Voltar`.

## Regras e limites

- Esta experiência é para o administrador; gestão por mentor permanece fora do
  escopo atual.
- O MVP continua limitado a aulas, materiais independentes e materiais
  complementares. Este wireframe não aprova tipos futuros de conteúdo.
- O estado de publicação deve ficar claro em cada item. A publicação de um item
  não publica automaticamente seu módulo ou curso.
- Ações de despublicação devem confirmar o impacto antes de alterar o estado e
  preservar dados e progresso.
- A exclusão não é definida pelo wireframe. Não mostrar exclusão destrutiva até
  que seu impacto sobre materiais, matrículas e progresso esteja especificado.
- A referência visual usa a hierarquia expansível da Hotmart e a organização
  curricular/reordenação vista em construtores de cursos como o Thinkific; a
  identidade visual permanece TraderLab e o wireframe SFDD é grayscale.

## Fora desta proposta visual

- Formulários completos e regras finais de edição de aulas e materiais.
- Gestão completa de aulas e materiais: criação, edição, upload, ordenação e
  publicação.
- Contratos e eventuais migrações necessárias para a gestão completa de
  conteúdos.
- Edição de usuários, comentários, turmas, certificados, pagamentos ou vendas.

## Referências

- Hotmart, criar módulos e adicionar conteúdos no módulo: [Central de Ajuda](https://help.hotmart.com/pt-BR/article/360000645592/como-criar-e-gerenciar-modulos-na-area-de-membros).
- Thinkific, organizar capítulos e aulas no currículo: [Support](https://support.thinkific.com/hc/en-us/articles/360030374174-Move-Chapters-and-Lessons-within-a-Course).
