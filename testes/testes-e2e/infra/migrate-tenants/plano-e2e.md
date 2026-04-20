# Plano E2E — Scripts de Migração Schema-per-Tenant

**Documento:** TST-E2E-INFRA-001  
**Data:** 2026-04-19  
**Autor:** QA Dream Team  
**Status:** AGUARDANDO APROVAÇÃO

---

## Escopo

Scripts CLI em `scripts/migrate-tenants/` e `servicos-global/configurador/server/scripts/bootstrap-seed.ts`.

---

## Categorias Padrão (Playwright) — Não Aplicáveis

| Categoria | Status | Justificativa |
|-----------|--------|---------------|
| 1. Navegação e Rotas | N/A | Scripts CLI — sem browser, sem rotas SPA |
| 2. Formulários e Inputs | N/A | Sem UI |
| 3. Feedback Visual (toasts, modais) | N/A | Sem UI |
| 4. Responsividade | N/A | Sem UI |
| 5. Autenticação UI (login/logout flow) | N/A | Scripts não passam por tela de login |
| 6. Permissões UI | N/A | Sem UI |
| 7. Dados em Tempo Real | N/A | Sem WebSocket/SSE |
| 8. Acessibilidade (WCAG) | N/A | Sem UI |
| 9. Performance de Carregamento | N/A | Sem browser |
| 10. Cross-browser | N/A | Scripts Node.js |

---

## Categoria 11 — Integração CLI com PostgreSQL Real

> **Pré-requisito:** banco PostgreSQL de teste disponível via variável de ambiente `TEST_DATABASE_URL`.  
> Estes testes **não sobem junto com o vitest padrão** — rodam separados via `npm run test:e2e:infra`.  
> Cada fluxo usa um banco isolado (schema `public` limpo ou restaurado de dump).

### Configuração do Ambiente

```bash
# .env.test (não comitado — apenas CI/CD)
TEST_CONFIGURADOR_URL=postgresql://postgres:postgres@localhost:5432/test_configurador
TEST_SHARED_URL=postgresql://postgres:postgres@localhost:5432/test_shared
```

---

### Fluxo 1 — Provisionamento de Schemas (01-provision-schemas)

**Objetivo:** verificar que `01-provision-schemas.ts --execute` cria schemas `tenant_<cuid>` corretamente para todos os tenants ativos.

**Pré-condição:**
- Banco shared com tabelas migradas e ao menos 2 tenants em `_schema_migration_status` (status = PROVISIONED ou ausente)

**Passos:**

| # | Ação | Verificação esperada |
|---|------|---------------------|
| 1 | Executar `npx tsx 01-provision-schemas.ts --execute` | Exit code = 0 |
| 2 | Consultar `SELECT schema_name FROM information_schema.schemata` | Schemas `tenant_<cuid>` existem |
| 3 | Consultar `_schema_migration_status` | Todos os registros com `status = 'PROVISIONED'`, `tables_provisioned > 0` |
| 4 | Executar novamente (idempotência) | Exit code = 0, sem erro "já existe" |

**Verificações SQL pós-execução:**
```sql
-- Todos os schemas provisionados têm as tabelas certas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'tenant_<id>'
ORDER BY table_name;
-- Esperado: 63+ tabelas (TABLES_WITH_TENANT_ID)
```

---

### Fluxo 2 — Backfill de Dados (02-backfill)

**Objetivo:** verificar que `02-backfill.ts --execute` copia linhas do `public` para cada schema de tenant com isolamento correto.

**Pré-condição:**
- Fluxo 1 concluído (schemas existem, status = PROVISIONED)
- Linhas de teste inseridas no `public` com `tenant_id` distintos

**Passos:**

| # | Ação | Verificação esperada |
|---|------|---------------------|
| 1 | Inserir 10 linhas em `pedido_itens` (5 tenant A, 5 tenant B) | - |
| 2 | Executar `npx tsx 02-backfill.ts --execute` | Exit code = 0 |
| 3 | Consultar `tenant_A.pedido_itens` | 5 linhas, todas com `tenant_id = A` |
| 4 | Consultar `tenant_B.pedido_itens` | 5 linhas, todas com `tenant_id = B` |
| 5 | Consultar `_schema_migration_status` | `rows_copied > 0`, `status = 'BACKFILLED'` |
| 6 | Verificar que linhas do tenant B **não** aparecem em `tenant_A.*` | Isolamento correto |

**Verificação de isolamento (crítica):**
```sql
-- Nenhuma linha de tenant B no schema de tenant A
SELECT COUNT(*) FROM tenant_A.pedido_itens
WHERE tenant_id != 'id_tenant_a';
-- Esperado: 0
```

---

### Fluxo 3 — Cutover (03-cutover)

**Objetivo:** verificar que `03-cutover.ts --execute` valida paridade e marca tenants como CUTOVER.

**Pré-condição:**
- Fluxo 2 concluído (status = BACKFILLED, paridade esperada = 100%)

**Passos:**

| # | Ação | Verificação esperada |
|---|------|---------------------|
| 1 | Executar `npx tsx 03-cutover.ts --execute` | Exit code = 0 |
| 2 | Consultar `_schema_migration_status` | `status = 'CUTOVER'`, `parity_pct = 100.00` |
| 3 | Executar novamente (idempotência) | Script pula tenants já em CUTOVER, exit code = 0 |

**Teste de rejeição (paridade < 100%):**
```
1. Deletar 1 linha do schema de tenant A (simula divergência)
2. Executar 03-cutover.ts --execute
3. Esperado: tenant A permanece em BACKFILLED (ou BACKFILL_PARTIAL), exit code != 0 / log de erro
```

---

### Fluxo 4 — Bootstrap + Autenticação API

**Objetivo:** verificar o ciclo completo de bootstrap: banco vazio → seed → login → `GET /api/v1/me` = 200.

**Pré-condição:**
- Banco do Configurador limpo (tabelas migradas, zero linhas em `organizacao` e `usuario`)
- Servidor Configurador rodando contra banco de teste

**Passos:**

| # | Ação | Verificação esperada |
|---|------|---------------------|
| 1 | `GET /api/v1/me` com token Clerk válido | HTTP 401 — "Usuário não encontrado" |
| 2 | Executar `npx tsx bootstrap-seed.ts` | Exit code = 0; logs mostram org + usuário criados |
| 3 | Consultar `organizacao` | 1 linha: `slug = 'gravity'`, `status = 'ACTIVE'` |
| 4 | Consultar `usuario` | 1 linha: `email = 'dmmltda@gmail.com'`, `role = 'SUPER_ADMIN'`, `clerk_user_id LIKE 'bootstrap_%'` |
| 5 | `GET /api/v1/me` com token Clerk para dmmltda@gmail.com | HTTP 200 — email fallback vincula automaticamente |
| 6 | Consultar `usuario` novamente | `clerk_user_id` agora = ID real do Clerk (não `bootstrap_*`) |
| 7 | `GET /api/v1/me` novamente | HTTP 200 — hit direto por `clerk_user_id` (sem fallback) |
| 8 | Executar `bootstrap-seed.ts` novamente (idempotência) | Exit code = 0; "Nada criado. O banco já tem dados de bootstrap." |

---

### Fluxo 5 — Dry-run (modo padrão sem --execute)

**Objetivo:** verificar que todos os scripts, sem `--execute`, são completamente não-destrutivos.

**Passos:**

| # | Ação | Verificação esperada |
|---|------|---------------------|
| 1 | Executar `npx tsx 01-provision-schemas.ts` (sem --execute) | Exit code = 0, nenhum schema criado |
| 2 | Executar `npx tsx 02-backfill.ts` (sem --execute) | Exit code = 0, zero linhas copiadas |
| 3 | Executar `npx tsx 03-cutover.ts` (sem --execute) | Exit code = 0, status inalterado |
| 4 | Verificar `_schema_migration_status` após os 3 | Nenhuma linha alterada |

---

## Critérios de Aprovação

| Critério | Meta |
|----------|------|
| Todos os 5 fluxos passam | 100% |
| Isolamento cross-tenant verificado | 0 vazamentos |
| Idempotência comprovada | Todos os fluxos |
| Dry-run não-destrutivo | Verificado |
| Bootstrap → `/api/v1/me` 200 | Comprovado end-to-end |

---

## Instruções para Implementação

1. **Aguardar aprovação** deste plano pelo Tech Lead / PO antes de escrever specs
2. Criar `testes/testes-e2e/infra/migrate-tenants/setup.ts` com helpers de conexão e limpeza de banco
3. Implementar cada fluxo como arquivo `.spec.ts` separado:
   - `01-provision.spec.ts`
   - `02-backfill.spec.ts`
   - `03-cutover.spec.ts`
   - `04-bootstrap-auth.spec.ts`
   - `05-dry-run.spec.ts`
4. Adicionar script no `package.json` raiz: `"test:e2e:infra": "vitest run --config testes/testes-e2e/infra/vitest.config.ts"`
5. Integrar no CI com `TEST_DATABASE_URL` provisionado via Railway ephemeral DB

---

*Plano aguardando aprovação. Specs só serão escritas após sign-off.*
