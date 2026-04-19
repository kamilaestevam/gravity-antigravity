# ADR-003 — Migração dos Dados Legados (single-schema → schema-per-tenant)

**Status:** Accepted
**Data:** 2026-04-17
**Depende de:** ADR-001, ADR-002

---

## Contexto

Os bancos de produto atuais (`pedido`, `processo`, `simula-custo`, `bid-frete`, `bid-cambio`, `nf-importacao`, `financeiro-comex`, `servicos-global/tenant`) operam em single-schema com `tenant_id` em coluna. Precisamos migrar:

- **Schema:** criar 1 schema por tenant existente em cada banco.
- **Dados:** mover linhas filtradas por `tenant_id` para os schemas correspondentes.
- **Migrations futuras:** rodar em N schemas a cada deploy.
- **Zero downtime:** a operação não pode parar o produto em produção.

## Decisão

Migração em 4 fases por produto, executadas tenant-a-tenant com possibilidade de rollback granular.

### Fase 1 — Provisionamento Paralelo (sem cutover)

1. Para cada tenant ativo no Configurador:
   - `CREATE SCHEMA tenant_<id>` no banco do produto (se não existir).
   - Rodar `prisma migrate deploy` apontando para o schema novo.
2. Schema fica vazio, pronto para receber dados.
3. Ainda **não há cutover** — o produto continua lendo/escrevendo no schema `public` antigo.
4. Validação: contagem de schemas == contagem de tenants ativos.

Implementação: `scripts/migrate-tenants/01-provision-schemas.ts`

### Fase 2 — Backfill de Dados (dual-write antes do cutover)

1. SDK liga **modo dual-write** via feature flag `DUAL_WRITE_MODE=true`:
   - Toda escrita acontece em `public.tabela WHERE tenant_id = X` **E** em `tenant_X.tabela`.
   - Leitura continua de `public` (fonte de verdade durante migração).
2. Backfill incremental copia dados existentes:
   ```sql
   INSERT INTO tenant_X.pedido
   SELECT * FROM public.pedido WHERE tenant_id = 'X'
   ON CONFLICT (id) DO NOTHING;
   ```
3. Rodado em batches de 1.000 linhas, com checkpoint persistido em `_migration_progress`.
4. Job de auditoria horária verifica paridade `count(public WHERE tenant_id=X) == count(tenant_X)`.

Implementação: `scripts/migrate-tenants/02-backfill.ts`

### Fase 3 — Cutover Por Tenant

1. Para cada tenant validado (paridade 100%):
   - Trava escritas no tenant por ~30s (modo `READ_ONLY`).
   - Roda diff final + reconciliação.
   - Vira flag de roteamento: `TENANT_X_USES_SCHEMA=true`.
   - SDK passa a operar em modo schema-per-tenant para esse tenant — `withTenant` aponta para `tenant_X`.
   - Libera escritas.
2. **Dual-write continua** mais 7 dias para permitir rollback rápido.
3. Após 7 dias estáveis (sem incidentes, métricas de paridade verdes), entra na Fase 4.

Implementação: `scripts/migrate-tenants/03-cutover.ts`

### Fase 4 — Limpeza

1. Desligar dual-write para o tenant.
2. `DROP TABLE public.<tabela> WHERE tenant_id = X` (registros migrados, em batches).
3. Remover coluna `tenant_id` das tabelas dentro do schema do tenant (redundante — schema **é** o tenant).
4. Após todos os tenants migrados, `DROP` das tabelas legadas em `public`.

Implementação: `scripts/migrate-tenants/04-cleanup.ts`

## Migrations Futuras (após cutover completo)

Após Fase 4, todo `prisma migrate dev` no produto produz uma migration que precisa rodar em N schemas. Orquestrador:

```bash
node scripts/migrate-all-tenants.ts --product=pedido --migration=20260417_add_field
```

O script:
1. Lê lista de tenants ativos do Configurador.
2. Para cada tenant, em paralelo (max 10 simultâneas):
   - `SET search_path TO tenant_<id>` + roda a migration.
   - Registra resultado em `_migration_history`.
3. Falha em qualquer tenant → para tudo, alerta crítico no painel.
4. Suporte a `--dry-run`, `--single-tenant=X`, `--retry-failed`.

Migrations destrutivas (DROP COLUMN, RENAME) exigem aprovação dupla (Líder Técnico + DBA) e janela de manutenção.

## Provisionamento de Novo Tenant (após cutover)

Disparado pelo evento `TenantProvisioned` (Configurador → Event Bus):

1. Worker em cada produto consome o evento.
2. `CREATE SCHEMA tenant_<id>` + `prisma migrate deploy --schema=tenant_<id>`.
3. Falha → DLQ com retry exponencial (1m, 5m, 15m, 1h).
4. Após 3 falhas → alerta crítico + notificação ao on-call.
5. Sem fallback síncrono on-demand: tentativa de login antes do schema existir → erro claro "Tenant em provisionamento, tente novamente em alguns segundos".

## Rollback

Cada fase tem rollback explícito:

| Fase | Rollback |
|---|---|
| 1 | `DROP SCHEMA tenant_<id> CASCADE` |
| 2 | Desligar dual-write (`DUAL_WRITE_MODE=false`); dados em `public` continuam intactos |
| 3 | Virar flag de volta (`TENANT_X_USES_SCHEMA=false`); leituras voltam para `public`; dual-write traz consistência |
| 4 | **Sem rollback automático** — após DROP da coluna/tabela é destrutivo. Restore via backup. |

## Janela de Execução

- **Fase 1:** 1 dia (todos os tenants em paralelo).
- **Fase 2:** 3-7 dias por produto (depende do volume).
- **Fase 3:** 1 tenant por hora durante janela de baixo tráfego (madrugada BRT). Total: ~6 semanas para 1.000 tenants × 8 produtos.
- **Fase 4:** após 7 dias estáveis pós-cutover de cada tenant.

Total estimado: **3 meses** para migração completa de todos os produtos.

## Métricas de Sucesso

- Zero incidentes de inconsistência durante dual-write.
- Paridade 100% antes de cada cutover.
- Tempo de cutover por tenant < 60s.
- Rollback testado em ambiente staging para cada produto antes da Fase 3 em prod.

## Riscos

| Risco | Mitigação |
|---|---|
| Dual-write dobra carga de escrita | Monitorar p95; se passar de 250ms, throttle do backfill |
| Backfill consome IO do banco | Batches pequenos (1k linhas), com pausa entre eles |
| Tenant com volume gigante (>10M linhas) | Migração em janela dedicada, com lock parcial; possível particionamento |
| Migration futura quebra em 1 tenant entre 1.000 | Orquestrador para tudo no primeiro erro; reverte; alerta |
| Drift Configurador ↔ schemas | CRON horário de auditoria (S6) |
