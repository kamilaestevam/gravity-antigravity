---
name: antigravity-configurador
description: "Regras de negócio, estrutura de permissões e funcionamento técnico do gateway central da plataforma Gravity. Use esta skill sempre que uma tarefa envolver o Configurador — autenticação (Clerk), workspaces, usuários, planos, billing, permissões ou gateway de redirecionamento."
---

# Gravity — Configurador

## O Que é o Configurador

O Configurador é o **porteiro central** de toda a plataforma Gravity. Todo cliente passa por ele — antes de acessar qualquer produto.

Responsabilidades:
- Autenticação de todos os usuários da plataforma (Clerk — APENAS autenticação; permissões vêm do Prisma via `/api/v1/me` — Mandamento 01)
- Gestão de Organizações e Workspaces
- Gestão de usuários e permissões no nível da organização
- Assinaturas, planos e billing (provedor de pagamento será definido pelo dono; boleto/PIX/cartão — Stripe NÃO é mais dependência da plataforma)
- Emissão de NF-e
- Gateway de redirecionamento para os produtos contratados

> **Princípio:** nenhum produto gerencia login, usuários ou cobrança. Tudo isso é responsabilidade exclusiva do Configurador.

---

## Posição no Ecossistema

```
Marketplace
  | clica "Teste Grátis" ou "Assinar"
  ▼
Configurador (configurador.gravity.com.br)   ← porteiro central
  | cria conta, configura workspace,
  | escolhe produtos, paga, convida usuários
  ▼
Produto contratado (ex: simulador-comex.gravity.com.br)
  | JWT do Clerk já presente — sem novo login
  ▼
Produto valida token via @clerk/backend
```

---

## Características Técnicas

- **Banco próprio:** DB configurador — separado de todos os produtos
- **Servidor próprio:** Express + TypeScript na porta 3000
- **Autenticação:** Clerk vive exclusivamente aqui
- **Sem acesso ao banco de outros produtos** — produtos chamam `/api/check-access`
- **Schema Prisma:** `servicos-global/configurador/prisma/schema.prisma`

---

## Localização na Árvore

```text
servicos-global/
├── organizacao/
├── produto/
├── marketplace/
├── configurador/   ← AQUI
└── devops/
```

---

## Estrutura de Pastas

```text
servicos-global/configurador/
├── server/
│   ├── index.ts
│   ├── routes/
│   │   ├── auth.ts         ← Clerk webhooks (user.created resolve pending_*, user.updated, user.deleted)
│   │   ├── organizacoes.ts ← Organizacao e Workspaces
│   │   ├── users.ts        ← convite, UsuarioWorkspace, memberships
│   │   ├── plans.ts        ← planos e assinaturas
│   │   ├── billing.ts      ← boletos, cartão, NF-e
│   │   └── access.ts       ← verificação de permissões por produto
│   ├── services/
│   │   ├── billing.ts      ← lógica de cobrança
│   │   ├── nfe.ts          ← emissão de nota fiscal
│   │   └── permissions.ts  ← o que cada workspace acessa
│   └── prisma/
│       └── schema.prisma   ← banco próprio do Configurador (INTOCÁVEL — Mandamento 02)
└── src/                    ← frontend React
```

---

## Modelo de Usuários e Permissões

> **Skill dedicada:** toda a lógica de permissões está documentada em `antigravity-permissoes`. Leia-a antes de implementar qualquer tela de usuários, middleware de autorização ou lógica de acesso.

### As Duas Cadeias

O Gravity opera com dois sistemas complementares:

1. **Cadeia 1 — `tipo_usuario` Global:** quem o usuário é (`SUPER_ADMIN`, `ADMIN`, `MASTER`, `STANDARD`, `SUPPLIER`)
2. **Cadeia 2 — Permissões Granulares:** o que pode fazer dentro de cada produto

### `tipo_usuario` do Sistema (Cadeia 1)

```text
Gravity (equipe interna — gravity_admin = true)
├── SUPER_ADMIN     ← acesso total irrestrito
└── ADMIN   ← visualiza tudo, edita conforme permissões do SUPER_ADMIN

Organização (cliente)
├── MASTER     ← acesso total à organização
├── STANDARD   ← acesso conforme permissões do MASTER
└── SUPPLIER   ← acesso conforme permissões do MASTER (cross-organização)
```

> **Mandamento 04:** MASTER, SUPER_ADMIN e ADMIN têm acesso global SEM depender de `UsuarioWorkspace`. STANDARD e SUPPLIER dependem do vínculo explícito.

### Habilitação em Workspace

Para um usuário `STANDARD` ou `SUPPLIER` trabalhar em um Workspace, ele precisa de um **Vínculo** (`UsuarioWorkspace`).
- 1 Organização pode ter múltiplos Workspaces
- Um `STANDARD` com vínculo no Workspace A **não acessa** o Workspace B
- **MASTER** tem acesso a todos os Workspaces da organização SEM `UsuarioWorkspace` (Mandamento 04). O legado de Bulk Insert para MASTER foi removido — acesso é reconhecido pelo `tipo_usuario`, não pelo vínculo.

### Regra Crítica — Permissões Granulares

As permissões granulares dentro de cada produto **só existem após o produto as registrar no Configurador**.

```typescript
const productPermissions = await getProductPermissions(productId)
if (!productPermissions || productPermissions.length === 0) {
  return {
    error: 'Permissões deste produto ainda não foram configuradas.',
    canEdit: false
  }
}
```

---

## Modelo Especial — Fornecedor Cross-Organização

Um fornecedor pode prestar serviços para várias organizações da Gravity.
- E-mail único no Clerk
- Múltiplos vínculos de organização no Configurador
- **Fluxo:** Login → Escolha de Organização/Workspace → Acesso ao contexto

```prisma
// Mandamento 02: schema.prisma é INTOCÁVEL — exemplo abaixo reflete o schema atual em DDD
model SupplierOrganizacaoAccess {
  id              String @id @default(cuid())
  clerkId         String
  id_organizacao  String
  status          String @default("active")
  @@unique([clerkId, id_organizacao])
}
```

---

## Schema Prisma — Entidades Principais

```prisma
// Mandamento 02: schema.prisma é INTOCÁVEL — exemplo reflete o schema atual
// Mandamento 03: nomes DDD em Português — snake_case obrigatório

model Organizacao {
  id          String      @id @default(cuid())
  nome        String
  plano       String      @default("trial")
  workspaces  Workspace[]
}

model Workspace {
  id              String  @id @default(cuid())
  id_organizacao  String
  nome            String
  subdominio      String? @unique
  status          String  @default("ATIVA")
}

model UsuarioWorkspace {
  id              String  @id @default(cuid())
  id_organizacao  String
  id_workspace    String  // FK para Workspace — nunca nullable (Regra FK Nullable Proibida)
  id_usuario      String  // id Prisma do Usuario
  tipo_usuario    String  @default("STANDARD")
  is_active       Boolean @default(true)

  @@index([id_organizacao])
  @@index([id_organizacao, id_workspace])
  @@index([id_organizacao, id_usuario])
}
```

---

## Identidade — Endpoint Canônico (pós-DDD 2026-04-19)

> O Clerk é apenas o **porteiro JWT**. Toda identidade real vem do Prisma via este endpoint.

**`GET /api/v1/me`** (Authorization: Bearer `<clerk_token>`)

Retorna campos com nomes DDD em Português:

```typescript
{
  usuario: {
    id_usuario:              string,  // CUID do User no Prisma
    nome_usuario:            string,  // user.name
    email_usuario:           string,  // user.email
    tipo_usuario:            string,  // MASTER, STANDARD, SUPPLIER, ADMIN, SUPER_ADMIN
    gravity_admin:        boolean,
    id_organizacao_usuario:  string,  // user.id_organizacao
    preferred_workspace_id:  string | null,
  },
  organizacao: {
    id_organizacao:         string,
    nome_organizacao:       string,
    subdominio_organizacao: string,
    status_organizacao:     string,
  },
  workspaces: Array<{ id_workspace, nome_workspace, status, tipo_usuario, produtos }>
}
```

> **Mandamento 06 + 09:** o consumo do `/me` no frontend SEMPRE passa por `meResponseSchema.parse()` (Zod). Sem `z.any()`, sem `.passthrough()`. Renomes de campo são contratos bilaterais — backend e frontend mudam no MESMO commit (Mandamento 07).

**Consumo no frontend:** hook `useMeSync` em `servicos-global/shell/hooks/useMeSync.ts` — busca este endpoint com o Bearer token do Clerk, valida com `meResponseSchema.parse(json)` e popula `ShellStore.currentUser` + define `ShellStore.meStatus` (`'idle' → 'loading' → 'success'|'error'`). Se `/me` retornar 401/500 ou Zod falhar, `meStatus` vai para `'error'` e `Layout.tsx` bloqueia o render exibindo tela de erro com retry — **nenhum dado do Clerk é exibido sem confirmação do backend** (Mandamento 01 + 08). Todo produto chama `useMeSync()` no `App.tsx` standalone.

**`injectOrganizacaoGetter` / `injectUserNameGetter`:** padrão em produtos (`pedido`, `processo`, etc.) para ler Zustand sincronamente no momento de cada request HTTP — elimina race conditions de Clerk refresh.

---

## APIs Disponíveis

### APIs Públicas (Clerk Auth)
- **`GET /api/v1/me`** — **identidade canônica** — retorna usuario + organizacao + workspaces (DDD)
- `POST /api/v1/organizacoes` — criar organização
- `GET /api/v1/workspaces` — listar Workspaces
- `GET /api/v1/users` — listar usuários
- `POST /api/v1/usuarios/invite` — convidar usuário (cria pending_* + vínculos `UsuarioWorkspace` para STANDARD/SUPPLIER)
- `POST /api/v1/usuarios/:id/memberships` — adicionar/remover vínculo de usuário em Workspace
- **`PUT /api/v1/usuarios/:id/workspaces`** — substituir atomicamente os workspaces de um usuário STANDARD/SUPPLIER (requireMasterRole, bloqueia MASTER com 400, IDOR via workspace.findMany com `id_organizacao`, $transaction deleteMany+createMany, audit trail GRANTED/REVOKED)
- `GET /api/v1/plans` — listar planos
- `GET /api/v1/billing/invoices` — histórico de faturas

### APIs Internas (x-chave-interna obrigatória)
- `POST /api/internal/validate-session` — valida ticket do gateway
- `GET /api/internal/check-access` — checa acesso ao produto/workspace
- `GET /api/internal/product-permissions` — busca definições do produto

---

## Assinaturas, Financeiro e Gateway

### /workspace/assinaturas
- Upgrade/Downgrade de planos; Adição de produtos avulsos
- **Tipos de cobrança:** SaaS (mensal), Uso (por item), Setup (taxa única)

### /workspace/financeiro
- Histórico de faturas, Download de Boletos/NF-e

### /gateway
- Rota técnica: Valida permissão → Gera ticket JWT curto → Redireciona para o produto

---

## Variáveis de Ambiente

```bash
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_...
# Provedor de pagamento: definido pelo dono — Stripe NÃO é mais dependência
INTERNAL_SERVICE_KEY=...
PORT=3000
```

---

## Fluxo Completo de um Cliente

1. **DESCOBERTA:** Acessa marketplace
2. **AQUISIÇÃO:** Clica "Assinar", vai para o Configurador
3. **ONBOARDING:** Cria conta, cadastra empresa, paga, convida usuários
4. **ACESSO:** Configurador libera acesso via Gateway

---

## Suites de Teste Existentes (2026-04-20)

| Arquivo | Tipo | Testes | Config |
|---|---|---|---|
| `testes/testes-unitarios/configurador/useLoadSystemRole.test.ts` | Unitário (jsdom) | 17 | `testes/testes-unitarios/configurador/vitest.config.ts` |
| `testes/testes-unitarios/configurador/usuarios/workspaces-put.test.ts` | Unitário (node) | 18 | mesma config |
| `testes/testes-funcionais/configurador/me-contract.test.ts` | Funcional (node) | 7 | `testes/testes-funcionais/configurador/vitest.config.ts` |
| `testes/testes-funcionais/configurador/requireAuth.test.ts` | Funcional (node) | 7 | mesma config |
| `testes/testes-funcionais/configurador/usuarios/workspaces-put.test.ts` | Funcional (node) | 18 | mesma config |

**Rodar unitários:**
```bash
npx vitest run --config testes/testes-unitarios/configurador/vitest.config.ts
```

**Rodar funcionais:**
```bash
npx vitest run --config testes/testes-funcionais/configurador/vitest.config.ts
```

**Cobertura obrigatória:** 70% linhas/funções/branches (thresholds em ambas as configs).

### Padrão de mock nos testes funcionais do Configurador

O Prisma é **mockado** nos testes funcionais do Configurador (não há banco de teste). O middleware `requireAuth` também é mockado para injetar `req.auth` diretamente:

```typescript
const { mockFindUnique } = vi.hoisted(() => ({ mockFindUnique: vi.fn() }))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: { usuario: { findUnique: mockFindUnique, update: vi.fn() } },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req, _res, next) => {
    req['auth'] = { idUsuario: 'usr_test_01', idOrganizacao: 'org_test_01', tipoUsuario: 'MASTER' }
    next()
  },
}))
```

### Armadilha: Importar Schema Zod de Arquivo de Rota

Ao testar um schema Zod exportado de um arquivo de rota (ex: `UpdateWorkspacesSchema` de `users.ts`), o `import` carrega o **módulo inteiro** — incluindo os imports de nível superior como `clerk.ts`, que lança `Error` se `CLERK_SECRET_KEY` não estiver definida.

**Solução:** mockar todos os módulos com side-effects antes do import, mesmo que o teste não use nenhum deles:

```typescript
// ✅ CORRETO — todos os side-effects bloqueados antes do import do schema
vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { invitations: { createInvitation: vi.fn() } },
}))
vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: { usuario: {}, empresa: {}, usuarioWorkspace: {}, $transaction: vi.fn() },
}))
vi.mock('../../../../servicos-global/configurador/server/lib/syncRole.js', () => ({
  syncRoleToClerk: vi.fn(),
}))
vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: { roleChanged: vi.fn(), permissionChanged: vi.fn() },
}))
vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/middleware/requireMasterRole.js', () => ({
  requireMasterRole: vi.fn(),
}))

import { UpdateWorkspacesSchema } from '../../../../servicos-global/configurador/server/routes/users.js'
```

> **Regra:** ao criar plano de teste unitário para qualquer schema exportado de `routes/*.ts`, mapear todos os imports de nível superior desse arquivo e mocká-los.

---

## Checklist — Antes de Entregar o Configurador

- [ ] Workspace lista Workspaces corretamente (somente status ATIVA)?
- [ ] Botão "Acessar" redireciona para a URL do produto com token?
- [ ] Webhook user.created resolve pending_* para clerk_user_id real (não cria organização)?
- [ ] Convite de usuário dispara e-mail do Clerk?
- [ ] Convite de MASTER NÃO cria UsuarioWorkspace (acesso global por `tipo_usuario`, Mandamento 04)?
- [ ] Convite de STANDARD/SUPPLIER cria UsuarioWorkspace apenas nos Workspaces selecionados?
- [ ] Usuário MASTER acessa todos os Workspaces sem vínculo (Mandamento 04), STANDARD segue permissões granulares?
- [ ] Frontend: tela de usuários mostra Workspaces vinculados ao expandir linha (renderExpandido)?
- [ ] Edição de workspaces de usuário existente: `PUT /api/v1/usuarios/:id/workspaces` bloqueia MASTER (400), valida workspaces da organização (IDOR), opera atomicamente ($transaction)?
- [ ] Download de Boleto/NF-e disponível no financeiro?
- [ ] API `/api/check-access` responde corretamente aos produtos?
- [ ] Fornecedor com múltiplas organizações vê a tela de seleção ao logar?
- [ ] **Mandamento 01:** nenhuma rota de autorização lê `publicMetadata.role` do Clerk — sempre via Prisma/`/me`?
- [ ] **Mandamento 06+09:** toda resposta validada com `meResponseSchema.parse()` no front (sem `z.any()`)?
