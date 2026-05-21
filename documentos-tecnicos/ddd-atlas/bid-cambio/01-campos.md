# Atlas DDD — BID Cambio — Aba 1: Campos (Field Mapping)

> Mapeamento campo-a-campo de todos os 13 models do `fragment.prisma`.
> Fonte: `servicos-global/produto/bid-cambio/prisma/fragment.prisma`
>
> **Decisoes do dono aplicadas neste documento:**
> - `saving` -> `ganho`
> - `rating` -> `classificacao`
> - `request` -> `disparo_cotacao`
> - `response` -> `resposta_cotacao`
> - `product_id` -> `id_produto_gravity`
> - `user_id` -> `id_usuario`

## Como ler este documento

Cada model possui duas tabelas:

1. **Tabela de Campos** — mapeamento de cada coluna do banco:
   - **Campo atual (legado)**: nome do campo como era antes da refatoracao DDD.
   - **Campo DDD**: nome atual no `fragment.prisma` (ja refatorado).
   - **Tipo Prisma**: tipo do campo no Prisma schema.
   - **Regra violada**: qual regra DDD o nome legado violava (REGRA 01 a 06, ou "—" se ja conforme).
   - **Motivo da mudanca**: explicacao concisa do porque o nome mudou.

2. **Tabela de Relacoes** — mapeamento das relacoes Prisma:
   - **Relacao atual**: nome da relacao no fragment.prisma atual.
   - **Relacao DDD**: nome DDD da relacao.
   - **Tipo**: cardinalidade (1:N, N:1, 1:1).
   - **Descricao**: o que a relacao representa.

**Regras DDD aplicadas:**
- **REGRA 01**: Campos genericos recebem sufixo da entidade. Ex: `status` -> `status_parcela_bid_cambio`.
- **REGRA 02**: PT-BR sem acento. Ex: `payment_date` -> `data_pagamento`.
- **REGRA 03**: Campos de auditoria: `id` -> `id_<entidade>`, `created_at` -> `data_criacao_<entidade>`, `updated_at` -> `data_atualizacao_<entidade>`.
- **REGRA 04**: FK com prefixo `id_`: `corretora_id` -> `id_corretora_bid_cambio`.
- **REGRA 05**: Booleans PT-BR adjetivo, sem prefixo `is_`.
- **REGRA 06**: Relacoes plural PT-BR snake_case.

---

## 1. BidCambioParcela

> @@map atual: `cambio_parcelas`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_parcela_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme (campo de isolamento de tenant) |
| product_id | id_produto_gravity | String @default("bid-cambio") | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| referencia_processo | referencia_processo_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_pedido | numero_pedido_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| exportador | exportador_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_di | numero_di_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_invoice | numero_invoice_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_bl | numero_bl_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_contrato_cambio | numero_contrato_cambio_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_transmissao_di | numero_transmissao_di_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| referencia_cliente | referencia_cliente_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_duimp | numero_duimp_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_due | numero_due_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| moeda | moeda_parcela_bid_cambio | BidCambioMoeda @default(USD) | REGRA 01 | Campo generico `moeda` -> sufixo entidade |
| cambio_total | cambio_total_parcela_bid_cambio | Decimal @db.Decimal(18, 4) | REGRA 01 | Campo generico -> sufixo entidade |
| porcentagem | porcentagem_parcela_bid_cambio | Decimal @db.Decimal(5, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| valor_a_pagar | valor_a_pagar_parcela_bid_cambio | Decimal @db.Decimal(18, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| valor_a_pagar_brl | valor_a_pagar_brl_parcela_bid_cambio | Decimal @db.Decimal(18, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| valor_pago | valor_pago_parcela_bid_cambio | Decimal? @db.Decimal(18, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| valor_pago_brl | valor_pago_brl_parcela_bid_cambio | Decimal? @db.Decimal(18, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| numero_parcela | numero_parcela_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |
| total_parcelas | total_parcelas_parcela_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |
| status | status_parcela_bid_cambio | BidCambioStatusParcela @default(PENDENTE) | REGRA 01 | Campo generico `status` -> sufixo entidade |
| data_vencimento | data_vencimento_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_agendamento | data_agendamento_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_pagamento | data_pagamento_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_vencimento_original | data_vencimento_original_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| metodo_vencimento | metodo_vencimento_parcela_bid_cambio | BidCambioBaseVencimento? | REGRA 01 | Campo generico -> sufixo entidade |
| prazo_dias | prazo_dias_parcela_bid_cambio | Int? | REGRA 01 | Campo generico -> sufixo entidade |
| data_carga_pronta | data_carga_pronta_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_esperada_prontidao | data_esperada_prontidao_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_embarque_final | data_embarque_final_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_chegada_final | data_chegada_final_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_registro_di | data_registro_di_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_desembaraco | data_desembaraco_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_entrega | data_entrega_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_abertura_pedido | data_abertura_pedido_parcela_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| taxa_fechamento | taxa_fechamento_parcela_bid_cambio | Decimal? @db.Decimal(10, 4) | REGRA 01 | Campo generico -> sufixo entidade |
| banco_corretora | banco_corretora_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| condicao_pagamento | condicao_pagamento_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| endereco_desembaraco | endereco_desembaraco_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| endereco_entrega | endereco_entrega_parcela_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| cotacao_id | id_cotacao_bid_cambio | String? | REGRA 04 | FK em ingles -> prefixo `id_` |
| resposta_cotacao_id | id_resposta_cotacao_bid_cambio | String? | REGRA 04 | FK em ingles -> prefixo `id_` |
| created_at | data_criacao_parcela_bid_cambio | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_parcela_bid_cambio | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidCambioParcela

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| anexos | anexos | 1:N | Anexos de comprovante de pagamento da parcela |

---

## 2. BidCambioAnexo

> @@map atual: `cambio_anexos`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_anexo_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| parcela_id | id_parcela_bid_cambio | String | REGRA 04 | FK em ingles -> prefixo `id_` |
| nome_arquivo | nome_arquivo_anexo_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| nome_original | nome_original_anexo_bid_cambio | String | REGRA 01 | Campo generico -> sufixo entidade |
| url | url_anexo_bid_cambio | String | REGRA 01 | Campo generico -> sufixo entidade |
| categoria | categoria_anexo_bid_cambio | String @default("Contrato de Cambio") | REGRA 01 | Campo generico -> sufixo entidade |
| tamanho_bytes | tamanho_bytes_anexo_bid_cambio | Int? | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_anexo_bid_cambio | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |

### Relacoes — BidCambioAnexo

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| parcela | parcela | N:1 | Parcela de cambio a que o anexo pertence |

---

## 3. BidCambioFormaPagamento

> @@map atual: `cambio_formas_pagamento`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_forma_pagamento_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String @default("bid-cambio") | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| referencia_processo | referencia_processo_forma_pagamento_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_pedido | numero_pedido_forma_pagamento_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| descricao | descricao_forma_pagamento_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_forma_pagamento_bid_cambio | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_forma_pagamento_bid_cambio | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidCambioFormaPagamento

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| parcelas | parcelas | 1:N | Configuracoes de parcela desta forma de pagamento |

---

## 4. BidCambioConfiguracaoParcela

> @@map atual: `cambio_config_parcelas`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_configuracao_parcela_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| forma_pagamento_id | id_forma_pagamento_bid_cambio | String | REGRA 04 | FK em ingles -> prefixo `id_` |
| a_partir_de | a_partir_de_configuracao_parcela_bid_cambio | BidCambioBaseVencimento | REGRA 01 | Campo generico -> sufixo entidade |
| prazo_dias | prazo_dias_configuracao_parcela_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |
| porcentagem | porcentagem_configuracao_parcela_bid_cambio | Decimal @db.Decimal(5, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| ordem | ordem_configuracao_parcela_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |

### Relacoes — BidCambioConfiguracaoParcela

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| forma_pagamento | forma_pagamento | N:1 | Forma de pagamento pai |

---

## 5. BidCambioCotacao

> @@map atual: `cambio_cotacoes`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_cotacao_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String @default("bid-cambio") | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| moeda | moeda_cotacao_bid_cambio | BidCambioMoeda @default(USD) | REGRA 01 | Campo generico `moeda` -> sufixo entidade |
| valor | valor_cotacao_bid_cambio | Decimal @db.Decimal(18, 2) | REGRA 01 | Campo generico `valor` -> sufixo entidade |
| tipo_operacao | tipo_operacao_cotacao_bid_cambio | BidCambioTipoOperacao @default(IMPORTACAO) | REGRA 01 | Campo generico -> sufixo entidade |
| modalidade | modalidade_cotacao_bid_cambio | BidCambioModalidade @default(PRONTO) | REGRA 01 | Campo generico -> sufixo entidade |
| liquidacao | liquidacao_cotacao_bid_cambio | BidCambioLiquidacao @default(D2) | REGRA 01 | Campo generico -> sufixo entidade |
| referencia_processo | referencia_processo_cotacao_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| numero_pedido | numero_pedido_cotacao_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| exportador | exportador_cotacao_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| status | status_cotacao_bid_cambio | BidCambioStatusCotacao @default(RASCUNHO) | REGRA 01 | Campo generico `status` -> sufixo entidade |
| ptax_referencia | ptax_referencia_cotacao_bid_cambio | Decimal? @db.Decimal(10, 4) | REGRA 01 | Campo generico -> sufixo entidade |
| ptax_data | ptax_data_cotacao_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_expiracao | data_expiracao_cotacao_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| economia_brl | economia_brl_cotacao_bid_cambio | Decimal? @db.Decimal(18, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| economia_percentual | economia_percentual_cotacao_bid_cambio | Decimal? @db.Decimal(5, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| corretora_aprovada_id | id_corretora_aprovada_bid_cambio | String? | REGRA 04 | FK em ingles -> prefixo `id_` |
| taxa_aprovada | taxa_aprovada_cotacao_bid_cambio | Decimal? @db.Decimal(10, 4) | REGRA 01 | Campo generico -> sufixo entidade |
| aprovado_por | aprovado_por_cotacao_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| aprovado_em | aprovado_em_cotacao_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| observacao_aprovacao | observacao_aprovacao_cotacao_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_cotacao_bid_cambio | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_cotacao_bid_cambio | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidCambioCotacao

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| bid_requests | disparos_cotacao | 1:N | Disparos de cotacao enviados a corretoras (REGRA 06: `request` -> `disparo_cotacao`) |
| bid_responses | respostas_cotacao | 1:N | Respostas recebidas das corretoras (REGRA 06: `response` -> `resposta_cotacao`) |

---

## 6. BidCambioDisparoCotacao

> @@map atual: `cambio_bid_requests`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_disparo_cotacao_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| cotacao_id | id_cotacao_bid_cambio | String | REGRA 04 | FK em ingles -> prefixo `id_` |
| corretora_id | id_corretora_bid_cambio | String | REGRA 04 | FK em ingles -> prefixo `id_` |
| canal | canal_disparo_cotacao_bid_cambio | BidCambioCanalDisparo @default(EMAIL) | REGRA 01 | Campo generico `canal` -> sufixo entidade |
| status | status_disparo_cotacao_bid_cambio | BidCambioStatusDisparoCotacao @default(PENDENTE) | REGRA 01 | Campo generico `status` -> sufixo entidade |
| token_publico | token_publico_disparo_cotacao_bid_cambio | String? @unique | REGRA 01 | Campo generico -> sufixo entidade |
| token_expiracao | token_expiracao_disparo_cotacao_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| enviado_em | enviado_em_disparo_cotacao_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| visualizado_em | visualizado_em_disparo_cotacao_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| respondido_em | respondido_em_disparo_cotacao_bid_cambio | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_disparo_cotacao_bid_cambio | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_disparo_cotacao_bid_cambio | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidCambioDisparoCotacao

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| cotacao | cotacao | N:1 | Cotacao de cambio a que este disparo pertence |
| corretora | corretora | N:1 | Corretora para quem o disparo foi enviado |
| response | resposta_cotacao | 1:1 | Resposta da corretora a este disparo (REGRA 06: `response` -> `resposta_cotacao`) |

---

## 7. BidCambioRespostaCotacao

> @@map atual: `cambio_bid_responses`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_resposta_cotacao_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| cotacao_id | id_cotacao_bid_cambio | String | REGRA 04 | FK em ingles -> prefixo `id_` |
| corretora_id | id_corretora_bid_cambio | String | REGRA 04 | FK em ingles -> prefixo `id_` |
| bid_request_id | id_disparo_cotacao_bid_cambio | String @unique | REGRA 04 | FK em ingles -> prefixo `id_` + `request` -> `disparo_cotacao` |
| taxa_oferecida | taxa_oferecida_resposta_cotacao_bid_cambio | Decimal @db.Decimal(10, 4) | REGRA 01 | Campo generico -> sufixo entidade |
| spread | spread_resposta_cotacao_bid_cambio | Decimal @db.Decimal(10, 4) | REGRA 01 | Campo generico -> sufixo entidade |
| valor_total_brl | valor_total_brl_resposta_cotacao_bid_cambio | Decimal @db.Decimal(18, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| iof_percentual | iof_percentual_resposta_cotacao_bid_cambio | Decimal @db.Decimal(5, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| iof_valor | iof_valor_resposta_cotacao_bid_cambio | Decimal @db.Decimal(18, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| liquidacao_proposta | liquidacao_proposta_resposta_cotacao_bid_cambio | BidCambioLiquidacao | REGRA 01 | Campo generico -> sufixo entidade |
| validade_minutos | validade_minutos_resposta_cotacao_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |
| validade_ate | validade_ate_resposta_cotacao_bid_cambio | DateTime | REGRA 01 | Campo generico -> sufixo entidade |
| condicoes | condicoes_resposta_cotacao_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| status | status_resposta_cotacao_bid_cambio | BidCambioStatusRespostaCotacao @default(RECEBIDA) | REGRA 01 | Campo generico `status` -> sufixo entidade |
| created_at | data_criacao_resposta_cotacao_bid_cambio | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_resposta_cotacao_bid_cambio | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidCambioRespostaCotacao

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| cotacao | cotacao | N:1 | Cotacao de cambio a que esta resposta pertence |
| corretora | corretora | N:1 | Corretora que enviou a resposta |
| bid_request | disparo_cotacao | 1:1 | Disparo de cotacao que originou esta resposta (REGRA 06: `bid_request` -> `disparo_cotacao`) |

---

## 8. BidCambioCorretora

> @@map atual: `cambio_corretoras`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_corretora_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String @default("bid-cambio") | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| razao_social | razao_social_corretora_bid_cambio | String | REGRA 01 | Campo generico -> sufixo entidade |
| nome_fantasia | nome_fantasia_corretora_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| cnpj | cnpj_corretora_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| tipo | tipo_corretora_bid_cambio | BidCambioTipoCorretora @default(CORRETORA_CAMBIO) | REGRA 01 | Campo generico `tipo` -> sufixo entidade |
| status | status_corretora_bid_cambio | BidCambioStatusCorretora @default(ATIVA) | REGRA 01 | Campo generico `status` -> sufixo entidade |
| email | email_corretora_bid_cambio | String | REGRA 01 | Campo generico `email` -> sufixo entidade |
| telefone | telefone_corretora_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| contato_nome | contato_nome_corretora_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| contato_cargo | contato_cargo_corretora_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| portal_habilitado | portal_habilitado_corretora_bid_cambio | Boolean @default(false) | REGRA 01, REGRA 05 | Campo generico -> sufixo entidade (REGRA 05 ok: sem `is_`) |
| moedas_operadas | moedas_operadas_corretora_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_corretora_bid_cambio | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_corretora_bid_cambio | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidCambioCorretora

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| bid_requests | disparos_cotacao | 1:N | Disparos de cotacao enviados a esta corretora (REGRA 06) |
| bid_responses | respostas_cotacao | 1:N | Respostas enviadas por esta corretora (REGRA 06) |
| avaliacoes | avaliacoes | 1:N | Avaliacoes recebidas (ja conforme) |

---

## 9. BidCambioAvaliacaoCorretora

> @@map atual: `cambio_avaliacoes`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_avaliacao_corretora_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| corretora_id | id_corretora_bid_cambio | String | REGRA 04 | FK em ingles -> prefixo `id_` |
| cotacao_id | id_cotacao_bid_cambio | String? | REGRA 04 | FK em ingles -> prefixo `id_` |
| nota_taxa | nota_taxa_avaliacao_corretora_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |
| nota_agilidade | nota_agilidade_avaliacao_corretora_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |
| nota_atendimento | nota_atendimento_avaliacao_corretora_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |
| nota_confiabilidade | nota_confiabilidade_avaliacao_corretora_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |
| comentario | comentario_avaliacao_corretora_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_avaliacao_corretora_bid_cambio | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |

### Relacoes — BidCambioAvaliacaoCorretora

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| corretora | corretora | N:1 | Corretora avaliada |

---

## 10. BidCambioClassificacaoCorretora

> @@map atual: `cambio_rating_corretora_global`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_classificacao_corretora_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| email | email_corretora_classificacao_bid_cambio | String @unique | REGRA 01 | Campo generico `email` -> sufixo entidade |
| taxa_resposta | taxa_resposta_classificacao_bid_cambio | Decimal @db.Decimal(5, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| taxa_aprovacao | taxa_aprovacao_classificacao_bid_cambio | Decimal @db.Decimal(5, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| tempo_medio_resposta | tempo_medio_resposta_classificacao_bid_cambio | Int | REGRA 01 | Campo generico -> sufixo entidade |
| total_cotacoes | total_cotacoes_classificacao_bid_cambio | Int @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| total_aprovacoes | total_aprovacoes_classificacao_bid_cambio | Int @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| nota_media_taxa | nota_media_taxa_classificacao_bid_cambio | Decimal @db.Decimal(3, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| nota_media_agilidade | nota_media_agilidade_classificacao_bid_cambio | Decimal @db.Decimal(3, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| nota_media_atendimento | nota_media_atendimento_classificacao_bid_cambio | Decimal @db.Decimal(3, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| nota_media_confiabilidade | nota_media_confiabilidade_classificacao_bid_cambio | Decimal @db.Decimal(3, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| total_avaliacoes | total_avaliacoes_classificacao_bid_cambio | Int @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| score_global | score_global_classificacao_bid_cambio | Decimal @db.Decimal(3, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| updated_at | data_atualizacao_classificacao_bid_cambio | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidCambioClassificacaoCorretora

Nenhuma relacao direta. Model cross-tenant vinculado por `email_corretora_classificacao_bid_cambio`.

---

## 11. BidCambioGanho

> @@map atual: `cambio_savings`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_ganho_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| cotacao_id | id_cotacao_bid_cambio | String | REGRA 04 | FK em ingles -> prefixo `id_` |
| corretora_id | id_corretora_bid_cambio | String | REGRA 04 | FK em ingles -> prefixo `id_` |
| valor_operacao | valor_operacao_ganho_bid_cambio | Decimal @db.Decimal(18, 2) | REGRA 01 | Campo generico -> sufixo entidade |
| moeda | moeda_ganho_bid_cambio | BidCambioMoeda | REGRA 01 | Campo generico `moeda` -> sufixo entidade |
| taxa_aprovada | taxa_aprovada_ganho_bid_cambio | Decimal @db.Decimal(10, 4) | REGRA 01 | Campo generico -> sufixo entidade |
| taxa_media_respostas | taxa_media_respostas_ganho_bid_cambio | Decimal @db.Decimal(10, 4) | REGRA 01 | Campo generico -> sufixo entidade |
| ptax_referencia | ptax_referencia_ganho_bid_cambio | Decimal @db.Decimal(10, 4) | REGRA 01 | Campo generico -> sufixo entidade |
| economia_brl | economia_brl_ganho_bid_cambio | Decimal @db.Decimal(18, 2) | REGRA 01 | `saving` -> `ganho` (decisao dono) + sufixo entidade |
| economia_percentual | economia_percentual_ganho_bid_cambio | Decimal @db.Decimal(5, 2) | REGRA 01 | `saving` -> `ganho` (decisao dono) + sufixo entidade |
| created_at | data_criacao_ganho_bid_cambio | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |

### Relacoes — BidCambioGanho

Nenhuma relacao direta definida no fragment. FK `id_cotacao_bid_cambio` e `id_corretora_bid_cambio` sao strings sem @relation.

---

## 12. BidCambioPreferenciaUsuario

> @@map atual: `cambio_preferencias`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_preferencia_usuario_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String @unique | — | Ja conforme (tenant, unique constraint) |
| product_id | id_produto_gravity | String @default("bid-cambio") | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| mostrar_no_financeiro | mostrar_no_financeiro_preferencia_bid_cambio | Boolean @default(false) | REGRA 01, REGRA 05 | Campo generico -> sufixo entidade (REGRA 05 ok: sem `is_`) |
| alerta_email_vencimento | alerta_email_vencimento_preferencia_bid_cambio | Boolean @default(false) | REGRA 01, REGRA 05 | Campo generico -> sufixo entidade |
| dias_antecedencia_alerta | dias_antecedencia_alerta_preferencia_bid_cambio | Int? | REGRA 01 | Campo generico -> sufixo entidade |
| enviar_email_exportador | enviar_email_exportador_preferencia_bid_cambio | Boolean @default(false) | REGRA 01, REGRA 05 | Campo generico -> sufixo entidade |
| enviar_email_fim_de_semana | enviar_email_fim_de_semana_preferencia_bid_cambio | Boolean @default(true) | REGRA 01, REGRA 05 | Campo generico -> sufixo entidade |
| updated_at | data_atualizacao_preferencia_bid_cambio | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidCambioPreferenciaUsuario

Nenhuma relacao. Model singleton por tenant (@@unique em id_organizacao).

---

## 13. BidCambioPreferenciaGrid

> @@map atual: `cambio_preferencias_grid`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_preferencia_grid_bid_cambio | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| colunas_visiveis | colunas_visiveis_preferencia_grid_bid_cambio | String | REGRA 01 | Campo generico -> sufixo entidade |
| ordem_colunas | ordem_colunas_preferencia_grid_bid_cambio | String | REGRA 01 | Campo generico -> sufixo entidade |
| filtros_salvos | filtros_salvos_preferencia_grid_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| ordenacao | ordenacao_preferencia_grid_bid_cambio | String? | REGRA 01 | Campo generico -> sufixo entidade |
| updated_at | data_atualizacao_preferencia_grid_bid_cambio | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidCambioPreferenciaGrid

Nenhuma relacao. @@unique([id_organizacao, id_usuario]) garante 1 preferencia de grid por usuario por tenant.
