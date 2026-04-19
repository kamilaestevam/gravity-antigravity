# `@gravity/tenant-resolver`

> **SDK obrigatório de isolamento Schema-per-Tenant da plataforma Gravity.**
> Esta é a **única** porta de entrada permitida ao banco de produtos.

**Versão:** `0.1.0` — **ESQUELETO**, não está pronto para uso em produção.
**Status:** estrutura, tipos e contratos públicos definidos. Lógica de negócio
(middleware, fetch ao Configurador, cache, transação) está como stub
`NOT_IMPLEMENTED`.

---

## Por que este pacote existe

Após a auditoria de pool leak de 2026-04-17, a plataforma migrou de
"tabela compartilhada com `WHERE tenant_id`" para **schema-per-tenant**:
1 tenant = 1 schema PostgreSQL exclusivo (`tenant_<uuid_sem_hifens>`) em cada
banco de produto.

A garantia de isolamento agora é **do PostgreSQL**, não da aplicação:
toda operação roda dentro de `$transaction` que começa com
`SET LOCAL search_path TO "<schema>", public`. O `COMMIT`/`ROLLBACK` reseta
o `search_path` automaticamente. PgBouncer roda em modo `transaction`.

Veja:
- [`ADR-001 — Schema-per-Tenant`](../../documentos-tecnicos/adr/ADR-001-schema-per-tenant.md)
- [`ADR-002 — Contrato do tenant-resolver`](../../documentos-tecnicos/adr/ADR-002-tenant-resolver-sdk.md)
- [`ADR-003 — Migração de dados legados`](../../documentos-tecnicos/adr/ADR-003-migracao-dados-legados.md)
- [`SPEC.md`](./SPEC.md)
- [`skills/arquitetura/tenant-isolation/SKILL.md`](../../skills/arquitetura/tenant-isolation/SKILL.md)

---

## API pública (estável a partir de v1.0.0)

```typescript
import {
  tenantResolver,
  withTenant,
  withTenantContext,
  AppError,
  type TenantContext,
  type ResolverConfig,
  type ProductKey,
  type PrismaTransactionClient,
} from '@gravity/tenant-resolver';
```

### Uso por request (Express)

```typescript
app.use(tenantResolver({
  productKey: 'pedido',
  configuradorBaseUrl: process.env.CONFIGURADOR_URL!,
  internalKey: process.env.INTERNAL_KEY!,
}));

app.get('/pedidos', async (req, res) => {
  const pedidos = await withTenant(req, async (db) => {
    return db.pedido.findMany();
  });
  res.json(pedidos);
});
```

### Uso em CRON / worker

```typescript
await withTenantContext(tenantId, async (ctx, db) => {
  return db.pedido.updateMany({ where: { status: 'PENDENTE' }, data: {...} });
});
```

---

## O que NÃO pode ser importado em produtos

A política do projeto (ADR-002 §6) **proíbe**, em qualquer arquivo de
produto ou serviço-tenant, os seguintes imports:

```typescript
// ❌ PROIBIDO — linter CI bloqueia o build
import { PrismaClient } from '@prisma/client';
import { _internalPrisma } from '@gravity/tenant-resolver/...'; // não existe
```

E também:
- `new PrismaClient(...)` em qualquer arquivo de produto.
- Acesso ao banco fora de um callback `withTenant(...)` ou `withTenantContext(...)`.
- Cache (`redis.set`, in-memory) sem prefixo `tenant:` ou `tenant:_global:`.
- `WHERE tenant_id = ?` em queries de produto (modelo antigo morto).
- PgBouncer em modo `session` para banco de produto.
- `SET search_path` (sem `LOCAL`) — vaza no pool.

A ESLint custom rule (`@gravity/eslint-config-tenant-safe`) e o teste E2E de
cross-tenant em CI bloqueiam violações.

---

## Estado atual (v0.1.0 — esqueleto)

| Módulo                  | Estado                                |
|-------------------------|---------------------------------------|
| `errors.ts`             | ✅ implementado (AppError completo)   |
| `schema-name.ts`        | ✅ implementado + testes verdes       |
| `types.ts`              | ✅ tipos públicos finais              |
| `index.ts`              | ✅ exports públicos finais            |
| `internal-prisma.ts`    | ✅ singleton instanciado (não exportado) |
| `middleware.ts`         | ⏳ stub `NOT_IMPLEMENTED`             |
| `with-tenant.ts`        | ⏳ stub `NOT_IMPLEMENTED`             |
| `configurador-client.ts`| ⏳ stub `NOT_IMPLEMENTED`             |
| `cache.ts`              | ⏳ stub `NOT_IMPLEMENTED`             |
| `event-bus-listener.ts` | ⏳ placeholder                        |
| `observability.ts`      | ⏳ stub `NOT_IMPLEMENTED`             |

---

## Comandos

```bash
npm install         # instala deps (raiz do pacote)
npm test            # roda vitest — schema-name passa, demais não têm testes ainda
npm run build       # tsup build (esm + dts)
npm run lint        # eslint
```

---

## Versionamento

- SemVer estrito.
- `0.x` — API instável, em desenvolvimento.
- `1.0.0` — API estável, congelada para breaking changes sem ADR novo.
- Produtos pinam versão exata (`"@gravity/tenant-resolver": "1.2.3"`) — sem `^` ou `~`.
