# Insights (Visão Geral) — BID Frete Internacional

> **Tela:** `client/src/pages/visao-geral.tsx` · rota shell `/bid-frete/insights`  
> **Task:** TASK-000264 — espelhar Lista no mesmo escopo multi-workspace  
> **Escopo multi-workspace:** `documentos-tecnicos/produtos-gravity/bid-frete-internacional/ESCOPO-MULTI-WORKSPACE-TECNICO.md`

---

## 1. API — rotas Insights (server)

Arquivo: `server/src/routes/dashboard.ts` · prefixo `/api/v1/bid-frete-internacional/dashboard`

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/kpis` | KPIs topo, funil, saving, `distribuicao_modal_andamento` |
| GET | `/insights-alertas` | Pills de alertas (navegação por dia) |
| GET | `/insights-graficos` | Gráficos mensal, modal, incoterms, melhor cotação |
| GET | `/insights-detalhe` | Drill-down modal (alertas + rotas do mapa) |
| GET | `/insights` | GABI Fase 1 — carrossel do **Dashboard** (`gabi-insights-bid-frete-internacional.ts`); **não** é a aba Insights |
| GET | `/mapa-cotacoes` | Globo / rotas operacionais |

Todas exigem `assertWorkspacesAutorizadosNoRequest` + query `ids_workspaces` quando escopo múltiplo.

**Validação Zod (query):** `server/src/shared/dashboard-queries-zod-bid-frete-internacional.ts` — erros via `AppError` (400 `VALIDATION_ERROR`).

| Query | Rotas | Notas |
|-------|-------|-------|
| `status_slug_kpi_andamento` | `/kpis` | Enum canônico de status; filtra modal e `valor_andamento_usd` |
| `data_referencia` | `/insights-alertas`, `/insights-detalhe` | `YYYY-MM-DD`; dia de referência para contagens e drill-down |
| `contexto` | `/insights-detalhe` | `vence_hoje` \| `resposta` \| `aprovacao` \| `nova` \| `rota` |

---

## 2. SSOT de agregação

| Camada | Arquivo | Responsabilidade |
|--------|---------|------------------|
| KPIs `/kpis` | `server/src/lib/agregar-kpis-dashboard-bid-frete-internacional.ts` | Funil, saving, tempo resposta, valor por status configurado |
| Gráficos | `server/src/lib/agregar-insights-graficos-bid-frete-internacional.ts` | Buckets mensal/modal/incoterms/melhor |
| Drill-down | `server/src/lib/montar-insights-detalhe-bid-frete-internacional.ts` | `where` Prisma + DTO modal |
| Mapa | `server/src/lib/mapa-cotacoes-visao-geral-bid-frete-internacional.ts` | Pins, rotas, `dias_transito_medio_mercado` |

**Dashboard operacional + GABI** usam o mesmo agregador `/kpis` e rota separada `GET /insights` (motor `gabi-insights-bid-frete-internacional.ts`) — ver skill § Dashboard; **não confundir** com a aba Insights (`visao-geral.tsx`).

---

## 3. KPIs do topo ↔ Configurações

Os cards numéricos **não** usam contagem fixa do server (`cotacoes_andamento` legado).

| Fonte | Chave / arquivo |
|-------|-----------------|
| Status por card | `use-dashboard-top-kpi-bid-frete.ts` → localStorage `bid-frete:dashboard-top-kpi-status` |
| Widget andamento | `kpi_cotacoes_andamento` (default `EM_COTACAO`) |
| Widget aprovadas | `kpi_cotacoes_aprovadas` (default `APROVADA`) |
| Contagem exibida | `funil` da API → `contagemStatusNoFunilBidFreteInternacional` |
| Rótulo / cor | `status-config-bid-frete-internacional.ts` |
| Volume USD card 1 | `valor_andamento_usd` — agregado no server pelo mesmo `status_slug_kpi_andamento` |
| Modal no tooltip | `distribuicao_modal_andamento` — mesmo slug |

UI Config: `client/src/pages/configuracoes.tsx` → categoria `dashboard-kpi`.

---

## 4. Client — contratos Zod

| Módulo | Schema / função |
|--------|-----------------|
| KPIs | `insights-visao-geral-bid-frete-internacional.ts` → `dashboardKpisResponseSchema` |
| Alertas | `insightsAlertasResponseSchema` |
| Gráficos | `insightsGraficosResponseSchema` |
| Drill-down | `insights-detalhe-bid-frete-internacional.ts` → `insightsDetalheResponseSchema` |
| PTAX / spread | `taxas-cambio-insights-bid-frete-internacional.ts` |
| Fetch | `client/src/shared/api.ts` — `.parse()` obrigatório (Mandamento 06) |

---

## 5. Fluxos UX

**Alertas:** `data_referencia` na query + setas ◀▶ em `visao-geral.tsx` → pills recarregam via `getDashboardInsightsAlertas`.

**Drill-down:** clique em pill ou rota do mapa → `DialogoDetalheInsightsBidFreteInternacional` → `getDashboardInsightsDetalhe` com `data_referencia` do dia selecionado (paridade alertas `vence_hoje` / `nova`).

**Funil:** etapas ordenadas por config de status (`montarEtapasFunilInsightsBidFreteInternacional`).

**PTAX:** BACEN via Configurador; spread de `bid-frete:config:taxa-cambio` (localStorage); previsão Focus por moeda (USD/EUR/CNY).

---

## 6. Testes UNI (Insights)

| Arquivo | Escopo |
|---------|--------|
| `insights/agregar-insights-graficos.test.ts` | Buckets gráficos |
| `insights/taxas-cambio-insights.test.ts` | PTAX / spread |
| `insights/montar-insights-detalhe.test.ts` | Where + DTO drill-down |
| `insights/insights-status-funil.test.ts` | Funil + KPI por status config |

Pacote completo `/testes-criar` pendente no fechamento da task (WIP).

---

## 7. Anti-padrões

- Hardcodar título «Em andamento» ou contar `cotacoes_andamento` do server sem olhar Config + funil.
- Drill-down de alertas sem propagar `data_referencia` (desalinha pills vs modal).
- `res.status(400).json` nas rotas Insights — usar `AppError`.
- Refatorar SSOT multi-workspace (`useEscopoWorkspacesBidFreteInternacional`) — fora do escopo TASK-000264.
