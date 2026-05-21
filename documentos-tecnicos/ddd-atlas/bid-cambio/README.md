# Atlas DDD — BID Cambio

> Documentacao DDD completa do produto **BID Cambio** (`bid-cambio`).
> Produto de cotacao e comparacao de taxas de cambio para operacoes de comercio exterior (importacao e exportacao).

---

## Indice

| # | Arquivo | O que mapeia | Linhas |
|---|---|---|---:|
| 1 | `01-campos.md` | Campos (db/back/front + label de tela) — todos os 12 models | — |
| 2 | `02-rotas-api.md` | Rotas API (backend Express) | — |
| 3 | `03-models.md` | Models Prisma (12 models) | 12 |
| 4 | `04-enums.md` | Enums (12 enums + valores) | 12 |
| 5 | [`05-glossario-fk.md`](./05-glossario-fk.md) | Glossario canonico de FKs (id_produto_gravity, id_usuario, id_organizacao) | 3+14 |
| 6 | [`06-paginas.md`](./06-paginas.md) | Paginas frontend (client/src/pages) | 19 |
| 7 | [`07-arquivos.md`](./07-arquivos.md) | Inventario de arquivos (57 fontes, 24 renames) | 57 |
| 8 | [`08-product-config.md`](./08-product-config.md) | PRODUCT_CONFIG, navegacao e servicos | 1 |

> Arquivos 01-04 serao criados em sessao futura dedicada ao mapeamento de campos, rotas, models e enums.

---

## Identidade do Produto

| Atributo | Valor |
|----------|-------|
| Nome canonical | `bid-cambio` |
| Prefixo de tabela PG | `cambio_` |
| Prefixo de model Prisma | `BidCambio` |
| Prefixo de enum Prisma | `BidCambio` |
| Porta backend | 8025 |
| fragment.prisma | `servicos-global/produto/bid-cambio/prisma/fragment.prisma` |
| PRODUCT_CONFIG | `servicos-global/produto/bid-cambio/client/src/shared/config.ts` |

---

## Models do Produto (12)

| # | Model | Tabela PG | Descricao |
|---|---|---|---|
| 1 | `BidCambioParcela` | `cambio_parcelas` | Parcela de cambio vinculada a um processo/pedido |
| 2 | `BidCambioAnexo` | `cambio_anexos` | Anexo/comprovante de pagamento |
| 3 | `BidCambioFormaPagamento` | `cambio_formas_pagamento` | Forma de pagamento do cambio |
| 4 | `BidCambioConfiguracaoParcela` | `cambio_config_parcelas` | Configuracao de parcela dentro da forma de pagamento |
| 5 | `BidCambioCotacao` | `cambio_cotacoes` | Cotacao de cambio (Pilar 2 — Marketplace) |
| 6 | `BidCambioDisparoCotacao` | `cambio_bid_requests` | Disparo de cotacao para uma corretora |
| 7 | `BidCambioRespostaCotacao` | `cambio_bid_responses` | Resposta de uma corretora a uma cotacao |
| 8 | `BidCambioCorretora` | `cambio_corretoras` | Cadastro de corretoras de cambio/bancos |
| 9 | `BidCambioAvaliacaoCorretora` | `cambio_avaliacoes` | Avaliacao manual de corretora |
| 10 | `BidCambioClassificacaoCorretora` | `cambio_rating_corretora_global` | Rating global cross-tenant (por email) |
| 11 | `BidCambioGanho` | `cambio_savings` | Saving/economia por cotacao aprovada |
| 12 | `BidCambioPreferenciaUsuario` | `cambio_preferencias` | Preferencias de cambio do tenant |
| 13 | `BidCambioPreferenciaGrid` | `cambio_preferencias_grid` | Preferencia de grid do usuario |

> Total: 13 models (corrigido — 12 enums + 13 models no fragment.prisma).

---

## Enums do Produto (12)

| # | Enum | Tabela PG mapeada | Valores |
|---|---|---|---|
| 1 | `BidCambioTipoOperacao` | `CambioTipoOperacao` | IMPORTACAO, EXPORTACAO |
| 2 | `BidCambioModalidade` | `CambioModalidade` | PRONTO, FUTURO |
| 3 | `BidCambioLiquidacao` | `CambioLiquidacao` | D0, D1, D2 |
| 4 | `BidCambioMoeda` | `CambioMoeda` | USD, EUR, GBP, CHF, BRL, CNY, JPY |
| 5 | `BidCambioStatusParcela` | `CambioParcelaStatus` | PENDENTE, AGENDADO, PAGO |
| 6 | `BidCambioStatusCotacao` | `CambioCotacaoStatus` | RASCUNHO, ENVIADA_CORRETORAS, EM_COTACAO, AGUARDANDO_APROVACAO, APROVADA, REPROVADA, CANCELADA, EXPIRADA |
| 7 | `BidCambioCanalDisparo` | `CambioDisparoCanal` | EMAIL, PORTAL |
| 8 | `BidCambioStatusDisparoCotacao` | `CambioStatusCotacoes` | PENDENTE, ENVIADO, VISUALIZADO, RESPONDIDO, EXPIRADO, ERRO_ENVIO |
| 9 | `BidCambioStatusRespostaCotacao` | `StatusBidResponseCambio` | RECEBIDA, EM_ANALISE, MELHOR_TAXA, MELHOR_SPREAD, MELHOR_AVALIACAO, APROVADA, REPROVADA |
| 10 | `BidCambioTipoCorretora` | `CambioCorretoraTipo` | CORRETORA_CAMBIO, BANCO_COMERCIAL, BANCO_CAMBIO, FINTECH |
| 11 | `BidCambioStatusCorretora` | `CambioCorretoraStatus` | ATIVA, INATIVA, BLOQUEADA |
| 12 | `BidCambioBaseVencimento` | `CambioBaseVencimento` | DATA_EMBARQUE, DATA_CHEGADA, DATA_REGISTRO_DI, DATA_DESEMBARACO, DATA_ENTREGA, PRONTIDAO_CARGA, DATA_FIXA |

---

## Regras DDD Aplicadas

Este atlas segue as 13 regras da skill [`ddd-nomenclatura`](../../../skills/governanca/lei/ddd-nomenclatura/SKILL.md):

| Regra | Resumo | Aplicacao neste produto |
|-------|--------|------------------------|
| 01 | Campo generico recebe sufixo da entidade | `status_parcela_bid_cambio`, `status_cotacao_bid_cambio` |
| 02 | PT-BR, sem acentos | `referencia_processo`, `exportador`, `observacao` |
| 03 | Audit: `id_<entidade>`, `data_criacao_<entidade>`, `data_atualizacao_<entidade>` | Aplicado em todos os 13 models |
| 04 | FK: `id_<entidade_alvo>` (prefixo, nao sufixo) | `id_corretora_bid_cambio`, `id_cotacao_bid_cambio` |
| 05 | Boolean sem `is_` — adjetivo PT-BR | `portal_habilitado`, `mostrar_no_financeiro` |
| 06 | Relations plural PT-BR snake_case | `avaliacoes`, `bid_requests`, `bid_responses`, `parcelas` |
| 07 | Enum PascalCase PT-BR, valores UPPER_SNAKE | `BidCambioStatusCotacao`, `BidCambioTipoCorretora` |
| 08 | Colecoes plural PT-BR | `cotacoes`, `corretoras`, `parcelas` |
| 09 | Consistencia cross-layer (db = back = front) | Nome unico em todas as camadas |
| 10 | Model PascalCase + `@@map("snake_case")` | `BidCambioCotacao` + `@@map("cambio_cotacoes")` |
| 11 | Proibido `@map` de coluna | Colunas ja em snake_case DDD |
| 12 | Enum `@@map` obrigatorio | `@@map("CambioCotacaoStatus")` |
| 13 | Arquivos kebab-case PT-BR | `cotacao-nova.tsx`, `corretora-detalhe.tsx` |

---

## Pilares do Produto

| Pilar | Descricao | Status |
|-------|-----------|--------|
| **Pilar 1 — Gestao de Parcelas** | Controle de parcelas de cambio, vencimentos, pagamentos, anexos | Implementado |
| **Pilar 2 — Marketplace de Cotacoes** | Cotacao de taxas com corretoras, comparativo, aprovacao | Implementado |
| **Portal da Corretora** | Area logada para corretoras responderem cotacoes + portal publico via token | Implementado |
