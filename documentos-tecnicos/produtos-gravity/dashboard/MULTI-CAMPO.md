# Dashboard BI — Multi-Campo: Decisões, Contratos e Plano de Implementação

> **Data:** 2026-04-03
> **Versão:** 1.0
> **Status:** Aprovado — aguardando implementação
> **Origem:** Revisão Dream Team de Produtos + aprovação do dono do produto

---

## 1. Contexto e Problema

O sistema atual de Dashboard permite ao usuário selecionar até 5 campos no QueryBuilder (Passo 1), mas a renderização ignora silenciosamente todos os campos exceto `fields[0]`. O usuário acredita que está configurando um gráfico multi-série, mas apenas a primeira métrica é exibida.

### Estado atual (QUEBRADO)

```ts
// DashboardPedido.tsx — renderWidget()
const field = widget.query_spec.fields[0]  // ← fields[1..n] nunca usados

// DashboardPedido.tsx — mockResult()
const field = widget.query_spec.fields[0]  // ← idem

// LineChartWidget.tsx
fieldKey: string  // ← aceita apenas UM campo

// BarChartWidget.tsx
fieldKey: string  // ← aceita apenas UM campo
```

O widget `status_dist` (DONUT padrão) é um hack: o `mockResult` detecta `chart_type === 'DONUT'` e retorna um objeto `{ status_dist: {...} }` hardcoded, ignorando completamente os campos declarados em `query_spec.fields`.

---

## 2. Decisões Aprovadas (imutáveis)

| ID | Decisão | Regra |
|----|---------|-------|
| **D1** | LINE / AREA / BAR / BAR_HORIZONTAL com múltiplos campos | Cada campo = série separada. Cores fixas do palette. Legenda sempre visível. Tooltip crosshair mostra todos os valores no mesmo ponto. BAR suporta modo agrupado e empilhado. |
| **D2** | Operação por campo | Cada campo tem sua própria operação. Auto-fill quando o campo só suporta uma operação. Se todos os campos auto-fillam para a mesma operação, colapsa em seletor único. |
| **D3** | Campos com unidades incompatíveis | Avisar + permitir **somente** com eixo Y duplo. Máximo 2 tipos de unidade por widget. Eixo esquerdo = primeiro tipo selecionado, direito = segundo. Bloquear seleção de 3º tipo diferente. |
| **D4** | DONUT | **Não aceita multi-campo.** Máximo 1 campo. Para distribuição multi-campo existe o tipo `DISTRIBUTION` (ver seção 4). |

---

## 3. Novos Contratos de Tipos

### 3.1 WidgetQuerySpec — atualizado

```ts
// nucleo-global/Dashboard/tipos.ts

export interface FieldQuerySpec {
  key: string        // chave do campo no catálogo
  operation: string  // operação específica deste campo: SUM, COUNT, AVG, MIN, MAX
}

export interface WidgetQuerySpec {
  fields: FieldQuerySpec[]        // ← MUDANÇA: era string[], agora objetos com operação própria
  filters: {
    period: string
    status?: string[]
  }
  chartType?: ChartType
}
```

**Migração de compatibilidade:** widgets salvos com `fields: string[]` (formato antigo) devem ser convertidos na store via função `migrateQuerySpec` antes de qualquer operação.

```ts
// Função de migração (a implementar na dashboardStore)
function migrateQuerySpec(spec: WidgetQuerySpec): WidgetQuerySpec {
  if (spec.fields.length === 0) return spec
  if (typeof spec.fields[0] === 'string') {
    return {
      ...spec,
      fields: (spec.fields as unknown as string[]).map(key => ({
        key,
        operation: spec.operation ?? 'SUM',  // fallback do formato antigo
      })),
    }
  }
  return spec
}
```

### 3.2 ChartType — atualizado

```ts
export type ChartType =
  | 'KPI_CARD'
  | 'LINE'
  | 'AREA'
  | 'BAR'
  | 'BAR_HORIZONTAL'
  | 'DONUT'          // ← máximo 1 campo
  | 'DISTRIBUTION'   // ← NOVO: multi-campo, mesmo tipo de unidade
  | 'HISTOGRAM'
  | 'FUNNEL'
  | 'GAUGE'
  | 'MAP'
  | 'TABLE'
```

### 3.3 WidgetResult — atualizado

```ts
export interface WidgetSeriesPoint {
  month: string
  [fieldKey: string]: number | string  // ex: { month: '2026-01', total_pedidos: 142, pedidos_atrasados: 18 }
}

export interface WidgetDistributionSlice {
  key: string    // chave do campo
  label: string  // label do catálogo
  value: number
  unit: 'number' | 'currency' | 'percentage'
}

export type WidgetDataValue =
  | number                                    // KPI_CARD, GAUGE
  | Record<string, number>                    // DISTRIBUTION, DONUT
  | WidgetSeriesPoint[]                       // LINE, AREA, BAR multi-série
  | Array<{ label: string; value: number }>   // BAR mono-série legado
  | Array<{ month: string; value: number }>   // LINE mono-série legado
  | WidgetDistributionSlice[]                 // DISTRIBUTION (novo)

export interface WidgetResult {
  data: Record<string, WidgetDataValue>
  series?: WidgetSeriesPoint[]            // NOVO: dados multi-série normalizados
  slices?: WidgetDistributionSlice[]      // NOVO: dados de distribuição normalizados
  chartType: ChartType
  partial: boolean
  cached: boolean
  computed_at: string
  unitTypes?: ('number' | 'currency' | 'percentage')[]  // NOVO: tipos de unidade presentes
  dualAxis?: boolean                      // NOVO: true quando há 2 tipos de unidade incompatíveis
}
```

### 3.4 CatalogField — atualizado

```ts
export interface CatalogField {
  key: string
  label: string
  productId: string
  type: 'number' | 'currency' | 'date' | 'string' | 'percentage'
  aggregations: string[]
  permission: string
  chartTypes: ChartType[]
  dimension?: string   // NOVO (opcional): ex: 'status' — habilita futura rota Option B (GROUP BY)
}
```

---

## 4. Tipo DISTRIBUTION

### Comportamento

- Renderiza como **donut chart**
- Cada campo selecionado = uma fatia
- Valor da fatia = valor agregado do campo no período (`operation` individual por campo, D2)
- **Restrição:** todos os campos devem ter o mesmo `type` (unidade). Se houver incompatibilidade → bloquear no QueryBuilder (diferente do LINE que usa eixo duplo)
- Tooltip: `label + valor absoluto + percentagem do total das fatias`
- Fatia com valor 0: ocultar
- Máximo de fatias = `MAX_FIELDS` (5 — herdado do QueryBuilder)
- Valor total das fatias = 100% (soma dos valores de todos os campos)

### Exemplo de dado esperado

```ts
// WidgetResult para DISTRIBUTION
{
  slices: [
    { key: 'pedidos_abertos',       label: 'Pedidos Abertos',   value: 312, unit: 'number' },
    { key: 'pedidos_em_andamento',  label: 'Em Andamento',      value: 483, unit: 'number' },
    { key: 'pedidos_atrasados',     label: 'Pedidos Atrasados', value: 87,  unit: 'number' },
  ],
  chartType: 'DISTRIBUTION',
  ...
}
```

### Diferença em relação ao DONUT

| | DONUT | DISTRIBUTION |
|--|-------|--------------|
| Campos | 1 campo | 2–5 campos |
| Fatias | Quebradas por dimensão interna do dado | Uma por campo |
| Unidade | Qualquer | Obrigatório mesma unidade |
| Use case | Ex: NFs por status (1 campo com breakdown) | Ex: Abertos + Andamento + Atrasados |

---

## 5. QueryBuilder — Mudanças por Passo

### Passo 1 — Seleção de Campos (mudanças)

1. **Badge de tipo** em cada campo: `R$` (currency), `#` (number), `%` (percentage)
2. **Aviso de incompatibilidade de unidade** inline ao selecionar o 2º tipo diferente:
   > ⚠️ "Campos com unidades diferentes (R$ e #) vão usar eixo Y duplo neste gráfico."
3. **Bloqueio** ao tentar selecionar um 3º tipo de unidade diferente:
   > ❌ "Este widget já tem 2 tipos de unidade (R$ e #). Remova um antes de adicionar %."
4. **Restrição para DISTRIBUTION**: se o tipo de gráfico selecionado for `DISTRIBUTION`, bloquear seleção de campos com unidade diferente do primeiro campo selecionado.
5. **Restrição para DONUT**: máximo 1 campo (bloquear o 2º campo se DONUT estiver selecionado no Passo 3 — ou retroativamente avisar).

### Passo 2 — Configuração (mudanças)

**Antes (atual):**
```
[ Título do widget ]
[ Operação: SUM ▾ ]  ← única para todos os campos
[ Período: 30d ▾  ]
```

**Depois (novo):**
```
[ Título do widget ]

Campos selecionados:
┌─────────────────────────────────────────────┐
│ Total de Pedidos (#)       [ COUNT ▾ ]       │  ← auto-fill, sem dropdown se só 1 opção
│ Valor Total      (R$)      [ SUM   ▾ ]       │
│ Pedidos Atrasados (#)      [ COUNT ]  (fixo) │
└─────────────────────────────────────────────┘

[ Período: 30d ▾ ]
```

**Regra de colapso:** se todos os campos auto-fillam para a mesma operação E nenhum tem múltiplas opções → exibe seletor único colapsado com label "Operação (todos os campos)".

### Passo 3 — Visualização (mudanças)

1. **Filtrar tipos de gráfico** com base nos campos selecionados:
   - Se selecionou campos com `chartTypes` incompatíveis → desabilitar o tipo (com tooltip explicativo)
   - Ex: `DONUT` desabilitado se mais de 1 campo selecionado
   - Ex: `DISTRIBUTION` habilitado apenas se 2+ campos da mesma unidade
2. **Preview live** (mock) mostrando como ficará o gráfico com os campos selecionados antes de salvar
3. **Badge "Eixo Y duplo"** visível se os campos têm unidades diferentes e o tipo selecionado suporta eixo duplo

---

## 6. Componentes a Criar/Modificar

### 6.1 `LineChartWidget` — refatorar para multi-série

**Arquivo:** `nucleo-global/Dashboard/widgets/LineChartWidget/LineChartWidget.tsx`

**Contrato novo:**
```ts
export interface LineChartWidgetProps {
  title: string
  series: Array<{
    fieldKey: string
    label: string
    color: string
    data: Array<{ month: string; value: number }>
    yAxisId: 'left' | 'right'   // para eixo Y duplo
  }>
  dualAxis?: boolean
  leftUnit?: 'number' | 'currency' | 'percentage'
  rightUnit?: 'number' | 'currency' | 'percentage'
  showArea?: boolean
}
```

**Comportamento:**
- Múltiplas `<Line>` (ou `<Area>`) com cores distintas
- `<YAxis yAxisId="left">` e `<YAxis yAxisId="right" orientation="right">` quando `dualAxis=true`
- `<Legend>` sempre visível
- Tooltip customizado mostrando todos os valores no ponto hovered (crosshair)
- Formatação de valor por unidade: `R$` para currency, `` para number, `%` para percentage

### 6.2 `BarChartWidget` — refatorar para multi-série

**Arquivo:** `nucleo-global/Dashboard/widgets/BarChartWidget/BarChartWidget.tsx`

**Contrato novo:**
```ts
export interface BarChartWidgetProps {
  title: string
  series: Array<{
    fieldKey: string
    label: string
    color: string
    data: Record<string, number> | Array<{ month: string; value: number }>
    yAxisId: 'left' | 'right'
  }>
  mode?: 'grouped' | 'stacked'   // default: 'grouped'
  dualAxis?: boolean
  horizontal?: boolean
}
```

**Comportamento:**
- Múltiplas `<Bar>` com cores distintas e legenda
- `mode='stacked'` usa `stackId="a"` no Recharts
- `mode='grouped'` é o padrão (barras lado a lado)
- Eixo Y duplo idêntico ao LineChartWidget quando `dualAxis=true`

### 6.3 `DistributionWidget` — criar novo

**Arquivo:** `nucleo-global/Dashboard/widgets/DistributionWidget/DistributionWidget.tsx`

**Contrato:**
```ts
export interface DistributionWidgetProps {
  slices: Array<{
    key: string
    label: string
    value: number
    unit: 'number' | 'currency' | 'percentage'
    color?: string
  }>
}
```

**Comportamento:**
- Donut chart via Recharts `<PieChart>` com `innerRadius`
- Cores do palette do design system (sequência fixa)
- Tooltip: `label + valor formatado + percentagem`
- Fatias com `value === 0` não são renderizadas
- `<Legend>` com ícone circular e fontSize 11px

### 6.4 `QueryBuilder` — atualizar

**Arquivo:** `nucleo-global/Dashboard/QueryBuilder/QueryBuilder.tsx`

Mudanças detalhadas na seção 5.

### 6.5 `dashboardStore` — migração + novos campos

**Arquivo:** `produto/pedido/client/src/stores/dashboardStore.ts`

- Adicionar `migrateQuerySpec` executado no `persist` → `onRehydrateStorage`
- Incrementar `version: 3` para forçar migração de dados salvos em localStorage

### 6.6 `DashboardPedido` — atualizar renderWidget + mockResult

**Arquivo:** `produto/pedido/client/src/pages/DashboardPedido.tsx`

- `mockResult` deve produzir `series: WidgetSeriesPoint[]` para widgets LINE/BAR multi-campo
- `mockResult` deve produzir `slices: WidgetDistributionSlice[]` para DISTRIBUTION
- `renderWidget` deve passar `series` ao invés de `fieldKey` para LINE/BAR/AREA
- `renderWidget` deve passar `slices` ao DistributionWidget
- Remover o hack do DONUT com `status_dist` hardcoded — substituir pelo widget padrão

### 6.7 `dashboardCatalog` — adicionar campo `dimension`

**Arquivo:** `produto/pedido/client/src/shared/dashboardCatalog.ts`

- Adicionar `dimension?: string` em campos que representam estados de uma mesma entidade
- Exemplo: `pedidos_abertos`, `pedidos_em_andamento`, `pedidos_atrasados` → `dimension: 'status_pedido'`
- Esse campo não altera comportamento atual, prepara futura rota Option B (GROUP BY)

---

## 7. Palette de Cores por Série

Sequência fixa para séries múltiplas (não aleatória):

```ts
export const SERIES_COLORS = [
  'var(--accent)',    // indigo — série 1
  '#34d399',         // verde  — série 2
  '#f59e0b',         // âmbar  — série 3
  '#f87171',         // vermelho — série 4
  '#60a5fa',         // azul   — série 5
] as const
```

Regra: série 1 sempre usa `var(--accent)` (cor de destaque do tenant). As demais são fixas nessa ordem.

---

## 8. Lógica de Eixo Y Duplo

```ts
// Utilitário a implementar em nucleo-global/Dashboard/utils/axisUtils.ts

export function resolveAxisAssignment(
  fields: Array<{ key: string; type: CatalogField['type'] }>
): { assignments: Record<string, 'left' | 'right'>; dualAxis: boolean } {
  const types = [...new Set(fields.map(f => f.type))]
  const unitGroups = {
    currency: ['currency'],
    count: ['number', 'percentage'],
  }

  // Determina se há 2 grupos de unidades incompatíveis
  const hasCurrency = types.includes('currency')
  const hasCount = types.some(t => ['number', 'percentage'].includes(t))
  const dualAxis = hasCurrency && hasCount

  const assignments: Record<string, 'left' | 'right'> = {}
  for (const f of fields) {
    if (!dualAxis) {
      assignments[f.key] = 'left'
    } else {
      assignments[f.key] = f.type === 'currency' ? 'left' : 'right'
    }
  }

  return { assignments, dualAxis }
}
```

---

## 9. DashboardPainelEditarModal — atualizar

O modal de edição de widget em `PedidosDashboard.tsx` exibe atualmente `Campo(s): fields.join(', ')`. Com o novo formato `FieldQuerySpec[]`, deve exibir:

```
Campo(s)    total_pedidos (COUNT)
            valor_total (SUM)
Tipo        LINE
Período     30 dias
```

---

## 10. Testes Obrigatórios

### Unitários (`nucleo-global`)
- `LineChartWidget` com 1 série (compatibilidade com formato legado)
- `LineChartWidget` com 2 séries, mesma unidade, sem eixo duplo
- `LineChartWidget` com 2 séries, unidades diferentes, com eixo duplo
- `BarChartWidget` modo grouped vs stacked
- `DistributionWidget` com 3 fatias, fatia com valor 0 oculta
- `resolveAxisAssignment` para todos os cenários de tipo

### Funcionais (`produto/pedido`)
- Criar widget LINE com 2 campos → verificar que ambas as séries renderizam
- Criar widget DISTRIBUTION com 3 campos da mesma unidade → verificar 3 fatias
- Tentar criar DISTRIBUTION com campos de unidades diferentes → verificar bloqueio
- Tentar adicionar 3º tipo de unidade no QueryBuilder → verificar bloqueio
- Migração: abrir dashboard com dados no formato antigo (string[]) → verificar que renderiza corretamente após migração

---

## 11. Arquivos a Tocar (sumário)

| Arquivo | Tipo | Mudança |
|---------|------|---------|
| `nucleo-global/Dashboard/tipos.ts` | Modificar | Novos tipos: `FieldQuerySpec`, `WidgetSeriesPoint`, `WidgetDistributionSlice`, `DISTRIBUTION` em `ChartType` |
| `nucleo-global/Dashboard/widgets/LineChartWidget/LineChartWidget.tsx` | Refatorar | Multi-série + eixo duplo |
| `nucleo-global/Dashboard/widgets/BarChartWidget/BarChartWidget.tsx` | Refatorar | Multi-série + grouped/stacked + eixo duplo |
| `nucleo-global/Dashboard/widgets/DistributionWidget/DistributionWidget.tsx` | Criar | Novo widget |
| `nucleo-global/Dashboard/widgets/DistributionWidget/index.ts` | Criar | Re-export |
| `nucleo-global/Dashboard/QueryBuilder/QueryBuilder.tsx` | Modificar | Passo 1 (badges + validação de unidade), Passo 2 (operação por campo), Passo 3 (filtro de tipos + preview) |
| `nucleo-global/Dashboard/index.ts` | Modificar | Exportar `DistributionWidget` |
| `nucleo-global/Dashboard/utils/axisUtils.ts` | Criar | `resolveAxisAssignment` |
| `produto/pedido/client/src/stores/dashboardStore.ts` | Modificar | `migrateQuerySpec` + `version: 3` + remover `DEFAULT_WIDGETS` com hack DONUT |
| `produto/pedido/client/src/pages/DashboardPedido.tsx` | Modificar | `mockResult` multi-série, `renderWidget` novo contrato, remover hack `status_dist` |
| `produto/pedido/client/src/shared/dashboardCatalog.ts` | Modificar | Adicionar `dimension?` nos campos de status |

---

## 12. O Que NÃO Muda

- `DashboardGrid` — sem alterações (grid layout é independente)
- `WidgetContainer` — sem alterações (wrapper de UI)
- `dashboardStore` — sem alterações na estrutura de store, apenas migração + version bump
- Backend `servicos-global/tenant/dashboard/` — sem alterações nesta fase (mock no frontend)
- `DonutWidget` existente — sem alterações (segue aceitando 1 campo, formato atual)
- Qualquer outro produto além de `pedido` — sem alterações nesta fase

---

## 13. Ordem de Implementação (dependências)

```
1. tipos.ts              ← base de tudo
2. axisUtils.ts          ← utilitário independente
3. LineChartWidget       ← depende de tipos.ts
4. BarChartWidget        ← depende de tipos.ts
5. DistributionWidget    ← depende de tipos.ts
6. nucleo-global/Dashboard/index.ts  ← depende de 3+4+5
7. QueryBuilder          ← depende de tipos.ts
8. dashboardCatalog.ts   ← independente
9. dashboardStore.ts     ← depende de tipos.ts
10. DashboardPedido.tsx  ← depende de tudo acima
11. Testes               ← depende de tudo acima
```

---

## 14. Definição de Pronto (DoD)

- [ ] `tipos.ts` atualizado com novos contratos
- [ ] `FieldQuerySpec[]` no lugar de `string[]` em toda a base de código
- [ ] `LineChartWidget` renderiza múltiplas séries com legenda e tooltip crosshair
- [ ] `BarChartWidget` renderiza múltiplas séries em modo grouped e stacked
- [ ] `DistributionWidget` criado e exportado pelo `nucleo-global/Dashboard/index.ts`
- [ ] `QueryBuilder` Passo 1 com badges de tipo e validação de unidade
- [ ] `QueryBuilder` Passo 2 com operação por campo e auto-fill
- [ ] `QueryBuilder` Passo 3 com filtro de tipos compatíveis
- [ ] `DashboardPedido` sem qualquer uso de `fields[0]` isolado
- [ ] Hack `status_dist` removido e substituído por widget DISTRIBUTION
- [ ] Migração de dados legados funcionando (version bump na store)
- [ ] Todos os testes unitários e funcionais passando
- [ ] Demo acessível em `http://localhost:5181` com os novos comportamentos visíveis
