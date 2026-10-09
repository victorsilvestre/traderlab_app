# Tarefas — Login com Google

## Documentação e decisões

- [x] Confirmar e aprovar a implementação do login social.
- [x] Definir o fluxo de identidade única, telefone obrigatório quando ausente,
      avatar opcional e preservação dos dados personalizados.
- [x] Criar especificação, plano técnico, tarefas e wireframe grayscale.
- [x] Revisar e aprovar `spec.md`, `plan.md` e `wireframe.html`.

## Configuração externa — necessária antes de validar OAuth nos ambientes

- [ ] Criar/selecionar projeto e credencial OAuth Web no Google Cloud.
- [ ] Configurar tela de consentimento, origens autorizadas e redirect URI do
      projeto Supabase.
- [ ] Habilitar Google Provider no Supabase e inserir Client ID/Secret.
- [ ] Configurar a allowlist de retorno do Supabase para callbacks web de
      desenvolvimento e produção.
- [ ] Fazer login de verificação manual com uma conta de teste e conferir a
      identidade criada no Supabase.

## API, identidade e perfil

- [x] Estender a identidade autenticada para ler metadados de nome e avatar do
      provider, sem confiar em dados enviados pelo navegador.
- [x] Criar a operação de conclusão OAuth na API para validar a identidade,
      provisionar perfil e registrar o login bem-sucedido uma única vez.
- [x] Provisionar somente um perfil pelo UUID Auth; manter papel padrão de
      aluno e preservar campos existentes.
- [x] Implementar a importação segura e tolerante da foto para o bucket privado
      de avatares, com allowlist de host, timeout, limite de bytes e validação de
      formato.
- [x] Implementar o redirecionamento do callback para `/profile?complete=1`
      quando o telefone estiver vazio e abrir modal obrigatório de conclusão.
- [x] Impedir dispensar o modal ou acessar outras áreas/recursos enquanto
      houver telefone obrigatório pendente; permitir concluir o perfil ou sair.
- [x] Reutilizar `PATCH /users/me/profile` para salvar o telefone autenticado.
- [x] Após salvar o telefone com sucesso, fechar o modal e encaminhar para
      `/home`; manter os valores e o modal aberto se ocorrer erro.
- [x] Fazer perfis completos seguirem para a home/destino interno sem exibir o
      modal.
- [x] Reutilizar o fluxo existente de recuperação de senha. A validação com
      conta Google-only fica pendente da configuração do provider.

## Aplicação web

- [ ] Habilitar ação acessível “Continuar com Google” após configurar o
      provedor, sem habilitá-la no admin.
- [x] Iniciar OAuth PKCE com escopos mínimos e destino interno validado.
- [x] Integrar o callback existente à consulta/provisionamento do perfil e à
      etapa de conclusão de telefone.
- [x] Preservar mensagens de cancelamento, erro, indisponibilidade, perfil
      incompleto e fallback de avatar.
- [x] Manter a sessão SSR, o logout e o login tradicional funcionando.

## Validação e encerramento

As validações OAuth ponta a ponta dependem das credenciais Google e da
configuração do provider/redirects no Supabase. Não foram executados testes,
typecheck, lint ou build nesta etapa.

- [ ] Testar vinculação da conta existente com mesmo e-mail confirmado e
      confirmar um único UUID/perfil.
- [ ] Testar conta Google nova, perfil de aluno único, telefone obrigatório e
      foto opcional.
- [ ] Testar que nome, telefone e avatar personalizados não são sobrescritos
      nos logins seguintes.
- [ ] Testar foto ausente, URL inválida, formato/tamanho inválido e falha de
      Storage sem impedir autenticação.
- [ ] Testar e-mail não confirmado/conflitante sem fusão manual nem duplicação
      de dados do produto.
- [ ] Testar login Google e e-mail/senha na mesma conta, recuperação de senha,
      sessão, logout e cancelamento OAuth.
- [ ] Testar acesso direto às páginas/rotas da API enquanto o perfil estiver
      sem telefone.
- [ ] Validar o percurso completo: consentimento Google → callback → perfil com
      modal → salvar telefone → home; validar também perfil completo direto à
      home.
- [ ] Validar acessibilidade, responsividade e estados de erro nos formulários.
- [ ] Executar testes, typecheck, lint, build e verificação de codificação dos
      pacotes afetados quando a implementação for autorizada.
- [ ] Atualizar esta unidade com resultados e configuração aplicada sem
      registrar segredos.
