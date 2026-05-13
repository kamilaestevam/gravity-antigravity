---
name: antigravity-estado
description: "Use esta skill sempre que uma tarefa envolver gerenciamento de estado no frontend — seja no shell ou em um produto. Define a separação obrigatória entre estado do shell e estado do produto, a dependência unidirecional, os campos restritos do ShellState e como o isolamento é garantido. Todo agente consulta esta skill antes de criar ou modificar qualquer store, context ou hook de estado."
---

# Gravity — Estado (State Management)

## Regra Fundamental

Shell e produto usam stores distintas com uma regra de dependência unidirecional:

```
nucleo-global/shell/state        produto/[produto]/src/shared/state
(estado genérico)                 (estado específico)
│
│◀──── produto PODE ler ──────────┘
│
✕ shell NUNCA lê estado do produto
```

**O produto conhece o shell. O shell nunca conhece o produto.**

---

## Estado do Shell — ShellState

O ShellState contém apenas dados que fazem sentido em qualquer produto. É um contrato fechado — ninguém adiciona campos de negócio aqui.

```typescript
// servicos-global/shell/store/types.ts
export type MeStatus = 'idle' | 'loading' | 'success' | 'error'

export type Notification = {
  type: 'success' | 'error' | 'info'
  message: string
}

export interface ShellState {
  // dados
  sidebarOpen: boolean
  currentTheme: 'light' | 'dark'
  currentUser: { id: string; name: string; email: string; avatarUrl?: string }
  meStatus: MeStatus   // ciclo de vida do GET /api/v1/me — NUNCA ignorar
  notifications: Notification[]

  // ações
  toggleSidebar: () => void
  setMeStatus: (status: MeStatus) => void
  clearCurrentUser: () => void
  addNotification: (n: Notification) => void
}
```

### meStatus — State Machine de Identidade (obrigatório)

`meStatus` rastreia o ciclo de vida da chamada `GET /api/v1/me` feita por `useMeSync`:

| Estado | Quando | Ação do Layout |
|:---|:---|:---|
| `'idle'` | Antes de qualquer chamada / após logout | Layout aguarda |
| `'loading'` | Durante o fetch de `/api/v1/me` | Pode exibir skeleton |
| `'success'` | Resposta 200 OK, `currentUser` populado | Renderiza normalmente |
| `'error'` | 401, 500, timeout, token null | **Bloqueia render — exibe erro com botão de retry** |

**Regra:** `Layout.tsx` DEVE verificar `meStatus === 'error'` antes de renderizar o conteúdo principal. Renderizar com dados do Clerk sem confirmação do backend é "fallback cego" e viola o princípio de Prisma como fonte de verdade.

```tsx
// Layout.tsx — gate obrigatório
const { meStatus } = useShellStore()
if (meStatus === 'error') {
  return <ErrorScreen /> // role="alert", aria-live="assertive"
}
```

`clearCurrentUser()` reseta `meStatus` para `'idle'` automaticamente (logout seguro).

**Com Zustand:**

```typescript
import { create } from 'zustand'
import type { ShellState, Notification } from './types'

const DEFAULT_USER = { id: '', name: '', email: '' }

export const useShellStore = create<ShellState>((set) => ({
  // dados
  sidebarOpen: true,
  currentTheme: 'dark',
  currentUser: DEFAULT_USER,
  meStatus: 'idle',
  notifications: [],

  // ações
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMeStatus: (status) => set({ meStatus: status }),
  clearCurrentUser: () => set({ currentUser: DEFAULT_USER, meStatus: 'idle' }),
  addNotification: (n: Notification) =>
    set((state) => ({ notifications: [...state.notifications, n] })),
}))
```

---

## Estado do Produto — ProductState

Cada produto tem seu próprio ProductState. Ele pode ler o ShellState por meio de hooks, mas o ShellState nunca tem conhecimento do ProductState.

```typescript
// produto/pedido/src/shared/state/types.ts
import type { PedidoItem } from '../models'

export interface PedidoState {
  idPedido: string
  items: PedidoItem[]
  workspace: {
    id: string
    nome_workspace: string
    plan: string
  }
}
```

**Exemplo de uso correto (em um produto):**

```typescript
async function handleSalvar() {
  try {
    const { currentUser } = useShellStore.getState()
    const { items } = usePedidoStore.getState()

    await api.pedido.create({
      items,
      createdById: currentUser.id,
    })
  } catch (error) {
    useShellStore.getState().addNotification({
      type: 'error',
      message: error instanceof Error ? error.message : 'Erro ao salvar',
    })
  }
}
```

---

## Comunicação entre Shell e Produto

O shell não lê o estado do produto, mas os dois podem se comunicar via event bus:

```typescript
import { emit, on } from '@gravity/shell'

// Produto emite evento quando algo relevante acontece
emit<{ id: string; title: string }>('activity:created', { id: '123', title: 'Nova simulação' })

// Shell (ou outro módulo) escuta sem precisar conhecer o estado do produto
on<{ id: string; title: string }>('activity:created', ({ id, title }) => {
  useShellStore.getState().addNotification({
    type: 'info',
    message: `Atividade criada: ${title}`,
  })
})
```

> **Regra:** o event bus é para notificações e sincronização leve. Estado persistente sempre vive na store correta — shell ou produto.

---

## Notificações — Como Disparar do Produto

O produto nunca gerencia toasts diretamente — usa o shell:

```typescript
import { useShellStore } from '@gravity/shell'

function SimulacaoPage() {
  const { addNotification } = useShellStore()

  async function handleSalvar() {
    try {
      // ... lógica de salvamento
      addNotification({ type: 'success', message: 'Salvo com sucesso!' })
    } catch (error) {
      addNotification({ type: 'error', message: 'Erro ao salvar' })
    }
  }
}
```

---

## Separação de Responsabilidades por Tipo de Estado

| Tipo | Onde vive | Exemplo |
|:---|:---|:---|
| Estado de UI global | `shell/state` | sidebar aberta, tema, rota |
| Estado de usuário básico | `shell/state` | id, nome, email |
| Estado de UI do produto | `produto/shared/state` | filtros, seleção, visão |
| Estado de operação | `produto/shared/state` | importação em andamento |
| Estado de permissões | `produto/shared/state` | o que o usuário pode fazer |
| Dados do servidor | Queries (React Query ou SWR) | listas, detalhes de entidades |
| Comunicação entre módulos | Event bus (`@gravity/shell`) | timer parou, atividade criada |

---

## Pattern — Invalidação de cache de filhos via touch do `updated_at`

> Aprovado em 2026-05-11 durante a entrega Duplicar Pedido (commit `0ab3cc99`). Pattern reusável para qualquer tabela hierárquica com lazy load de filhos.

**Problema:** componentes que cacheiam filhos sob demanda (ex: `useGTExpandir` do `@nucleo/tabela-virtual-global`) precisam saber quando o cache ficou stale. Re-fetch a cada mutation é caro; manter cache para sempre dá UI fantasma.

**Solução:** o componente usa um `itemVersion(pai) => string` como chave de invalidação. O hook só re-fetcha filhos quando essa versão muda. O pattern obrigatório:

| Camada | O que faz |
|---|---|
| **Banco** | Coluna `data_atualizacao_*` com `@updatedAt` no Prisma (já existe nos models) |
| **Backend** | Toda mutation que afeta a hierarquia (criar/excluir/duplicar/transferir filhos) **toca explicitamente** o `data_atualizacao_*` do pai. Mesmo quando a mutation só mexe nos filhos: `tx.pedido.update({ where: { id_pedido }, data: { data_atualizacao_pedido: new Date() } })` |
| **API** | O mapper expõe esse campo como `updated_at` no payload |
| **Frontend** | `itemVersion = pai => pai.updated_at` no `useGTExpandir` ou hook equivalente |

**Exemplo real** (`servicos-global/produto/pedido/server/src/services/duplicarExcluirService.ts`):

```ts
// Após shift de sequência + criação dos itens novos
await tx.pedido.update({
  where: { id_pedido: payload.pedido_id },
  data: { data_atualizacao_pedido: new Date() },
})
```

Sem essa linha, a Lista expandida do Pedido continuaria mostrando o cache stale após duplicar item — item duplicado só apareceria após F5.

**Quando aplicar este pattern:**
- Sempre que uma mutation mexe nos filhos de uma entidade exibida em tabela hierárquica
- Mesmo quando a entidade pai não muda diretamente — basta que os filhos dela mudem
- Em consolidações, transferências entre pedidos, exclusão de itens, etc.

**Quando NÃO aplicar:**
- Mutações que mudam o próprio pai (essas já tocam `updated_at` automaticamente via `@updatedAt`)
- Tabelas sem hierarquia ou sem lazy load — não há cache de filhos para invalidar

---

## Event Bus — Padrão Obrigatório entre Módulos da Organização

Quando múltiplos serviços da organização estão na mesma tela (atividades + email + cronômetro), eles precisam se comunicar **sem importar código um do outro**. O shell fornece um event bus tipado por generics:

```typescript
// servicos-global/shell/events.ts
const bus = new EventTarget()

export function emit<T>(event: string, detail: T): void {
  bus.dispatchEvent(new CustomEvent<T>(event, { detail }))
}

export function on<T>(event: string, callback: (detail: T) => void): void {
  bus.addEventListener(event, (e) => callback((e as CustomEvent<T>).detail))
}

export function off<T>(event: string, callback: (detail: T) => void): void {
  bus.removeEventListener(event, callback as EventListener)
}
```

### Eventos padronizados

> **Convenção de payload:** os payloads do Event Bus operam em memória TypeScript (não cruzam HTTP), então usam **camelCase** (`activityId`, `idProduto`). Snake_case fica reservado a contratos REST/Prisma/banco.

| Evento | Emissor | Dados | Quem escuta |
|:---|:---|:---|:---|
| `timer:stopped` | Cronômetro | `{ activityId, duration }` | Atividades |
| `activity:created` | Atividades | `{ id, title, idProduto }` | Dashboard, Notificações |
| `email:received` | Email | `{ id, subject, from }` | Notificações, Dashboard |
| `notification:new` | Qualquer | `{ type, message }` | Shell (toast) |

### Regras do Event Bus

- **Comunicação leve** — o event bus é para notificações e sincronização, não para transferir dados grandes
- **Fire and forget** — o emissor não espera resposta
- **Estado persistente** — sempre vive na store correta (shell ou produto), nunca no event bus
- **Cleanup** — componentes devem chamar `off()` no unmount para evitar memory leaks

```typescript
type TimerStoppedDetail = { activityId: string; duration: number }

useEffect(() => {
  const handler = (detail: TimerStoppedDetail) => updateTimer(detail)
  on<TimerStoppedDetail>('timer:stopped', handler)
  return () => off<TimerStoppedDetail>('timer:stopped', handler)
}, [])
```

---

## Checklist — Antes de Criar ou Modificar Estado

- [ ] Este dado faz sentido em qualquer produto? → `shell/state`
- [ ] Este dado é específico deste produto? → `produto/shared/state`
- [ ] A store do shell importa algo do produto? → proibido, corrigir
- [ ] O produto usa `useShellStore()` para ler dados do shell? → correto
- [ ] Notificações são disparadas via `addNotification` do shell? → correto
- [ ] Dados do servidor estão em queries, não em stores? → correto
- [ ] Estado de UI reseta ao navegar? → esperado, não é bug
- [ ] Nenhum dado sensível em `localStorage`? → obrigatório
- [ ] Comunicação entre módulos via Event Bus (não import cruzado)?
- [ ] Listeners do Event Bus limpam no unmount (`off()`)?
