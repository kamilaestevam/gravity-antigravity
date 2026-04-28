# PLANO_REFATORACAO_CODIGO.md

**Versão:** 1.0
**Data:** 2026-04-26
**Autor:** Claude (sob supervisão do Tech Lead)
**Status:** ⏸ AGUARDANDO LUZ VERDE
**Premissa:** Sistema 100% local, sem produção. Tolerância zero a dívida técnica.

---

## 0. Sumário Executivo

Refatoração da Linguagem Ubíqua DDD em **8 dimensões simultâneas** afetando **~270 arquivos de código**, **20 schemas Prisma** e **5 políticas RLS**. Executada em **Linha de Montagem (Banco → Back → Front)** por **Contexto Isolado**, em **9 fases sequenciais** com commit atômico por fase.

### As 8 dimensões de rename

| # | Categoria | Exemplo | Tipo |
|---|---|---|---|
| 1 | Pacote SDK | `@gravity/tenant-resolver` → `@gravity/resolver-organizacao` | Infra |
| 2 | Funções SDK | `withTenant` → `withOrganizacao` | Código |
| 3 | API SDK | `req.tenant.tenantId` → `req.organizacao.idOrganizacao` | Código |
| 4 | Tipos SDK | `TenantContext`, `TenantDatabase` → `OrganizacaoContext`, `BancoOrganizacao` | Código |
| 5 | Eventos | `TenantProvisioned` → `OrganizacaoProvisionada` | Código |
| 6 | Headers HTTP | `x-internal-key` → `x-chave-interna`; `x-tenant-id` → `x-id-organizacao`; `x-correlation-id` → `x-id-correlacao`; `X-Idempotency-Key` → `x-chave-idempotencia` | Contrato |
| 7 | Env vars | `INTERNAL_SERVICE_KEY` → `CHAVE_SERVICO_INTERNO` | Infra |
| 8 | Prisma fields | `tenant_id` → `id_organizacao` (em 20 schemas) | Banco |

### O que **NÃO** muda (regras invioláveis do Tech Lead)

- ❌ **Nome do schema PostgreSQL físico** (`tenant_<cuid>`) — fica intocado (blindagem schema-per-organização)
- ❌ Glossários "legado → DDD" em `ddd-nomenclatura/SKILL.md` e `9-mandamentos/SKILL.md` (referência histórica)
- ❌ IDs de sistemas externos (`clerk_user_id`, `stripe_customer_id`) — REGRA 4
- ❌ `multi-tenant`/`multitenancy` (termo de arquitetura industrial)
- ❌ Headers RFC universais (`Authorization`, `Content-Type`)

### O que **eu (Claude) NÃO executo**

- ❌ `prisma migrate dev` / `prisma migrate deploy` (Tech Lead roda localmente)
- ❌ `prisma generate` (Tech Lead roda)
- ❌ `npm install` após rename de package (Tech Lead roda)
- ❌ Renomear schema PostgreSQL físico

---

## 1. Inventário Matemático (double-checked)

### 1.1 Schemas Prisma com `tenant_id` (fonte da verdade — 20 arquivos)

| Contexto | Arquivos | Caminho |
|---|---|---|
| Configurador | 1 | `configurador/prisma/schema.prisma` |
| Bid Câmbio | 2 | `produto/bid-cambio/server/prisma/{fragment,schema}.prisma` |
| Bid Frete | 2 | `produto/bid-frete/server/prisma/{fragment,schema}.prisma` |
| Financeiro Comex | 2 | `produto/financeiro-comex/server/prisma/{fragment,schema}.prisma` |
| LPCO | 1 | `produto/lpco/server/prisma/fragment.prisma` |
| NF Importação | 2 | `produto/nf-importacao/server/prisma/{fragment,schema}.prisma` |
| Pedido | 2 | `produto/pedido/server/prisma/{fragment,schema}.prisma` |
| Processo | 2 | `produto/processo/server/prisma/{fragment,schema}.prisma` |
| SimulaCusto | 2 | `produto/simula-custo/server/prisma/{fragment,schema}.prisma` |
| Helpdesk (template) | 1 | `servicos-global/produto/helpdesk/prisma/fragment.prisma` |
| API Cockpit | 1 | `servicos-global/tenant/api-cockpit/prisma/fragment.prisma` |
| Conector ERP | 1 | `servicos-global/tenant/conector-erp/prisma/fragment.prisma` |
| Tenant base | 1 | `servicos-global/tenant/prisma/base.prisma` |
| **TOTAL** | **20** | |

> Excluídos: `*/generated/*`, `*/node_modules/*` (regenerados via `prisma generate`).

### 1.2 RLS Policies (5 arquivos)

```
configurador/prisma/rls-policies.sql
produto/bid-frete/server/prisma/rls-policies.sql
produto/processo/server/prisma/rls-policies.sql
produto/simula-custo/server/prisma/rls-policies.sql
servicos-global/tenant/prisma/rls-policies.sql
```

### 1.3 Código TypeScript

| Padrão | Arquivos afetados | Total ocorrências |
|---|---|---|
| `x-internal-key` (header) | 111 | 440 |
| `x-tenant-id` (header) | 94 | (estimativa ~250) |
| `x-correlation-id` (header) | 40 | 72 |
| `X-Idempotency-Key` (header) | 3 | 11 |
| `INTERNAL_SERVICE_KEY` (env) | 98 | (estimativa ~200) |
| `@gravity/tenant-resolver` (import) | 31 (8 SDK + 23 consumidores) | 31 |
| `withTenant(` (função) | 22 | (estimativa ~50) |
| `withTenantContext(` (função) | 2 | 2 |
| `withTenantIsolation` (middleware antigo) | 15 | (estimativa ~30) |
| `TenantContext` (tipo) | 30 | (estimativa ~60) |
| `TenantDatabase` (tipo) | 4 | (estimativa ~10) |
| `TenantProvisioned` (evento) | 1 | 1 |
| `req.tenant.*` (acesso ao SDK) | 21 | 97 |

### 1.4 Distribuição por contexto (`x-internal-key` como proxy)

| Contexto | Arquivos | % do total |
|---|---|---|
| Configurador | 14 | 12.6% |
| Pedido | 15 | 13.5% |
| Cadastros | 7 | 6.3% |
| Bid Frete | 6 | 5.4% |
| Notificações | 5 | 4.5% |
| Processo | 5 | 4.5% |
| Bid Câmbio | 5 | 4.5% |
| Histórico Global | 4 | 3.6% |
| NF Importação | 4 | 3.6% |
| Demais (15+ contextos) | 46 | 41.5% |

### 1.5 Infraestrutura

- **Workspaces npm**: 25+ no `package.json` raiz
- **Package alvo**: `packages/tenant-resolver/package.json` (a ser renomeado)
- **Consumidor explícito**: `produto/pedido/server/package.json` (declara `@gravity/tenant-resolver`)
- **CI**: 3 workflows (`ci.yml`, `deploy.yml`, `security.yml`)
- **Dockerfiles**: 1 (`testes/cron-runner/Dockerfile`)
- **Env files**: 20+ (.env, .env.local, .env.example por contexto)
- **contracts.json**: `servicos-global/contracts.json` (sem refs diretas a tenant)

---

## 2. Impacto de Infraestrutura (Fase 1)

### 2.1 Renomear o Pacote SDK

**Arquivo `packages/tenant-resolver/package.json`:**
```diff
- "name": "@gravity/tenant-resolver",
+ "name": "@gravity/resolver-organizacao",
```

**Renomear pasta física**: `packages/tenant-resolver/` → `packages/resolver-organizacao/`
> ⚠️ **Tech Lead executa** o `mv` ou `git mv`. Eu apenas atualizo conteúdo.

**Arquivo `package.json` raiz** (workspaces):
```diff
  "workspaces": [
-   "packages/tenant-resolver",
+   "packages/resolver-organizacao",
    ...
  ]
```

**Consumidor `produto/pedido/server/package.json`:**
```diff
- "@gravity/tenant-resolver": "*",
+ "@gravity/resolver-organizacao": "*",
```

**Após rename**: Tech Lead roda `npm install` para reescrever symlinks em `node_modules`.

### 2.2 CI/CD (`.github/workflows/`)

Arquivos a verificar/ajustar:
- `ci.yml` — nada usa `tenant-resolver` por nome no que vi; verificar `INTERNAL_SERVICE_KEY` (referenciado em comentário como `INTERNAL_API_KEY` — auditar)
- `deploy.yml` — verificar refs a env vars
- `security.yml` — verificar refs

**Ação**: grep dirigido depois da Fase 1 para confirmar zero refs órfãs.

### 2.3 Dockerfiles

`testes/cron-runner/Dockerfile` — verificar:
- `ENV INTERNAL_SERVICE_KEY=...` → renomear para `CHAVE_SERVICO_INTERNO`
- Nenhum `npm install @gravity/tenant-resolver` direto (deps via workspace)

### 2.4 Env files (20+ arquivos)

Todos os `.env`, `.env.local`, `.env.example`:
```diff
- INTERNAL_SERVICE_KEY=xxxxx
+ CHAVE_SERVICO_INTERNO=xxxxx
```

> ⚠️ **Tech Lead deve ler/atualizar `.env` reais** (não versionados). Eu atualizo apenas `.env.example` e código.

### 2.5 contracts.json

Verificação rápida em `servicos-global/contracts.json` — atualmente sem refs a `tenant`. Confirmar antes da Fase 2.

---

## 3. Impacto de Banco (por Contexto)

### 3.1 Estratégia de rename Prisma

**Para cada schema/fragment:**

```diff
  model SuaEntidade {
    id           String  @id @default(cuid())
-   tenant_id    String
+   id_organizacao String
    nome         String
    ...

-   @@index([tenant_id])
+   @@index([id_organizacao])
-   @@index([tenant_id, status])
+   @@index([id_organizacao, status])
  }
```

**Sem `@map`** (a coluna PG também passa a chamar `id_organizacao` — paridade Prisma↔PG, conforme REGRA 2 do `ddd-nomenclatura`).

### 3.2 Como evitar quebrar relações

Toda relação que referencia `tenant_id` por nome explícito precisa ser atualizada. Exemplo:

```diff
  model Reserva {
    id        String @id @default(cuid())
-   tenant_id String
+   id_organizacao String
    slot_id   String

-   slot Slot @relation(fields: [slot_id], references: [id], onDelete: Cascade)
+   slot Slot @relation(fields: [slot_id], references: [id], onDelete: Cascade)
    // Relação não muda — refere-se a slot_id, não tenant_id
  }
```

> Em todos os 20 schemas, `tenant_id` é apenas FK lógica para o Configurador (sem `@relation` direta). Renomear o nome do campo + índices é seguro.

**Migration esperada (Tech Lead roda):**
```bash
npx prisma migrate dev --name ddd_rename_tenant_id_to_id_organizacao
```

Migration gerará SQL tipo:
```sql
ALTER TABLE "agenda_usuario" RENAME COLUMN "tenant_id" TO "id_organizacao";
DROP INDEX "agenda_usuario_tenant_id_idx";
CREATE INDEX "agenda_usuario_id_organizacao_idx" ON "agenda_usuario"("id_organizacao");
```

### 3.3 RLS Policies (5 arquivos)

Cada arquivo `rls-policies.sql` referencia `tenant_id` no `USING` clause. Atualizar:

```diff
- CREATE POLICY tenant_isolation ON tabela
-   USING (tenant_id = current_setting('app.current_tenant_id')::text);
+ CREATE POLICY isolamento_organizacao ON tabela
+   USING (id_organizacao = current_setting('app.id_organizacao_atual')::text);
```

> ⚠️ **`current_setting` key** (`app.current_tenant_id`) é configuração PG. Renomeia para `app.id_organizacao_atual` — exige atualização também no SDK que faz `SET LOCAL`.

### 3.4 Não tocar (regra de ouro)

- ❌ Nome físico do schema PG: `tenant_<cuid>` (a "blindagem")
- ❌ `CREATE SCHEMA "tenant_<cuid>"` — comando do worker de provisionamento
- ❌ Função `tenant_<cuid>` em search_path
- ❌ Estrutura de diretórios `servicos-global/tenant/*` (folder physical name)

---

## 4. Sequenciamento por Contexto (Linha de Montagem)

### Princípios

1. **Pacote SDK ANTES de tudo** — ele é dependência transitiva.
2. **Por contexto isolado** — Banco → Back → Front da mesma área no mesmo PR/commit (REGRA 07 sincronia).
3. **Configurador antes de produtos** — produtos consomem `/api/v1/me` do Configurador.
4. **Cada fase = 1 commit atômico**.
5. **Validação obrigatória** após cada fase (typecheck + testes da área).

### Ordem de execução

| Fase | Contexto | Conteúdo | Risco | Dependências |
|---|---|---|---|---|
| **1** | **SDK + Infra** | Renomear pacote, funções, tipos, headers, env vars no SDK; ajustar workspaces, CI, Docker, env files | Alto (atinge tudo) | Nenhuma |
| **2** | **Configurador** | Banco (1 schema) → Back (rotas/services/middleware/scripts) → Front (apiClient, hooks, pages) | Médio | Fase 1 |
| **3** | **Servicos-global tenant (super-servidor)** | `servicos-global/tenant/middleware/*`, `prisma/base.prisma`, RLS | Médio | Fase 2 |
| **4** | **Pedido** | Banco (2 schemas) → Back (16 arquivos) → Front (api.ts) | Alto (heaviest user) | Fase 3 |
| **5** | **Processo + Processos-Core** | Banco (2 schemas) → Back → Front | Médio | Fase 3 |
| **6** | **NF Importação** | Banco (2 schemas) → Back → Front | Médio | Fase 3 |
| **7** | **Demais produtos** | Bid-Câmbio, Bid-Frete, Financeiro-Comex, LPCO, SimulaCusto (Banco → Back → Front cada) | Médio | Fase 3 |
| **8** | **Serviços tenant restantes** | Cadastros, Notificações, Histórico Global, Dashboard, Email, Gabi, Cronômetro, Atividades, NCM-Sync, Preferências, Relatórios, WhatsApp, Conector-ERP, Helpdesk, API-Cockpit, Agendamento | Baixo (já parcialmente feitos nas Ondas 28-37) | Fase 3 |
| **9** | **Testes + Validação Final** | Atualizar todos os testes, rodar suíte completa | Baixo | Tudo anterior |

---

## 5. Detalhamento por Fase

### FASE 1 — SDK + Infraestrutura

**Arquivos no SDK** (`packages/tenant-resolver/src/`):
- `index.ts` — exports públicos
- `types.ts` — `TenantContext`, `TenantDatabase`, etc.
- `middleware.ts` — `tenantResolver`
- `with-tenant.ts` — `withTenant`, `withTenantContext`
- `configurador-client.ts` — chamada para `/api/v1/me`
- `event-bus-listener.ts` — `TenantProvisioned`
- `observability.ts` — logs com `tenantId`
- `cache.ts`, `schema-name.ts`, `internal-prisma.ts`

**Arquivos de infra:**
- `packages/tenant-resolver/package.json` — name field
- `package.json` raiz — workspaces array
- `produto/pedido/server/package.json` — dependency
- `.github/workflows/ci.yml`, `deploy.yml`, `security.yml`
- `testes/cron-runner/Dockerfile`
- 20+ `.env*` files

**Ações específicas:**
1. Renomear pacote: `tenant-resolver` → `resolver-organizacao` (folder + name field)
2. Atualizar workspaces no `package.json` raiz
3. Atualizar dep em `produto/pedido/server/package.json`
4. Renomear todas as funções/tipos/eventos no código fonte do SDK
5. Renomear headers (constantes em `middleware.ts`)
6. Renomear env vars
7. Atualizar `.env.example` files (Tech Lead atualiza `.env` reais)

**Validação:**
- `npx tsc --noEmit -p packages/resolver-organizacao` (após rename)
- Tech Lead roda `npm install` para refazer symlinks
- `npm run build` no SDK

**Commit:** `refactor(sdk): Fase 1 — rename @gravity/tenant-resolver para @gravity/resolver-organizacao + DDD ubíquo`

**Rollback:** `git revert <sha>` + `npm install`

---

### FASE 2 — Configurador (Banco → Back → Front)

**2a. Banco** (1 commit interno ou parte do mesmo):
- `configurador/prisma/schema.prisma`: rename `tenant_id` → `id_organizacao` em todos os models, índices
- `configurador/prisma/rls-policies.sql`: atualizar policies

**2b. Back** (~14 arquivos):
- `servicos-global/configurador/server/middleware/requireAuth.ts`
- `servicos-global/configurador/server/routes/admin.ts`
- `servicos-global/configurador/server/routes/auth.ts`
- `servicos-global/configurador/server/routes/me.ts`
- `servicos-global/configurador/server/routes/users.ts`
- `servicos-global/configurador/server/routes/access.ts`
- `servicos-global/configurador/server/routes/apiCockpit.ts`
- `servicos-global/configurador/server/routes/adminSecurity.ts`
- `servicos-global/configurador/server/routes/adminNcmIntegracao.ts`
- `servicos-global/configurador/server/routes/historicoOrganizacao.ts`
- `servicos-global/configurador/server/services/tenantService.ts` → renomear arquivo para `organizacaoService.ts`
- `servicos-global/configurador/server/services/cadastrosClient.ts`
- `servicos-global/configurador/server/services/hubInsightsService.ts`
- `servicos-global/configurador/server/services/test-notifier.ts`
- `servicos-global/configurador/server/middleware/requireInternalKey.ts`
- `servicos-global/configurador/server/middleware/correlationId.ts`
- `servicos-global/configurador/server/middleware/errorHandler.ts`
- `servicos-global/configurador/server/scripts/bootstrap-seed.ts`
- `servicos-global/configurador/server/scripts/create-user.ts`
- `servicos-global/configurador/server/queue/gabiQuotaResetWorker.ts`
- `servicos-global/configurador/server/__tests__/*.ts`

**2c. Front** (~2 arquivos + componentes):
- `servicos-global/configurador/src/services/apiClient.ts`
- `servicos-global/configurador/src/components/GabiOnboardingWidget.tsx`
- `servicos-global/configurador/src/pages/admin/ProdutosGravityAdmin.tsx`
- `servicos-global/configurador/src/pages/admin/VisaoGeralAdmin.tsx`
- `servicos-global/configurador/src/pages/workspace/Organizacao.tsx`

**Renames aplicados:** dimensões 2-7 (não toca em `tenant_id` schema sozinho — vai junto).

**Validação:**
- `npx tsc --noEmit -p servicos-global/configurador`
- Rodar testes: `npm run test:configurador`
- Manual: subir Configurador localmente, fazer login, verificar `/api/v1/me`

**Commit:** `refactor(configurador): Fase 2 — DDD ubíquo (banco + back + front)`

**Tech Lead executa:**
```bash
cd configurador && npx prisma migrate dev --name ddd_id_organizacao
npx prisma generate
```

---

### FASE 3 — Super-servidor Tenant

**Arquivos:**
- `servicos-global/tenant/prisma/base.prisma` — rename `tenant_id` → `id_organizacao`
- `servicos-global/tenant/prisma/rls-policies.sql`
- `servicos-global/tenant/middleware/*` (auth, correlation, withInternalKeyValidation, withTenantIsolation, apiObservability, logger, rateLimiter)
- `servicos-global/tenant/server/index.ts`
- `servicos-global/tenant/src/lib/prisma-tenant.ts`

**Commit:** `refactor(tenant-base): Fase 3 — middleware e base prisma`

**Tech Lead executa:** migration global do tenant base.

---

### FASE 4 — Pedido (heaviest user, ~24 arquivos código)

**4a. Banco**: `produto/pedido/server/prisma/{fragment,schema}.prisma`

**4b. Back** (~22 arquivos): todos em `produto/pedido/server/src/`
- `index.ts`, `routes/*` (todos), `services/*`, `middleware/*`, `shared/*`, `prisma/seed.ts`, `scripts/*`

**4c. Front** (`produto/pedido/client/src/`): `shared/api.ts`, `pages/ListaPedidos.tsx`, `hooks/useTrackBehavior.ts`, `components/SmartImport/*`

**Commit:** `refactor(pedido): Fase 4 — DDD ubíquo (banco + back + front)`

**Tech Lead executa:** migration do Pedido.

---

### FASES 5-8 — Demais produtos e serviços (mesma estrutura)

**Padrão repetido por contexto:**
1. Schema(s) Prisma
2. RLS policy (se houver)
3. Backend (rotas, services, middleware)
4. Frontend (apiClient, components)
5. Testes do contexto
6. 1 commit

**Ordem sugerida** (menor risco primeiro):
- Fase 5: Processo + Processos-Core
- Fase 6: NF Importação
- Fase 7: Bid-Câmbio → Bid-Frete → Financeiro-Comex → LPCO → SimulaCusto
- Fase 8: Cadastros → Notificações → Histórico Global → Dashboard → Email → Gabi → Cronômetro → Atividades → NCM-Sync → Preferências → Relatórios → WhatsApp → Conector-ERP → Helpdesk → API-Cockpit → Agendamento

> Muitos serviços tenant nas Ondas 28-37 (commits anteriores) já fizeram parte do trabalho DDD. Auditar antes de cada sub-fase.

---

### FASE 9 — Testes + Validação Final

**Arquivos:**
- `testes/testes-unitarios/*` (todos)
- `testes/testes-funcionais/*` (todos)
- `testes/testes-cross-tenant/*` → renomear pasta para `testes-cross-organizacao/*`
- `testes/cron-runner/Dockerfile`
- `packages/resolver-organizacao/tests/*`

**Validações finais:**
- `npx tsc --noEmit` (raiz)
- `npm run test` (todos os contextos)
- `npm run lint`
- Verificação manual: subir cada serviço localmente

**Commit:** `refactor(testes): Fase 9 — atualização final + validação completa`

---

## 6. Critérios de Sucesso por Fase

Cada fase só é considerada concluída quando:

- [ ] Todos os arquivos da fase foram renomeados (grep retorna zero ocorrências do termo legado no escopo da fase)
- [ ] `npx tsc --noEmit` passa no escopo da fase
- [ ] Tech Lead rodou prisma migrate (se aplicável) e a migration foi aceita
- [ ] Testes da fase passam
- [ ] Manual smoke test: serviço sobe e responde `/health`
- [ ] Commit atômico criado com mensagem padronizada
- [ ] PLANO_REFATORACAO_CODIGO.md tem checkbox marcado para a fase

---

## 7. Plano de Rollback

**Por fase:**
- Cada commit é atômico → `git revert <sha>` desfaz a fase específica.
- Se houver migration aplicada: Tech Lead executa `npx prisma migrate resolve --rolled-back <migration-name>` e gera migration de reversão.

**Geral:**
- Branch `refactor/ddd-ubiquo` separada do `master` durante todo o processo.
- Merge para `master` só após todas as 9 fases validadas.

---

## 8. Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Migration Prisma falha por dado existente | Média | Alto | Tech Lead valida antes de rodar; backup local |
| RLS policy quebrada → vazamento cross-org | Baixa | **Crítico** | Teste cross-org obrigatório na Fase 9 |
| Symlink workspace quebra após rename do pacote | Alta | Médio | `npm install` imediato após Fase 1 |
| Front consome contrato antigo em paralelo | Média | Médio | Sincronia front+back na MESMA fase (REGRA 07) |
| `current_setting('app.current_tenant_id')` em código órfão | Média | Alto | Grep dirigido após Fase 3 |
| Generated files (Prisma client) defasados | Alta | Baixo | Tech Lead roda `prisma generate` após cada fase |
| Knowledge base do Gabi (45 refs) não atualizado | Alta | Baixo (texto, não código) | Fase paralela opcional |

---

## 9. Estimativa de Esforço

| Fase | Arquivos | Complexidade | Tempo estimado |
|---|---|---|---|
| 1 — SDK + Infra | ~30 | Alta (rename de pacote) | 2-3h |
| 2 — Configurador | ~25 | Média | 2h |
| 3 — Super-servidor Tenant | ~10 | Média | 1h |
| 4 — Pedido | ~24 | Alta (heaviest user) | 3h |
| 5 — Processo | ~15 | Média | 1.5h |
| 6 — NF Importação | ~15 | Média | 1.5h |
| 7 — Demais 5 produtos | ~50 | Média | 4h |
| 8 — Serviços tenant | ~50 | Baixa-Média | 3h |
| 9 — Testes | ~40 | Média | 2h |
| **TOTAL** | **~260 arquivos** | — | **~20h** efetivos |

---

## 10. Aguardando Decisões

Antes de iniciar a Fase 1, preciso da sua confirmação em:

1. **Nome do tipo `TenantContext`** — virou `OrganizacaoContext` ou `ContextoOrganizacao`?
2. **Nome do tipo `TenantDatabase`** — virou `BancoOrganizacao` ou `OrganizacaoDatabase`?
3. **`withTenantIsolation` (middleware antigo, 15 arquivos)** — também renomear para `withIsolamentoOrganizacao`?
4. **`current_setting('app.current_tenant_id')`** no PG — renomear key para `app.id_organizacao_atual`?
5. **Pasta `servicos-global/tenant/`** — fica? (afeta imports `@tenant/*` em todo lugar)
6. **`testes-cross-tenant/`** — renomear pasta para `testes-cross-organizacao/`?
7. **Branch dedicada** — crio `refactor/ddd-ubiquo` ou trabalho direto em `master`?

---

## 11. Checklist Geral

- [ ] **Fase 1** — SDK + Infra
- [ ] **Fase 2** — Configurador
- [ ] **Fase 3** — Super-servidor Tenant
- [ ] **Fase 4** — Pedido
- [ ] **Fase 5** — Processo
- [ ] **Fase 6** — NF Importação
- [ ] **Fase 7** — Demais produtos (5)
- [ ] **Fase 8** — Serviços tenant
- [ ] **Fase 9** — Testes + Validação

---

**Status:** ⏸ AGUARDANDO LUZ VERDE DO TECH LEAD para iniciar Fase 1.
