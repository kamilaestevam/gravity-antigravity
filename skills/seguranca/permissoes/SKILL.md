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
- **Característica especial:** pode ter vínculos com múltiplas organizações (cross-organização) com e-mail único — modelado via `UsuarioWorkspace` (Bulk Insert por Workspace selecionado), exatamente como STANDARD. **Não existe model `AcessoFornecedorOrganizacao` no schema** — vínculo cross-organização vem do conjunto de linhas em `UsuarioWorkspace` referenciando o mesmo `id_usuario` em `id_organizacao` distintos.
- **Quem atribui:** Master da organização

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

Cada produto contratado pela organização (presente em `ProdutoGravityConfiguracao` com `ativo_configuracao_produto_gravity = true`) expõe **6 seções fixas × 2 ações fixas** de permissão granular. O Master atribui essas permissões a usuários `STANDARD` e `FORNECEDOR`.

**Usuários `MASTER`, `SUPER_ADMIN`, `ADMIN` e `gravity_admin = true` têm bypass total** — as granulares não se aplicam (Mandamento 04).

---

### Formato Canônico — `<slug>:<secao>:<acao>` (FONTE ÚNICA DE VERDADE)

> **Decisão arquitetural — 2026-05-04** (aprovada por Líder Técnico + Coordenador):
> Toda string gravada em `UsuarioPermissao.permissao_usuario` segue o formato `<slug_produto>:<secao>:<acao>`.
> Validar com Zod **na escrita** (Mandamento 06). Sem variações, sem prefixos legados.

**Componentes:**

| Componente | Valores válidos | Origem |
|:---|:---|:---|
| `<slug>` | `slug_produto_gravity` da tabela `ProdutoGravity` (ex: `pedido`, `simula-custo`, `bid-frete`, `bid-cambio`, `nf-importacao`) | Banco — `productCatalogService.list()` |
| `<secao>` | `dashboard` \| `kanban` \| `lista` \| `configuracao` \| `relatorios` \| `historico` | **Const fixa** em `permissao-usuario-servico.ts` |
| `<acao>` | `ver` \| `editar` | **Const fixa** em `permissao-usuario-service.ts` |

**Exemplos válidos:** `pedido:dashboard:ver`, `pedido:configuracao:editar`, `simula-custo:lista:ver`

**Schema Zod (compartilhado entre back e front — Mandamento 09):**

```typescript
export const SECOES_PRODUTO = ['dashboard', 'kanban', 'lista', 'configuracao', 'relatorios', 'historico'] as const
export const ACOES_PRODUTO  = ['ver', 'editar'] as const

export const permissaoStringSchema = z.string().regex(
  /^[a-z][a-z0-9-]*:(dashboard|kanban|lista|configuracao|relatorios|historico):(ver|editar)$/,
  'Formato inválido — esperado <slug>:<secao>:<acao>'
)
```

**Cada combinação `(usuario, workspace, produto, "secao:acao")` é uma linha distinta em `UsuarioPermissao`** — isso permite revogar `editar` mantendo `ver` e vice-versa, sem perder histórico via `permissao_usuario_concedido_por`.

---

### Caso especial — `<slug>:historico:ver` (cross-workspace)

> **Decisão arquitetural — 2026-05-07** (aprovada por Líder Técnico + Coordenador):
> A 6ª seção `historico` foi adicionada para gating do hyperlink "Histórico" que cada produto expõe no menu lateral (abre nova aba em `/workspace/historico-organizacao` no Configurador — tela única de auditoria do cliente).
>
> A permissão segue o padrão Cadeia 2 (linha por workspace), mas o **gating de acesso à tela** consulta via `verificarPermissaoEmAlgumWorkspace` — basta UMA linha em qualquer workspace da org pra liberar. Razão: auditoria é cross-workspace por natureza; granularidade fina por workspace seria fricção sem ganho de segurança real.
>
> Comportamento por `tipo_usuario`:
> - `SUPER_ADMIN` / `ADMIN` / `MASTER` → bypass (Mandamento 04). Vê escopo conforme `montarFiltroVisibilidadeHistoricoLog`.
> - `STANDARD` / `FORNECEDOR` sem permissão → **403 FORBIDDEN_PERMISSION**.
> - `STANDARD` / `FORNECEDOR` com permissão → vê apenas seus próprios eventos do produto, cross-workspace.
>
> Implementação: middleware de gating no proxy `/api/v1/historico-organizacao` (Configurador). O frontend `HistoricoOrganizacao.tsx` lê `id_produto_historico_log` da query string e envia ao backend.

---

### Set `PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS`

Nem todo produto do catálogo já tem o sistema de permissões granulares funcionando. O modal de permissões precisa renderizar **opaco "Em breve"** os produtos que ainda não migraram.

```typescript
// servicos-global/configurador/server/services/permissao-usuario-servico.ts
// TODO[ARQ]: migrar para coluna `permissoes_granulares_habilitadas` em ProdutoGravity
// quando houver janela de schema (Mandamento 02 — só Coordenador).
export const PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS = new Set<string>([
  'pedido',  // único produto com 6×2 toggles ativos em 2026-05-07
])
```

**Teste-guardião bloqueante de CI** (`testes/testes-funcionais/configurador/usuarios/permissoes-guarda.test.ts`):

```typescript
it('todo produto no Set tem rotas/middleware reais (não pode entrar no Set sem implementação)', async () => {
  for (const slug of PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS) {
    const temMiddleware = await produtoUsaRequirePermissao(slug)
    expect(temMiddleware, `Produto "${slug}" está no Set mas não usa requirePermissao`).toBe(true)
  }
})

it('produto ATIVO sem permissões implementadas precisa de decisão explícita (proteção contra esquecimento)', async () => {
  const produtosAtivos = await prisma.produtoGravity.findMany({
    where: { status_produto_gravity: 'ATIVO', data_remocao_produto_gravity: null },
    select: { slug_produto_gravity: true }
  })
  const ausentes = produtosAtivos
    .map(p => p.slug_produto_gravity)
    .filter(s => !PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has(s))
  // Lista esperada — atualizar quando produto migrar
  const ausentesEsperados = ['simula-custo', 'bid-frete', 'bid-cambio', 'nf-importacao']
  expect(ausentes.sort()).toEqual(ausentesEsperados.sort())
})
```

**Proibido pular o teste com `.skip` ou `xit`.** O teste é a única defesa contra produto novo entrando ATIVO sem alguém decidir o que fazer com permissões.

---

### Bypass Mandamento 04 — Função Utilitária Única

> **Crítico:** middleware backend, hook frontend e service de leitura DEVEM importar a MESMA função. Duplicar a lógica = bug em uma das pontas.

```typescript
// shared (back+front) — local definitivo a definir no commit
// O conceito "gravity_admin" é equivalente a tipo_usuario IN (SUPER_ADMIN, ADMIN).
// Não existe coluna gravity_admin no schema (Mandamento 02) — é derivado.
export function temBypassPermissao(usuario: { tipo_usuario: UsuarioTipo }): boolean {
  return (
    usuario.tipo_usuario === 'SUPER_ADMIN' ||
    usuario.tipo_usuario === 'ADMIN' ||
    usuario.tipo_usuario === 'MASTER'
  )
}
```

Esquecer qualquer um dos 3 casos prende o usuário em "sem acesso" (regressão do Mandamento 04).

---

### Seções fixas — Aplicam-se a TODOS os produtos

| Seção | `ver` | `editar` |
|:---|:---|:---|
| Dashboard | `<slug>:dashboard:ver` | `<slug>:dashboard:editar` |
| Kanban | `<slug>:kanban:ver` | `<slug>:kanban:editar` |
| Lista | `<slug>:lista:ver` | `<slug>:lista:editar` |
| Configuração * | `<slug>:configuracao:ver` | `<slug>:configuracao:editar` |
| Relatórios | `<slug>:relatorios:ver` | `<slug>:relatorios:editar` |

\* **Configuração**: `MASTER`/`SUPER_ADMIN`/`ADMIN`/`gravity_admin` sempre podem (bypass `temBypassPermissao`). `STANDARD`/`FORNECEDOR` só com toggle marcado explicitamente.

---

### Módulos Universais — HUB e CORE

HUB e CORE são **acessíveis por padrão** a todo usuário autenticado — **sem toggle**. Filtragem natural:

- **HUB**: o usuário só vê os Workspaces aos quais está vinculado em `UsuarioWorkspace` (ou todos, se tem bypass).
- **CORE**: o usuário só vê os dados aos quais tem permissão por seção/produto.

Comunicação (Email/WhatsApp/Gabi) ficou **opaca "Em breve"** no modal — modelagem futura.

---

### Endpoint canônico do catálogo (Mandamento 07 — contratos)

Para listar produtos contratados pela organização logada, **reutilizar** `GET /api/v1/workspaces/:id_workspace/produtos` (em `produto-gravity-workspace.ts`). DTO inclui `slug_produto_gravity` e `status_produto_gravity` para o front decidir entre toggles ativos vs. card opaco "Em breve".

**Não criar rota nova `/produto-gravity/contratados`** — duplicação. Estender o DTO existente se faltar campo. Atualizar `servicos-global/configurador/contracts.json` no MESMO commit (Mandamento 07/09).

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

  // 3. Master da organização — acesso total à sua organização (Mandamento 04)
  // O usuário Master tem acesso global. Ele NÃO precisa e NÃO DEVE ter vínculo
  // na tabela UsuarioWorkspace — basta pertencer à organização.
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

Master é convidado para a organização (Mandamento 04 — acesso global)
  │
  ├── Sistema NÃO cria UsuarioWorkspace para Master — acesso global vem do tipo_usuario
  │   → Master tem acesso imediato a todos os Workspaces sem precisar de vínculo
  │
  └── Master NÃO passa por verificação granular — tem acesso total à organização
```

---

## Edição de Workspaces Pós-Convite

Após o convite, um Master pode alterar quais Workspaces um Standard ou Supplier acessa via:

**`PUT /api/v1/usuarios/:id/workspaces`** (`requireUserManagementRole` desde 2026-05-04 — antes era `requireMasterRole`)

### Regras de Negócio

| Regra | Comportamento |
|---|---|
| **Alvo é MASTER** | `400 INVALID_OPERATION` — Master tem acesso global por `tipo_usuario` (Mandamento 04). Master NÃO tem `UsuarioWorkspace`; não editar via este endpoint |
| **Usuário não encontrado na organização** | `404 NOT_FOUND` — sem vazar existência |
| **IDs de Workspace de outra organização (IDOR)** | `403 FORBIDDEN` — `workspace.findMany` filtra por `id_organizacao` antes de qualquer escrita |
| **Atomicidade** | `$transaction(deleteMany + createMany)` — nunca estado parcial |
| **Array vazio (revogar todos)** | **Aceito** desde 2026-05-05 — Standard/Fornecedor pode existir sem nenhum vínculo. Defesa em camada continua bloqueando MASTER/SAdmin/Admin |
| **Audit trail** | `securityAudit.permissionChanged` com `acao_permissao: 'GRANTED'` se workspaces adicionados, `'REVOKED'` se apenas removidos (inclui o caso "revogar todos") |
| **Sem diff** | Se workspaces novos = antigos, `permissionChanged` NÃO é chamado |

### Schema de Validação

```typescript
// Exportado como SubstituirWorkspacesUsuarioSchema para contract testing (Mandamento 09).
// Sem min(1) — array vazio é estado válido (revogar todos os vínculos sem alterar tipo).
// Defesa em camada (rota linha ~422-428) bloqueia MASTER/SAdmin/Admin com 400.
z.object({
  workspaces: z.array(z.string().cuid())
    .refine(ids => new Set(ids).size === ids.length, 'Workspaces duplicados não são permitidos'),
})
```

### UI de gestão (frontend)

Editor inline na linha expandida — padrão Assinaturas (cânone em [criacao-telas](../../ux/criacao-telas/SKILL.md)). Componente compartilhado [`ExpandidoEditorVinculos`](../../../servicos-global/configurador/src/components/expandido-editor-vinculos/index.tsx) é agnóstico de gating; cada caller calcula `podeEditar` conforme sua superfície:

| Tela | Cálculo de `podeEditar` | Endpoint de carregamento de workspaces |
|---|---|---|
| `/workspace/usuarios` (Configurador) | `usePodeEditarUsuario(alvo).podeAlterarVinculosWorkspace && !ehProprio` | `GET /api/v1/me/workspaces` (org logada) |
| `/admin/usuarios-globais` (Admin Panel) | **Opção α (decisão dono 2026-05-05): `perfilLogado === 'Super Admin'`** — apenas SAdmin edita cross-org. ADMIN visualiza o editor em modo read-only. | `GET /api/v1/admin/organizacoes/:id_organizacao/workspaces` (lazy-load por org do alvo, `requireGravityAdmin`) |

Em ambos os casos, quando `podeEditar=false` o componente renderiza badges sem botões (defesa em profundidade espelhando o backend).

### Cross-org via SUPER_ADMIN

A rota [`PUT /api/v1/usuarios/:id_usuario/workspaces`](../../../servicos-global/configurador/server/routes/usuario.ts) detecta `req.auth.tipo_usuario === 'SUPER_ADMIN'` e omite o filtro `id_organizacao` no `findFirst` do alvo (linhas 410-414). Isso permite ao SAdmin editar vínculos de qualquer org via Admin Panel. Defesas preservadas:

- **`idOrganizacaoAlvo` vem do alvo, não do ator** (`const idOrganizacaoAlvo = usuario.id_organizacao`) — `deleteMany`/`createMany` ficam isolados na org correta
- **Audit trail emitido na org do alvo** — `securityAudit.permissionChanged(idOrganizacaoAlvo, req.auth.id_usuario, ...)`
- **Mand. 04 mantido** — alvo MASTER/SAdmin/ADMIN ainda retorna 400 INVALID_OPERATION mesmo para SAdmin
- **Anti-self-edit mantido** — `id_usuario === req.auth.id_usuario` retorna 403 mesmo para SAdmin

## Edição de patente (`tipo_usuario`)

**`PATCH /api/v1/usuarios/:id_usuario/patente`** (`requireUserManagementRole`)

### Matriz de autorização

| Ator (`req.auth.tipo_usuario`) | Pode editar alvo... | Pode atribuir | Bloqueios |
|---|---|---|---|
| **SUPER_ADMIN** | Qualquer (escopo global) | Qualquer (`SUPER_ADMIN`/`ADMIN`/`MASTER`/`PADRAO`/`FORNECEDOR`) | Anti-escalada (próprio id), anti-bricking |
| **ADMIN** | Qualquer EXCETO `SUPER_ADMIN` | `ADMIN`/`MASTER`/`PADRAO`/`FORNECEDOR` | Não promove a `SUPER_ADMIN`, anti-escalada, anti-bricking |
| **MASTER** | Mesmo `id_organizacao`, EXCETO outros `MASTER`/`SUPER_ADMIN`/`ADMIN` | `MASTER`/`PADRAO`/`FORNECEDOR` (incluindo promover `PADRAO` a `MASTER`) | Anti-escalada, anti-bricking |
| **PADRAO / FORNECEDOR** | Ninguém | — | Bloqueado por `requireUserManagementRole` (`403`) |

### Defesas (server-side)

| Defesa | Implementação | Erro |
|---|---|---|
| **Anti-escalada** | `req.auth.id_usuario === alvo.id_usuario` → bloqueia | `403 FORBIDDEN_SELF_EDIT` |
| **Anti-bricking** | Dentro de `$transaction(isolationLevel: 'Serializable')`: `count(MASTER em id_organizacao do alvo) <= 1` ao rebaixar MASTER → bloqueia | `409 CONFLICT_LAST_MASTER` |
| **IDOR cross-organização** | MASTER/ADMIN: `findFirst({ id_organizacao: req.auth.id_organizacao })`; SUPER_ADMIN: escopo global | `404 NOT_FOUND` (não vaza existência) |
| **Whitelist por ator** | `autorizarAlteracaoPatente()` valida combinação ator×alvo×novoTipo antes de qualquer escrita | `403 FORBIDDEN_<código_específico>` |
| **Auditoria** | `securityAudit.roleChanged(id_organizacao, ator_id, { targetUserId, oldRole, newRole })` após update | log estruturado |

### Códigos de erro específicos

- `FORBIDDEN_SELF_EDIT` — ator editando próprio tipo
- `FORBIDDEN_ADMIN_VS_SUPER_ADMIN` — ADMIN tentando editar SUPER_ADMIN
- `FORBIDDEN_ADMIN_PROMOTE_SUPER_ADMIN` — ADMIN tentando promover a SUPER_ADMIN
- `FORBIDDEN_MASTER_VS_MASTER` — MASTER tentando editar outro MASTER
- `FORBIDDEN_MASTER_VS_GRAVITY` — MASTER tentando editar SUPER_ADMIN/ADMIN
- `FORBIDDEN_MASTER_INVALID_TARGET_TYPE` — MASTER tentando atribuir SUPER_ADMIN/ADMIN
- `CONFLICT_LAST_MASTER` — rebaixaria último MASTER da organização

### Frontend — Hook `usePodeEditarUsuario`

`servicos-global/configurador/src/hooks/use-pode-editar-usuario.ts` replica a matriz para gating de UI (esconder lápis, filtrar select de tipo). **Defesa em profundidade** — backend continua sendo a fonte da verdade.

### Edição de `nome_usuario` / `email_usuario`

Atualmente **read-only** no modal. Não existe endpoint dedicado:
- `nome_usuario`: edição via Clerk (perfil do próprio usuário) ou suporte
- `email_usuario`: credencial de autenticação — fluxo de re-verificação Clerk (Mandamento 01)

PR separado criará `PATCH /api/v1/usuarios/:id_usuario` quando o fluxo de sync com Clerk estiver definido.

---

### MASTER vs. Standard/Supplier — Vínculos com Workspace

| Tipo | Vínculo na tabela `UsuarioWorkspace` | Por quê |
|---|---|---|
| **MASTER** | **Nenhum** — Master NÃO tem `UsuarioWorkspace` (Mandamento 04) | Acesso global vem de `tipo_usuario === 'MASTER'`; vínculo seria redundante e cria risco de drift |
| **STANDARD / SUPPLIER** | `UsuarioWorkspace` por Workspace selecionado no convite | Acesso restrito aos Workspaces explícitos; editável via `PUT /api/v1/usuarios/:id/workspaces` (substituição atômica) |
| **Edição de Master existente via PUT** | **PROIBIDO** — `400 INVALID_OPERATION` | Não há `UsuarioWorkspace` para editar; o acesso é por `tipo_usuario`, alterado apenas em fluxo de mudança de patente |

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
- [ ] Master NÃO recebe `UsuarioWorkspace` no convite (Mandamento 04 — acesso global por `tipo_usuario`)?
- [ ] `usuario.id` nos checks de permissão é o CUID do Prisma — não o `clerk_user_id`?
- [ ] Edição de workspaces de Standard/Supplier via PUT rejeita alvos Master (400)?
- [ ] PUT /workspaces valida IDs via `workspace.findMany` com `id_organizacao` antes de escrever (prevenção IDOR)?
- [ ] PUT /workspaces opera via `$transaction` (deleteMany + createMany) — nunca estado parcial?
- [ ] Schema Zod do front (`/api/v1/me`) reflete payload do back no MESMO commit (Mandamento 09)?
- [ ] Sem fallback silencioso de autorização: `(data?.usuario?.tipo_usuario ?? null) as TipoUsuario` é PROIBIDO (Mandamento 08)?
