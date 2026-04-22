---
name: Gravity Tier 1 Security & Schema Isolation
description: Regras Invioláveis de Arquitetura de Banco de Dados B2B e Prevenção de Transbordamento de Dados Multi-Organização após o pivô Schema-per-Organização (2026-04-17). LEIA ANTES DE ESCREVER CÓDIGO DB.
---

# 🛡️ Padrão Ouro de Segurança: Gravity Platform (Tier 1)

> **Reescrita 2026-04-17 após o pivô Schema-per-Organização.**
> Decisões em [ADR-001](../../../documentos-tecnicos/adr/ADR-001-schema-per-tenant.md) e [ADR-002](../../../documentos-tecnicos/adr/ADR-002-tenant-resolver-sdk.md).
>
> **Nomes técnicos preservados:** o pacote npm `@gravity/tenant-resolver`, o prefixo de schema PostgreSQL `tenant_<cuid>` e a API `req.tenant.tenantId` continuam sendo identificadores reais. Em payloads/JSON/variáveis de aplicação use `id_organizacao`/`idOrganizacao` (DDD).

Você está trabalhando num ecossistema B2B Multi-Organização da Gravity. Vazamentos de dados cruzados entre Organizações (ex: Organização A vendo a Fatura ou DUIMP da Organização B) representam um Incidente de Severidade Crítica (Tier 1 Incident).
**Siga as diretrizes abaixo religiosamente sob risco de corromper a plataforma.**

---

## 1. Isolamento via Schema-per-Organização (PostgreSQL + PgBouncer transaction mode)

A Gravity utiliza PostgreSQL com **PgBouncer em modo `transaction`**. O isolamento é feito por **`SET LOCAL search_path` dentro de `$transaction`** — a garantia de limpeza está no banco, não na aplicação. Pool leak é matematicamente impossível: o Postgres reseta o `search_path` no `COMMIT`/`ROLLBACK`.

### O que você JAMAIS fará

```typescript
// ❌ Estado da conexão poluído. Próxima request de outra organização herda o schema.
await prisma.$executeRaw`SET search_path TO tenant_acme`;
await prisma.faturas.findMany();
```

```typescript
// ❌ Instanciar Prisma cru — proibido. Linter CI bloqueia.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

```typescript
// ❌ Acessar banco fora do SDK — proibido.
import { prisma } from './lib/db';
const data = await prisma.fatura.findMany();
```

### O que você DEVE fazer (o SDK obrigatório)

```typescript
import { withTenant } from '@gravity/tenant-resolver';

app.get('/faturas', async (req, res) => {
  const faturas = await withTenant(req, async (db) => {
    // db é o TransactionClient do Prisma DENTRO de $transaction.
    // SET LOCAL search_path TO tenant_<id> já foi aplicado.
    // COMMIT/ROLLBACK reseta o search_path automaticamente.
    return db.fatura.findMany();
  });
  res.json(faturas);
});
```

Por dentro do `withTenant`:

```typescript
return _internalPrisma.$transaction(async (tx) => {
  await tx.$executeRawUnsafe(
    `SET LOCAL search_path TO "${ctx.schemaName}", public`
  );
  return fn(tx);
}, { timeout: 10_000, isolationLevel: 'ReadCommitted' });
```

> **Por quê `SET LOCAL` em transação?** Porque `SET LOCAL` morre no `COMMIT`/`ROLLBACK`. Mesmo se o handler crashar, der OOM, der timeout ou se alguém esquecer um hook, a próxima request pega a conexão limpa. **A garantia é do Postgres.**

---

## 2. Modelo de Banco — Schema é a Organização

Tabelas de produto **não têm `id_organizacao` em coluna** após a Fase 4 da migração (ADR-003). O schema **é** a organização:

```prisma
model Fatura {
  id        String @id @default(cuid())
  numero    String
  valor     Decimal
  // SEM id_organizacao — o schema tenant_<id> isola fisicamente (prefixo real do Postgres).
  // SEM @@index([id_organizacao]) — não existe a coluna.

  @@index([numero])
}
```

Durante a janela de migração (Fases 2-3 do ADR-003), `id_organizacao` permanece em coluna por causa do dual-write. **Após Fase 4, é removido.**

### RLS NÃO é mais a defesa primária em produtos

RLS continua útil **apenas no Configurador** (banco single-schema com organizações/users globais). Em bancos de produto, RLS deixa de ser necessário — o `search_path` já isola fisicamente.

> Se você está adicionando RLS num banco de produto novo, **pare** — o modelo correto é schema-per-organização via SDK. Consulte ADR-001.

---

## 3. Comportamento da API (Anti-Enumeração / 404-Masking)

A Gravity utiliza IDs Sequenciais (ex: `esti_id_00001/26`), o que permite ataques lógicos de força-bruta em rotas como `GET /api/duimp/:id`.

Como o isolamento é por schema, tentar ler `/api/duimp/123` numa organização que não tem o registro retorna `null` no Prisma (a tabela da organização não tem essa linha — mesmo que outro schema tenha). Mas o padrão de resposta da API continua o mesmo:

- **Recurso não encontrado no schema da organização** → invariavelmente `HTTP 404 Not Found`
- **Falha de auth/permissão** → `HTTP 401` ou `HTTP 403` apenas após verificação de organização
- **Sem mensagens que revelem existência cross-organização**

---

## 4. O Gatekeeper (Vitest + CI Lint)

Você não implementa lógica estrutural sem rodar dois gates:

### 4.1 Suite anti-cross-organização (`testes/security/cross-tenant-isolation.test.ts`)

Cria 2 organizações em schemas diferentes, insere dados em cada uma, faz request com JWT da organização A tentando ler dados da B → espera `null` (a tabela da B não está no `search_path` do A).

Inclui também o teste de **resiliência do pool**:

```typescript
it('crash do handler não polui search_path da próxima request', async () => {
  const a = await createTestOrganizacao();
  const b = await createTestOrganizacao();

  await expect(
    withTenantContext(a.id, async () => { throw new Error('crash'); })
  ).rejects.toThrow();

  // Próxima request usa pool — search_path tem que estar limpo
  const sp = await withTenantContext(b.id, async (_, db) => {
    const [{ search_path }] = await db.$queryRaw<{ search_path: string }[]>`SHOW search_path`;
    return search_path;
  });

  expect(sp).toContain(`tenant_${b.id.replace(/-/g, '')}`);
  expect(sp).not.toContain(`tenant_${a.id.replace(/-/g, '')}`);
});
```

### 4.2 Linter de Tenant Safety (CI bloqueia deploy)

> O nome do linter (`Tenant Safety`) é mantido — referencia o pacote real `@gravity/tenant-resolver` e o prefixo físico `tenant_<cuid>`.

Falha o build se detectar em `produto/*/server/` ou `servicos-global/tenant/*/server/`:

- `import { PrismaClient } from '@prisma/client'`
- `new PrismaClient(`
- Acesso ao banco fora de `withTenant` ou `withTenantContext`
- Chave de cache sem prefixo `tenant:<id>:` ou `tenant:_global:` (com justificativa) — prefixo do SDK mantido por compatibilidade

---

## 5. Background Jobs (ETL e Relatórios Noturnos)

CRON jobs e workers usam `withTenantContext(idOrganizacao, fn)` — **nunca** acessam Prisma cru:

```typescript
// ✅ correto
import { withTenantContext } from '@gravity/tenant-resolver';

for (const organizacao of organizacoesAtivas) {
  await withTenantContext(organizacao.id, async (ctx, db) => {
    const resumo = await db.fatura.aggregate({ _sum: { valor: true } });
    await sendDailyEmail(organizacao.email, resumo);
  });
}
```

Cada iteração abre transação isolada. Falha em uma organização não polui a próxima. **Sob nenhuma hipótese** use roles `BYPASSRLS` ou conexão sem `withTenantContext` em workers que lidam com agregações ou notificações — o risco de cross-organização em massa é catastrófico.

---

## 6. O Ecossistema Externo (Cache Redis & Object Storage S3)

A proteção se aplica fora do banco isolando blobs e cache.

### Key-Value Cache (Redis ou in-memory)
**OBRIGATÓRIO** prefixo de organização em toda chave. Linter CI bloqueia chaves sem o prefixo (o prefixo `tenant:` é mantido por compatibilidade do SDK).

```typescript
// ✅ correto
await redis.set(`tenant:${idOrganizacao}:produtos:${id}`, payload);

// ✅ correto — cache global explícito
await redis.set(`tenant:_global:ncm:8471.30`, payload);

// ❌ proibido
await redis.set(`produtos:${id}`, payload);
```

### Pre-Signed URLs (AWS S3/R2)
PDFs de Fatura Comercial são estritamente privados (S3 Public ACL = off).
1. A API antes de assinar confirma que a *Storage Key* tem prefixo `tenant_<id>/...` correspondente à organização da request.
2. Nenhuma URL pode nascer com TTL superior a **300 segundos**.
3. Storage Key inclui o `idOrganizacao` no caminho — auditoria forense trivial.

---

## 7. Endpoints Administrativos `/admin/*`

Rotas administrativas exigem:
- JWT válido + `tipo_usuario === 'SUPER_ADMIN'` (de `req.tenant.roles`, vindo do `GET /api/v1/me` — Mandamento 01)
- Header `x-target-tenant-id` explícito (não inferido do JWT do admin) — nome do header mantido por compatibilidade de protocolo
- Validação dupla pelo SDK: usuário tem permissão **E** organização alvo existe e está ativa
- Log especial `admin_action: true`, ingerido pela aba "Eventos de Segurança"

---

*Você leu, compreendeu e internalizou. Agora, escreva código blindado pelo Postgres, não pelo seu cuidado.*
