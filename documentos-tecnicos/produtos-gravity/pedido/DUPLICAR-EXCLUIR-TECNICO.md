# Duplicar e Excluir Pedidos — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 2.0
> **Última atualização:** 2026-05-13
> **Status:** Implementado (commits `efa03ca0`, `0ab3cc99`)

---

## Estrutura de Arquivos (atual)

```
servicos-global/produto/pedido/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ModalPedidosDuplicar.tsx         ← Modal de duplicação (misto pedido + item)
│       │   ├── ModalPedidosDuplicar.css
│       │   ├── ModalPedidosExcluir.tsx          ← Modal de exclusão (substitui window.confirm)
│       │   └── ModalPedidosExcluir.css
│       ├── shared/
│       │   ├── types.ts                          ← DuplicarPayload, DuplicarItemPayload, etc.
│       │   └── api.ts                            ← pedidoDuplicarApi, pedidoExcluirApi
│       └── pages/
│           └── Pedidos.tsx                       ← Toolbar, dropdown da linha, renderiza modais
└── server/
    └── src/
        ├── routes/
        │   ├── duplicacoes-pedido.ts             ← POST /duplicacoes/{preview,confirmar,itens}
        │   └── exclusoes-pedido.ts               ← POST /exclusoes/{preview,confirmar,itens}
        └── services/
            └── duplicarExcluirService.ts         ← DuplicarService + ExcluirService
```

---

## Endpoints (estado real)

| Método | Rota | Função |
|---|---|---|
| POST | `/api/v1/pedidos/duplicacoes/preview` | Retorna config (`numero_auto`, `copiar_datas`, `status_inicial`) + lista de pedidos para o modal montar |
| POST | `/api/v1/pedidos/duplicacoes/confirmar` | Cria N pedidos novos (cascade dos itens) |
| POST | `/api/v1/pedidos/duplicacoes/itens` | Duplica M itens dentro de 1 pedido pai |
| POST | `/api/v1/pedidos/exclusoes/preview` | Separa permitidos / bloqueados por status |
| POST | `/api/v1/pedidos/exclusoes/confirmar` | Hard delete + audit trail |
| POST | `/api/v1/pedidos/exclusoes/itens` | Remove itens; aplica regra `excluir_pedido_sem_item_permitido` |

> Também existe `POST /api/v1/pedidos/:id_pedido/duplicar` (single-pedido), usado por outros fluxos. Não é o caminho do modal de duplicar em massa.

---

## Tipos (`client/src/shared/types.ts`)

```ts
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

export interface ExcluirPreview {
  permitidos: { id: string; numero_pedido: string; total_itens: number }[]
  bloqueados: { id: string; numero_pedido: string; status: string; motivo: string }[]
}

export interface ExcluirResultado {
  excluidos: number
  itens_excluidos: number
  pedidos_excluidos_por_sem_item: number
}
```

---

## Backend — `duplicarExcluirService.ts`

### `DuplicarService.confirmar()`

Cria pedidos novos via nested-create do Prisma com cascade dos itens. Pontos críticos:

1. **Header `x-id-workspace` é conditional** — quando ausente, filtro `id_workspace` é omitido (alinhado com GET /pedidos). Forçar workspace estrito causa 404 quando pedido pai não tem workspace marcado.
2. **Não abrir `$transaction` aninhada** — `db` (vindo de `withOrganizacao`) já é `Prisma.TransactionClient`. Aninhar dispara `TypeError: db.$transaction is not a function`.
3. **Relação Prisma é `itens_pedido`** (não `itens`). Schema Prisma:
   ```prisma
   itens_pedido    PedidoItem[]
   ```
4. **`data_emissao_pedido` é exceção arquitetural** — sempre `new Date()` na duplicação, independente da config `duplicar_copiar_datas`. Razão: é critério de ordenação implícita.

### `DuplicarService.duplicarItens()` — algoritmo "renumerar limpo"

Item duplicado deve aparecer **abaixo do original** na lista expandida. Estratégia (mesma já usada em `consolidacoes-pedido.ts:269-270`):

```
1. Carregar TODOS os itens do pedido pai (orderBy: sequencia_item_pedido ASC)
2. Criar os novos itens com sequencia_item_pedido = null (temporário)
3. Construir ordem final: para cada item original, se ele está em payload.item_ids,
   adiciona ele seguido da sua cópia. Senão, só ele.
4. UPDATE sequencial: para cada item da ordem final, sequencia_item_pedido = i + 1
5. Tocar pedido pai: tx.pedido.update({ data: { data_atualizacao_pedido: new Date() } })
```

**Por que o passo 5?** O `useGTExpandir` (nucleo-global) cacheia filhos por pai. Sem mudança de `itemVersion(pai)`, o cache fica stale e o item duplicado não aparece na linha expandida. Como o frontend usa `pedidoItemVersion = p => p.updated_at` (mapeado de `data_atualizacao_pedido`), tocar esse campo força o invalidate.

### Quantidades de execução zeradas

```ts
quantidade_atual_item: item.quantidade_inicial_item,  // item nasce íntegro
quantidade_pronta_item: 0,
quantidade_transferida_item: 0,
quantidade_cancelada_item: 0,
```

Sem isso, o item duplicado herdaria "50 transferidas" sem nenhum processo de embarque correspondente — saldo fantasma. Aviso pré-duplicação no modal alerta quando isso acontece.

### `ExcluirService.confirmar()` e `ExcluirService.excluirItens()`

Sem mudanças relevantes desta entrega — hard delete com `auditLog` antes via `historico-global` (fire-and-forget).

---

## Frontend — `ModalPedidosDuplicar.tsx`

### Props

```ts
interface ModalDuplicarPedidosProps {
  pedidos: Pedido[]              // selecionados via checkbox de linha pai
  itens?: PedidoItem[]           // selecionados via checkbox de filho (default [])
  todosPedidos?: Pedido[]        // lista completa da página — usado para lookup do pedido pai
                                 // quando usuário marca SÓ filho, sem marcar o pai
  onFechar: () => void
  onConcluido: () => void
}
```

### 3 cenários de seleção

| Seleção | Dispatch backend |
|---|---|
| Só `pedidos` | 1 chamada `pedidoDuplicarApi.confirmar({ ids, numeros })` |
| Só `itens` | 1 chamada `pedidoDuplicarApi.duplicarItens({ pedido_id, item_ids })` **por pedido pai distinto** |
| Misto | `Promise.all([...])` — ambos endpoints em paralelo, toast consolidado |

### Filtragem de duplicação dupla

Quando o usuário marca o pai, o **sync pai↔filhos universal do nucleo-global** marca todos os filhos automaticamente. Isso popularia `itensSelecionados` E `pedidosSelecionados`. Sem filtragem, cada item seria duplicado 2 vezes:
- 1× no pedido novo (via cascade do `/duplicacoes/confirmar`)
- 1× no pedido original (via `/duplicacoes/itens`)

**Solução:**

```ts
const idsPedidosSelecionados = useMemo(() => new Set(ids), [ids])
const itensFiltrados = useMemo(
  () => itens.filter(it => !idsPedidosSelecionados.has(it.pedido_id)),
  [itens, idsPedidosSelecionados],
)
```

O array de itens efetivamente processado é `itensFiltrados`, não `itens`. Os filhos do pai já vêm via cascade.

### Aviso pré-duplicação

Banner amarelo aparece quando algum item de `itensFiltrados` tem qualquer das 3 quantidades de execução > 0:

```ts
const itensComExecucao = useMemo(() => {
  return itensFiltrados.filter(it =>
    Number(it.quantidade_pronta_total_item_pedido) > 0
    || Number(it.quantidade_transferida_pedido) > 0
    || Number(it.quantidade_cancelada_pedido) > 0
  )
}, [itensFiltrados])
```

> Decimal vem como string no JSON do Prisma — `Number(x) > 0` é safe contra string vazia.

### Renderização visual

- **Header com título dinâmico:** "Duplicar 1 pedido e 2 itens" / "Duplicar 3 pedidos" / "Duplicar 5 itens"
- **2 seções com ícones:**
  - 📁 NOVOS PEDIDOS SERÃO CRIADOS (ícone `Files` do Phosphor)
  - 📦 ITENS SERÃO DUPLICADOS NESTES PEDIDOS (ícone `Package`)
- **Chips individuais** para itens: cada item vira um chip `[#1 12345-001]` com seq destacado em peso 700; até 4 inline, resto vira `+N` com tooltip nativo

---

## Sync pai↔filhos universal (nucleo-global)

> Esta regra é **arquitetural do componente `TabelaVirtualGlobal`**, não do produto Pedido. Documentada em [`skills/arquitetura/nucleo-global/SKILL.md`](../../../skills/arquitetura/nucleo-global/SKILL.md) — seção "Tabelas hierárquicas — sync pai↔filhos".

Comportamento fixo (sem prop opcional):
- Marcar pai → todos os filhos cached marcam
- Desmarcar pai → todos desmarcam
- Marcar último filho que faltava → pai marca automaticamente
- Desmarcar qualquer filho com pai marcado → pai desmarca
- Header "selecionar todos" → propaga para filhos cached de todos os pais visíveis

**Invariante:** pai marcado ⟺ todos os filhos do pai marcados.

---

## Integração em `Pedidos.tsx`

```tsx
// Modal Duplicar Pedidos e/ou Itens (modal único, misto)
{modalDuplicarAberto && (pedidosSelecionados.length > 0 || itensSelecionados.length > 0) && (
  <ModalDuplicarPedidos
    pedidos={pedidosSelecionados}
    itens={itensSelecionados}
    todosPedidos={pedidos}            // ← lookup do pedido pai quando usuário marca só item
    onFechar={() => setModalDuplicarAberto(false)}
    onConcluido={() => {
      setModalDuplicarAberto(false)
      setPedidosSelecionados([])
      setItensSelecionados([])
      carregarInicial()
    }}
  />
)}
```

Toolbar "Duplicar" tem `disabled={pedidosSelecionados.length === 0 && itensSelecionados.length === 0}` — ativa com qualquer seleção.

---

## Segurança

- [x] `id_organizacao` em todas as queries (origem e destino) via `withOrganizacao`
- [x] `id_workspace` conditional (não obrigatório quando header ausente)
- [x] Hard delete: audit trail obrigatório ANTES da exclusão via `historico-global`
- [x] Validação Zod em todas as rotas (DDD-puro, sem ACL legado)
- [x] Permissão separada: duplicar vs excluir (governada por config do produto)

---

## Testes (débito)

> Estes testes ainda não foram criados — débito catalogado no QA de `0ab3cc99`.

```
testes/testes-funcionais/produto-pedido/duplicar.test.ts
  ├── duplicar pedido — copia todos os campos + itens via cascade
  ├── duplicar item — item nasce abaixo do original (shift correto)
  ├── duplicar item — quantidade_pronta/transferida/cancelada são 0
  ├── duplicar — config numero_auto gera número
  ├── duplicar — data_emissao_pedido sempre new Date() (ignora copiar_datas)
  ├── modal misto — filtra duplicação dupla (pai marcado descarta filhos do mesmo pai)
  └── cross-tenant — não duplica/exclui pedido de outra organização

testes/testes-unitarios/nucleo-global/tabela-virtual-global/
  ├── sync — marcar pai → filhos marcados
  ├── sync — desmarcar 1 filho → pai desmarca
  ├── sync — marcar último filho → pai marca
  └── sync — selecionar todos no header → todos filhos cached marcados
```

---

## Referências cruzadas

- **Regras de negócio:** [`DUPLICAR-EXCLUIR-REGRAS-NEGOCIO.md`](./DUPLICAR-EXCLUIR-REGRAS-NEGOCIO.md)
- **Skill do produto:** [`skills/produtos-gravity/pedido/SKILL.md`](../../../skills/produtos-gravity/pedido/SKILL.md) — Parte 4
- **Skill nucleo-global:** [`skills/arquitetura/nucleo-global/SKILL.md`](../../../skills/arquitetura/nucleo-global/SKILL.md) — Tabelas hierárquicas
