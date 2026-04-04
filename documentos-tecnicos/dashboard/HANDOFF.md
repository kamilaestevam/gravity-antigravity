# Dashboard BI — Handoff para Engenharia

> **Entregue em:** 2026-04-02
> **Status:** Implementado e testado
> **Próxima fase:** Redis cache, Gabi insights automáticos, exportação PDF

---

## O Que Foi Entregue

### Backend — `servicos-global/tenant/dashboard/server/`

#### Bibliotecas (`server/lib/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `catalog.ts` | Define os tipos `CatalogField` e `CatalogWidget`, exporta `DATA_CATALOG` com as 48 métricas de 8 produtos, e as funções `getCatalogForUser`, `getCatalogByProduct`, `resolveCatalogField` |
| `query-engine.ts` | `DashboardQueryEngine` — orquestra a execução de queries: valida permissões, consulta cache in-memory (TTL 5 min), agrupa campos por produto, chama cada produto via REST com `Promise.allSettled` e agrega os resultados |
| `chart-advisor.ts` | `suggestChartTypes` — determina os tipos de gráfico mais adequados com base no tipo de campo e na operação (ex.: `distribution` → DONUT, `trend` → LINE, `percentage` → GAUGE) |
| `alert-engine.ts` | `AlertEngine.checkAlerts` — avalia alertas ativos do tenant contra um `WidgetResult`, dispara notificação in-app via serviço de notificações (porta 8013), atualiza `last_triggered` no banco e emite evento SSE; possui cooldown anti-spam de 1 hora |
| `sse-handler.ts` | `DashboardSSEHandler` — gerencia conexões Server-Sent Events por cliente; emite heartbeat a cada 30 s; expõe `sendToDashboard` (por dashboard) e `sendToTenant` (para todo o tenant) |
| `widget-registry.ts` | `CATALOG_WIDGETS` — 48 instâncias pré-construídas de `CatalogWidget`, uma por métrica; funções `getWidgetsForProduct`, `getWidgetsForUser`, `findWidget` |
| `sharing-engine.ts` | `SharingEngine` — cria registros `DashboardShare` no banco, envia email (porta 8022) ou WhatsApp (porta 8019) de forma fire-and-forget, valida expiração e revoga compartilhamentos |
| `errors.ts` | Classe `AppError` com `statusCode` e `code`; usada em todas as rotas para respostas de erro padronizadas |
| `cache.ts` | Cache in-memory com TTL de 5 min, limite de 1.000 entradas e evicção de expirados; usado como camada auxiliar para `MetricaSnapshot` |

#### Rotas (`server/routes/`)

| Arquivo | Endpoints |
|---------|-----------|
| `config.routes.ts` | `GET /api/v1/dashboard/configs` — lista dashboards do usuário; `POST /api/v1/dashboard/configs` — cria novo config; `GET /api/v1/dashboard/configs/:id` — detalha config com widgets; `PUT /api/v1/dashboard/configs/:id` — atualiza layout/name/filters/is_default; `DELETE /api/v1/dashboard/configs/:id` — remove (protegido: não pode remover o padrão se houver outros) |
| `widget.routes.ts` | `POST /api/v1/dashboard/widgets/query` — executa query via `DashboardQueryEngine`; `POST /api/v1/dashboard/widgets` — persiste widget em `DashboardWidget`; `PUT /api/v1/dashboard/widgets/:id` — atualiza posição/título/chartType; `DELETE /api/v1/dashboard/widgets/:id` — remove widget |
| `catalog.routes.ts` | `GET /api/v1/dashboard/catalog/fields` — campos do `DATA_CATALOG` filtrados por permissões (suporta `?product_id=`); `GET /api/v1/dashboard/catalog/widgets` — widgets pré-construídos filtrados por permissões; `GET /api/v1/dashboard/catalog/suggest` — sugestão de chart types para campos e operação |
| `sse.routes.ts` | `GET /api/v1/dashboard/sse/:dashboardId` — estabelece conexão SSE; fecha automaticamente ao desconectar |
| `alert.routes.ts` | `GET /api/v1/dashboard/alerts` — lista alertas; `POST /api/v1/dashboard/alerts` — cria alerta com condição e canais; `PUT /api/v1/dashboard/alerts/:id` — atualiza condição/threshold/canais/is_active; `DELETE /api/v1/dashboard/alerts/:id` — remove; `POST /api/v1/dashboard/alerts/:id/test` — teste manual com último snapshot da métrica |
| `share.routes.ts` | `POST /api/v1/dashboard/shares` — cria compartilhamento (link, email ou whatsapp); `GET /api/v1/dashboard/shares` — lista compartilhamentos do usuário; `DELETE /api/v1/dashboard/shares/:id` — revoga; `GET /api/v1/dashboard/shares/public/:token` — rota pública sem auth para visualizar snapshot compartilhado |

---

### Endpoints de Produto (7 produtos atendidos)

Cada produto expõe `POST /api/v1/{produto}/dashboard/widgets` que recebe `{ metrics: string[], filters: { period: string } }` e retorna um objeto com os valores calculados. O serviço de dashboard chama esses endpoints via REST com `x-internal-key`.

| Produto | Porta | Path real | Métricas expostas |
|---------|-------|-----------|-------------------|
| **bid-cambio** | 8025 | `/api/v1/bid-cambio/dashboard/widgets` | `saving_total`, `valor_operado`, `cotacoes_status`, `taxa_resposta`, `economia_percentual`, `volume_mensal` |
| **bid-frete** | 8023 | `/api/v1/bid-frete/dashboard/widgets` | `saving_total`, `valor_medio`, `cotacoes_status`, `saving_percentual`, `transit_time`, `volume_mensal` |
| **financeiro-comex** | 8029 | `/api/v1/financeiro/dashboard/widgets` | `total_brl`, `pendente`, `pagos`, `agendados`, `por_moeda`, `vencimentos_proximos` |
| **processo** | 8026 | `/api/v1/processos/dashboard/widgets` | `total_ativos`, `atraso_chegada`, `etapas_atrasadas`, `por_status`, `chegadas_7d`, `volume_mensal` |
| **pedido** | 8026 | `/api/v1/pedidos/dashboard/widgets` | `total_pedidos`, `pedidos_abertos`, `pedidos_em_andamento`, `pedidos_atrasados`, `valor_total`, `cobertura_pendente`, `valor_itens_total`, `qtd_total`, `itens_prontos`, `qtd_atual_total`, `qtd_transferida_total`, `qtd_inicial_total` |
| **nf-importacao** | 8028 | `/api/v1/nf-importacao/dashboard/widgets` | `total_fob`, `total_cif`, `total_tributos`, `nfs_por_status`, `tributos_breakdown`, `volume_mensal` |
| **simula-custo** | 8020 | `/api/v1/simula-custo/dashboard/widgets` | `landed_cost_medio`, `estimativas_ativas`, `total_tributos_medio`, `tributos_breakdown`, `ptax_media`, `volume_mensal` |
| **lpco** | 8027 | `/api/v1/lpcos/dashboard/widgets` | `total_ativo`, `vencendo_30d`, `exigencias_pendentes`, `por_orgao`, `por_status`, `taxa_deferimento` |

> **Nota:** O produto `pedido` passou a ter servidor dedicado em `produto/pedido/server/` (porta 8026) desde 2026-04-03. Além do endpoint de widgets, expõe 6 endpoints de analytics nativos para integração Power BI (OData v4) — ver seção abaixo.

---

### Integração Nativa Power BI — Pedido (adicionado em 2026-04-03)

O servidor `produto/pedido/server/` expõe um conjunto de endpoints compatíveis com Power BI via OData v4. Autenticação por Bearer token (`ANALYTICS_API_KEY`) + header `x-tenant-id`.

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/middleware/analyticsAuth.ts` | Valida Bearer token para acesso externo (Power BI, Metabase, Tableau) |
| `src/routes/analytics.ts` | 6 endpoints OData: `/metadata`, `/kpis`, `/trend`, `/distribution`, `/items`, `/raw` |
| `src/routes/dashboardWidgets.ts` | Persistência de configuração de widgets em banco (`GET`/`PUT`/`DELETE`) |

**Variáveis de ambiente adicionais:**

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `ANALYTICS_API_KEY` | Sim (para Power BI) | Bearer token validado pelo middleware `analyticsAuth` |
| `ALLOWED_ORIGINS` | Não | Lista separada por vírgula de origens CORS permitidas (padrão: `http://localhost:5179`) |

**Como conectar no Power BI Desktop:**
1. Obter Dados → Web
2. URL: `http://seu-dominio/api/v1/analytics/pedido/kpis?period=12m`
3. Avançado → Adicionar cabeçalho: `Authorization: Bearer <ANALYTICS_API_KEY>` e `x-tenant-id: <id>`
4. Repetir para `/trend`, `/distribution`, `/raw` conforme necessário
5. O endpoint `/metadata` descreve o schema — Power BI usa para configurar tipos automaticamente

---

### Frontend

#### `produto/pedido/` — Dashboard BI + servidor (adicionado em 2026-04-03)

| Arquivo | Descrição |
|---------|-----------|
| `client/src/pages/DashboardPedido.tsx` | Dashboard completo com 16 widgets padrão, toolbar com slicers, cross-filtering, sugestões inteligentes e QueryBuilder |
| `client/src/shared/dashboardCatalog.ts` | 12 `EnrichedCatalogField` com `semanticType`, `domain` e `complementaryFields` |
| `client/src/shared/dashboardSuggestions.ts` | Motor de sugestão com 5 regras semânticas + `suggestChartType` + `getComplementaryFields` |
| `client/src/shared/derivedMetrics.ts` | 5 métricas derivadas built-in com fórmulas puras + helpers de persistência |
| `client/src/stores/dashboardStore.ts` | Zustand store com `persist` — widgets, activeFilters, slicers, userDerivedMetrics, editMode |
| `server/src/index.ts` | Express server porta 8026 — helmet, cors, middlewares em ordem correta |
| `server/src/middleware/requireInternalKey.ts` | Validação S2S via `x-internal-key` (timingSafeEqual) |
| `server/src/middleware/tenantIsolation.ts` | Prisma Extension que injeta `tenant_id` em todas as queries |
| `server/src/middleware/analyticsAuth.ts` | Bearer token para acesso externo (Power BI) |
| `server/src/routes/analytics.ts` | 6 endpoints OData v4 para Power BI/BI externos |
| `server/src/routes/dashboardWidgets.ts` | Persistência de configuração de widgets (GET/PUT/DELETE) |

#### `nucleo-global/Dashboard/`

| Componente | Descrição |
|------------|-----------|
| `DashboardGrid/DashboardGrid.tsx` | Grid responsivo — `ResizeObserver` manual (WidthProvider removido por incompatibilidade CJS→ESM) |
| `QueryBuilder/QueryBuilder.tsx` | Interface para montar `WidgetQuerySpec` — usa `ModalPassoPassoGlobal` como chrome do wizard (Design System § 12) |
| `WidgetContainer/WidgetContainer.tsx` | Contêiner com estados de loading, erro e dados; wrapper em torno dos widgets |
| `widgets/KpiWidget/KpiWidget.tsx` | Widget de KPI simples — exibe valor único com label |
| `widgets/BarChartWidget/BarChartWidget.tsx` | Widget de gráfico de barras (vertical) |
| `widgets/DonutWidget/` | Widget de gráfico donut para distribuições |
| `widgets/LineChartWidget/` | Widget de série temporal (linha/área) |
| `widgets/TableWidget/` | Widget de tabela para dados tabulares e breakdowns |

#### `servicos-global/tenant/dashboard/src/`

| Arquivo | Descrição |
|---------|-----------|
| `components/KPICard.tsx` | Componente de card de KPI usado na página de dashboard geral |
| `hooks/useDashboardData.ts` | Hook para buscar dados de widget via `POST /query` |
| `hooks/useDashboardLayout.ts` | Hook para ler e persistir layout do dashboard no `DashboardConfig` |
| `hooks/useDashboardSSE.ts` | Hook que abre conexão SSE e despacha eventos para o store |
| `pages/DashboardGeralPage.tsx` | Página principal de dashboard do tenant (modo GENERAL) |
| `store/dashboardStore.ts` | Zustand store — mantém configs carregadas, widgets em cache e estado de alertas pendentes |

---

### Testes

#### Testes Unitários — `testes/testes-unitarios/dashboard/`

| Suite | Cobre |
|-------|-------|
| `catalog.test.ts` | `getCatalogForUser`, `getCatalogByProduct`, `resolveCatalogField`, filtros por permissão |
| `chart-advisor.test.ts` | `suggestChartTypes` para todas as combinações de tipo de campo e operação |
| `query-engine.test.ts` | Cache hit/miss, agrupamento de campos, resiliência com `Promise.allSettled`, resultado parcial |
| `alert-engine.test.ts` | Avaliação de condições (gt, lt, gte, lte, eq, change_pct), cooldown anti-spam, disparo de notificação |
| `widget-registry.test.ts` | `getWidgetsForProduct`, `getWidgetsForUser` com filtros de permissão, `findWidget` |
| `sse-handler.test.ts` | Registro/remoção de clientes, `sendToDashboard`, `sendToTenant`, heartbeat, cleanup |

#### Testes Funcionais — `testes/testes-funcionais/dashboard/`

| Suite | Cobre |
|-------|-------|
| `config.routes.test.ts` | CRUD completo de `DashboardConfig`, regra de is_default, validação Zod |
| `widget.routes.test.ts` | Query via engine, criação/atualização/remoção de `DashboardWidget`, validação de ownership |
| `catalog.routes.test.ts` | Campos e widgets filtrados por permissão, sugestão de chart types |
| `alert.routes.test.ts` | CRUD de alertas, teste manual de alerta, filtro por is_active |
| `share.routes.test.ts` | Criação de share por canal, rota pública, revogação, expiração |
| `product-dashboard-endpoints.test.ts` | Endpoints de widget dos 7 produtos, resposta com métricas corretas |
| `tenant-isolation.test.ts` | Verificação cross-tenant: tenant A não acessa dados do tenant B |

---

## Como Adicionar um Novo Produto ao Dashboard

Siga estes 6 passos na ordem abaixo:

### 1. Criar o endpoint de widgets no servidor do produto

No servidor do novo produto (ex.: `produto/meu-produto/server/`), crie ou edite o arquivo de rotas e adicione:

```typescript
// POST /api/v1/meu-produto/dashboard/widgets
router.post('/dashboard/widgets', requireInternalKey, async (req, res, next) => {
  const { metrics, filters } = req.body
  const tenantId = req.headers['x-tenant-id'] as string
  // ... calcular métricas e retornar objeto { metricName: valor }
  res.json({ metrica_a: 123, metrica_b: 456 })
})
```

### 2. Registrar a porta em `PRODUCT_PORTS`

Em `servicos-global/tenant/dashboard/server/lib/query-engine.ts`, adicione a entrada no objeto `PRODUCT_PORTS`:

```typescript
const PRODUCT_PORTS: Record<string, number> = {
  // ... entradas existentes ...
  'meu-produto': 8030, // porta definida em contracts.json
}
```

### 3. Adicionar override de path se necessário

Se o path do endpoint não segue o padrão `/api/v1/{productId}/dashboard/widgets`, adicione em `PRODUCT_PATH_OVERRIDES` no mesmo arquivo:

```typescript
const PRODUCT_PATH_OVERRIDES: Record<string, string> = {
  // ... entradas existentes ...
  'meu-produto': '/api/v1/meus-produtos/dashboard/widgets', // plural, ou path customizado
}
```

Produtos que seguem o padrão exato (ex.: `bid-cambio`, `bid-frete`, `nf-importacao`, `simula-custo`) **não precisam** de override.

### 4. Adicionar entradas em `DATA_CATALOG`

Em `servicos-global/tenant/dashboard/server/lib/catalog.ts`, adicione um `CatalogField` para cada métrica:

```typescript
// ─── MEU PRODUTO (port 8030) ─────────────────────────────────────
{ key: 'meu-produto.metrica_a', label: 'Métrica A',  productId: 'meu-produto', productPort: 8030, type: 'currency', aggregations: ['sum', 'avg'], permission: 'meu-produto:read', chartTypes: ['KPI_CARD', 'LINE'] },
{ key: 'meu-produto.metrica_b', label: 'Métrica B',  productId: 'meu-produto', productPort: 8030, type: 'number',   aggregations: ['count'],       permission: 'meu-produto:read', chartTypes: ['KPI_CARD'] },
```

### 5. Adicionar widgets pré-construídos em `CATALOG_WIDGETS`

Em `servicos-global/tenant/dashboard/server/lib/widget-registry.ts`, adicione uma entrada `CatalogWidget` para cada métrica:

```typescript
{
  id: 'meu-produto.metrica_a',
  title: 'Métrica A',
  description: 'Descrição clara para o usuário final',
  productId: 'meu-produto',
  chartType: 'KPI_CARD',
  querySpec: { fields: ['meu-produto.metrica_a'], operation: 'sum', filters: { period: '30d' } },
  size: 'sm',
  category: 'financeiro', // ou 'operacional'
},
```

### 6. Registrar a rota no index do produto

No `index.ts` do servidor do produto, certifique-se de que a rota de dashboard está registrada antes do error handler:

```typescript
app.use('/api/v1/meu-produto', dashboardRouter)
```

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `INTERNAL_SERVICE_KEY` | Sim | Chave compartilhada entre serviços; validada pelo middleware `requireInternalKey` em todas as chamadas REST entre serviços |
| `DATABASE_URL` | Sim | Conexão com o banco de dados PostgreSQL do serviço de dashboard (modelos: `DashboardConfig`, `DashboardWidget`, `DashboardAlert`, `DashboardShare`, `MetricaSnapshot`) |
| `PORT` | Não | Porta de escuta do servidor (padrão do template: 3001; porta real definida em `contracts.json`) |
| `NODE_ENV` | Não | `development` ou `production`; controla nível de log e comportamentos de debug |
| `APP_URL` | Não | URL base da aplicação, usada pelo `SharingEngine` para compor `shareUrl` (padrão: `http://localhost:3000`) |

> O arquivo `.env.example` está em `servicos-global/tenant/dashboard/server/.env.example`.

---

## Decisões de Design Importantes

### 1. Agregação via REST por produto, não JOIN em banco único

**Contexto:** O Dashboard precisa consolidar métricas de 8 produtos diferentes, cada um com seu próprio banco PostgreSQL isolado.

**Decisão:** O `DashboardQueryEngine` chama o endpoint `POST .../dashboard/widgets` de cada produto via HTTP, recebe os valores já calculados e os agrega em memória.

**Motivo:** O tenant isolation do Gravity proíbe que qualquer serviço acesse diretamente o banco de outro produto. Não há um banco de dados central. Um JOIN cross-product seria arquiteturalmente impossível sem violar as regras de isolamento.

**Trade-off:** Latência adicional de rede por produto consultado (mitigada pelo cache de 5 min e pelo `Promise.allSettled` paralelo).

---

### 2. Cache in-memory ao invés de Redis (Redis é Fase 2)

**Contexto:** Queries de widget podem ser lentas se todos os produtos estiverem ocupados.

**Decisão:** Cache em `Map<string, { data, expiry }>` com TTL de 5 minutos e chave composta por `tenantId + JSON(spec)`.

**Motivo:** Redis não estava disponível no escopo desta entrega. O cache in-memory resolve o problema para instâncias únicas e mantém o serviço funcional sem dependência de infraestrutura adicional.

**Trade-off:** Em múltiplas instâncias do serviço (horizontal scaling), cada instância tem seu próprio cache — cache miss em instâncias diferentes para o mesmo tenant/query. A Fase 2 substitui por Redis com `ioredis` para cache compartilhado.

---

### 3. SSE ao invés de WebSocket para atualizações em tempo real

**Contexto:** O dashboard precisa de atualizações em tempo real (alertas disparados, novos dados de widgets).

**Decisão:** Server-Sent Events (SSE) via `GET /api/v1/dashboard/sse/:dashboardId`, usando o padrão `data: {...}\n\n`.

**Motivo:** SSE segue o mesmo padrão já estabelecido no codebase (outros serviços de tenant usam SSE). É mais simples de implementar, não requer handshake, funciona sobre HTTP/1.1, e é suficiente para o caso de uso (servidor → cliente unidirecional). WebSocket seria over-engineering neste estágio.

**Trade-off:** SSE é unidirecional. Se o cliente precisar enviar eventos ao servidor em tempo real (ex.: colaboração em tempo real), será necessário migrar para WebSocket.

---

### 4. Insights Gabi sob demanda, não automáticos no carregamento

**Contexto:** A Gabi (assistente IA) poderia gerar insights automáticos ao carregar o dashboard.

**Decisão:** O `query-engine.ts` contém a chamada à Gabi como código preparado mas não conectado. Os insights são gerados apenas quando o usuário solicita explicitamente.

**Motivo:** Se os insights fossem automáticos, cada carregamento de dashboard dispararia N chamadas à API da Gabi (uma por widget). Com 10+ widgets e múltiplos usuários simultâneos, o custo de tokens de IA e a latência de carregamento seriam proibitivos. A arquitetura correta é gerar insights sob demanda ou em background assíncrono.

**Fase 2:** Implementar geração de insights via job agendado ou botão "Analisar com Gabi" por dashboard.

---

### 5. `Promise.allSettled` para resiliência parcial

**Contexto:** Um dashboard pode solicitar métricas de múltiplos produtos ao mesmo tempo. Se um produto estiver fora do ar, o que acontece?

**Decisão:** O `DashboardQueryEngine` usa `Promise.allSettled` (não `Promise.all`) ao chamar os produtos em paralelo. Quando um produto falha, o campo `partial: true` é retornado no `WidgetResult`.

**Motivo:** `Promise.all` cancelaria toda a query se um único produto falhasse, deixando o dashboard completamente em branco. Com `allSettled`, o dashboard exibe os dados disponíveis e indica visualmente quais widgets estão parcialmente indisponíveis — melhor experiência para o usuário.

**Trade-off:** O frontend precisa tratar o campo `partial: true` e exibir um indicador adequado por widget.

---

## Dívidas Técnicas Conhecidas

### DT-001 — Redis substituindo cache in-memory (Prioridade: Alta)

**Problema:** O cache atual é por instância de processo. Em deployments com múltiplas instâncias do serviço de dashboard (Railway auto-scaling), cada instância terá caches independentes, resultando em cache miss cruzado e carga desnecessária nos produtos.

**Solução:** Substituir `Map<string, CacheEntry>` em `query-engine.ts` e `cache.ts` por `ioredis` com chaves no formato `dashboard:widget:{tenantId}:{hash(spec)}` e TTL de 5 min via `SETEX`.

**Impacto:** Necessita variável de ambiente `REDIS_URL` e ajuste no `contracts.json`.

---

### DT-002 — Tabela `MetricaSnapshot` sem população (Prioridade: Média)

**Problema:** O model `MetricaSnapshot` existe no schema Prisma mas nunca é populado automaticamente. Queries históricas cross-produto (que dependem de snapshots pré-calculados) retornam dados vazios. O endpoint `POST /alerts/:id/test` usa `metricaSnapshot.findFirst` que sempre retorna `null`.

**Solução:** Implementar um job cron (ou BullMQ) que periodicamente chama os endpoints de produto, salva os valores em `MetricaSnapshot` e permite consultas históricas sem depender de produtos online.

**Impacto:** Necessita infraestrutura de filas (Fase 2 ou Fase 3).

---

### DT-003 — Integração Gabi não conectada (Prioridade: Média)

**Problema:** O `query-engine.ts` contém código preparado para chamar a Gabi, mas o endpoint não está registrado e o fluxo não está wired no frontend.

**Solução:** Criar rota `POST /api/v1/dashboard/insights` que receba um `widgetResult` e o `context` do dashboard, chame o serviço Gabi (porta a definir em `contracts.json`) e retorne os insights gerados.

**Impacto:** Depende do serviço Gabi estar disponível e ter permissões espelhadas do tenant.

---

### DT-004 — Endpoints de produto autenticados apenas por `x-internal-key` (Prioridade: Alta)

**Problema:** Os endpoints `POST .../dashboard/widgets` dos produtos validam apenas `x-internal-key`. Não há validação JWT do usuário solicitante. Qualquer processo interno com a chave pode consultar dados de qualquer tenant.

**Solução:** Adicionar `x-tenant-id` ao header e validar no middleware de cada produto que o `tenant_id` do header bate com o `tenant_id` das queries ao banco — já é feito, mas não há JWT validation explícita no path de dashboard.

**Impacto:** Segurança. Deve ser tratado antes de ir para produção.

---

### DT-005 — Canal WhatsApp de alertas não configurado por tenant (Prioridade: Baixa)

**Problema:** O `AlertEngine` e o `alert.routes.ts` suportam `channels: ['whatsapp']`, mas o serviço de WhatsApp (porta 8019) exige configuração de número de telefone por tenant que ainda não existe no fluxo de onboarding do Configurador.

**Solução:** Adicionar campo `whatsapp_phone` na configuração de tenant no Configurador e validar sua presença antes de aceitar alertas com canal `whatsapp`.

**Impacto:** UX e configuração — dependência do Configurador.

---

## O Que Foi Entregue em 2026-04-03 — Dashboard BI Pedido

| # | Item | Status |
|---|------|--------|
| 1 | Motor de sugestão semântica (5 regras: count→DONUT, currency→LINE, qty→BAR, trend, derivadas→KPI) | ✅ Entregue |
| 2 | Cross-filtering entre widgets (Zustand `activeFilters`) | ✅ Entregue |
| 3 | Slicers globais (period, status, dateRange) | ✅ Entregue |
| 4 | Persistência de layout via localStorage + API (PUT `/dashboard/widgets`) | ✅ Entregue |
| 5 | 5 métricas derivadas built-in (taxa_atraso, ticket_medio, etc.) + configuráveis pelo usuário | ✅ Entregue |
| 6 | Servidor dedicado `produto/pedido/server/` na porta 8026 | ✅ Entregue |
| 7 | Integração nativa Power BI via OData v4 (6 endpoints analytics) | ✅ Entregue |
| 8 | DashboardGrid corrigido (ResizeObserver — bug WidthProvider CJS→ESM resolvido) | ✅ Entregue |

---

## Próximos Passos — Fase 2 (Roadmap Priorizado)

| Prioridade | Item | Esforço estimado |
|------------|------|-----------------|
| 1 | Redis cache (`ioredis`) substituindo cache in-memory | 1 dia |
| 2 | JWT validation nos endpoints de produto (`/dashboard/widgets`) | 0,5 dia |
| 3 | Job cron de população de `MetricaSnapshot` | 2 dias |
| 4 | Exportação de dashboard para PDF (biblioteca `puppeteer` ou `react-pdf`) | 3 dias |
| 5 | Integração Gabi — rota `/insights` + botão no frontend | 2 dias |
| 6 | Replicar estrutura de Dashboard Pedido (server + analytics + 12+ métricas) nos demais produtos | 5 dias |
| 7 | Configuração de WhatsApp por tenant no Configurador | 1 dia |
| 8 | Widget de mapa geográfico (chart type `MAP` já definido no catálogo) | 3 dias |
| 9 | Dashboard colaborativo em tempo real (migração SSE → WebSocket) | 5 dias |

---

## Referências de Código

| Arquivo | Caminho completo |
|---------|-----------------|
| Catálogo de métricas | `servicos-global/tenant/dashboard/server/lib/catalog.ts` |
| Query Engine | `servicos-global/tenant/dashboard/server/lib/query-engine.ts` |
| Widget Registry | `servicos-global/tenant/dashboard/server/lib/widget-registry.ts` |
| Alert Engine | `servicos-global/tenant/dashboard/server/lib/alert-engine.ts` |
| SSE Handler | `servicos-global/tenant/dashboard/server/lib/sse-handler.ts` |
| Sharing Engine | `servicos-global/tenant/dashboard/server/lib/sharing-engine.ts` |
| Dashboard Grid (nucleo) | `nucleo-global/Dashboard/DashboardGrid/DashboardGrid.tsx` |
| Query Builder (nucleo) | `nucleo-global/Dashboard/QueryBuilder/QueryBuilder.tsx` |
| Testes unitários | `testes/testes-unitarios/dashboard/` |
| Testes funcionais | `testes/testes-funcionais/dashboard/` |
