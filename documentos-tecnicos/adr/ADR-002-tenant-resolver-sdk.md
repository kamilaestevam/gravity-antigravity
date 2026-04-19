# ADR-002 — `@gravity/tenant-resolver` (SDK de Isolamento)

**Status:** Accepted
**Data:** 2026-04-17 (revisado após auditoria de pool leak)
**Depende de:** ADR-001
**Bloqueia:** S2, S3, S4

---

## Contexto

ADR-001 trava Schema-per-Tenant. Para que o modelo seja seguro de fato, **toda** conexão ao banco de produto precisa passar pelo mesmo lugar — caso contrário, a primeira rota que abrir conexão fora do padrão reabre o vetor de vazamento.

O isolamento é feito por `SET LOCAL search_path` dentro de `$transaction` — garantia do Postgres, não da aplicação.

## Decisão

Criar o pacote interno `@gravity/tenant-resolver` em `packages/tenant-resolver/`, publicado no workspace npm do monorepo. **Nenhum produto importa `@prisma/client` diretamente.** A única importação permitida é o SDK.

### 1. Stack

- **ORM:** Prisma (mantido).
- **Pool:** PgBouncer em modo **`transaction`** para todos os bancos de produto.
- **Isolamento por request:** `withTenant(req, fn)` abre `$transaction` e injeta `SET LOCAL search_path`.
- **Cache de tenant:** in-memory por instância, TTL 60s, invalidação ativa por evento `TenantUpdated` no Event Bus.
- **Linguagem:** TypeScript estrito, ESM, build por `tsup`.

### 2. Contrato Público

```typescript
// packages/tenant-resolver/src/index.ts

export interface TenantContext {
  tenantId: string;
  schemaName: string;       // tenant_<uuid_sem_hifens>
  workspaceId?: string;
  userId: string;
  roles: string[];
  correlationId: string;
}

export interface ResolverConfig {
  productKey: ProductKey;   // 'pedido' | 'processo' | ...
  configuradorBaseUrl: string;
  internalKey: string;
  cacheTtlMs?: number;      // default 60_000
}

// Middleware Express — anexa req.tenant + req.runWithTenant
export function tenantResolver(config: ResolverConfig): RequestHandler;

// Wrapper OBRIGATÓRIO — única forma de tocar o banco
export function withTenant<T>(
  req: Request,
  fn: (db: PrismaTransactionClient) => Promise<T>
): Promise<T>;

// Para tarefas de background (CRON, workers)
export function withTenantContext<T>(
  tenantId: string,
  fn: (ctx: TenantContext, db: PrismaTransactionClient) => Promise<T>
): Promise<T>;
```

### 3. Implementação Interna do `withTenant`

```typescript
export async function withTenant<T>(
  req: Request,
  fn: (db: PrismaTransactionClient) => Promise<T>
): Promise<T> {
  const ctx = req.tenant; // injetado pelo middleware
  if (!ctx) throw new AppError('Tenant não resolvido', 500, 'TENANT_MISSING');

  return _internalPrisma.$transaction(async (tx) => {
    // SET LOCAL — Postgres reseta automaticamente no COMMIT/ROLLBACK
    await tx.$executeRawUnsafe(
      `SET LOCAL search_path TO "${ctx.schemaName}", public`
    );
    return fn(tx);
  }, {
    timeout: 10_000, // SLA de 200ms cobre 50× isso
    isolationLevel: 'ReadCommitted',
  });
}
```

**Por quê `$executeRawUnsafe`:** o nome do schema vem de `tenant.schemaName`, que é construído deterministicamente a partir do `tenantId` (UUID sanitizado), validado contra regex `^tenant_[a-f0-9]{32}$` no provisionamento. Não há injeção de SQL possível — mesmo assim, o validator do SDK rejeita qualquer schema fora do regex.

### 4. Encapsulamento do Prisma Cru

O `PrismaClient` é instanciado **dentro** do pacote como `_internalPrisma` e não é exportado:

```typescript
// packages/tenant-resolver/src/internal-prisma.ts
import { PrismaClient } from '@prisma/client';

// NÃO exportado no index.ts
export const _internalPrisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL! } },
});
```

```typescript
// packages/tenant-resolver/src/index.ts
// Sem `export { PrismaClient }`. Sem `export { _internalPrisma }`.
export { tenantResolver, withTenant, withTenantContext } from './...';
export type { TenantContext, ResolverConfig } from './...';
```

Tentar importar `@prisma/client` em qualquer produto → **erro de tipo em build** (ver §6).

### 5. Fluxo Por Request

1. Middleware lê JWT do `Authorization` → valida via `@clerk/backend`.
2. Extrai `userId`.
3. Cache lookup: `tenant:byUserId:<userId>` (TTL 60s).
4. Cache miss → `GET /api/me` no Configurador com `x-internal-key` → `{ tenantId, workspaceId, roles }`.
5. Calcula `schemaName = 'tenant_' + tenantId.replace(/-/g, '')`.
6. Valida `schemaName` contra regex `^tenant_[a-f0-9]{32}$`.
7. Anexa `req.tenant: TenantContext`.
8. Handler chama `withTenant(req, async (db) => { ... })`.
9. SDK abre `$transaction` → executa `SET LOCAL search_path` → roda handler.
10. `COMMIT`/`ROLLBACK` → Postgres reseta `search_path` automaticamente.

### 6. Guard-Rails de CI (proibição em build/lint)

Falha o deploy se detectar em `produto/*/server/` ou `servicos-global/tenant/*/server/`:

- `import { PrismaClient } from '@prisma/client'` fora de `packages/tenant-resolver/`
- `new PrismaClient(` em qualquer arquivo do produto
- `from '@prisma/client'` (qualquer import direto)
- Acesso ao banco fora de um callback `withTenant(...)` ou `withTenantContext(...)`
- Chave de cache (`redis.set`, `cache.set`, etc.) sem prefixo `tenant:` ou `tenant:_global:` (com justificativa)
- `SELECT`/`UPDATE`/`DELETE` em raw que mencione `WHERE tenant_id` (modelo antigo)

Implementação:
- ESLint custom rule em `@gravity/eslint-config-tenant-safe` (rodada em pre-commit + CI)
- Script `scripts/lint-tenant-isolation.ts` faz grep estático adicional
- Teste E2E em CI: tenta acessar dados do tenant B com JWT do tenant A → espera 404/403

Em runtime, exportações do pacote forçam erro de tipo:

```typescript
// Tenta:
import { PrismaClient } from '@prisma/client';
// → ESLint error: "Use @gravity/tenant-resolver, não @prisma/client diretamente"

// Tenta:
const data = await someExportedClient.pedido.findMany();
// → Type error: "Property 'pedido' does not exist on type 'never'"
```

### 7. Cache: Invalidação

- TTL passivo: 60s.
- Invalidação ativa: Configurador publica `TenantUpdated` / `UserDeletionRequested` no Event Bus → cada instância dropa as chaves afetadas.
- Chave de cache **sempre** prefixada por `tenant:`.
- Cache global (sem tenant) só permitido em `tenant:_global:*` com justificativa em comentário.

### 8. Endpoints Administrativos

Rotas `/admin/*` em qualquer produto exigem:
- JWT válido + role `SUPER_ADMIN` em `/api/me`.
- Header `x-target-tenant-id` explícito (não inferido do JWT).
- Validação dupla pelo SDK: usuário tem permissão **E** tenant alvo existe e está ativo.
- Log especial com `admin_action: true`, ingerido pela aba "Eventos de Segurança" (S6).

### 9. Observabilidade

Por request, o SDK emite:
- `tenant_resolver.cache_hit_ratio`
- `tenant_resolver.resolve_latency_ms` (p50, p95, p99)
- `tenant_resolver.set_local_latency_ms`
- `tenant_resolver.configurador_fallback_count`
- Log estruturado com `correlation_id`, `tenant_id`, `user_id`, `schema_name`, `route`

Spans OpenTelemetry alimentam o painel de Health & Latência e a aba "Eventos de Segurança".

## Consequências

- Toda rota de produto passa pelo mesmo middleware → padronização forçada.
- Novo produto **não compila** sem o SDK instalado e usado corretamente.
- Custo: ~3 sprints para refatorar 8 produtos existentes (S4).
- Configurador vira SPOF de identidade — mitigado por: cache local 60s + circuit breaker + degradação para cache stale por até 5min em modo "configurador down".
- SDK vira SPOF de código — mitigação: cobertura ≥ 95% no pacote, contract tests em todo produto consumidor.

## Versionamento

- SemVer estrito.
- Breaking change exige bump major + changelog + plano de migração.
- Produtos pinam versão exata (`"@gravity/tenant-resolver": "1.2.3"`) — sem `^` ou `~`.

## Alternativas Descartadas

- **Lib local em cada produto:** mata a padronização — qualquer drift volta o risco.
- **Sidecar (proxy de banco):** adiciona hop de rede em toda query → fere SLA de 200ms p95.
- **Kysely:** custo de migração proibitivo; Prisma cobre o caso com `SET LOCAL` em transação.
- **`session` mode + hook de limpeza:** pool leak window real (ver ADR-001).
