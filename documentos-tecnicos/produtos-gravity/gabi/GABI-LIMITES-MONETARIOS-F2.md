# GABI — Limites monetários (USD) com aviso e bloqueio

> **Entrega:** F2 do API Cockpit Monitor LLM (8 maio 2026)
> **Escopo:** controle financeiro de chamadas LLM, com 3 escopos hierárquicos, aviso por e-mail e bloqueio em runtime.

---

## Visão geral

Permite ao admin Gravity criar **limites monetários em USD** sobre o consumo de IA. Cada limite tem:

- `limite_aviso_usd` — quando atingido, dispara e-mail aos destinatários (não bloqueia uso)
- `limite_bloqueio_usd` — quando atingido, retorna **HTTP 429** em chamadas novas até reset mensal ou ajuste manual
- `destinatarios_email` — lista (até 20) que recebe o aviso

A avaliação considera **gasto MTD (month-to-date)** somando `custo_usd_gabi_log_uso` no schema da org.

---

## Escopos (mais restritivo vence)

| Escopo | Onde mora | Aplicação |
|---|---|---|
| **GLOBAL** | `configurador-db.gabi_limite_monetario_global` (1 cópia) | Atinge soma cross-org de TODAS as organizações ativas |
| **ORGANIZACAO** | `tenant_<cuid>.gabi_limite_monetario` (1 por org) | Atinge soma da própria org (todos os modelos) |
| **MODELO** | mesma tabela acima, mas `modelo` preenchido | Atinge soma da org para 1 modelo específico |

A regra: **MODELO > ORGANIZACAO > GLOBAL**. Em empate de escopo, vence o de menor `limite_bloqueio_usd`.

---

## Modelo de dados

### Configurador-db (`public`)

```prisma
model GabiLimiteMonetarioGlobal {
  id_gabi_limite_monetario_global                  String   @id @default(cuid())
  modelo_gabi_limite_monetario_global              String?  // null = todos os modelos
  limite_aviso_usd_gabi_limite_monetario_global    Decimal  @db.Decimal(12, 2)
  limite_bloqueio_usd_gabi_limite_monetario_global Decimal  @db.Decimal(12, 2)
  destinatarios_email_gabi_limite_monetario_global String[]
  ativo_gabi_limite_monetario_global               Boolean  @default(true)
  data_criacao_gabi_limite_monetario_global        DateTime @default(now())
  data_atualizacao_gabi_limite_monetario_global    DateTime @updatedAt
  // UNIQUE(COALESCE(modelo,'__ALL__')) na migration manual
}

model GabiAlertaEmitidoGlobal {
  // 1 linha por (limite, mes_ref, nivel) — UNIQUE evita e-mail duplicado em multi-instancia
}
```

### Plataforma (`tenant_<cuid>`)

```prisma
model GabiLimiteMonetario {
  id_gabi_limite_monetario             String  @id @default(cuid())
  id_organizacao_gabi_limite_monetario String
  modelo_gabi_limite_monetario         String?
  // ... mesmos campos do GLOBAL
  // UNIQUE(id_organizacao, COALESCE(modelo,'__ALL__')) na migration
}

model GabiAlertaEmitido {
  // espelho per-org do GabiAlertaEmitidoGlobal
}
```

---

## API

### S2S (interno)

| Verbo | Caminho | Onde |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/v1/internal/gabi/limites-globais[/:id]` | Configurador (escopo GLOBAL) |
| GET/POST/PUT/DELETE | `/api/v1/gabi/admin/limites[/:id]` | GABI (escopo ORG/MODELO) |

### Frontend admin (proxy unificado)

```
GET    /api/v1/api-cockpit/admin/llm-limites?id_organizacao=...
POST   /api/v1/api-cockpit/admin/llm-limites           body: { escopo, ... }
PUT    /api/v1/api-cockpit/admin/llm-limites/:id?escopo=...&id_organizacao=...
DELETE /api/v1/api-cockpit/admin/llm-limites/:id?escopo=...&id_organizacao=...
```

O proxy roteia internamente:
- `escopo === 'GLOBAL'` → Configurador (chamada local)
- `escopo === 'ORGANIZACAO' | 'MODELO'` → GABI via S2S

---

## Service de avaliação (cache Redis 3 camadas)

Arquivo: `gabi/server/services/limiteMonetarioService.ts`

| Camada | Chave Redis | TTL |
|---|---|---|
| Limite GLOBAL | `organizacao:__global__:gabi:limite_global:{modelo|all}:{YYYY-MM}` | 300s |
| Limite ORG/MODELO | `organizacao:{idOrg}:gabi:limite_org:{modelo|all}:{YYYY-MM}` | 60s |
| Spend MTD | `organizacao:{idOrg}:gabi:gasto_mtd:{YYYY-MM}` | 60s + invalidação por evento |

**Janela de overshoot** conhecida: até ~60s entre cache miss e próxima invalidação podemos servir gasto desatualizado. v2 substitui por contador atômico Redis (`INCRBY`).

**Sem REDIS_URL** o service degrada para leitura direta no DB com warning — funciona em dev sem Redis.

---

## Hard-block (runtime)

Pontos de gate (ANTES da chamada à LLM):
- `gabi/server/routes/chat.ts` (POST `/api/v1/gabi/chats`)
- `gabi/server/routes/fieldHelp.ts` (POST `/api/v1/gabi/ajuda-campo`)

Comportamento:
1. `avaliarLimite(idOrg, '__pre__')` — usa sentinela para pegar limites de "todos os modelos" (escopo GLOBAL ou ORG)
2. Se `status === 'bloqueio'` → **HTTP 429** com `code: 'LLM_USAGE_LIMIT_REACHED'`
3. Após chamada bem-sucedida → `invalidarCacheGastoMtd(idOrg)` para próxima checagem ler gasto atualizado

**Limitação v1:** limites por MODELO específico só são detectados pelo worker horário, não em tempo real. Em v2, o gate vai consultar pelo modelo realmente usado.

---

## Worker horário

Arquivo: `gabi/server/queue/limite-worker.ts`

Iniciado por `iniciarLimiteWorker()` no `gabi/server/index.ts`. Roda a cada 60min.

Cada ciclo:
1. Lista orgs ativas via `/api/v1/internal/organizacoes`
2. Para cada org: lê limites + spend MTD por modelo, compara, dispara alerta se necessário
3. Para limites GLOBAIS: agrega spend cross-org e compara

**Idempotência:**
- Per-org: `INSERT ... ON CONFLICT ON CONSTRAINT gae_unq_limite_mes_nivel DO NOTHING`. Se `rowCount > 0`, dispara e-mail
- GLOBAL: `Set` em memória (alertasGlobaisEnviados) — restart do worker pode reenviar 1×, aceitável v1. v2 grava em `gabi_alerta_emitido_global` via S2S

E-mail enviado via `POST /api/v1/envios-email` (serviço email da plataforma).

---

## UI

Arquivo: `configurador/src/pages/admin/ModalLimitesMonitorLlm.tsx`

Botão **⚙ Limites** no toolbar do Monitor LLM (admin) abre modal com:
- Lista de limites (TabelaGlobal): Escopo · Modelo · Organização · Aviso · Bloqueio · E-mails · Ativo · Ações
- Form de criar/editar: escopo dropdown, id_organizacao (CUID quando ORG/MODELO), modelo opcional, USD aviso/bloqueio, lista chip de e-mails (até 20), ativo

**v1 limitação UX:** id_organizacao via input texto (CUID). v2 vira dropdown buscando `/api/v1/internal/organizacoes`.

---

## Aplicação de migrations

```bash
# Configurador-db
cd configurador
CONFIGURADOR_DATABASE_URL=... npx prisma migrate deploy

# Plataforma (todos os tenants)
# (script migrate-all-tenants.ts está com nomenclatura legada — usar fallback manual em dev)
ORGANIZACAO_DATABASE_URL=... CONFIGURADOR_DATABASE_URL=... npx tsx scripts/ativamente/migrate-all-tenants.ts --product=tenant
```

Migrations criadas:
- `configurador/prisma/migrations/20260508120000_gabi_limites_monetarios_global/`
- `servicos-global/servicos-plataforma/prisma/migrations/20260508120100_gabi_limites_monetarios/`

---

## Dívidas técnicas registradas

1. **`migrate-all-tenants.ts` desatualizado** — usa `"Tenant"`, `id`, `name`, `status`, `created_at`. Precisa virar `organizacao`, `id_organizacao`, etc. Bloqueia migrations cross-tenant. Workaround usado em dev: script `_apply_tenant_migration.cjs` (descartado após uso).
2. **Migrations órfãs no `_prisma_migrations`** — alguém aplica SQL via psql + aborta `migrate dev`, deixando linhas com `finished_at NULL`. Resolver com `prisma migrate resolve --applied` quando necessário.
3. **Pasta `configurador/prisma/migrations/manual/`** movida para `configurador/prisma/sql-manual/` — Prisma confundia com migration.
4. **Janela de overshoot do hard-block** — até ~60s entre cache miss e invalidação. v2 substitui por `INCRBY` Redis atômico.
5. **Limite por modelo no gate runtime** — v1 só checa "todos os modelos". v2 precisa do nome do modelo no gate.
6. **GLOBAL alerta sem persistência DB** — `Set` em memória; v2 grava em `gabi_alerta_emitido_global` via S2S.
7. **`gabi_log_uso.custo_usd` é Float** — financeiramente correto seria Decimal. Limites já são Decimal; comparação tolerante (`>=` em number).
