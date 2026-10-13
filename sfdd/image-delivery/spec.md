# Entrega rápida de imagens — especificação

## Objetivo

Exibir banners, capas de cursos, módulos e aulas, e avatares com rapidez e sem
renderização prolongada em faixas. As imagens devem funcionar nas telas da web
e do admin, em computador e celular.

## Comportamento esperado

- As imagens gerenciadas usam URLs estáveis, redimensionadas para o maior
  contexto de exibição e entregues em formato otimizado pelo armazenamento.
- As imagens podem ser abertas diretamente por qualquer pessoa que tenha a
  URL. Banners, capas e avatares não são tratados como arquivos privados.
- Imagens de curso e avatar não dependem da emissão de uma URL assinada a cada
  resposta da API.
- O upload de imagem reduz dimensões e peso quando possível, preservando a
  composição; uma falha de conversão não impede o envio do original.
- Se uma imagem não puder ser carregada, a interface mantém o estado visual
  neutro já previsto, sem ícone de arquivo quebrado.
- Arquivos de materiais de curso permanecem privados e não são afetados por
  essa mudança.

## Critérios de aceitação

- Banners, capas e avatares usam URLs públicas estáveis com variantes de leitura
  dimensionadas e qualidade reduzida.
- A API não gera token temporário ao serializar essas imagens.
- Uploads novos de avatar e imagens administrativas são reduzidos antes do
  armazenamento e recebem política de cache adequada a caminhos imutáveis.
- As imagens existentes continuam disponíveis pelo mesmo caminho e recebem a
  variante otimizada em tempo de leitura.
- O bucket de materiais continua privado.
