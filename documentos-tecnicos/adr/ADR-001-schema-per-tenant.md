# ADR-001 — Schema-per-Tenant nos Bancos de Produto

**Status:** Accepted
**Data:** 2026-04-17 (revisado após auditoria de pool leak)
**Decisores:** Líder do Projeto, Líder Técnico, Segurança
**Substitui:** modelo anterior de `tenant_id String` + `WHERE tenant_id = ?` + RLS (skill `arquitetura/tenant-isolation` versão antiga, a ser reescrita)

---

## Contexto

A plataforma Gravity é um SaaS B2B Comex com teto de 1.000 clientes Enterprise. Vazamento de dados cross-tenant é evento de extinção do negócio. O modelo de "tabela compartilhada com `tenant_id` no WHERE" depende de:

- Middleware Prisma que **nunca pode falhar**.
- Disciplina humana ao escrever queries.
- RLS PostgreSQL como rede de segurança.

A superfície de erro humano é grande demais. Um único `findMany()` sem o middleware aplicado expõe o banco inteiro.

## Decisão

Adotar **Schema-per-Tenant** em **todos os bancos de produto**:

> 1 Tenant = 1 schema PostgreSQL exclusivo, nomeado `tenant_<uuid_sanitizado>`, em cada banco de produto (`pedido`, `processo`, `simula-custo`, `bid-frete`, `bid-cambio`, `nf-importacao`, `financeiro-comex`, `conector-erp`, `servicos-global/tenant`, e todos os futuros).

O isolamento é **físico-lógico**: cada operação roda dentro de uma `$transaction` que começa com `SET LOCAL search_path TO tenant_<x>, public`. O Postgres reseta o `search_path` automaticamente no `COMMIT`/`ROLLBACK` — não depende de hook de aplicação, não vaza no pool.

### O que NÃO muda

- **Configurador (Banco 1)** continua single-schema, fonte única de verdade de Tenants/Workspaces/Users/Roles. Não tem `tenant_id` nos models — ele **é** quem define os tenants.
- **Núcleo Global** (componentes React puros): sem mudança.
- **Marketplace** (público, sem auth, sem backend de domínio): sem mudança.

## Modelo de Conexão (correção crítica)

Avaliamos três combinações antes de travar:

| Modelo | Avaliação |
|---|---|
| `session` mode + `SET search_path` no início + `DISCARD ALL` em `res.on('finish')` | ❌ **Pool leak window real.** Falha em crash do handler, OOM, timeout abrupto, exceção antes do hook, ou se middleware faltar. A garantia de limpeza fica na aplicação. |
| `transaction` mode + `SET search_path` (sem LOCAL) | ❌ **Vazamento certo.** O estado persiste na conexão entre transações; outro tenant pega a conexão "suja". |
| `transaction` mode + **`SET LOCAL search_path` dentro de `$transaction`** | ✅ **Escolhido.** O Postgres limpa automaticamente no fim da transação. Garantia no banco, não na aplicação. |

### Padrão obrigatório

```typescript
await withTenant(req, async (db) => {
  // db é o TransactionClient do Prisma, já dentro de $transaction
  // search_path ESTÁ apontando para tenant_<x> e VAI ser resetado no COMMIT/ROLLBACK
  const pedidos = await db.pedido.findMany();
  return pedidos;
});
```

Internamente, `withTenant` faz:

```typescript
return prisma.$transaction(async (tx) => {
  await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`);
  return fn(tx);
});
```

O cliente Prisma cru (`PrismaClient` sem o wrapper) **não é exportado** para o produto — é encapsulado pelo SDK. Tentativa de importar dispara erro de tipo em build (ver ADR-002 §6).

## Trade-off do `$transaction` Obrigatório

- Toda rota paga 1 BEGIN/COMMIT extra (~0.3ms p95).
- Para writes (CRUD), zero overhead — Prisma já abre transação implícita.
- Cabe folgado no SLA de 200ms p95.

## Alternativas Rejeitadas

| Alternativa | Por que rejeitada |
|---|---|
| Tabela compartilhada + RLS reforçada | Modelo atual. Risco humano permanece. |
| Database-per-Tenant | 1.000 bancos × 7 produtos = 7.000 bancos. Inviável (backups, migrations, conexões). |
| `session` mode + hook de limpeza | Pool leak window. Defesa em profundidade exige garantia no banco. |
| Migrar para Kysely | Custo de migração proibitivo nesta janela; Prisma cobre o caso com `SET LOCAL` em transação. |

## Consequências

### Positivas
- Vazamento cross-tenant **impossível** sem comprometer infra.
- Auditoria forense por tenant trivial (`pg_dump --schema=tenant_x`).
- Backup/restore por cliente trivial.
- LGPD: deleção de tenant = `DROP SCHEMA tenant_x CASCADE` + remoção do registro no Configurador.
- Migrations podem ser aplicadas tenant-por-tenant (rollback granular).
- PgBouncer em `transaction` mode mantém densidade de pool (~10× mais eficiente que session).

### Negativas / Custos
- Migrations rodam em N schemas — orquestrador (ADR-003).
- Toda operação de produto vira transação — overhead aceito.
- Skill `tenant-isolation` precisa reescrita (S0).
- Catalog bloat (`pg_class`) em ~50.000 tabelas (50/tenant × 1.000) começa a impactar `pg_dump`. Aceito; otimização futura via particionamento de banco.

## Implementação — Resumo

1. SDK `@gravity/tenant-resolver` (ADR-002) é a **única** porta de entrada para banco em produtos.
2. Provisionamento de schema acontece no webhook `TenantProvisioned` do Configurador (DLQ + retry).
3. Migrations rodam via orquestrador `scripts/migrate-all-tenants.ts` (ADR-003).
4. CI/CD bloqueia deploy se detectar import direto de `@prisma/client` em produto (linter custom).
5. Cache (Redis ou in-memory) **obrigatoriamente** prefixado com `tenant:<id>:`.

## Métricas de Sucesso

- Zero queries em produção fora de `withTenant` (validado por linter CI + grep estático).
- p95 de overhead do `SET LOCAL search_path` < 2ms (medido em load test 50k req/s).
- 100% dos tenants provisionados com schema antes do primeiro login.
- Auditoria CRON horária com 100% de paridade Configurador ↔ schemas existentes.

## Próximos ADRs Relacionados

- **ADR-002:** Contrato e API do `@gravity/tenant-resolver`
- **ADR-003:** Estratégia de migração dos dados legados (single-schema → schema-per-tenant)
