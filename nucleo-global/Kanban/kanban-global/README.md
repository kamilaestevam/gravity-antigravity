# @nucleo/kanban-global

Componente Kanban genérico do design system Gravity. Suporta drag-and-drop entre colunas e reorder dentro de colunas, automações configúraveis, modo cross-tenant e i18n.

## Instalação

Pacote privado. Adicione via path no `package.json` do produto:

```json
"@nucleo/kanban-global": "file:../../nucleo-global/Kanban/kanban-global"
```

## Uso básico

```tsx
import { KanbanGlobal } from '@nucleo/kanban-global'
import type { KanbanColunaDef, KanbanItem } from '@nucleo/kanban-global'

const COLUNAS: KanbanColunaDef[] = [
  { key: 'aberto',   label: 'Aberto',   color: '#6366f1' },
  { key: 'em-andamento', label: 'Em Andamento', color: '#f59e0b' },
  { key: 'concluido', label: 'Concluído', color: '#10b981' },
]

interface MeuItem extends KanbanItem {
  titulo: string
}

<KanbanGlobal
  colunas={COLUNAS}
  itens={itens}
  renderCard={(item) => <div>{item.titulo}</div>}
  onMoverItem={async (itemId, novaColunaKey, posicao) => {
    await api.moverItem(itemId, novaColunaKey, posicao)
  }}
  onReorderItem={async (colunaKey, itemIds) => {
    await api.salvarOrdem(colunaKey, itemIds)
  }}
/>
```

## Props — KanbanGlobal

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `colunas` | `KanbanColunaDef[]` | — | Definição das colunas |
| `itens` | `T[]` | — | Itens a exibir |
| `renderCard` | `(item, isDragging) => ReactNode` | — | Renderizador do card |
| `onMoverItem` | `(id, colunaKey, posicao) => void\|Promise` | — | Move item para outra coluna |
| `onReorderItem` | `(colunaKey, itemIds) => void\|Promise` | — | Persiste reorder na mesma coluna |
| `onCardClick` | `(item) => void` | — | Clique no card (sem drag) |
| `isReadOnly` | `boolean` | `false` | Desabilita drag |
| `emptyLabel` | `string` | `'Nenhum item'` | Texto do empty state |
| `getItemLabel` | `(item) => string` | `item.id` | Label para ordenação alfabética |
| `getItemDate` | `(item) => string\|Date` | — | Data para ordenação newest/oldest |
| `filterFn` | `(item) => boolean` | — | Filtro interno opcional |
| `isLoading` | `boolean` | — | Exibe skeleton |
| `skeletonCount` | `number` | `3` | Cards-skeleton por coluna |
| `colunasVisiveis` | `string[]` | — | Exibe apenas estas colunas (por key) |
| `toolbarSlot` | `ReactNode` | — | Área acima do board |
| `colunaFooterSlot` | `(coluna) => ReactNode` | — | Rodapé de cada coluna |
| `modoGlobal` | `boolean` | `false` | Exibe badge de tenant |
| `testIdPrefix` | `string` | `'kg'` | Prefixo dos data-testid |
| `labels` | `KanbanLabels` | pt-BR | Textos customizáveis (i18n) |

## i18n — KanbanLabels

Passe a prop `labels` para substituir qualquer texto. Todos os campos são opcionais.

```tsx
<KanbanGlobal
  labels={{
    sortNewest:       'Newest first',
    sortOldest:       'Oldest first',
    sortAlpha:        'Alphabetical',
    sortPopoverTitle: 'Sort list',
    sortPopoverClose: 'Close',
    sortButtonTitle:  'Sort column',
    collapseTitle:    'Collapse column',
    expandTitle:      'Expand column',
    dropHintPrefix:   'Move to',
    moveCardTitle:     'Move to…',
    moveCardAriaLabel: 'Move card to another column',
    moveCardMenuLabel: 'Move to',
    movingAriaLabel:   'Moving…',
  }}
  // ...demais props
/>
```

## KanbanColunaDef

```ts
interface KanbanColunaDef {
  key:        string       // ID único — deve corresponder a KanbanItem.colunaKey
  label:      string       // Texto exibido
  color:      string       // Hex — usado em badge, WIP e hint de drop
  icon?:      ReactNode    // Ícone Phosphor opcional
  limiteWip?: number       // Badge vermelho quando itens > limiteWip
  colapsavel?: boolean     // Permite colapsar a coluna
  isReadOnly?: boolean     // Não aceita drops nem permite drag interno
}
```

## Configurações — KanbanConfiguracoes

Componente separado para configurar colunas, campos do card e automações.

```tsx
import { KanbanConfiguracoes } from '@nucleo/kanban-global'
import type { KanbanConfigData, CampoCardDef, CampoRegra } from '@nucleo/kanban-global'

const CAMPOS_REGRA: CampoRegra[] = [
  { key: 'status',   label: 'Status',    tipo: 'selecao',
    opcoes: [{ value: 'aprovado', label: 'Aprovado' }] },
  { key: 'valor',    label: 'Valor',     tipo: 'numero' },
  { key: 'entrega',  label: 'Entrega',   tipo: 'data'   },
]

<KanbanConfiguracoes
  colunas={colunas}
  camposCard={camposCard}
  regras={regras}
  camposRegra={CAMPOS_REGRA}
  onChange={(config) => {
    // sincronização em tempo real com o board
    setColunas(config.colunas)
    setCamposCard(config.camposCard)
    setRegras(config.regras)
  }}
  onSalvar={(config) => {
    api.salvarConfigKanban(config)
  }}
  onCancelar={() => setModoConfig(false)}
/>
```

## Automações — avaliarRegras

Função pura para avaliar regras ao salvar um card:

```tsx
import { avaliarRegras } from '@nucleo/kanban-global'

// Ao salvar o card no produto:
const destino = avaliarRegras(
  itemAtualizado,
  regras,
  (item, key) => item[key],   // getItemValue — genérico
  item.colunaKey,             // colunaAtual — evita mover para si mesmo
)

if (destino) {
  await onMoverItem(item.id, destino, 0)
}
```

A função retorna a `colunaDestino` da primeira regra ativa que bater (ordenada por `prioridade` crescente), ou `null` se nenhuma bater.

## Testes

```sh
npm test        # vitest run (CI)
npm run test:watch  # modo watch
```

## Acessibilidade

- Cada coluna tem `role="region"` + `aria-label` com o nome da coluna
- A drop zone tem `role="list"` + `aria-label="Cards de {coluna}"`
- Cada card tem `role="listitem"`
- Botões de ordenação e colapso têm `aria-label` dinâmico
- Navegação por teclado via `KeyboardSensor` do @dnd-kit
- Toque/mobile via `TouchSensor` (delay 250ms, tolerância 5px)
