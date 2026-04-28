---
name: antigravity-permissoes
description: "Use esta skill sempre que uma tarefa envolver permissões de usuário — definição de tipo_usuario (roles), criação de telas de gestão de usuários, middleware de autorização, permissões granulares por produto, ou qualquer lógica de acesso. Define as duas cadeias de permissão do Gravity: Cadeia 1 (tipo_usuario global) e Cadeia 2 (permissões granulares por produto). Mandamento 01: Clerk APENAS para autenticação; tipo_usuario vem do Prisma via GET /api/v1/me."
---

# Gravity — Modelo de Permissões de Usuário

## As Duas Cadeias de Permissão

O Gravity opera com **duas cadeias independentes e complementares** de controle de acesso:

| Cadeia | Escopo | Quem define |
|:---|:---|:---|
| **Cadeia 1 — `tipo_usuario` Global** | Quem o usuário é na plataforma | Sistema / Super Admin |
| **Cadeia 2 — Permissões de Produto** | O que o usuário pode fazer em cada produto | Master da Organização |

> **Mandamento 01:** Clerk gera o `clerk_user_id` (autenticação). O `tipo_usuario` (autorização) vem **somente** do banco Prisma via `GET /api/v1/me`. PROIBIDO ler `publicMetadata.role` para autorização.

---

## Cadeia 1 — `tipo_usuario` Global

### Visão Geral

```
Gravity (equipe interna)
├── Super Admin      ← acesso total irrestrito (gravity_admin = true)
└── Admin            ← acesso total, edição conforme permissões do Super Admin (gravity_admin = true)

Cliente (Organização)
├── Master           ← acesso total à sua organização
├── Standard         ← acesso conforme permissões do Master
└── Fornecedor       ← acesso conforme permissões do Master (tipo especial)
```

---

### `tipo_usuario`: SUPER_ADMIN

- **Pertence a:** equipe Gravity (interno) — `gravity_admin = true`
- **Acesso:** irrestrito — pode ver e editar absolutamente tudo
- **Escopo:** Admin Panel, Configurador, todas as organizações, todos os produtos, todos os workspaces
- **Restrições:** nenhuma — Mandamento 04: acesso global SEM `UsuarioWorkspace`
- **Quem atribui:** sistema (seed de banco) — não é possível criar via UI

```typescript
// Verificação de Super Admin (lendo tipo_usuario do Prisma via /api/v1/me)
if (usuario.tipo_usuario === 'SUPER_ADMIN') {
  return { allowed: true, reason: 'Super Admin — acesso irrestrito' }
}
```

---

### `tipo_usuario`: ADMIN

- **Pertence a:** equipe Gravity (interno) — `gravity_admin = true`
- **Acesso padrão:** pode **visualizar** tudo (Admin Panel, Configurador, todos os clientes e produtos)
- **Edição:** somente onde o Super Admin concedeu permissão explícita
- **Escopo:** Admin Panel, Configurador, todas as organizações, todos os produtos
- **Quem atribui:** Super Admin via painel Admin

```typescript
// Admin pode ver tudo, mas editar só com permissão explícita
if (usuario.tipo_usuario === 'ADMIN') {
  if (action === 'READ') return { allowed: true }
  // Para WRITE/DELETE/MANAGE: verificar permissão explícita
  const hasPermission = await checkGravityAdminPermission(idUsuario, resource, action)
  return { allowed: hasPermission }
}
```

---

### `tipo_usuario`: MASTER

- **Pertence a:** cliente (organização)
- **Acesso:** total dentro da sua organização
- **Escopo:** Configurador da organização, todos os Workspaces da organização, todos os produtos contratados
- **Pode:** convidar usuários, habilitar usuários em Workspaces, definir permissões de Standard e Fornecedor
- **Restrições:** não acessa dados de outras organizações; não acessa o Admin Panel da Gravity
- **Quem atribui:** sistema (primeiro usuário da organização é sempre Master)

---

### `tipo_usuario`: STANDARD

- **Pertence a:** cliente (organização)
- **Acesso:** conforme permissões definidas pelo Master
- **Escopo:** apenas os Workspaces onde foi habilitado, apenas os produtos para os quais tem permissão
- **Restrições:** não pode gerir outros usuários (a menos que tenha permissão explícita do Master)
- **Quem atribui:** Master da organização

---

### `tipo_usuario`: SUPPLIER (Fornecedor)

- **Pertence a:** cliente (organização) — tipo especial para acesso externo
- **Acesso:** conforme permissões definidas pelo Master — **permissões granulares são obrigatórias** (nunca acesso amplo)
- **Escopo:** apenas os recursos explicitamente liberados
- **Característica especial:** pode ter vínculos com múltiplas organizações (cross-organização) com e-mail único
- **Quem atribui:** Master da organização

```prisma
// Acesso de fornecedor a múltiplas organizações
// id_workspace NÃO é nullable — acesso global nunca é representado por FK null
// O acesso a todos os Workspaces é feito via Bulk Insert explícito no convite
model AcessoFornecedorOrganizacao {
  id              String @id @default(cuid())
  id_usuario      String   // CUID do Usuario (não clerkId)
  id_organizacao  String
  id_workspace    String   // Workspace específico — obrigatório
  status          String @default("active")
  created_at      DateTime @default(now())

  @@unique([id_usuario, id_organizacao, id_workspace])
  @@index([id_usuario])
  @@index([id_organizacao])
  @@index([id_organizacao, id_workspace])
}
```

---

### Tabela Comparativa — Cadeia 1

| Capacidade | SUPER_ADMIN | ADMIN | MASTER | STANDARD | SUPPLIER |
|:---|:---:|:---:|:---:|:---:|:---:|
| Acessa Admin Panel (Gravity) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edita Admin Panel | ✅ | ⚠️ perm | ❌ | ❌ | ❌ |
| Acessa Configurador | ✅ | ✅ | ✅ (próprio) | ❌ | ❌ |
| Vê todas as organizações | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gerencia Workspaces | ✅ | ⚠️ perm | ✅ (próprios) | ❌ | ❌ |
| Convida usuários | ✅ | ⚠️ perm | ✅ | ❌ | ❌ |
| Define permissões | ✅ | ⚠️ perm | ✅ | ❌ | ❌ |
| Acessa produtos contratados | ✅ | ✅ | ✅ | ⚠️ perm | ⚠️ perm |
| Acesso cross-organização | ✅ | ✅ | ❌ | ❌ | ✅ (vinculado) |

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
// produto/simula-custo/server/config/permissions.ts
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

> **Mandamento 02:** `schema.prisma` é INTOCÁVEL. Os exemplos abaixo refletem a estrutura atual; adeque o código ao schema, nunca o contrário.

```prisma
// No schema do Configurador

model UsuarioPermissao {
  id              String   @id @default(cuid())
  id_organizacao  String
  id_workspace    String   // Workspace onde se aplica (nunca nullable — ver Regra FK Nullable)
  id_usuario      String   // CUID do Usuario (não clerkId)
  id_produto      String   // produto ao qual a permissão pertence
  permission      String   // ex: 'email:write', 'simulacusto:read'
  granted_by      String   // CUID do Master que concedeu
  created_at      DateTime @default(now())

  @@unique([id_organizacao, id_workspace, id_usuario, id_produto, permission])
  @@index([id_organizacao])
  @@index([id_organizacao, id_usuario])
  @@index([id_organizacao, id_workspace, id_usuario])
}

model PermissaoAdminGravity {
  id          String   @id @default(cuid())
  admin_id    String   // clerk_user_id do Admin Gravity (identificador real do Clerk)
  resource    String   // ex: 'organizacoes', 'billing', 'deploy'
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
// usuario.id = CUID do Prisma (não o clerkId do Clerk)
// usuario.tipo_usuario vem de GET /api/v1/me (Mandamento 01)

async function checkAccess(
  usuario: { id: string; tipo_usuario: string; gravity_admin: boolean },
  context: {
    idOrganizacao?: string
    idWorkspace?: string
    idProduto?: string
    permission?: string  // ex: 'email:write'
    action?: 'READ' | 'WRITE' | 'DELETE' | 'MANAGE'
  }
): Promise<{ allowed: boolean; reason: string }> {

  // 1. Super Admin — acesso irrestrito (Mandamento 04: sem UsuarioWorkspace)
  if (usuario.tipo_usuario === 'SUPER_ADMIN') {
    return { allowed: true, reason: 'super_admin' }
  }

  // 2. Admin Gravity — leitura total, edição com permissão
  if (usuario.tipo_usuario === 'ADMIN') {
    if (context.action === 'READ') {
      return { allowed: true, reason: 'admin_read' }
    }
    const has = await checkGravityAdminPermission(
      usuario.id, context.resource, context.action
    )
    return { allowed: has, reason: has ? 'admin_permission' : 'admin_no_write_permission' }
  }

  // 3. Master da organização — acesso total à sua organização
  // Master tem UsuarioWorkspace para cada Workspace (Bulk Insert no convite) — basta verificar id_organizacao
  if (usuario.tipo_usuario === 'MASTER') {
    const isMemberOfOrg = await prisma.usuario.findFirst({
      where: { id: usuario.id, id_organizacao: context.idOrganizacao }
    })
    return { allowed: !!isMemberOfOrg, reason: 'master' }
  }

  // 4. Standard e Supplier — verificação granular (Mandamento 08: sem fallback silencioso)
  if (usuario.tipo_usuario === 'STANDARD' || usuario.tipo_usuario === 'SUPPLIER') {
    if (!context.permission) {
      return { allowed: false, reason: 'missing_permission_key' }
    }
    const has = await checkUserPermission({
      idOrganizacao: context.idOrganizacao,
      idWorkspace: context.idWorkspace,
      idUsuario: usuario.id,
      idProduto: context.idProduto,
      permission: context.permission,
    })
    return { allowed: has, reason: has ? 'user_permission' : 'no_permission' }
  }

  return { allowed: false, reason: 'unknown_tipo_usuario' }
}
```

---

### Enum de `tipo_usuario` — Referência Canônica

```typescript
// shared/types/tipoUsuario.ts
export const GRAVITY_TIPO_USUARIO = {
  SUPER_ADMIN: 'SUPER_ADMIN',  // Equipe Gravity — acesso total (gravity_admin = true)
  ADMIN:       'ADMIN',        // Equipe Gravity — acesso com permissões (gravity_admin = true)
} as const

export const ORG_TIPO_USUARIO = {
  MASTER:      'MASTER',       // Cliente — acesso total na organização
  STANDARD:    'STANDARD',     // Cliente — acesso conforme permissões
  SUPPLIER:    'SUPPLIER',     // Cliente externo — permissões obrigatórias (ex-FORNECEDOR)
} as const

export type GravityTipoUsuario = typeof GRAVITY_TIPO_USUARIO[keyof typeof GRAVITY_TIPO_USUARIO]
export type OrgTipoUsuario     = typeof ORG_TIPO_USUARIO[keyof typeof ORG_TIPO_USUARIO]
export type TipoUsuario        = GravityTipoUsuario | OrgTipoUsuario
```

---

## Regras Críticas

1. **Master nunca recebe verificação granular** — `tipo_usuario === 'MASTER'` implica acesso total dentro da sua organização
2. **Supplier nunca tem acesso amplo** — sempre requer permissões explícitas
3. **Admin Gravity pode ver tudo** — `READ` não exige permissão explícita para Admin
4. **Super Admin é imutável via UI** — criado apenas via seed do sistema
5. **Permissões são por Workspace (`id_workspace`)** — um Standard habilitado no Workspace A não acessa o Workspace B
6. **Produto define suas permissões** — o Configurador não conhece as permissões do produto até o produto as registrar
7. **`tipo_usuario` vem do Prisma via `GET /api/v1/me`** — nunca do `publicMetadata` do Clerk, nunca do payload da requisição (Mandamento 01 + evitar privilege escalation)
8. **Sem fallback silencioso** (Mandamento 08) — `tipo_usuario` ausente = falhar alto, nunca `(data?.x?.y ?? null) as TipoUsuario`
9. **Impersonação (Admin Gravity assumindo sessão de cliente) é logada obrigatoriamente** — ver skill `antigravity-admin`

---

## Fluxo de Habilitação de Usuário em Workspace

```
Master convida Standard para Workspace B
  │
  ├── Sistema cria UsuarioWorkspace (id_organizacao + id_workspace + id_usuario + tipo_usuario: 'STANDARD')
  │   para cada Workspace selecionado no convite (Bulk Insert — nunca FK nullable)
  │
  └── Master define permissões granulares por produto
        ├── Produto A: email:read, email:write, relatorios:read
        └── Produto B: atividades:read (sem write)

Master é convidado para a organização
  │
  ├── Sistema cria UsuarioWorkspace para CADA Workspace ativo da organização (Bulk Insert snapshot)
  │   → Master tem acesso imediato a todos os Workspaces sem nenhuma FK nullable
  │
  └── Master NÃO passa por verificação granular — tem acesso total à organização
```

---

## Edição de Workspaces Pós-Convite

Após o convite, um Master pode alterar quais Workspaces um Standard ou Supplier acessa via:

**`PUT /api/v1/usuarios/:id/workspaces`** (`requireMasterRole`)

### Regras de Negócio

| Regra | Comportamento |
|---|---|
| **Alvo é MASTER** | `400 INVALID_OPERATION` — Master tem acesso implícito via Bulk Insert snapshot; não editar via este endpoint |
| **Usuário não encontrado na organização** | `404 NOT_FOUND` — sem vazar existência |
| **IDs de Workspace de outra organização (IDOR)** | `403 FORBIDDEN` — `workspace.findMany` filtra por `id_organizacao` antes de qualquer escrita |
| **Atomicidade** | `$transaction(deleteMany + createMany)` — nunca estado parcial |
| **Audit trail** | `securityAudit.permissionChanged` com `action: 'GRANTED'` se workspaces adicionados, `'REVOKED'` se apenas removidos |
| **Sem diff** | Se workspaces novos = antigos, `permissionChanged` NÃO é chamado |

### Schema de Validação

```typescript
// Exportado como UpdateWorkspacesSchema para contract testing (Mandamento 09)
z.object({
  workspaces: z.array(z.string().cuid())
    .min(1, 'É necessário pelo menos um workspace')
    .refine(ids => new Set(ids).size === ids.length, 'Workspaces duplicados não são permitidos'),
})
```

### MASTER: Bulk Insert vs. PUT

| Momento | Operação | Por quê |
|---|---|---|
| **Convite (novo usuário Master)** | `Bulk Insert` em todos os Workspaces ativos | Snapshot — Master precisa de acesso imediato e completo |
| **Edição de Master existente** | **PROIBIDO via PUT** — `400 INVALID_OPERATION` | Master tem acesso global via UsuarioWorkspace; redesenhar via invite se necessário |
| **Edição de Standard/Supplier** | `PUT /api/v1/usuarios/:id/workspaces` | Substituição atômica dos vínculos |

---

## Checklist — Antes de Implementar Qualquer Tela de Permissão

- [ ] O `tipo_usuario` vem do Prisma via `GET /api/v1/me` — nunca do `publicMetadata` do Clerk, nunca do body da requisição (Mandamento 01)?
- [ ] Master está com bypass das permissões granulares?
- [ ] Supplier tem ao menos uma permissão explícita antes de receber acesso?
- [ ] Admin Gravity consegue ler sem ter permissão explícita de WRITE?
- [ ] Super Admin existe no seed do banco e nunca pode ser criado via API pública?
- [ ] Permissões são indexadas por `[id_organizacao, id_workspace, id_usuario]`?
- [ ] O produto registrou suas permissões específicas além dos módulos universais?
- [ ] Impersonação de Admin Gravity está sendo logada com `actor_type: 'gravity_admin'`?
- [ ] Master recebe UsuarioWorkspace para TODOS os Workspaces via Bulk Insert no convite (sem FK nullable)?
- [ ] `usuario.id` nos checks de permissão é o CUID do Prisma — não o `clerk_user_id`?
- [ ] Edição de workspaces de Standard/Supplier via PUT rejeita alvos Master (400)?
- [ ] PUT /workspaces valida IDs via `workspace.findMany` com `id_organizacao` antes de escrever (prevenção IDOR)?
- [ ] PUT /workspaces opera via `$transaction` (deleteMany + createMany) — nunca estado parcial?
- [ ] Schema Zod do front (`/api/v1/me`) reflete payload do back no MESMO commit (Mandamento 09)?
- [ ] Sem fallback silencioso de autorização: `(data?.usuario?.tipo_usuario ?? null) as TipoUsuario` é PROIBIDO (Mandamento 08)?
