# Dashboard BI — Arquitetura Tecnica

> **Data:** 2026-04-02
> **Versao:** 1.0
> **Status:** Implementado
> **Elaborado por:** Tech Lead — Dream Team de Produtos

---

## 1. Visao Geral

O Dashboard BI e um **servico tenant** do ecossistema Gravity que fornece inteligencia operacional consolidada para cada empresa (tenant). Ele agrega metricas de todos os produtos ativos do tenant em uma unica interface interativa, sem exigir acesso direto aos bancos de dados dos produtos.

### Caracteristicas Centrais

- **Agregacao via REST**: cada produto expoe um endpoint `POST /api/v1/{produto}/dashboard/widgets`. O Dashboard Service consome esses endpoints em paralelo — nunca via SQL JOIN entre bancos distintos.
- **Catalogo de 48 campos**: metricas pre-catalogadas cobrindo 8 produtos, filtradas pelas permissoes do usuario antes de chegar ao frontend.
- **48 widgets pre-configurados**: selecao instantanea do tipo de grafico ideal para cada metrica.
- **SSE (Server-Sent Events)**: atualizacoes em tempo real sem polling.
- **Motor de alertas**: disparo condicional com anti-spam de 1 hora.
- **Compartilhamento**: dashboards acessiveis publicamente via token (link, email, WhatsApp).
- **Isolamento de tenant**: duas camadas — Prisma Extension + PostgreSQL RLS.

### Produtos Suportados

| Produto | Porta | Metricas Disponiveis |
|---------|-------|---------------------|
| bid-cambio | 8025 | 6 campos |
| bid-frete | 8023 | 6 campos |
| financeiro-comex | 8029 | 6 campos |
| processo | 8026 | 6 campos |
| pedido | 8026 | 12 campos + 5 derivadas + Power BI OData |
| nf-importacao | 8028 | 6 campos |
| simula-custo | 8020 | 6 campos |
| lpco | 8027 | 6 campos |

---

## 2. Estrutura de Pastas

```
servicos-global/tenant/dashboard/
├── package.json
├── tsconfig.json
├── .env.example
├── prisma/
│   ├── fragment.prisma              # Schema do servico (NAO editar schema.prisma)
│   └── .gitkeep
├── server/
│   ├── index.ts                     # Express + middlewares + startup (porta 3001)
│   ├── routes.ts                    # Router raiz: monta sub-routers
│   ├── lib/
│   │   ├── catalog.ts               # DATA_CATALOG: 48 CatalogField + tipos + helpers
│   │   ├── query-engine.ts          # DashboardQueryEngine: executa queries multi-produto
│   │   ├── chart-advisor.ts         # suggestChartTypes: algoritmo de sugestao de grafico
│   │   ├── alert-engine.ts          # AlertEngine: checkAlerts com anti-spam e SSE
│   │   ├── sse-handler.ts           # DashboardSSEHandler: clientes SSE + heartbeat 30s
│   │   ├── widget-registry.ts       # CATALOG_WIDGETS: 48 widgets pre-configurados
│   │   ├── sharing-engine.ts        # SharingEngine: createShare/revokeShare/getShared
│   │   ├── cache.ts                 # (auxiliar) re-exporta logica de cache inline
│   │   └── errors.ts                # AppError com statusCode e code
│   └── routes/
│       ├── config.routes.ts         # CRUD de DashboardConfig
│       ├── widget.routes.ts         # POST /widgets/query + GET /widgets/:id
│       ├── catalog.routes.ts        # GET /catalog/fields + GET /catalog/widgets
│       ├── sse.routes.ts            # GET /stream/:dashboardId (SSE)
│       ├── alert.routes.ts          # CRUD de DashboardAlert
│       └── share.routes.ts          # POST /share + DELETE /share/:token + GET /share/:token
├── src/
│   ├── index.ts                     # Re-exports publicos do modulo
│   ├── store/
│   │   └── dashboardStore.ts        # Zustand store (estado global do dashboard)
│   ├── hooks/
│   │   ├── useDashboardData.ts      # Fetch de dados de widget via query-engine
│   │   ├── useDashboardSSE.ts       # Conexao SSE com reconexao automatica (5s)
│   │   └── useDashboardLayout.ts    # Gerenciamento de layout drag-and-drop
│   └── pages/
│       └── DashboardGeralPage.tsx   # Pagina principal do Dashboard
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts               # porta 5010, proxy → 3001
    ├── index.html
    └── src/
        ├── main.tsx
        └── App.tsx

nucleo-global/Dashboard/
├── index.ts                         # Re-exports: todos os componentes
├── tipos.ts                         # Tipos compartilhados (sem dependencia de servidor)
├── WidgetContainer/                 # Container com drag handle, skeleton, menu de opcoes
├── DashboardGrid/                   # Grid responsivo baseado em react-grid-layout
├── QueryBuilder/                    # Wizard 3 passos: produto → metricas → tipo de grafico
└── widgets/
    ├── KpiWidget/                   # Numero grande + delta percentual
    ├── LineChartWidget/             # Linha (Recharts)
    ├── BarChartWidget/              # Barras verticais e horizontais (Recharts)
    ├── DonutWidget/                 # Rosca / distribuicao (Recharts)
    └── TableWidget/                 # Tabela de dados com paginacao

Endpoints dos produtos (contrato obrigatorio):
  bid-cambio:       POST :8025/api/v1/bid-cambio/dashboard/widgets
  bid-frete:        POST :8023/api/v1/bid-frete/dashboard/widgets
  financeiro-comex: POST :8029/api/v1/financeiro/dashboard/widgets
  processo:         POST :8026/api/v1/processos/dashboard/widgets
  pedido:           POST :8026/api/v1/pedidos/dashboard/widgets
  pedido (BI):      GET  :8026/api/v1/analytics/pedido/{kpis|trend|distribution|items|raw|metadata}
  nf-importacao:    POST :8028/api/v1/nf-importacao/dashboard/widgets
  simula-custo:     POST :8020/api/v1/simula-custo/dashboard/widgets
  lpco:             POST :8027/api/v1/lpcos/dashboard/widgets
```

---

## 3. Decisao Arquitetural: REST API em vez de SQL JOIN

### O Problema

O Gravity possui 8 produtos, cada um com seu proprio banco de dados PostgreSQL isolado. Uma abordagem naive de BI tentaria conectar todos os bancos via um data warehouse centralizado ou SQL cross-database. Isso violaria o principio de **tenant isolation** e criaria acoplamento estrutural entre servicos independentes.

### A Solucao: Agregacao via REST

O Dashboard Service **nunca acessa diretamente** o banco de dados de nenhum produto. Em vez disso, cada produto expoe um endpoint dedicado que retorna metricas pre-calculadas. O Dashboard Service chama esses endpoints em paralelo e agrega os resultados.

```
Frontend
   │
   ▼
Dashboard Service :3001
   │
   ├── POST :8025/api/v1/bid-cambio/dashboard/widgets ──► bid_cambio_db
   ├── POST :8023/api/v1/bid-frete/dashboard/widgets ───► bid_frete_db
   ├── POST :8026/api/v1/processos/dashboard/widgets ───► processo_db
   ├── POST :8026/api/v1/pedidos/dashboard/widgets ─────► pedido_db
   │     └── GET  :8026/api/v1/analytics/pedido/* ──────► Power BI (OData v4)
   ├── POST :8028/api/v1/nf-importacao/dashboard/widgets► nf_importacao_db
   ├── POST :8029/api/v1/financeiro/dashboard/widgets ──► financeiro_comex_db
   ├── POST :8020/api/v1/simula-custo/dashboard/widgets► simula_custo_db
   └── POST :8027/api/v1/lpcos/dashboard/widgets ───────► lpco_db
                                                           (cada DB isolado por tenant)
```

### Beneficios

1. **Isolamento preservado**: o dashboard nunca lida com queries multi-tenant de outros servicos.
2. **Resiliencia**: `Promise.allSettled` garante resultado parcial se um produto estiver fora do ar.
3. **Escalabilidade independente**: cada produto calcula suas proprias metricas no seu proprio contexto.
4. **Sem schema coupling**: o Dashboard nao precisa conhecer os modelos internos dos produtos.
5. **Cache seletivo**: o Dashboard pode cachear resultados por 5 minutos sem afetar o produto original.

### Desvantagens Aceitas

- Latencia adicional de rede (~5–50ms por produto) comparado a SQL direto.
- Timeout por produto de 5 segundos — necessario para evitar degradar o dashboard inteiro.
- Cada produto precisa implementar o contrato do endpoint (ver Secao 16).

---

## 4. Prisma Fragment Schema

O schema e declarado em `prisma/fragment.prisma` e composto pelo Coordenador via `scripts/ativamente/compose-tenant-schema.ts`. Nunca editar `schema.prisma` diretamente.

```prisma
// fragment.prisma — Dashboard Service
// NAO EDITAR DIRETAMENTE o schema.prisma.
// Coordenador compoe via scripts/ativamente/compose-tenant-schema.ts

enum DashboardMode {
  PRODUCT   // Dashboard de um produto especifico
  GENERAL   // Dashboard geral (multi-produto)
}

enum WidgetType {
  CATALOG   // Widget do catalogo pre-construido
  CUSTOM    // Widget customizado pelo usuario
  GABI      // Widget gerado pela IA Gabi
}

enum ChartType {
  KPI_CARD
  LINE
  BAR
  BAR_HORIZONTAL
  DONUT
  HISTOGRAM
  FUNNEL
  GAUGE
  MAP
  TABLE
  AREA
}

// Configuracao de um dashboard (layout + filtros globais)
model DashboardConfig {
  id         String        @id @default(cuid())
  tenant_id  String
  product_id String?                           // null = dashboard geral
  user_id    String
  name       String        @default("Meu Dashboard")
  mode       DashboardMode @default(PRODUCT)
  layout     Json          @default("[]")      // Array de posicoes react-grid-layout
  filters    Json?                             // Filtros globais (periodo, workspace)
  is_default Boolean       @default(false)
  widgets    DashboardWidget[]
  alerts     DashboardAlert[]
  shares     DashboardShare[]
  created_at DateTime      @default(now())
  updated_at DateTime      @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
}

// Cada widget posicionado no grid do dashboard
model DashboardWidget {
  id           String          @id @default(cuid())
  tenant_id    String
  product_id   String?
  user_id      String
  dashboard_id String
  widget_key   String                          // Chave do catalogo ou ID customizado
  widget_type  WidgetType      @default(CATALOG)
  chart_type   ChartType       @default(KPI_CARD)
  title        String
  query_spec   Json                            // WidgetQuerySpec serializado
  position     Json            @default("{\"x\":0,\"y\":0,\"w\":2,\"h\":2}")
  config       Json?                           // Opcoes visuais extras
  dashboard    DashboardConfig @relation(fields: [dashboard_id], references: [id], onDelete: Cascade)
  created_at   DateTime        @default(now())
  updated_at   DateTime        @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
}

// Snapshot de metricas para historico e comparativo
model DashboardMetricSnapshot {
  id          String   @id @default(cuid())
  tenant_id   String
  product_id  String
  user_id     String?
  metric_key  String                           // Ex: "bid-cambio.saving_total"
  dimensions  Json?                            // Dimensoes adicionais (moeda, status)
  value       Json                             // Valor serializado (number | object)
  period_from DateTime
  period_to   DateTime
  captured_at DateTime @default(now())

  @@unique([tenant_id, product_id, metric_key, period_from, period_to])
  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
}

// Regra de alerta: metrica + condicao + threshold
model DashboardAlert {
  id             String          @id @default(cuid())
  tenant_id      String
  product_id     String?
  user_id        String
  dashboard_id   String
  widget_id      String?                       // null = monitorar em qualquer widget
  metric_key     String                        // Ex: "processo.etapas_atrasadas"
  condition      String                        // gt | lt | gte | lte | eq | change_pct
  threshold      Json                          // number | { value, pct }
  channels       String[]        @default([]) // ["in_app", "email", "whatsapp"]
  is_active      Boolean         @default(true)
  last_triggered DateTime?                     // Anti-spam: cooldown de 1 hora
  dashboard      DashboardConfig @relation(fields: [dashboard_id], references: [id], onDelete: Cascade)
  created_at     DateTime        @default(now())
  updated_at     DateTime        @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
}

// Compartilhamento por token publico
model DashboardShare {
  id              String          @id @default(cuid())
  tenant_id       String
  product_id      String?
  user_id         String
  dashboard_id    String
  share_token     String          @unique @default(cuid())
  channel         String                        // link | email | whatsapp
  recipient_email String?
  recipient_phone String?
  snapshot_data   Json?                         // Dados fixados no momento do compartilhamento
  expires_at      DateTime?                     // null = sem expiracao
  dashboard       DashboardConfig @relation(fields: [dashboard_id], references: [id], onDelete: Cascade)
  created_at      DateTime        @default(now())

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([share_token])
  @@index([tenant_id, user_id])
}
```

---

## 5. DashboardQueryEngine — Fluxo de Execucao

O `DashboardQueryEngine` e o coracao do servico. Ele recebe uma `WidgetQuerySpec` e retorna um `WidgetResult` com os dados agregados de todos os produtos necessarios.

### Fluxo Passo a Passo

```
queryEngine.execute(tenantId, userPermissions, spec)
       │
       ▼
1. assertFieldPermissions(spec.fields, userPermissions, tenantId)
   └── Para cada campo: resolve no DATA_CATALOG → verifica permissao
   └── Se sem permissao → AppError(403, 'FORBIDDEN_FIELD')
       │
       ▼
2. cacheKey = `dashboard:widget:${tenantId}:${JSON.stringify(spec)}`
   └── getFromCache(key) → se hit e nao expirado → return { ...cached, cached: true }
       │
       ▼
3. groupFieldsByProduct(spec.fields)
   └── "bid-cambio.saving_total" → Map { "bid-cambio" → ["saving_total"] }
   └── "processo.total_ativos"   → Map { "processo"   → ["total_ativos"] }
   └── Campos sem prefixo agrupados em "__global__"
       │
       ▼
4. Para cada productId: fetchProductWidgets(productId, metrics, tenantId, filters)
   └── POST http://localhost:{porta}/api/v1/{produto}/dashboard/widgets
   └── Headers: { x-internal-key, x-tenant-id, Content-Type }
   └── Body: { metrics: string[], filters: { period } }
   └── Timeout: 5 segundos (AbortController)
   └── Em caso de falha: retorna { data: {}, ok: false }
       │
       ▼
5. Promise.allSettled(productCalls)
   └── Para cada resultado:
       ├── rejected → partial = true, continua
       ├── ok = false → partial = true, continua
       └── ok = true → prefixProductData(productId, data) → Object.assign(aggregated)
       │
       ▼
6. suggestChartTypes(catalogFields, spec.operation)
   └── spec.chartType ?? suggestedTypes[0] ?? 'KPI_CARD'
       │
       ▼
7. setInCache(key, result)  [TTL: 5 minutos]
       │
       ▼
8. return WidgetResult { data, chartType, partial, cached: false, computed_at }
```

### Codigo TypeScript Real (query-engine.ts)

```typescript
export class DashboardQueryEngine {
  async execute(
    tenantId: string,
    userPermissions: string[],
    spec: WidgetQuerySpec
  ): Promise<WidgetResult> {

    // Passo 1: Permissoes
    assertFieldPermissions(spec.fields, userPermissions, tenantId)

    // Passo 2: Cache
    const key = cacheKey(tenantId, spec)
    const cached = getFromCache(key)
    if (cached) {
      return { ...cached, cached: true }
    }

    // Passo 3: Agrupamento por produto
    const groups = groupFieldsByProduct(spec.fields)
    const productIds = [...groups.keys()].filter((k) => k !== '__global__')

    // Passo 4: Chamadas paralelas
    const productCalls = productIds.map((productId) => {
      const metrics = groups.get(productId) ?? []
      return fetchProductWidgets(productId, metrics, tenantId, spec.filters)
        .then((result) => ({ productId, ...result }))
    })

    // Passo 5: Agregar com tolerancia a falhas
    const settled = await Promise.allSettled(productCalls)
    let partial = false
    const aggregated: WidgetData = {}

    for (const outcome of settled) {
      if (outcome.status === 'rejected') { partial = true; continue }
      const { productId, data, ok } = outcome.value
      if (!ok) { partial = true; continue }
      Object.assign(aggregated, prefixProductData(productId, data))
    }

    // Passo 6: Tipo de grafico
    const catalogFields = spec.fields
      .map((f) => resolveCatalogField(f))
      .filter((f): f is CatalogField => f !== undefined)

    const suggestedTypes = suggestChartTypes(
      catalogFields.length > 0 ? catalogFields : DATA_CATALOG.slice(0, 1),
      spec.operation
    )
    const resolvedChartType: ChartType = spec.chartType ?? suggestedTypes[0] ?? 'KPI_CARD'

    const result: WidgetResult = {
      data: aggregated,
      chartType: resolvedChartType,
      partial,
      cached: false,
      computed_at: new Date().toISOString(),
    }

    // Passo 7: Armazenar em cache
    setInCache(key, result)

    return result
  }

  clearCache(tenantId: string): void {
    const prefix = `dashboard:widget:${tenantId}:`
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) cache.delete(key)
    }
  }
}
```

### Mapeamento de Portas dos Produtos

```typescript
const PRODUCT_PORTS: Record<string, number> = {
  'simula-custo':     8020,
  'bid-frete':        8023,
  'bid-cambio':       8025,
  pedido:             8026,
  processo:           8026,   // mesmo servidor que pedido
  lpco:               8027,
  'nf-importacao':    8028,
  'financeiro-comex': 8029,
}

// Excecoes de path (onde o prefixo REST difere do productId)
const PRODUCT_PATH_OVERRIDES: Record<string, string> = {
  'financeiro-comex': '/api/v1/financeiro/dashboard/widgets',
  pedido:             '/api/v1/pedidos/dashboard/widgets',
  processo:           '/api/v1/processos/dashboard/widgets',
  lpco:               '/api/v1/lpcos/dashboard/widgets',
}
```

---

## 6. Data Catalog

O catalogo e declarado em `server/lib/catalog.ts` como um array estatico de `CatalogField`. Sao **48 campos** distribuidos igualmente entre 8 produtos (6 campos cada).

### Estrutura de um CatalogField

```typescript
interface CatalogField {
  key: string            // Formato: "productId.metricName"
  label: string          // Label para o usuario final
  productId: string      // ID do produto responsavel
  productPort: number    // Porta do servico do produto
  type: FieldType        // 'number' | 'currency' | 'date' | 'string' | 'percentage'
  aggregations: AggregationType[]  // Operacoes permitidas neste campo
  permission: string     // Permissao exigida (ex: 'bid-cambio:read')
  chartTypes: ChartType[]          // Tipos de grafico compativeis
}
```

### Campos por Produto

| Produto | Campo | Tipo | Agregacoes | Graficos |
|---------|-------|------|-----------|---------|
| **bid-cambio** | bid-cambio.saving_total | currency | sum, avg | KPI_CARD, LINE, BAR |
| | bid-cambio.valor_operado | currency | sum | KPI_CARD, LINE |
| | bid-cambio.cotacoes_status | string | distribution | DONUT, BAR |
| | bid-cambio.taxa_resposta | percentage | avg | KPI_CARD, GAUGE |
| | bid-cambio.economia_percentual | percentage | avg | KPI_CARD, GAUGE |
| | bid-cambio.volume_mensal | number | count, trend | LINE, BAR |
| **bid-frete** | bid-frete.saving_total | currency | sum, avg | KPI_CARD, LINE, BAR |
| | bid-frete.valor_medio | currency | avg | KPI_CARD, LINE |
| | bid-frete.cotacoes_status | string | distribution | DONUT, BAR |
| | bid-frete.saving_percentual | percentage | avg | KPI_CARD, GAUGE |
| | bid-frete.transit_time | number | avg, min, max | KPI_CARD, HISTOGRAM, BAR |
| | bid-frete.volume_mensal | number | count, trend | LINE, BAR |
| **fin-comex** | fin-comex.total_brl | currency | sum | KPI_CARD, LINE, BAR |
| | fin-comex.pendente | currency | sum | KPI_CARD, GAUGE |
| | fin-comex.pagos | currency | sum | KPI_CARD, LINE |
| | fin-comex.agendados | currency | sum | KPI_CARD |
| | fin-comex.por_moeda | string | distribution | DONUT, BAR |
| | fin-comex.vencimentos_proximos | number | count | KPI_CARD, TABLE |
| **processo** | processo.total_ativos | number | count | KPI_CARD |
| | processo.atraso_chegada | number | avg, diff_days | KPI_CARD, HISTOGRAM, LINE |
| | processo.etapas_atrasadas | number | count | KPI_CARD, TABLE |
| | processo.por_status | string | distribution | DONUT, FUNNEL, BAR |
| | processo.chegadas_7d | number | count | KPI_CARD |
| | processo.volume_mensal | number | count, trend | LINE, BAR |
| **pedido** | pedido.total_abertos | number | count | KPI_CARD |
| | pedido.valor_fob_total | currency | sum, avg | KPI_CARD, LINE, BAR |
| | pedido.por_status | string | distribution | DONUT, BAR |
| | pedido.volume_mensal | number | count, trend | LINE, BAR |
| | pedido.itens_ncm | string | distribution | BAR, TABLE |
| | pedido.valor_por_fornecedor | string | distribution | BAR_HORIZONTAL, TABLE |
| **nf-importacao** | nf-imp.total_fob | currency | sum, avg | KPI_CARD, LINE, BAR |
| | nf-imp.total_cif | currency | sum, avg | KPI_CARD, LINE |
| | nf-imp.total_tributos | currency | sum | KPI_CARD, BAR, DONUT |
| | nf-imp.nfs_por_status | string | distribution | DONUT, BAR |
| | nf-imp.tributos_breakdown | string | distribution | BAR_HORIZONTAL, DONUT |
| | nf-imp.volume_mensal | number | count, trend | LINE, BAR |
| **simula-custo** | simula-custo.landed_cost_medio | currency | avg | KPI_CARD, LINE, BAR |
| | simula-custo.estimativas_ativas | number | count | KPI_CARD |
| | simula-custo.total_tributos_medio | currency | avg | KPI_CARD |
| | simula-custo.tributos_breakdown | string | distribution | DONUT, BAR_HORIZONTAL |
| | simula-custo.ptax_media | number | avg | KPI_CARD, LINE |
| | simula-custo.volume_mensal | number | count, trend | LINE, BAR |
| **lpco** | lpco.total_ativo | number | count | KPI_CARD |
| | lpco.vencendo_30d | number | count | KPI_CARD, TABLE |
| | lpco.exigencias_pendentes | number | count | KPI_CARD, TABLE |
| | lpco.por_orgao | string | distribution | DONUT, BAR |
| | lpco.por_status | string | distribution | DONUT, BAR |
| | lpco.taxa_deferimento | percentage | avg | KPI_CARD, GAUGE |

### Filtragem por Permissao

O catalogo e filtrado pelas permissoes do usuario **antes** de ser enviado ao frontend. Isso garante que o usuario nunca veja campos de produtos que nao contratou:

```typescript
// server/lib/catalog.ts
export function getCatalogForUser(userPermissions: string[]): CatalogField[] {
  return DATA_CATALOG.filter(f => userPermissions.includes(f.permission))
}
```

---

## 7. Widget Registry — 48 Widgets Pre-Configurados

O `widget-registry.ts` declara o array `CATALOG_WIDGETS` com 48 entradas. Cada entrada e um `CatalogWidget` — uma configuracao completa e pronta para uso, sem necessidade de configuracao pelo usuario.

### Estrutura de um CatalogWidget

```typescript
interface CatalogWidget {
  id: string                              // Mesmo formato da chave do campo
  title: string                           // Titulo para exibicao
  description: string                     // Descricao para o usuario
  productId: string                       // Produto de origem
  chartType: ChartType                    // Tipo de grafico padrao
  querySpec: Omit<WidgetQuerySpec, 'chartType'>  // Spec de query pre-preenchida
  size: 'sm' | 'md' | 'lg'               // Tamanho sugerido no grid
  category: 'financeiro' | 'operacional' // Categoria para filtragem
}
```

### Distribuicao por Produto e Categoria

| Produto | Total | Financeiro | Operacional |
|---------|-------|-----------|------------|
| bid-cambio | 6 | 3 | 3 |
| bid-frete | 6 | 3 | 3 |
| financeiro-comex | 6 | 5 | 1 |
| processo | 6 | 0 | 6 |
| pedido | 6 | 2 | 4 |
| nf-importacao | 6 | 4 | 2 |
| simula-custo | 6 | 3 | 3 |
| lpco | 6 | 0 | 6 |
| **Total** | **48** | **20** | **28** |

### Helpers de Acesso

```typescript
// Retorna widgets filtrados pelas permissoes do usuario
export function getWidgetsForUser(userPermissions: string[]): CatalogWidget[]

// Retorna widgets de um produto especifico
export function getWidgetsForProduct(productId: string): CatalogWidget[]

// Busca um widget pelo ID
export function findWidget(id: string): CatalogWidget | undefined
```

### Exemplo: Widget "Saving Total — Bid Cambio"

```typescript
{
  id: 'bid-cambio.saving_total',
  title: 'Saving Total (R$)',
  description: 'Soma total de saving gerado em operacoes de cambio no periodo',
  productId: 'bid-cambio',
  chartType: 'KPI_CARD',
  querySpec: {
    fields: ['bid-cambio.saving_total'],
    operation: 'sum',
    filters: { period: '30d' },
  },
  size: 'sm',
  category: 'financeiro',
}
```

---

## 8. Chart Advisor

O `chart-advisor.ts` implementa o algoritmo `suggestChartTypes` que retorna uma lista ordenada de tipos de grafico recomendados para uma combinacao de campos e operacao.

### Algoritmo de Decisao

```typescript
export function suggestChartTypes(
  fields: CatalogField[],
  operation: AggregationType
): ChartType[] {

  // Regra 1: Diferenca entre datas → KPI com media + histograma
  if (fields.every(f => f.type === 'date') || operation === 'diff_days') {
    return ['KPI_CARD', 'HISTOGRAM', 'LINE']
  }

  // Regra 2: Distribuicao / proporcao → Donut
  if (operation === 'distribution') {
    return ['DONUT', 'BAR', 'TABLE']
  }

  // Regra 3: Tendencia temporal → Linha
  if (operation === 'trend') {
    return ['LINE', 'AREA', 'BAR']
  }

  // Regra 4: Percentual → KPI + Gauge
  if (fields.some(f => f.type === 'percentage')) {
    return ['KPI_CARD', 'GAUGE', 'LINE']
  }

  // Regra 5: Valor monetario unico
  if (fields.length === 1 && fields[0].type === 'currency') {
    if (operation === 'avg') return ['KPI_CARD', 'LINE', 'GAUGE']
    if (operation === 'sum') return ['KPI_CARD', 'LINE', 'BAR']
  }

  // Regra 6: Contagem → KPI
  if (operation === 'count') {
    return ['KPI_CARD', 'BAR', 'LINE']
  }

  // Regra 7: Multiplos campos com media → Barras comparativas
  if (fields.length > 1 && operation === 'avg') {
    return ['BAR', 'BAR_HORIZONTAL', 'LINE']
  }

  // Regra 8: Campo com FUNNEL em chartTypes
  if (fields.some(f => f.chartTypes.includes('FUNNEL'))) {
    return ['FUNNEL', 'BAR', 'TABLE']
  }

  // Fallback: chartTypes do primeiro campo do catalogo
  return fields[0]?.chartTypes ?? ['KPI_CARD']
}
```

### Tabela de Decisao Rapida

| Tipo dos Campos | Operacao | Sugestao Principal | Alternativas |
|----------------|---------|-------------------|-------------|
| date | diff_days | KPI_CARD | HISTOGRAM, LINE |
| qualquer | distribution | DONUT | BAR, TABLE |
| qualquer | trend | LINE | AREA, BAR |
| percentage | avg | KPI_CARD | GAUGE, LINE |
| currency (1 campo) | sum | KPI_CARD | LINE, BAR |
| currency (1 campo) | avg | KPI_CARD | LINE, GAUGE |
| number | count | KPI_CARD | BAR, LINE |
| multiplos | avg | BAR | BAR_HORIZONTAL, LINE |
| com FUNNEL | distribution | FUNNEL | BAR, TABLE |

---

## 9. Estrategia de Cache

O cache e implementado como um `Map` em memoria com TTL de 5 minutos. Nao ha dependencia externa de Redis — o cache e descartado ao reiniciar o processo.

### Implementacao

```typescript
const CACHE_TTL_MS = 5 * 60 * 1000   // 5 minutos

const cache = new Map<string, { data: WidgetResult; expiry: number }>()

// Formato da chave: garante isolamento por tenant + determinismo por spec
function cacheKey(tenantId: string, spec: WidgetQuerySpec): string {
  return `dashboard:widget:${tenantId}:${JSON.stringify(spec)}`
}

// Leitura: retorna null se expirado (e remove a entrada)
function getFromCache(key: string): WidgetResult | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data
}

// Escrita: armazena com timestamp de expiracao
function setInCache(key: string, data: WidgetResult): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS })
}
```

### Invalidacao por Tenant

Ao receber uma operacao de escrita (ex: salvar configuracao de dashboard), o cache do tenant e invalidado completamente:

```typescript
queryEngine.clearCache(tenantId)
// Percorre todas as chaves com prefixo "dashboard:widget:{tenantId}:"
// e as remove do Map
```

### Consideracoes

- **Isolamento garantido**: a chave inclui `tenantId`, tornando impossivel vazar dados entre tenants.
- **Sem warmup**: o primeiro acesso sempre vai aos produtos. Cache frio e esperado pos-deploy.
- **Partial results**: resultados parciais (algum produto offline) tambem sao cacheados — a flag `partial: true` e preservada no cache.
- **Evolucao futura**: se o volume de tenants justificar, o Map pode ser substituido por Redis sem mudar a interface publica.

---

## 10. SSE — Atualizacoes em Tempo Real

O `DashboardSSEHandler` gerencia conexoes persistentes HTTP/SSE com os clientes do dashboard.

### Ciclo de Vida de uma Conexao

```
Cliente abre: GET /api/v1/dashboard/stream/:dashboardId
      │
      ▼
sseHandler.addClient(clientId, tenantId, userId, dashboardId, res)
      │
      ├── Seta headers: Content-Type: text/event-stream
      │                 Cache-Control: no-cache
      │                 Connection: keep-alive
      │                 X-Accel-Buffering: no (desativa buffer do nginx)
      ├── res.flushHeaders() — inicia fluxo imediatamente
      ├── writeEvent(res, { type: 'heartbeat' }) — confirma conexao
      └── Inicia heartbeat interval de 30s (se nao ativo)

A cada 30 segundos:
      → writeEvent(client.res, { type: 'heartbeat' })

Ao fechar conexao:
      sseHandler.removeClient(clientId)
      └── Para heartbeat se clients.size === 0
```

### Tipos de Eventos SSE

```typescript
type SSEEvent =
  | { type: 'widget_update'; dashboardId?: string; widgetId?: string; data?: unknown }
  | { type: 'alert_triggered'; data?: unknown }
  | { type: 'share_created'; data?: unknown }
  | { type: 'heartbeat' }
```

### Formato Wire (protocolo SSE)

```
data: {"type":"heartbeat"}\n\n

data: {"type":"widget_update","widgetId":"clx123","dashboardId":"cly456"}\n\n

data: {"type":"alert_triggered","data":{"alert_id":"clz789","metric_key":"processo.etapas_atrasadas","current_value":12,"threshold":10,"condition":"gt"}}\n\n
```

### API de Envio

```typescript
// Para todos os clientes de um dashboard especifico (mesmo tenant)
sseHandler.sendToDashboard(tenantId, dashboardId, event)

// Para todos os clientes de um tenant (independente de dashboard)
sseHandler.sendToTenant(tenantId, event)
```

### Reconexao no Frontend (useDashboardSSE)

O hook `useDashboardSSE` implementa reconexao automatica com backoff de 5 segundos:

```typescript
es.onerror = () => {
  setConnected(false)
  es.close()
  if (!destroyedRef.current) {
    reconnectTimerRef.current = setTimeout(connect, 5_000)
  }
}
```

---

## 11. Motor de Alertas

O `AlertEngine` avalia alertas ativos de um tenant sempre que um `WidgetResult` e computado.

### Fluxo do checkAlerts

```
alertEngine.checkAlerts(prisma, tenantId, widgetResult, widgetId?)
      │
      ▼
1. Busca todos os DashboardAlert com is_active = true do tenant
   (opcionalmente filtrado por widget_id)
      │
      ▼
2. Para cada alerta:
   a. extractNumericValue(widgetResult.data, alert.metric_key)
      └── Se null (metrica ausente no resultado) → pular
   b. evaluateCondition(currentValue, condition, threshold)
   c. Se nao disparado → pular
   d. isOnCooldown(alert.last_triggered)
      └── Cooldown: 1 hora (ALERT_COOLDOWN_MS = 3_600_000 ms)
      └── Se em cooldown → pular (sem spam)
      │
      ▼
3. Para alertas disparados e fora do cooldown:
   a. sendNotification → POST :3001/api/v1/notificacoes
      (headers: x-internal-key + x-tenant-id)
   b. updateLastTriggered → prisma.dashboardAlert.update
   c. sseHandler.sendToTenant(tenantId, { type: 'alert_triggered', data: {...} })
```

### Condicoes Suportadas

| Condicao | Descricao | Threshold |
|---------|-----------|-----------|
| `gt` | Maior que | `number` |
| `lt` | Menor que | `number` |
| `gte` | Maior ou igual | `number` |
| `lte` | Menor ou igual | `number` |
| `eq` | Igual a | `number` |
| `change_pct` | Variacao percentual >= X% em relacao a referencia | `{ value: ref, pct: minimo }` |

### Exemplo de Alerta: Processos Atrasados

```json
{
  "dashboard_id": "clx_dashboard_id",
  "widget_id": null,
  "metric_key": "processo.etapas_atrasadas",
  "condition": "gt",
  "threshold": 10,
  "channels": ["in_app", "email"],
  "is_active": true
}
```

Quando `processo.etapas_atrasadas > 10`, o sistema:
1. Envia notificacao in-app ao `user_id` do alerta via servico de notificacoes (:3001)
2. Atualiza `last_triggered` no banco para iniciar cooldown
3. Emite evento SSE `alert_triggered` para todos os clientes conectados do tenant

---

## 12. Motor de Compartilhamento

O `SharingEngine` permite que usuarios compartilhem dashboards publicamente via token.

### createShare

```typescript
async createShare(prisma, {
  tenantId,
  userId,
  dashboardId,
  channel,           // 'link' | 'email' | 'whatsapp'
  recipientEmail?,   // obrigatorio se channel === 'email'
  recipientPhone?,   // obrigatorio se channel === 'whatsapp'
  expiresInHours?,   // null = sem expiracao; maximo recomendado: 720h (30 dias)
  snapshotData?,     // dados fixados no momento do compartilhamento
}): Promise<{ shareToken, shareUrl, channel, expiresAt }>
```

**Fluxo interno:**
1. Gera `shareToken` via `randomUUID()`
2. Calcula `expiresAt = now + expiresInHours * 3600000`
3. Cria `DashboardShare` no banco
4. Para `email`: dispara `sendEmailAsync` (fire-and-forget) → POST :3001/api/v1/email/enviar
5. Para `whatsapp`: dispara `sendWhatsAppAsync` (fire-and-forget) → POST :3001/api/v1/whatsapp/enviar
6. Retorna imediatamente com o token (nao aguarda envio)

### revokeShare

```typescript
async revokeShare(prisma, tenantId, shareToken): Promise<void>
// Valida que o share pertence ao tenant antes de deletar
// AppError(404) se nao encontrado
```

### getSharedDashboard

```typescript
async getSharedDashboard(prisma, shareToken): Promise<{ config, data } | null>
// Rota PUBLICA — nao exige tenant_id
// Valida expiracao: se expires_at < now → retorna null
// Retorna { config: DashboardConfig, data: snapshot_data }
```

### Canais de Compartilhamento

| Canal | Comportamento | Servico Externo |
|-------|-------------|----------------|
| `link` | Retorna URL publica, sem envio | — |
| `email` | Retorna URL + envia email async | Email Service :3001 |
| `whatsapp` | Retorna URL + envia WhatsApp async | WhatsApp Service :3001 |

A URL publica tem formato: `{APP_URL}/dashboard/share/{shareToken}`

---

## 13. Frontend — Componentes nucleo-global/Dashboard

Os componentes de UI do Dashboard residem em `nucleo-global/Dashboard/` e sao componentes React puros (sem estado de servidor, sem chamadas de API diretamente — usam os hooks de `@tenant/dashboard`).

### DashboardGrid

Wrapper em torno do `react-grid-layout`. Gerencia:
- Grade de 12 colunas responsiva
- Drag-and-drop de widgets
- Persistencia do layout via `useDashboardLayout` hook
- Modo de edicao (habilitado/desabilitado via `useDashboardStore`)

```typescript
// Posicao de widget no grid
interface WidgetPosition {
  x: number   // coluna (0-11)
  y: number   // linha
  w: number   // largura em colunas
  h: number   // altura em linhas
}
// Tamanhos padrao por tipo:
// sm → { w: 2, h: 2 }
// md → { w: 4, h: 3 }
// lg → { w: 6, h: 4 }
```

### WidgetContainer

Container padrao para todos os widgets. Fornece:
- Cabecalho com titulo e drag handle (icone de arrastar)
- Estado de carregamento: skeleton animado enquanto `loading = true`
- Estado de erro: mensagem inline com botao de retry
- Badge `PARCIAL` quando `result.partial = true` (algum produto offline)
- Badge `CACHE` quando `result.cached = true`
- Menu de opcoes (tres pontos): editar, duplicar, remover, atualizar

### Tipos de Widgets

| Componente | ChartTypes | Biblioteca | Uso Tipico |
|-----------|-----------|-----------|-----------|
| `KpiWidget` | KPI_CARD, GAUGE | Nativo | Numeros KPI, percentuais, contagens |
| `LineChartWidget` | LINE, AREA | Recharts | Series temporais, tendencias |
| `BarChartWidget` | BAR, BAR_HORIZONTAL, HISTOGRAM | Recharts | Comparativos, distribuicoes |
| `DonutWidget` | DONUT, FUNNEL | Recharts | Proporcoes, status breakdown |
| `TableWidget` | TABLE | TanStack Table | Listagens detalhadas, rankings |

### QueryBuilder

Wizard de 3 passos para criar widgets customizados:

```
Passo 1: Selecionar Produto
  └── Lista de produtos com permissao do usuario
  └── Badge com numero de campos disponiveis

Passo 2: Selecionar Metricas
  └── Lista de CatalogField do produto selecionado
  └── Selector de operacao de agregacao (sum, avg, count, distribution, trend)
  └── Selector de periodo (7d, 30d, 90d, 12m, mtd, ytd)

Passo 3: Tipo de Grafico
  └── Sugestao do ChartAdvisor (primeiro da lista)
  └── Grid de opcoes compativeis para selecao manual
  └── Preview do widget com dados reais
```

### Zustand Store (dashboardStore.ts)

```typescript
interface DashboardState {
  activeConfig: DashboardConfig | null
  widgetData: Record<string, WidgetResult>      // widgetId → resultado
  widgetLoading: Record<string, boolean>         // widgetId → loading
  widgetErrors: Record<string, string>           // widgetId → mensagem de erro
  editMode: boolean
  pendingLayout: Record<string, WidgetPosition>  // layout antes de salvar
  catalogFields: CatalogField[]                  // campos disponiveis para o usuario
  catalogWidgets: CatalogWidget[]                // widgets pre-construidos disponiveis
  isQueryBuilderOpen: boolean
}
```

---

## 14. Isolamento de Tenant

O servico implementa isolamento em **duas camadas independentes** para garantir zero vazamento entre tenants.

### Camada 1: Prisma Extension (aplicacao)

O middleware em `server/index.ts` cria uma instancia de Prisma estendida por request, injetando automaticamente `tenant_id` em todas as queries:

```typescript
app.use((req, res, next) => {
  const tenantId = req.auth?.tenantId
  if (tenantId) {
    req.prisma = prisma.$extends({
      query: {
        $allModels: {
          async findMany({ args, query }) {
            args.where = { ...args.where, tenant_id: tenantId }
            return query(args)
          },
          async findFirst({ args, query }) {
            args.where = { ...args.where, tenant_id: tenantId }
            return query(args)
          },
          async create({ args, query }) {
            (args.data as Record<string, unknown>).tenant_id = tenantId
            return query(args)
          },
          async update({ args, query }) {
            args.where = { ...args.where, tenant_id: tenantId }
            return query(args)
          },
          async delete({ args, query }) {
            args.where = { ...args.where, tenant_id: tenantId }
            return query(args)
          },
        },
      },
    }) as unknown as PrismaClient
  }
  next()
})
```

**Consequencia**: e estruturalmente impossivel para um handler esquecer de filtrar por `tenant_id` — o filtro e aplicado automaticamente.

### Camada 2: PostgreSQL RLS (banco de dados)

Politicas de Row Level Security no PostgreSQL garantem que, mesmo em caso de bug na camada de aplicacao, queries sem `tenant_id` retornem conjunto vazio em vez de dados de outro tenant.

```sql
-- Exemplo de politica RLS para DashboardConfig
ALTER TABLE "DashboardConfig" ENABLE ROW LEVEL SECURITY;

CREATE POLICY dashboard_tenant_isolation
  ON "DashboardConfig"
  USING (tenant_id = current_setting('app.current_tenant_id'));
```

### Regras de Isolamento para o Cache

A chave de cache inclui obrigatoriamente o `tenantId`:

```
dashboard:widget:{tenantId}:{JSON.stringify(spec)}
```

Impossivel colisao entre tenants mesmo que a spec seja identica.

### Isolamento nas Chamadas aos Produtos

Toda chamada `fetchProductWidgets` propaga o `x-tenant-id` header:

```typescript
headers: {
  'x-internal-key': process.env.INTERNAL_SERVICE_KEY,
  'x-tenant-id': tenantId,
}
```

O produto responsavel aplica seu proprio isolamento de tenant nos dados retornados.

---

## 15. Mapa de Portas

| Servico | Porta Backend | Porta Frontend | Prefixo de Rota |
|---------|-------------|---------------|----------------|
| Dashboard Service | **3001** | **5010** | `/api/v1/dashboard` |
| SimulaCusto | 8020 | — | `/api/v1/simula-custo/dashboard/widgets` |
| Email Service | 3001 | — | `/api/v1/email/enviar` |
| Bid Frete | 8023 | — | `/api/v1/bid-frete/dashboard/widgets` |
| Bid Cambio | 8025 | — | `/api/v1/bid-cambio/dashboard/widgets` |
| Processo + Pedido | 8026 | — | `/api/v1/processos/dashboard/widgets` |
| LPCO | 8027 | — | `/api/v1/lpcos/dashboard/widgets` |
| NF Importacao | 8028 | — | `/api/v1/nf-importacao/dashboard/widgets` |
| Financeiro Comex | 8029 | — | `/api/v1/financeiro/dashboard/widgets` |
| Notificacoes | 3001 | — | `/api/v1/notificacoes` |
| WhatsApp | 3001 | — | `/api/v1/whatsapp/enviar` |

### Rotas Internas do Dashboard Service

```
POST   /api/v1/dashboard/widgets/query          # Executar query de widget
GET    /api/v1/dashboard/widgets/:id            # Buscar widget salvo

GET    /api/v1/dashboard/configs                # Listar configs do usuario
POST   /api/v1/dashboard/configs                # Criar nova config
GET    /api/v1/dashboard/configs/:id            # Buscar config
PUT    /api/v1/dashboard/configs/:id            # Atualizar config
DELETE /api/v1/dashboard/configs/:id            # Deletar config

GET    /api/v1/dashboard/catalog/fields         # Listar campos disponiveis
GET    /api/v1/dashboard/catalog/widgets        # Listar widgets pre-construidos

GET    /api/v1/dashboard/stream/:dashboardId    # SSE stream (tempo real)

POST   /api/v1/dashboard/alerts                 # Criar alerta
GET    /api/v1/dashboard/alerts                 # Listar alertas do usuario
PUT    /api/v1/dashboard/alerts/:id             # Atualizar alerta
DELETE /api/v1/dashboard/alerts/:id             # Deletar alerta

POST   /api/v1/dashboard/share                  # Criar compartilhamento
DELETE /api/v1/dashboard/share/:token           # Revogar compartilhamento
GET    /api/v1/dashboard/share/:token           # Acessar dashboard compartilhado (publico)
```

---

## 16. Protocolo — Endpoint de Produto

Todo produto que queira aparecer no Dashboard BI DEVE implementar o seguinte contrato:

### Requisicao

```
POST /api/v1/{produto}/dashboard/widgets
Headers:
  x-internal-key: {INTERNAL_SERVICE_KEY}  (obrigatorio)
  x-tenant-id:    {tenantId}              (obrigatorio)
  Content-Type:   application/json

Body:
{
  "metrics": ["saving_total", "volume_mensal"],
  "filters": {
    "period": "30d"                        // "7d"|"30d"|"90d"|"12m"|"mtd"|"ytd"
  }
}
```

### Resposta de Sucesso (200)

```json
{
  "saving_total": 127450.80,
  "volume_mensal": [
    { "month": "2026-01", "value": 42 },
    { "month": "2026-02", "value": 38 },
    { "month": "2026-03", "value": 55 }
  ]
}
```

### Resposta Parcial (200 — metrica nao disponivel)

Se uma metrica nao puder ser calculada, o produto DEVE omiti-la da resposta (nao retornar null). O Dashboard interpretara a ausencia como `partial: true`.

### Resposta de Erro (4xx/5xx)

```json
{
  "error": "Servico indisponivel temporariamente",
  "code": "SERVICE_UNAVAILABLE"
}
```

O Dashboard trata qualquer status `!ok` como falha parcial — continua com os demais produtos.

### Implementacao em um Produto (Exemplo: Bid Cambio)

```typescript
// produto/bid-cambio/server/src/routes/dashboard.ts

router.post('/dashboard/widgets', requireInternalKey, async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] as string
  const { metrics, filters } = req.body as {
    metrics: string[]
    filters: { period: '7d' | '30d' | '90d' | '12m' | 'mtd' | 'ytd' }
  }

  const result: Record<string, unknown> = {}
  const { from, to } = resolvePeriod(filters.period)

  if (metrics.includes('saving_total')) {
    const row = await prisma.cotacao.aggregate({
      where: { tenant_id: tenantId, created_at: { gte: from, lte: to } },
      _sum: { saving_brl: true },
    })
    result.saving_total = row._sum.saving_brl?.toNumber() ?? 0
  }

  if (metrics.includes('volume_mensal')) {
    // ... agrupa por mes e retorna array
  }

  res.json(result)
})
```

### Validacoes Obrigatorias no Produto

1. **`x-internal-key`**: validar contra `process.env.INTERNAL_SERVICE_KEY` — rejeitar com 401 se invalido
2. **`x-tenant-id`**: obrigatorio — usar como filtro em todas as queries
3. **Timeout responsivo**: responder em < 4 segundos (o Dashboard tem timeout de 5s total)
4. **Nao expor dados de outros tenants**: aplicar filtro `tenant_id` em todas as queries

---

## 17. Checklist de Seguranca

### Pre-Entrega (obrigatorio para toda modificacao)

#### Autenticacao e Autorizacao
- [ ] Todas as rotas exigem `x-tenant-id` header (middleware global em index.ts)
- [ ] JWT validado pelo gateway antes de chegar ao servico
- [ ] Chamadas inter-servico validam `x-internal-key` via `requireInternalKey` middleware
- [ ] Rota publica `/share/:token` nao exige tenant — mas valida token + expiracao
- [ ] `getCatalogForUser` filtra campos por permissao antes de responder o frontend
- [ ] `assertFieldPermissions` rejeita query com campos sem permissao (403)

#### Isolamento de Tenant
- [ ] Prisma Extension injeta `tenant_id` automaticamente em todas as operacoes
- [ ] RLS PostgreSQL como segunda linha de defesa
- [ ] Chave de cache inclui `tenantId` — impossivel colisao entre tenants
- [ ] `clearCache` remove apenas entradas do tenant correto
- [ ] Chamadas aos produtos propagam `x-tenant-id`

#### Validacao de Dados
- [ ] Todos os bodies de request validados com Zod antes de qualquer query
- [ ] `WidgetQuerySpec` validada: campos devem existir no catalogo ou ser aceitos pelo produto
- [ ] Periodo de filtro limitado a enum: `7d | 30d | 90d | 12m | mtd | ytd`
- [ ] `expiresInHours` no share: maximo 720h (30 dias) para evitar compartilhamentos eternos inadvertidos
- [ ] Share token: `randomUUID()` — entropia suficiente contra brute force

#### Comunicacao
- [ ] Todas as chamadas inter-servico usam `x-internal-key` do `.env`
- [ ] Timeout de 5s em cada chamada a produto — sem risco de hang
- [ ] AbortController corretamente limpo no `finally` para evitar memory leak

#### Dados Sensiveis
- [ ] Sem `console.log` expondo dados de metricas de tenants
- [ ] `INTERNAL_SERVICE_KEY` lido de `process.env`, nunca hardcoded
- [ ] `snapshot_data` no share: apenas dados que o usuario escolheu compartilhar

#### Erros
- [ ] Todos os erros retornam via `AppError` — nunca `res.status().json()` direto
- [ ] Global error handler em `index.ts` captura erros nao tratados
- [ ] Erros de produto (produto offline) logados mas nao expostos ao usuario como 500

---

## 18. Targets de Performance

### SLA

| Metrica | Target | Condicao |
|---------|--------|---------|
| Latencia p95 (cache hit) | **< 200ms** | Resultado em cache |
| Latencia p95 (cache miss, 1 produto) | **< 500ms** | Uma chamada a produto |
| Latencia p95 (cache miss, 8 produtos) | **< 1500ms** | Todos os produtos em paralelo |
| Uptime | **99,9%** | ~8,7h downtime/ano |
| Timeout por produto | **5s** | Apos este tempo, resultado parcial |
| Cooldown de alertas | **1h** | Anti-spam entre disparos |
| Heartbeat SSE | **30s** | Mantém proxies/load balancers vivos |

### Estrategia para Atingir os Targets

```
Request → cache hit?
  ├── Sim → responder em < 10ms (Map.get e O(1))
  └── Nao → Promise.allSettled com timeout 5s por produto
              ├── Todos respondem em ~50-200ms → p95 < 500ms
              └── Algum produto lento/offline → parcial em 5s (garantido pelo timeout)
```

### Monitoramento Recomendado

```typescript
// Metricas a observar via APM (ex: Sentry Performance):
// 1. dashboard.query.duration — por (tenantId, productCount, cached)
// 2. dashboard.cache.hit_rate — % de requests servidas do cache
// 3. dashboard.product.timeout — contagem de timeouts por produto
// 4. dashboard.alert.fired — contagem de alertas disparados por tenant
// 5. dashboard.sse.connections — numero de conexoes SSE abertas
// 6. dashboard.share.created — compartilhamentos criados por canal
```

### Budget de Latencia por Componente (cache miss)

| Componente | Budget |
|-----------|--------|
| Middleware auth + tenant | ~5ms |
| assertFieldPermissions | ~1ms |
| groupFieldsByProduct | ~1ms |
| fetchProductWidgets (paralelo) | ~200-400ms |
| prefixProductData + Object.assign | ~1ms |
| suggestChartTypes | ~1ms |
| setInCache | ~1ms |
| **Total p50** | **~210ms** |
| **Total p95** | **~500ms** |

---

## Apendice A: Variaveis de Ambiente

```bash
# .env.example — Dashboard Service

# Banco de dados
DATABASE_URL="postgresql://user:pass@localhost:5432/tenant_dashboard_db"

# Porta do servico
PORT=3001

# Chave de comunicacao interna entre servicos
INTERNAL_SERVICE_KEY="gravity_internal_secret_key"

# URL base da aplicacao (para gerar links de share)
APP_URL="https://app.gravity.com.br"

# Ambiente
NODE_ENV="development"
```

---

## Apendice B: Tipos Centrais

```typescript
// Tipos exportados pelo servico (server/lib/catalog.ts)

export type ChartType =
  | 'KPI_CARD' | 'LINE' | 'BAR' | 'BAR_HORIZONTAL'
  | 'DONUT' | 'HISTOGRAM' | 'FUNNEL' | 'GAUGE'
  | 'MAP' | 'TABLE' | 'AREA'

export type AggregationType =
  | 'sum' | 'avg' | 'count' | 'min' | 'max'
  | 'diff_days' | 'distribution' | 'trend'

export type FieldType = 'number' | 'currency' | 'date' | 'string' | 'percentage'

export interface WidgetQuerySpec {
  fields: string[]                    // Ex: ["bid-cambio.saving_total", "bid-frete.saving_total"]
  operation: AggregationType
  filters: {
    period: '7d' | '30d' | '90d' | '12m' | 'mtd' | 'ytd'
    workspace_id?: string
  }
  chartType?: ChartType               // Se omitido, ChartAdvisor sugere
}

export type WidgetDataValue =
  | number
  | Record<string, number>
  | Array<{ label: string; value: number }>
  | Array<{ month: string; value: number }>

export interface WidgetResult {
  data: Record<string, WidgetDataValue>
  chartType: ChartType
  partial: boolean                    // true se algum produto nao respondeu
  cached: boolean                     // true se veio do cache in-memory
  computed_at: string                 // ISO 8601
}
```
