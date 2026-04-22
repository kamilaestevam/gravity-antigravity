---
name: dream-team-pedido
description: "Use esta skill ao trabalhar em qualquer parte do produto Pedido (produto/pedido/*) — frontend, backend ou módulo standalone. Cobre regras de autenticação (Clerk APENAS) e autorização via Prisma + /api/v1/me, comunicação interna entre serviços, comportamento de tabela com lazy loading, navegação MFE (hard navigation obrigatória), i18n com paridade de chaves, gatekeeping de API por id_organizacao, visibilidade por tipo_usuario e armadilhas conhecidas de Prisma/backend. Consultar antes de tocar em App.tsx, api.ts, Sidebar, ListaPedidos.tsx, pedidos.ts (rotas), arquivos de idioma (pt/en/es.json) ou qualquer middleware de organização."
---

# Dream Team Pedido — Arquitetura e Regras de Negócio

> **Escopo:** `produto/pedido/*` — Frontend, Backend, Módulos Standalone
>
> Esta skill cobre as regras operacionais do módulo de Pedidos. Para regras de domínio (saldo, ciclo de vida, IDs corporativos), consulte também `skills/produtos/pedido/SKILL.md`.
>
> **Leitura obrigatória antes:** `skills/governanca/9-mandamentos/SKILL.md` — esta skill aplica os 9 Mandamentos no contexto do Pedido.

---

## 1. A Fonte da Verdade (Multi-Organização e Autenticação)

### Mandamento 01 — Clerk APENAS para Autenticação

A separação é absoluta e não-negociável:

| Sistema | Responsabilidade única |
|:---|:---|
| **Clerk** | Autenticação (login, senha, e-mail, `clerk_user_id`) |
| **Prisma / Banco** | Autorização, permissões, `tipo_usuario`, `id_organizacao`, dados de usuário |

**Fonte única de verdade para autorização e contexto de organização:** `GET /api/v1/me` no backend Gravity (consulta Prisma).

### Proibições Absolutas

1. **PROIBIDO** ler `currentUser.publicMetadata.role` para autorização (Mandamento 01)
2. **PROIBIDO** ler `currentUser.publicMetadata.tenantId` ou `idOrganizacao` para identificar a organização (Mandamento 01)
3. **PROIBIDO** usar o sistema nativo de "Organizations" do Clerk (`orgId`, `orgSlug`)
4. **PROIBIDO** fallback silencioso `(currentUser?.publicMetadata?.role ?? null) as Role` (Mandamento 08)
5. **PROIBIDO** tipos do Clerk vazarem para a UI — toda decisão de UI baseia-se no payload de `/api/v1/me`

### Frontend — Consumo de Identidade (jeito correto)

A identidade do usuário e da organização vem **exclusivamente do backend Gravity**, validada por Zod (Mandamentos 06 e 09):

```ts
// schemas/me.ts — schema espelha o payload do back (Mandamento 09)
import { z } from 'zod'

export const meResponseSchema = z.object({
  usuario: z.object({
    id_usuario: z.string(),
    nome: z.string(),
    email: z.string().email(),
    tipo_usuario: z.enum(['MASTER', 'SUPER_ADMIN', 'ADMIN', 'OPERADOR', 'LEITURA']),
    is_gravity_admin: z.boolean(),  // Master e Super Admin (Mandamento 04)
  }),
  organizacao: z.object({
    id_organizacao: z.string(),
    nome: z.string(),
  }),
  workspaces: z.array(z.object({
    id_workspace: z.string(),
    nome: z.string(),
  })),
})

export type Me = z.infer<typeof meResponseSchema>
```

```ts
// hooks/useMe.ts — única fonte de identidade
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/v1/me', { credentials: 'include' })
      if (!res.ok) throw new Error('Falha ao carregar /api/v1/me')
      // Mandamento 06: TODO fetch().json() passa por schema.parse()
      return meResponseSchema.parse(await res.json())
    },
    staleTime: 5 * 60 * 1000, // 5 min
  })
}
```

```tsx
// Uso em qualquer componente
const { data: me, isLoading } = useMe()

if (isLoading) return <Spinner />
if (!me) return <ErroAuth />  // Mandamento 05: trata loading/erro explicitamente

// Acesso explícito, sem fallback silencioso (Mandamento 08)
const tipoUsuario = me.usuario.tipo_usuario
const idOrganizacao = me.organizacao.id_organizacao
```

### Mandamento 04 — Master e Super Admin (acesso global)

```ts
// is_gravity_admin = Master ou Super Admin: acesso global, SEM UsuarioWorkspace
if (me.usuario.is_gravity_admin) {
  // Pode acessar qualquer workspace, qualquer organização (modo god-mode)
}
```

### Micro-frontends Standalone — Regra Obrigatória

Quando o módulo rodar de forma isolada (standalone, ex: porta 8000), é **obrigatório** o uso do hook `useSyncClerkToShell()` no arquivo principal (`App.tsx`) para hidratar o contexto de **autenticação** (token Clerk) — depois disso a identidade vem de `/api/v1/me`.

```tsx
// App.tsx — standalone mode
import { useSyncClerkToShell } from '@produto/hooks/useSyncClerkToShell'
import { useMe } from '@produto/hooks/useMe'

export function App() {
  useSyncClerkToShell() // OBRIGATÓRIO — sincroniza apenas o token de autenticação
  const { data: me, isLoading } = useMe()

  if (isLoading) return <Spinner />
  if (!me) return <TelaLoginNovamente />

  return <Router />
}
```

**Sintoma de ausência:** `/api/v1/me` retorna 401 e a aplicação fica presa em loading porque não há token Clerk para autenticar a chamada.

---

## 2. Mensageria, APIs e Comunicação Interna

### Chave Interna — Nome Canônico

A comunicação entre micro-serviços exige a chave de segurança padronizada:

```
INTERNAL_SERVICE_KEY
```

Se houver `INTERNAL_API_KEY` em algum `.env`, considere legado — corrija para `INTERNAL_SERVICE_KEY` para manter paridade entre serviços.

### Prioridade de Headers no Interceptor

O interceptor da API deve **sempre** priorizar o `id_organizacao` real obtido de `/api/v1/me` sobre variáveis de ambiente. **Nunca** ler `publicMetadata` do Clerk para isso.

```ts
// CORRETO — id_organizacao vem do backend (Prisma via /api/v1/me)
import { meResponseSchema } from '@produto/schemas/me'

let idOrganizacaoCache: string | null = null

export async function getIdOrganizacao(): Promise<string | null> {
  if (idOrganizacaoCache) return idOrganizacaoCache
  const res = await fetch('/api/v1/me')
  if (!res.ok) return null
  const me = meResponseSchema.parse(await res.json())
  idOrganizacaoCache = me.organizacao.id_organizacao
  return idOrganizacaoCache
}

api.interceptors.request.use(async (config) => {
  const idOrganizacao = (await getIdOrganizacao()) ?? import.meta.env.VITE_DEV_ID_ORGANIZACAO
  if (idOrganizacao) config.headers['x-organizacao-id'] = idOrganizacao
  return config
})

// PROIBIDO — lê publicMetadata para autorização/contexto (Mandamento 01)
// const idOrganizacao = currentUser?.publicMetadata?.tenantId
```

### Middleware de Isolamento de Organização

O backend usa o SDK `@gravity/tenant-resolver` (`withTenant`, `withTenantContext`) para acessar o banco. Toda requisição autenticada já tem `req.tenant.tenantId` populado pelo middleware.

**Proibido:**
- Criar filtros manuais de `id_workspace` que redundem ou conflitem com o `id_organizacao` já injetado pelo middleware. Cada query extra por `id_workspace` sem `id_organizacao` é um vazamento cross-organização.
- Instanciar `PrismaClient` direto em código de aplicação. Acesso ao banco **exclusivamente** via SDK `@gravity/tenant-resolver`.

```ts
// CORRETO — SDK injeta o schema da organização (Schema-per-Organização)
import { withTenant } from '@gravity/tenant-resolver'

app.get('/api/v1/pedidos', requireAuth, async (req, res) => {
  const pedidos = await withTenant(req.tenant.tenantId, (db) =>
    db.pedido.findMany({ include: { itens: true } })
  )
  res.json(pedidos)
})

// PROIBIDO — PrismaClient direto + filtro manual
// const prisma = new PrismaClient()
// await prisma.pedido.findMany({ where: { id_workspace } }) // vazamento cross-organização
```

---

## 3. Frontend: Componentes Visuais, Tabela e Rotas

### Tabela e Lazy Loading — Regra de Cache

O endpoint principal de listagem (`/api/v1/pedidos`) já retorna o payload com itens incluídos (`include: { itens: true }`).

**Regra:** a função de expansão da linha (`expandedRow`) deve utilizar `pedido.itens` já cacheados em memória.

```ts
// CORRETO — usa cache local
const handleExpandRow = (pedido: Pedido) => {
  setExpandedItems(pedido.itens) // itens já estão no payload
}

// PROIBIDO — requisição extra desnecessária
const handleExpandRow = async (pedido: Pedido) => {
  const itens = await api.get(`/pedidos/${pedido.id}/itens`) // viola a regra
  setExpandedItems(itens)
}
```

**Exceção:** só fazer fetch extra se o usuário explicitamente expandir um detalhe não incluído no payload principal (ex: histórico de alterações de um item específico).

### Navegação MFE — Hard Navigation Obrigatória no Sidebar

É **estritamente proibido** usar navegação SPA (`<Link>`, `<NavLink>` do `react-router-dom`) no Sidebar/Menu principal entre módulos distintos.

O micro-frontend exige **Hard Navigation** (`<a href>` nativo) para forçar o recarregamento completo da página (comportamento equivalente a F5), garantindo a reidratação correta do Clerk e a re-execução de `/api/v1/me`.

```tsx
// CORRETO — hard navigation garante reidratação
<a href="/pedidos">Pedidos</a>
<a href="/processos">Processos</a>

// PROIBIDO — SPA navigation entre MFEs não reidrata Clerk e o cache de /api/v1/me
<Link to="/pedidos">Pedidos</Link>
<NavLink to="/processos">Processos</NavLink>
```

**Motivo:** cada MFE é um bundle independente. A navegação SPA dentro do mesmo MFE é permitida (ex: entre `/pedidos` e `/pedidos/:id`). A regra se aplica a transições que cruzam a fronteira de módulos.

**Sintoma de violação:** ao navegar pelo menu, a tela destino exibe dados da organização errada porque o cache de `/api/v1/me` não foi reexecutado.

### Visibilidade e Acesso por Tipo de Usuário

Renderizações condicionais devem validar **o resultado tipado de `/api/v1/me`** — nunca strings brutas do `publicMetadata`.

```tsx
// CORRETO — usa o payload validado por Zod (Mandamento 06)
const { data: me } = useMe()
if (!me) return null  // Mandamento 05: nunca cria estado vazio fake

const isGravityAdmin = me.usuario.is_gravity_admin // Master ou Super Admin (Mandamento 04)
const isAdmin = me.usuario.tipo_usuario === 'ADMIN'
const podeEditar = isGravityAdmin || isAdmin

// PROIBIDO — lê publicMetadata para autorização (Mandamento 01)
// const isAdmin = currentUser.publicMetadata.role === 'ADMIN'

// PROIBIDO — fallback silencioso (Mandamento 08)
// const role = (currentUser?.publicMetadata?.role ?? 'MEMBRO') as Role
// const display = me?.usuario?.tipo_usuario ?? '??'
```

#### Estado inicial e mocks (Mandamento 05)

```tsx
// CORRETO — null + tratamento explícito
const [pedido, setPedido] = useState<Pedido | null>(null)
if (!pedido) return <Skeleton />

// PROIBIDO — mock vazio para satisfazer compilador (Mandamento 05)
// const [pedido, setPedido] = useState<Pedido>({} as Pedido)
```

Links para módulos globais devem usar rotas absolutas:

```ts
// CORRETO — rota absoluta para módulo global
window.location.href = '/admin'

// ERRADO — rota relativa quebra no micro-frontend isolado
navigate('/admin')
```

---

## 4. i18n — Paridade de Chaves e Integridade dos Arquivos de Idioma

### Paridade Obrigatória entre pt / en / es

Os três arquivos de idioma (`pt.json`, `en.json`, `es.json`) devem sempre manter **paridade total de chaves**. Uma chave presente em `pt.json` e ausente em `en.json` causa fallback silencioso ou exibição de chave crua na UI.

**Regra de verificação antes de qualquer PR que toque i18n:**
```bash
# Extrair todas as chaves de pt.json e comparar com en.json e es.json
# Qualquer diff não vazio é um bloqueio de PR
```

### Blocos Top-Level — Proibição de Duplicatas

É **proibido** ter dois blocos top-level com o mesmo nome no mesmo arquivo JSON. JSON não lança erro — o segundo bloco silenciosamente sobrescreve o primeiro, causando perda de chaves.

```jsonc
// PROIBIDO — segundo bloco "pedido" apaga o primeiro sem aviso
{
  "pedido": { "titulo": "Pedidos" },
  "filtros": { ... },
  "pedido": { "status": "Status" }  // ← sobrescreve; "titulo" some
}

// CORRETO — merge em bloco único
{
  "pedido": {
    "titulo": "Pedidos",
    "status": "Status"
  },
  "filtros": { ... }
}
```

**Ferramenta de detecção:** usar `jq 'keys | group_by(.) | map(select(length > 1))' arquivo.json` para identificar chaves duplicadas antes do commit.

### Preservação de Siglas e Jargões COMEX

Siglas globais e jargões do comércio exterior **nunca devem ser traduzidos**. Mantê-los idênticos nos três idiomas:

| Termo | Regra |
|-------|-------|
| `Siscomex`, `OPE` | Invariável nos três idiomas |
| `CNPJ`, `CPF`, `NCM` | Invariável — são identificadores brasileiros |
| `Draft`, `FOB`, `CIF`, `EXW` | Incoterms — invariáveis |
| `DI`, `LI`, `RE` | Documentos aduaneiros — invariáveis |

---

## 5. Gatekeeping de API — Requisições Condicionais por id_organizacao

### Regra: Nenhum Fetch no Mount sem id_organizacao Garantido

Nenhuma requisição deve ser disparada no mount inicial sem a garantia de que o `id_organizacao` veio de `/api/v1/me`. Requisições disparadas antes do `me` carregar chegam ao backend sem o header `x-organizacao-id`, causando erro 400 ou retorno de dados de outra organização.

**Padrão obrigatório — Conditional Fetching:**

```ts
// React Query — enabled como gatekeeper, depende de useMe()
const { data: me } = useMe()
const idOrganizacao = me?.organizacao.id_organizacao

const { data } = useQuery({
  queryKey: ['pedidos', idOrganizacao],
  queryFn: async () => {
    const res = await fetch('/api/v1/pedidos')
    return pedidosListSchema.parse(await res.json())  // Mandamento 06
  },
  enabled: !!idOrganizacao,  // OBRIGATÓRIO — não dispara antes do /me carregar
})
```

```ts
// useEffect manual — verificar antes de chamar
const { data: me } = useMe()
useEffect(() => {
  if (!me?.organizacao.id_organizacao) return  // OBRIGATÓRIO — guard clause
  fetchPedidos()
}, [me?.organizacao.id_organizacao])
```

**Anti-padrão a eliminar:**
```ts
// PROIBIDO — dispara antes do /me carregar
useEffect(() => {
  fetchPedidos()  // sem verificação de id_organizacao
}, [])

// PROIBIDO — lê publicMetadata para gatekeep (Mandamento 01)
// const idOrganizacao = currentUser?.publicMetadata?.tenantId
// enabled: !!idOrganizacao
```

**Sintoma de violação:** requisições duplicadas no Network tab — uma sem `x-organizacao-id` (falha) seguida de outra com a organização correta (sucesso). O erro pode ser silenciado pelo React Query mas gera log de erro no backend.

---

## 6. Armadilhas de Backend e Prisma (Troubleshooting)

### Erro 500 em Rotas Secundárias — Diagnóstico

**Sintoma:** `Cannot read properties of undefined (reading 'findFirst')` ou similar.

**Causa:** divergência entre o nome do modelo chamado no código e o nome real no Schema do Prisma — lembrar que o `schema.prisma` é INTOCÁVEL (Mandamento 02): adeque o código ao schema, não o contrário.

**Checklist de diagnóstico:**
1. Verificar se está usando o SDK `@gravity/tenant-resolver` (`withTenant(req.tenant.tenantId, db => db.nomeDoModelo...)`) — `PrismaClient` direto é PROIBIDO
2. Conferir se o nome do model no código bate com o `schema.prisma` (case-sensitive: `pedidoItem` vs `PedidoItem`)
3. Verificar se o schema compilado está atualizado (`npx prisma generate` foi executado após a última alteração de schema feita pelo Coordenador?)
4. Se o nome do model mudou no schema, **adeque o código** — não modifique o schema

### Tabelas Vazias no DEV — Diagnóstico

Se não houver erro de API (status 200), mas a lista vier vazia:

**Causa mais comum:** o usuário autenticado pertence a uma organização cujo schema PostgreSQL está vazio ou não tem dados de seed.

**Checklist:**
1. Verificar qual `id_organizacao` o `/api/v1/me` retorna para o usuário autenticado (Network tab)
2. Verificar se o schema PostgreSQL da organização (`tenant_<cuid>`) tem dados:
   ```sql
   SET search_path TO "tenant_<cuid_da_organizacao>";
   SELECT COUNT(*) FROM pedidos_comerciais;
   ```
3. Se vazio, executar seed apontando para o schema correto da organização
4. Garantir que `VITE_DEV_ID_ORGANIZACAO` no `.env.local` corresponde ao `id_organizacao` do usuário de DEV (e que esse usuário existe no Prisma do Configurador)
5. Lembrar: `id_organizacao` está mapeado via `@map("tenant_id")` na coluna real do banco — campo Prisma é `id_organizacao`, coluna PostgreSQL é `tenant_id`

---

## 7. Referência Rápida — O Que Verificar Antes de Abrir PR

| Área | Verificação |
|------|------------|
| Auth | `useSyncClerkToShell()` presente no `App.tsx` standalone? |
| Auth | Identidade vem de `/api/v1/me` + `meResponseSchema.parse()`? **Nenhum** uso de `publicMetadata.role` ou `publicMetadata.tenantId`? (Mandamentos 01 + 06) |
| Auth | Master/Super Admin tratados via `is_gravity_admin = true` (Mandamento 04)? |
| Estado | Nenhum `useState<T>({} as T)` — todo estado inicial é `null`/`undefined` com tratamento (Mandamento 05)? |
| Estado | Nenhum fallback silencioso `(data?.x?.y ?? null) as Tipo` em autorização (Mandamento 08)? |
| Schema | Nenhuma alteração em `schema.prisma` (Mandamento 02)? |
| DDD | Código usa `id_organizacao`, `id_workspace`, `id_usuario`, `tipo_usuario` (Mandamento 03)? |
| Navegação | Menu lateral usa `<a href>` nativo? Nenhum `<Link>` ou `<NavLink>` entre MFEs? |
| API | Interceptor obtém `id_organizacao` de `/api/v1/me` — **nunca** de `publicMetadata`? |
| API | Header da chamada S2S usa `INTERNAL_SERVICE_KEY`? |
| API | Todo `useQuery`/`useEffect` tem `enabled: !!me?.organizacao.id_organizacao` ou guard clause equivalente? |
| API | Toda resposta `fetch().json()` passa por `schema.parse()` (Mandamento 06)? Schemas Zod sincronizados com o backend no MESMO commit (Mandamentos 07 + 09)? |
| Tabela | `expandedRow` usa `pedido.itens` do cache sem fetch extra? |
| Roles | Decisão usa `me.usuario.tipo_usuario` (do Prisma) — nunca `currentUser.publicMetadata.role`? |
| i18n | Paridade de chaves entre `pt.json`, `en.json`, `es.json`? |
| i18n | Nenhum bloco top-level duplicado nos três arquivos JSON? |
| i18n | Siglas COMEX (Siscomex, OPE, CNPJ, DI, Incoterms) preservadas sem tradução? |
| Prisma | Acesso ao banco via `withTenant` / `withTenantContext` do `@gravity/tenant-resolver`? Nenhum `new PrismaClient()` direto? |
| Prisma | Nome do model no código bate com o `schema.prisma`? Adequar o código ao schema, não o contrário (Mandamento 02). |
| Prisma | `prisma generate` executado após última alteração de schema feita pelo Coordenador? |
| Seed | Schema PostgreSQL da organização (`tenant_<cuid>`) tem dados? `id_organizacao` do usuário DEV bate com o schema? |
