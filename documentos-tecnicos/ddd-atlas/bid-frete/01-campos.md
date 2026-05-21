# Atlas DDD — BID Frete Internacional — Aba 1: Campos (Field Mapping)

> Mapeamento campo-a-campo de todos os 11 models do `fragment.prisma`.
> Fonte: `servicos-global/produto/bid-frete/prisma/fragment.prisma`
>
> **Decisoes do dono aplicadas neste documento:**
> - `preco` -> `valor` (toda ocorrencia)
> - `DetalheTaxa` -> `Taxa` (simplificado, sem "detalhe")
> - `target`/`alvo` -> `meta`
> - Manter `zipcode` (nao usar `cep`)
> - `saving` -> `ganho`
> - `ranking` -> `classificacao`
> - `rating` -> `nota`
> - `product_id` -> `id_produto_gravity`
> - `user_id` -> `id_usuario`
> - `company_id` -> `id_workspace`
> - `clerk_user_id` -> `id_clerk_usuario`
> - `bid_request_id` -> `id_pedido_cotacao_bid_frete_internacional`
> - `transit_time` -> `dias_transito`

## Como ler este documento

Cada model possui duas tabelas:

1. **Tabela de Campos** — mapeamento de cada coluna do banco:
   - **Campo atual (legado)**: nome do campo como esta hoje no `fragment.prisma`.
   - **Campo DDD**: nome final apos refatoracao DDD (snake_case PT-BR).
   - **Tipo Prisma**: tipo do campo no Prisma schema.
   - **Regra violada**: qual regra DDD o nome legado viola (REGRA 01 a 06, ou "—" se ja conforme).
   - **Motivo da mudanca**: explicacao concisa do porque o nome muda.

2. **Tabela de Relacoes** — mapeamento das relacoes Prisma:
   - **Relacao atual**: nome da relacao no fragment.prisma atual.
   - **Relacao DDD**: nome DDD da relacao.
   - **Tipo**: cardinalidade (1:N, N:1, 1:1).
   - **Descricao**: o que a relacao representa.

**Regras DDD aplicadas:**
- **REGRA 01**: Campos genericos recebem sufixo da entidade. Ex: `status` -> `status_cotacao_bid_frete_internacional`.
- **REGRA 02**: PT-BR sem acento. Ex: `transit_time` -> `dias_transito`.
- **REGRA 03**: Campos de auditoria: `id` -> `id_<entidade>`, `created_at` -> `data_criacao_<entidade>`, `updated_at` -> `data_atualizacao_<entidade>`.
- **REGRA 04**: FK com prefixo `id_`: `fornecedor_id` -> `id_fornecedor_bid_frete_internacional`.
- **REGRA 05**: Booleans PT-BR adjetivo, sem prefixo `is_`.
- **REGRA 06**: Relacoes plural PT-BR snake_case.

---

## 1. BidFreteInternacionalFornecedor

> @@map atual: `bid_fornecedores` -> @@map DDD: `bid_frete_internacional_fornecedores`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_fornecedor_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme (campo de isolamento de tenant) |
| product_id | id_produto_gravity | String? | REGRA 04 | FK em ingles -> prefixo `id_` + nome DDD do produto |
| user_id | id_usuario | String? | REGRA 04 | FK em ingles -> prefixo `id_` + nome DDD |
| nome | nome_fornecedor_bid_frete_internacional | String | REGRA 01 | Campo generico `nome` -> sufixo entidade |
| nome_fantasia | nome_fantasia_fornecedor_bid_frete_internacional | String? | REGRA 01 | Campo generico `nome_fantasia` -> sufixo entidade |
| tipo | tipo_fornecedor_bid_frete_internacional | BidFreteTipoFornecedor | REGRA 01 | Campo generico `tipo` -> sufixo entidade |
| cnpj | cnpj_fornecedor_bid_frete_internacional | String? | REGRA 01 | Campo generico `cnpj` -> sufixo entidade |
| email | email_fornecedor_bid_frete_internacional | String | REGRA 01 | Campo generico `email` -> sufixo entidade |
| telefone | telefone_fornecedor_bid_frete_internacional | String? | REGRA 01 | Campo generico `telefone` -> sufixo entidade |
| whatsapp | whatsapp_fornecedor_bid_frete_internacional | String? | REGRA 01 | Campo generico `whatsapp` -> sufixo entidade |
| website | website_fornecedor_bid_frete_internacional | String? | REGRA 01 | Campo generico `website` -> sufixo entidade |
| pais | pais_fornecedor_bid_frete_internacional | String? | REGRA 01 | Campo generico `pais` -> sufixo entidade |
| cidade | cidade_fornecedor_bid_frete_internacional | String? | REGRA 01 | Campo generico `cidade` -> sufixo entidade |
| status | status_fornecedor_bid_frete_internacional | BidFreteStatusFornecedor | REGRA 01 | Campo generico `status` -> sufixo entidade |
| clerk_user_id | id_clerk_usuario | String? | REGRA 04 | FK Clerk em ingles -> `id_clerk_usuario` (decisao do dono) |
| aceita_cotacao_aberta | aceita_cotacao_aberta_fornecedor_bid_frete_internacional | Boolean @default(true) | REGRA 01 | Campo generico -> sufixo entidade (REGRA 05 ja ok: sem `is_`) |
| cotacao_automatica | cotacao_automatica_fornecedor_bid_frete_internacional | Boolean @default(false) | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_fornecedor_bid_frete_internacional | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_fornecedor_bid_frete_internacional | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidFreteInternacionalFornecedor

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| tabelas_preco | tabelas_valor | 1:N | Tabelas de valor padrao do fornecedor (decisao dono: preco -> valor) |
| bid_requests | pedidos_cotacao | 1:N | Pedidos de cotacao enviados a este fornecedor (REGRA 06) |
| bid_responses | propostas | 1:N | Propostas respondidas por este fornecedor (REGRA 06) |
| avaliacoes | avaliacoes | 1:N | Avaliacoes recebidas (ja conforme) |
| connectors | integracoes | 1:N | Conectores de integracao do fornecedor (REGRA 06) |

---

## 2. BidFreteInternacionalCotacao

> @@map atual: `bid_cotacoes` -> @@map DDD: `bid_frete_internacional_cotacoes`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_cotacao_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String? | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| company_id | id_workspace | String? | REGRA 04 | FK em ingles -> `id_workspace` (decisao dono) |
| numero | numero_cotacao_bid_frete_internacional | String | REGRA 01 | Campo generico `numero` -> sufixo entidade |
| referencia_interna | referencia_interna_cotacao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade |
| tipo_operacao | tipo_operacao_cotacao_bid_frete_internacional | BidFreteTipoOperacao | REGRA 01 | Campo generico `tipo_operacao` -> sufixo entidade |
| modal | modal_cotacao_bid_frete_internacional | BidFreteModalidade | REGRA 01 | Campo generico `modal` -> sufixo entidade |
| modalidade | modalidade_cotacao_bid_frete_internacional | BidFreteCargaModalidade | REGRA 01 | Campo generico `modalidade` -> sufixo entidade |
| origem_codigo | origem_codigo_cotacao_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| origem_nome | origem_nome_cotacao_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| origem_pais | origem_pais_cotacao_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| destino_codigo | destino_codigo_cotacao_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| destino_nome | destino_nome_cotacao_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| destino_pais | destino_pais_cotacao_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| descricao_mercadoria | descricao_mercadoria_cotacao_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| ncm | ncm_cotacao_bid_frete_internacional | String? | REGRA 01 | Campo generico `ncm` -> sufixo entidade |
| quantidade | quantidade_cotacao_bid_frete_internacional | Int @default(1) | REGRA 01 | Campo generico `quantidade` -> sufixo entidade |
| tipo_container | tipo_container_cotacao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade |
| peso_kg | peso_kg_cotacao_bid_frete_internacional | Float? | REGRA 01 | Campo generico -> sufixo entidade |
| cubagem_m3 | cubagem_m3_cotacao_bid_frete_internacional | Float? | REGRA 01 | Campo generico -> sufixo entidade |
| incoterm | incoterm_cotacao_bid_frete_internacional | String | REGRA 01 | Campo generico `incoterm` -> sufixo entidade |
| zip_code_origem | zipcode_origem_cotacao_bid_frete_internacional | String? | REGRA 01, REGRA 02 | Generico -> sufixo; underscore removido; dono decidiu manter `zipcode` |
| zip_code_destino | zipcode_destino_cotacao_bid_frete_internacional | String? | REGRA 01, REGRA 02 | Generico -> sufixo; underscore removido; dono decidiu manter `zipcode` |
| valor_target | valor_meta_cotacao_bid_frete_internacional | Float? | REGRA 01, REGRA 02 | `target` -> `meta` (decisao dono) + sufixo entidade |
| moeda_target | moeda_meta_cotacao_bid_frete_internacional | String? @default("USD") | REGRA 01, REGRA 02 | `target` -> `meta` (decisao dono) + sufixo entidade |
| visibilidade | visibilidade_cotacao_bid_frete_internacional | BidFreteCotacaoVisibilidade | REGRA 01 | Campo generico -> sufixo entidade |
| ocultar_nome_empresa | anonima_cotacao_bid_frete_internacional | Boolean @default(false) | REGRA 05 | Renomeado para adjetivo PT-BR descritivo (REGRA 05: sem `is_`, booleano descritivo) |
| status | status_cotacao_bid_frete_internacional | BidFreteCotacaoStatus | REGRA 01 | Campo generico `status` -> sufixo entidade |
| data_limite_resposta | data_limite_resposta_cotacao_bid_frete_internacional | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_aprovacao | data_aprovacao_cotacao_bid_frete_internacional | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| data_cancelamento | data_cancelamento_cotacao_bid_frete_internacional | DateTime? | REGRA 01 | Campo generico -> sufixo entidade |
| motivo_reprovacao | motivo_reprovacao_cotacao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade |
| motivo_cancelamento | motivo_cancelamento_cotacao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade |
| fornecedor_vencedor_id | id_fornecedor_vencedor_cotacao_bid_frete_internacional | String? | REGRA 04 | FK com sufixo -> prefixo `id_` (REGRA 04) |
| saving_valor | ganho_valor_cotacao_bid_frete_internacional | Float? | REGRA 02 | `saving` -> `ganho` (decisao dono) + sufixo entidade |
| saving_percentual | ganho_percentual_cotacao_bid_frete_internacional | Float? | REGRA 02 | `saving` -> `ganho` (decisao dono) + sufixo entidade |
| created_at | data_criacao_cotacao_bid_frete_internacional | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_cotacao_bid_frete_internacional | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidFreteInternacionalCotacao

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| bid_requests | pedidos_cotacao | 1:N | Pedidos de cotacao disparados para fornecedores (REGRA 06) |
| bid_responses | propostas | 1:N | Propostas recebidas dos fornecedores (REGRA 06) |

---

## 3. BidFreteInternacionalPedidoCotacao

> @@map atual: `bid_requests` -> @@map DDD: `bid_frete_internacional_pedidos_cotacao`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_pedido_cotacao_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String? | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| cotacao_id | id_cotacao_bid_frete_internacional | String | REGRA 04 | FK com sufixo `_id` -> prefixo `id_` |
| fornecedor_id | id_fornecedor_bid_frete_internacional | String | REGRA 04 | FK com sufixo `_id` -> prefixo `id_` |
| canal | canal_pedido_cotacao_bid_frete_internacional | BidFreteCotacaoFreteIntCanal | REGRA 01 | Campo generico `canal` -> sufixo entidade |
| status | status_pedido_cotacao_bid_frete_internacional | BidFreteCotacao | REGRA 01 | Campo generico `status` -> sufixo entidade |
| enviado_em | data_envio_pedido_cotacao_bid_frete_internacional | DateTime? | REGRA 01, REGRA 02 | `enviado_em` -> `data_envio` (padrao PT-BR temporal) + sufixo entidade |
| visualizado_em | data_visualizacao_pedido_cotacao_bid_frete_internacional | DateTime? | REGRA 01, REGRA 02 | `visualizado_em` -> `data_visualizacao` + sufixo entidade |
| respondido_em | data_resposta_pedido_cotacao_bid_frete_internacional | DateTime? | REGRA 01, REGRA 02 | `respondido_em` -> `data_resposta` + sufixo entidade |
| token_resposta | token_resposta_pedido_cotacao_bid_frete_internacional | String? @unique | REGRA 01 | Campo generico -> sufixo entidade |
| token_expira_em | data_expiracao_token_pedido_cotacao_bid_frete_internacional | DateTime? | REGRA 01, REGRA 02 | `token_expira_em` -> `data_expiracao_token` + sufixo entidade |
| mensagem_id | id_mensagem_pedido_cotacao_bid_frete_internacional | String? | REGRA 04 | FK/ID externo com sufixo -> prefixo `id_` |
| erro_envio | erro_envio_pedido_cotacao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_pedido_cotacao_bid_frete_internacional | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_pedido_cotacao_bid_frete_internacional | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidFreteInternacionalPedidoCotacao

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| cotacao | cotacao | N:1 | Cotacao a que este pedido pertence |
| fornecedor | fornecedor | N:1 | Fornecedor que recebeu este pedido |
| response | proposta | 1:1 | Proposta do fornecedor em resposta a este pedido (REGRA 06) |

---

## 4. BidFreteInternacionalProposta

> @@map atual: `bid_responses` -> @@map DDD: `bid_frete_internacional_propostas`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_proposta_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String? | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String? | REGRA 04 | FK em ingles -> `id_usuario` |
| bid_request_id | id_pedido_cotacao_bid_frete_internacional | String @unique | REGRA 04 | FK em ingles -> prefixo `id_` + entidade DDD (decisao dono) |
| cotacao_id | id_cotacao_bid_frete_internacional | String | REGRA 04 | FK com sufixo -> prefixo `id_` |
| fornecedor_id | id_fornecedor_bid_frete_internacional | String | REGRA 04 | FK com sufixo -> prefixo `id_` |
| moeda | moeda_proposta_bid_frete_internacional | String @default("USD") | REGRA 01 | Campo generico `moeda` -> sufixo entidade |
| valor_frete | valor_frete_proposta_bid_frete_internacional | Float | REGRA 01 | Campo generico -> sufixo entidade |
| taxas_origem | taxas_origem_proposta_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| taxas_destino | taxas_destino_proposta_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| valor_total | valor_total_proposta_bid_frete_internacional | Float | REGRA 01 | Campo generico -> sufixo entidade |
| transit_time_dias | dias_transito_proposta_bid_frete_internacional | Int | REGRA 01, REGRA 02 | `transit_time` -> `dias_transito` (PT-BR) + sufixo entidade |
| free_time_dias | dias_free_time_proposta_bid_frete_internacional | Int? | REGRA 01 | Campo generico -> sufixo entidade (free time e termo tecnico mantido) |
| validade_cotacao | validade_proposta_bid_frete_internacional | DateTime | REGRA 01 | Renomeado: e validade da proposta, nao da cotacao + sufixo entidade |
| transbordos | transbordos_proposta_bid_frete_internacional | Int @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| escalas | escalas_proposta_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade |
| observacoes | observacoes_proposta_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade |
| status | status_proposta_bid_frete_internacional | BidFretePropostaStatus | REGRA 01 | Campo generico `status` -> sufixo entidade |
| ranking_preco | classificacao_valor_proposta_bid_frete_internacional | Int? | REGRA 01, REGRA 02 | `ranking` -> `classificacao` (decisao dono) + `preco` -> `valor` (decisao dono) + sufixo |
| ranking_transit | classificacao_transito_proposta_bid_frete_internacional | Int? | REGRA 01, REGRA 02 | `ranking` -> `classificacao` + `transit` -> `transito` (PT-BR) + sufixo |
| ranking_avaliacao | classificacao_avaliacao_proposta_bid_frete_internacional | Int? | REGRA 01, REGRA 02 | `ranking` -> `classificacao` (decisao dono) + sufixo |
| via_tabela_padrao | via_tabela_valor_proposta_bid_frete_internacional | Boolean @default(false) | REGRA 01 | `tabela_padrao` -> `tabela_valor` (decisao dono: preco -> valor) + sufixo |
| via_api | via_api_proposta_bid_frete_internacional | Boolean @default(false) | REGRA 01 | Campo generico -> sufixo entidade |
| via_portal | via_portal_proposta_bid_frete_internacional | Boolean @default(false) | REGRA 01 | Campo generico -> sufixo entidade |
| via_email | via_email_proposta_bid_frete_internacional | Boolean @default(false) | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_proposta_bid_frete_internacional | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_proposta_bid_frete_internacional | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidFreteInternacionalProposta

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| bid_request | pedido_cotacao | N:1 | Pedido de cotacao que originou esta proposta (REGRA 06) |
| cotacao | cotacao | N:1 | Cotacao a que esta proposta pertence |
| fornecedor | fornecedor | N:1 | Fornecedor que enviou a proposta |
| detalhes_taxas | taxas | 1:N | Breakdown de taxas desta proposta (decisao dono: DetalheTaxa -> Taxa) |

---

## 5. BidFreteInternacionalTaxa

> @@map atual: `bid_detalhe_taxas` -> @@map DDD: `bid_frete_internacional_taxas`
> Model simplificado: `DetalheTaxa` -> `Taxa` (decisao do dono).

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_taxa_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| response_id | id_proposta_bid_frete_internacional | String | REGRA 04 | FK em ingles `response_id` -> prefixo `id_` + nome DDD da entidade alvo |
| tipo | tipo_taxa_bid_frete_internacional | String | REGRA 01 | Campo generico `tipo` -> sufixo entidade |
| nome | nome_taxa_bid_frete_internacional | String | REGRA 01 | Campo generico `nome` -> sufixo entidade |
| valor | valor_taxa_bid_frete_internacional | Float | REGRA 01 | Campo generico `valor` -> sufixo entidade |
| moeda | moeda_taxa_bid_frete_internacional | String @default("USD") | REGRA 01 | Campo generico `moeda` -> sufixo entidade |

### Relacoes — BidFreteInternacionalTaxa

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| response | proposta | N:1 | Proposta a que esta taxa pertence (REGRA 06: response -> proposta) |

---

## 6. BidFreteInternacionalTabelaValor

> @@map atual: `bid_tabelas_preco` -> @@map DDD: `bid_frete_internacional_tabelas_valor`
> Decisao dono: `preco` -> `valor` em todo o produto.

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_tabela_valor_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String? | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String? | REGRA 04 | FK em ingles -> `id_usuario` |
| fornecedor_id | id_fornecedor_bid_frete_internacional | String | REGRA 04 | FK com sufixo -> prefixo `id_` |
| origem_codigo | origem_codigo_tabela_valor_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| origem_nome | origem_nome_tabela_valor_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| destino_codigo | destino_codigo_tabela_valor_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| destino_nome | destino_nome_tabela_valor_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| modal | modal_tabela_valor_bid_frete_internacional | BidFreteModalidade | REGRA 01 | Campo generico `modal` -> sufixo entidade |
| modalidade | modalidade_tabela_valor_bid_frete_internacional | BidFreteCargaModalidade | REGRA 01 | Campo generico `modalidade` -> sufixo entidade |
| moeda | moeda_tabela_valor_bid_frete_internacional | String @default("USD") | REGRA 01 | Campo generico `moeda` -> sufixo entidade |
| valor_frete | valor_frete_tabela_valor_bid_frete_internacional | Float | REGRA 01 | Campo generico -> sufixo entidade |
| taxas_origem | taxas_origem_tabela_valor_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| taxas_destino | taxas_destino_tabela_valor_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| valor_total | valor_total_tabela_valor_bid_frete_internacional | Float | REGRA 01 | Campo generico -> sufixo entidade |
| transit_time_dias | dias_transito_tabela_valor_bid_frete_internacional | Int | REGRA 01, REGRA 02 | `transit_time` -> `dias_transito` (PT-BR) + sufixo entidade |
| free_time_dias | dias_free_time_tabela_valor_bid_frete_internacional | Int? | REGRA 01 | Campo generico -> sufixo entidade (free time e termo tecnico mantido) |
| validade_inicio | validade_inicio_tabela_valor_bid_frete_internacional | DateTime | REGRA 01 | Campo generico -> sufixo entidade |
| validade_fim | validade_fim_tabela_valor_bid_frete_internacional | DateTime | REGRA 01 | Campo generico -> sufixo entidade |
| ativa | ativa_tabela_valor_bid_frete_internacional | Boolean @default(true) | REGRA 01 | Campo generico -> sufixo entidade (REGRA 05 ja ok: adjetivo sem `is_`) |
| created_at | data_criacao_tabela_valor_bid_frete_internacional | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_tabela_valor_bid_frete_internacional | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidFreteInternacionalTabelaValor

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| fornecedor | fornecedor | N:1 | Fornecedor dono desta tabela de valor |

---

## 7. BidFreteInternacionalAvaliacao

> @@map atual: `bid_avaliacoes` -> @@map DDD: `bid_frete_internacional_avaliacoes`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_avaliacao_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String? | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| fornecedor_id | id_fornecedor_bid_frete_internacional | String | REGRA 04 | FK com sufixo -> prefixo `id_` |
| cotacao_id | id_cotacao_bid_frete_internacional | String? | REGRA 04 | FK com sufixo -> prefixo `id_` |
| nota_frete | nota_frete_avaliacao_bid_frete_internacional | Int? | REGRA 01 | Campo generico -> sufixo entidade |
| nota_atendimento | nota_atendimento_avaliacao_bid_frete_internacional | Int? | REGRA 01 | Campo generico -> sufixo entidade |
| nota_resposta | nota_resposta_avaliacao_bid_frete_internacional | Int? | REGRA 01 | Campo generico -> sufixo entidade |
| nota_confiabilidade | nota_confiabilidade_avaliacao_bid_frete_internacional | Int? | REGRA 01 | Campo generico -> sufixo entidade |
| nota_geral | nota_geral_avaliacao_bid_frete_internacional | Float? | REGRA 01 | Campo generico -> sufixo entidade |
| comentario | comentario_avaliacao_bid_frete_internacional | String? | REGRA 01 | Campo generico `comentario` -> sufixo entidade |
| created_at | data_criacao_avaliacao_bid_frete_internacional | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_avaliacao_bid_frete_internacional | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidFreteInternacionalAvaliacao

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| fornecedor | fornecedor | N:1 | Fornecedor avaliado |

---

## 8. BidFreteInternacionalClassificacao

> @@map atual: `bid_rating_fornecedor_global` -> @@map DDD: `bid_frete_internacional_classificacoes`
> **Model GLOBAL (cross-tenant) — NAO tem `id_organizacao`.**

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_classificacao_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| fornecedor_email | email_fornecedor_classificacao_bid_frete_internacional | String @unique | REGRA 01, REGRA 02 | `fornecedor_email` -> `email_fornecedor` (PT-BR: substantivo antes) + sufixo entidade |
| total_cotacoes_recebidas | total_cotacoes_recebidas_classificacao_bid_frete_internacional | Int @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| total_cotacoes_respondidas | total_cotacoes_respondidas_classificacao_bid_frete_internacional | Int @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| total_cotacoes_aprovadas | total_cotacoes_aprovadas_classificacao_bid_frete_internacional | Int @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| taxa_resposta | taxa_resposta_classificacao_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| taxa_aprovacao | taxa_aprovacao_classificacao_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| tempo_medio_resposta_horas | tempo_medio_resposta_horas_classificacao_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| aderencia_target | aderencia_meta_classificacao_bid_frete_internacional | Float @default(0) | REGRA 01, REGRA 02 | `target` -> `meta` (decisao dono) + sufixo entidade |
| rating_global | nota_global_classificacao_bid_frete_internacional | Float @default(0) | REGRA 01, REGRA 02 | `rating` -> `nota` (decisao dono) + sufixo entidade |
| media_frete | media_frete_classificacao_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| media_atendimento | media_atendimento_classificacao_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| media_resposta | media_resposta_classificacao_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| media_confiabilidade | media_confiabilidade_classificacao_bid_frete_internacional | Float @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| total_avaliacoes | total_avaliacoes_classificacao_bid_frete_internacional | Int @default(0) | REGRA 01 | Campo generico -> sufixo entidade |
| updated_at | data_atualizacao_classificacao_bid_frete_internacional | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidFreteInternacionalClassificacao

> Nenhuma relacao Prisma direta. Vinculo cross-tenant via `email_fornecedor_classificacao_bid_frete_internacional`.

---

## 9. BidFreteInternacionalGanho

> @@map atual: `bid_savings` -> @@map DDD: `bid_frete_internacional_ganhos`
> Decisao dono: `saving` -> `ganho` em todo o produto.

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_ganho_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String? | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String | REGRA 04 | FK em ingles -> `id_usuario` |
| cotacao_id | id_cotacao_bid_frete_internacional | String | REGRA 04 | FK com sufixo -> prefixo `id_` |
| company_id | id_workspace | String? | REGRA 04 | FK em ingles -> `id_workspace` (decisao dono) |
| valor_target | valor_meta_ganho_bid_frete_internacional | Float? | REGRA 01, REGRA 02 | `target` -> `meta` (decisao dono) + sufixo entidade |
| valor_aprovado | valor_aprovado_ganho_bid_frete_internacional | Float | REGRA 01 | Campo generico -> sufixo entidade |
| valor_medio | valor_medio_ganho_bid_frete_internacional | Float? | REGRA 01 | Campo generico -> sufixo entidade |
| saving_vs_target | ganho_vs_meta_ganho_bid_frete_internacional | Float? | REGRA 01, REGRA 02 | `saving` -> `ganho` + `target` -> `meta` (decisoes dono) + sufixo entidade |
| saving_vs_media | ganho_vs_media_ganho_bid_frete_internacional | Float? | REGRA 01, REGRA 02 | `saving` -> `ganho` (decisao dono) + sufixo entidade |
| saving_percentual | ganho_percentual_ganho_bid_frete_internacional | Float? | REGRA 01, REGRA 02 | `saving` -> `ganho` (decisao dono) + sufixo entidade |
| moeda | moeda_ganho_bid_frete_internacional | String @default("USD") | REGRA 01 | Campo generico `moeda` -> sufixo entidade |
| created_at | data_criacao_ganho_bid_frete_internacional | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |

### Relacoes — BidFreteInternacionalGanho

> Nenhuma relacao Prisma direta no fragment atual. FK `id_cotacao_bid_frete_internacional` aponta para BidFreteInternacionalCotacao.

---

## 10. BidFreteInternacionalIntegracao

> @@map atual: `bid_connector_configs` -> @@map DDD: `bid_frete_internacional_integracoes`

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| id | id_integracao_bid_frete_internacional | String @id @default(cuid()) | REGRA 03 | PK generica `id` -> `id_<entidade>` |
| id_organizacao | id_organizacao | String | — | Ja conforme |
| product_id | id_produto_gravity | String? | REGRA 04 | FK em ingles -> `id_produto_gravity` |
| user_id | id_usuario | String? | REGRA 04 | FK em ingles -> `id_usuario` |
| fornecedor_id | id_fornecedor_bid_frete_internacional | String? | REGRA 04 | FK com sufixo -> prefixo `id_` (null = conector ERP/SAP do cliente) |
| nome | nome_integracao_bid_frete_internacional | String | REGRA 01 | Campo generico `nome` -> sufixo entidade |
| tipo | tipo_integracao_bid_frete_internacional | BidFreteIntegracao | REGRA 01 | Campo generico `tipo` -> sufixo entidade |
| ativo | ativo_integracao_bid_frete_internacional | Boolean @default(false) | REGRA 01 | Campo generico -> sufixo entidade (REGRA 05 ja ok: adjetivo sem `is_`) |
| base_url | base_url_integracao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade |
| api_key_hash | api_key_hash_integracao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade (hash AES-256-GCM, nao traduzido) |
| auth_type | tipo_autenticacao_integracao_bid_frete_internacional | String? | REGRA 01, REGRA 02 | `auth_type` -> `tipo_autenticacao` (PT-BR) + sufixo entidade |
| headers_extra | headers_extra_integracao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade (JSON de headers adicionais) |
| config_extra | config_extra_integracao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade (JSON livre) |
| ultimo_teste_em | data_ultimo_teste_integracao_bid_frete_internacional | DateTime? | REGRA 01, REGRA 02 | `ultimo_teste_em` -> `data_ultimo_teste` (padrao temporal) + sufixo entidade |
| ultimo_teste_ok | ultimo_teste_ok_integracao_bid_frete_internacional | Boolean? | REGRA 01 | Campo generico -> sufixo entidade |
| erro_ultimo_teste | erro_ultimo_teste_integracao_bid_frete_internacional | String? | REGRA 01 | Campo generico -> sufixo entidade |
| created_at | data_criacao_integracao_bid_frete_internacional | DateTime @default(now()) | REGRA 03 | Audit `created_at` -> `data_criacao_<entidade>` |
| updated_at | data_atualizacao_integracao_bid_frete_internacional | DateTime @updatedAt | REGRA 03 | Audit `updated_at` -> `data_atualizacao_<entidade>` |

### Relacoes — BidFreteInternacionalIntegracao

| Relacao atual | Relacao DDD | Tipo | Descricao |
|---|---|---|---|
| fornecedor | fornecedor | N:1 | Fornecedor dono do conector (null = conector ERP/SAP do cliente) |

---

## 11. BidFreteInternacionalPorto

> @@map atual: `bid_portos` -> @@map DDD: `bid_frete_internacional_portos`
> **Model GLOBAL (cache) — NAO tem `id_organizacao`. PK = `codigo` (UN/LOCODE).**

| Campo atual (legado) | Campo DDD | Tipo Prisma | Regra violada | Motivo da mudanca |
|---|---|---|---|---|
| codigo | codigo_porto_bid_frete_internacional | String @id | REGRA 01 | PK generica `codigo` -> sufixo entidade (PK natural: UN/LOCODE) |
| nome | nome_porto_bid_frete_internacional | String | REGRA 01 | Campo generico `nome` -> sufixo entidade |
| pais | pais_porto_bid_frete_internacional | String | REGRA 01 | Campo generico `pais` -> sufixo entidade |
| pais_codigo | pais_codigo_porto_bid_frete_internacional | String | REGRA 01 | Campo generico -> sufixo entidade |
| tipo | tipo_porto_bid_frete_internacional | String | REGRA 01 | Campo generico `tipo` -> sufixo entidade |
| latitude | latitude_porto_bid_frete_internacional | Float? | REGRA 01 | Campo generico -> sufixo entidade |
| longitude | longitude_porto_bid_frete_internacional | Float? | REGRA 01 | Campo generico -> sufixo entidade |
| ativo | ativo_porto_bid_frete_internacional | Boolean @default(true) | REGRA 01 | Campo generico -> sufixo entidade (REGRA 05 ja ok: adjetivo sem `is_`) |

### Relacoes — BidFreteInternacionalPorto

> Nenhuma relacao Prisma direta. Tabela de cache global consultada por codigo UN/LOCODE.

---

## Resumo de Violacoes

| Regra | Quantidade de campos afetados | Descricao |
|---|---|---|
| REGRA 01 (sufixo entidade) | 118 | Maioria dos campos: nomes genericos sem sufixo da entidade |
| REGRA 02 (PT-BR sem acento) | 18 | Campos em ingles ou mistos: `transit_time`, `saving`, `ranking`, `rating`, `target`, `auth_type`, `zip_code` |
| REGRA 03 (audit) | 30 | Campos `id`, `created_at`, `updated_at` -> padrao `id_<entidade>`, `data_criacao_<entidade>`, `data_atualizacao_<entidade>` |
| REGRA 04 (FK prefixo) | 24 | FKs com sufixo `_id` ou em ingles: `product_id`, `user_id`, `company_id`, `fornecedor_id`, `cotacao_id`, `response_id`, `bid_request_id` |
| REGRA 05 (boolean sem is_) | 0 | Nenhuma violacao — fragment ja nao usa prefixo `is_` |
| REGRA 06 (relacoes PT-BR) | 8 | Relacoes em ingles: `bid_requests`, `bid_responses`, `connectors`, `tabelas_preco`, `response`, `detalhes_taxas` |

### Decisoes do dono aplicadas

| Decisao | Campos afetados | Exemplo |
|---|---|---|
| `preco` -> `valor` | 5 | `tabelas_preco` -> `tabelas_valor`, `ranking_preco` -> `classificacao_valor` |
| `saving` -> `ganho` | 7 | `saving_valor` -> `ganho_valor`, `saving_vs_target` -> `ganho_vs_meta` |
| `ranking` -> `classificacao` | 3 | `ranking_preco` -> `classificacao_valor`, `ranking_transit` -> `classificacao_transito` |
| `rating` -> `nota` | 1 | `rating_global` -> `nota_global` |
| `target` -> `meta` | 5 | `valor_target` -> `valor_meta`, `moeda_target` -> `moeda_meta`, `aderencia_target` -> `aderencia_meta` |
| `transit_time` -> `dias_transito` | 3 | `transit_time_dias` -> `dias_transito_<entidade>` |
| `product_id` -> `id_produto_gravity` | 8 | Em todos os models que possuem `product_id` |
| `user_id` -> `id_usuario` | 8 | Em todos os models que possuem `user_id` |
| `company_id` -> `id_workspace` | 2 | Em Cotacao e Ganho |
| `clerk_user_id` -> `id_clerk_usuario` | 1 | Em Fornecedor |
| `bid_request_id` -> `id_pedido_cotacao_bid_frete_internacional` | 1 | Em Proposta |
