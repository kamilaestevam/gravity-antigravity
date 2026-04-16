# Checkpoint — Detetive de Tela `/hub` (SelecionarWorkspace)

**Data:** 2026-04-15
**Status:** ⏸ Análise completa, fixes **NÃO executados** — pausado aguardando decisão do usuário

---

## Onde paramos

Detetive de Tela rodou nas 8 fases sobre `/hub` (rota que renderiza
`servicos-global/configurador/src/pages/SelecionarWorkspace.tsx`).

Relatório forense foi entregue com **13 achados** categorizados. Nenhum
fix foi executado ainda — paramos no momento da decisão de qual subset
implementar (Opções A/B/C/D).

**Precisa retomar com:**
1. Ler este checkpoint
2. Ler o `SelecionarWorkspace.tsx` se precisar de contexto
3. Decidir qual opção executar (ver seção "Decisão pendente" abaixo)

---

## Contexto crítico (antes de começar qualquer fix)

### Aviso do usuário que precisa ser respeitado
- **Workspaces** vêm espelhados do configurador (via `tenantService.getCompanies`). Não sugerir criar CRUD.
- **Produtos Gravity** vêm espelhados de `/admin/produtos-gravity` (via `prisma.product.findMany`) + Gravity Store. Não sugerir criar CRUD.

### Discrepância importante
Existem 2 componentes com nomes parecidos:
- **`/hub`** → `SelecionarWorkspace.tsx` (1393 linhas — **este é o alvo do detetive**)
- **`/core` (index)** → `Hub.tsx` (548 linhas, com `MOCK_ACTIVITY`/`MOCK_PROCESSES` hardcoded — **outra tela, não é o alvo**)

O screenshot do usuário mostra `/hub` que é `SelecionarWorkspace.tsx`.

### Arquivos-chave para retomar
- `servicos-global/configurador/src/pages/SelecionarWorkspace.tsx:1-1393`
- `servicos-global/configurador/server/routes/hubInit.ts:1-107`
- `servicos-global/configurador/server/routes/me.ts:108-223` (preferences)
- `servicos-global/configurador/server/services/tenantService.ts:131-145` (**onde está a brecha #1**)
- `configurador/prisma/schema.prisma` (models Tenant, Company, User, UserMembership)

### Commits recentes da Hub (NÃO repetir trabalho)
- `1eb1048` — workspace preferido (skip pós-login, unificação da estrela)
- `08ce430` — Hub refatorado, Store atualizada
- `01528ee` — ajuste visual header e logo Hub/Core
- `3ddc266` — redesenho do localizador (HUB centro, CORE intermediário)

---

## Os 13 achados (ordenados por severidade)

### 🔴 CRÍTICO (2)

#### #1 — Cross-tenant data leak: `getCompanies` ignora `UserMembership`
**Arquivo:** `server/services/tenantService.ts:131-145`

```typescript
// ATUAL (vazia metadados de companies sem membership)
async getCompanies(tenantId: string) {
  return prisma.company.findMany({
    where: { tenant_id: tenantId },  // ❌ só filtra por tenant
    select: { id, name, subdomain, cnpj, status, created_at, _count: { memberships } },
  })
}
```

**Exploração:** Um user `STANDARD` vê nome+CNPJ+subdomain de todas as companies
do tenant, mesmo as em que não tem membership.

**⚠️ Decisão pendente antes de fixar:**
- Se a regra é "STANDARD só vê companies com membership" → fix obrigatório
- Se a regra é "STANDARD vê todas, mas só entra nas com acesso" → não é bug

**Fix proposto** (se confirmado como bug):
```typescript
async getCompaniesForUser(tenantId: string, userId: string, role: string) {
  const isAdminOrMaster = ['SUPER_ADMIN', 'ADMIN', 'MASTER'].includes(role)
  return prisma.company.findMany({
    where: {
      tenant_id: tenantId,
      ...(isAdminOrMaster ? {} : {
        memberships: { some: { user_id: userId, is_active: true } }
      }),
    },
    select: { /* ... */ },
    orderBy: { created_at: 'desc' },
  })
}
```

Depois, em `hubInit.ts` passar `req.auth.userId` e `req.auth.role` pra essa função.

---

#### #2 — `GET /api/v1/hub/catalog` sem auth nem rate limit
**Arquivo:** `server/routes/hubInit.ts:18-28`

Endpoint público que retorna catálogo completo. Sem rate limit →
scraping competitivo + amplification.

**Fix:**
```typescript
// em index.ts
app.use('/api/v1/hub/catalog', rateLimitPresets.public())  // 30 req/min
```

---

### 🟠 ALTO (4)

#### #3 — `GET /api/v1/hub/init` sem rate limit
**Arquivo:** `server/index.ts:103`

5 queries paralelas por request, sem rate limit. Aplicar
`rateLimitPresets.internal()` (200 req/min).

```typescript
app.use('/api/v1/hub', rateLimitPresets.internal(), hubRouter)
```

---

#### #4 — Sem audit log de `HUB_ACCESSED`
**Arquivo:** `server/routes/hubInit.ts:35-107`

Cada login passa pelo `hub/init`. Momento mais importante pra auditoria,
e não há `AuditService.log`. Compliance SOC2/LGPD.

**Fix:** fire-and-forget no início do handler:
```typescript
AuditService.log({
  tenant_id: req.auth.tenantId,
  actor_type: 'USER',
  actor_id: req.auth.userId,
  actor_name: req.auth.userId,
  actor_ip: req.ip,
  module: 'hub',
  resource_type: 'Hub',
  action: 'HUB_ACCESSED',
  action_detail: 'Hub inicializado pós-login',
  status: 'SUCCESS',
}).catch(() => { /* fire-and-forget */ })
```

---

#### #5 — Fallback silencioso nos 5 fetchers GABI
**Arquivo:** `SelecionarWorkspace.tsx:626-803`

5 fetches paralelos com `try-catch` que engole erros. Se
`bid-cambio/dashboard` retornar 500, user vê card demo sem saber.

**Fix:** `console.error(err)` + incrementar contador de erros visível.
Mesmo padrão do fix de `/admin/seguranca` (commit `275f2b8`).

---

#### #6 — Race entre "skip pós-login" e "preferred valid"
**Arquivos:** `SelecionarWorkspace.tsx:472-486` + `me.ts:108-149` + `hubInit.ts:53-95`

Lógica de "preferred is still valid" duplicada em 2 lugares. Pode
divergir se company muda de status entre chamadas.

**Fix:** centralizar num helper `isPreferredCompanyValid` e fazer o
`hub/init` também limpar no banco (não só o `me/preferences`).

---

### 🟡 MÉDIO (6)

#### #7 — 6 cards GABI demo sem badge "Preview"
**Arquivo:** `SelecionarWorkspace.tsx:735-784`

Cards hardcoded (`demo-ncm`, `demo-frete`, `demo-lpco`, `demo-cambio`,
`demo-di`, `demo-pedido`) aparecem mesmo sem contrato. User pensa que é dado real.

**Fix:** badge "Preview" ou "Dado de demonstração" nos 6 cards. 5 min.

---

#### #8 — Cards `.sw-ws-card` sem `role="button"` + `onKeyDown`
**Arquivo:** `SelecionarWorkspace.tsx` (cards de workspace)

Acessibilidade. Leitor de tela não anuncia como botão; `Tab+Enter` não
funciona.

---

#### #9 — 5 fetchers GABI sem cache
**Arquivo:** `SelecionarWorkspace.tsx:626-803`

Cada `/hub → /core → /hub` refaz os 5 fetches. Sem `staleTime`.

**Fix:** React Query `staleTime: 60_000` ou `useRef` cache.

---

#### #10 — Fallback legacy `localStorage` do commit `1eb1048`
**Arquivo:** `SelecionarWorkspace.tsx:491-517`

Código de migração antigo que lê `gravity_ws_favorites` do localStorage.
Provavelmente obsoleto. Remover com métrica.

---

#### #11 — Contadores `modulos` derivados no frontend
**Arquivo:** `SelecionarWorkspace.tsx` (não memoizado)

Cálculo de "produtos ativos por workspace" feito filtrando array global.
Ok pra pequeno tamanho, caro com muitos workspaces × produtos.

---

#### #12 — `sessionStorage` pra passar `company_id` para `/core`
**Arquivo:** `SelecionarWorkspace.tsx:1025-1045`

Frágil se user cola URL `/core` em outra aba. Usar React Router state.

---

### 🟢 BAIXO (1)

#### #13 — Busca de workspace é `toLowerCase().includes()` simples
Sem fuzzy, sem highlight. Ok pra 2-3 workspaces, fraco pra 50+.

---

## Decisão pendente (retomar daqui)

Usuário ficou de escolher entre 4 opções:

### Opção A — Só os 2 CRÍTICOs (~17 min)
- #1 `getCompaniesForUser` com filtro de membership
- #2 `rateLimitPresets.public()` em `/hub/catalog`

### Opção B — CRÍTICO + ALTO (~54 min)
- Opção A
- #3 rate limit em `/api/v1/hub`
- #4 audit log `HUB_ACCESSED`
- #5 logging dos fetchers GABI
- #6 centralizar "preferred valid"

### Opção C — Tudo + MÉDIOs (~1h30)
- Opção B
- #7 badge demo
- #8 a11y dos cards
- #9 cache 60s GABI
- #10 remover legacy localStorage

### Opção D — Confirmar escopo do #1 primeiro
Me responder: "STANDARD deve ver só workspaces com membership ativa?"
- Sim → Opção B
- Não → Opção B sem o #1

---

## O que está correto (não mexer)

- Endpoint agregador `GET /hub/init` — 1 round-trip, `Promise.all`, sem N+1 ✓
- Workspace preferido com fallback silencioso (commit `1eb1048`) ✓
- Role canônico lido do banco ✓
- SUPPLIER bloqueado de marcar preferred ✓
- Zero `any` / `@ts-ignore` no SelecionarWorkspace.tsx ✓
- Produtos sugeridos vs contratados separados visualmente ✓
- Skip pós-login com escape hatch `?select=1` ✓

---

## Notas adicionais

### Outra tela que eu quase confundi
O **agent 3** analisou por engano o `Hub.tsx` (`/core` index, não `/hub`).
Os achados dele são válidos mas são **para outra tela**:
- `MOCK_ACTIVITY` + `MOCK_PROCESSES` hardcoded
- 4 KPI cards com valores fake (7 processos, 34 estimativas, 12 NFs, 91% Gabi)
- `.hb-prod-card` sem acessibilidade (divs clickáveis)
- 3 queries redundantes em vez de usar `/hub/init`

**Se o usuário quiser rodar detetive no `/core` separadamente**, tenho esses
achados prontos — só precisa validar. Mas é tela diferente, commit separado.
