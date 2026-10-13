# Entrega rápida de imagens — tarefas

- [x] Medir metadados de banners e avatar existentes sem alterar os objetos.
- [x] Verificar transformação de leitura em imagens reais no armazenamento.
- [x] Tornar públicos os buckets de imagens de curso/banner e avatar nos
      provisionadores e aplicar a configuração ao projeto conectado, preservando
      materiais privados.
- [x] Trocar URLs assinadas variáveis por URLs públicas transformadas e estáveis.
- [x] Atualizar clientes web e admin para buscar diretamente as imagens já
      transformadas e manter compatibilidade com URLs legadas.
- [x] Redimensionar e comprimir avatar antes de novos uploads; manter cache
      longo em uploads de imagens com caminho único.
- [x] Verificar status 200, WebP automático, ausência de token e CDN HIT nas
      URLs transformadas reais de banner e avatar; os tamanhos medidos ficaram
      em 21,6 KB e 3,6 KB.
- [ ] Validar visualmente home, avatar, cursos e conteúdo em desktop e mobile.
- [x] Executar tipagem da API, web e admin, codificação UTF-8 e diff check.
