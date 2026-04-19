# `@gravity/tenant-resolver` — Especificação Técnica

**Versão:** 0.1.0 (spec inicial, pré-implementação)
**Status:** Em revisão pelo Líder Técnico
**Implementa:** ADR-001, ADR-002

---

## Estrutura do Pacote

```
packages/tenant-resolver/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── index.ts                  # exports públicos APENAS
│   ├── internal-prisma.ts        # PrismaClient interno (não exportado)
│   ├── middleware.ts             # tenantResolver()
│   ├── with-tenant.ts            # withTenant() + withTenantContext()
│   ├── configurador-client.ts    # GET /api/me + cache
│   ├── cache.ts                  # in-memory + invalidação
│   ├── event-bus-listener.ts     # consome TenantUpdated / UserDeletionRequested
│   ├── schema-name.ts            # cálculo + validação de schemaName
│   ├── errors.ts                 # AppError typed
│   ├── observability.ts          # spans OTel + métricas
│   └── types.ts                  # interfaces públicas
└── tests/
    ├── unit/
    ├── integration/
    └── tenant-isolation.e2e.test.ts
```

## Exports Públicos (`src/index.ts`)

```typescript
export { tenantResolver } from './middleware';
export { withTenant, withTenantContext } from './with-tenant';
export type {
  TenantContext,
  ResolverConfig,
  ProductKey,
  PrismaTransactionClient,
} from './types';
// NÃO exportar: PrismaClient, _internalPrisma, schema-name internals
```

## Tipos

```typescript
export type ProductKey =
  | 'pedido' | 'processo' | 'simula-custo'
  | 'bid-frete' | 'bid-cambio' | 'nf-importacao'
  | 'financeiro-comex' | 'conector-erp'
  | 'tenant-services';

export interface TenantContext {
  tenantId: string;
  schemaName: string;
  workspaceId?: string;
  userId: string;
  roles: string[];
  correlationId: string;
}

export interface ResolverConfig {
  productKey: ProductKey;
  configuradorBaseUrl: string;
  internalKey: string;
  cacheTtlMs?: number;
  databaseUrl?: string;
}

// PrismaTransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
export type PrismaTransactionClient = Prisma.TransactionClient;
```

## API: `tenantResolver(config)`

Middleware Express. Por request:

1. Lê `Authorization: Bearer <jwt>`.
2. Valida via `@clerk/backend.verifyToken()`.
3. Extrai `userId`.
4. Resolve tenant (cache hit ou `GET /api/me` no Configurador).
5. Valida tenant ativo (status `active`); senão → 403.
6. Calcula e valida `schemaName`.
7. Gera `correlationId` (ULID).
8. Anexa `req.tenant: TenantContext`.
9. Emite span OTel `tenant_resolver.resolve`.
10. Chama `next()`.

Erros:
- JWT inválido → 401
- Tenant não encontrado → 404
- Tenant inativo/suspenso → 403
- Configurador inalcançável e cache vazio → 503

## API: `withTenant(req, fn)`

```typescript
export async function withTenant<T>(
  req: Request,
  fn: (db: PrismaTransactionClient) => Promise<T>
): Promise<T> {
  const ctx = req.tenant;
  if (!ctx) throw new AppError('Tenant não resolvido', 500, 'TENANT_MISSING');

  return _internalPrisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL search_path TO "${ctx.schemaName}", public`
      );
      return fn(tx);
    },
    { timeout: 10_000, isolationLevel: 'ReadCommitted' }
  );
}
```

## API: `withTenantContext(tenantId, fn)`

Para CRON jobs e workers (sem `req`):

```typescript
export async function withTenantContext<T>(
  tenantId: string,
  fn: (ctx: TenantContext, db: PrismaTransactionClient) => Promise<T>
): Promise<T> {
  const ctx = await resolveTenantById(tenantId); // bate no Configurador
  return _internalPrisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SET LOCAL search_path TO "${ctx.schemaName}", public`
    );
    return fn(ctx, tx);
  }, { timeout: 30_000 });
}
```

## Validação de `schemaName`

```typescript
const SCHEMA_NAME_REGEX = /^tenant_[a-f0-9]{32}$/;

export function buildSchemaName(tenantId: string): string {
  const sanitized = tenantId.replace(/-/g, '').toLowerCase();
  const name = `tenant_${sanitized}`;
  if (!SCHEMA_NAME_REGEX.test(name)) {
    throw new AppError('Tenant ID inválido', 400, 'INVALID_TENANT_ID');
  }
  return name;
}
```

Defesa contra SQL injection: mesmo que `_internalPrisma.$executeRawUnsafe` seja usado, o nome do schema vem de `buildSchemaName`, que rejeita tudo fora do regex `^tenant_[a-f0-9]{32}$`.

## Cache

```typescript
class TenantCache {
  private store = new Map<string, { ctx: TenantContext; expiresAt: number }>();

  get(userId: string): TenantContext | null;
  set(userId: string, ctx: TenantContext): void;
  invalidateByTenant(tenantId: string): void;  // chamado pelo Event Bus
  invalidateByUser(userId: string): void;
  size(): number;                              // para métricas
}
```

- Chave: `byUserId:<userId>` ou `byTenantId:<tenantId>`.
- TTL configurável (default 60_000ms).
- Métrica: `tenant_resolver.cache_hit_ratio`.

## Event Bus Listener

Consome:
- `TenantUpdated` → `cache.invalidateByTenant(event.tenantId)`
- `UserDeletionRequested` → `cache.invalidateByUser(event.userId)` + emite eventos de cascata para serviços de domínio (LGPD)
- `TenantProvisioned` → no-op no resolver (worker separado cria o schema)

## Trava de Importação Direta de `@prisma/client`

`package.json` do produto consome:

```json
{
  "dependencies": {
    "@gravity/tenant-resolver": "1.0.0"
  }
}
```

E NÃO depende de `@prisma/client`. ESLint rule:

```typescript
// packages/eslint-config-tenant-safe/rules/no-direct-prisma.ts
{
  meta: { type: 'problem' },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (
          node.source.value === '@prisma/client' &&
          !context.getFilename().includes('packages/tenant-resolver/')
        ) {
          context.report({
            node,
            message: 'Use @gravity/tenant-resolver. Import direto de @prisma/client é proibido.',
          });
        }
      },
    };
  },
}
```

## Testes Obrigatórios

### Unit
- `buildSchemaName` rejeita IDs inválidos.
- Cache respeita TTL.
- Cache invalidação por evento funciona.

### Integration
- Middleware retorna 401/403/404/503 nos cenários certos.
- `withTenant` abre transação e aplica `SET LOCAL`.
- `COMMIT` / `ROLLBACK` reseta o `search_path` (verificado por `SHOW search_path` em conexão subsequente do pool).

### E2E `tenant-isolation.e2e.test.ts`
- Cria tenants A e B com schemas separados.
- Insere registros em cada schema.
- Faz request com JWT de A → tenta ler dados de B (via SQL crua bypassando o SDK) → espera **erro de schema não encontrado**.
- Simula crash no handler → verifica que conexão devolvida ao pool não tem `search_path` poluído.

### Stress Test
- 50.000 req/s simulando 1.000 tenants distintos → mede:
  - `cache_hit_ratio` deve estabilizar > 95%
  - p95 de `set_local_latency_ms` < 2ms
  - Zero erros de "search_path not found"

## Métricas Expostas (Prometheus)

```
tenant_resolver_resolve_duration_ms{quantile="0.95"} 4.2
tenant_resolver_cache_hits_total 142_891
tenant_resolver_cache_misses_total 1_240
tenant_resolver_configurador_errors_total 0
tenant_resolver_set_local_duration_ms{quantile="0.95"} 1.3
tenant_resolver_active_transactions 47
```

## Versionamento

- SemVer estrito.
- 0.x: API instável (em desenvolvimento).
- 1.0.0: API estável, congelada para breaking changes sem ADR novo.
- Produtos pinam versão exata.

## Roadmap pós-1.0

- v1.1: suporte a Redis distribuído para cache (atualmente in-memory por instância).
- v1.2: rate limiting integrado por tenant.
- v1.3: helpers de teste (`createTestTenant()`, `withMockTenant()`).
