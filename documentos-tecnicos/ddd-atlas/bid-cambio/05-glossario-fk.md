# Atlas DDD — BID Cambio — Aba 5: Glossario Canonico de FKs

> Mapeamento canonico de todas as FKs usadas no produto BID Cambio.
> Regras aplicadas: REGRA 04 (FK com prefixo `id_<entidade_alvo>`), Mandamento 01 (Clerk = auth only).

## Como ler

- **FK atual**: nome do campo como esta hoje no fragment.prisma.
- **FK DDD**: nome canonical conforme DDD do Gravity (snake_case PT-BR).
- **Fonte da verdade**: model e campo que e a referencia autoritativa.
- **Descricao**: significado, contexto e restricoes.

---

## FKs externas (cross-schema — Configurador)

| FK atual | FK DDD | Fonte da verdade | Descricao |
|---|---|---|---|
| `id_produto_gravity` | `id_produto_gravity` | Configurador → ProdutoGravity.id_produto_gravity (CUID) | Identificador do produto Gravity. No BID Cambio sera sempre `"bid-cambio"`. FK soft (sem @relation — referencia cross-schema). |
| `id_usuario` | `id_usuario` | Configurador → Usuario.id_usuario (CUID) | Identificador interno do usuario no Gravity. NAO e o `clerk_user_id` (UUID do Clerk) — e o CUID interno. FK soft (cross-schema). |
| `id_organizacao` | `id_organizacao` | Configurador → Organizacao.id_organizacao (CUID) | Identificador da organizacao. Presente em todos os 12 models para isolamento multi-tenant. FK soft (cross-schema). |

## FKs internas (dentro do produto)

| FK atual | FK DDD | Fonte da verdade | Descricao |
|---|---|---|---|
| `id_parcela_bid_cambio` | `id_parcela_bid_cambio` | BidCambioParcela | FK interna do produto. Referencia a parcela de cambio vinculada a um processo/pedido. |
| `id_cotacao_bid_cambio` | `id_cotacao_bid_cambio` | BidCambioCotacao | FK interna do produto. Referencia a cotacao de cambio (Pilar 2 — Marketplace). |
| `id_corretora_bid_cambio` | `id_corretora_bid_cambio` | BidCambioCorretora | FK interna do produto. Referencia a corretora de cambio/banco cadastrado. |
| `id_disparo_cotacao_bid_cambio` | `id_disparo_cotacao_bid_cambio` | BidCambioDisparoCotacao | FK interna do produto. Referencia o disparo de cotacao enviado a uma corretora. |
| `id_resposta_cotacao_bid_cambio` | `id_resposta_cotacao_bid_cambio` | BidCambioRespostaCotacao | FK interna do produto. Referencia a resposta/proposta recebida de uma corretora. |
| `id_forma_pagamento_bid_cambio` | `id_forma_pagamento_bid_cambio` | BidCambioFormaPagamento | FK interna do produto. Referencia a forma de pagamento configurada para um processo. |
| `id_configuracao_parcela_bid_cambio` | `id_configuracao_parcela_bid_cambio` | BidCambioConfiguracaoParcela | FK interna do produto. Referencia a configuracao de parcela dentro de uma forma de pagamento. |
| `id_anexo_bid_cambio` | `id_anexo_bid_cambio` | BidCambioAnexo | FK interna do produto. Referencia o anexo/comprovante vinculado a uma parcela. |
| `id_avaliacao_corretora_bid_cambio` | `id_avaliacao_corretora_bid_cambio` | BidCambioAvaliacaoCorretora | FK interna do produto. Referencia a avaliacao manual de uma corretora. |
| `id_classificacao_corretora_bid_cambio` | `id_classificacao_corretora_bid_cambio` | BidCambioClassificacaoCorretora | FK interna do produto. Rating global cross-tenant de uma corretora (por email). |
| `id_ganho_bid_cambio` | `id_ganho_bid_cambio` | BidCambioGanho | FK interna do produto. Referencia o saving/economia calculado por cotacao aprovada. |
| `id_preferencia_usuario_bid_cambio` | `id_preferencia_usuario_bid_cambio` | BidCambioPreferenciaUsuario | FK interna do produto. Referencia as preferencias de cambio do tenant. |
| `id_preferencia_grid_bid_cambio` | `id_preferencia_grid_bid_cambio` | BidCambioPreferenciaGrid | FK interna do produto. Referencia a preferencia de grid do usuario. |
| `id_corretora_aprovada_bid_cambio` | `id_corretora_bid_cambio` (alias) | BidCambioCorretora (vencedora) | FK interna. Referencia a corretora aprovada na cotacao. Mesmo model que `id_corretora_bid_cambio`, alias semantico. |

---

## Nota sobre Mandamento 01 — Isolamento Total do Clerk

Conforme o Mandamento 01 dos 9 Mandamentos do Gravity:

> O Clerk serve **apenas** para autenticacao (login, senha, e-mail, `clerk_user_id`) e nada mais.

O produto BID Cambio NAO possui campo `clerk_user_id` em nenhum model. Toda identificacao de usuario e feita via `id_usuario` (CUID interno do Configurador). Isso significa que:

- Permissoes e patentes (`tipo_usuario`, `tipo_usuario_workspace`) vem do banco do Configurador
- O `id_usuario` e a unica FK de identidade usada nos models do produto
- Nenhuma logica de autorizacao depende de dados do Clerk
