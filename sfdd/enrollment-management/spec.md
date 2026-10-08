# Gestão de matrículas

## Perfil e objetivo

O administrador precisa consultar as matrículas existentes e conceder acesso a um curso a qualquer usuário já cadastrado na plataforma, para que esse usuário possa acessar o curso no site.

## Telas e ações

### Listagem de matrículas

- Menu administrativo **Matrículas**, depois de **Alunos** e antes de **Cursos**.
- Tabela com aluno, e-mail, papel, curso, data da matrícula, origem e situação.
- Busca parcial por nome, e-mail, telefone ou título do curso.
- Filtros por curso e situação; paginação da listagem.
- A ação **Limpar filtros** remove termo de busca, curso, situação e página atual.
- Acesso aos detalhes do aluno e à gestão do curso pela própria linha.
- Ação **Matricular usuário** para abrir o formulário.

### Nova matrícula

- Pesquisar usuários já cadastrados por nome, e-mail ou telefone em um único campo. Os resultados aparecem enquanto a pessoa digita e podem ser selecionados diretamente na lista, sem um segundo seletor separado.
- Selecionar um usuário de qualquer papel disponível no sistema (aluno, administrador, mentor ou outro papel futuro); após selecionar, exibir sua identificação e permitir trocá-lo.
- Selecionar um curso publicado.
- Se a tela for aberta a partir do detalhe do aluno ou do curso, pré-selecionar esse contexto.
- Confirmar a ação e apresentar resultado claro; após sucesso, encaminhar para a listagem filtrada ou para a origem.

### Atalhos contextuais

- No detalhe do aluno, oferecer a ação de matricular esse usuário em um curso.
- Na gestão do curso, oferecer acesso à lista de matrículas do curso e à criação de uma matrícula nesse curso.

## Regras de negócio

- A funcionalidade é exclusiva de administradores.
- Matrícula manual concede acesso imediatamente e usa origem **Manual**.
- Usuário existente pode receber matrícula independentemente do papel.
- Só cursos publicados podem receber novas matrículas manuais.
- A combinação usuário/curso é única. Se já existir matrícula para essa combinação, informar que ela já existe e não criar outra.
- Matrículas são vitalícias nesta versão: não há ação de revogar, reativar ou remover.
- A nova matrícula começa ativa; os campos existentes registram origem, situação e data de concessão.
- Nenhum perfil de usuário é criado durante o fluxo.

## Estados e erros

- Listagem vazia: explicar que ainda não há matrículas e oferecer **Matricular usuário**.
- Busca sem resultado: informar que nenhum resultado corresponde aos filtros.
- Formulário sem opções: explicar que é necessário haver usuário cadastrado e curso publicado.
- Erros de validação, duplicidade ou indisponibilidade da API devem aparecer em linguagem direta, sem perder os valores já preenchidos.
- Durante envio, impedir submissões duplicadas e indicar processamento.

## Critérios de aceitação

1. Um administrador consulta todas as matrículas e filtra por curso e situação.
2. A busca parcial encontra matrícula por nome, e-mail, telefone ou título do curso.
3. Um administrador matricula qualquer usuário existente em curso publicado.
4. A matrícula criada fica ativa e com origem manual, e libera o acesso conforme as regras de acesso existentes.
5. Uma matrícula repetida para o mesmo usuário e curso é recusada com explicação compreensível.
6. Mentores e alunos não conseguem consultar nem alterar a gestão de matrículas, mesmo chamando a API diretamente.
7. Não há ação de revogação, reativação ou remoção nas telas nem na API desta entrega.

## Fora de escopo

- Compra, cobrança, pagamentos, lotes de matrículas, cadastro de novos usuários, revogação/reativação, exclusão e auditoria de quem concedeu cada matrícula.
- Matrícula em curso em rascunho.
