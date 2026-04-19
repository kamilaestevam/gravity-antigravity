# PLAN_BANCO_Configurador — Plano de Batalha (Banco)

> **Banco:** `gravity-configurador-producao` / `gravity-configurador-teste`
> **Schema Prisma:** `configurador/prisma/schema.prisma`
> **Fase:** 2 — Plano aprovado. Não executar sem Fase 3 iniciada.

---

## 1. RENOMEAR TABELAS (@@map)

| Model Prisma (DE) | Model Prisma (PARA) | @@map atual | @@map alvo |
|---|---|---|---|
| `Tenant` | `Organizacao` | (sem @@map → usa model name) | `organizacao` |
| `Company` | `Workspace` | (sem @@map) | `workspace` |
| `User` | `Usuario` | (sem @@map) | `usuario` |
| `UserMembership` | `UsuarioWorkspace` | (sem @@map) | `usuario_workspace` |
| `UserPermission` | `UsuarioPermissao` | (sem @@map) | `usuario_permissao` |
| `Product` | `ProdutoGravity` | (sem @@map) | `produtos_gravity` |
| `Subscription` | `AssinaturaProdutoGravity` | (sem @@map) | `assinatura_produto_gravity` |
| `CompanyProduct` | `ProdutoGravityWorkspace` | (sem @@map) | `produto_gravity_workspace` |
| `DeployLog` | `Deploy` | (sem @@map) | `deploy` |
| `TestLog` | `Testes` | (sem @@map) | `testes` |
| `RateLimitMetric` | `Requisicoes` | (sem @@map) | `requisicoes` |
| `SecurityEvent` | `Seguranca` | (sem @@map) | `seguranca` |
| `ServiceHealth` | `Servicos` | (sem @@map) | `servicos` |
| `SupplierTenantAccess` | `FornecedorOrganizacao` | (sem @@map) | `fornecedor_organizacao` |
| `TaxaCambio` | `Cambio` | (sem @@map) | `cambio` |

---

## 2. MESCLAR (merge — dados migram, tabela original some)

| Tabela (DE) | Absorvida por (PARA) | Estratégia |
|---|---|---|
| `PriceTier` | `produtos_gravity` | Flatten: campos de faixa de preço viram colunas JSON em `produtos_gravity` |
| `SpecialNegotiation` | `produtos_gravity` | Flatten: campos de negociação especial viram colunas em `produtos_gravity` |
| `ProductConfig` | `produtos_gravity` | Flatten: config vira colunas em `produtos_gravity` |
| `TestPlan` | `testes` | Flatten: campos de plano viram colunas em `testes` |
| `TestSchedule` | `testes` | Flatten: agendamento vira colunas em `testes` |
| `GravityAdminPermission` | `usuario` | Flatten: permissão admin vira coluna `is_gravity_admin` em `usuario` |

---

## 3. EXCLUIR

| Tabela | Motivo |
|---|---|
| `StripeEvent` | Eventos Stripe não precisam de persistência própria — webhook processado e descartado |
| `role_audit_log` | Não existe no schema. Removido do DDD — coberto pelo serviço `historico` |

---

## 4. CRIAR (novas tabelas)

### `fatura_produtos_gravity`
Fatura de emissão de serviços Gravity (não é fatura comercial de importação/exportação).

```prisma
model FaturaProdutosGravity {
  id                              String   @id @default(cuid())
  tenant_id                       String
  numero_fatura_servicos_gravity  String
  status_fatura_servicos_gravity  FaturaStatus @default(DRAFT)
  organizacao_fatura_servicos_gravity String
  email_organizacao_fatura_servicos_gravity String?
  valor_total_fatura_servicos_gravity Decimal @db.Decimal(18, 2)
  moeda_fatura_servicos_gravity   String   @default("brl")
  competencia_fatura_servicos_gravity String?
  data_fatura_servicos_gravity    DateTime @default(now())
  created_at                      DateTime @default(now())
  updated_at                      DateTime @updatedAt

  @@map("fatura_produtos_gravity")
  @@index([tenant_id])
  @@index([status_fatura_servicos_gravity])
}

enum FaturaStatus {
  DRAFT
  OPEN
  PAID
  VOID
  OVERDUE
  UNCOLLECTIBLE
}
```

### `metricas_gemini` (separada — dados de LLM/teste AI)

```prisma
model MetricasGemini {
  id                          String   @id @default(cuid())
  nome_llm                    String[]
  data_analise_llm            DateTime
  total_analise_llm           Int      @default(0)
  total_token_llm             Int      @default(0)
  custo_llm                   Decimal  @db.Decimal(10, 4)
  latencia_llm                Int      @default(0)
  confianca_alta_llm          Int      @default(0)
  confianca_media_llm         Int      @default(0)
  confianca_baixa_llm         Int      @default(0)
  quantidade_codigo_validado_llm Int   @default(0)
  created_at                  DateTime @default(now())

  @@map("metricas_gemini")
  @@index([data_analise_llm])
}
```

---

## 5. RENOMEAR CAMPOS (dentro dos models)

### `Tenant` → `Organizacao`

| Campo atual | Campo alvo | Tipo |
|---|---|---|
| `id` | `id_organizacao` (@map) | CUID |
| `name` | `nome_organizacao` | String |
| `cnpj` | `cnpj_organizacao` | String |
| `state` | `estado_organizacao` | String |
| `city` | `cidade_organizacao` | String |
| `segment` | `segmento_organizacao` | String |
| `tipo_empresa` (ou `type`) | `tipo_organizacao` | String |
| `slug` | `subdominio_organizacao` | String |
| `plan` | **EXCLUIR** (vai para `assinatura_produto_gravity`) | — |
| `status` | `status_organizacao` | Enum |
| `created_at` | `data_criacao_organizacao` | DateTime |

### `User` → `Usuario`

| Campo atual | Campo alvo | Tipo |
|---|---|---|
| `id` | `id_usuario` (@map) | CUID |
| `name` / `first_name`+`last_name` | `nome_usuario` | String |
| `email` | `email_usuario` | String |
| `role` | `tipo_usuario` | Enum |
| `is_active` | → `status_usuario` calculado | Boolean |
| `tenant_id` | `id_organizacao_usuario` | String |
| `created_at` | `data_criacao_usuario` | DateTime |

### `DeployLog` → `Deploy`

| Campo atual | Campo alvo | Tipo |
|---|---|---|
| `id` | `id_deploy` (@map) | CUID |
| `area` (ou `service`) | `area_deploy` | String |
| `version` | `versao_deploy` | String |
| `description` | `descricao_deploy` | String |
| `environment` | `ambiente_deploy` | Enum |
| `status` | `status_deploy` | Enum |
| `executed_at` | `data_execucao_deploy` | DateTime |
| `deployed_by` | `quem_deploy` | String |
| `user_id` | `id_usuario_deploy` | String |
| `created_at` | `data_criacao_deploy` | DateTime |

> ⚠️ Campos marcados precisam de verificação no schema real durante Fase 3 — alguns nomes inferidos do DDD.

---

## 6. TABELAS A RECEBER (de outros bancos)

| Tabela | Vem de | @@map alvo |
|---|---|---|
| `UserPreferences` (services) | `servicos-global/tenant/prisma` | `preferencia_workspace` |
| `Agenda` (services) | `servicos-global/tenant/prisma` | `agenda_usuario` |
| `Slot` (services) | `servicos-global/tenant/prisma` | `horario_disponivel` |
| `Reserva` (services) | `servicos-global/tenant/prisma` | `reserva_agenda` |
| `DisponibilidadeConfig` (services) | `servicos-global/tenant/prisma` | `config_disponibilidade_agenda` |
| `NcmItem` (services) | `servicos-global/tenant/prisma` | `ncm_item` |
| `NcmSyncLog` (services) | `servicos-global/tenant/prisma` | `ncm_log` |
| `NcmScheduleConfig` (services) | `servicos-global/tenant/prisma` | `ncm_agendamento` |
| `MapeamentoImport` (services) | `servicos-global/tenant/prisma` | `erp_mapa` |

---

## 7. ORDEM DE EXECUÇÃO

```
1. Backup manual do banco antes de qualquer migration
2. Criar enums novos (FaturaStatus)
3. Criar tabelas novas (fatura_produtos_gravity, metricas_gemini)
4. Renomear tabelas com @@map (sem perda de dados)
5. Renomear campos dentro das tabelas
6. Executar merges (flatten PriceTier, SpecialNegotiation, ProductConfig → produtos_gravity)
7. Excluir tabelas obsoletas (StripeEvent) após confirmar zero dependências
8. Receber tabelas dos outros bancos (após Plano Serviços executado)
9. Validar integridade referencial
10. Rodar tsc zero erros + grep zero legacy names
```

---

## 8. RISCOS

| Risco | Mitigação |
|---|---|
| Merges de PriceTier/SpecialNegotiation/ProductConfig são destrutivos | Migration com data copy antes do drop |
| `role` field do User pode ter enum values em uso | Mapear valores existentes antes de renomear |
| Clerk usa `tenant_id` internamente — verificar referências | grep `tenant_id` em toda a base do Configurador |
