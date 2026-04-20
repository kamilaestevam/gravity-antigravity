---
name: antigravity-configurador
description: "Regras de negócio, estrutura de permissões e funcionamento técnico do gateway central da plataforma Gravity. Use esta skill sempre que uma tarefa envolver o Configurador — autenticação, workspace, usuários, planos, billing, permissões ou gateway de redirecionamento."
---

# Gravity — Configurador

## O Que é o Configurador

O Configurador é o **porteiro central** de toda a plataforma Gravity. Todo cliente passa por ele — antes de acessar qualquer produto.

Responsabilidades:
- Autenticação de todos os usuários da plataforma (via Clerk)
- Gestão do Workspace (organização e workspaces)
- Gestão de usuários e permissões no nível tenant
- Assinaturas, planos e billing (via Stripe + boleto)
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
- **Schema Prisma:** `servicos-global/configurador/server/prisma/schema.prisma`

---

## Localização na Árvore

```text
servicos-global/
├── tenant/
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
│   │   ├── auth.ts         ← Clerk webhooks e eventos
│   │   ├── tenants.ts      ← workspace, empresas mãe e filhas
│   │   ├── plans.ts        ← planos e assinaturas
│   │   ├── billing.ts      ← boletos, cartão, NF-e
│   │   └── access.ts       ← verificação de permissões por produto
│   ├── services/
│   │   ├── billing.ts      ← lógica de cobrança
│   │   ├── nfe.ts          ← emissão de nota fiscal
│   │   └── permissions.ts  ← o que cada empresa acessa
│   └── prisma/
│       └── schema.prisma   ← banco próprio do Configurador
└── src/                    ← frontend React
```

---

## Modelo de Usuários e Permissões

> **Skill dedicada:** toda a lógica de permissões está documentada em `antigravity-permissoes`. Leia-a antes de implementar qualquer tela de usuários, middleware de autorização ou lógica de acesso.

### As Duas Cadeias

O Gravity opera com dois sistemas complementares:

1. **Cadeia 1 — Roles Globais:** quem o usuário é (`super_admin`, `admin`, `master`, `standard`, `fornecedor`)
2. **Cadeia 2 — Permissões Granulares:** o que pode fazer dentro de cada produto

### Roles do Sistema (Cadeia 1)

```text
Gravity (equipe interna)
├── super_admin  ← acesso total irrestrito
└── admin        ← visualiza tudo, edita conforme permissões do super_admin

Organização / Tenant (cliente)
├── master       ← acesso total à organização
├── standard     ← acesso conforme permissões do master
└── fornecedor   ← acesso conforme permissões do master (cross-tenant)
```

### Habilitação em Workspace

Para um usuário do tenant trabalhar em um workspace, ele precisa de uma **Habilitação** (`UserMembership`).
- 1 Tenant pode ter múltiplos workspaces (empresas filhas)
- Um `standard` habilitado no workspace A **não acessa** o workspace B
- **Master** tem acesso implícito a todos os workspaces da organização

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

## Modelo Especial — Fornecedor Cross-Tenant

Um fornecedor pode prestar serviços para vários clientes (tenants) da Gravity.
- E-mail único no Clerk
- Múltiplos vínculos de tenant no Configurador
- **Fluxo:** Login → Escolha de Workspace → Acesso ao contexto

```prisma
model SupplierTenantAccess {
  id       String @id @default(cuid())
  clerkId  String
  tenantId String
  status   String @default("active")
  @@unique([clerkId, tenantId])
}
```

---

## Schema Prisma — Entidades Principais

```prisma
model Tenant {
  id        String    @id @default(cuid())
  name      String
  plan      String    @default("trial")
  companies Company[]
}

model Company {
  id        String  @id @default(cuid())
  tenantId  String
  name      String
  subdomain String? @unique
}

model UserMembership {
  id       String @id @default(cuid())
  clerkId  String
  tenantId String
  role     String @default("standard")
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
    tipo_usuario:            string,  // user.role (MASTER, STANDARD, etc.)
    id_organizacao_usuario:  string,  // user.tenantId
    preferred_company_id:    string | null,
  },
  organizacao: {
    id_organizacao:       string,
    nome_organizacao:     string,
    subdominio_organizacao: string,
    status_organizacao:   string,
  },
  workspaces: Array<{ id, nome_workspace, status, tipo_usuario, produtos }>
}
```

**Consumo no frontend:** hook `useMeSync` em `servicos-global/shell/hooks/useMeSync.ts` — busca este endpoint com o Bearer token do Clerk e popula `ShellStore.currentUser` + define `ShellStore.meStatus` (`'idle' → 'loading' → 'success'|'error'`). Se `/me` retornar 401/500 ou lançar exceção, `meStatus` vai para `'error'` e `Layout.tsx` bloqueia o render exibindo tela de erro com retry — **nenhum dado do Clerk é exibido sem confirmação do backend**. Todo produto chama `useMeSync()` no `App.tsx` standalone.

**`injectTenantGetter` / `injectUserNameGetter`:** padrão em produtos (`pedido`, `processo`, etc.) para ler Zustand sincronamente no momento de cada request HTTP — elimina race conditions de Clerk refresh.

---

## APIs Disponíveis

### APIs Públicas (Clerk Auth)
- **`GET /api/v1/me`** — **identidade canônica** — retorna usuario + organizacao + workspaces (DDD)
- `POST /api/v1/tenant` — criar tenant
- `GET /api/v1/companies` — listar workspaces
- `GET /api/v1/users` — listar usuários
- `GET /api/v1/plans` — listar planos
- `GET /api/v1/billing/invoices` — histórico de faturas

### APIs Internas (x-internal-key obrigatória)
- `POST /api/internal/validate-session` — valida ticket do gateway
- `GET /api/internal/check-access` — checa acesso ao produto/empresa
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
STRIPE_SECRET_KEY=sk_live_...
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

## Checklist — Antes de Entregar o Configurador

- [ ] Workspace lista workspaces corretamente?
- [ ] Botão "Acessar" redireciona para a URL do produto com token?
- [ ] Clerk webhooks sincronizam usuários e organizações?
- [ ] Convite de usuário dispara e-mail do Clerk?
- [ ] Usuário Master acessa tudo, Standard segue permissões?
- [ ] Download de Boleto/NF-e disponível no financeiro?
- [ ] API `/api/check-access` responde corretamente aos produtos?
- [ ] Fornecedor com múltiplos tenants vê a tela de seleção ao logar?
