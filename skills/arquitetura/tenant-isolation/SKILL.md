---
name: antigravity-tenant-isolation
description: "Use esta skill sempre que uma tarefa envolver queries ao banco de dados, criação de models Prisma, configuração de middleware ou qualquer código que acesse dados de tenant em produtos. Define a regra mais importante do sistema após o pivô de 2026-04-17: Schema-per-Tenant + SDK obrigatório @gravity/tenant-resolver. Todo agente consulta esta skill antes de escrever qualquer acesso ao banco de produto."
---

# Gravity — Tenant Isolation (Schema-per-Tenant)

> **Esta skill foi reescrita em 2026-04-17 após o pivô arquitetural Risco Zero.**
> O modelo anterior (`WHERE tenant_id = ?` + RLS) foi descartado para os bancos de produto. Toda referência ao modelo antigo nesta skill é histórica.
> Decisão registrada no Pivô Arquitetural de 2026-04-17 (schema-per-tenant e Configurador como hub central). Os ADRs que documentavam esse pivô foram consolidados nesta skill e em `documentos-tecnicos/acessos-usuarios/incidentes-e-auditoria.md`.

---

## A Regra Mais Importante do Sistema

**Em todo banco de produto, cada tenant vive em seu próprio schema PostgreSQL exclusivo. Nenhum acesso ao banco acontece sem passar pelo SDK `@gravity/tenant-resolver`.**

Não é "boa prática" — é regra absoluta. A garantia de isolamento agora é **do PostgreSQL**, não da aplicação. Não há exceção. Não há "só desta vez".

---

## O Modelo: Schema-per-Tenant

| Banco | Modelo |
|---|---|
| `configurador` | single-schema `public` (fonte de verdade global de identidade) |
| `pedido`, `processo`, `simula-custo`, `bid-frete`, `bid-cambio`, `nf-importacao`, `financeiro-comex`, `conector-erp` | **schema-per-tenant**: 1 schema por tenant, nomeado `tenant_<cuid>` |
| `servicos-global/tenant` (email, dashboard, gabi, histórico, notificações, relatórios, whatsapp, cronometro) | **schema-per-tenant** |

---

## A Única Forma Permitida de Acessar o Banco

```typescript
import { withTenant } from '@gravity/tenant-resolver';

app.get('/pedidos', async (req, res) => {
  const pedidos = await withTenant(req, async (db) => {
    // db é o cliente Prisma DENTRO de $transaction com SET LOCAL search_path
    // Apontando para o schema do tenant. COMMIT/ROLLBACK reseta automaticamente.
    return db.pedido.findMany();
  });
  res.json(pedidos);
});
```

### Por dentro do `withTenant` (referência)

```typescript
return _internalPrisma.$transaction(async (tx) => {
  await tx.$executeRawUnsafe(
    `SET LOCAL search_path TO "${ctx.schemaName}", public`
  );
  return fn(tx);
}, { timeout: 10_000, isolationLevel: 'ReadCommitted' });
```

**Por que `SET LOCAL` dentro de `$transaction`?** Porque o Postgres reseta o `search_path` automaticamente no `COMMIT`/`ROLLBACK`. A garantia de limpeza está **no banco**, não na aplicação. Se o handler crashar, der OOM, der timeout — não importa. Não há pool leak window.

### Para CRON jobs e workers (sem `req`)

```typescript
import { withTenantContext } from '@gravity/tenant-resolver';

await withTenantContext(tenantId, async (ctx, db) => {
  return db.pedido.updateMany({ where: { status: 'PENDENTE' }, data: { ... } });
});
```

---

## O Que É Proibido

- ❌ `import { PrismaClient } from '@prisma/client'` em qualquer arquivo de produto (linter CI bloqueia)
- ❌ `new PrismaClient(...)` em qualquer produto
- ❌ Acesso ao banco fora de `withTenant(...)` ou `withTenantContext(...)`
- ❌ `WHERE tenant_id = ?` em queries de produto (modelo antigo morto)
- ❌ Coluna `tenant_id` em tabelas de produto após migração completa (Pivô 2026-04-17)
- ❌ Cache (`redis.set`, in-memory) sem prefixo `tenant:<id>:`
- ❌ PgBouncer em modo `session` para banco de produto (modo `transaction` é obrigatório)
- ❌ `SET search_path` (sem `LOCAL`) — vaza no pool
- ❌ Provisionar schema "on-demand" no primeiro request — corrida garantida

---

## O Que É Obrigatório

- ✅ Toda rota de produto chama `withTenant(req, async db => ...)`
- ✅ Toda tarefa de background chama `withTenantContext(tenantId, async (ctx, db) => ...)`
- ✅ Schema é provisionado pelo worker do evento `TenantProvisioned` (com DLQ + retry)
- ✅ Migrations rodam via `scripts/migrate-all-tenants.ts` (orquestrador — Pivô 2026-04-17)
- ✅ Cliente Prisma é instanciado só em `packages/tenant-resolver/src/internal-prisma.ts` e **não é exportado**
- ✅ Teste E2E de cross-tenant em todo produto (`tenant-isolation.e2e.test.ts`)
- ✅ Validação Zod em toda rota antes do `withTenant`
- ✅ Configurador é a fonte de identidade — frontend lê de `GET /api/me`, nunca do `publicMetadata` do Clerk

---

## Models Prisma — Padrão Pós-Pivô

Em bancos de produto:

```prisma
model Pedido {
  id        String @id @default(cuid())
  numero    String
  status    String
  // SEM campo tenant_id — o schema É o tenant
  // SEM @@index([tenant_id]) — desnecessário
  
  @@index([status])
  @@index([numero])
}
```

> Durante a janela de migração (dual-write), o `tenant_id` permanece em coluna. Após migração completa (Pivô 2026-04-17), a coluna é removida.

No Configurador (não muda):

```prisma
model Tenant {
  id          String @id @default(cuid())
  nome        String
  status      TenantStatus
  // Configurador É a fonte de tenants. Não tem tenant_id.
}
```

---

## Provisionamento de Novo Tenant

Disparado pelo evento `TenantProvisioned` emitido pelo Configurador:

1. Worker do produto consome o evento.
2. `CREATE SCHEMA "tenant_<cuid>"`.
3. `prisma migrate deploy --schema=tenant_<cuid>`.
4. Falha → DLQ com retry exponencial (1m, 5m, 15m, 1h).
5. 3 falhas → alerta crítico no painel + on-call.
6. Sem fallback síncrono: tentativa de login antes do schema → erro claro.

---

## Como Testar o Isolamento

```typescript
// produto/pedido/server/tests/tenant-isolation.e2e.test.ts
it('cross-tenant access deve falhar — schema do outro tenant não está no search_path', async () => {
  const tenantA = await createTestTenant();
  const tenantB = await createTestTenant();

  const pedidoB = await withTenantContext(tenantB.id, async (_, db) =>
    db.pedido.create({ data: { numero: 'B-001', status: 'NOVO' } })
  );

  // Request com JWT do tenant A tentando ler pedido do tenant B
  const result = await withTenantContext(tenantA.id, async (_, db) =>
    db.pedido.findUnique({ where: { id: pedidoB.id } })
  );

  expect(result).toBeNull(); // schema do A não enxerga tabela do B
});

it('crash do handler não polui search_path da próxima request', async () => {
  const tenantA = await createTestTenant();
  const tenantB = await createTestTenant();

  await expect(
    withTenantContext(tenantA.id, async (_, db) => {
      throw new Error('simulando crash');
    })
  ).rejects.toThrow();

  // Próxima request usa pool — search_path tem que estar limpo
  const result = await withTenantContext(tenantB.id, async (_, db) => {
    const [{ search_path }] = await db.$queryRaw<{ search_path: string }[]>`
      SHOW search_path
    `;
    return search_path;
  });

  expect(result).toContain(`tenant_${tenantB.id.replace(/-/g, '')}`);
  expect(result).not.toContain(`tenant_${tenantA.id.replace(/-/g, '')}`);
});
```

---

## Comunicação entre Produto e Configurador

O serviço de produto nunca acessa o banco do Configurador. Identidade vem via `GET /api/me`:

```typescript
// ✅ correto — via SDK, que cacheia GET /api/me
// O middleware tenantResolver já fez isso. req.tenant tem o que você precisa.
app.get('/algo', tenantResolver(config), async (req, res) => {
  const { roles } = req.tenant;
  if (!roles.includes('PEDIDO_WRITE')) throw new AppError('Sem permissão', 403);
  // ...
});

// ❌ proibido — acessar banco do Configurador diretamente
import { configuradorPrisma } from '../../configurador/server/prisma';
```

---

## Endpoints `/admin/*`

Rotas administrativas em qualquer produto exigem:
- JWT válido + role `SUPER_ADMIN` (vindo de `req.tenant.roles`)
- Header `x-target-tenant-id` explícito (não inferido do JWT do admin)
- Validação dupla pelo SDK: usuário tem permissão **E** tenant alvo existe e está ativo
- Log especial com `admin_action: true`, ingerido pela aba "Eventos de Segurança"

---

## Métricas de Monitoramento

O SDK emite (Prometheus):

```
tenant_resolver_resolve_duration_ms{quantile="0.95"}     # alvo < 5ms
tenant_resolver_set_local_duration_ms{quantile="0.95"}   # alvo < 2ms
tenant_resolver_cache_hit_ratio                           # alvo > 95%
tenant_resolver_configurador_errors_total                 # alvo 0
tenant_resolver_active_transactions                       # capacidade
```

CRON horário audita paridade `Configurador.tenants_ativos == bancos.schemas_existentes`. Divergência → alerta crítico na aba "Alertas (24h)".

---

## Checklist — Antes de Qualquer Acesso ao Banco de Produto

- [ ] Estou usando `withTenant(req, ...)` ou `withTenantContext(tenantId, ...)` — não há outra forma?
- [ ] O produto tem `@gravity/tenant-resolver` no `package.json` (e **não** `@prisma/client`)?
- [ ] Estou dentro do callback do SDK ao tocar o banco?
- [ ] O cache (se houver) está prefixado com `tenant:<id>:`?
- [ ] O teste de cross-tenant está implementado e passando?
- [ ] O teste de "crash não polui search_path" está implementado para esse produto?
- [ ] Schema novo (se aplicável) é criado pelo worker de `TenantProvisioned`?
- [ ] Migration nova roda via orquestrador `migrate-all-tenants.ts`?

---

## Histórico — Modelo Antigo (apenas referência durante migração)

Antes do pivô de 2026-04-17, o isolamento era feito por:
- Coluna `tenant_id String` obrigatória em todo model.
- `WHERE tenant_id = ?` injetado por middleware Prisma (`$extends`).
- RLS PostgreSQL como segunda camada (`USING (tenant_id = current_setting('app.current_tenant_id')::uuid)`).

Esse modelo foi descartado: superfície de erro humano grande demais. Um único `findMany()` sem o middleware aplicado expunha o banco inteiro. Decisão consolidada no Pivô Arquitetural de 2026-04-17.

Durante a janela de migração (dual-write), os dois modelos coexistem. Após migração completa, o `tenant_id` é removido das tabelas de produto.
