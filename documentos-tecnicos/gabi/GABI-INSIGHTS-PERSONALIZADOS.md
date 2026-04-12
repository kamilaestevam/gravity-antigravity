# GABI Insights Personalizados — Documento Técnico

> **Produto:** produto/pedido  
> **Versão:** 1.0  
> **Data:** Abril 2026  
> **Classificação:** MEDIUM — novos endpoints + modelo Prisma + hook frontend  
> **Status:** Produção (Fases 1 e 2 ativas; Fase 3 opt-in via variável de ambiente)

---

## Índice

1. [O que é](#1-o-que-é)
2. [Arquitetura das 3 Fases](#2-arquitetura-das-3-fases)
3. [Estrutura de Arquivos](#3-estrutura-de-arquivos)
4. [Fase 1 — Motor de Insights por Role](#4-fase-1--motor-de-insights-por-role)
5. [Fase 2 — Motor de Comportamento](#5-fase-2--motor-de-comportamento)
6. [Fase 3 — Enriquecimento via LLM](#6-fase-3--enriquecimento-via-llm)
7. [API — Contratos de Endpoint](#7-api--contratos-de-endpoint)
8. [Modelo de Dados (Prisma)](#8-modelo-de-dados-prisma)
9. [Frontend — Hook e Integração](#9-frontend--hook-e-integração)
10. [Cache Strategy](#10-cache-strategy)
11. [Variáveis de Ambiente](#11-variáveis-de-ambiente)
12. [Testes](#12-testes)
13. [Operação e Monitoramento](#13-operação-e-monitoramento)
14. [Adicionando Novos Tipos de Insight](#14-adicionando-novos-tipos-de-insight)
15. [Decisões de Arquitetura e Trade-offs](#15-decisões-de-arquitetura-e-trade-offs)

---

## 1. O que é

O sistema de GABI Insights Personalizados evolui o carrossel estático do Dashboard do produto Pedido para um sistema adaptativo em 3 camadas:

| Camada | O que faz | Custo | Ativação |
|:-------|:----------|:------|:---------|
| **Fase 1** | Gera insights determinísticos ranqueados pelo role do usuário | Zero — sem LLM | Sempre ativa |
| **Fase 2** | Re-ranqueia insights com base no histórico de comportamento do usuário (últimos 30 dias) | Banco de dados | Sempre ativa após migração |
| **Fase 3** | Reescreve o texto dos insights em linguagem natural via Gabi LLM | Tokens do tenant | `GABI_INSIGHTS_LLM=true` |

**Resultado perceptível ao usuário:** um operador que filtra frequentemente por "atrasado" verá o card de pedidos atrasados sempre como primeiro insight. Um gerente verá o financeiro primeiro. A Fase 3 personaliza até a linguagem do texto — mais urgente para alertas, mais analítico para tendências.

---

## 2. Arquitetura das 3 Fases

```
GET /api/v1/pedidos/dashboard/insights
  │
  ├─ Busca KPIs agregados do banco (tenant_id)
  │
  ├─ [Fase 1] gabiInsightsService.generateInsights(kpis, role)
  │   │
  │   ├─ buildCandidates(kpis, role)          → até 7 candidatos baseados em KPIs reais
  │   ├─ ROLE_WEIGHTS[role]                   → pesos base por tipo de insight
  │   └─ sort por score × 1.0 (sem behavior)  → lista ranqueada (mín. 2 insights)
  │
  ├─ [Fase 2] behaviorTrackingService.getUserBehaviorScores(db, tenant, user)
  │   │
  │   ├─ Consulta user_behavior_events (últimos 30 dias)
  │   ├─ resolveInsightId(event, payload)     → mapeia evento → insightId
  │   ├─ Conta frequência por insightId
  │   └─ Converte: 1-2 eventos→1.2×, 3-5→1.5×, 6-10→2.0×, 11+→2.5×
  │       └─ Re-ranqueia: score_final = score_base × multiplicador
  │
  └─ [Fase 3] gabiLlmInsightsService.enhanceWithLlm(insights, kpis, tenant, user, role)
      │
      ├─ GABI_INSIGHTS_LLM=false → retorna insights sem modificação (padrão)
      ├─ GABI_INSIGHTS_LLM=true  → para cada insight:
      │   ├─ cacheKey = tenant:user:YYYY-MM-DD:insightId
      │   ├─ Cache hit  → retorna texto cacheado (TTL 6h)
      │   └─ Cache miss → POST /gabi/chat (timeout 3s)
      │       ├─ Sucesso → texto LLM salvo no cache + retornado
      │       └─ Falha   → insight original (fallback automático)
      └─ Retorna insights com texto enriquecido
```

### Fluxo de Rastreamento (Fase 2)

```
Usuário interage com a interface
  │
  ├─ Muda de rota              → useTrackBehavior (route_visited)
  ├─ Aplica filtro de coluna   → trackFilter(campo, valor)  [ListaPedidos]
  ├─ Busca no Kanban           → trackFilter('busca', termo) onBlur [KanbanPedidos]
  ├─ Clica em widget KPI       → trackWidget(widgetId)  [DashboardPedido]
  └─ Clica em link de insight  → trackInsight(insightId) [DashboardPedido]
       │
       └─ POST /api/v1/pedidos/behavior/track (fire-and-forget, 204)
            └─ trackBehaviorEvent(db, tenant, user, input) → INSERT user_behavior_events
```

---

## 3. Estrutura de Arquivos

```
produto/pedido/
│
├── server/src/
│   ├── services/
│   │   ├── gabiInsightsService.ts        ← Fases 1+2: motor determinístico + scoring
│   │   ├── behaviorTrackingService.ts    ← Fase 2: registro + score de eventos
│   │   └── gabiLlmInsightsService.ts     ← Fase 3: LLM + cache in-memory
│   │
│   └── routes/
│       ├── dashboardData.ts              ← GET /dashboard/insights (orquestra 3 fases)
│       └── behaviorTracking.ts           ← POST /behavior/track (fire-and-forget)
│
├── client/src/
│   ├── hooks/
│   │   └── useTrackBehavior.ts           ← Rastreamento automático de rotas + manual
│   │
│   ├── shared/
│   │   └── api.ts                        ← dashboardApi.insights() + tipos GabiInsightItem
│   │
│   └── pages/
│       ├── DashboardPedido.tsx           ← Carrossel, fetch de insights, trackWidget/Insight
│       ├── ListaPedidos.tsx              ← trackFilter em handleAplicarFiltro
│       └── KanbanPedidos.tsx             ← trackFilter onBlur no input de busca
│
└── prisma/
    ├── fragment.prisma                   ← Model UserBehaviorEvent
    └── migrations/
        └── 20260409120000_add_user_behavior_events/
            └── migration.sql

testes/
├── testes-e2e/pedido/
│   └── gabi-insights.spec.ts             ← 4 testes E2E Playwright @critico
└── testes-em-tela/produto/pedido/
    └── 2026-04-09-gabi-insights/         ← 7 prints headless capturados

produto/pedido/server/src/services/
├── gabiInsightsService.test.ts           ← 18 testes unitários (Vitest)
├── behaviorTrackingService.test.ts       ← 17 testes unitários (Vitest)
└── routes/
    └── behaviorTracking.test.ts          ← 5 testes funcionais (Vitest)
```

---

## 4. Fase 1 — Motor de Insights por Role

**Arquivo:** `produto/pedido/server/src/services/gabiInsightsService.ts`

### Tipos Exportados

```ts
export interface KpiSnapshot {
  total_pedidos: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  pedidos_atrasados: number
  pedidos_sem_exportador: number
  pedidos_cancelados: number
  pedidos_consolidados: number
  pedidos_importacao: number
  pedidos_exportacao: number
  qtd_saldo_total: number
  qtd_pronta_total: number
  qtd_transferida_total: number
  qtd_inicial_total: number
  valor_total: number
  valor_itens_total: number
  ticket_medio: number
  taxa_atraso: number
  taxa_transferencia: number
}

export type UserRole = 'operador' | 'gerente' | 'diretor' | 'admin' | 'default'

export interface GabiInsight {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: string                        // substituído pelo LLM na Fase 3
  stat?: { label: string; valor: string }
  textoLink?: string
  rota?: string                        // rota com filtros pré-aplicados
  score: number                        // score final = base × multiplicador
}
```

### Pesos por Role

Cada role tem um mapa `insightId → peso base`. Esses pesos determinam a ordem padrão dos insights antes da personalização comportamental.

| InsightId | operador | gerente | diretor | admin | default |
|:----------|:--------:|:-------:|:-------:|:-----:|:-------:|
| `atrasados` | **100** | 80 | 60 | 100 | 80 |
| `sem_exportador` | 90 | 70 | 50 | 100 | 70 |
| `abertos` | 70 | 60 | 40 | 100 | 70 |
| `qtd_pronta` | 80 | 50 | 30 | 100 | 50 |
| `financeiro` | 20 | **100** | **100** | 100 | 60 |
| `distribuicao` | 10 | 40 | 90 | 100 | 40 |
| `cancelados` | 60 | 65 | 45 | 100 | 50 |

**Lógica de design:**
- `operador` foca em ação imediata: atrasados > sem exportador > quantidade pronta
- `gerente` foca em financeiro e KPIs de resultado
- `diretor` foca em visão estratégica: financeiro + distribuição imp/exp
- `admin` recebe todos com peso máximo (visibilidade total)

### Candidatos Gerados

Um insight só é gerado se o KPI correspondente for > 0. Isso evita mostrar "0 pedidos atrasados" como um insight.

| InsightId | Condição de geração | Variante |
|:----------|:--------------------|:---------|
| `atrasados` | `kpis.pedidos_atrasados > 0` | `warn` |
| `sem_exportador` | `kpis.pedidos_sem_exportador > 0` | `warn` |
| `abertos` | `kpis.pedidos_abertos > 0` | `default` |
| `qtd_pronta` | `kpis.qtd_pronta_total > 0` | `default` |
| `financeiro` | `kpis.valor_total > 0` | `default` |
| `distribuicao` | `pedidos_importacao + pedidos_exportacao > 0` | `default` |
| `cancelados` | `kpis.pedidos_cancelados > 0 && total > 0` | `warn` se > 10% do total, senão `default` |

### Garantia de Mínimo 2 Insights

Se menos de 2 candidatos forem gerados (ex: banco vazio no início), o sistema usa `FALLBACK_INSIGHTS`:

```ts
const FALLBACK_INSIGHTS = [
  { id: 'status_ok',    tag: 'Status · Tudo em dia',  texto: 'Nenhuma pendência identificada...' },
  { id: 'dica_periodo', tag: 'Dica · Gabi AI',        texto: 'Use o filtro de período para explorar...' },
]
```

### normalizeRole

Normaliza strings variadas vindas de headers HTTP para os valores suportados:

```ts
normalizeRole('OPERADOR')       → 'operador'
normalizeRole('manager')        → 'gerente'
normalizeRole('SUPER_ADMIN')    → 'admin'
normalizeRole(undefined)        → 'default'
normalizeRole('desconhecido')   → 'default'
```

---

## 5. Fase 2 — Motor de Comportamento

**Arquivo:** `produto/pedido/server/src/services/behaviorTrackingService.ts`

### Schema de Validação (Zod)

```ts
const BehaviorEventSchema = z.object({
  event: z.enum([
    'route_visited',    // mudança de rota (automático via useTrackBehavior)
    'filter_applied',   // filtro de coluna aplicado
    'widget_clicked',   // clique em widget KPI do dashboard
    'column_viewed',    // visualização de coluna
    'insight_clicked',  // clique no link de ação de um insight
  ]),
  payload: z.object({
    route:         z.string().max(200).optional(),
    filter_field:  z.string().max(100).optional(),
    filter_value:  z.string().max(100).optional(),
    widget_id:     z.string().max(100).optional(),
    column_key:    z.string().max(100).optional(),
    insight_id:    z.string().max(100).optional(),
  }),
})
```

### Mapeamento Evento → InsightId

Define quais insights ganham boost de score quando certos eventos ocorrem:

```ts
const EVENT_TO_INSIGHT_MAP = {
  route_visited: {
    '/pedidos/lista?status=atrasado':      'atrasados',
    '/pedidos/lista?status=aberto':        'abertos',
    '/pedidos/lista?status=cancelado':     'cancelados',
    '/pedidos/lista?sem_exportador=true':  'sem_exportador',
  },
  filter_applied: {
    'status:atrasado':      'atrasados',
    'status:aberto':        'abertos',
    'status:cancelado':     'cancelados',
    'sem_exportador:true':  'sem_exportador',
    'valor_total':          'financeiro',
    'moeda_pedido':         'financeiro',
    'tipo_operacao':        'distribuicao',
  },
  // widget_clicked: mapeado por lógica inline (widget_id → insightId)
  // insight_clicked: direto via payload.insight_id
}
```

**Widgets mapeados por lógica inline:**

| widget_id | insightId |
|:----------|:----------|
| `kpi_valor_total`, `kpi_valor_itens`, `valor_total_trend` | `financeiro` |
| `kpi_pedidos_atrasados` | `atrasados` |
| `kpi_pedidos_abertos` | `abertos` |
| `status_dist`, `tipo_operacao_dist` | `distribuicao` |

### Escala de Multiplicadores

```
Frequência de eventos (últimos 30 dias) → Multiplicador de score
  1-2  eventos  → 1.2×
  3-5  eventos  → 1.5×
  6-10 eventos  → 2.0×
  11+  eventos  → 2.5×
```

**Exemplo de impacto:**
- Gerente com pesos base: financeiro=100, atrasados=80
- Gerente clicou 7× em insights de atrasados → multiplicador 2.0×
- Score final: financeiro=100×1.0=**100**, atrasados=80×2.0=**160**
- Resultado: atrasados sobe para o primeiro lugar

### Falha Silenciosa

Ambas as funções (`trackBehaviorEvent` e `getUserBehaviorScores`) têm try/catch silencioso:
- `trackBehaviorEvent`: loga `console.warn` mas nunca bloqueia a resposta ao usuário
- `getUserBehaviorScores`: retorna `{}` se a tabela não existir ainda (migração pendente)

Isso garante que a Fase 2 pode ser desligada sem código — basta não fazer a migração.

---

## 6. Fase 3 — Enriquecimento via LLM

**Arquivo:** `produto/pedido/server/src/services/gabiLlmInsightsService.ts`

> **Padrão:** desabilitada (`GABI_INSIGHTS_LLM=false`). Ativar somente após validar a Fase 2 em produção.

### Cache In-Memory

```ts
// Chave: `${tenantId}:${userId}:YYYY-MM-DD:${insightId}`
// TTL: 6 horas
// Auto-limpeza: ao atingir 500 entradas, remove expiradas

const cache = new Map<string, { texto: string; expiresAt: number }>()
```

**Isolamento:** a chave inclui `tenantId` obrigatoriamente — nunca há vazamento de texto entre tenants.

**Refresh diário:** a data no formato `YYYY-MM-DD` garante que os insights são regenerados a cada novo dia, mesmo que o cache não expire.

### Prompt Builder

O prompt enviado para a Gabi é construído com contexto completo:

```
Você é GABI, assistente de BI da plataforma Gravity.
Reescreva o insight abaixo em linguagem natural concisa (máximo 2 frases),
mantendo os números exatos. Adapte o tom para um usuário com papel "[role]".

Insight atual: "[insight.texto]"
Contexto adicional de KPIs:
- Total pedidos: X
- Atrasados: Y
- Sem exportador: Z
- Valor total: W
- Tipo: ALERTA — usar tom urgente | INFORMATIVO — usar tom analítico

Responda APENAS com o texto do insight, sem formatação, aspas ou explicações.
```

### Chamada ao Serviço Gabi

```
POST http://localhost:3001/api/v1/gabi/chat
Headers:
  x-internal-key: ${INTERNAL_SERVICE_KEY}
  x-tenant-id:    ${tenantId}
  x-user-id:      ${userId}
  x-product-id:   pedido
  x-gabi-quota:   ${GABI_QUOTA_PEDIDO ?? '50000'}

Body:
  { mensagem: prompt, historico: [], modo: 'analista' }

Timeout: 3 segundos (AbortSignal.timeout)
```

### Fallback Automático

Se qualquer um dos seguintes ocorrer, o insight original é retornado sem modificação:
- Gabi offline ou porta 3001 indisponível
- Timeout > 3s
- Resposta HTTP != 200
- `GABI_INSIGHTS_LLM=false` (padrão)
- Qualquer exceção não tratada

---

## 7. API — Contratos de Endpoint

### `GET /api/v1/pedidos/dashboard/insights`

**Autenticação:** `x-internal-key` + `x-tenant-id` (middleware global)

**Query Parameters:**

| Parâmetro | Tipo | Padrão | Descrição |
|:----------|:-----|:-------|:----------|
| `period` | `7d \| 30d \| 90d \| 365d` | `30d` | Período dos KPIs |
| `from` | `YYYY-MM-DD` | — | Data inicial (alternativa ao `period`) |
| `to` | `YYYY-MM-DD` | — | Data final (alternativa ao `period`) |
| `role` | `string` | header `x-user-role` | Role do usuário (fallback para `default`) |

**Headers relevantes:**
- `x-tenant-id` — isolamento de tenant (obrigatório via middleware)
- `x-user-id` — personalização da Fase 2 e cache da Fase 3
- `x-user-role` — role do usuário (se não passado via query param)

**Resposta de sucesso (200):**

```json
{
  "period": "30d",
  "role": "operador",
  "insights": [
    {
      "id": "atrasados",
      "variante": "warn",
      "tag": "Atenção · Pedidos Atrasados",
      "texto": "3 pedidos com prazo vencido. Ação imediata recomendada.",
      "stat": { "label": "Taxa de atraso", "valor": "15.0%" },
      "textoLink": "Ver atrasados",
      "rota": "/pedidos/lista?status=atrasado",
      "score": 120
    },
    {
      "id": "financeiro",
      "variante": "default",
      "tag": "Financeiro · Carteira",
      "texto": "Carteira do período totaliza R$ 500.000 em pedidos.",
      "stat": { "label": "Ticket médio por pedido", "valor": "R$ 50.000" },
      "score": 24
    }
  ]
}
```

**Resposta de erro (500):** quando a consulta de KPIs falha

```json
{ "error": { "message": "Erro ao gerar insights", "code": "INTERNAL_ERROR" } }
```

---

### `POST /api/v1/pedidos/behavior/track`

**Autenticação:** `x-internal-key` + `x-tenant-id` (middleware global)

**Body:**

```json
{
  "event": "filter_applied",
  "payload": {
    "filter_field": "status",
    "filter_value": "atrasado"
  }
}
```

**Tipos de evento aceitos:**

| event | Campos relevantes em payload |
|:------|:-----------------------------|
| `route_visited` | `route: string` |
| `filter_applied` | `filter_field: string`, `filter_value?: string` |
| `widget_clicked` | `widget_id: string` |
| `column_viewed` | `column_key: string` |
| `insight_clicked` | `insight_id: string` |

**Resposta:** `204 No Content` — sempre, independente de sucesso ou falha

> **Fire-and-forget:** o cliente não espera pela persistência no banco. A resposta 204 é enviada imediatamente após validação do schema, antes mesmo da gravação concluir.

---

## 8. Modelo de Dados (Prisma)

**Fragment:** `produto/pedido/server/prisma/fragment.prisma`

```prisma
model UserBehaviorEvent {
  id         String   @id @default(cuid())
  tenant_id  String
  product_id String?
  user_id    String

  /// Tipo: route_visited | filter_applied | widget_clicked | column_viewed | insight_clicked
  event      String

  /// JSON com dados do evento (rota, campo filtrado, widget_id, insight_id, etc.)
  payload    Json

  created_at DateTime @default(now())

  @@index([tenant_id])
  @@index([tenant_id, user_id])
  @@index([tenant_id, user_id, event])
  @@index([tenant_id, user_id, created_at])
  @@map("user_behavior_events")
}
```

**Justificativa dos índices:**

| Índice | Usado por | Por quê |
|:-------|:----------|:--------|
| `[tenant_id]` | Todas as queries | Isolamento obrigatório |
| `[tenant_id, user_id]` | `getUserBehaviorScores` | Filtro principal da query de scores |
| `[tenant_id, user_id, event]` | Queries futuras por tipo de evento | Análise segmentada |
| `[tenant_id, user_id, created_at]` | Filtro de 30 dias (`gte: since`) | Evita full scan na janela temporal |

**Migração:**

```bash
# Para ambientes novos (migration file disponível):
npx prisma migrate deploy

# Para ambientes com shadow DB indisponível (workaround):
npx prisma db push --accept-data-loss
```

Migration file: `migrations/20260409120000_add_user_behavior_events/migration.sql`

---

## 9. Frontend — Hook e Integração

### useTrackBehavior

**Arquivo:** `produto/pedido/client/src/hooks/useTrackBehavior.ts`

```ts
// Uso básico
const { trackFilter, trackWidget, trackInsight, trackColumn } = useTrackBehavior()

// Tracking automático (via useLocation — rota muda → evento disparado)
// Não requer ação manual

// Tracking de filtro (chamar após aplicar filtro)
trackFilter('status', 'atrasado')
trackFilter('valor_total')          // sem valor específico

// Tracking de widget do dashboard
trackWidget('kpi_pedidos_atrasados')

// Tracking de clique em link de insight
trackInsight('atrasados')

// Tracking de visualização de coluna
trackColumn('numero_pedido')
```

**Características:**
- Todos os métodos são `fire-and-forget` — não aguardam resposta
- Falha de rede não propaga para o usuário (try/catch silencioso)
- `route_visited` usa `useRef` para evitar disparos duplicados na mesma rota
- `trackFilter` no Kanban usa `onBlur` — evita evento por keystroke

### Integração no DashboardPedido

```ts
// Estado de insights (Fase 1+2+3)
const [insightsData, setInsightsData] = useState<GabiInsightItem[]>([])

// Carregado junto com os outros dados do dashboard (paralelo)
Promise.all([
  dashboardApi.widgets(slicers),
  dashboardApi.kpis(slicers),
  dashboardApi.charts(slicers),
  dashboardApi.insights(slicers.period),   // ← novo
])

// Render: usa endpoint ou fallback estático
const insights = insightsData.length > 0 ? insightsData : [fallback1, fallback2]
```

### Tipos em api.ts

```ts
export interface GabiInsightItem {
  id:        string
  variante:  'default' | 'warn'
  tag:       string
  texto:     string
  stat?:     { label: string; valor: string }
  textoLink?: string
  rota?:     string
  score:     number
}

export interface DashboardInsightsResponse {
  period:   string
  role:     string
  insights: GabiInsightItem[]
}

// Método de chamada
dashboardApi.insights(period?: string, range?: { from: string; to: string })
```

---

## 10. Cache Strategy

### Fase 3 — Cache In-Memory (gabiLlmInsightsService)

| Atributo | Valor |
|:---------|:------|
| Tipo | `Map<string, CacheEntry>` em memória do processo Node.js |
| TTL | 6 horas |
| Chave | `tenantId:userId:YYYY-MM-DD:insightId` |
| Limpeza automática | Quando `cache.size > 500` → remove entradas expiradas |
| Isolamento | `tenantId` na chave garante isolamento |
| Reset | Reiniciar o servidor limpa todo o cache |

**Limitação:** o cache não é compartilhado entre múltiplas instâncias do servidor. Em cenários de múltiplas réplicas (Railway com mais de 1 instância), cada réplica mantém seu próprio cache — isso implica múltiplas chamadas ao Gabi na primeira requisição por réplica, dentro do mesmo TTL.

**Solução futura:** Redis com chave compartilhada (quando Fase 3 for amplamente adotada).

### Fase 2 — Sem Cache (by design)

Os scores de comportamento são consultados no banco a cada requisição de insights. Justificativa:
- A query é filtrada por `tenant_id + user_id + created_at ≥ 30 dias` — rápida com os índices corretos
- O comportamento do usuário muda com frequência — cache introduziria staleness indesejada
- Futura otimização: memoizar por sessão (TTL 5 minutos) se a p95 de latência ultrapassar 50ms

---

## 11. Variáveis de Ambiente

| Variável | Padrão | Obrigatória | Descrição |
|:---------|:-------|:-----------:|:----------|
| `GABI_INSIGHTS_LLM` | `false` | Não | Liga a Fase 3. Manter `false` até validar Fase 2 em produção. |
| `GABI_SERVICE_URL` | `http://localhost:3001` | Não | URL do serviço Gabi (Fase 3). |
| `GABI_QUOTA_PEDIDO` | `50000` | Não | Tokens por tenant/mês para chamadas do produto Pedido à Gabi. |
| `INTERNAL_SERVICE_KEY` | — | **Sim** | Chave de autenticação S2S (já existia, reutilizada). |

---

## 12. Testes

### Cobertura

| Arquivo | Tipo | Testes | Framework |
|:--------|:-----|:------:|:----------|
| `gabiInsightsService.test.ts` | Unitário | 18 | Vitest |
| `behaviorTrackingService.test.ts` | Unitário | 17 | Vitest |
| `behaviorTracking.test.ts` | Funcional (rota) | 5 | Vitest |
| `gabi-insights.spec.ts` | E2E | 4 | Playwright |
| **Total** | | **44** | |

### Executar Testes Unitários + Funcionais

```bash
cd produto/pedido/server
npx vitest run src/services/gabiInsightsService.test.ts \
               src/services/behaviorTrackingService.test.ts \
               src/routes/behaviorTracking.test.ts --reporter=verbose
```

### Executar Testes E2E

```bash
# Requer: backend rodando na porta 8026, frontend na porta 5179
npx playwright test testes/testes-e2e/pedido/gabi-insights.spec.ts --project=pedido --reporter=list
```

### O que os Testes Cobrem

**gabiInsightsService:**
- `normalizeRole` — 5 casos (operador, gerente, diretor, admin, undefined/default)
- `generateInsights` — mínimo de 2 insights sempre (incluindo KPIs zerados)
- Ranking por role — operador→atrasados, gerente→financeiro, diretor→financeiro
- Behavior scores — multiplicadores aplicados, boost correto no ranking
- Conteúdo dos insights — números no texto, formatação BRL, porcentagem de importação

**behaviorTrackingService:**
- Schema Zod — todos os event types válidos + rejeições corretas
- `trackBehaviorEvent` — chamada ao db.create com dados corretos + falha silenciosa
- `getUserBehaviorScores` — escala 1.2×/1.5×/2.0×/2.5× por frequência + isolamento por tenant_id/user_id + retorna `{}` com db offline

**behaviorTracking (rota):**
- 204 para payloads válidos (filter, route, insight, widget)
- 204 silencioso para event inválido (não bloqueia UX)
- 204 para body vazio
- 204 quando db.create falha (fire-and-forget confirmado)

**E2E Playwright @critico:**
- Widget `.dp-gabi-card` renderiza na página sem erros de SyntaxError/TypeError
- Carrossel `.dp-gabi-track` tem ≥ 2 cards `.dp-gabi-insight-card`
- 2 botões `.dp-gabi-nav-btn` existem e são clicáveis sem erros de runtime
- Cada card tem `.dp-gabi-insight-tag` e `.dp-gabi-insight-text` não-vazios

### Gap de Cobertura Registrado

`gabiLlmInsightsService.ts` não tem testes unitários. Testável apenas com Gabi online ou mock da API `fetch`. Registrado em `documentos-tecnicos/gaps-de-cobertura.md`.

---

## 13. Operação e Monitoramento

### Diagnóstico Rápido

**Endpoint de insights retorna 500:**
```bash
# Verificar se a query de KPIs está falhando
# O erro mais comum é tenant_id inválido ou banco sem dados no período
curl -H "x-internal-key: $KEY" -H "x-tenant-id: TENANT" \
  "http://localhost:8026/api/v1/pedidos/dashboard/insights?period=30d"
```

**Insights sempre mostram fallback (status_ok / dica_periodo):**
- Tenant não tem pedidos no período selecionado — comportamento esperado
- O banco retornou KPIs zerados — verificar tabela `pedidos_comerciais`

**Fase 3 não gera texto personalizado:**
- Confirmar `GABI_INSIGHTS_LLM=true` no `.env`
- Confirmar Gabi rodando na porta 3001: `curl http://localhost:3001/health`
- O fallback é silencioso — verificar logs do servidor para `[Pedido]`

**Behavior scores não personalizam o ranking:**
- Verificar se a tabela `user_behavior_events` existe: `npx prisma db pull`
- Verificar se o hook `useTrackBehavior` está sendo chamado nos componentes
- Scores acumulam em 30 dias — em ambiente novo, pode levar dias para ter efeito visível

### Logs do Servidor

| Mensagem | Nível | Significado |
|:---------|:------|:------------|
| `[BehaviorTracking] Erro ao registrar evento (não crítico)` | WARN | Banco indisponível ou tabela inexistente — não bloqueia |
| `Erro ao gerar insights` | ERROR | Falha na query de KPIs — investigar banco |

### Limpeza Manual do Cache LLM

O cache é in-memory e se limpa automaticamente. Para forçar limpeza imediata (ex: após mudança de prompt):

```bash
# Reiniciar o servidor do produto Pedido
# No Railway: deploy para substituir a instância
# Em dev: Ctrl+C + npm run dev
```

---

## 14. Adicionando Novos Tipos de Insight

### Passo a Passo

**1. Adicionar KPI ao snapshot** (`gabiInsightsService.ts`):
```ts
export interface KpiSnapshot {
  // ... existentes
  pedidos_bloqueados: number    // ← novo campo
}
```

**2. Adicionar candidato** em `buildCandidates()`:
```ts
if (kpis.pedidos_bloqueados > 0) {
  candidates.push({
    id:       'bloqueados',
    variante: 'warn',
    tag:      'Atenção · Pedidos Bloqueados',
    texto:    `${kpis.pedidos_bloqueados} pedido(s) com liberação pendente.`,
    textoLink: 'Ver bloqueados',
    rota:     '/pedidos/lista?status=bloqueado',
    score:    weights.bloqueados ?? 0,
  })
}
```

**3. Adicionar pesos** em `ROLE_WEIGHTS` para cada role.

**4. Mapear eventos** em `EVENT_TO_INSIGHT_MAP` (`behaviorTrackingService.ts`):
```ts
route_visited: {
  '/pedidos/lista?status=bloqueado': 'bloqueados',   // ← novo
},
filter_applied: {
  'status:bloqueado': 'bloqueados',                   // ← novo
},
```

**5. Buscar o novo KPI** na query de `dashboardData.ts` (rota `GET /dashboard/insights`).

**6. Adicionar testes** em `gabiInsightsService.test.ts`:
```ts
it('insight bloqueados gerado quando há pedidos bloqueados', () => {
  const kpis = kpiBase({ pedidos_bloqueados: 2 })
  const result = generateInsights(kpis, 'operador')
  expect(result.find(r => r.id === 'bloqueados')).toBeDefined()
})
```

---

## 15. Decisões de Arquitetura e Trade-offs

### Por que 3 fases e não apenas LLM desde o início?

| Abordagem | Vantagem | Desvantagem |
|:----------|:---------|:------------|
| LLM direto | Texto sempre natural | Custo alto, latência imprevisível, falha = sem insight |
| Determinístico puro | Zero custo, zero latência, confiável | Texto padronizado, sem personalização |
| **3 fases (escolhido)** | Determinístico como base confiável, LLM como upgrade opcional | Complexidade maior |

A Fase 3 tem fallback automático — se o LLM falhar, o insight determinístico é entregue. Isso garante que o sistema nunca retorna vazio.

### Por que cache in-memory e não Redis?

Redis adicionaria uma dependência de infraestrutura ao produto Pedido. Em 2026/Q2, o volume esperado de chamadas LLM por tenant é baixo (< 50 usuários únicos/dia por tenant). O cache in-memory com TTL de 6h é suficiente. A escalabilidade horizontal é limitada (instâncias não compartilham cache), mas não é um problema no estágio atual.

### Por que `prisma db push` na migração inicial?

O ambiente de desenvolvimento tinha uma migração anterior quebrada (`20260406000000_rename_pedido_item_fields`) que causava falha no shadow database do `prisma migrate dev`. O `prisma db push --accept-data-loss` foi usado como workaround seguro (a tabela `user_behavior_events` não existia). O migration file `20260409120000_add_user_behavior_events/migration.sql` foi criado manualmente para uso em produção com `prisma migrate deploy`.

### Por que `onBlur` no Kanban e `handleAplicarFiltro` na Lista?

- **Lista:** filtros são aplicados explicitamente via popover com botão "Aplicar" — o evento ocorre exatamente uma vez por filtro aplicado
- **Kanban:** input de busca é reativo (`onChange`) — rastrear cada keystroke geraria centenas de eventos por sessão. `onBlur` captura o momento em que o usuário terminou de digitar e saiu do campo, representando uma intenção concluída

---

## Referências

| Documento | Localização |
|:----------|:-----------|
| Relatório de Impacto | `documentos-tecnicos/ajustes/2026-04-09-gabi-insights-personalizados.md` |
| Resultado dos Testes em Tela | `documentos-tecnicos/testes-em-tela/2026-04-09-gabi-insights.md` |
| GABI — Técnico (Fórmulas) | `documentos-tecnicos/gabi/GABI-TECNICO.md` |
| GABI — On-demand Tokens | `documentos-tecnicos/gabi/GABI-ONDEMAND-TOKENS.md` |
| Migration SQL | `produto/pedido/server/prisma/migrations/20260409120000_add_user_behavior_events/migration.sql` |
