---
name: antigravity-bid-frete-internacional
description: "Use em tarefas do BID Frete Internacional — entidade BID opcional, cotações, propostas, lista hierárquica, snapshots, migrations e configurador de status."
---

# Gravity — BID Frete Internacional

> Produto: `bid-frete-internacional` · Porta: **8023** · Banco dedicado Railway  
> Código: `servicos-global/produto/bid-frete-internacional/`  
> Docs: `documentos-tecnicos/produtos-gravity/bid-frete-internacional/` · Atlas DDD: `documentos-tecnicos/ddd-atlas/bid-frete/`  
> **Nome de exibição (UI):** `BID Frete Internacional` — slug canônico de rota permanece `/bid-frete/*` e `product_key` `bid-frete`.

---

## Hierarquia de negócio

```
Fluxo diário (avulso):
  Cotação (cotacao_bid_frete_internacional) → Disparo → Proposta(s)

Exceção — conjunto BID:
  BID (bid_frete_internacional) → N cotações → propostas por cotação
```

| Camada | Tabela | FK principal |
|--------|--------|--------------|
| BID (opcional) | `bid_frete_internacional` | — |
| Cotação | `cotacao_bid_frete_internacional` | `id_bid_bid_frete_internacional` nullable |
| Disparo | `disparo_cotacao_bid_frete_internacional` | `id_cotacao_bid_frete_internacional` |
| Proposta | `proposta_bid_frete_internacional` | `id_cotacao_bid_frete_internacional` + snapshot `id_bid` |

---

## Snapshots na proposta

Ao **criar proposta**, copiar da cotação via `snapshotPropostaFromCotacao` (`server/src/lib/snapshot-proposta-bid-frete.ts`):

| Campo proposta | Origem | Motivo |
|----------------|--------|--------|
| `id_workspace` | cotação | Filial no momento da resposta |
| `id_bid_bid_frete_internacional` | cotação | Denormalização para consultas/Railway UI |

**Fonte da verdade do vínculo BID:** FK na **cotação**. O `id_bid` na proposta é snapshot (backfill na migration + preenchido na criação).

Consumidores: `motor-bid-frete-internacional.ts`, `visao-fornecedor-bid-frete-internacional.ts`, `visao-fornecedor-bid-frete-internacional-publico.ts`.

---

## Ordem física de colunas (PostgreSQL / Railway UI)

Convenção em tabelas com tenant + workspace:

1. PK (`id_*`)
2. FKs de negócio no topo (ex.: `id_bid`, `id_cotacao` na proposta)
3. `id_organizacao`
4. **`id_workspace`** — sempre logo após `id_organizacao`
5. `id_produto_gravity`, `id_usuario`, demais campos

Ordem alvo documentada em `documentos-tecnicos/produtos-gravity/bid-frete-internacional/ORDEM-COLUNAS-BANCO-TECNICO.md`.

Migrations: `20260530120000_reorder_colunas_*` + `20260530130000_fixup_reorder_bid_ganho_*` (idempotentes).

---

## Lista (UI)

| Caso | Camadas na grid |
|------|-----------------|
| Avulsa | Cotação → Propostas |
| BID | BID → Cotações → (propostas no expand da cotação filha) |

Utils: `client/src/pages/lista-bid-frete-internacional-utils.ts`  
Conector expand: `client/src/pages/conector-pai-lista-bid-frete-internacional.tsx` (`renderConectorPaiListaBidFreteInternacional`)  
Agregação resumo BID: `client/src/shared/agregar-resumo-bid-frete-internacional.ts`

Query avulsas: `GET /cotacoes?apenas_avulsas=true` (sem `id_bid`).

### Chevron e filtros da hierarquia (AGT-000264)

| Linha | Expand na coluna pai | Implementação |
|-------|----------------------|---------------|
| BID (`isLinhaBidGrupo`) | Sim | `renderConectorPai` → chevron `gtv-chevron-btn`; filhas = `cotacoes` do grupo |
| COT avulsa | Não | Conector retorna `null`; propostas no 3º nível só na avulsa |

- **Expandir todos:** só BIDs — ver `lista-bid-frete-internacional.tsx`.
- **Filtro aba/busca:** `filtrarBidsParaLista` + `enriquecerBidsComCotacoesDoPlano` + `montarLinhasPaiListaComFallback` — doc em [ENTIDADE-BID-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/ENTIDADE-BID-TECNICO.md) §5.
- **Núcleo:** não alterar `TabelaVirtualGlobal`; usar props existentes. Regra absoluta → [agent-policy](../../governanca/lei/agent-policy/SKILL.md) § componentes compartilhados.
- **Testes UNI:** `testes/testes-unitarios/bid-frete-internacional/lista/lista-hierarquia-bid.test.ts` (13 casos).

### Criação (menu Novo → Buscar Frete)

O botão **Novo** da Lista abre "Buscar Frete" como submenu com 2 opções:

| Opção | Fluxo |
|-------|-------|
| **Cotação Avulsa** | rota `/bid-frete/cotacoes/nova` (wizard `modal-nova-cotacao-bid-frete-internacional.tsx`) |
| **BID** | `ModalNovoBidFreteInternacional` (`pages/modal-novo-bid-frete-internacional.tsx`) — referência interna opcional + vínculo **opcional** de avulsas existentes → `POST /bids-frete-internacional` → CTA "Criar cotação para o BID" |

O wizard de nova cotação aceita `?id_bid=<id>` (helper `shared/novo-bid-frete-internacional-utils.ts`): a cotação criada já nasce vinculada (`id_bid_bid_frete_internacional` no `POST /cotacoes`) e a tela de sucesso oferece "Adicionar outra cotação ao BID" (reset do wizard preservando o query param). API client: `criarBidFreteInternacional` em `shared/api.ts`. Testes: `testes/testes-unitarios/bid-frete-internacional/novo-bid-frete-internacional-utils.test.ts`.

### Painéis da Lista (paridade Pedido)

- Model: `ListaPainelUsuarioGlobal` (`id_produto_gravity = 'bid-frete-internacional'`)
- API: `GET|POST|PATCH|DELETE /api/v1/bid-frete-internacional/lista/paineis`
- Contrato `config_json`: `shared/listaPainelConfigSchema.ts` (Zod `.strict()`)
- UI: `BidFreteListaPainelBar` + `useListaPainelBidFrete` em `lista-bid-frete-internacional.tsx`
- Escopo de filiais: seletor lateral `modoWorkspace="multiplo"` (paridade Pedido) — preferência em `GET/PUT /config/escopo-workspaces`; painel Lista **não** guarda `ids_workspaces_escopo`
- Doc: `documentos-tecnicos/produtos-gravity/bid-frete-internacional/ESCOPO-MULTI-WORKSPACE-TECNICO.md`

### Dashboard configurável (paridade Pedido — 2026-06)

Modelo: `servicos-global/produto/pedido/client/src/pages/PedidosDashboard.tsx`.

| Peça | Caminho |
|------|---------|
| Página | `client/src/pages/dashboard.tsx` |
| Store operacional | `client/src/stores/dashboardStore.ts` |
| Store fornecedor | `client/src/stores/dashboardStoreFornecedor.ts` |
| Visibilidade/ordem | `client/src/shared/dashboardWidgetVisibilidade.ts` |
| Período por widget | `client/src/shared/dashboardPeriodoUtil.ts` |
| Permissões UX | `client/src/shared/permissoes/usePermissoesBidFreteInternacional.ts` — chave `bid-frete-internacional:dashboard:editar` |
| Toolbar | `client/src/components/dashboard/BarraFerramentasDashboardBidFrete.tsx` |

**UX (menu ⋮ por widget):** Editar, Excluir, Mover, Mudar tamanho, Concluir — via `@nucleo/dashboard` (`DashboardPainelContainer`, `layoutInteracao` no `DashboardGrid`). Sem botão global «Reorganizar».

**Persistência:** Zustand + painéis (`DashboardPainelUsuarioGlobal`, API `paineisDashboardApi`).

**Testes UNI:** `testes/testes-unitarios/bid-frete-internacional/dashboard/dashboard-widget-visibilidade.test.ts`

### Insights — Visão Geral (aba `/bid-frete/insights` — TASK-000264)

Doc: `documentos-tecnicos/produtos-gravity/bid-frete-internacional/INSIGHTS-VISAO-GERAL-TECNICO.md`

| Peça | Caminho |
|------|---------|
| Página | `client/src/pages/visao-geral.tsx` |
| KPIs ↔ Config | `use-dashboard-top-kpi-bid-frete.ts` + `status-config-bid-frete-internacional.ts` |
| API + Zod client | `client/src/shared/api.ts`, `insights-visao-geral-bid-frete-internacional.ts`, `insights-detalhe-bid-frete-internacional.ts` |
| Agregação server | `agregar-kpis-dashboard-bid-frete-internacional.ts`, `agregar-insights-graficos-bid-frete-internacional.ts` |
| Query Zod server | `server/src/shared/dashboard-queries-zod-bid-frete-internacional.ts` |
| Drill-down modal | `dialogo-detalhe-insights-bid-frete-internacional.tsx` |

**Regra:** contagem e rótulo dos cards KPI seguem Configurações › Visão Geral (`bid-frete:dashboard-top-kpi-status`), não hardcode «Em andamento». Drill-down de alertas propaga `data_referencia` do dia navegado.

**Separado do Dashboard:** GABI operacional (`GET /dashboard/insights`) e widgets em `dashboard.tsx` — escopo TASK-000265.

---

## Banco (SSOT)

| Tabela | Model Prisma |
|--------|--------------|
| `bid_frete_internacional` | `BidFreteInternacional` |
| `cotacao_bid_frete_internacional` | `CotacaoBidFreteInternacional` |
| `disparo_cotacao_bid_frete_internacional` | `DisparoCotacaoBidFreteInternacional` |
| `proposta_bid_frete_internacional` | `PropostaBidFreteInternacional` |
| `status_cotacao_config_bid_frete_internacional` | `StatusCotacaoConfigBidFreteInternacional` |
| `status_bid_config_bid_frete_internacional` | `StatusBidConfigBidFreteInternacional` |
| `ganho_bid_frete_internacional` | `GanhoBidFreteInternacional` |

Schema: `prisma/fragment.prisma` → `node prisma/compose-schema.js` → `schema.prisma`.

---

## API (rotas novas / críticas)

| Método | Rota | Arquivo |
|--------|------|---------|
| GET/POST | `/api/v1/bid-frete-internacional/bids-frete-internacional` | `bids-frete-internacional.ts` |
| GET/PATCH | `/api/v1/bid-frete-internacional/bids-frete-internacional/:id` | idem |
| POST | `.../bids-frete-internacional/:id/cotacoes` | vincular cotações |
| PATCH | `.../bids-frete-internacional/:id/cancelar` | cancelar BID |
| GET/POST/PATCH/DELETE | `/api/v1/bid-frete-internacional/config/status-bid-frete-internacional` | `config-status-bid-frete-internacional.ts` |
| GET | `/api/v1/bid-frete-internacional/cotacoes?apenas_avulsas=true` | `cotacoes.ts` |

Demais rotas: ver `documentos-tecnicos/ddd-atlas/bid-frete/02-rotas-api.md`.

---

## Visão Fornecedor (`visao_fornecedor_bid_frete_internacional`)

Namespace fixo para telas/API exclusivas do fornecedor logado.

| Camada | Caminho |
|--------|---------|
| Doc SSOT | `documentos-tecnicos/produtos-gravity/bid-frete-internacional/DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md` |
| API auth | `server/src/routes/visao-fornecedor-bid-frete-internacional.ts` |
| API público | `server/src/routes/visao-fornecedor-bid-frete-internacional-publico.ts` |
| Schemas Zod front | `client/src/shared/visao-fornecedor-bid-frete-internacional-schemas.ts` |
| Páginas | `client/src/pages/visao-fornecedor-bid-frete-internacional/` |
| Nav shell | `PRODUCT_CONFIG.navigation_visao_fornecedor_bid_frete_internacional` |

**Proibido** na visão fornecedor: `portal`, `bidRequest`, `respostas`, payloads com chaves genéricas (`id`, `nome`, `rating`).

---

## Migrations (aplicar)

```bash
# Railway prod/teste ou local
BID_FRETE_INTERNATIONAL_DATABASE_URL=... npx tsx scripts/ativamente/aplicar-migrations-bid-frete-internacional.ts
```

Bancos Railway: `gravity-bid-frete-internacional-producao`, `gravity-bid-frete-internacional-teste`.

---

## Anti-padrões

- Agrupar BID por `referencia_interna_cotacao_bid_frete_internacional` (legado) — usar `id_bid_bid_frete_internacional`.
- Assumir que proposta **não** tem `id_bid` — tem snapshot; FK na cotação continua SSOT.
- Colocar `id_workspace` longe de `id_organizacao` em novas tabelas/migrations.
- Editar `schema.prisma` composto manualmente — só `fragment.prisma` + compose.
- Confundir **status de cotação** (`status_cotacao_config_*`) com **status de BID** (`status_bid_config_*`).

---

## Seletor universal (4 visualizações)

Paridade com Pedido — layout route + keep-alive:

- `BidFreteVisualizacaoLayout` + `BidFreteVisualizacaoTabs`
- `BidFreteMultiView` (cliente e fornecedor — `modo` prop)
- `bid-frete-prefetch.ts` (prefetch de chunk no hover)
- `data-testid`: `seletor-visao-tab-*`, `seletor-visao-painel-*`

Doc: [seletor-universal-visualizacoes.md](../../../documentos-tecnicos/arquitetura/seletor-universal-visualizacoes.md) · E2E: `TST-E2E-MBOTO-000057` (cliente), `000004` (fornecedor).

---

## Testes

- Unitários: `testes/testes-unitarios/bid-frete-internacional/` (60+ specs)
- Dashboard ordem/visibilidade: `dashboard/dashboard-widget-visibilidade.test.ts`
- Insights: `insights/agregar-insights-graficos.test.ts`, `insights/montar-insights-detalhe.test.ts`, `insights/taxas-cambio-insights.test.ts`, `insights/insights-status-funil.test.ts`
- Funcionais: `testes/testes-funcionais/bid-frete-internacional/`
- Hierarquia lista: `lista/lista-hierarquia-bid.test.ts`
- Seletor SLA 1s: `testes/testes-e2e/menu-botoes/seletor-universal-visoes/` (`MBOTO`)

---

## Governança (SSOT — não redefinir aqui)

> ⚠️ REGRA ABSOLUTA: Ver `skills/governanca/lei/9-mandamentos/SKILL.md`  
> ⚠️ Nomenclatura: Ver `skills/governanca/lei/ddd-nomenclatura/SKILL.md`  
> ⚠️ Schema/migrations: Ver `skills/governanca/lei/database-governance/SKILL.md` — alterações via `fragment.prisma` + script do Coordenador
