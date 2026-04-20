---
name: antigravity-lint-tenant-safety
description: "Use esta skill para entender, configurar ou estender o linter custom de tenant-safety que roda no CI e bloqueia deploy. Define as regras AST que detectam violações pós-pivô Schema-per-Tenant: PrismaClient direto, SET search_path manual, cache sem prefixo de tenant, identidade vinda do Clerk metadata. Criada na Sprint 1 (2026-04-18)."
---

# Gravity — Linter Custom de Tenant-Safety

> **Skill nova — Sprint 1 (2026-04-18).**
> Implementa a decisão do Pivô Arquitetural de 2026-04-17 (schema-per-tenant e Configurador como hub central). Sem ele, o SDK é apenas convenção. Com ele, é estrutural.

---

## Por Que Este Linter Existe

O SDK `@gravity/tenant-resolver` só protege os agentes **se ninguém puder ignorá-lo**. Sem o linter, basta um `import { PrismaClient } from '@prisma/client'` para pular toda a defesa de isolamento, e ninguém vê no review.

O linter:
1. **Falha o build no CI** se detectar uma das violações listadas abaixo
2. **Falha localmente** via pre-commit hook (Husky) — feedback imediato
3. **Não pode ser desativado** com `// eslint-disable` em produto/serviço-tenant — apenas dentro do SDK

> Sem CI verde nesta regra → **deploy é bloqueado**. Não há override. Override exige PR para o linter, aprovado pelo Coordenador + Líder.

---

## Onde o Linter Roda

| Localização | Comportamento |
|:---|:---|
| `produtos/*/server/**` | **Estrito** — todas as regras ativas, override proibido |
| `servicos-global/tenant/**/server/**` | **Estrito** — idem |
| `servicos-global/configurador/**` | **Relaxado** — Configurador pode usar PrismaClient direto (single-schema) |
| `packages/tenant-resolver/**` | **Desligado** — é o SDK que precisa usar PrismaClient |
| `scripts/**` | **Avisos** — scripts de operação podem precisar acesso direto, mas alertam |
| `testes/**` | **Avisos** — testes podem mockar, mas alertam |

---

## As 6 Regras

### Regra 1 — `no-direct-prisma-import`

Bloqueia qualquer `import` de `@prisma/client` que não venha do SDK.

```typescript
// ❌ ERRO — bloqueia deploy
import { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'

// ✅ OK — tipos do Prisma podem vir via SDK re-export
import type { Prisma } from '@gravity/tenant-resolver'
```

**Implementação AST:**
```javascript
// .eslint-rules/no-direct-prisma-import.js
module.exports = {
  meta: { type: 'problem' },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value === '@prisma/client') {
          context.report({
            node,
            message: 'Importar @prisma/client direto é proibido. Use @gravity/tenant-resolver.',
          })
        }
      },
    }
  },
}
```

---

### Regra 2 — `no-prisma-client-instantiation`

Bloqueia `new PrismaClient(...)` em qualquer lugar.

```typescript
// ❌ ERRO
const prisma = new PrismaClient()

// ✅ OK — usar withTenant
const faturas = await withTenant(req, db => db.fatura.findMany())
```

**Implementação:**
```javascript
NewExpression(node) {
  if (node.callee.name === 'PrismaClient') {
    context.report({ node, message: 'new PrismaClient() é proibido. Use withTenant/withTenantContext.' })
  }
}
```

---

### Regra 3 — `no-manual-search-path`

Bloqueia `SET search_path` em qualquer string SQL **exceto** dentro do SDK ou com `LOCAL` em template literal de migration.

```typescript
// ❌ ERRO — vaza para a próxima request da pool
await db.$executeRawUnsafe(`SET search_path TO tenant_xxx`)

// ❌ ERRO — sem LOCAL
await db.$executeRaw`SET search_path TO tenant_xxx`

// ✅ OK — dentro do SDK (with-tenant.ts) com LOCAL
await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
```

**Implementação:** scaneia `Literal` e `TemplateLiteral` por regex `/\bSET\s+search_path\b/i` e checa se contém `LOCAL`.

---

### Regra 4 — `cache-key-must-have-tenant-prefix`

Toda chamada a `redis.set/get/del/expire` deve ter chave prefixada por `tenant:` ou `tenant:_global:`.

```typescript
// ❌ ERRO
await redis.set(`produtos:${id}`, payload)
await redis.get('config:dashboard')

// ✅ OK
await redis.set(`tenant:${tenantId}:produtos:${id}`, payload)
await redis.get(`tenant:_global:ncm:8471.30`)        // global exige justificativa em comment

// ✅ OK — usando o helper do SDK
const cache = tenantCache(req.tenant)
await cache.set(`produtos:${id}`, payload)            // helper prefixa automaticamente
```

**Implementação:** detecta `CallExpression` em `redis.{set,get,del,mget,mset,expire,exists}` e checa se primeiro argumento começa com `tenant:` (string literal ou template literal).

> **Helper preferido:** sempre que possível, usar `tenantCache(req.tenant)` — evita escrever o prefixo na mão.

---

### Regra 5 — `no-clerk-metadata-tenant`

Bloqueia ler identidade de tenant a partir do `publicMetadata`/`privateMetadata` do Clerk.

```typescript
// ❌ ERRO — Clerk metadata é gerenciado fora da Gravity
const tenantId = req.auth.sessionClaims.publicMetadata.tenantId

// ❌ ERRO
const tenantId = user.publicMetadata.tenantId

// ✅ OK — vem do Configurador via SDK
const tenantId = req.tenant.id
```

**Implementação:** detecta `MemberExpression` com path `*.publicMetadata.tenant*` ou `*.privateMetadata.tenant*`.

---

### Regra 6 — `no-tenant-id-in-product-query`

Em código sob `produtos/*/server/`, bloqueia `WHERE tenant_id = ...` em queries Prisma — o schema **é** o tenant após migração completa (Pivô 2026-04-17).

```typescript
// ❌ ERRO em produto (após Fase 4)
await db.fatura.findMany({ where: { tenant_id: req.tenant.id } })

// ✅ OK em produto — schema isola
await db.fatura.findMany()

// ✅ OK em Configurador — single-schema, precisa de tenant_id
await prisma.tenant.findUnique({ where: { id: tenantId } })
```

**Implementação:** detecta `Property` com `key.name === 'tenant_id'` dentro de objetos passados para métodos Prisma (`findMany`, `findFirst`, `findUnique`, `create`, `update`, `delete`, `count`, `aggregate`, `groupBy`, `where:`).

> **Janela transitória (dual-write em andamento):** regra desativada via flag `LINT_DUAL_WRITE=true` enquanto dual-write está ativo. Após migração completa (Pivô 2026-04-17), flag removida e regra fica permanente.

---

## Estrutura do Pacote do Linter

```text
packages/eslint-plugin-tenant-safety/
├── package.json
├── README.md
├── src/
│   ├── index.ts                          ← exports do plugin
│   ├── rules/
│   │   ├── no-direct-prisma-import.ts
│   │   ├── no-prisma-client-instantiation.ts
│   │   ├── no-manual-search-path.ts
│   │   ├── cache-key-must-have-tenant-prefix.ts
│   │   ├── no-clerk-metadata-tenant.ts
│   │   └── no-tenant-id-in-product-query.ts
│   ├── configs/
│   │   ├── strict.ts                     ← preset "strict" (produto/tenant)
│   │   ├── relaxed.ts                    ← preset "relaxed" (Configurador)
│   │   └── warnings-only.ts              ← preset "warnings" (scripts/testes)
│   └── utils/ast-helpers.ts
└── tests/
    └── rules/
        ├── no-direct-prisma-import.test.ts
        └── ... (1 teste por regra, com fixtures pass/fail)
```

---

## Configuração no Repo

### `.eslintrc.cjs` raiz

```javascript
module.exports = {
  plugins: ['@gravity/tenant-safety'],
  overrides: [
    {
      files: ['produtos/*/server/**/*.ts', 'servicos-global/tenant/**/server/**/*.ts'],
      extends: ['plugin:@gravity/tenant-safety/strict'],
    },
    {
      files: ['servicos-global/configurador/**/*.ts'],
      extends: ['plugin:@gravity/tenant-safety/relaxed'],
    },
    {
      files: ['scripts/**/*.ts', 'testes/**/*.ts'],
      extends: ['plugin:@gravity/tenant-safety/warnings-only'],
    },
    {
      files: ['packages/tenant-resolver/**/*.ts'],
      rules: {
        '@gravity/tenant-safety/no-direct-prisma-import': 'off',
        '@gravity/tenant-safety/no-prisma-client-instantiation': 'off',
      },
    },
  ],
}
```

### Pre-commit hook (`.husky/pre-commit`)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.ts": "eslint --max-warnings 0"
  }
}
```

### CI (`.github/workflows/ci.yml`)

```yaml
- name: Lint Tenant Safety
  run: npx eslint --max-warnings 0 'produtos/**/server/**/*.ts' 'servicos-global/tenant/**/server/**/*.ts'
```

> `--max-warnings 0` garante que **warning vira erro no CI**. Localmente, devs veem warning; CI bloqueia.

---

## O Que Fazer Quando o Linter Falha

### Cenário 1 — Você está escrevendo código de produto

```
error  Importar @prisma/client direto é proibido. Use @gravity/tenant-resolver.
       @gravity/tenant-safety/no-direct-prisma-import
```

**Ação:** trocar pelo SDK. Não desabilite a regra.

### Cenário 2 — Você precisa de um caso legítimo não coberto

Ex: script de migração one-off que precisa rodar como superuser sem search_path.

**Ação:**
1. Abra PR no `packages/eslint-plugin-tenant-safety` propondo nova exceção via configuração
2. Aprovação requer Coordenador + Líder + revisão de segurança
3. Nunca: `// eslint-disable-next-line` em código de produto/serviço

### Cenário 3 — Falso positivo

**Ação:** adicione fixture failing no teste da regra (`packages/eslint-plugin-tenant-safety/tests/`) e abra PR. Coordenador valida e ajusta a AST query.

---

## Métricas de Saúde do Linter

Coordenador acompanha mensalmente:

- [ ] Quantas vezes o linter bloqueou um PR no último mês? (esperado: > 0 — significa que está ativo)
- [ ] Quantos `eslint-disable` existem no codebase? (esperado: 0 fora do SDK)
- [ ] Quantas exceções configuradas existem? (cada uma deve ter justificativa em comment + ADR)

> Se o linter nunca bloqueia, ou está desabilitado em massa, **a defesa não existe**. É equivalente a ter o SDK e ninguém usar.

---

## Roadmap Pós-Sprint 1

| Sprint | Adição |
|:---|:---|
| S2 | Regra 7 — `no-cross-product-import` (produto A não importa código do produto B) |
| S2 | Regra 8 — `internal-key-required-on-fetch` (toda chamada inter-serviço com `x-internal-key`) |
| S3 | Regra 9 — `no-bypass-rls-roles` (BYPASSRLS no Postgres do Configurador exige justificativa) |
| S3 | Regra 10 — `s3-presigned-ttl-max-300` (URLs S3 pré-assinadas com TTL ≤ 300s) |

---

## Checklist — Antes de Mergear Mudança no Linter

- [ ] Toda regra nova tem teste com fixtures pass + fail?
- [ ] Toda regra tem mensagem de erro acionável (diz o que fazer pra corrigir)?
- [ ] Documentação atualizada nesta skill?
- [ ] CI testado com PR de exemplo (regra deve falhar como esperado)?
- [ ] Coordenador + Líder aprovaram?
