# Gravity — Modelo de Permissões de Usuário

---
name: antigravity-permissoes
description: "Use esta skill sempre que uma tarefa envolver permissões de usuário — definição de roles, criação de telas de gestão de usuários, middleware de autorização, permissões granulares por produto, ou qualquer lógica de acesso. Define as duas cadeias de permissão do Gravity: Cadeia 1 (roles globais) e Cadeia 2 (permissões granulares por produto)."
---

## As Duas Cadeias de Permissão

O Gravity opera com **duas cadeias independentes e complementares** de controle de acesso:

| Cadeia | Escopo | Quem define |
|:---|:---|:---|
| **Cadeia 1 — Roles Globais** | Quem o usuário é na plataforma | Sistema / Super Admin |
| **Cadeia 2 — Permissões de Produto** | O que o usuário pode fazer em cada produto | Master da Organização |

---

## Cadeia 1 — Roles Globais

### Visão Geral

```
Gravity (equipe interna)
├── Super Admin      ← acesso total irrestrito
└── Admin            ← acesso total, edição conforme permissões do Super Admin

Cliente (Organização / Tenant)
├── Master           ← acesso total à sua organização
├── Standard         ← acesso conforme permissões do Master
└── Fornecedor       ← acesso conforme permissões do Master (tipo especial)
```

---

### Role: Super Admin

- **Pertence a:** equipe Gravity (interno)
- **Acesso:** irrestrito — pode ver e editar absolutamente tudo
- **Escopo:** Admin Panel, Configurador, todos os tenants, todos os produtos, todos os workspaces
- **Restrições:** nenhuma
- **Quem atribui:** sistema (seed de banco) — não é possível criar via UI

```typescript
// Verificação de Super Admin
if (user.role === 'super_admin') {
  return { allowed: true, reason: 'Super Admin — acesso irrestrito' }
}
```

---

### Role: Admin

- **Pertence a:** equipe Gravity (interno)
- **Acesso padrão:** pode **visualizar** tudo (Admin Panel, Configurador, todos os clientes e produtos)
- **Edição:** somente onde o Super Admin concedeu permissão explícita
- **Escopo:** Admin Panel, Configurador, todos os tenants, todos os produtos
- **Quem atribui:** Super Admin via painel Admin

```typescript
// Admin pode ver tudo, mas editar só com permissão explícita
if (user.role === 'admin') {
  if (action === 'READ') return { allowed: true }
  // Para WRITE/DELETE/MANAGE: verificar permissão explícita
  const hasPermission = await checkGravityAdminPermission(userId, resource, action)
  return { allowed: hasPermission }
}
```

---

### Role: Master

- **Pertence a:** cliente (organização / tenant)
- **Acesso:** total dentro da sua organização
- **Escopo:** Configurador da organização, todas as Empresas da organização, todos os produtos contratados
- **Pode:** convidar usuários, habilitar usuários em Empresas, definir permissões de Standard e Fornecedor
- **Restrições:** não acessa dados de outras organizações; não acessa o Admin Panel da Gravity
- **Quem atribui:** sistema (primeiro usuário da organização é sempre Master)

---

### Role: Standard

- **Pertence a:** cliente (organização / tenant)
- **Acesso:** conforme permissões definidas pelo Master
- **Escopo:** apenas as Empresas onde foi habilitado, apenas os produtos para os quais tem permissão
- **Restrições:** não pode gerir outros usuários (a menos que tenha permissão explícita do Master)
- **Quem atribui:** Master da organização

---

### Role: Fornecedor

- **Pertence a:** cliente (organização / tenant) — tipo especial para acesso externo
- **Acesso:** conforme permissões definidas pelo Master — **permissões granulares são obrigatórias** (nunca acesso amplo)
- **Escopo:** apenas os recursos explicitamente liberados
- **Característica especial:** pode ter vínculos com múltiplas organizações (cross-tenant) com e-mail único
- **Quem atribui:** Master da organização

```prisma
// Acesso de fornecedor a múltiplos tenants
// company_id NÃO é nullable — acesso global nunca é representado por FK null
// O acesso a todas as Empresas é feito via Bulk Insert explícito no convite
model AcessoFornecedorTenant {
  id         String @id @default(cuid())
  user_id    String   // id Prisma do Usuario (não clerkId)
  tenant_id  String
  company_id String   // Empresa específica — obrigatório
  status     String @default("active")
  created_at DateTime @default(now())

  @@unique([user_id, tenant_id, company_id])
  @@index([user_id])
  @@index([tenant_id])
  @@index([tenant_id, company_id])
}
```

---

### Tabela Comparativa — Cadeia 1

| Capacidade | Super Admin | Admin | Master | Standard | Fornecedor |
|:---|:---:|:---:|:---:|:---:|:---:|
| Acessa Admin Panel (Gravity) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edita Admin Panel | ✅ | ⚠️ perm | ❌ | ❌ | ❌ |
| Acessa Configurador | ✅ | ✅ | ✅ (próprio) | ❌ | ❌ |
| Vê todos os tenants | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gerencia Empresas | ✅ | ⚠️ perm | ✅ (próprias) | ❌ | ❌ |
| Convida usuários | ✅ | ⚠️ perm | ✅ | ❌ | ❌ |
| Define permissões | ✅ | ⚠️ perm | ✅ | ❌ | ❌ |
| Acessa produtos contratados | ✅ | ✅ | ✅ | ⚠️ perm | ⚠️ perm |
| Acesso cross-tenant | ✅ | ✅ | ❌ | ❌ | ✅ (vinculado) |

> ⚠️ perm = somente com permissão explícita concedida

---

## Cadeia 2 — Permissões Granulares por Produto

### Princípio

Cada produto criado no Gravity expõe um **conjunto padrão de permissões granulares**. O Master da organização atribui essas permissões para usuários Standard e Fornecedor.

**Usuários Master têm acesso total a todas as permissões** — as granulares não se aplicam à role Master.

---

### Módulos com Permissão de Acesso e/ou Edição (padrão de todo produto)

Cada módulo abaixo tem duas permissões distintas:

| Permissão | Código | O que permite |
|:---|:---|:---|
| Acesso | `READ` | Ver / consultar o módulo |
| Edição | `WRITE` | Criar, editar, executar ações no módulo |

---

#### Módulos Universais (presentes em todo produto)

| Módulo | Permissão READ | Permissão WRITE | Descrição |
|:---|:---|:---|:---|
| **Minhas Atividades** | `atividades:read` | `atividades:write` | Ver e criar atividades/tarefas |
| **Email** | `email:read` | `email:write` | Ver histórico de e-mails e enviar |
| **WhatsApp** | `whatsapp:read` | `whatsapp:write` | Ver conversas e enviar mensagens |
| **Relatórios** | `relatorios:read` | `relatorios:write` | Ver relatórios e gerar novos |
| **Gabi (IA)** | `gabi:read` | `gabi:write` | Consultar e interagir com a IA |

---

#### Módulos de Produto (específicos por produto)

Cada produto registra suas próprias permissões ao ser criado. Exemplos:

**SimulaCusto (Estimativa de Custo DUIMP):**

| Módulo | Permissão READ | Permissão WRITE | Descrição |
|:---|:---|:---|:---|
| Estimativa de Custo | `simulacusto:read` | `simulacusto:write` | Ver simulações e criar novas |
| DUIMP | `duimp:read` | `duimp:write` | Consultar e gerar declarações |

**NF Importação (Nota Fiscal):**

| Módulo | Permissão READ | Permissão WRITE | Descrição |
|:---|:---|:---|:---|
| Nota Fiscal | `nf:read` | `nf:write` | Consultar e emitir notas fiscais |

---

### Como Registrar Permissões de um Produto

Cada produto define suas permissões em um arquivo `permissions.ts` dentro do produto:

```typescript
// produtos/simulacusto/server/config/permissions.ts
export const PRODUCT_PERMISSIONS = [
  // Módulos universais (copiados para todo produto)
  { key: 'atividades:read',   label: 'Ver Atividades',        group: 'Atividades' },
  { key: 'atividades:write',  label: 'Criar/Editar Atividades', group: 'Atividades' },
  { key: 'email:read',        label: 'Ver Emails',             group: 'Email' },
  { key: 'email:write',       label: 'Enviar Emails',          group: 'Email' },
  { key: 'whatsapp:read',     label: 'Ver WhatsApp',           group: 'WhatsApp' },
  { key: 'whatsapp:write',    label: 'Enviar WhatsApp',        group: 'WhatsApp' },
  { key: 'relatorios:read',   label: 'Ver Relatórios',         group: 'Relatórios' },
  { key: 'relatorios:write',  label: 'Gerar Relatórios',       group: 'Relatórios' },
  { key: 'gabi:read',         label: 'Consultar Gabi',         group: 'Gabi IA' },
  { key: 'gabi:write',        label: 'Interagir com Gabi',     group: 'Gabi IA' },

  // Módulos específicos do SimulaCusto
  { key: 'simulacusto:read',  label: 'Ver Simulações',         group: 'SimulaCusto' },
  { key: 'simulacusto:write', label: 'Criar Simulações',       group: 'SimulaCusto' },
  { key: 'duimp:read',        label: 'Consultar DUIMP',        group: 'DUIMP' },
  { key: 'duimp:write',       label: 'Gerar DUIMP',            group: 'DUIMP' },
]
```

---

### Schema Prisma — Permissões

```prisma
// No schema do Configurador

model UsuarioPermissao {
  id          String   @id @default(cuid())
  tenant_id   String
  company_id  String   // Empresa onde se aplica (nunca nullable — ver Regra FK Nullable)
  user_id     String   // id Prisma do Usuario
  product_id  String   // produto ao qual a permissão pertence
  permission  String   // ex: 'email:write', 'simulacusto:read'
  granted_by  String   // id Prisma do Master que concedeu
  created_at  DateTime @default(now())

  @@unique([tenant_id, company_id, user_id, product_id, permission])
  @@index([tenant_id])
  @@index([tenant_id, user_id])
  @@index([tenant_id, company_id, user_id])
}

model PermissaoAdminGravity {
  id          String   @id @default(cuid())
  admin_id    String   // clerk_user_id do Admin Gravity
  resource    String   // ex: 'tenants', 'billing', 'deploy'
  action      String   // 'READ' | 'WRITE' | 'DELETE' | 'MANAGE'
  granted_by  String   // clerk_user_id do Super Admin que concedeu
  created_at  DateTime @default(now())

  @@unique([admin_id, resource, action])
  @@index([admin_id])
}
```

---

## Middleware de Autorização

### Ordem obrigatória de verificação

```typescript
// Verificação em toda rota protegida — ordem importa
// user.id = CUID do Prisma (não o clerkId do Clerk)

async function checkAccess(
  user: { id: string; role: string },
  context: {
    tenantId?: string
    companyId?: string
    productId?: string
    permission?: string  // ex: 'email:write'
    action?: 'READ' | 'WRITE' | 'DELETE' | 'MANAGE'
  }
): Promise<{ allowed: boolean; reason: string }> {

  // 1. Super Admin — acesso irrestrito
  if (user.role === 'SUPER_ADMIN') {
    return { allowed: true, reason: 'super_admin' }
  }

  // 2. Admin Gravity — leitura total, edição com permissão
  if (user.role === 'ADMIN') {
    if (context.action === 'READ') {
      return { allowed: true, reason: 'admin_read' }
    }
    const has = await checkGravityAdminPermission(
      user.id, context.resource, context.action
    )
    return { allowed: has, reason: has ? 'admin_permission' : 'admin_no_write_permission' }
  }

  // 3. Master do tenant — acesso total à sua organização
  // Master tem UsuarioWorkspace para cada Empresa (Bulk Insert no convite) — basta verificar tenantId
  if (user.role === 'MASTER') {
    const isMemberOfTenant = await prisma.usuario.findFirst({
      where: { id: user.id, tenant_id: context.tenantId }
    })
    return { allowed: !!isMemberOfTenant, reason: 'master' }
  }

  // 4. Standard e Supplier — verificação granular
  if (user.role === 'STANDARD' || user.role === 'SUPPLIER') {
    if (!context.permission) {
      return { allowed: false, reason: 'missing_permission_key' }
    }
    const has = await checkUserPermission({
      tenantId: context.tenantId,
      companyId: context.companyId,
      userId: user.id,
      productId: context.productId,
      permission: context.permission,
    })
    return { allowed: has, reason: has ? 'user_permission' : 'no_permission' }
  }

  return { allowed: false, reason: 'unknown_role' }
}
```

---

### Enum de Roles — Referência Canônica

```typescript
// shared/types/roles.ts
export const GRAVITY_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',  // Equipe Gravity — acesso total
  ADMIN:       'ADMIN',        // Equipe Gravity — acesso com permissões
} as const

export const TENANT_ROLES = {
  MASTER:      'MASTER',       // Cliente — acesso total na organização
  STANDARD:    'STANDARD',     // Cliente — acesso conforme permissões
  SUPPLIER:    'SUPPLIER',     // Cliente externo — permissões obrigatórias (ex-FORNECEDOR)
} as const

export type GravityRole = typeof GRAVITY_ROLES[keyof typeof GRAVITY_ROLES]
export type TenantRole  = typeof TENANT_ROLES[keyof typeof TENANT_ROLES]
export type UserRole    = GravityRole | TenantRole
```

---

## Regras Críticas

1. **Master nunca recebe verificação granular** — a role Master implica acesso total dentro da sua organização
2. **Fornecedor nunca tem acesso amplo** — sempre requer permissões explícitas
3. **Admin Gravity pode ver tudo** — `READ` não exige permissão explícita para Admin
4. **Super Admin é imutável via UI** — criado apenas via seed do sistema
5. **Permissões são por Empresa (company_id)** — um Standard habilitado na Empresa A não acessa a Empresa B
6. **Produto define suas permissões** — o Configurador não conhece as permissões do produto até o produto as registrar
7. **`permission` vem do token JWT** — nunca do payload da requisição (evitar privilege escalation)
8. **Impersonação (Admin Gravity assumindo sessão de cliente) é logada obrigatoriamente** — ver skill `antigravity-admin`

---

## Fluxo de Habilitação de Usuário em Workspace

```
Master convida Standard para Empresa B
  │
  ├── Sistema cria UsuarioWorkspace (tenant_id + company_id + user_id + role: 'STANDARD')
  │   para cada Empresa selecionada no convite (Bulk Insert — nunca FK nullable)
  │
  └── Master define permissões granulares por produto
        ├── Produto A: email:read, email:write, relatorios:read
        └── Produto B: atividades:read (sem write)

Master é convidado para a organização
  │
  ├── Sistema cria UsuarioWorkspace para CADA Empresa ativa do tenant (Bulk Insert snapshot)
  │   → Master tem acesso imediato a todas as Empresas sem nenhuma FK nullable
  │
  └── Master NÃO passa por verificação granular — tem acesso total à organização
```

---

## Checklist — Antes de Implementar Qualquer Tela de Permissão

- [ ] A role do usuário vem do Prisma via GET /api/v1/me — nunca do JWT Clerk, nunca do body da requisição?
- [ ] Master está com bypass das permissões granulares?
- [ ] Fornecedor tem ao menos uma permissão explícita antes de receber acesso?
- [ ] Admin Gravity consegue ler sem ter permissão explícita de WRITE?
- [ ] Super Admin existe no seed do banco e nunca pode ser criado via API pública?
- [ ] Permissões são indexadas por `[tenant_id, company_id, user_id]`?
- [ ] O produto registrou suas permissões específicas além dos módulos universais?
- [ ] Impersonação de Admin Gravity está sendo logada com `actor_type: 'gravity_admin'`?
- [ ] Master recebe UsuarioWorkspace para TODAS as Empresas via Bulk Insert no convite (sem FK nullable)?
- [ ] user.id nos checks de permissão é o CUID do Prisma — não o clerkId?
