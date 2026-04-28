---
name: antigravity-isolamento-organizacao
description: "Use esta skill sempre que uma tarefa envolver queries ao banco de dados, criação de models Prisma, configuração de middleware ou qualquer código que acesse dados da organizacao em produtos. Define a regra mais importante do sistema após o pivô de 2026-04-17: Schema-per-Organizacao + SDK obrigatório @gravity/resolver-organizacao. Todo agente consulta esta skill antes de escrever qualquer acesso ao banco de produto."
---

# Gravity — Isolamento de Organizacao (Schema-per-Organizacao)

> **Esta skill foi reescrita em 2026-04-17 após o pivô arquitetural Risco Zero.**
> O modelo anterior (`WHERE id_organizacao = ?` + RLS) foi descartado para os bancos de produto. Toda referência ao modelo antigo nesta skill é histórica.
> Decisão registrada no Pivô Arquitetural de 2026-04-17 (schema-per-organizacao e Configurador como hub central). Ver [ADR-001](../../../documentos-tecnicos/adr/ADR-001-schema-per-tenant.md), [ADR-002](../../../documentos-tecnicos/adr/ADR-002-tenant-resolver-sdk.md) e [ADR-003](../../../documentos-tecnicos/adr/ADR-003-migracao-dados-legados.md). Detalhes operacionais consolidados em `documentos-tecnicos/acessos-usuarios/incidentes-e-auditoria.md`.
>
> **Notas sobre nomes técnicos preservados:** apenas dois nomes legados continuam por razões físicas — o pacote npm `@gravity/resolver-organizacao` (identificador registrado) e o prefixo de schema PostgreSQL `tenant_<cuid>` (objeto físico do banco). A API pública do SDK foi migrada para `withOrganizacao(req, ...)` / `withOrganizacaoContext(idOrganizacao, ...)`. Em payloads/JSON/variáveis de aplicação use **sempre** `id_organizacao`/`idOrganizacao` (DDD — Mandamento 03).

---

## A Regra Mais Importante do Sistema

**Em todo banco de produto, cada organizacao vive em seu próprio schema PostgreSQL exclusivo. Nenhum acesso ao banco acontece sem passar pelo SDK `@gravity/resolver-organizacao`.**

Não é "boa prática" — é regra absoluta. A garantia de isolamento agora é **do PostgreSQL**, não da aplicação. Não há exceção. Não há "só desta vez".

---

## O Modelo: Schema-per-Organizacao

| Banco | Modelo |
|---|---|
| `configurador` | single-schema `public` (fonte de verdade global de identidade) |
| `pedido`, `processo`, `simula-custo`, `bid-frete`, `bid-cambio`, `nf-importacao`, `financeiro-comex`, `conector-erp` | **schema-per-organizacao**: 1 schema por organizacao, nomeado `tenant_<cuid>` (prefixo real de Postgres) |
| `servicos-global/organizacao` (email, dashboard, gabi, histórico, notificações, relatórios, whatsapp, cronometro) | **schema-per-organizacao** |

---

## A Única Forma Permitida de Acessar o Banco

```typescript
import { withOrganizacao } from '@gravity/resolver-organizacao';

app.get('/pedidos', async (req, res) => {
  const pedidos = await withOrganizacao(req, async (db) => {
    // db é o cliente Prisma DENTRO de $transaction com SET LOCAL search_path
    // Apontando para o schema da organizacao. COMMIT/ROLLBACK reseta automaticamente.
    return db.pedido.findMany();
  });
  res.json(pedidos);
});
```

### Por dentro do `withOrganizacao` (referência)

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
import { withOrganizacaoContext } from '@gravity/resolver-organizacao';

// O parâmetro "tenantId" abaixo é o nome real da API pública do SDK.
// Em payloads e variáveis de aplicação, use idOrganizacao.
await withOrganizacaoContext(idOrganizacao, async (ctx, db) => {
  return db.pedido.updateMany({ where: { status: 'PENDENTE' }, data: { ... } });
});
```

---

## O Que É Proibido

- ❌ `import { PrismaClient } from '@prisma/client'` em qualquer arquivo de produto (linter CI bloqueia)
- ❌ `new PrismaClient(...)` em qualquer produto
- ❌ Acesso ao banco fora de `withOrganizacao(...)` ou `withOrganizacaoContext(...)`
- ❌ `WHERE id_organizacao = ?` em queries de produto (modelo antigo morto)
- ❌ Coluna `tenant_id` ou campo Prisma `id_organizacao` em tabelas de produto
- ❌ Cache (`redis.set`, in-memory) sem prefixo `organizacao:<id_organizacao>:`
- ❌ PgBouncer em modo `session` para banco de produto (modo `transaction` é obrigatório)
- ❌ `SET search_path` (sem `LOCAL`) — vaza no pool
- ❌ Provisionar schema "on-demand" no primeiro request — corrida garantida

---

## O Que É Obrigatório

- ✅ Toda rota de produto chama `withOrganizacao(req, async db => ...)`
- ✅ Toda tarefa de background chama `withOrganizacaoContext(idOrganizacao, async (ctx, db) => ...)` (nome do parâmetro do SDK é `tenantId`; passe `idOrganizacao` da aplicação)
- ✅ Schema é provisionado pelo worker do evento `TenantProvisioned` (com DLQ + retry)
- ✅ Migrations rodam via `scripts/ativamente/migrate-all-tenants.ts` (orquestrador — Pivô 2026-04-17)
- ✅ Cliente Prisma é instanciado só em `packages/tenant-resolver/src/internal-prisma.ts` e **não é exportado**
- ✅ Teste E2E de isolamento cross-organizacao em todo produto (`tenant-isolation.e2e.test.ts`)
- ✅ Validação Zod em toda rota antes do `withOrganizacao`
- ✅ Configurador é a fonte de identidade — frontend lê de `GET /api/v1/me`, **PROIBIDO** ler `publicMetadata.role`/`publicMetadata.tenantId` do Clerk para autorização (Mandamento 01)

---

## Models Prisma — Padrão Pós-Pivô

Em bancos de produto:

```prisma
model Pedido {
  id        String @id @default(cuid())
  numero    String
  status    String
  // SEM campo id_organizacao — o schema É a Organizacao
  // SEM @@index([id_organizacao]) — desnecessário

  @@index([status])
  @@index([numero])
}
```


No Configurador (não muda):

```prisma
model Organizacao {
  id          String @id @default(cuid())
  nome        String
  status      OrganizacaoStatus
  // Configurador É a fonte de Organizações. Não carrega coluna de auto-isolamento.
  // O model físico real do schema.prisma do Configurador é INTOCÁVEL (Mandamento 02).
  // Em payloads/JSON, refira-se ao conceito como "Organizacao" (id_organizacao).
}
```

---

## Provisionamento de Nova Organizacao

Disparado pelo evento `TenantProvisioned` (nome do evento mantido por compatibilidade) emitido pelo Configurador:

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
it('acesso cross-organizacao deve falhar — schema da outra organizacao não está no search_path', async () => {
  const orgA = await createTestOrganizacao();
  const orgB = await createTestOrganizacao();

  const pedidoB = await withOrganizacaoContext(orgB.id, async (_, db) =>
    db.pedido.create({ data: { numero: 'B-001', status: 'NOVO' } })
  );

  // Request com JWT da organizacao A tentando ler pedido da organizacao B
  const result = await withOrganizacaoContext(orgA.id, async (_, db) =>
    db.pedido.findUnique({ where: { id: pedidoB.id } })
  );

  expect(result).toBeNull(); // schema do A não enxerga tabela do B
});

it('crash do handler não polui search_path da próxima request', async () => {
  const orgA = await createTestOrganizacao();
  const orgB = await createTestOrganizacao();

  await expect(
    withOrganizacaoContext(orgA.id, async (_, db) => {
      throw new Error('simulando crash');
    })
  ).rejects.toThrow();

  // Próxima request usa pool — search_path tem que estar limpo
  const result = await withOrganizacaoContext(orgB.id, async (_, db) => {
    const [{ search_path }] = await db.$queryRaw<{ search_path: string }[]>`
      SHOW search_path
    `;
    return search_path;
  });

  expect(result).toContain(`tenant_${orgB.id}`);
  expect(result).not.toContain(`tenant_${orgA.id}`);
});
```

---

## Comunicação entre Produto e Configurador

O serviço de produto nunca acessa o banco do Configurador. Identidade vem via `GET /api/v1/me`:

```typescript
// ✅ correto — via SDK, que cacheia GET /api/v1/me (Mandamento 01: Prisma é fonte da verdade)
// O middleware resolverOrganizacao já fez isso. req.organizacao tem o que você precisa.
app.get('/algo', resolverOrganizacao(config), async (req, res) => {
  const { roles } = req.organizacao;
  if (!roles.includes('PEDIDO_WRITE')) throw new AppError('Sem permissão', 403);
  // ...
});

// ❌ proibido — acessar banco do Configurador diretamente
import { configuradorPrisma } from '../../configurador/server/prisma';

// ❌ PROIBIDO — autorização via Clerk (Mandamento 01)
const role = currentUser.publicMetadata.role;  // NUNCA — só fonte de verdade é o Prisma via /api/v1/me
```

---

## Endpoints `/admin/*`

Rotas administrativas em qualquer produto exigem:
- JWT válido + `tipo_usuario === 'SUPER_ADMIN'` (vindo de `req.organizacao.roles`)
- Header `x-target-organizacao-id` explícito (não inferido do JWT do admin)
- Validação dupla pelo SDK: usuário tem permissão **E** organizacao alvo existe e está ativa
- Log especial com `admin_action: true`, ingerido pela aba "Eventos de Segurança"

---

## Métricas de Monitoramento

O SDK emite (Prometheus):

```
resolver_organizacao_resolve_duration_ms{quantile="0.95"}     # alvo < 5ms
resolver_organizacao_set_local_duration_ms{quantile="0.95"}   # alvo < 2ms
resolver_organizacao_cache_hit_ratio                           # alvo > 95%
resolver_organizacao_configurador_errors_total                 # alvo 0
resolver_organizacao_active_transactions                       # capacidade
```

CRON horário audita paridade `Configurador.tenants_ativos == bancos.schemas_existentes`. Divergência → alerta crítico na aba "Alertas (24h)".

---

## Checklist — Antes de Qualquer Acesso ao Banco de Produto

- [ ] Estou usando `withOrganizacao(req, ...)` ou `withOrganizacaoContext(idOrganizacao, ...)` — não há outra forma?
- [ ] O produto tem `@gravity/resolver-organizacao` no `package.json` (e **não** `@prisma/client`)?
- [ ] Estou dentro do callback do SDK ao tocar o banco?
- [ ] O cache (se houver) está prefixado com `organizacao:<id_organizacao>:`?
- [ ] O teste de cross-organizacao está implementado e passando?
- [ ] O teste de "crash não polui search_path" está implementado para esse produto?
- [ ] Schema novo (se aplicável) é criado pelo worker de `TenantProvisioned`?
- [ ] Migration nova roda via orquestrador `migrate-all-tenants.ts`?
- [ ] Nenhuma autorização baseada em `publicMetadata` do Clerk (Mandamento 01)?

---

## Histórico — Modelo Antigo (apenas referência durante migração)

Antes do pivô de 2026-04-17, o isolamento era feito por:
- Campo Prisma `id_organizacao String` obrigatório em todo model (coluna física `tenant_id`).
- `WHERE id_organizacao = ?` injetado por middleware Prisma (`$extends`).
- RLS PostgreSQL como segunda camada (`USING (tenant_id = current_setting('app.current_tenant_id')::suid)` — nome da coluna física legada).

Esse modelo foi descartado: superfície de erro humano grande demais. Um único `findMany()` sem o middleware aplicado expunha o banco inteiro. Decisão consolidada no Pivô Arquitetural de 2026-04-17.

