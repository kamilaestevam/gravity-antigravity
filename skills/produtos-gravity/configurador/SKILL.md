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

#### UI de Vinculação — Editor inline na linha expandida (decisão dono 2026-05-05)

A tela `/configurador/usuarios` adota o **padrão Assinaturas** documentado em [criacao-telas](../../ux/criacao-telas/SKILL.md):

- **Master/SAdmin/Admin** — linha expandida exibe panel "Acesso implícito a todos os workspaces" (read-only). Para revogar acesso, alterar `tipo_usuario`.
- **Standard/Fornecedor** — linha expandida exibe editor com checkboxes, multi-select, toggle individual Play/Pause, toolbar Habilitar/Bloquear em massa, Salvar/Descartar com badge de pendentes.
- **Endpoint:** `PUT /api/v1/usuarios/:id_usuario/workspaces` — replace-all atômico. **Aceita array vazio** (revogar todos os vínculos sem alterar tipo do usuário) — Zod afrouxado de `min(1)` → `min(0)` em 2026-05-05. Defesa em camada continua bloqueando MASTER/SAdmin/ADMIN com 400 INVALID_OPERATION.
- **Audit trail** — `securityAudit.permissionChanged` com `acao_permissao: 'GRANTED' | 'REVOKED'` consolidando o diff de adições/remoções no save.
- **Modal `ModalEditarUsuario`** continua existindo como caminho avançado para permissões granulares por produto (não foi removido).

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

## Cadastros — Empresa da org vs Parceiros (entregue 2026-05-25)

> SSOT: [cadastros-arquitetura.md](../../../documentos-tecnicos/produtos-gravity/cadastros/cadastros-arquitetura.md) · Skill: [cadastros/SKILL.md](../cadastros/SKILL.md)

| Conceito | Onde vive | Como o Configurador usa |
|----------|-----------|-------------------------|
| Empresa da **organização** (1:1) | Cadastros.`empresa` + espelho `Organizacao.suid_empresa_organizacao` | Saga onboarding: `POST /api/v1/empresas` via `cadastros-client` |
| **Parceiros** COMEX | Cadastros.`fornecedor` | Tela `/configurador/empresas-e-parceiros` — `GET /fornecedores?escopo=parceiros`, CRUD `/fornecedores` |

**Proxy** (`server/index.ts`): `/api/v1/empresas` e `/api/v1/fornecedores` são rotas **separadas** (sem rewrite). Chave S2S injetada server-side no proxy.

**Saga onboarding** (`organizacao-service.createOrganizacao`): Cadastros primeiro → SUID em `suid_empresa_organizacao` → compensação `compensarEmpresa` se transação local falhar.

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

## Política de Subdomínio (decisão 2026-05-03 — ADR 0002)

**Domínio público:** `usegravity.com.br`. Cada Organização e cada Workspace tem seu próprio subdomínio canônico (`<sub>.usegravity.com.br`) usado em e-mails, integrações, webhooks.

**Regras absolutas:**

1. **Sistema gera, usuário NÃO escolhe.** O frontend deriva um slug do `nome_organizacao`/`nome_workspace`; o backend é a autoridade final.
2. **Unicidade GLOBAL cross-tabela.** Helper `proximoSubdominioDisponivel(base)` em [`organizacaoService.ts`](../../../servicos-global/configurador/server/services/organizacaoService.ts) consulta **ambas** `organizacao.subdominio_organizacao` E `workspace.subdominio_workspace`. Workspace `acme` na Org A bloqueia `acme` em qualquer outra org/workspace.
3. **Auto-suffix em colisão:** `<base>` → `<base>-2` → `<base>-3` → ... (teto 100; esgotou → 409).
4. **Race-safe:** `prisma.create` envolto em try/catch capturando `P2002`; retry externo até 2× (helper já cobre 100 candidatos por chamada).
5. **Imutabilidade pós-criação:** `PATCH /me/workspaces/:id` usa `z.object().strict()` e **rejeita** `subdominio_workspace` no body. URLs em uso dependem dele.
6. **Preview ao vivo:** `GET /api/v1/me/sugestoes-subdominio?base=<slug>` — frontend chama com debounce 400ms via hook `useSugerirSubdominio` e exibe `<sub>.usegravity.com.br` em tempo real durante a digitação do nome. Usuário **vê o subdomínio antes** de clicar Criar.
7. **Transparência:** payload de criação retorna `{ workspace | organizacao, subdominio_solicitado, subdominio_ajustado }`. Quando ajustado, frontend exibe banner amarelo informando.

**`slugifySubdominio(base)`:** lowercase → NFD (remove acentos) → troca `[^a-z0-9-]` por `-` → colapsa repetidos → tira pontas → trunca em 60 chars.

**Endpoints afetados:**
- `POST /api/v1/organizacoes` (onboarding) — saga Cadastros-primeiro; helper resolve antes da chamada Cadastros.
- `POST /api/v1/admin/organizacoes` (admin) — helper + retry P2002.
- `POST /api/v1/me/workspaces` — helper + retry P2002.
- `GET /api/v1/me/sugestoes-subdominio` — preview público para o modal de criação.
- `PATCH /api/v1/me/workspaces/:id` — `strict()` sem subdomínio (imutável).

**Testes:** [`server/__tests__/subdominio.helper.test.ts`](../../../servicos-global/configurador/server/__tests__/subdominio.helper.test.ts) — 11 casos cobrindo slugify, cross-tabela, auto-suffix, teto, edge cases.

**Ver:** [ADR 0002](../../../documentos-tecnicos/decisoes-arquiteturais/0002-subdominio-system-generated-cross-tabela.md) para detalhes da decisão e pareceres.

---

## Porteiro pós-autenticação — Signup / Onboarding (SSOT 2026-05-25)

> **Doc completa + fluxogramas:** [`FLUXO-SIGNUP-ONBOARDING.md`](../../../documentos-tecnicos/produtos-gravity/configurador/FLUXO-SIGNUP-ONBOARDING.md) · Pós-login hub→core: [`FLUXO-POS-LOGIN.md`](../../../documentos-tecnicos/produtos-gravity/configurador/FLUXO-POS-LOGIN.md)

Após sessão Clerk, **nunca** assumir destino `/hub` só por `isSignedIn`. O porteiro consulta **`GET /api/v1/me`**:

| Resultado `/me` | Destino |
|-----------------|---------|
| 401 / sem `organizacao` | `/trial` (Onboarding) |
| 200 + `organizacao` | `/hub` |

**Código SSOT:** `src/routing/destino-pos-autenticacao.ts` (`resolverDestinoPosAutenticacao`) · hook `use-destino-pos-autenticacao.ts` · componente `NavigateDestinoPosAutenticacao.tsx`.

**Aplicado em:** `RootRedirect`, `PublicRoute`, `ProtectedRoute` (`App.tsx`).

**Clerk (alinhado, não substitui):** `signUpFallbackRedirectUrl="/trial"`, `signInFallbackRedirectUrl="/hub"` em `main.tsx`.

**Defesa redundante:** OTP → `navigate('/trial')`; Hub `hub/init` 401 → `/trial`.

**Testes (escopo LOGIN — FONTE PRIMARIA):** plano [`testes/testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.json`](../../../testes/testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.json) · specs em `testes/testes-unitarios/login/`, `testes/testes-funcionais/login/`, `testes/testes-e2e/login/`, `testes/testes-em-tela/login/` · registry `TST-UNI-LOGIN-000001` … `TST-EMT-LOGIN-000001`.

---

## Hub — modal escopo Pedido (PR #80)

Ao clicar **Entrar no Workspace** com Pedido contratado, se o filtro salvo no Pedido difere do workspace selecionado, exibe modal **"Filtro de workspaces no Pedido"**.

| Regra | Detalhe |
|-------|---------|
| SSOT código | `src/utils/pedido-escopo-hub.ts` + `pages/SelecionarWorkspace.tsx` |
| Preferência | Backend `preferencia_usuario_coluna_pedido` primeiro; fallback `sessionStorage` **por org** (`pedido:workspaces_escopo:{id_organizacao}`) |
| Nomes na UI | `GET /api/v1/me/workspaces` — nunca fallback para CUID |
| IDs inválidos | Descartar antes de exibir (`filtrarIdsEscopoWorkspacesValidos`) |
| Cross-tenant | IDs stale de outra org no mesmo browser = cache local enganoso, **não** vazamento de dados |

Doc: [`FILTRO-MULTI-WORKSPACE-TECNICO.md`](../../../documentos-tecnicos/produtos-gravity/pedido/FILTRO-MULTI-WORKSPACE-TECNICO.md) — seção "Persistência do escopo".

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

### /configurador/assinaturas
- Upgrade/Downgrade de planos; Adição de produtos avulsos
- **Tipos de cobrança:** SaaS (mensal), Uso (por item), Setup (taxa única)

### /configurador/financeiro
- Histórico de faturas, Download de Boletos/NF-e

### /gateway
- Rota técnica: Valida permissão → Gera ticket JWT curto → Redireciona para o produto

---

## Variáveis de Ambiente

```bash
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_...        # Diferente entre Development e Production
VITE_CLERK_PUBLISHABLE_KEY=pk_...   # Build arg — embutida no Vite em build time
# Provedor de pagamento: definido pelo dono — Stripe NÃO é mais dependência
CHAVE_INTERNA_SERVICO=...
PORT=8080                           # Railway define automaticamente; local usa 8005
```

---

## Clerk — Instâncias Development vs Production

O Clerk possui **duas instâncias completamente separadas**:

| Instância | Domínio | Uso |
|:---|:---|:---|
| **Development** | `*.clerk.accounts.dev` | Apenas localhost (`http://localhost:*`) |
| **Production** | `clerk.usegravity.com.br` / `accounts.usegravity.com.br` | Domínio público `usegravity.com.br` |

**Chaves são diferentes entre instâncias.** `CLERK_SECRET_KEY` e `VITE_CLERK_PUBLISHABLE_KEY` de Development NÃO funcionam em Production e vice-versa.

### Google OAuth (Production)

- Configurado no Google Cloud Console (projeto: journey-google-meeting)
- Redirect URI: `https://clerk.usegravity.com.br/v1/oauth_callback`
- Client ID e Client Secret configurados no Clerk Dashboard → SSO connections

### DNS do Clerk (Production)

5 registros CNAME obrigatórios no DNS (atualmente no Cloudflare):
- `accounts.usegravity.com.br` → `accounts.clerk.services`
- `clerk.usegravity.com.br` → `frontend-api.clerk.services`
- `clkmail.usegravity.com.br` → `mail.qop3hdfnkx4f.clerk.services`
- `clk._domainkey.usegravity.com.br` → `dkim1.qop3hdfnkx4f.clerk.services`
- `clk2._domainkey.usegravity.com.br` → `dkim2.qop3hdfnkx4f.clerk.services`

---

## CSP (Content Security Policy) — Helmet

O Configurador serve o frontend SPA e precisa de CSP configurada para permitir Clerk, Cloudflare CAPTCHA e Google Fonts.

```typescript
// servicos-global/configurador/server/index.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",
        "https://*.clerk.accounts.dev", "https://clerk.usegravity.com.br",
        "https://*.clerk.com", "https://challenges.cloudflare.com"],
      scriptSrcElem: ["'self'", "'unsafe-inline'",
        "https://*.clerk.accounts.dev", "https://clerk.usegravity.com.br",
        "https://*.clerk.com", "https://challenges.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*.clerk.com", "https://img.clerk.com"],
      connectSrc: ["'self'",
        "https://*.clerk.accounts.dev", "https://clerk.usegravity.com.br",
        "https://*.clerk.com", "https://challenges.cloudflare.com", "ws://localhost:*"],
      frameSrc: ["'self'",
        "https://*.clerk.accounts.dev", "https://clerk.usegravity.com.br",
        "https://accounts.usegravity.com.br", "https://challenges.cloudflare.com"],
      workerSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))
```

> **`scriptSrcElem` obrigatório:** sem ele, o browser usa `script-src` como fallback e pode bloquear scripts do Clerk injetados via `<script>`.
> **`challenges.cloudflare.com` obrigatório:** o Clerk usa Cloudflare Turnstile CAPTCHA em produção.
> **`workerSrc: blob:` obrigatório:** Clerk cria web workers via blob URLs.

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
| `testes/testes-unitarios/configurador/use-carregar-tipo-usuario.test.ts` | Unitário (jsdom) | 17 | `testes/testes-unitarios/configurador/vitest.config.ts` |
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
