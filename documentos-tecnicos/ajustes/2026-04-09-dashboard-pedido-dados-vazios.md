# Dashboard Pedido — Widgets Vazios ("Dados parciais" / "--")

**Data:** 2026-04-09
**Severidade:** HIGH
**Decisão:** AJUSTE (3 correções cirúrgicas)

---

## Causa Raiz

### Bug 1 — CRITICAL: `DashboardConfig` inexistente no schema.prisma

O arquivo `produto/pedido/server/src/routes/dashboardWidgets.ts` usa `db.dashboardConfig.findFirst()`
para persistir/recuperar a configuração de widgets — mas o model `DashboardConfig` **não existe**
em `produto/pedido/server/prisma/schema.prisma`.

**Efeito:** Toda chamada para `GET/PUT /api/v1/pedidos/dashboard/widgets` lança TypeError
(`TypeError: Cannot read properties of undefined (reading 'findFirst')`),
retornando HTTP 500 silencioso.

**Por que os widgets aparecem mesmo assim:** O `dashboardStore.ts` usa Zustand `persist` com
`localStorage` (`name: 'gravity:pedido:dashboard'`). Os widgets padrão (`DEFAULT_WIDGETS`) são
persistidos no localStorage na primeira visita. A tela renderiza via localStorage — nunca via API.

### Bug 2 — HIGH: Zod schema divergente no backend de persistência

O `QuerySpecSchema` em `dashboardWidgets.ts` declara:
```ts
fields: z.array(z.string())  // espera string[]
```
Mas o frontend envia:
```ts
fields: [{ key: 'total_pedidos', operation: 'COUNT' }]  // FieldQuerySpec[]
```

Além disso, `chart_type` aceita apenas `['KPI_CARD', 'LINE', 'BAR', 'DONUT', 'TABLE', 'SCATTER']`
mas o frontend usa também `'AREA' | 'BAR_HORIZONTAL' | 'DISTRIBUTION'`.

**Efeito:** Todo `PUT /api/v1/pedidos/dashboard/widgets` retorna 400. Nenhuma personalização de
widget é salva no banco — apenas no localStorage local do usuário.

### Bug 3 — MEDIUM: Tipos `DerivedMetric`, `ActiveFilter`, `GlobalSlicers` não exportados de `@nucleo/dashboard`

`dashboardStore.ts` importa esses tipos de `@nucleo/dashboard`:
```ts
import type { ..., DerivedMetric, ActiveFilter, GlobalSlicers } from '@nucleo/dashboard'
```

Mas `nucleo-global/Dashboard/dashboard-global/src/index.ts` não os exporta.
Os tipos existem em `tipos.ts` mas não chegam ao barrel de exportação.

**Efeito:** Em TypeScript strict mode, os tipos resolvem como `any` implícito. Não causa erro de
runtime (imports de tipo são apagados pelo compilador), mas causa problema em checagem estática
e pode gerar comportamento inesperado com ferramentas de análise.

---

## Por que aparecem "Dados parciais" e "--"

O fluxo em `DashboardPedido.tsx`:

```ts
useEffect(() => {
  Promise.all([
    dashboardApi.kpis(slicers.period),   // GET /api/v1/pedidos/dashboard/kpis
    dashboardApi.trend('12m', 'month'),  // GET /api/v1/pedidos/dashboard/trend
  ])
    .then(([kpis, trend]) => {
      setKpisData(kpis)    // ← só chega aqui se ambas as chamadas OK
      setTrendData(trend.value)
    })
    .catch(err => console.error(...))    // ← kpisData permanece null
    .finally(() => setLoadingData(false))
}, [slicers.period])
```

Quando `kpisData` é null (chamada falhou), `renderWidget` usa o fallback:
```ts
const result = kpisData
  ? buildWidgetResult(...)
  : { data: {}, chartType: widget.chart_type, partial: true, ... }  // ← partial: true
```

`WidgetContainer` exibe o badge "Dados parciais" quando `result.partial === true`.
`KpiValue` exibe "--" quando `data[fieldKey]` é undefined/null.

**Causas possíveis para falha na API de KPIs/Trend:**
1. `INTERNAL_SERVICE_KEY` vazio ou diferente entre cliente (`.env`) e servidor
2. `x-tenant-id` vazio (shell não inicializado antes da primeira chamada)
3. Servidor não rodando na porta 8026

Os endpoints de dados (`/kpis`, `/trend`) são implementados corretamente e usam modelos
existentes (`Pedido`, `PedidoItem`). Se o servidor estiver rodando com variáveis corretas,
esses endpoints funcionam.

---

## Arquivos a Modificar

| Arquivo | Linha(s) | Mudança |
|---------|----------|---------|
| `nucleo-global/Dashboard/dashboard-global/src/index.ts` | 49–63 | Adicionar `DerivedMetric`, `ActiveFilter`, `GlobalSlicers` no bloco de export de tipos |
| `produto/pedido/server/src/routes/dashboardWidgets.ts` | 29–42 | Corrigir `QuerySpecSchema` para aceitar `FieldQuerySpec[]` e adicionar chart_types faltando |
| `produto/pedido/server/prisma/schema.prisma` | após último model | Adicionar model `DashboardConfig` com `tenant_id`, `product_id`, `widgets_json` e índices |

---

## Sugestão de Widgets Padrão (DEFAULT_WIDGETS)

Já implementados corretamente em `dashboardStore.ts` com os seguintes widgets:

### Linha 1 — KPIs (row y=0)
| id | título | chart_type | field |
|----|--------|-----------|-------|
| `kpi_total_pedidos` | Total de Pedidos | KPI_CARD | `total_pedidos` |
| `kpi_pedidos_abertos` | Pedidos Abertos | KPI_CARD | `pedidos_abertos` |
| `kpi_valor_total` | Valor Total | KPI_CARD | `valor_total` |
| `kpi_ticket_medio` | Ticket Médio | KPI_CARD | derivedMetricId: `ticket_medio` |

### Linha 2 — Séries (row y=2)
| id | título | chart_type | field |
|----|--------|-----------|-------|
| `pedidos_por_mes` | Pedidos por Mês | LINE | `total_pedidos` |
| `valor_total_trend` | Evolução do Valor Total | LINE | `valor_total` |

### Linha 3 — Distribuição (row y=5)
| id | título | chart_type | fields |
|----|--------|-----------|--------|
| `status_dist` | Distribuição por Status | DISTRIBUTION | abertos, em_andamento, consolidados, cancelados, draft |
| `kpi_qtd_inicial` | Qtd. Inicial Total | KPI_CARD | `qtd_inicial_total` |
| `kpi_valor_itens` | Valor Total dos Itens | KPI_CARD | `valor_itens_total` |

Esta configuração está correta e cobre os campos disponíveis no schema do produto Pedido.

---

## Decisão: AJUSTE

Os 3 bugs são correções cirúrgicas:
1. Adicionar 3 tipos ao barrel de export do nucleo-global
2. Corrigir o Zod schema do dashboardWidgets backend
3. Adicionar model DashboardConfig ao schema.prisma

Nenhuma mudança arquitetural é necessária. O fluxo de dados está correto.
