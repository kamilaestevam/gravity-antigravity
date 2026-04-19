# AUDITORIA DO DICIONÁRIO DE DADOS — banco-configurador-teste
**Arquiteto de Dados:** Agente IA  
**Data:** 2026-04-19  
**Fonte Tech Lead:** `campos_back_front_banco_tela_gravity - banco-configurador-teste.csv`  
**Fonte Código:** `configurador/prisma/schema.prisma` (22 models, 11 enums)  
**Escopo:** Cruzamento rigoroso Tech Lead × Realidade do Código

---

## LEGENDA DE STATUS

| Ícone | Status | Significado |
|---|---|---|
| ✅ | OK | Existe no código e mapeado corretamente |
| ⚠️ | ALERTA — Faltou Mapear | Existe no código mas ausente ou incompleto no mapeamento |
| 🚨 | CÓDIGO FANTASMA | Tech Lead mapeou mas não existe no schema |
| 🔴 | DIVERGÊNCIA | Existe em ambos mas com campos/estrutura errados |
| ℹ️ | PENDENTE DECISÃO | Tech Lead sinalizou "juntar" ou "excluir" — aguarda aprovação |

---

## PARTE 1 — AUDITORIA DE TABELAS (nível model)

| Tabela no Código | Nome DDD (Tech Lead) | Status | Observação |
|---|---|---|---|
| `_prisma_migrations` | `_prisma_migrations` | ✅ OK | Tabela interna Prisma, correto não renomear |
| `Tenant` | `organização` | ✅ OK | — |
| `Company` | `workspace` | ✅ OK | — |
| `User` | `usuario` | ✅ OK | — |
| `UserMembership` | `usuario_workspace` | ✅ OK | — |
| `UserPermission` | `usuario_permissao` | 🔴 DIVERGÊNCIA | Ver Parte 2 — estrutura real difere do mapeamento |
| `Product` | `produtos_gravity` | ✅ OK | Mapeamento muito resumido — ver Parte 2 |
| `PriceTier` | *(sem nome — "juntar com Produto")* | ℹ️ PENDENTE DECISÃO | Tech Lead quer agrupar sob Product. Existe no código como tabela independente |
| `Subscription` | `assinatura_produto_gravity` | 🔴 DIVERGÊNCIA | **Linha duplicada no CSV** + estrutura real é Stripe-centric, sem `product_key` nem `plano` |
| `CompanyProduct` | `produto_gravity_workspace` | ✅ OK | — |
| `SpecialNegotiation` | *(sem nome — "juntar com Produto")* | ℹ️ PENDENTE DECISÃO | Existe no código. Campos em inglês no schema vs português no mapeamento |
| `StripeEvent` | `excluir` | ℹ️ PENDENTE DECISÃO | Tech Lead quer excluir do dicionário. Tabela existe e é usada por webhooks Stripe |
| `ProductConfig` | *(sem nome — "???")* | ⚠️ ALERTA — Faltou Mapear | Tech Lead não sabia o que era. Sugestão: `ativacao_produto_tenant` |
| `DeployLog` | `deploy` | ✅ OK | Campo `deploy_number` (autoincrement) não mencionado no mapeamento |
| `TestPlan` | *(sem nome — "juntar com Testes")* | 🔴 DIVERGÊNCIA | Estrutura real completamente diferente do mapeado — ver Parte 2 |
| `TestLog` | `testes` | ⚠️ ALERTA — Faltou Mapear | Campos `escopo`, `sublocal`, `ambient`, `run_id`, `triggered_by` ausentes no mapeamento |
| `TestSchedule` | *(sem nome — "juntar com Testes")* | 🔴 DIVERGÊNCIA | Estrutura real completamente diferente — ver Parte 2 |
| `GravityAdminPermission` | *(sem nome — "juntar com Usuario")* | ℹ️ PENDENTE DECISÃO | Existe no código. Tech Lead quer agrupar com Usuário |
| `RateLimitMetric` | `requisicoes` | ✅ OK | — |
| `SecurityEvent` | `seguranca` | ✅ OK | — |
| `ServiceHealth` | `servicos` | ✅ OK | — |
| `SupplierTenantAccess` | `fornecedor_organizacao` | ✅ OK | Usa `clerk_user_id` em vez de `user_id` — detalhe importante |
| `TaxaCambio` | `cambio` | ⚠️ ALERTA — Faltou Mapear | Campos `compra`, `venda`, `hora_cotacao`, `boletim`, `fonte` ausentes. Campo usa `criado_em` (PT) e não `created_at` (EN) |
| `role_audit_log` | `historico` | 🚨 CÓDIGO FANTASMA | **NÃO EXISTE no schema Prisma.** Não há model `role_audit_log`. Pode ser tabela raw SQL ou nunca foi criada |

**Resumo Parte 1:**
- ✅ OK: 11 tabelas
- 🔴 DIVERGÊNCIA: 3 tabelas
- ⚠️ Faltou Mapear: 3 tabelas
- 🚨 Código Fantasma: 1 tabela
- ℹ️ Pendente Decisão: 5 tabelas

---

## PARTE 2 — AUDITORIA DE CAMPOS (nível field) — divergências críticas

### 2.1 `UserPermission` — 🔴 DIVERGÊNCIA ESTRUTURAL

| Campo no Código | Tipo | Tech Lead disse | Status |
|---|---|---|---|
| `id` | String CUID | *(não mapeado)* | ⚠️ Faltou |
| `tenant_id` | String | *(não mapeado)* | ⚠️ Faltou |
| `company_id` | String | *(não mapeado)* | ⚠️ Faltou |
| `user_id` | String | `user_id` | ✅ OK |
| `product_id` | String | *(não mapeado)* | ⚠️ Faltou |
| `permission` | String | *(não existe)* | 🔴 Tech Lead mapeou `módulo`, `read`, `write` — **não existem no schema**. A permissão é uma String única (ex: `"org:read"`) |
| `granted_by` | String | *(não mapeado)* | ⚠️ Faltou |
| `created_at` | DateTime | *(não mapeado)* | ⚠️ Faltou |

**Conclusão:** A estrutura real usa `permission` como string única (ex: `"org:read"`, `"financeiro:write"`), não colunas `read/write` por módulo. O mapeamento do Tech Lead reflete a visão da UI, não o schema do banco.

---

### 2.2 `Subscription` — 🔴 DIVERGÊNCIA + DUPLICATA NO CSV

**Linha duplicada:** Tech Lead listou `Subscription` duas vezes (linhas 9 e 12 do CSV). São a mesma tabela.

| Campo no Código | Tipo | Tech Lead disse | Status |
|---|---|---|---|
| `id` | String CUID | *(não mapeado)* | ⚠️ Faltou |
| `tenant_id` | String | `tenant_id` | ✅ OK |
| `status` | SubscriptionStatus | `status` | ✅ OK |
| `stripe_subscription_id` | String? | *(não mapeado)* | ⚠️ Faltou — campo crítico |
| `stripe_price_id` | String? | *(não mapeado)* | ⚠️ Faltou — campo crítico |
| `trial_ends_at` | DateTime? | *(não mapeado)* | ⚠️ Faltou |
| `current_period_start` | DateTime? | *(não mapeado)* | ⚠️ Faltou |
| `current_period_end` | DateTime? | *(não mapeado)* | ⚠️ Faltou |
| `cancelled_at` | DateTime? | *(não mapeado)* | ⚠️ Faltou |
| *(não existe)* | — | `product_key` | 🚨 Fantasma — não existe no schema |
| *(não existe)* | — | `plano` | 🚨 Fantasma — não existe no schema |
| *(não existe)* | — | `datas` | 🚨 Fantasma — campo genérico sem correspondência |

**Conclusão:** `Subscription` é Stripe-centric. Não há `product_key` nem `plano` aqui. O Tech Lead confundiu com `ProductConfig`. A ativação de produtos específicos está em `ProductConfig` e `CompanyProduct`.

---

### 2.3 `TestSchedule` — 🔴 DIVERGÊNCIA ESTRUTURAL TOTAL

| Campo no Código | Tipo | Tech Lead disse | Status |
|---|---|---|---|
| `ativo` | Boolean | `is_active` | 🔴 Nome diferente |
| `frequencia` | String | *(não existe)* — Tech Lead mapeou `cron` | 🔴 Schema usa `frequencia` (ex: "Diário"), não expressão cron |
| `hora` | Int | *(não mapeado)* | ⚠️ Faltou |
| `minuto` | Int | *(não mapeado)* | ⚠️ Faltou |
| `tipos` | Json | *(não mapeado)* — Tech Lead mapeou `config.modulos` | 🔴 Estrutura diferente |
| `escopos` | String[] | *(não mapeado)* — Tech Lead mapeou `config.planos` | 🔴 Estrutura diferente |
| `ambiente` | String | `config.ambientes` | 🔴 No schema é String simples, não array |
| `alertas` | Json | `config.notificar` (Boolean) | 🔴 Schema usa Json complexo, não Boolean |
| `ultima_exec` | DateTime? | *(não mapeado)* | ⚠️ Faltou |
| `proxima_exec` | DateTime? | *(não mapeado)* | ⚠️ Faltou |
| *(não existe)* | — | `name` | 🚨 Fantasma — sem campo nome no schema |
| *(não existe)* | — | `cron` (expressão) | 🚨 Fantasma — schema usa `frequencia`+`hora`+`minuto` |

**Conclusão:** O mapeamento do Tech Lead e o schema real são estruturalmente incompatíveis. Requer reconciliação antes de documentar.

---

### 2.4 `TestPlan` — 🔴 DIVERGÊNCIA ESTRUTURAL TOTAL

| Campo no Código | Tipo | Tech Lead disse | Status |
|---|---|---|---|
| `versao` | String | *(não mapeado)* | ⚠️ Faltou |
| `tipo` | String | *(não mapeado)* | ⚠️ Faltou |
| `ambientes` | String[] | *(não mapeado)* | ⚠️ Faltou |
| `componente_path` | String | `componenteFilePath` | 🔴 Nome diferente |
| `spec_path` | String? | *(não mapeado)* | ⚠️ Faltou |
| `mapeamento_path` | String | *(não mapeado)* | ⚠️ Faltou |
| `cobertura_pct` | Int | `coberturaPercentual` | 🔴 Nome diferente |
| `passos_total` | Int | `passos` (Array) | 🔴 Schema guarda só o total (Int), não o array de passos |
| `resumo_executivo` | String | *(não mapeado)* | ⚠️ Faltou |
| `plano_completo` | Json | `passos` | 🔴 Passos ficam dentro de Json `plano_completo`, não em coluna separada |
| `status` | String | *(não mapeado)* | ⚠️ Faltou |
| *(não existe)* | — | `temDinheiro` | 🚨 Fantasma |
| *(não existe)* | — | `sublocal` separado | ⚠️ Existe no código (`sublocal` String) — ✅ OK |

---

### 2.5 `Tenant` — campos ausentes no mapeamento

| Campo no Código | Tipo | Tech Lead mapeou? | Status |
|---|---|---|---|
| `clerk_org_id` | String? @unique | Não | ⚠️ Faltou — ID de integração com Clerk |
| `stripe_customer_id` | String? @unique | Não | ⚠️ Faltou — ID de integração com Stripe |
| `tipo_empresa` | String? | Sim | ✅ OK |
| `updated_at` | DateTime | Não | ⚠️ Faltou — presente em todos os models |

---

### 2.6 `TaxaCambio` — campos ausentes e inconsistência de idioma

| Campo no Código | Tipo | Tech Lead disse | Status |
|---|---|---|---|
| `moeda` | String | `moeda` | ✅ OK |
| `compra` | Decimal | *(não mapeado)* | ⚠️ Faltou — taxa de compra |
| `venda` | Decimal | `valor` | 🔴 Schema tem `compra` E `venda` separados, não um único `valor` |
| `data_cotacao` | DateTime | `data de referência` | ✅ OK (conceito) |
| `hora_cotacao` | String? | *(não mapeado)* | ⚠️ Faltou |
| `boletim` | String | *(não mapeado)* | ⚠️ Faltou (ex: "Fechamento", "Abertura") |
| `fonte` | String | *(não mapeado)* | ⚠️ Faltou (ex: "BCB/PTAX") |
| `criado_em` | DateTime | *(não mapeado)* | ⚠️ Faltou — usa PT (`criado_em`) e não EN (`created_at`) |

---

### 2.7 `ProductConfig` — não mapeado pelo Tech Lead

| Campo no Código | Tipo | Descrição |
|---|---|---|
| `id` | String CUID | Chave primária |
| `tenant_id` | String | Tenant que ativou o produto |
| `product_key` | String | Slug do produto (ex: `"simula-custo"`) |
| `config` | Json | Configurações específicas do produto para este tenant |
| `is_active` | Boolean | Se o produto está ativo para este tenant |
| `created_at` | DateTime | Data de ativação |
| `updated_at` | DateTime | Última atualização |

**Sugestão de nome DDD:** `ativacao_produto_tenant`

---

## PARTE 3 — CÓDIGO FANTASMA (mapeado mas não existe)

| Item | Onde aparece no CSV | Realidade |
|---|---|---|
| `role_audit_log` | Linha 25 — mapeado como `historico` | **Não existe** no schema Prisma. Zero models com esse nome. Pode ser tabela raw SQL não migrada ou planejada mas não implementada |
| `product_key` em Subscription | Linha 9 — "tenant_id, product_key, plano, datas" | Não existe no model `Subscription`. Está em `ProductConfig` e `CompanyProduct` |
| `plano` em Subscription | Linha 9 | Não existe. O plano é via Stripe (`stripe_price_id`) |
| `name` em TestSchedule | Mapeamento original | Não existe no schema. TestSchedule não tem campo nome |
| Expressão `cron` em TestSchedule | Mapeamento original | Não existe. Schema usa `frequencia` + `hora` + `minuto` |
| `temDinheiro` em TestPlan | Mapeamento original | Não existe no schema |
| `módulo`, `read`, `write` em UserPermission | Mapeamento original | Não existem. Schema usa `permission` como String única |

---

## PARTE 4 — DECISÕES PENDENTES (aguardam aprovação humana)

| # | Questão | Opção A | Opção B |
|---|---|---|---|
| 1 | `PriceTier` — agrupar com Product? | Manter como entidade separada no dicionário com referência ao Product | Documentar como sub-entidade dentro de Product |
| 2 | `SpecialNegotiation` — agrupar com Product? | Manter separado | Sub-entidade de Product |
| 3 | `StripeEvent` — excluir do dicionário? | Excluir (tabela interna, nunca aparece na UI) | Manter com nota "interno — webhook Stripe" |
| 4 | `GravityAdminPermission` — agrupar com Usuário? | Agrupar | Manter separado (contexto diferente — admin Gravity vs usuário tenant) |
| 5 | `TestPlan` + `TestSchedule` — agrupar sob `Testes`? | Agrupar como sub-entidades | Manter separados |
| 6 | `role_audit_log` — criar a tabela ou remover do dicionário? | Remover do dicionário (não existe no código) | Criar migration para implementar |
| 7 | `TestSchedule.frequencia` vs `cron` — qual padrão adotar? | Manter `frequencia`+`hora`+`minuto` (atual) | Migrar para expressão cron padrão |
| 8 | `ProductConfig` — nomear como `ativacao_produto_tenant`? | Aceitar sugestão | Manter nome técnico `ProductConfig` |

---

## RESUMO EXECUTIVO

| Categoria | Quantidade |
|---|---|
| Tabelas com status ✅ OK | 11 |
| Tabelas com 🔴 Divergência estrutural | 3 (`UserPermission`, `Subscription`, `TestSchedule`, `TestPlan`) |
| Tabelas com ⚠️ Faltou Mapear | 3 (`ProductConfig`, `TestLog`, `TaxaCambio`) |
| Tabelas com 🚨 Código Fantasma | 1 (`role_audit_log`) |
| Tabelas com ℹ️ Pendente Decisão | 5 |
| Campos fantasma (mapeados, não existem) | 7 |
| Decisões pendentes para humano | 8 |

**Prioridade de ação recomendada:**
1. 🚨 Verificar se `role_audit_log` existe como raw SQL (fora do Prisma)
2. 🔴 Reconciliar `Subscription` — o Tech Lead confundiu com `ProductConfig`
3. 🔴 Reconciliar `TestSchedule` — estrutura real vs mapeamento são incompatíveis
4. ℹ️ Tomar as 8 decisões pendentes antes de fechar o dicionário
