# Atlas DDD — BID Cambio — Aba 3: Models Prisma

> Mapeamento DDD dos 13 models do fragment.prisma.
> Regras aplicadas: REGRA 10 (PascalCase + @@map), REGRA 03 (audit), REGRA 04 (FK prefixo).

## Como ler

- **Nome atual (legado)**: nome do model antes da refatoracao DDD.
- **Nome DDD (PascalCase)**: nome final apos refatoracao DDD.
- **@@map DDD**: valor do `@@map("...")` — nome da tabela PG em snake_case.
- **@@map atual (legado)**: valor atual do `@@map` no fragment.prisma.
- **Tem id_organizacao?**: se possui campo de isolamento de tenant.
- **PK**: chave primaria.
- **Soft delete / Auditoria**: marcadores de governanca.
- **Arquivo fragment**: caminho do fragment.prisma.
- **Descricao**: o que o model representa.

## Tabela (13 models)

| Nome atual (legado) | Nome DDD (PascalCase) | @@map DDD | @@map atual (legado) | Tem id_organizacao? | PK | Soft delete | Auditoria | Arquivo fragment | Descricao |
|---|---|---|---|---|---|---|---|---|---|
| CambioParcelas | BidCambioParcela | `cambio_parcelas` | `cambio_parcelas` | Sim | id_parcela_bid_cambio (CUID) | Nao | data_criacao + data_atualizacao | produto/bid-cambio/prisma/fragment.prisma | Parcela de cambio vinculada a um pedido/processo |
| CambioAnexos | BidCambioAnexo | `cambio_anexos` | `cambio_anexos` | Sim | id_anexo_bid_cambio (CUID) | Nao | data_criacao | produto/bid-cambio/prisma/fragment.prisma | Anexo de comprovante de pagamento da parcela |
| CambioFormasPagamento | BidCambioFormaPagamento | `cambio_formas_pagamento` | `cambio_formas_pagamento` | Sim | id_forma_pagamento_bid_cambio (CUID) | Nao | data_criacao + data_atualizacao | produto/bid-cambio/prisma/fragment.prisma | Forma de pagamento do cambio (config por pedido) |
| CambioConfigParcelas | BidCambioConfiguracaoParcela | `cambio_config_parcelas` | `cambio_config_parcelas` | Sim | id_configuracao_parcela_bid_cambio (CUID) | Nao | Nao | produto/bid-cambio/prisma/fragment.prisma | Configuracao de cada parcela dentro da forma de pagamento |
| CambioCotacoes | BidCambioCotacao | `cambio_cotacoes` | `cambio_cotacoes` | Sim | id_cotacao_bid_cambio (CUID) | Nao | data_criacao + data_atualizacao | produto/bid-cambio/prisma/fragment.prisma | Cotacao de cambio aberta pelo usuario (Pilar 2 — Marketplace) |
| CambioBidRequests | BidCambioDisparoCotacao | `cambio_bid_requests` | `cambio_bid_requests` | Sim | id_disparo_cotacao_bid_cambio (CUID) | Nao | data_criacao + data_atualizacao | produto/bid-cambio/prisma/fragment.prisma | Disparo de cotacao para uma corretora especifica (bid request) |
| CambioBidResponses | BidCambioRespostaCotacao | `cambio_bid_responses` | `cambio_bid_responses` | Sim | id_resposta_cotacao_bid_cambio (CUID) | Nao | data_criacao + data_atualizacao | produto/bid-cambio/prisma/fragment.prisma | Resposta/proposta da corretora a uma cotacao (bid response) |
| CambioCorretoras | BidCambioCorretora | `cambio_corretoras` | `cambio_corretoras` | Sim | id_corretora_bid_cambio (CUID) | Nao | data_criacao + data_atualizacao | produto/bid-cambio/prisma/fragment.prisma | Cadastro de corretoras de cambio / bancos |
| CambioAvaliacoes | BidCambioAvaliacaoCorretora | `cambio_avaliacoes` | `cambio_avaliacoes` | Sim | id_avaliacao_corretora_bid_cambio (CUID) | Nao | data_criacao | produto/bid-cambio/prisma/fragment.prisma | Avaliacao manual (1-5 estrelas por criterio) de uma corretora |
| CambioRatingCorretoraGlobal | BidCambioClassificacaoCorretora | `cambio_rating_corretora_global` | `cambio_rating_corretora_global` | Nao (global cross-tenant) | id_classificacao_corretora_bid_cambio (CUID) | Nao | data_atualizacao | produto/bid-cambio/prisma/fragment.prisma | Classificacao automatica agregada cross-tenant por email da corretora |
| CambioSavings | BidCambioGanho | `cambio_savings` | `cambio_savings` | Sim | id_ganho_bid_cambio (CUID) | Nao | data_criacao | produto/bid-cambio/prisma/fragment.prisma | Registro de economia (ganho) por cotacao aprovada |
| CambioPreferencias | BidCambioPreferenciaUsuario | `cambio_preferencias` | `cambio_preferencias` | Sim (@@unique) | id_preferencia_usuario_bid_cambio (CUID) | Nao | data_atualizacao | produto/bid-cambio/prisma/fragment.prisma | Preferencias de cambio do tenant (singleton por organizacao) |
| CambioPreferenciasGrid | BidCambioPreferenciaGrid | `cambio_preferencias_grid` | `cambio_preferencias_grid` | Sim | id_preferencia_grid_bid_cambio (CUID) | Nao | data_atualizacao | produto/bid-cambio/prisma/fragment.prisma | Preferencia de grid do usuario (colunas, filtros, ordenacao) |
