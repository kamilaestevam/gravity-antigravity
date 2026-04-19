---
name: dream-team-pedido
description: "Use esta skill ao trabalhar em qualquer parte do produto Pedido (produto/pedido/*) — frontend, backend ou módulo standalone. Cobre regras de autenticação/multi-tenancy com Clerk+Prisma, comunicação interna entre serviços, comportamento de tabela com lazy loading, navegação MFE (hard navigation obrigatória), i18n com paridade de chaves, gatekeeping de API por tenantId, visibilidade por role e armadilhas conhecidas de Prisma/backend. Consultar antes de tocar em App.tsx, api.ts, Sidebar, ListaPedidos.tsx, pedidos.ts (rotas), arquivos de idioma (pt/en/es.json) ou qualquer middleware de tenant."
---

# Dream Team Pedido — Arquitetura e Regras de Negócio

> **Escopo:** `produto/pedido/*` — Frontend, Backend, Módulos Standalone
>
> Esta skill cobre as regras operacionais do módulo de Pedidos. Para regras de domínio (saldo, ciclo de vida, IDs corporativos), consulte também `skills/produtos/pedido/SKILL.md`.

---

## 1. A Fonte da Verdade (Multi-Tenancy & Autenticação)

### Proibição Absoluta — Clerk Organizations

O uso do sistema nativo de "Organizations" do Clerk está **estritamente proibido**. A fonte da verdade para vínculos de empresas (Tenants) e permissões (Roles) é **exclusivamente o Prisma (Banco de Dados)**.

### Frontend — Consumo de Identidade

O estado global (`ShellStore`) sincroniza com o Clerk. Sempre consuma o ID e o Cargo do usuário através de:

```ts
currentUser.publicMetadata.tenantId  // ID do tenant
currentUser.publicMetadata.role      // Cargo/Role
```

Nunca leia `orgId`, `orgSlug` ou qualquer campo nativo de Organizations do Clerk.

### Micro-frontends Standalone — Regra Obrigatória

Quando o módulo rodar de forma isolada (standalone, ex: porta 8000), é **obrigatório** o uso do hook `useSyncClerkToShell()` no arquivo principal (`App.tsx`) para hidratar o store.

```tsx
// App.tsx — standalone mode
import { useSyncClerkToShell } from '@produto/hooks/useSyncClerkToShell'

export function App() {
  useSyncClerkToShell() // OBRIGATÓRIO — sem isso o store fica vazio (amnésia de estado)
  return <Router />
}
```

**Sintoma de ausência:** store retorna `tenantId: null`, `role: undefined`, e todas as queries retornam 401 ou resultado vazio.

---

## 2. Mensageria, APIs e Comunicação Interna

### Chave Interna — Nome Canônico

A comunicação entre micro-serviços exige a chave de segurança padronizada:

```
INTERNAL_SERVICE_KEY
```

Se houver `INTERNAL_API_KEY` em algum `.env`, considere legado — corrija para `INTERNAL_SERVICE_KEY` para manter paridade entre serviços.

### Prioridade de Headers no Interceptor

O interceptor da API deve **sempre** priorizar o `tenantId` real do Clerk sobre variáveis de ambiente:

```ts
// CORRETO — Clerk tem prioridade
const tenantId = useShellStore.getState().currentUser?.tenantId
  ?? import.meta.env.VITE_DEV_TENANT_ID

// ERRADO — variável de ambiente sobrescreve o usuário real
const tenantId = import.meta.env.VITE_DEV_TENANT_ID
  ?? useShellStore.getState().currentUser?.tenantId
```

### tenantIsolationMiddleware — Não Redundar

O `tenantIsolationMiddleware` injeta e filtra tudo automaticamente pelo header `x-tenant-id`.

**Proibido:** criar filtros manuais de `company_id` que redundem ou conflitem com o `tenant_id` já injetado pelo middleware. Cada query extra por `company_id` sem `tenant_id` é um vazamento de dados cross-tenant.

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

O micro-frontend exige **Hard Navigation** (`<a href>` nativo) para forçar o recarregamento completo da página (comportamento equivalente a F5), garantindo a reidratação correta do Clerk e do Zustand store.

```tsx
// CORRETO — hard navigation garante reidratação
<a href="/pedidos">Pedidos</a>
<a href="/processos">Processos</a>

// PROIBIDO — SPA navigation entre MFEs não reidrata Clerk/Zustand
<Link to="/pedidos">Pedidos</Link>
<NavLink to="/processos">Processos</NavLink>
```

**Motivo:** cada MFE é um bundle independente. A navegação SPA dentro do mesmo MFE é permitida (ex: entre `/pedidos` e `/pedidos/:id`). A regra se aplica a transições que cruzam a fronteira de módulos.

**Sintoma de violação:** ao navegar pelo menu, `useShellStore` retorna `tenantId: null` na tela destino porque o Zustand não foi reidratado.

### Visibilidade e Acesso por Role

Renderizações condicionais devem validar strings brutas do `publicMetadata`:

```tsx
// CORRETO
const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN'

// ERRADO — nunca use fallback hardcoded
const role = currentUser.role ?? 'MEMBRO' // proibido
const display = currentUser.role ?? '??' // proibido
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

## 5. Gatekeeping de API — Requisições Condicionais por tenantId

### Regra: Nenhum Fetch no Mount sem tenantId Garantido

Nenhuma requisição deve ser disparada no mount inicial sem a garantia de que o `tenantId` está preenchido pelo store. Requisições com `tenantId: null` ou `tenantId: undefined` chegam ao backend sem o header `x-tenant-id`, causando erro 400 ou retorno de dados de outro tenant.

**Padrão obrigatório — Conditional Fetching:**

```ts
// React Query — enabled como gatekeeper
const { data } = useQuery({
  queryKey: ['pedidos', tenantId],
  queryFn: () => api.get('/api/v1/pedidos'),
  enabled: !!tenantId,  // OBRIGATÓRIO — não dispara sem tenantId
})

// TanStack Query v5
const { data } = useQuery({
  queryKey: ['pedidos', tenantId],
  queryFn: fetchPedidos,
  enabled: Boolean(tenantId),
})
```

```ts
// useEffect manual — verificar antes de chamar
useEffect(() => {
  if (!tenantId) return  // OBRIGATÓRIO — guard clause
  fetchPedidos()
}, [tenantId])
```

**Anti-padrão a eliminar:**
```ts
// PROIBIDO — dispara com tenantId nulo no primeiro render
useEffect(() => {
  fetchPedidos()  // sem verificação de tenantId
}, [])
```

**Sintoma de violação:** requisições duplicadas no Network tab — uma com `x-tenant-id: null` (falha) seguida de outra com o tenant correto (sucesso). O erro pode ser silenciado pelo React Query mas gera log de erro no backend.

---

## 6. Armadilhas de Backend e Prisma (Troubleshooting)

### Erro 500 em Rotas Secundárias — Diagnóstico

**Sintoma:** `Cannot read properties of undefined (reading 'findFirst')` ou similar.

**Causa:** divergência entre o nome do modelo chamado no código e o nome real no Schema do Prisma.

**Checklist de diagnóstico:**
1. Verificar se o Prisma Client está inicializado corretamente no contexto (`req.prisma.nomeDoModelo`)
2. Conferir se o nome do model no código bate com o `fragment.prisma` (case-sensitive: `pedidoItem` vs `PedidoItem`)
3. Verificar se o schema compilado está atualizado (`npx prisma generate` foi executado após a última migration?)
4. Se necessário como workaround temporário, usar optional chaining: `req.prisma?.pedidoItem?.findFirst`

### Tabelas Vazias no DEV — Diagnóstico

Se não houver erro de API (status 200), mas a lista vier vazia:

**Causa mais comum:** o `tenant_id` dos dados de Seed não corresponde ao `tenant_id` do usuário autenticado.

**Checklist:**
1. Verificar qual `tenant_id` o usuário autenticado possui: `currentUser.publicMetadata.tenantId`
2. Verificar qual `tenant_id` está nos dados do banco: `SELECT tenant_id FROM pedidos_comerciais LIMIT 5;`
3. Se divergirem, re-executar o seed com o `tenant_id` correto ou atualizar os dados existentes
4. Garantir que `VITE_DEV_TENANT_ID` no `.env.local` corresponde ao tenant_id do banco de DEV

---

## 7. Referência Rápida — O Que Verificar Antes de Abrir PR

| Área | Verificação |
|------|------------|
| Auth | `useSyncClerkToShell()` presente no `App.tsx` standalone? |
| Auth | Consumindo `publicMetadata.tenantId` e `.role`? Nunca `orgId`? |
| Navegação | Menu lateral usa `<a href>` nativo? Nenhum `<Link>` ou `<NavLink>` entre MFEs? |
| API | Interceptor prioriza Clerk sobre `VITE_DEV_TENANT_ID`? |
| API | Header da chamada S2S usa `INTERNAL_SERVICE_KEY`? |
| API | Todo `useQuery` / `useEffect` tem `enabled: !!tenantId` ou guard clause? |
| Tabela | `expandedRow` usa `pedido.itens` do cache sem fetch extra? |
| Roles | Nenhum fallback hardcoded (`'MEMBRO'`, `'??'`)? |
| i18n | Paridade de chaves entre `pt.json`, `en.json`, `es.json`? |
| i18n | Nenhum bloco top-level duplicado nos três arquivos JSON? |
| i18n | Siglas COMEX (Siscomex, OPE, CNPJ, DI, Incoterms) preservadas sem tradução? |
| Prisma | Nome do model no código bate com o `fragment.prisma`? |
| Prisma | `prisma generate` executado após última migration? |
| Seed | `tenant_id` do seed corresponde ao usuário de DEV? |
