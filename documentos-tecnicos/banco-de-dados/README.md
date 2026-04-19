# Governança de Banco de Dados — Gravity Platform

Este documento consolida a arquitetura, segurança e topologia dos bancos de dados.
Com o **pivô Schema-per-Tenant (2026-04-17)**, a plataforma opera com isolamento físico por tenant
via schemas PostgreSQL, gerenciado exclusivamente pelo SDK `@gravity/tenant-resolver`.

---

## Padrão de Acesso ao Banco (Obrigatório)

> **Padrão validado em produção — Sprint 1 / 2026-04-18**
> Lotes 1, 2 e 3 do produto `pedido` migrados com sucesso (rotas: behaviorTracking, init,
> casasDecimais, saldoFormula, lote, edicaoEmMassa, dashboardWidgets, kanbanPreferencias,
> dashboardData, dashboardPaineis, duplicarExcluir, colunasUsuario).

### ⛔ Padrões Legados — PROIBIDOS

```typescript
// ❌ req.prisma / (req as any).prisma — PROIBIDO
const db = req.prisma
const db = (req as any).prisma

// ❌ TenantRequest — PROIBIDO
import type { TenantRequest } from '../shared/types.js'
async (req: TenantRequest, res: Response) => { ... }

// ❌ tenantId / userId lidos de headers — PROIBIDO
const tenantId = req.headers['x-tenant-id'] as string

// ❌ PrismaClient direto — PROIBIDO (CI bloqueia)
import { PrismaClient } from '@prisma/client'
new PrismaClient()
```

### ✅ Padrão Obrigatório — `withTenant`

```typescript
import { Router, Request, Response, NextFunction } from 'express'
import { withTenant, type TenantContext } from '@gravity/tenant-resolver'

router.get('/minha-rota', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any           // cast necessário: TenantDatabase ≠ models do produto
      const ctx       = (req as unknown as { tenant: TenantContext }).tenant
      const tenantId  = ctx.tenantId
      const userId    = ctx.userId
      const userRoles = ctx.roles

      const resultado = await db.meuModel.findMany({
        where: { tenant_id: tenantId },
      })
      res.json({ data: resultado })
    })
  } catch (err) {
    next(err)
  }
})
```

### ✅ Padrão para Workers / CRONs (sem `req`)

```typescript
import { withTenantContext } from '@gravity/tenant-resolver'

await withTenantContext(tenantId, async (ctx, rawDb) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = rawDb as any
  await db.meuModel.updateMany({ data: { processado: true } })
})
```

### ✅ Padrão Fire-and-Forget (background após transação principal)

```typescript
// Capturar tenantId ANTES de withTenant
const tenantId = (req as unknown as { tenant: TenantContext }).tenant.tenantId

await withTenant(req, async (rawDb) => {
  // operação principal + res.json(...)
})

// Disparar APÓS a transação fechar:
setImmediate(() => {
  withTenantContext(tenantId, async (ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await executarBackground(rawDb as any, ctx.tenantId)
  }).catch(console.error)
})
```

### Notas técnicas

| Questão | Resposta |
|:---|:---|
| Por que `rawDb as any`? | `TenantDatabase` é o `@prisma/client` do SDK, sem os models do produto. Cast `as any` é o contorno correto. |
| Por que o duplo cast em `req.tenant`? | Module augmentation do SDK não propaga para o `express` local do produto (dois `node_modules`). |
| Por que `: any` em callbacks é proibido? | O hook de CI `check-deps.ts` bloqueia `: any` explícito. Remover a anotação — `any[]` já infere `any` no callback. |
| Referência completa | `skills/arquitetura/sdk-tenant-resolver/SKILL.md` |

---

## Topologia Live do Ecossistema (Railway)

O ecossistema Gravity roda em paridade total entre Staging e Produção.

### Nomes Oficiais dos Ambientes Railway

> Use **exatamente** estes nomes em scripts de manutenção, migrações e documentação.
> Os dois nomes canônicos de referência de ambiente são `gravity-servicos-teste` (staging) e `gravity-servicos-producao` (produção).
> Variações como `gravity-tenant-*`, `gravity-services-*` ou `gravity-serviços-*` são incorretas e causam falhas em scripts de automação.

| Produto/Serviço | Staging (`-teste`) | Produção (`-producao`) |
|:---|:---|:---|
| Configurador | `gravity-configurador-teste` | `gravity-configurador-producao` |
| Tenant Services | `gravity-servicos-teste` | `gravity-servicos-producao` |
| Pedido | `gravity-pedido-teste` | `gravity-pedido-producao` |
| Processo | `gravity-processo-teste` | `gravity-processo-producao` |
| SimulaCusto | `gravity-simula-custo-teste` | `gravity-simula-custo-producao` |

### Cluster Staging

- **Configurador DB:** `gondola.proxy.rlwy.net:57584` (Ambiente: `gravity-configurador-teste`)
- **Serviços DB:** `monorail.proxy.rlwy.net:45890` (Ambiente: `gravity-servicos-teste`)
- **Finalidade:** Testes de integração, regressão e validação de massa de dados Alpha/Beta.

### Cluster Produção

- **Configurador DB:** `gondola.proxy.rlwy.net:59644` (Ambiente: `gravity-configurador-producao`)
- **Serviços DB:** `monorail.proxy.rlwy.net:16383` (Ambiente: `gravity-servicos-producao`)
- **Finalidade:** Tráfego real de clientes e processamento oficial.

---

## Estrutura Interna — Schema-per-Tenant

```
gravity-pedido-producao (PostgreSQL)
  ├── public                              ← 100% VAZIO (nenhuma tabela aqui)
  ├── tenant_cmo4vtp3i0000m86ft8vt5vnu   ← empresa A
  │    ├── pedido
  │    ├── pedido_item
  │    └── _prisma_migrations
  └── tenant_cm...xyz                     ← empresa B
       ├── pedido
       ├── pedido_item
       └── _prisma_migrations
```

O `SET LOCAL search_path TO "tenant_<id>", public` é aplicado **dentro de `$transaction`** pelo SDK
— é uma garantia do PostgreSQL, não da aplicação.

---

## Padrão de Identidade — CUID (UUID Expressamente Proibido)

> **Mandato estabelecido em 2026-04-18. Aplica-se a todas as camadas: schema Prisma, código TypeScript, migrations SQL, URLs de API.**

### Regra

O Gravity usa **exclusivamente CUID** como padrão de ID em todos os contextos. O uso de UUID está **expressamente proibido**.

```prisma
// ✅ CORRETO — todo model usa @default(cuid())
model Pedido {
  id  String  @id @default(cuid())   // ex: cmo4vtp3i0000m86ft8vt5vnu (25 chars)
}

// ❌ PROIBIDO — nunca usar UUID
id  String  @id @default(uuid())
id  String  @id @default(dbgenerated("gen_random_uuid()"))
```

```typescript
// ❌ PROIBIDO — nunca gerar UUID em TypeScript
import { randomUUID } from 'crypto'
const id = randomUUID()   // ❌
const id = uuidv4()       // ❌
```

### Motivação

1. **Consistência** — `@default(cuid())` no schema Prisma é a única fonte geradora de IDs. SDK, Backend e Frontend referem sempre o mesmo formato.
2. **Nomes de schema PostgreSQL** — o identificador `tenant_<cuid>` não contém hífens, sendo compatível com identificadores PostgreSQL nativos. UUID com hífens quebra `SET search_path TO tenant_<uuid>`.
3. **Legibilidade** — CUIDs são compactos (25 chars) e monotonicamente ordenáveis pelo prefixo temporal, facilitando debug e logs.
4. **Colisões** — CUID incorpora fingerprint de máquina, reduzindo probabilidade de colisão em cenários distribuídos.

---

## Status dos GAPs de Infraestrutura (Hardening)

| GAP | Descrição | Status | Resolução |
|:---:|:---|:---:|:---|
| **GAP 1** | Paridade de Schema T/P | ✅ **Resolvido** | [deploy.yml](../../.github/workflows/deploy.yml) |
| **GAP 2** | Row-Level Security (RLS) | ✅ **Resolvido** | [apply-rls.sql](../../scripts/apply-rls.sql) |
| **GAP 3** | Roles Canônicas | ✅ **Resolvido** | Refatoração de Código e Schema |
| **GAP 4** | Variáveis de Ambiente | ✅ **Resolvido** | Padronização em todos os módulos |
| **GAP 5** | Isolamento de Drivers | ✅ **Resolvido** | Geração do Prisma em `/generated` |
| **GAP 6** | Schema-per-Tenant | ✅ **Resolvido** | SDK `@gravity/tenant-resolver` — ADR-001/002 |

---

## Comandos de Manutenção (Modo Admin)

```bash
# Aplicar migrations em todos os schemas de um tenant (sempre via orquestrador)
CONFIGURADOR_DATABASE_URL=<url_cfg> DATABASE_URL=<url_produto_teste> \
  npx tsx scripts/migrate-all-tenants.ts --product=pedido

# Reaplicar RLS após novas tabelas
npm run db:apply-rls

# Provisionar schemas para novos tenants
npx tsx scripts/migration/01-provision-schemas.ts
```

> **`prisma migrate dev` em banco de produto é PROIBIDO** — cria tabelas no schema `public`,
> violando a regra `public 100% vazio`.

---

**Última Atualização:** 18 de Abril de 2026
**Auditor Responsável:** Antigravity AI — pós-validação Schema-per-Tenant Sprint 1 + mandato CUID
