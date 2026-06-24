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
| KPIs `/kpis` | `server/src/lib/agregar-kpis-dashboard-bid-frete-internacional.ts` | Funil, saving, tempo resposta, KPIs Insights (`kpi_insights_*`, modais, volumes USD) |
| Where operacional KPIs | `shared/where-kpi-insights-operacionais-bid-frete-internacional.ts` | SSOT Prisma para cards aguardando aprovação/resposta (#427) |
| Gráficos | `server/src/lib/agregar-insights-graficos-bid-frete-internacional.ts` | Buckets mensal/modal/incoterms/melhor |
| Drill-down | `server/src/lib/montar-insights-detalhe-bid-frete-internacional.ts` | `where` Prisma + DTO modal (`resposta`/`aprovacao` = where operacional) |
| Mapa | `server/src/lib/mapa-cotacoes-visao-geral-bid-frete-internacional.ts` | Pins, rotas, `dias_transito_medio_mercado` |
| Tooltip KPI (client) | `client/src/shared/insights-kpi-tooltip-resumo-bid-frete-internacional.tsx` | Bloco UX 10 (volume, contagem, modal) nos dois cards |

**Dashboard operacional + GABI** usam o mesmo agregador `/kpis` e rota separada `GET /insights` (motor `gabi-insights-bid-frete-internacional.ts`) — ver skill § Dashboard; **não confundir** com a aba Insights (`visao-geral.tsx`).

---

## 3. KPIs do topo (fixos — sem config)

> **TASK-000325 / PR #429:** removida a aba **Configurações → Visão Geral** (`dashboard-kpi`). SSOT: `BID_FRETE_DASHBOARD_TOP_KPI_STATUS_MAPA` em `use-dashboard-top-kpi-bid-frete.ts` (legado `bid-frete:dashboard-top-kpi-status` limpo no load).

Os cards numéricos **não** usam contagem fixa do server (`cotacoes_andamento` legado).

| Fonte | Chave / arquivo |
|-------|-----------------|
| Mapeamento widget → status | `BID_FRETE_DASHBOARD_TOP_KPI_STATUS_MAPA` (código) |
| Widget andamento | `kpi_cotacoes_andamento` → `AGUARDANDO_APROVACAO` |
| Widget aprovadas | `kpi_cotacoes_aprovadas` → `EM_COTACAO` |
| Widget valor em aberto | `kpi_valor_em_aberto` → `AGUARDANDO_APROVACAO` |
| Widget expiradas | `kpi_cotacoes_expiradas` → `EXPIRADA` |
| Contagem exibida | `funil` da API → `contagemStatusNoFunilBidFreteInternacional` |
| Rótulo / cor | `status-config-bid-frete-internacional.ts` |
| Volume USD card 1 | `valor_andamento_usd` — agregado no server pelo mesmo `status_slug_kpi_andamento` |
| Modal no tooltip | `distribuicao_modal_andamento` — mesmo slug |

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

### 5.1 Mapa global — painel Refinar mapa e toggles de recolher

Componente: `client/src/shared/componentes/visao-geral-mapa-bid-frete.tsx` · estilos `client/src/shared/bid-frete-visao-geral-mapa.css`.

| Elemento | Classe / componente | Comportamento |
|----------|---------------------|---------------|
| Painel lateral de filtros | `.bfd-map-filtros-panel` | Título **Refinar mapa**; acordeão Operação, Modal, Origem, Destino, Status |
| Rail compacto (recolhido) | `.bfd-map-filtros-rail` | Ícones dos filtros quando o painel está fechado |
| Botão recolher/expandir | `.mlg-toggle-btn` (mesma classe do menu) | Ícone `SidebarSimple`; wrapper `.bfd-map-filtros-shell > .tg-trigger` absoluto no topo da borda |

**Paridade obrigatória com o menu principal (`MenuLateralGlobal`):**

| Regra | Menu principal | Refinar mapa |
|-------|----------------|--------------|
| Classe de referência | `.mlg-toggle-btn` em `nucleo-global/Layout/menu-lateral-global/src/menu-lateral.css` | Mesma classe `.mlg-toggle-btn` — não usar estilo âmbar do card (`bfd-card--accent-amber`) |
| Cor em repouso | `var(--ws-surface)` + borda `var(--mlg-accent-border)` | Igual; shell `.bfd-map-filtros-shell` injeta `--mlg-accent`, `--mlg-accent-border` e `--ws-accent-border` via `corOficialProdutoGravity('bid-frete-internacional')` (`#60a5fa`) |
| Cor no hover | `var(--mlg-accent)` (cor do produto no sidebar) | Mesma variável no shell — **não** usar fallback genérico `#818cf8` fora do escopo do sidebar |
| Tooltip | `TooltipGlobal` — ex.: «Recolher menu» / «Expandir menu» | `TooltipGlobal` — «Recolher Refinar mapa» / «Expandir Refinar mapa»; **proibido** `title` nativo (tooltip branco do browser) |

**SSOT de cor do produto:** `nucleo-global/Logo/produtos/src/cores-produto-gravity.ts` → `corOficialProdutoGravity`. O sidebar define `--mlg-accent` inline em `MenuLateralGlobal` (`moduleColor={meta.color}`); o mapa replica no shell porque o botão fica na área de conteúdo, fora de `.mlg-sidebar`.

**Testes de mapa (filtros):** `testes/testes-unitarios/bid-frete-internacional/insights/filtrar-mapa-insights.test.ts`.

**Task:** TASK-000318 — alinhar cor do toggle e tooltip ao padrão do menu principal.

---

## 6. Testes UNI (Insights)

| Arquivo | Escopo |
|---------|--------|
| `insights/agregar-insights-graficos.test.ts` | Buckets gráficos |
| `insights/taxas-cambio-insights.test.ts` | PTAX / spread |
| `insights/montar-insights-detalhe.test.ts` | Where + DTO drill-down |
| `insights/insights-status-funil.test.ts` | Funil + KPI por status config + `resolverContagemKpiInsights*` (`Math.max` API+funil) |
| `insights/divergencia-cadastros-mapa.test.ts` | País ISO, alerta Athens+MMI, rótulos aeroporto/porto |
| `insights/formatar-terminal-mapa.test.ts` | Rótulo documento mapa (prefixo BID/COT) |
| `insights/filtrar-mapa-insights.test.ts` | Filtros do mapa Insights |

Pacote completo `/testes-criar` pendente no fechamento da task (WIP).

---

## 7. Mapa — contrato API (`GET /mapa-cotacoes`)

Agregação: `server/src/lib/mapa-cotacoes-visao-geral-bid-frete-internacional.ts` → `montarMapaCotacoesVisaoFornecedorBidFreteInternacional`.

**Geolocalização:** coordenadas e país vêm **sempre do Cadastros** (`resolver-local-cadastros-bid-frete-internacional.ts`). Ordem de lookup depende do modal predominante do terminal: **AÉREO** → aeroporto primeiro; **MARÍTIMO** → porto primeiro.

### Pin (`pinos_mapa_visao_fornecedor_bid_frete_internacional`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigo_local_mapa_visao_fornecedor_bid_frete_internacional` | string | IATA ou UN/LOCODE gravado na cotação |
| `nome_local_mapa_visao_fornecedor_bid_frete_internacional` | string | **Nome do Cadastros** (rótulo do pin no mapa) |
| `nome_cotacao_local_mapa_visao_fornecedor_bid_frete_internacional` | string | Nome gravado na cotação (pode divergir) |
| `pais_codigo_mapa_visao_fornecedor_bid_frete_internacional` | string | ISO alpha-2 do Cadastros |
| `alerta_divergencia_cadastros_mapa_visao_fornecedor_bid_frete_internacional` | string \| null | Aviso quando nome/país da cotação ≠ Cadastros (ex.: Athens + MMI) |
| `latitude_mapa_visao_fornecedor_bid_frete_internacional` | number | Lat Cadastros |
| `longitude_mapa_visao_fornecedor_bid_frete_internacional` | number | Lng Cadastros |
| `melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional` | number \| null | Melhor proposta no terminal |
| `quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional` | number | Cotações avulsas |
| `quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional` | number | BIDs vinculados |

### Rota (`rotas_mapa_visao_fornecedor_bid_frete_internacional`)

Campos de melhor proposta por rota: `id_cotacao_melhor_proposta_*`, `numero_cotacao_melhor_proposta_*`, `numero_bid_melhor_proposta_*` (número já inclui prefixo `BID-` ou `COT-` — UI não duplica).

**Zod client:** `mapa-visao-fornecedor-bid-frete-internacional.ts`, `mapa-visao-geral-bid-frete-internacional.ts`.

**SSOT divergência:** `shared/divergencia-cadastros-rota-bid-frete-internacional.ts` — mesma regra no mapa (alerta) e na gravação (bloqueio).

---

## 8. Cotação — validação de rota contra Cadastros

**Quando:** `POST /cotacoes` (sempre) e `PATCH /cotacoes/:id` (somente se body toca campos de rota).

**Fluxo:** `prepararRotaComValidacaoCadastros` (`cotacoes.ts`) → `validar-rota-cadastros-cotacao-bid-frete-internacional.ts`:

1. Carrega catálogo (`carregar-contexto-catalogo-rota-bid-frete-internacional.ts`)
2. Deriva snapshot via `prepararCamposRotaCotacaoPersistencia(input, ctx)` — **mesmo ctx** usado na validação e na persistência
3. Resolve terminal no Cadastros por código + modal
4. Rejeita se código inexistente, nome incompatível ou **país ISO comparável** divergente

**País na comparação:** `normalizarPaisIsoParaComparacao` — compara ISO alpha-2; inferência via UN/LOCODE do terminal (`BRSSZ` → `BR`). Nomes por extenso (`Brasil`) **não** geram falso positivo se o código UN/LOCODE bate com o Cadastros.

**Modal rodoviário:** validação Cadastros ignorada (sem terminal IATA/UNLOCODE).

---

## 9. Anti-padrões

- Hardcodar título dos cards Insights ou contar só `kpi_insights_*` sem fallback funil (`Math.max` em `status-config`).
- Enviar `statusSlugs` no client para `insights-detalhe` contexto `resposta`/`aprovacao` — server usa where operacional (#427).
- Drill-down de alertas sem propagar `data_referencia` (desalinha pills vs modal).
- `res.status(400).json` nas rotas Insights — usar `AppError`.
- Usar `destino_nome` da cotação para geocodificar o mapa — **sempre** o código + Cadastros.
- Gravar `origem_pais_cotacao` / `destino_pais_cotacao` sem ISO alpha-2 quando o terminal veio do dropdown Cadastros.
- Toggle Refinar mapa com `title` nativo ou cor de hover `#818cf8` — replicar `MenuLateralGlobal` + `corOficialProdutoGravity` (§5.1).
- `GET /insights-detalhe`: relação Prisma é `disparos_cotacao`, não `disparo_cotacao_bid_frete_internacional` (nome da tabela ≠ nome do campo no `select`).
- Refatorar SSOT multi-workspace (`useEscopoWorkspacesBidFreteInternacional`) — fora do escopo TASK-000264.
