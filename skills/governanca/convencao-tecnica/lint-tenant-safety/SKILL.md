---
name: antigravity-lint-tenant-safety
description: "Use esta skill para entender, configurar ou estender o linter custom de isolamento que roda no CI e bloqueia deploy. Define as regras AST que detectam violações de Schema-per-Organizacao: PrismaClient direto, SET search_path manual, cache sem prefixo de organizacao, identidade vinda do Clerk metadata (Mandamento 01). Criada na Sprint 1 (2026-04-18)."
---

# Gravity — Linter Custom de Isolamento de Organizacao

> ## ⚠️ STATUS: ESPECIFICAÇÃO / NÃO IMPLEMENTADO (2026-05-12)
>
> Esta skill **documenta** as regras planejadas para o plugin
> `@gravity/eslint-plugin-tenant-safety`, mas o **pacote ainda não existe** no
> monorepo (`packages/eslint-plugin-tenant-safety/` está ausente). Nenhuma
> das 6 regras roda no CI atualmente.
>
> **Implicações práticas:**
> - Anti-padrões listados abaixo (PrismaClient direto, filtro de organizacao
>   ausente, `id_organizacao` incorreta em queries cross-org, etc.) **não são
>   bloqueados em CI nem em pre-commit**.
> - Defesa atual é apenas **revisão humana** e testes funcionais.
> - Auditoria 2026-05-12 (Coordenador + Líder Técnico) confirmou que o
>   anti-padrão `id_organizacao: req.auth.id_organizacao` em rotas
>   cross-org foi reintroduzido em `admin.ts` sem detecção automática
>   (bug P0 do convite admin cross-org, corrigido manualmente).
>
> **Roadmap:** implementar o plugin quando houver capacidade. Esta skill
> serve como **especificação congelada** das 6 regras a implementar,
> evitando bikeshedding no momento da execução.
>
> ---

> Esta skill implementa a estratégia de **Isolamento de Organizacao** (Schema-per-Organizacao) e o Mandamento 01 (Clerk APENAS para autenticação). Sem o linter, o SDK é apenas convenção. Com ele, é estrutural.
> O nome `tenant-safety` é mantido por compatibilidade técnica com o pacote `@gravity/eslint-plugin-tenant-safety` e configurações já mergeadas no CI (identificador externo congelado — DDD permite preservar nomes de package).

---

## Por Que Este Linter Existe

O SDK `@gravity/resolver-organizacao` só protege os agentes **se ninguém puder ignorá-lo**. Sem o linter, basta um `import { PrismaClient } from '@prisma/client'` para pular toda a defesa de isolamento, e ninguém vê no review.

O linter:
1. **Falha o build no CI** se detectar uma das violações listadas abaixo
2. **Falha localmente** via pre-commit hook (Husky) — feedback imediato
3. **Não pode ser desativado** com `// eslint-disable` em produto/serviço-organizacao — apenas dentro do SDK

> Sem CI verde nesta regra → **deploy é bloqueado**. Não há override. Override exige PR para o linter, aprovado pelo Coordenador + Líder.

---

## Onde o Linter Roda

| Localização | Comportamento |
|:---|:---|
| `produtos/*/server/**` | **Estrito** — todas as regras ativas, override proibido |
| `servicos-global/servicos-plataforma/**/server/**` | **Estrito** — idem (serviços por organizacao) |
| `servicos-global/configurador/**` | **Relaxado** — Configurador pode usar PrismaClient direto (single-schema) |
| `packages/resolver-organizacao/**` | **Desligado** — é o SDK que precisa usar PrismaClient |
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
import type { Prisma } from '@gravity/resolver-organizacao'
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
            message: 'Importar @prisma/client direto é proibido. Use @gravity/resolver-organizacao.',
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

// ✅ OK — usar withOrganizacao
const faturas = await withOrganizacao(req, db => db.fatura.findMany())
```

**Implementação:**
```javascript
NewExpression(node) {
  if (node.callee.name === 'PrismaClient') {
    context.report({ node, message: 'new PrismaClient() é proibido. Use withOrganizacao/withOrganizacaoContext.' })
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
await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${nomeSchema}", public`)
```

**Implementação:** scaneia `Literal` e `TemplateLiteral` por regex `/\bSET\s+search_path\b/i` e checa se contém `LOCAL`.

---

### Regra 4 — `cache-key-must-have-organizacao-prefix`

Toda chamada a `redis.set/get/del/expire` deve ter chave prefixada por `organizacao:` ou `organizacao:_global:`.

```typescript
// ❌ ERRO
await redis.set(`produtos:${id}`, payload)
await redis.get('config:dashboard')

// ✅ OK
await redis.set(`organizacao:${idOrganizacao}:produtos:${id}`, payload)
await redis.get(`organizacao:_global:ncm:8471.30`)        // global exige justificativa em comment

// ✅ OK — usando o helper do SDK
const cache = tenantCache(req.organizacao)
await cache.set(`produtos:${id}`, payload)            // helper prefixa automaticamente
```

**Implementação:** detecta `CallExpression` em `redis.{set,get,del,mget,mset,expire,exists}` e checa se primeiro argumento começa com `organizacao:` (string literal ou template literal).

> **Helper preferido:** sempre que possível, usar `tenantCache(req.organizacao)` — evita escrever o prefixo na mão.

---

### Regra 5 — `no-clerk-metadata-identity` (Mandamento 01)

Bloqueia ler identidade de organizacao **OU autorização** a partir do `publicMetadata`/`privateMetadata` do Clerk. Clerk APENAS para autenticação.

```typescript
// ❌ ERRO — Clerk metadata não é fonte de identidade nem de autorização
const idOrganizacao = req.auth.sessionClaims.publicMetadata.idOrganizacao
const tipoUsuario = req.auth.sessionClaims.publicMetadata.tipo_usuario
const role = (currentUser.publicMetadata?.role ?? null) as Role  // Mandamento 08 também

// ❌ ERRO
const idOrganizacao = user.publicMetadata.idOrganizacao

// ✅ OK — identidade da organizacao vem do JWT validado pelo SDK
const idOrganizacao = req.organizacao.idOrganizacao  // API real do SDK — manter

// ✅ OK — autorização vem do Prisma via /api/v1/me
const me = meResponseSchema.parse(await fetch('/api/v1/me').then(r => r.json()))
const tipoUsuario = me.usuario.tipo_usuario
```

**Implementação:** detecta `MemberExpression` com path `*.publicMetadata.*` ou `*.privateMetadata.*` em código de aplicação (não no SDK do Clerk).

---

### Regra 6 — `no-organizacao-id-in-product-query`

Em código sob `produtos/*/server/`, bloqueia `WHERE id_organizacao = ...` em queries Prisma — o schema **é** a organizacao.

```typescript
// ❌ ERRO em produto
await db.fatura.findMany({ where: { id_organizacao: req.organizacao.idOrganizacao } })

// ✅ OK em produto — schema isola
await db.fatura.findMany()

// ✅ OK em Configurador — single-schema, precisa de id_organizacao
await prisma.organizacao.findUnique({ where: { id: idOrganizacao } })
```

**Implementação:** detecta `Property` com `key.name === 'id_organizacao'` dentro de objetos passados para métodos Prisma (`findMany`, `findFirst`, `findUnique`, `create`, `update`, `delete`, `count`, `aggregate`, `groupBy`, `where:`).

> **Janela transitória (dual-write em andamento):** regra desativada via flag `LINT_DUAL_WRITE=true` enquanto dual-write está ativo. Após o cleanup, a flag é removida e a regra fica permanente.

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
│   │   ├── cache-key-must-have-organizacao-prefix.ts
│   │   ├── no-clerk-metadata-identity.ts
│   │   └── no-organizacao-id-in-product-query.ts
│   ├── configs/
│   │   ├── strict.ts                     ← preset "strict" (produto/organizacao)
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
      files: ['produtos/*/server/**/*.ts', 'servicos-global/servicos-plataforma/**/server/**/*.ts'],
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
      files: ['packages/resolver-organizacao/**/*.ts'],
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
- name: Lint Organizacao Safety
  run: npx eslint --max-warnings 0 'produtos/**/server/**/*.ts' 'servicos-global/servicos-plataforma/**/server/**/*.ts'
```

> `--max-warnings 0` garante que **warning vira erro no CI**. Localmente, devs veem warning; CI bloqueia.

---

## O Que Fazer Quando o Linter Falha

### Cenário 1 — Você está escrevendo código de produto ou serviço

```
error  Importar @prisma/client direto é proibido. Use @gravity/resolver-organizacao.
       @gravity/tenant-safety/no-direct-prisma-import
```

**Ação:** trocar pelo SDK. Não desabilite a regra.

### Cenário 2 — Você precisa de um caso legítimo não coberto

Ex: script de migração one-off que precisa rodar como superuser sem search_path.

**Ação:**
1. Abra PR no `packages/eslint-plugin-tenant-safety` propondo nova exceção via configuração
2. Aprovação requer Coordenador + Líder + revisão de segurança
3. Nunca: `// eslint-disable-next-line` em código de produto ou serviço por organizacao

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

## Roadmap (Pós-Sprint 2 - SDK v0.2)

| Sprint | Adição |
|:---|:---|
| S2 | Regra 7 — `no-cross-product-import` (produto A não importa código do produto B) |
| S2 | Regra 8 — `internal-key-required-on-fetch` (toda chamada inter-serviço com `x-chave-interna`) |
| S3 | Regra 9 — `no-bypass-rls-roles` (BYPASSRLS no Postgres do Configurador exige justificativa) |
| S3 | Regra 10 — `s3-presigned-ttl-max-300` (URLs S3 pré-assinadas com TTL ≤ 300s) |

---

## Checklist — Antes de Mergear Mudança no Linter

- [ ] Toda regra nova tem teste com fixtures pass + fail?
- [ ] Toda regra tem mensagem de erro acionável (diz o que fazer pra corrigir)?
- [ ] Documentação atualizada nesta skill?
- [ ] CI testado com PR de exemplo (regra deve falhar como esperado)?
- [ ] Coordenador + Líder aprovaram?

---

## Exceções permitidas — endpoints admin S2S sem `id_organizacao`

> **Regra geral**: toda query Prisma deve filtrar por `id_organizacao` (Mand. 04 + Isolamento de Organização).
> **Exceção**: rotas admin cross-organização podem omitir o filtro **somente** sob TODAS as quatro condições abaixo.

### Quando a exceção é autorizada

Endpoints localizados em `**/server/**/routes/admin-*.ts` (ou similar) podem fazer queries Prisma sem `id_organizacao` no `where` se:

1. **Auth S2S only** — protegido por `requireInternalKey` (ou equivalente). Não aceita JWT direto. Frontend NUNCA chama; chamada vem de outro serviço Gravity (proxy do Configurador).
2. **Audit log persistente em tabela** — `audit_log_admin` (model `AuditLogAdmin` no Configurador) recebe 1 registro por chamada com: `id_usuario`, `tipo_usuario`, `acao`, `recurso`, `filtros_json`, `qtd_resultados`, `ip_origem`, `correlation_id`. Logging em arquivo NÃO é suficiente — precisa ser query-able.
3. **Teto duro de paginação** — `por_pagina` clamped em servidor a no máximo 200. Sem cursor infinito sem teto.
4. **Comentário `LINT-EXCEPTION`** — no topo do arquivo, com link para esta seção. Sem o comentário, o linter (regra futura) bloqueia.

### Forma canônica do comentário

```ts
/**
 * GET /api/v1/admin/<recurso> — listagem CROSS-ORGANIZAÇÃO.
 *
 * LINT-EXCEPTION: admin endpoint, S2S only, audit logged. Ver
 * skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md
 * (seção "Exceções permitidas") — autorização condicionada a:
 *   (a) requireInternalKey (S2S only)
 *   (b) audit log persistente em audit_log_admin
 *   (c) teto duro por_pagina <= 200
 *   (d) só GET, sem body
 */
```

### Endpoints atualmente nessa exceção

| Serviço | Path | Proxy auth | Audit log |
|:---|:---|:---|:---|
| Cadastros (8031) | `/api/v1/admin/empresas` | Configurador (`requireAuth + requireGravityAdmin`) | `audit_log_admin` (acao: `admin.empresas.list`) |

Toda nova exceção deve ser adicionada a esta tabela **no mesmo PR** que adiciona o endpoint.
