# PLAN_BACKEND_Configurador — Plano de Batalha (Backend)

> **Diretório raiz:** `servicos-global/configurador/`
> **Schema Prisma:** `configurador/prisma/schema.prisma`
> **Fase:** 2 — Plano aprovado. Não executar sem Fase 3 iniciada.

---

## 1. ARQUIVOS PRISMA A ALTERAR

### `configurador/prisma/schema.prisma`
- Renomear 15 models (adicionar @@map + renomear model name)
- Executar merges (PriceTier, SpecialNegotiation, ProductConfig → produtos_gravity)
- Deletar StripeEvent
- Criar FaturaProdutosGravity, MetricasGemini
- Renomear campos dentro de cada model (ver PLAN_BANCO_Configurador)

---

## 2. SUBSTITUIÇÕES GLOBAIS — GREP PATTERNS

Execute em `servicos-global/configurador/` (e raiz do configurador):

### Model names (TypeScript)
| Padrão DE | Padrão PARA | Contexto |
|---|---|---|
| `prisma.tenant` | `prisma.organizacao` | queries Prisma |
| `prisma.company` | `prisma.workspace` | queries Prisma |
| `prisma.user` | `prisma.usuario` | queries Prisma |
| `prisma.userMembership` | `prisma.usuarioWorkspace` | queries Prisma |
| `prisma.userPermission` | `prisma.usuarioPermissao` | queries Prisma |
| `prisma.product` | `prisma.produtoGravity` | queries Prisma |
| `prisma.priceTier` | → inline em `produtoGravity` | após merge |
| `prisma.specialNegotiation` | → inline em `produtoGravity` | após merge |
| `prisma.productConfig` | → inline em `produtoGravity` | após merge |
| `prisma.subscription` | `prisma.assinaturaProdutoGravity` | queries Prisma |
| `prisma.companyProduct` | `prisma.produtoGravityWorkspace` | queries Prisma |
| `prisma.stripeEvent` | **DELETAR** toda referência | após delete |
| `prisma.deployLog` | `prisma.deploy` | queries Prisma |
| `prisma.testLog` | `prisma.testes` | queries Prisma |
| `prisma.testPlan` | → inline em `testes` | após merge |
| `prisma.testSchedule` | → inline em `testes` | após merge |
| `prisma.gravityAdminPermission` | → inline em `usuario` | após merge |
| `prisma.rateLimitMetric` | `prisma.requisicoes` | queries Prisma |
| `prisma.securityEvent` | `prisma.seguranca` | queries Prisma |
| `prisma.serviceHealth` | `prisma.servicos` | queries Prisma |
| `prisma.supplierTenantAccess` | `prisma.fornecedorOrganizacao` | queries Prisma |
| `prisma.taxaCambio` | `prisma.cambio` | queries Prisma |

### TypeScript types / interfaces
| Padrão DE | Padrão PARA |
|---|---|
| `Tenant` (type import) | `Organizacao` |
| `Company` (type import) | `Workspace` |
| `PriceTier` (type) | inline em `ProdutoGravity` |
| `SpecialNegotiation` (type) | inline em `ProdutoGravity` |
| `ProductConfig` (type) | inline em `ProdutoGravity` |
| `DeployLog` (type) | `Deploy` |
| `TestLog` (type) | `Testes` |

---

## 3. ROTAS A ATUALIZAR

### `servicos-global/configurador/server/routes/`

| Arquivo de rota | O que muda |
|---|---|
| `admin.ts` | Queries de `tenant` → `organizacao`, `company` → `workspace` |
| `organizations.ts` (ou equivalente) | Campos retornados: `name` → `nome_organizacao`, `slug` → `subdominio_organizacao` |
| `users.ts` | Campos: `name` → `nome_usuario`, `email` → `email_usuario`, `role` → `tipo_usuario` |
| `products.ts` | Queries `product` → `produtoGravity`, campos de PriceTier inline |
| `subscriptions.ts` | Queries `subscription` → `assinaturaProdutoGravity` |
| `deploy.ts` (ou `deployLog.ts`) | Queries `deployLog` → `deploy`, campo `area` → `area_deploy` |
| `security.ts` | Queries `securityEvent` → `seguranca` |
| `services.ts` | Queries `serviceHealth` → `servicos` |
| `rate-limit.ts` | Queries `rateLimitMetric` → `requisicoes` |
| `cambio.ts` (ou `taxaCambio.ts`) | Queries `taxaCambio` → `cambio` |
| `supplier.ts` | Queries `supplierTenantAccess` → `fornecedorOrganizacao` |

### `servicos-global/configurador/server/routes/admin.ts` (já modificado — conferir)
- Verificar referências a `tenant_id` que podem ter virado `id_organizacao_usuario`

---

## 4. MIDDLEWARE / AUTH A ATUALIZAR

| Arquivo | O que muda |
|---|---|
| `middleware/auth.ts` (ou equivalente) | Se usa `req.tenant` ou lê `Tenant` do DB, atualizar para `Organizacao` |
| `middleware/clerk.ts` | Se extrai dados do Clerk e salva em `Tenant`, atualizar field names |

---

## 5. TIPOS COMPARTILHADOS

| Arquivo | O que muda |
|---|---|
| `types/index.ts` (ou equivalente) | Interfaces `TenantType`, `CompanyType` → `OrganizacaoType`, `WorkspaceType` |
| `@gravity/tenant-resolver` SDK | Verificar se o SDK usa `tenant_id` internamente — não renomear esse campo no SDK |

---

## 6. NOVOS ENDPOINTS NECESSÁRIOS

| Endpoint | Descrição |
|---|---|
| `POST /api/v1/fatura-produtos-gravity` | Criar fatura de serviço Gravity |
| `GET /api/v1/fatura-produtos-gravity` | Listar faturas |
| `GET /api/v1/metricas-gemini` | Métricas de LLM de testes |
| `POST /api/v1/metricas-gemini` | Registrar métricas |

---

## 7. CAMPOS QUE NÃO MUDAM NO BACKEND (atenção)

- `tenant_id` nas queries do `@gravity/tenant-resolver` — **NÃO RENOMEAR** (é coluna interna do SDK)
- `id` primário dos models — não renomear o campo `id` em si, apenas adicionar `@map` no Prisma
- `clerk_id` / `clerk_user_id` — é referência externa, não muda

---

## 8. VALIDAÇÕES ZOD A ATUALIZAR

Toda rota usa schema Zod. Após renomear campos nos models, os Zod schemas precisam refletir os novos nomes:

```typescript
// ANTES
const createTenantSchema = z.object({
  name: z.string(),
  slug: z.string(),
})

// DEPOIS
const createOrganizacaoSchema = z.object({
  nome_organizacao: z.string(),
  subdominio_organizacao: z.string(),
})
```

Grep em `servicos-global/configurador/` por `z.object` para localizar todos os schemas afetados.

---

## 9. CHECKLIST FASE 3

```bash
# Após todas as substituições:
npx tsc --noEmit                          # zero erros TypeScript
grep -r "prisma\.tenant\b" servicos-global/configurador/        # deve retornar zero
grep -r "prisma\.company\b" servicos-global/configurador/       # deve retornar zero
grep -r "prisma\.user\b" servicos-global/configurador/          # deve retornar zero (exceto configurador-db)
grep -r "DeployLog" servicos-global/configurador/               # deve retornar zero
grep -r "StripeEvent" servicos-global/configurador/             # deve retornar zero
grep -r "PriceTier" servicos-global/configurador/               # deve retornar zero
grep -r "TestPlan" servicos-global/configurador/                # deve retornar zero
```
