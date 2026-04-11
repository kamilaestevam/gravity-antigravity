# Relatório de Impacto — GABI Insights Personalizados
**Data:** 2026-04-09  
**Produto:** produto/pedido  
**Classificação:** MEDIUM — novos endpoints + modelo Prisma + hook frontend  
**Fases:** 3 (MVP → Comportamento → LLM)

---

## Resumo

Implementação do sistema completo de insights personalizados da Gabi para o Dashboard do produto Pedido. Evolução do carrossel estático para um sistema adaptativo com 3 camadas.

---

## Arquivos Criados

| Arquivo | Fase | Descrição |
|:--------|:-----|:----------|
| `produto/pedido/server/src/services/gabiInsightsService.ts` | 1 | Motor de geração de insights por role com pesos configuráveis |
| `produto/pedido/server/src/services/behaviorTrackingService.ts` | 2 | Rastreamento + scoring de comportamento do usuário |
| `produto/pedido/server/src/services/gabiLlmInsightsService.ts` | 3 | Enriquecimento via LLM com cache in-memory (TTL 6h) + fallback |
| `produto/pedido/server/src/routes/behaviorTracking.ts` | 2 | `POST /api/v1/pedidos/behavior/track` |
| `produto/pedido/client/src/hooks/useTrackBehavior.ts` | 2 | Hook frontend: rastreia rotas, filtros, widgets, insights |

## Arquivos Modificados

| Arquivo | Mudança |
|:--------|:--------|
| `produto/pedido/server/src/routes/dashboardData.ts` | Novo endpoint `GET /dashboard/insights` + imports dos 3 serviços |
| `produto/pedido/server/src/index.ts` | Registra `behaviorTrackingRouter` |
| `produto/pedido/server/prisma/fragment.prisma` | Novo model `UserBehaviorEvent` |
| `produto/pedido/client/src/shared/api.ts` | Tipos `GabiInsightItem`, `DashboardInsightsResponse` + `dashboardApi.insights()` |
| `produto/pedido/client/src/pages/DashboardPedido.tsx` | Estado `insightsData`, fetch do endpoint, render usa dados do backend |

---

## Endpoints Novos

### `GET /api/v1/pedidos/dashboard/insights`
- **Auth:** `x-internal-key` + `x-tenant-id` (middleware global)
- **Query params:** `period`, `from`, `to`, `role` (ou `x-user-role` header)
- **Resposta:** `{ period, role, insights: GabiInsight[] }`
- **Fases ativas:** 1 (role), 2 (behavior), 3 (LLM via `GABI_INSIGHTS_LLM=true`)

### `POST /api/v1/pedidos/behavior/track`
- **Auth:** `x-internal-key` + `x-tenant-id` (middleware global)  
- **Body:** `{ event: BehaviorEventType, payload: BehaviorPayload }`
- **Resposta:** `204 No Content` (fire-and-forget)

---

## Modelo Prisma

```prisma
model UserBehaviorEvent {
  tenant_id  String
  user_id    String
  event      String    // route_visited | filter_applied | widget_clicked | insight_clicked
  payload    Json
  created_at DateTime
  
  @@index([tenant_id])
  @@index([tenant_id, user_id])
  @@index([tenant_id, user_id, event])
  @@index([tenant_id, user_id, created_at])
}
```

**Migração necessária:** `npx prisma migrate dev --name add-user-behavior-events`

---

## Variáveis de Ambiente Novas

| Variável | Padrão | Descrição |
|:---------|:-------|:----------|
| `GABI_INSIGHTS_LLM` | `false` | Liga Fase 3 (LLM). Manter `false` até validar Fase 2. |
| `GABI_QUOTA_PEDIDO` | `50000` | Já existia. Controla tokens por tenant/mês. |

---

## Arquitetura das 3 Fases

```
GET /dashboard/insights
  │
  ├─ [Fase 1] gabiInsightsService.generateInsights(kpis, role)
  │   └─ Pesos por role: operador → atrasados primeiro
  │                      gerente  → financeiro primeiro
  │                      diretor  → distribuição primeiro
  │
  ├─ [Fase 2] behaviorTrackingService.getUserBehaviorScores(tenant, user)
  │   └─ Últimos 30 dias de eventos → multiplicadores 1.2× a 2.5×
  │   └─ Silencioso se tabela não existir ainda
  │
  └─ [Fase 3] gabiLlmInsightsService.enhanceWithLlm(insights, kpis)
      └─ GABI_INSIGHTS_LLM=true → chama Gabi com timeout 3s
      └─ Cache in-memory: tenant+user+date+insightId, TTL 6h
      └─ Fallback automático ao texto determinístico
```

---

## Testes Recomendados

- [ ] `GET /dashboard/insights?period=30d` retorna ≥ 2 insights
- [ ] Role `operador` → insight de atrasados primeiro (se houver)
- [ ] Role `gerente` → insight financeiro primeiro
- [ ] `POST /behavior/track` retorna 204 e não bloqueia
- [ ] Após 5+ eventos de `filter_applied:status:atrasado` → score de `atrasados` > 1.0
- [ ] `GABI_INSIGHTS_LLM=false` (padrão) → texto determinístico, sem chamada Gabi
- [ ] `GABI_INSIGHTS_LLM=true` com Gabi offline → fallback sem erro

---

## Riscos

| Risco | Mitigação |
|:------|:----------|
| Tabela `user_behavior_events` não migrada | `getUserBehaviorScores` captura erro e retorna `{}` |
| Gabi offline ou timeout | `enhanceWithLlm` retorna insights originais |
| Cache crescendo indefinidamente | Limpeza automática ao atingir 500 entradas |
| Role ausente no header | `normalizeRole(undefined)` → `'default'` |
