# Duplicar e Excluir Pedidos — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026
> **Status:** Aguardando implementação

---

## Estrutura de Arquivos

```
produto/pedido/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ModalDuplicar.tsx         ← Modal de duplicação
│       │   └── ModalDuplicar.css
│       ├── shared/
│       │   ├── types.ts                  ← Tipos de duplicar/excluir
│       │   └── api.ts                    ← pedidoDuplicarApi, pedidoExcluirApi
│       └── pages/
│           └── ListaPedidos.tsx          ← Botões integrados
└── server/
    └── src/
        ├── routes/
        │   └── duplicarExcluir.ts        ← Rotas
        └── services/
            └── duplicarExcluirService.ts ← Lógica de negócio
```

---

## Tipos (`client/src/shared/types.ts`)

```ts
// ── Duplicar ──────────────────────────────────────────────

export interface DuplicarPayload {
  ids: string[]                         // pedido_ids a duplicar
  numeros?: Record<string, string>      // pedido_id → numero_pedido novo (quando não é auto)
}

export interface DuplicarItemPayload {
  pedido_id: string
  item_ids: string[]
}

export interface DuplicarResultado {
  criados: { original_id: string; novo_id: string; numero_pedido: string }[]
  erros: { id: string; motivo: string }[]
}

// ── Excluir ───────────────────────────────────────────────

export interface ExcluirPreview {
  permitidos: { id: string; numero_pedido: string; total_itens: number }[]
  bloqueados: { id: string; numero_pedido: string; status: string; motivo: string }[]
}

export interface ExcluirResultado {
  excluidos: number
  itens_excluidos: number
  pedidos_excluidos_por_sem_item: number   // pedidos removidos por ficar sem item
}
```

---

## API Client (`client/src/shared/api.ts`)

```ts
export const pedidoDuplicarApi = {
  // Preview: verifica o que será copiado/resetado conforme config
  preview: (ids: string[]) =>
    request<{
      config: { numero_auto: boolean; copiar_datas: boolean; status_inicial: string }
      pedidos: { id: string; numero_pedido: string; total_itens: number }[]
    }>('/api/v1/pedidos/duplicar/preview', { method: 'POST', body: JSON.stringify({ ids }) }),

  // Confirmar duplicação de pedidos
  confirmar: (payload: DuplicarPayload) =>
    request<DuplicarResultado>('/api/v1/pedidos/duplicar/confirmar', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  // Duplicar itens dentro de um pedido
  duplicarItens: (payload: DuplicarItemPayload) =>
    request<DuplicarResultado>('/api/v1/pedidos/duplicar/itens', {
      method: 'POST', body: JSON.stringify(payload),
    }),
}

export const pedidoExcluirApi = {
  // Preview: quais podem ser excluídos, quais bloqueados
  preview: (ids: string[]) =>
    request<ExcluirPreview>('/api/v1/pedidos/excluir/preview', {
      method: 'POST', body: JSON.stringify({ ids }),
    }),

  // Confirmar exclusão de pedidos
  confirmar: (ids: string[]) =>
    request<ExcluirResultado>('/api/v1/pedidos/excluir/confirmar', {
      method: 'POST', body: JSON.stringify({ ids }),
    }),

  // Excluir itens de um pedido
  excluirItens: (pedido_id: string, item_ids: string[]) =>
    request<ExcluirResultado>('/api/v1/pedidos/excluir/itens', {
      method: 'POST', body: JSON.stringify({ pedido_id, item_ids }),
    }),
}
```

---

## Backend — Rotas (`server/src/routes/duplicarExcluir.ts`)

### `POST /api/v1/pedidos/duplicar/preview`
- Busca pedidos pelo `ids` com `tenant_id`
- Lê configurações do tenant (`duplicar_numero_auto`, `duplicar_copiar_datas`, `duplicar_status_inicial`)
- Retorna lista de pedidos + config para o frontend montar o modal

### `POST /api/v1/pedidos/duplicar/confirmar`

**Zod schema:**
```ts
z.object({
  ids: z.array(z.string().uuid()).min(1),
  numeros: z.record(z.string()).optional(),
})
```

**Lógica em `$transaction`:**
```
Para cada pedido_id:
  1. Buscar pedido + itens com tenant_id
  2. Gerar novo ID
  3. Definir numero_pedido:
     - Se config.numero_auto: gerar pela regra de numeração
     - Senão: usar payload.numeros[id] (obrigatório se !numero_auto)
  4. Definir status:
     - Se config.status_inicial = 'copiar': usar status do original
     - Senão: usar config.status_inicial
  5. Definir datas:
     - Se config.copiar_datas: copiar do original
     - Senão: null
  6. tx.pedido.create({ ...campos, itens: { create: [...itens copiados] } })
  7. Registrar audit trail: canal = 'duplicacao', original_id
```

**Resposta:** `201 DuplicarResultado`

---

### `POST /api/v1/pedidos/duplicar/itens`

**Zod schema:**
```ts
z.object({
  pedido_id: z.string().uuid(),
  item_ids: z.array(z.string().uuid()).min(1),
})
```

**Lógica:**
```
1. Verificar pedido pertence ao tenant
2. Para cada item_id: clonar PedidoItem com novo ID
   - quantidade_atual = quantidade_inicial (reset de saldo)
   - quantidade_transferida = 0
   - quantidade_cancelada = 0
3. Recalcular agregados do pedido pai
```

---

### `POST /api/v1/pedidos/excluir/preview`

**Lógica:**
```
1. Buscar pedidos com tenant_id
2. Ler config.excluir_status_permitidos
3. Separar em permitidos (status na lista) e bloqueados (status fora da lista)
4. Retornar ExcluirPreview
```

---

### `POST /api/v1/pedidos/excluir/confirmar`

**Zod schema:**
```ts
z.object({
  ids: z.array(z.string().uuid()).min(1),
})
```

**Lógica em `$transaction`:**
```
1. Buscar pedidos + itens com tenant_id
2. Validar todos na lista excluir_status_permitidos (rejeitar se algum não está)
3. Registrar audit trail ANTES de excluir (dados que serão perdidos)
4. tx.pedidoItem.deleteMany({ where: { pedido_id: { in: ids }, tenant_id } })
5. tx.pedido.deleteMany({ where: { id: { in: ids }, tenant_id } })
```

**Resposta:** `200 ExcluirResultado`

---

### `POST /api/v1/pedidos/excluir/itens`

**Zod schema:**
```ts
z.object({
  pedido_id: z.string().uuid(),
  item_ids: z.array(z.string().uuid()).min(1),
})
```

**Lógica:**
```
1. Verificar pedido pertence ao tenant
2. Verificar pedido está em status permitido para excluir itens
3. Registrar audit trail
4. tx.pedidoItem.deleteMany({ where: { id: { in: item_ids }, pedido_id, tenant_id } })
5. Verificar quantos itens restaram no pedido
6. Se restaram 0:
   - Se config.excluir_pedido_sem_item_permitido = false:
     → tx.pedido.delete(pedido_id) + incrementar contador
   - Se true: pedido fica vazio
7. Se restaram > 0: recalcular agregados do pedido pai
```

---

## Frontend — ModalDuplicar.tsx

### Fluxo (2 passos)

**Passo 1 — Números (quando !config.numero_auto)**
```
┌──────────────────────────────────────────────┐
│  Duplicar Pedidos (3 selecionados)           │
├──────────────────────────────────────────────┤
│  PO-2026/001  →  Número da cópia: [_______]  │
│  PO-2026/002  →  Número da cópia: [_______]  │
│  PO-2026/003  →  Número da cópia: [_______]  │
│                                              │
│  ℹ Datas: serão resetadas                   │
│  ℹ Status: copiado do original              │
│                                              │
│       [Cancelar]       [Duplicar]            │
└──────────────────────────────────────────────┘
```

**Passo 1 — Confirmação (quando config.numero_auto)**
```
┌──────────────────────────────────────────────┐
│  Duplicar Pedidos (3 selecionados)           │
├──────────────────────────────────────────────┤
│  PO-2026/001  →  PO-2026/006 (gerado)       │
│  PO-2026/002  →  PO-2026/007 (gerado)       │
│  PO-2026/003  →  PO-2026/008 (gerado)       │
│                                              │
│  ℹ Datas: copiadas do original              │
│  ℹ Status: draft                            │
│                                              │
│       [Cancelar]       [Duplicar]            │
└──────────────────────────────────────────────┘
```

---

## Integração em ListaPedidos.tsx

```tsx
// Estado
const [modalDuplicarAberto, setModalDuplicarAberto] = useState(false)

// Botão Duplicar (adicionar ao toolbar de ações em lote)
<BotaoGlobal
  variante="secundario"
  tamanho="pequeno"
  icone={<CopySimple size={14} weight="duotone" />}
  disabled={pedidosSelecionados.length === 0}
  onClick={() => setModalDuplicarAberto(true)}
>
  Duplicar{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
</BotaoGlobal>

// Botão Excluir — já existe no código, substituir onClick por preview + modal de confirmação
// (atualmente chama pedidoLoteApi.cancelarConfirmar — corrigir para excluirApi)

// Modal
{modalDuplicarAberto && (
  <ModalDuplicar
    pedidos={pedidosSelecionados}
    onFechar={() => setModalDuplicarAberto(false)}
    onConcluido={() => {
      setModalDuplicarAberto(false)
      setPedidosSelecionados([])
      carregarInicial()
    }}
  />
)}
```

---

## Segurança

- [x] `tenant_id` em todas as queries (origem e destino)
- [x] Hard delete: audit trail obrigatório ANTES da exclusão
- [x] Validação de status no backend (não confiar no frontend)
- [x] Permissão separada: duplicar vs excluir

---

## Testes

```
testes/unitarios/pedido/duplicarExcluirService.test.ts
  ├── duplicar — copia todos os campos do pedido
  ├── duplicar — copia todos os itens com saldo zerado
  ├── duplicar — config numero_auto gera número correto
  ├── duplicar — config copiar_datas = false reseta datas
  ├── duplicar — config status_inicial = 'draft' ignora status original
  ├── excluir — hard delete remove pedido e itens
  ├── excluir — status não permitido é bloqueado
  ├── excluir item — pedido sem item é excluído (config false)
  ├── excluir item — pedido sem item permanece (config true)
  └── cross-tenant — não duplica/exclui pedido de outro tenant

testes/funcionais/pedido/duplicarExcluir.test.ts
  ├── POST /duplicar/preview — retorna config e pedidos
  ├── POST /duplicar/confirmar — cria cópias com novos IDs
  ├── POST /excluir/preview — separa permitidos e bloqueados
  ├── POST /excluir/confirmar — remove definitivamente
  └── POST /excluir/itens — remove itens e aplica regra sem-item
```
