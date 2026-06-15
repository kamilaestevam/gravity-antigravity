# Entidade BID — BID Frete Internacional (Técnico)

> **Status:** Implementado (PR #108 + #114)  
> **Data:** 2026-05-30

---

## 1. Conceito

**BID** (`bid_frete_internacional`) é um **agrupador opcional** de pedidos de cotação. O fluxo diário continua sendo cotação avulsa → propostas; o BID existe para licitações/conjuntos com várias cotações relacionadas.

```
Avulso:  Cotação ──► Disparo ──► Proposta(s)

BID:     BID ──► Cotação(ões) ──► Disparo ──► Proposta(s)
```

---

## 2. Modelos e FKs

### `BidFreteInternacional`

| Campo | Papel |
|-------|-------|
| `id_bid_bid_frete_internacional` | PK |
| `id_organizacao` | Tenant |
| `id_workspace` | Filial (opcional) |
| `numero_bid_bid_frete_internacional` | Sequencial legível |
| `referencia_interna_bid_bid_frete_internacional` | Referência do cliente |
| `status_bid_bid_frete_internacional` | Enum próprio (≠ status cotação) |

Relação: `cotacoes CotacaoBidFreteInternacional[]`, `propostas PropostaBidFreteInternacional[]` (via snapshot).

### `CotacaoBidFreteInternacional`

| Campo | Papel |
|-------|-------|
| `id_bid_bid_frete_internacional` | FK nullable → `bid_frete_internacional` |
| `id_workspace` | Filial da cotação |

**SSOT do vínculo BID ↔ cotação:** esta FK. Cotação avulsa = `id_bid` NULL.

### `PropostaBidFreteInternacional`

| Campo | Papel |
|-------|-------|
| `id_cotacao_bid_frete_internacional` | FK obrigatória |
| `id_bid_bid_frete_internacional` | **Snapshot** da cotação na criação (nullable) |
| `id_workspace` | **Snapshot** da cotação na criação (nullable) |

A proposta **não** recebe `id_bid` do payload do cliente — vem da cotação via `snapshotPropostaFromCotacao`.

---

## 3. Status BID vs status cotação

| Config | Tabela | Uso |
|--------|--------|-----|
| Status cotação | `status_cotacao_config_bid_frete_internacional` | Ciclo da cotação individual |
| Status BID | `status_bid_config_bid_frete_internacional` | Ciclo do conjunto |

Rotas separadas; não misturar enums na UI de configurações.

---

## 4. API — CRUD BID

Prefixo: `/api/v1/bid-frete-internacional/bids-frete-internacional`  
Arquivo: `server/src/routes/bids-frete-internacional.ts`

| Método | Path | Ação |
|--------|------|------|
| GET | `/` | Lista BIDs com cotações e resumo de propostas |
| GET | `/:id` | Detalhe |
| POST | `/` | Cria BID; opcional `ids_cotacao_bid_frete_internacional` |
| PATCH | `/:id` | Atualiza referência/status |
| POST | `/:id/cotacoes` | Vincula cotações existentes |
| PATCH | `/:id/cancelar` | Cancela BID |

Headers: `x-id-usuario`, `x-id-organizacao`, opcional `x-id-workspace`.

Serviço auxiliar: `agregar-resumo-bid-frete-internacional.ts` — KPIs agregados por BID.

---

## 5. Lista (frontend)

Arquivo: `client/src/pages/lista-bid-frete-internacional.tsx`  
Utils: `lista-bid-frete-internacional-utils.ts`  
Conector expand: `conector-pai-lista-bid-frete-internacional.tsx`

### Hierarquia na grid

| Tipo linha | `_tipo_linha` / critério | Expand (chevron) | Filhas |
|------------|--------------------------|------------------|--------|
| **BID** (grupo) | `bid` — `isLinhaBidGrupo()` | Sim — `renderConectorPai` | Cotações vinculadas |
| **COT** (avulsa) | cotação com `id_bid` null | **Não** — conector retorna `null` | Propostas (3º nível, só avulsa) |

- Cotações **avulsas** aparecem no nível raiz; **não** exibem ícone `>` na coluna expand (sem subcamada de cotações).
- Linhas **BID** exibem chevron (`gtv-chevron-btn`) e expandem para cotações filhas via `handleCarregarFilhos` → `pai.cotacoes`.
- Propostas (filhas de cotação avulsa): expand no 3º nível; **não selecionáveis** (`bf-linha-filha-proposta`).

Query backend: `GET /cotacoes?apenas_avulsas=true` exclui cotações já vinculadas a um BID da lista plana de avulsas.

### Montagem e filtros (utils)

| Função | Papel |
|--------|-------|
| `montarLinhasPaiLista` | BIDs (`buildLinhaBidGrupo`) + avulsas, ordenados por data |
| `enriquecerBidsComCotacoesDoPlano` | Mescla cotações de `GET /cotacoes` nos BIDs quando o include aninhado veio vazio (ex.: filtro de workspace no servidor) |
| `filtrarBidsParaLista` | Aplica filtro de aba/busca às filhas; três casos: (1) filhas passam → BID com subset; (2) include vazio → mantém BID (`cotacoes: []`) para enriquecimento posterior; (3) include tem filhas mas aba exclui todas → **oculta** BID (não devolve `todasFilhas` cruas) |
| `montarLinhasPaiListaComFallback` | Enriquece BIDs + evita duplicar cotações vinculadas como linhas planas quando o BID pai já está na hierarquia |

**Expandir todos** (toolbar): itera só linhas BID (`isLinhaBidGrupo`) via `tabelaRef.expandir(id)` — COT avulsa não entra no loop.

### Núcleo intocável

Comportamento de chevron condicional **não** altera `TabelaVirtualGlobal`. Implementação exclusiva do produto via prop `renderConectorPai`. Regra absoluta: `skills/governanca/lei/agent-policy/SKILL.md` (§ componentes compartilhados).

**Ações em lote (PR #289, layout PR #294):** expandir/recolher todos, seleção pai+filhas, duplicar e excluir com preview. Detalhe: [LISTA-ACOES-LOTE-BID-FRETE-INTERNACIONAL.md](./LISTA-ACOES-LOTE-BID-FRETE-INTERNACIONAL.md).

---

## 5.1 Dashboard configurável (paridade Pedido)

Arquivo: `client/src/pages/dashboard.tsx` · Stores: `dashboardStore.ts` / `dashboardStoreFornecedor.ts`

| Comportamento | Implementação |
|---------------|---------------|
| Menu ⋮ por widget | `buildPainelWidgetProps` → `habilitarMenuOpcoes`, `onMover` / `onRedimensionar` / `onConcluirLayout` |
| Drag/resize | `widgetLayoutInteracao` + `DashboardGrid` (`@nucleo/dashboard`) — **sem** `editMode` global |
| Seletor de widgets | Toolbar `widgetsSeletor` — visibilidade e reordenação (`dashboardWidgetVisibilidade.ts`) |
| Período por widget | Chip + `periodLocked` — helpers em `dashboardPeriodoUtil.ts` |
| Permissão editar | `usePermissoesBidFreteInternacional` → `podeEditar('dashboard')` (Configurador) |
| Ordem pós-drag | `sincronizarOrdemPainelPorPosicaoGrid` — `ordem_painel` derivada de `y/x` do grid |
| React Query (perm.) | `App.tsx` envolve `AppInner` com `QueryClientProvider` (`bid-frete-query-client.ts`) — obrigatório para `usePermissoesBidFreteInternacional` |

### GABI Fase 1 (carrossel widget `GABI_INSIGHTS`)

| Peça | Caminho |
|------|---------|
| Rota | `GET /api/v1/bid-frete-internacional/dashboard/insights` |
| Motor server | `server/src/services/gabi-insights-bid-frete-internacional.ts` |
| SSOT KPIs | `server/src/lib/agregar-kpis-dashboard-bid-frete-internacional.ts` (compartilhado com `/kpis`) |
| Período anterior | `server/src/lib/periodo-dashboard-bid-frete-internacional.ts` |
| Zod client | `client/src/shared/dashboard-gabi-schemas.ts` → `dashboardApi.insights` |
| Fallback | Se a API falhar: `buildClientInsightsOperacional` + `console.warn` (Mand. 08) |

Query: `period`, `data_inicio`/`data_fim` (ou `from`/`to`), `ids_workspaces`, `role` ou header `x-user-role`. Resposta: `{ period, role, insights[] }` — mínimo 2 cards; ranking por role (`operador` \| `gerente` \| `diretor` \| `admin` \| `default`).

**Separado da aba Insights** (`visao-geral.tsx`) — ver [INSIGHTS-VISAO-GERAL-TECNICO.md](./INSIGHTS-VISAO-GERAL-TECNICO.md).

Skill: `skills/produtos-gravity/bid-frete-internacional/SKILL.md` § Dashboard.

---

## 6. API — Duplicações e exclusões em lote

Arquivos: `duplicacoes-bid-frete-internacional.ts`, `exclusoes-bid-frete-internacional.ts`

| Método | Path |
|--------|------|
| POST | `/cotacoes/duplicacoes` |
| POST | `/bids-frete-internacional/duplicacoes` |
| POST | `/cotacoes/exclusoes/preview` |
| POST | `/cotacoes/exclusoes/confirmar` |
| POST | `/bids-frete-internacional/exclusoes/preview` |
| POST | `/bids-frete-internacional/exclusoes/confirmar` |

Prefixo: `/api/v1/bid-frete-internacional`. Padrão DDD: sub-recurso substantivado (`duplicacoes`, `exclusoes`).

---

## 7. Migração de legado

Migration `20260529140000_add_bid_frete_internacional_entity`:

- Cria tabela `bid_frete_internacional`
- Adiciona `id_bid` nullable na cotação
- Agrupa cotações legadas por `referencia_interna_cotacao_bid_frete_internacional` (quando repetida)

---

## 8. Anti-padrões

| ❌ Não fazer | ✅ Fazer |
|-------------|----------|
| Filtrar BID por `referencia_interna` na cotação | Usar `id_bid_bid_frete_internacional` |
| Escrever `id_bid` na proposta sem ler cotação | `snapshotPropostaFromCotacao(cotacao)` |
| Reutilizar status de cotação para BID | Config e enum separados |

---

## 9. Referências de código

- `prisma/fragment.prisma` — models `BidFreteInternacional`, FKs
- `server/src/lib/snapshot-proposta-bid-frete.ts`
- `server/src/services/motor-bid-frete-internacional.ts`
- `testes/testes-unitarios/bid-frete-internacional/lista/lista-hierarquia-bid.test.ts`
- `testes/testes-funcionais/bid-frete-internacional/lista/duplicacoes-exclusoes-routes.test.ts`
- `testes/testes-unitarios/bid-frete-internacional/lista/exclusao-regra-bloqueio-bid-frete-internacional.test.ts`
