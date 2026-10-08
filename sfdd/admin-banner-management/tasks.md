# Gestão de banners no admin — Tarefas

## Alinhamento e especificação

- [x] Confirmar que gestão de banners pertence ao MVP.
- [x] Inventariar tabela, migration, contrato, endpoint de leitura e carrossel
      já existentes.
- [x] Documentar a gestão administrativa, público global, ordenação, estados,
      critérios de aceite e exclusões.
- [x] Criar wireframe grayscale sem dependência de APIs ou dados reais.
- [x] Posicionar Banners antes de Notificações na navegação atual.
- [x] Definir que não pode haver mais de cinco banners ativos; cadastro ativo
      ocupa vaga se disponível e, sem vaga, orienta inativar um existente.
- [x] Separar nome interno de título, descrição e texto apresentado na home.
- [x] Usar como moldura a área responsiva do carrossel atual, sem exigir
      imagem 16:9 nem corte para 1920×1080.
- [x] Confirmar JPEG/PNG/WebP até 5 MB.
- [x] Usar a mesma proporção do quadro responsivo atual e a prévia do formulário
      para orientar o enquadramento, sem impor largura fixa em pixels.
- [x] Confirmar texto da vitrine opcional, pois a arte pode já conter texto.
- [x] Revisar/aprovar spec, plano e wireframe antes da implementação.

## Implementação

- [x] Comparar o modelo persistido existente com as decisões aprovadas e criar
      migration apenas se necessária.
- [x] Usar o bucket privado existente de imagens de curso para os banners,
      com paths exclusivos `banners/` e URLs assinadas de leitura.
- [x] Aplicar limite transacional de cinco ativos em criação e ativação; não
      permitir troca automática de banners ativos.
- [x] Criar/ajustar DTOs administrativos compartilhados.
- [x] Implementar consulta, cadastro, atualização de estado e ordenação no
      serviço/repositório existentes ou no boundary de domínio aprovado.
- [x] Proteger endpoints de gestão para administradores; manter leitura da
      vitrine para todos os perfis autenticados.
- [x] Implementar upload autorizado e validação de imagem no servidor.
- [x] Criar BFF, página de listagem e formulário no admin.
- [x] Adicionar Banners no menu imediatamente antes de Notificações.
- [x] Persistir ordem com validação de IDs, sem duplicatas e com resultado
      determinístico.
- [x] Exibir os ativos na home, globalmente e em ordem, no limite
      definido para a primeira versão.
- [x] Atualizar spec/plano e marcações do MVP conforme comportamento entregue.
- [x] Consolidar ativos e inativos em uma única listagem com coluna de status.
- [x] Incluir ação de editar, carregar valores existentes e permitir substituir
      imagem sem perder a atual quando nenhum novo arquivo for selecionado.
- [x] Agrupar formulário em informações do sistema e informações exibidas ao
      usuário.
- [x] Recomendar proporção 3:1 e resolução de referência 1440 × 480 px.
- [x] Trocar o ícone de inativação para pausa vermelha e remover mensagens
      persistentes de sucesso da listagem.
- [x] Atualizar wireframe, especificação e plano com esse fluxo.

## Validação

- [x] Aplicar a migration `20261008180000_manage_home_banners` no Supabase de
      desenvolvimento.
- [x] Restaurar os textos originais e o campo de chamada curta dos três
      banners seedados com a migration `20261008190000_restore_home_banner_copy`.
- [x] Resolver os caminhos estáticos seedados no domínio público da plataforma,
      para que também apareçam no admin.
- [x] Restaurar chamada, título e texto de apoio no carrossel da plataforma.
- [x] Exibir tooltip e rótulo acessível nas ações de ícone da gestão.
- [x] Usar isolamento serializável ao alterar estado/ordem e no cadastro para
      proteger a capacidade de cinco banners contra concorrência.
- [x] Rodar typecheck dos contratos, API, admin e web.
- [x] Rodar lint do admin e da API.
- [x] Executar `pnpm check:text-encoding`.
- [ ] Validar 401/403, papel não autorizado e chamadas diretas à API.
- [ ] Validar upload válido/inválido, limite, falha e repetição.
- [ ] Validar cadastro, estado inicial, ativação e inativação sem perda de dados.
- [ ] Validar reordenação, persistência, extremos da lista e falha concorrente.
- [ ] Validar a vitrine para os perfis autenticados e a exclusão dos inativos.
- [ ] Validar URL ausente, HTTP(S) válida e URL inválida.
- [ ] Validar acessibilidade do texto alternativo e controles de ordenação.
- [ ] Validar vazio, erro, carregamento, sucesso, responsividade e ausência de
      rolagem horizontal no admin.
- [ ] Rodar validação funcional manual no admin e na vitrine.

## Nota de validação

Os cenários de API, upload e interface ainda precisam de validação funcional.
O lint agregado continua falhando por três erros em arquivos da web fora desta
unidade (`app/notifications/page.tsx`, `NavigationFeedback.tsx` e
`ProfileForm.tsx`). Nenhum teste automatizado foi executado nesta rodada.
