# Atlas DDD — Simula COMEX (Simula Custo) — Aba 1: Campos (Field Mapping)

> Mapeamento campo-a-campo de todos os **8 models** do `fragment.prisma`.
> Fonte: `servicos-global/produto/simula-custo/prisma/fragment.prisma`
> Branch de referência: `simula-custo` (TASK-000425 — DDD aprovado pelo dono)
>
> **Decisões do dono aplicadas neste documento:**
> - Entidade canônica: `simula_custo` (model `SimulaCusto`)
> - Padrão de campo: `<campo>_<entidade>_<produto>` (gabarito BID Frete Internacional)
> - `tenant_id` → `id_organizacao`, `company_id` → `id_workspace`, `user_id` → `id_usuario`, `product_id` → `id_produto`
> - `processo_id` → `id_processo` (ref lógica Processo — sem FK física cross-banco)
> - `landed_cost_brl` → `custo_nacionalizado_brl_simula_custo`
> - `source` → `fonte_calculo_simula_custo` (`siscomex` | `gravity-engine` | `fallback`)
> - NCM: leitura ao vivo Cadastros.NcmSync — **sem** `cache_aliquotas_ncm` local (cadastros-snapshot-policy)
> - Taxas origem/destino: tabelas separadas (gabarito BID Frete), ref lógica `Cadastros.taxa_origem_destino`
> - Prazos de pagamento: tabela filha `prazo_pagamento_simula_custo` (múltiplas linhas)
> - Modalidade ICMS: enum `ModalidadeRecolhimentoIcmsSimulaCusto`
> - Integração Bid Frete: flag `enviar_solicitacao_cotacao_frete_simula_custo`

---

## Como ler este documento

Cada model possui:

1. **Tabela de Campos** — colunas:
   - **Campo legado**: nome anterior (doc `ARQUITETURA.md` v1 / atlas global desatualizado), ou `—` se o produto nasceu já em DDD.
   - **Campo DDD**: nome final (banco = back = front = payload JSON).
   - **Tipo Prisma**: tipo no `fragment.prisma`.
   - **Obrig.**: Sim / Não.
   - **Default**: valor padrão Prisma, se houver.
   - **Migration**: pasta em `prisma/migrations/` que introduziu o campo.
   - **Conformidade**: `—` se já conforme; ou nota de pendência.

2. **Tabela de Relações** — cardinalidade e descrição.

**Migrations (ordem cronológica):**

| # | Migration | Conteúdo |
|:--|:--|:--|
| 1 | `20260719015830_init_ddd_simula_custo` | Schema base (6 tabelas tenant + cache BACEN) |
| 2 | `20260720120000_prazo_pagamento_simula_custo` | Tabela `prazo_pagamento_simula_custo` + enums de prazo |
| 3 | `20260720160000_modalidade_recolhimento_icms_simula_custo` | Coluna `modalidade_recolhimento_icms_simula_custo` |
| 4 | `20260720180000_fato_gerador_no_bl_prazo_pagamento` | Enum value `NO_BL` em fato gerador |
| 5 | `20260720190000_enviar_solicitacao_cotacao_frete_simula_custo` | Flag cotação frete |

---

## Enums (10)

| Enum Prisma | @@map PG | Valores | Migration |
|:---|:---|:---|:---|
| `TipoOperacaoSimulaCusto` | `TipoOperacaoSimulaCusto` | IMPORTACAO, EXPORTACAO | init |
| `DetalheOperacaoSimulaCusto` | `DetalheOperacaoSimulaCusto` | DIRETA, CONTA_ORDEM, ENCOMENDA, COMERCIAL_EXPORTADORA | init |
| `StatusSimulaCusto` | `StatusSimulaCusto` | EM_CRIACAO, CRIADA, ARQUIVADA | init |
| `TipoCobrancaSimulaCusto` | `TipoCobrancaSimulaCusto` | PROCESSO, CONTAINER, AWB, BL, CRT, KGS, TON, CAIXA, M3 | init |
| `TipoTributoSimulaCusto` | `TipoTributoSimulaCusto` | II, IPI, PIS, COFINS, ICMS | init |
| `TipoDocumentoSimulaCusto` | `TipoDocumentoSimulaCusto` | PEDIDO_COMPRA, PEDIDO_VENDA, PROFORMA, INVOICE, OUTRO | init |
| `TipoValorPrazoPagamentoSimulaCusto` | `TipoValorPrazoPagamentoSimulaCusto` | VALOR, PERCENTUAL | prazo_pagamento |
| `MomentoPrazoPagamentoSimulaCusto` | `MomentoPrazoPagamentoSimulaCusto` | NO_DIA, ANTES, DEPOIS | prazo_pagamento |
| `FatoGeradorPrazoPagamentoSimulaCusto` | `FatoGeradorPrazoPagamentoSimulaCusto` | PRODUCAO, ENTREGA_NA_ORIGEM, ENTREGA_NO_PORTO_DE_ORIGEM, ENTREGA_NO_LOCAL_DE_ORIGEM, ENTREGA_NO_DESTINO, NO_BL, ENTREGA_NO_PORTO_DE_DESTINO, ENTREGA_NO_LOCAL_DE_DESTINO, EMBARQUE_NO_DESTINO, CHEGADA_NO_DESTINO | prazo + NO_BL |
| `ModalidadeRecolhimentoIcmsSimulaCusto` | `ModalidadeRecolhimentoIcmsSimulaCusto` | INTEGRAL, REDUCAO, ISENTO, DIFERIDO | modalidade_icms |

---

## 1. SimulaCusto

> @@map: `simula_custo`

| Campo legado | Campo DDD | Tipo Prisma | Obrig. | Default | Migration | Conformidade |
|:---|:---|:---|:--:|:---|:---|:---|
| id | id_simula_custo | String @id @default(cuid()) | Sim | cuid | init | REGRA 03 |
| tenant_id | id_organizacao | String | Sim | — | init | — |
| company_id | id_workspace | String | Sim | — | init | — |
| product_id | id_produto | String | Sim | simula-custo | init | — |
| user_id | id_usuario | String | Sim | — | init | — |
| processo_id | id_processo | String? | Não | null | init | ref lógica Processo |
| numero | numero_simula_custo | String | Sim | — | init | **Pendência:** `@@unique([id_organizacao, id_workspace, numero_simula_custo])` |
| referencia | referencia_simula_custo | String? | Não | null | init | — |
| operacao | tipo_operacao_simula_custo | TipoOperacaoSimulaCusto | Sim | IMPORTACAO | init | — |
| tipo_operacao | detalhe_operacao_simula_custo | DetalheOperacaoSimulaCusto | Sim | DIRETA | init | — |
| status | status_simula_custo | StatusSimulaCusto | Sim | EM_CRIACAO | init | — |
| ncm | ncm_simula_custo | String | Sim | — | init | snapshot no cálculo |
| ncm_descricao | descricao_ncm_simula_custo | String? | Não | null | init | — |
| incoterm | incoterm_simula_custo | String | Sim | FOB | init | — |
| quantidade | quantidade_simula_custo | Decimal @db.Decimal(15, 5) | Sim | 0 | init | — |
| moeda_produto | moeda_produto_simula_custo | String | Sim | USD | init | — |
| valor_produto | valor_produto_simula_custo | Decimal @db.Decimal(15, 2) | Sim | — | init | — |
| moeda_frete | moeda_frete_simula_custo | String | Sim | USD | init | — |
| valor_frete | valor_frete_simula_custo | Decimal @db.Decimal(15, 2) | Sim | 0 | init | — |
| — | enviar_solicitacao_cotacao_frete_simula_custo | Boolean | Sim | false | cotacao_frete | integração Bid Frete |
| moeda_seguro | moeda_seguro_simula_custo | String | Sim | USD | init | — |
| valor_seguro | valor_seguro_simula_custo | Decimal @db.Decimal(15, 2) | Sim | 0 | init | — |
| uf_desembaraco | uf_desembaraco_simula_custo | String | Sim | SP | init | — |
| — | modalidade_recolhimento_icms_simula_custo | ModalidadeRecolhimentoIcmsSimulaCusto | Sim | INTEGRAL | modalidade_icms | — |
| aliquota_icms | aliquota_icms_simula_custo | Decimal @db.Decimal(5, 4) | Sim | 0 | init | — |
| usa_beneficio | usa_beneficio_simula_custo | Boolean | Sim | false | init | REGRA 05 |
| icms_entrada | icms_entrada_simula_custo | Decimal? @db.Decimal(15, 2) | Não | null | init | — |
| icms_saida | icms_saida_simula_custo | Decimal? @db.Decimal(15, 2) | Não | null | init | — |
| aliquota_ii | aliquota_ii_simula_custo | Decimal @db.Decimal(5, 4) | Sim | 0 | init | snapshot |
| aliquota_ipi | aliquota_ipi_simula_custo | Decimal @db.Decimal(5, 4) | Sim | 0 | init | snapshot |
| aliquota_pis | aliquota_pis_simula_custo | Decimal @db.Decimal(5, 4) | Sim | 0 | init | snapshot |
| aliquota_cofins | aliquota_cofins_simula_custo | Decimal @db.Decimal(5, 4) | Sim | 0 | init | snapshot |
| reducao_ii | reducao_ii_simula_custo | Decimal @db.Decimal(5, 4) | Sim | 0 | init | — |
| ptax_utilizada | ptax_utilizada_simula_custo | Decimal? @db.Decimal(10, 4) | Não | null | init | — |
| valor_aduaneiro | valor_aduaneiro_simula_custo | Decimal? @db.Decimal(15, 2) | Não | null | init | — |
| total_tributos | total_tributos_simula_custo | Decimal? @db.Decimal(15, 2) | Não | null | init | — |
| landed_cost_brl | custo_nacionalizado_brl_simula_custo | Decimal? @db.Decimal(15, 2) | Não | null | init | — |
| source | fonte_calculo_simula_custo | String? | Não | null | init | siscomex / gravity-engine / fallback |
| created_at | data_criacao_simula_custo | DateTime @default(now()) | Sim | now() | init | REGRA 03 |
| updated_at | data_atualizacao_simula_custo | DateTime @updatedAt | Sim | — | init | REGRA 03 |

### Relações — SimulaCusto

| Relação DDD | Tipo | Model filho | Descrição |
|:---|:---|:---|:---|
| taxas_origem | 1:N | TaxaOrigemSimulaCusto | Taxas no exterior (THC, capatazia origem, etc.) |
| taxas_destino | 1:N | TaxaDestinoSimulaCusto | Taxas no destino (armazenagem, frete rodoviário, etc.) |
| tributos | 1:N | TributoSimulaCusto | Detalhamento II, IPI, PIS, COFINS, ICMS calculados |
| documentos | 1:N | DocumentoSimulaCusto | PO, Proforma, Invoice vinculados |
| prazos_pagamento | 1:N | PrazoPagamentoSimulaCusto | Condições de pagamento (múltiplas linhas) |

### Índices — SimulaCusto

| Índice | Campos |
|:---|:---|
| obrigatórios tenant | `id_organizacao`, `id_workspace`, `id_organizacao+id_workspace`, `id_organizacao+id_produto`, `id_organizacao+id_usuario` |
| consulta | `id_organizacao+numero_simula_custo`, `id_organizacao+status_simula_custo`, `id_organizacao+ncm_simula_custo`, `id_processo` |

---

## 2. TaxaOrigemSimulaCusto

> @@map: `taxa_origem_simula_custo`
> Substitui legado `TaxaEstimativa` com `tipo=ORIGEM` (tabela unificada antiga).

| Campo legado | Campo DDD | Tipo Prisma | Obrig. | Default | Migration | Conformidade |
|:---|:---|:---|:--:|:---|:---|:---|
| id | id_taxa_origem_simula_custo | String @id @default(cuid()) | Sim | cuid | init | REGRA 03 |
| tenant_id | id_organizacao | String | Sim | — | init | — |
| company_id | id_workspace | String | Sim | — | init | — |
| product_id | id_produto | String | Sim | simula-custo | init | — |
| user_id | id_usuario | String? | Não | null | init | — |
| id_simula_custo (legado estimativa_id) | id_simula_custo | String | Sim | — | init | FK cascade |
| — | id_taxa_origem_destino | String? | Não | null | init | ref Cadastros (sem FK física) |
| nome | nome_taxa_origem_simula_custo | String | Sim | — | init | — |
| moeda | moeda_taxa_origem_simula_custo | String | Sim | USD | init | — |
| cobranca_por | tipo_cobranca_taxa_origem_simula_custo | TipoCobrancaSimulaCusto | Sim | PROCESSO | init | — |
| valor_minimo | valor_minimo_taxa_origem_simula_custo | Decimal @db.Decimal(15, 2) | Sim | 0 | init | — |
| valor_total | valor_total_taxa_origem_simula_custo | Decimal @db.Decimal(15, 2) | Sim | — | init | — |

### Relações — TaxaOrigemSimulaCusto

| Relação DDD | Tipo | Model pai | Descrição |
|:---|:---|:---|:---|
| simula | N:1 | SimulaCusto | Simula dona da taxa |

---

## 3. TaxaDestinoSimulaCusto

> @@map: `taxa_destino_simula_custo`
> Substitui legado `TaxaEstimativa` com `tipo=DESTINO`.

| Campo legado | Campo DDD | Tipo Prisma | Obrig. | Default | Migration | Conformidade |
|:---|:---|:---|:--:|:---|:---|:---|
| id | id_taxa_destino_simula_custo | String @id @default(cuid()) | Sim | cuid | init | REGRA 03 |
| tenant_id | id_organizacao | String | Sim | — | init | — |
| company_id | id_workspace | String | Sim | — | init | — |
| product_id | id_produto | String | Sim | simula-custo | init | — |
| user_id | id_usuario | String? | Não | null | init | — |
| id_simula_custo (legado estimativa_id) | id_simula_custo | String | Sim | — | init | FK cascade |
| — | id_taxa_origem_destino | String? | Não | null | init | ref Cadastros (sem FK física) |
| nome | nome_taxa_destino_simula_custo | String | Sim | — | init | — |
| moeda | moeda_taxa_destino_simula_custo | String | Sim | USD | init | — |
| cobranca_por | tipo_cobranca_taxa_destino_simula_custo | TipoCobrancaSimulaCusto | Sim | PROCESSO | init | — |
| valor_minimo | valor_minimo_taxa_destino_simula_custo | Decimal @db.Decimal(15, 2) | Sim | 0 | init | — |
| valor_total | valor_total_taxa_destino_simula_custo | Decimal @db.Decimal(15, 2) | Sim | — | init | — |

### Relações — TaxaDestinoSimulaCusto

| Relação DDD | Tipo | Model pai | Descrição |
|:---|:---|:---|:---|
| simula | N:1 | SimulaCusto | Simula dona da taxa |

---

## 4. TributoSimulaCusto

> @@map: `tributo_simula_custo`
> Legado: `TributoEstimativa`.

| Campo legado | Campo DDD | Tipo Prisma | Obrig. | Default | Migration | Conformidade |
|:---|:---|:---|:--:|:---|:---|:---|
| id | id_tributo_simula_custo | String @id @default(cuid()) | Sim | cuid | init | REGRA 03 |
| tenant_id | id_organizacao | String | Sim | — | init | — |
| company_id | id_workspace | String | Sim | — | init | — |
| product_id | id_produto | String | Sim | simula-custo | init | — |
| user_id | id_usuario | String? | Não | null | init | — |
| id_simula_custo (legado estimativa_id) | id_simula_custo | String | Sim | — | init | FK cascade |
| tributo | tipo_tributo_simula_custo | TipoTributoSimulaCusto | Sim | — | init | — |
| aliquota | aliquota_tributo_simula_custo | Decimal @db.Decimal(5, 4) | Sim | — | init | — |
| base_calculo | base_calculo_tributo_simula_custo | Decimal @db.Decimal(15, 2) | Sim | — | init | — |
| valor | valor_tributo_simula_custo | Decimal @db.Decimal(15, 2) | Sim | — | init | — |
| reducao | reducao_tributo_simula_custo | Decimal? @db.Decimal(5, 4) | Não | null | init | — |
| acordo | acordo_tributo_simula_custo | String? | Não | null | init | ex.: Mercosul |

### Relações — TributoSimulaCusto

| Relação DDD | Tipo | Model pai | Descrição |
|:---|:---|:---|:---|
| simula | N:1 | SimulaCusto | Simula dona do tributo calculado |

---

## 5. DocumentoSimulaCusto

> @@map: `documento_simula_custo`
> Legado: `DocumentoEstimativa` / `SimulaCustoAnexos`.

| Campo legado | Campo DDD | Tipo Prisma | Obrig. | Default | Migration | Conformidade |
|:---|:---|:---|:--:|:---|:---|:---|
| id | id_documento_simula_custo | String @id @default(cuid()) | Sim | cuid | init | REGRA 03 |
| tenant_id | id_organizacao | String | Sim | — | init | — |
| company_id | id_workspace | String | Sim | — | init | — |
| product_id | id_produto | String | Sim | simula-custo | init | — |
| user_id | id_usuario | String? | Não | null | init | — |
| id_simula_custo (legado estimativa_id) | id_simula_custo | String | Sim | — | init | FK cascade |
| tipo | tipo_documento_simula_custo | TipoDocumentoSimulaCusto | Sim | — | init | — |
| numero | numero_documento_simula_custo | String | Sim | — | init | até 30 chars |
| created_at | data_criacao_documento_simula_custo | DateTime @default(now()) | Sim | now() | init | REGRA 03 |

### Relações — DocumentoSimulaCusto

| Relação DDD | Tipo | Model pai | Descrição |
|:---|:---|:---|:---|
| simula | N:1 | SimulaCusto | Simula dona do documento |

---

## 6. PrazoPagamentoSimulaCusto

> @@map: `prazo_pagamento_simula_custo`
> **Tabela nova** — não existia no legado `ARQUITETURA.md` v1.

| Campo legado | Campo DDD | Tipo Prisma | Obrig. | Default | Migration | Conformidade |
|:---|:---|:---|:--:|:---|:---|:---|
| — | id_prazo_pagamento_simula_custo | String @id @default(cuid()) | Sim | cuid | prazo_pagamento | REGRA 03 |
| tenant_id | id_organizacao | String | Sim | — | prazo_pagamento | — |
| company_id | id_workspace | String | Sim | — | prazo_pagamento | — |
| product_id | id_produto | String | Sim | simula-custo | prazo_pagamento | — |
| user_id | id_usuario | String? | Não | null | prazo_pagamento | — |
| id_simula_custo (legado estimativa_id) | id_simula_custo | String | Sim | — | prazo_pagamento | FK cascade |
| — | valor_prazo_pagamento_simula_custo | Decimal @db.Decimal(15, 4) | Sim | — | prazo_pagamento | valor ou % conforme tipo |
| — | tipo_valor_prazo_pagamento_simula_custo | TipoValorPrazoPagamentoSimulaCusto | Sim | PERCENTUAL | prazo_pagamento | — |
| — | momento_prazo_pagamento_simula_custo | MomentoPrazoPagamentoSimulaCusto | Sim | NO_DIA | prazo_pagamento | — |
| — | dias_prazo_pagamento_simula_custo | Int | Sim | 0 | prazo_pagamento | — |
| — | fato_gerador_prazo_pagamento_simula_custo | FatoGeradorPrazoPagamentoSimulaCusto | Sim | — | prazo_pagamento | inclui NO_BL |
| — | ordem_prazo_pagamento_simula_custo | Int | Sim | 0 | prazo_pagamento | ordenação na UI |

### Relações — PrazoPagamentoSimulaCusto

| Relação DDD | Tipo | Model pai | Descrição |
|:---|:---|:---|:---|
| simula | N:1 | SimulaCusto | Simula dona do prazo |

---

## 7. SequenciaSimulaCusto

> @@map: `sequencia_simula_custo`
> Legado: `SequenciaEstimativa` / `SimulaCustoSequencia`.
> Gera numeração `EST-IMP-00001/26` por `id_organizacao` + `id_usuario` + ano.

| Campo legado | Campo DDD | Tipo Prisma | Obrig. | Default | Migration | Conformidade |
|:---|:---|:---|:--:|:---|:---|:---|
| id | id_sequencia_simula_custo | String @id @default(cuid()) | Sim | cuid | init | REGRA 03 |
| tenant_id | id_organizacao | String | Sim | — | init | — |
| user_id | id_usuario | String | Sim | — | init | — |
| ano | ano_sequencia_simula_custo | Int | Sim | — | init | — |
| ultimo_numero | ultimo_numero_sequencia_simula_custo | Int | Sim | 0 | init | — |

**@@unique:** `[id_organizacao, id_usuario, ano_sequencia_simula_custo]`

**Pendências:**
- Sem `id_workspace` — confirmar se numeração é por org ou por filial.
- Sem `@@index([id_organizacao, id_produto])` (índice obrigatório em models tenant).

---

## 8. AnexoDocumentoSimulaCusto

> @@map: `anexo_documento_simula_custo`
> Filho de `documento_simula_custo` — binário S3/local + metadado.

| Campo legado | Campo DDD | Tipo Prisma | Obrig. | Migration | Conformidade |
|:---|:---|:---|:--:|:---|:---|
| — | id_anexo_documento_simula_custo | String @id @default(cuid()) | Sim | anexo_documento | REGRA 03 |
| — | id_documento_simula_custo | String | Sim | anexo_documento | FK cascade |
| — | chave_storage_anexo_documento_simula_custo | String | Sim | anexo_documento | S3/local |
| — | nome_original_anexo_documento_simula_custo | String | Sim | anexo_documento | — |

---

## Tabelas removidas (não criar no Railway)

| Legado | Motivo |
|:---|:---|
| `CacheAliquota` / `cache_aliquotas_ncm` | NCM e alíquotas vêm ao vivo do Cadastros.NcmSync |
| `CacheCambio` / `cache_cambio_bacen` | PTAX via SSOT `GET /api/v1/taxas-moeda` (Configurador) — migration `20260720240000_drop_cache_cambio_bacen` |
| `TaxaEstimativa` unificada (origem+destino) | Separada em `taxa_origem_*` e `taxa_destino_*` (gabarito BID Frete) |
| `estimativas_trade` | Renomeada para `simula_custo` |

---

## Contratos Zod (paridade bilateral)

| Arquivo backend | Arquivo frontend | Observação |
|:---|:---|:---|
| `server/src/schemas/simula-custo-schema.ts` | `client/src/shared/schemas-simula-custo.ts` | Mandamento 09 — mesmo commit |

Schemas incluem: enums de prazo, `PrazoPagamentoSimulaCustoSchema`, `ModalidadeRecolhimentoIcmsSimulaCustoSchema`, flag `enviar_solicitacao_cotacao_frete_simula_custo`.

---

## RLS PostgreSQL (`prisma/rls-policies.sql`)

Tabelas com RLS (executar **por schema** `tenant_<cuid>` após `migrate-all-tenants`):

- `simula_custo`
- `taxa_origem_simula_custo`
- `taxa_destino_simula_custo`
- `tributo_simula_custo`
- `documento_simula_custo`
- `prazo_pagamento_simula_custo`
- `sequencia_simula_custo`

---

## Pendências para decisão do dono (antes do Railway)

| # | Item | Opções |
|:--|:---|:---|
| 1 | Unicidade do número | Adicionar `@@unique([id_organizacao, id_workspace, numero_simula_custo])`? |
| 2 | Sequência por filial | Incluir `id_workspace` em `SequenciaSimulaCusto`? |
| 3 | Filtro workspace nas queries | Rotas de listagem/KPI devem filtrar `id_workspace` além de `id_organizacao` |

---

## Provisionamento Railway (checklist)

1. Criar PostgreSQL `gravity-simula-custo`
2. `DATABASE_URL` + `CHAVE_INTERNA_SERVICO` + `PORT=8020` no serviço app
3. **Não** usar `prisma migrate deploy` direto no `public`
4. `npx tsx scripts/ativamente/migrate-all-tenants.ts --product=simula-custo`
5. Aplicar `prisma/rls-policies.sql` em cada `tenant_<cuid>`
6. Ativar produto no Configurador por organização

---

*Gerado em TASK-000427 — branch alvo `banco-simula-comex` · fonte `simula-custo`.*
