# Autenticação do ambiente de gestão — Especificação

## Status e relação com o MVP

Implementação local iniciada em 7 de outubro de 2026. A entrada específica de
gestores, as páginas de autenticação e a verificação de papel pela API já
existem. A entrega ainda depende de validar contas reais e de permitir os
callbacks do admin no projeto Supabase. Autenticação, recuperação de senha,
papéis de mentor e administrador e regras básicas de segurança pertencem ao
MVP. Esta unidade detalha o acesso à aplicação `apps/admin` definida em
`sfdd/admin-foundation`.

## Pessoas e objetivo

Administradores e mentores precisam entrar com segurança no ambiente de
gestão em `admin.traderbrunoborges.com.br`, manter a sessão durante o trabalho,
recuperar o acesso quando necessário e sair ao terminar. Alunos não têm acesso
às páginas protegidas desse endereço.

O mesmo cadastro identifica a pessoa nos dois sites do TraderLab. Cada site
solicita login e mantém sessão próprios; uma sessão na plataforma do aluno não
abre automaticamente o admin, nem o contrário.

## Telas e ações visíveis

### Entrada

- Identificação clara de que se trata do ambiente de gestão.
- Campos de e-mail e senha, ação “Entrar”, link “Esqueceu sua senha?” e
  indicação de processamento e erros.
- Não há cadastro público nem escolha de papel.
- Se a pessoa já possui sessão administrativa válida, a entrada a encaminha à
  página inicial ou ao destino interno seguro que solicitou.

### Recuperação e redefinição

- Na recuperação, a pessoa informa o e-mail e recebe uma confirmação genérica.
- O link recebido a leva ao próprio endereço administrativo para criar uma
  nova senha e confirmá-la.
- Link inválido, expirado ou já utilizado oferece caminho para pedir outro.
- Após atualizar a senha, a pessoa volta à entrada e faz novo login.

### E-mail ainda não confirmado

- A entrada informa que a confirmação é necessária.
- A pessoa pode solicitar o reenvio do link, com resposta que não revela se a
  conta informada existe.
- O link abre o callback do endereço administrativo e termina na entrada.

### Sessão e saída

- As páginas protegidas mostram a identidade e o papel vindos do perfil
  persistido, além da ação “Sair”.
- A saída encerra a sessão local do admin e retorna à entrada. A sessão que a
  pessoa possa manter na plataforma TraderLab continua independente.

## Comportamento e regras de acesso

1. A pessoa informa credenciais no admin. O sistema valida identidade, e-mail
   confirmado e perfil antes de criar a sessão administrativa.
2. Somente perfis `mentor` e `administrator` podem receber uma sessão de
   entrada no admin. Uma conta de aluno com credenciais válidas recebe uma
   mensagem clara de falta de acesso, sem abrir o ambiente de gestão.
3. Uma conta sem perfil de gestor válido também não entra. O cadastro público
   da plataforma continua atribuindo apenas o papel de aluno.
4. Toda página protegida confirma a sessão e o papel novamente no servidor.
   Mudança ou revogação de papel passa a valer nas próximas consultas. A API
   valida as permissões de cada operação de gestão de forma independente.
5. O mentor verá apenas as opções correspondentes ao seu papel. A propriedade
   de cursos e outros recursos será definida nos fluxos de gestão específicos.
6. Links de retorno após login aceitam somente caminhos internos permitidos do
   admin. Links recebidos por e-mail apontam apenas para endereços autorizados
   do TraderLab.
7. Senha redefinida deve obedecer às regras atuais de senha do produto: mínimo
   de seis caracteres e confirmação igual. A resposta da recuperação não
   revela se o e-mail está cadastrado ou qual é seu papel.
8. Um link de recuperação solicitado pelo admin pode pertencer a uma conta que
   não tem acesso ao ambiente. A pessoa pode redefinir sua própria senha, mas
   isso não lhe concede permissão de gestão; o login continua sujeito ao papel.

## Estados da experiência

- **Sem sessão:** entrada administrativa.
- **Campos inválidos:** orientação junto ao formulário.
- **Enviando:** ação indisponível para novo envio enquanto a solicitação está
  em andamento.
- **Credenciais inválidas:** mensagem compreensível, sem indicar qual campo
  estava correto.
- **E-mail não confirmado:** orientação para confirmar ou solicitar outro link.
- **Perfil de aluno ou sem acesso de gestor:** acesso negado, com ação para sair
  ou voltar à entrada.
- **Sessão expirada ou token inválido:** retorno à entrada com destino interno
  seguro preservado.
- **Falha temporária da API ou do provedor de identidade:** erro recuperável;
  a sessão não é apagada como se a permissão tivesse sido revogada.
- **Link inválido ou expirado:** explicação e caminho para solicitar outro.
- **Saída concluída:** retorno à entrada administrativa.

## Critérios de aceitação

- [ ] Administrador com conta e perfil válidos entra e sai do admin.
- [ ] Mentor com conta e perfil válidos entra e sai do admin.
- [ ] Aluno com credenciais válidas não recebe sessão administrativa nem
      consegue abrir página protegida por URL direta.
- [x] A ausência de perfil de gestor não cria automaticamente um papel de
      mentor ou administrador.
- [ ] Papel removido ou alterado no banco deixa de autorizar o próximo acesso
      protegido, mesmo com token de identidade ainda válido.
- [x] A entrada apresenta estados de validação, processamento, sucesso e erro.
- [ ] Recuperação e reenvio de confirmação preservam resposta genérica para
      e-mails não cadastrados.
- [ ] O link de recuperação abre o admin, permite redefinir a senha e volta à
      entrada; o link expirado oferece nova solicitação.
- [ ] A redefinição de senha não concede acesso administrativo a uma conta de
      aluno.
- [ ] O admin e a plataforma mantêm sessões independentes em hosts distintos.
- [ ] Falha transitória de API/Auth não é tratada como sessão expirada.
- [ ] Cada operação de gestão futura exige autorização própria na API.

## Fora desta unidade

- Criação, convite ou promoção de contas de mentor e administrador; o primeiro
  procedimento de provisionamento será especificado separadamente.
- Gestão de cursos, alunos, pagamentos, notificações e indicadores.
- Acesso do administrador às aulas da plataforma, matrícula e progresso.
- Autenticação em dois fatores e políticas avançadas de sessão; não fazem
  parte da fundação aprovada até que sejam especificadas.
- Configuração real de domínio, DNS e hospedagem de produção.
