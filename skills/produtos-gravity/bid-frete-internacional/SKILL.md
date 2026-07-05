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
- **Núcleo:** preferir props existentes; extensões opt-in documentadas em `tipos.ts` (`labelFilho`, `totalRodapePai`). Regra absoluta → [agent-policy](../../governanca/lei/agent-policy/SKILL.md) § componentes compartilhados.
- **Testes UNI:** `testes/testes-unitarios/produto-gravity/bid-frete-internacional/lista/lista-hierarquia-bid.test.ts` (13 casos).

### Rodapé e paginação (paridade Pedido — 2026-06)

Modelo: Lista de Pedidos — `{total pai} pedidos · {total filhos} itens · página N de M` + « ‹ 1 2 3 › ».

| Peça | Caminho / valor |
|------|-----------------|
| Lista cliente | `lista-bid-frete-internacional.tsx` — `linhasPaiPagina`, `paginaLista`, props GTV |
| Lista fornecedor | `lista-visao-fornecedor-bid-frete-internacional.tsx` — sem segmento “bids” no rodapé |
| Linhas/página | `tabelaConfig.linhasPorPagina` — `shared/tabela-config-bid-frete.ts` (`bid-frete:config:tabela`) |
| i18n rodapé | `bidfrete.lista.label_bid_*`, `label_cotacao_*` |
| Altura grid (WIP) | `bid-frete-page-shell.css` — `min-height: 620px` até layout flex fechar |

**Regra:** 1º segmento = linhas pai paginadas (`totalItens`), 2º = cotações filtradas (`totalFilhos`). Paginação **client-side** (dataset já carregado).

Doc: [PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md) § Rodapé e paginação

### Filtros de coluna (paridade Pedido — TASK-000269)

Ícone ▾ em todas colunas visíveis; lógica em `shared/filtros-coluna-lista-bid-frete-internacional.ts`. Colunas manuais: `filtravel: true` + `_colunas_usuario[col.id]` (`valores-colunas-usuario-bid-frete-internacional.ts`, localStorage WIP). Teste: `lista/filtros-coluna-lista-bid-frete-internacional.test.ts`.

### Nº da cotação editável (TASK-000407)

| Peça | Caminho / contrato |
|------|-------------------|
| Campo Prisma | `numero_cotacao_bid_frete_internacional` — auto no create; editável via PATCH |
| Wizard passo 1 | `modal-nova-cotacao-bid-frete-internacional.tsx` — `gerarNumeroCotacaoFreteInternacional()` + POST opcional |
| Lista inline | `colunas-lista-bid-frete-internacional.ts` — texto editável + ↗ abrir detalhe |
| Persistência | `shared/salvar-campo-cotacao-bid-frete-internacional.ts` + `mapCotacaoToServer` em `api.ts` |
| API | `PATCH /cotacoes/:id` e `POST /cotacoes` aceitam `numero_cotacao_bid_frete_internacional` |

Doc: [MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §2.1 · [PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md) § Nº da cotação

**Testes UNI:** `lista/map-cotacao-to-server.test.ts`, `lista/salvar-campo-numero-cotacao.test.ts` · **FUN:** `lista/cotacoes-routes.test.ts` (PATCH numero)

### Criação (menu Novo → Buscar Frete)

O botão **Novo** da Lista abre "Buscar Frete" como submenu com 2 opções:

| Opção | Fluxo |
|-------|-------|
| **Cotação Avulsa** | rota `/bid-frete/cotacoes/nova` (wizard `modal-nova-cotacao-bid-frete-internacional.tsx`) |
| **BID** | `ModalNovoBidFreteInternacional` (`pages/modal-novo-bid-frete-internacional.tsx`) — referência interna opcional + vínculo **opcional** de avulsas existentes → `POST /bids-frete-internacional` → CTA "Criar cotação para o BID" |

O wizard de nova cotação aceita `?id_bid=<id>` (helper `shared/novo-bid-frete-internacional-utils.ts`): a cotação criada já nasce vinculada (`id_bid_bid_frete_internacional` no `POST /cotacoes`) e a tela de sucesso oferece "Adicionar outra cotação ao BID" (reset do wizard preservando o query param). API client: `criarBidFreteInternacional` em `shared/api.ts`. Testes: `testes/testes-unitarios/produto-gravity/bid-frete-internacional/novo-bid-frete-internacional-utils.test.ts`.

- Doc: `documentos-tecnicos/produtos-gravity/bid-frete-internacional/ESCOPO-MULTI-WORKSPACE-TECNICO.md`

### Dimensões de cubagem na cotação (TASK-000417)

| Peça | Caminho / contrato |
|------|-------------------|
| Campos Prisma | `codigo_unidade_cubagem_*`, `comprimento_cubagem_*`, `largura_cubagem_*`, `altura_cubagem_*`, `cubagem_m3_*` |
| SSOT unidade | Cadastros `unidade.codigo_unidade` (`tipo_unidade=comprimento` — CM, M, IN, FT) |
| Wizard passo 3 | `modal-nova-cotacao-bid-frete-internacional.tsx` — checkbox UI cubagem detalhada (painel C×L×A); m³ sempre por último + `use-opcoes-unidade-comprimento-cubagem-bid-frete-internacional.ts` |
| API | `POST/PATCH /cotacoes` — Zod em `server/src/routes/cotacoes.ts` |
| Migrations | Bid Frete `20260705130000_*` · Cadastros `20260705120000_*` (IN/FT) |

**Regra de cálculo por modal** (`calcularCubagemAutoDimensoesPorModalBidFreteInternacional`): AÉREO + unidade CM → `(C×L×A em cm) ÷ 6000` (fator IATA, `DIVISOR_PESO_CUBADO_AEREO_CM_BID`); marítimo/rodoviário (mesmo em CM) e aéreo em outra unidade → C×L×A em m³. Trocar o modal recalcula. Ao marcar cubagem detalhada, unidade vem pré-selecionada em **CM** (preferencial, não obrigatória).

Doc: [MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §8 · Atlas `ddd-atlas/bid-frete/01-campos.md`

### Catálogo portos/aeroportos paginado (Nova Cotação — passo 2)

Selects de porto/aeroporto (origem, destino, locais adicionais) paginam o catálogo completo do Cadastros no scroll (100/página) e fazem busca remota no banco inteiro (150 resultados, ≥2 chars). SSOT de limites: `shared/limites-catalogo-logistica-bid-frete-internacional.ts`; hook `client/src/shared/use-select-catalogo-logistica-cadastros-bid-frete-internacional.ts`; proxies e rotas Cadastros aceitam `offset` e devolvem `total`; `SelectGlobal` ganhou props `buscaRemota`/`aoMudarBusca`/`aoScrollFimLista`/`totalOpcoesCatalogo`. Doc: [MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §8.1.

**Pin de selecionados (§8.3):** todo código selecionado precisa ser garantido na lista em memória, senão o SelectGlobal mostra placeholder ao voltar de passo (catálogo paginado raramente contém o código na 1ª página). O hook aceita `codigoSelecionado` (principal) e `codigosSelecionados: string[]` (locais adicionais aceitos) — ambos usam `garantirSelecionado` + Map de pins. Ao consumir o hook para um select com valor persistido, **sempre** repassar o(s) código(s) selecionado(s).

### Filtros de coluna (paridade Pedido — TASK-000269)

Todas as colunas visíveis têm filtro ▾ no header (`FiltroPopoverColuna` / `FiltroChips` do núcleo). Estado `filtrosAtivosLista` em `lista-bid-frete-internacional.tsx`; lógica em `shared/filtros-coluna-lista-bid-frete-internacional.ts`.

| Peça | Caminho |
|------|---------|
| Filtro client-side | `cotacaoPassaFiltrosColuna`, `calcularValoresUnicosPorCampoBidFrete` |
| Colunas fixas `filtravel` | `colunas-lista-bid-frete-internacional.ts` |
| Colunas manuais | `mapColunaUsuarioBidFreteParaGTColuna` — `filtravel: true` explícito (mesmo com `oculta: true`) |
| Definição colunas | `bid-frete:config:colunas-personalizadas` + evento `EVENTO_COLUNAS_PERSONALIZADAS_BID_FRETE_ATUALIZADO` |
| Valores por cotação (WIP) | `bid-frete:config:valores-colunas-usuario` → `_colunas_usuario[col.id]` via `valores-colunas-usuario-bid-frete-internacional.ts` |

**Paridade Pedido:** valores em `_colunas_usuario` keyed por `col.id`, não `row[chave]`. API `colunas-usuario/valores` ainda não existe neste produto — localStorage até backend.

**Testes UNI:** `lista/filtros-coluna-lista-bid-frete-internacional.test.ts`

Doc: `documentos-tecnicos/produtos-gravity/bid-frete-internacional/PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md` § Filtros de coluna

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
| React Query | `client/src/shared/bid-frete-query-client.ts` + `QueryClientProvider` em `App.tsx` (paridade Pedido) |
| Toolbar | `client/src/components/dashboard/BarraFerramentasDashboardBidFrete.tsx` |

**UX (menu ⋮ por widget):** Editar, Excluir, Mover, Mudar tamanho, Concluir — via `@nucleo/dashboard` (`DashboardPainelContainer`, `layoutInteracao` no `DashboardGrid`). Sem botão global «Reorganizar».

**Persistência:** Zustand + painéis (`DashboardPainelUsuarioGlobal`, API `paineisDashboardApi`).

**Testes UNI:** `testes/testes-unitarios/produto-gravity/bid-frete-internacional/dashboard/dashboard-widget-visibilidade.test.ts`, `dashboard/gabi-insights-bid-frete.test.ts`

#### GABI Fase 1 (carrossel `GABI_INSIGHTS`)

Paridade conceitual: `servicos-global/produto/pedido/server/src/services/gabiInsightsService.ts`.

| Peça | Caminho |
|------|---------|
| Rota | `GET /api/v1/bid-frete-internacional/dashboard/insights` |
| Motor | `server/src/services/gabi-insights-bid-frete-internacional.ts` |
| SSOT KPIs | `server/src/lib/agregar-kpis-dashboard-bid-frete-internacional.ts` |
| Zod resposta | `client/src/shared/dashboard-gabi-schemas.ts` |
| Client fetch | `dashboardApi.insights` em `shared/api.ts` |

Ranking por `role` (`x-user-role` ou query `role`). Fallback client: `dashboard-operacional-insights.ts` + `console.warn` se a rota falhar. Visão fornecedor permanece client-side (`dashboard-fornecedor-api.ts`).

**Não confundir** com a aba Insights (`visao-geral.tsx`) — doc em `INSIGHTS-VISAO-GERAL-TECNICO.md`.

Doc: `documentos-tecnicos/produtos-gravity/bid-frete-internacional/INSIGHTS-VISAO-GERAL-TECNICO.md`

| Peça | Caminho |
|------|---------|
| Página | `client/src/pages/visao-geral.tsx` |
| Contagem cards 1–2 | `status-config-bid-frete-internacional.ts` → `resolverContagemKpiInsights*` (`Math.max` API + funil) |
| Where operacional (shared) | `shared/where-kpi-insights-operacionais-bid-frete-internacional.ts` |
| Tooltip KPI UX 10 | `insights-kpi-tooltip-resumo-bid-frete-internacional.tsx`, `insights-kpi-tooltip-lista-bid-frete-internacional.tsx` |
| API + Zod client | `client/src/shared/api.ts`, `insights-visao-geral-bid-frete-internacional.ts`, `insights-detalhe-bid-frete-internacional.ts` |
| Agregação server | `agregar-kpis-dashboard-bid-frete-internacional.ts`, `agregar-insights-graficos-bid-frete-internacional.ts` |
| Query Zod server | `server/src/shared/dashboard-queries-zod-bid-frete-internacional.ts` |
| Drill-down modal | `dialogo-detalhe-insights-bid-frete-internacional.tsx`, `montar-insights-detalhe-bid-frete-internacional.ts` |

**Regra:** cards **Aguardando aprovação** e **Aguardando resposta** são fixos na aba Insights; contagem = `Math.max(kpi_insights_*, funil)` até a regra operacional (#427) estabilizar. Drill-down de alertas propaga `data_referencia` do dia navegado. Detalhe `resposta`/`aprovacao` **não** envia `statusSlugs` — server usa where operacional.

> Contrato completo `/kpis` e tooltips: `INSIGHTS-VISAO-GERAL-TECNICO.md` §3. Dashboard operacional (widgets configuráveis) usa `use-dashboard-top-kpi-bid-frete.ts` — escopo separado.

**Mapa (`GET /dashboard/mapa-cotacoes`):** pins e coordenadas vêm do **Cadastros** por código (IATA/UNLOCODE), não do nome gravado na cotação. Divergência nome/país → `alerta_divergencia_cadastros_*` no hover. SSOT: `shared/divergencia-cadastros-rota-bid-frete-internacional.ts` (mapa = alerta; gravação = bloqueio).

**Resolução Cadastros — metadados vs coordenadas (TASK-000405):**

| Uso | Função server | Exige lat/long? |
|-----|---------------|-----------------|
| Validação `POST`/`PATCH` cotação | `resolverMetadadosLocalCadastrosBidFreteInternacional` | **Não** — porto/aeroporto ativo basta |
| Mapa Insights / pins | `resolverLocalCadastrosBidFreteInternacional` | **Sim** — sem coordenadas o pin é omitido |

Arquivo: `server/src/lib/resolver-local-cadastros-bid-frete-internacional.ts` · chamada na gravação: `validarRotaCotacaoContraCadastros`. Erro HTTP Cadastros (≠ 404) → `console.warn` com código; 404 = código inexistente (sem log ruidoso).

**Validação rota na cotação:** `prepararRotaComValidacaoCadastros` em `cotacoes.ts` — catálogo portos/aeroportos + `prepararCamposRotaCotacaoPersistencia(input, ctx)` no `POST` e no `PATCH` quando body toca campos de rota. País comparado em ISO alpha-2 (`normalizarPaisIsoParaComparacao`).

**Testes UNI (mapa/validação):** `insights/divergencia-cadastros-mapa.test.ts`, `insights/formatar-terminal-mapa.test.ts`, `insights/filtrar-mapa-insights.test.ts`

Doc detalhado: [INSIGHTS-VISAO-GERAL-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/INSIGHTS-VISAO-GERAL-TECNICO.md) §3–9

**Separado do Dashboard:** rota `/dashboard/insights` (GABI widget) vs aba `/insights` — TASK-000265 vs TASK-000264.

---

## Disparo — contatos multi destinatário (PR #338)

Cadastros é SSOT; BID resolve ao vivo no motor de disparo.

| Peça | Caminho |
|------|---------|
| Resolver EMAIL/WA | `server/src/services/resolver-contatos-disparo-bid-frete-internacional.ts` |
| Fetch Cadastros S2S | `server/src/services/buscar-fornecedor-cadastros-disparo.ts` |
| Motor | `server/src/services/motor-bid-frete-internacional.ts` |
| UI seleção | `client/src/pages/selecao-fornecedores-disparo-bid-frete-internacional.tsx` |
| Chip e-mail preview | `client/src/pages/contato-email-fornecedor-disparo-bid-frete-internacional.tsx` |

**Regra:** preferir `contatos_fornecedor[]` (canal `EMAIL`); fallback `email_fornecedor` → espelho BID. Excluir `@interno.gravity.local`. Um envio Resend por endereço válido.

**Testes UNI:** `resolver-contatos-disparo-bid-frete-internacional.test.ts`, `formatar-resultado-disparo-bid-frete-internacional.test.ts`

Doc: [MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §5.5 · Cadastros: [EMPRESA-FORNECEDOR-OPERACAO.md](../../../documentos-tecnicos/produtos-gravity/cadastros/EMPRESA-FORNECEDOR-OPERACAO.md) § Contatos

---

## Disparo — envio assíncrono + feedback honesto (PRs #622–#632, TASK-000405)

**Regra inviolável (REGRA 08):** a UI só afirma entrega quando o banco confirma `ENVIADO`. Nunca `alert()` nativo; nunca banner verde para disparo não confirmado.

**Backend:** `POST /cotacoes` com `disparar_ao_criar` responde 201 + `disparo_pendente: true` **antes** do envio (Resend excede timeout Railway ~30s). Job em background via `res.on('finish')` + `res.on('close')`, Prisma dedicado `withTenantIsolation`. E-mail via sidecar `127.0.0.1:8008` quando `BID_FRETE_SIDECAR=1`.

**Garantias anti-PENDENTE-eterno:**

1. **Watchdog pós-job** (`cotacoes.ts`): disparo ainda `PENDENTE` ao fim do job → `ERRO_ENVIO` com mensagem diagnóstica
2. **Cron 5min roda TAMBÉM em sidecar** (`startCronJobs()` incondicional em `server/src/index.ts`) — reenvia `PENDENTE` 2min–24h; >24h vira `ERRO_ENVIO` **sem reenvio**
3. Logs Railway com prefixo `[disparo-bg]`

> ⚠️ Armadilha que causou o bug de prod (#632): condicionar cron/jobs a `!BID_FRETE_SIDECAR` desliga a rotina exatamente no ambiente de produção. Todo job vital do produto DEVE rodar também em modo sidecar.

**Frontend (wizard):** polling `aguardarConfirmacaoDisparoCotacao` (2s, máx 45s) até disparos saírem de `PENDENTE`; falha de rede no GET **não lança** (retenta). Estados: `aguardando` (amarelo) → `sucesso` / `parcial` / `erro` / `nao_confirmado`. Cotação salva + polling falho ≠ "Erro ao criar cotação".

**Testes UNI:** `aguardar-confirmacao-disparo-bid-frete-internacional.test.ts`, `formatar-resultado-disparo-bid-frete-internacional.test.ts`

Doc: [MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §5.3–5.4

---

## Portos/Aeroportos alternativos opcionais (TASK-000405)

Cotação pode oferecer locais logísticos alternativos além do principal (origem/destino). Comprador configura no wizard; fornecedor escolhe qual usa ao responder.

| Peça | Caminho |
|------|---------|
| SSOT regras + parse JSON | `shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional.ts` |
| Hooks UI (rótulos Cadastros) | `client/src/shared/locais-opcionais-cotacao-bid-frete-internacional.ts` |
| Wizard passo 2 + resumo | `modal-nova-cotacao-bid-frete-internacional.tsx` |
| Detalhe comprador (card Rota) | `cotacao-detalhe.tsx` |
| Form fornecedor + validação | `formulario-resposta-cotacao-bid-frete-internacional.tsx` |
| Payload POST proposta | `montar-payload-proposta-resposta-bid-frete-internacional.ts` |
| Persistência local na proposta | `shared/local-proposta-resposta-bid-frete-internacional.ts` (marcador em `observacoes_proposta_*`) |
| Validação server | `server/src/lib/validar-locais-proposta-resposta-bid-frete-internacional.ts` |
| Normalização GET cotação | `mapCotacaoFromServer` — `parseCodigosOpcaoPortoAeroportoFromDb` |

**Campos cotação (Prisma):** `habilitar_opcao_porto_aeroporto_{origem,destino}_*` + `codigos_opcao_porto_aeroporto_{origem,destino}_*` (JSONB).

**Regra fornecedor:** se há opcionais no lado, select obrigatório; elegíveis = principal + opcionais. Doc: [DDD-VISAO-FORNECEDOR](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md) § Resposta — locais opcionais · wizard: [MODAL-NOVA-COTACAO](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §2.1.

---

## Detalhe da cotação — scroll (PR #338)

| Peça | Caminho |
|------|---------|
| Página | `client/src/pages/cotacao-detalhe.tsx` |
| CSS cockpit | `client/src/pages/cotacao-detalhe-cockpit.css` — modo expandido com scroll interno na aba |

Modo *Visão geral*: scroll único em `.tpg-main`. Abas Propostas / Disparos / Dados gerais: preenchem viewport com scroll interno.

### Faixa de aprovação no Painel de Insights (TASK-000286)

Quando `status_cotacao_bid_frete_internacional === 'APROVADA'`:

| Comportamento | Detalhe |
|---------------|---------|
| Substitui aviso comparativo | `FaixaResumoAprovacaoInsightsCotacao` no topo do cockpit |
| Colunas | Valor aprovado · Data da aprovação · Ganhador · Quem aprovou |
| Sem duplicata | Barra legada `dc-aprovado` na Visão geral **removida** |
| API | GET `/cotacoes/:id` e POST `/comparativo/:id/aprovar` enriquecem `id_usuario_aprovacao_ganho_bid_frete_internacional` + `nome_usuario_aprovacao_ganho_bid_frete_internacional` |

Doc: [COTACAO-DETALHE-COCKPIT-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/COTACAO-DETALHE-COCKPIT-TECNICO.md)

### Aba Propostas — tabela de composição + estimativa BRL (TASK-000313)

Paridade com portal do agente no detalhe da cotação (comprador).

| Peça | Caminho |
|------|---------|
| Tabela SSOT | `resumo-composicao-total-frete-bid-frete-internacional.tsx` — prop opcional `taxasConversaoBrl` |
| Read-only comprador | `tabela-resumo-proposta-readonly-bid-frete-internacional.tsx` |
| Dados da proposta | `montarDadosTabelaResumoPropostaBidFreteInternacional` (`taxas-linha-proposta-bid-frete-internacional.ts`) |
| Conversão BRL | `conversao-estimada-brl-proposta-bid-frete-internacional.ts` + `montarMapaTaxaParaBrl` (`taxas-cambio-insights-bid-frete-internacional.ts`) |
| Wiring | `propostas-detalhe-cotacao-bid-frete-internacional.tsx` (card combate), `modal-aprovar-proposta-bid-frete-internacional.tsx` |

**UX:** 1 proposta → tabela aberta; 2+ → expandir/recolher. Estimativa em reais: taxa `bid-frete:config:taxa-cambio` (localStorage) ou PTAX venda; conversão **por moeda**, sem cruzamento FX.

**Testes UNI:** `conversao-estimada-brl-proposta.test.ts`, `visao-fornecedor/taxas-linha-proposta-bid-frete-internacional.test.ts`

Doc: [COTACAO-DETALHE-COCKPIT-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/bid-frete-internacional/COTACAO-DETALHE-COCKPIT-TECNICO.md) §5

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
- Usar `destino_nome` da cotação para posicionar pin no mapa Insights — usar código + Cadastros (ver INSIGHTS §7).
- Gravar rota de cotação sem validar contra catálogo Cadastros quando modal ≠ rodoviário — usar `prepararRotaComValidacaoCadastros`.

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

- Unitários: `testes/testes-unitarios/produto-gravity/bid-frete-internacional/` (60+ specs)
- Dashboard ordem/visibilidade: `dashboard/dashboard-widget-visibilidade.test.ts`
- Dashboard GABI Fase 1: `dashboard/gabi-insights-bid-frete.test.ts`
- Insights: `insights/agregar-insights-graficos.test.ts`, `insights/montar-insights-detalhe.test.ts`, `insights/taxas-cambio-insights.test.ts`, `insights/insights-status-funil.test.ts`, `insights/divergencia-cadastros-mapa.test.ts`, `insights/formatar-terminal-mapa.test.ts`, `insights/filtrar-mapa-insights.test.ts`
- Cockpit faixa aprovação: `aviso-graficos-insights-cotacao.test.ts`
- Proposta tabela + BRL estimado: `conversao-estimada-brl-proposta.test.ts`, `visao-fornecedor/taxas-linha-proposta-bid-frete-internacional.test.ts`
- Funcionais: `testes/testes-funcionais/produto-gravity/bid-frete-internacional/`
- Hierarquia lista: `lista/lista-hierarquia-bid.test.ts`
- Nº cotação editável: `lista/map-cotacao-to-server.test.ts`, `lista/salvar-campo-numero-cotacao.test.ts`
- Filtros de coluna: `lista/filtros-coluna-lista-bid-frete-internacional.test.ts`
- Seletor SLA 1s: `testes/testes-e2e/menu-botoes/seletor-universal-visoes/` (`MBOTO`)

---

## Governança (SSOT — não redefinir aqui)

> ⚠️ REGRA ABSOLUTA: Ver `skills/governanca/lei/9-mandamentos/SKILL.md`  
> ⚠️ Nomenclatura: Ver `skills/governanca/lei/ddd-nomenclatura/SKILL.md`  
> ⚠️ Schema/migrations: Ver `skills/governanca/lei/database-governance/SKILL.md` — alterações via `fragment.prisma` + script do Coordenador
