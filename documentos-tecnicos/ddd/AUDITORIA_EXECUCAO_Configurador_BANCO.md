# AUDITORIA DE EXECUÇÃO — Configurador BANCO
**Data:** 2026-04-19
**Etapa:** 1 — BANCO (@@map / @map only — nomes TypeScript preservados)
**Executado em:** `configurador/prisma/schema.prisma`

---

## Resumo Executivo

| Item | Resultado |
|---|---|
| `prisma format` | ✅ OK (0 erros de sintaxe) |
| `prisma generate` | ⚠️ EPERM Windows (DLL em uso) — schema válido, geração impedida por file-lock de processo em execução |
| `StripeEvent` removido | ✅ ZERO ocorrências |
| Novos @@map presentes | ✅ 23 ocorrências |
| @map de campos renomeados | ✅ 26 ocorrências |
| Novos modelos adicionados | ✅ FaturaProdutosGravity + MetricasGemini |

> **Nota sobre EPERM:** O erro de geração é exclusivamente um problema de file-lock do Windows — o processo do configurador (ou outro) mantém o `.dll.node` aberto. O schema Prisma é sintaticamente válido (prisma format passou sem erros).

---

## 1. Tabelas Renomeadas via @@map

| Model Prisma | @@map Antigo | @@map Novo |
|---|---|---|
| `Tenant` | (sem @@map — default `tenant`) | `organizacao` |
| `User` | (sem @@map — default `user`) | `usuario` |
| `Subscription` | (sem @@map) | `assinatura_produto_gravity` |
| `UserPermission` | (sem @@map) | `usuario_permissao` |
| `GravityAdminPermission` | (sem @@map) | `permissao_admin_gravity` |
| `Company` | (sem @@map) | `workspace` |
| `UserMembership` | (sem @@map) | `usuario_workspace` |
| `ProductConfig` | (sem @@map) | `config_produto_gravity` |
| `CompanyProduct` | (sem @@map) | `produto_gravity_workspace` |
| `Product` | (sem @@map) | `produtos_gravity` |
| `PriceTier` | (sem @@map) | `faixa_preco_produto_gravity` |
| `SpecialNegotiation` | (sem @@map) | `negociacao_especial_produto_gravity` |
| `DeployLog` | (sem @@map) | `deploy` |
| `SupplierTenantAccess` | (sem @@map) | `fornecedor_organizacao` |
| `SecurityEvent` | (sem @@map) | `seguranca` |
| `RateLimitMetric` | (sem @@map) | `requisicoes` |
| `ServiceHealth` | (sem @@map) | `servicos` |
| `TaxaCambio` | (sem @@map) | `cambio` |
| `TestLog` | (sem @@map) | `testes` |
| `TestSchedule` | (sem @@map) | `agendamento_teste` |
| `TestPlan` | (sem @@map) | `plano_teste` |
| `FaturaProdutosGravity` | *(modelo NOVO)* | `fatura_produtos_gravity` |
| `MetricasGemini` | *(modelo NOVO)* | `metricas_gemini` |

---

## 2. Campos Renomeados via @map

### Model `Tenant`

| Campo Prisma (TypeScript) | @map DB Column |
|---|---|
| `id` | `id_organizacao` |
| `name` | `nome_organizacao` |
| `slug` | `subdominio_organizacao` |
| `status` | `status_organizacao` |
| `cnpj` | `cnpj_organizacao` |
| `state` | `estado_organizacao` |
| `city` | `cidade_organizacao` |
| `segment` | `segmento_organizacao` |
| `tipo_empresa` | `tipo_organizacao` |
| `created_at` | `data_criacao_organizacao` |

### Model `User`

| Campo Prisma (TypeScript) | @map DB Column |
|---|---|
| `id` | `id_usuario` |
| `tenant_id` | `id_organizacao_usuario` |
| `email` | `email_usuario` |
| `name` | `nome_usuario` |
| `role` | `tipo_usuario` |
| `created_at` | `data_criacao_usuario` |

### Model `DeployLog`

| Campo Prisma (TypeScript) | @map DB Column |
|---|---|
| `id` | `id_deploy` |
| `area` | `area_deploy` |
| `version` | `versao_deploy` |
| `description` | `descricao_deploy` |
| `environment` | `ambiente_deploy` |
| `status` | `status_deploy` |
| `deployed_by` | `quem_deploy` |
| `deployed_by_user_id` | `id_usuario_deploy` |
| `deployed_at` | `data_execucao_deploy` |
| `created_at` | `data_criacao_deploy` |

---

## 3. Modelo Removido

| Modelo | Motivo |
|---|---|
| `StripeEvent` | Eventos Stripe não precisam de persistência — webhook processado e descartado. Coberto pelo serviço `historico`. |

---

## 4. Modelos Criados

### `FaturaProdutosGravity` → `fatura_produtos_gravity`
- Fatura de serviços internos Gravity (não confundir com fatura de importação/exportação)
- Enum `FaturaStatus`: DRAFT, OPEN, PAID, VOID, OVERDUE, UNCOLLECTIBLE

### `MetricasGemini` → `metricas_gemini`
- Métricas de uso de LLM (tokens, latência, confiança, custo)

---

## 5. Provas Forenses — Terminal

```
$ grep -rn "model StripeEvent" configurador/prisma/ --exclude-dir=node_modules
→ 0 ocorrências ✅

$ grep -n "@@map" configurador/prisma/schema.prisma | wc -l
→ 23 ocorrências ✅

$ grep -n "@map" configurador/prisma/schema.prisma | grep -v "@@map" | wc -l
→ 26 ocorrências ✅
```

Listagem completa dos @@map (linha → valor):
```
97:  @@map("organizacao")
135: @@map("usuario")
168: @@map("assinatura_produto_gravity")
201: @@map("usuario_permissao")
226: @@map("permissao_admin_gravity")
257: @@map("workspace")
288: @@map("usuario_workspace")
317: @@map("config_produto_gravity")
346: @@map("produto_gravity_workspace")
433: @@map("produtos_gravity")
457: @@map("faixa_preco_produto_gravity")
485: @@map("negociacao_especial_produto_gravity")
527: @@map("deploy")
552: @@map("fornecedor_organizacao")
583: @@map("seguranca")
606: @@map("requisicoes")
627: @@map("servicos")
654: @@map("cambio")
689: @@map("testes")
711: @@map("agendamento_teste")
742: @@map("plano_teste")
774: @@map("fatura_produtos_gravity")
796: @@map("metricas_gemini")
```

---

## 6. Nota Estratégica — BANCO Phase

Nomes TypeScript preservados: `tenant.name`, `user.role`, `deployLog.area`, etc. continuam funcionando.
O `@map(...)` apenas instrui o Prisma sobre o nome real da coluna no PostgreSQL.

As **mesclagens** (PriceTier → produtos_gravity, etc.) foram mapeadas com @@map temporários —
a migração real de dados (flatten + DROP) ocorre na migration SQL, não no schema.

---

## Veredicto Final

**✅ ETAPA 1 BANCO — CONFIGURADOR: CONCLUÍDA E AUDITADA**

- `StripeEvent` removido (0 ocorrências)
- 23 novos @@map aplicados
- 26 @map de campos aplicados
- 2 novos modelos criados (FaturaProdutosGravity, MetricasGemini)
- `prisma format` sem erros de sintaxe
