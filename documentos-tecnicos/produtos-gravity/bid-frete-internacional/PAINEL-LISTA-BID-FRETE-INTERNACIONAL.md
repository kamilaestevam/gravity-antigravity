# Painéis da Lista — BID Frete Internacional

> **Status:** Implementado (2026-06-02) — lista cliente · rodapé/paginação (2026-06-15)  
> **Contrato base:** [../pedido/PAINEL-LISTA-CONTRATO.md](../pedido/PAINEL-LISTA-CONTRATO.md)  
> **id_produto_gravity:** `bid-frete-internacional`

## Rodapé e paginação (paridade Pedido)

**Modelo visual:** Lista de Pedidos — `220 pedidos · 899 itens · página 1 de 3` + controles « ‹ **1** **2** **3** › » à direita.

**BID Frete (cliente):** `X bids · Y cotações · página N de M` — mesma estrutura e mesmos controles do `TabelaVirtualGlobal`.

| Peça | Valor |
|------|-------|
| Paginação | **Client-side** — slice de `linhasPaiFiltradas` → `linhasPaiPagina` |
| `itensPorPagina` | `tabelaConfig.linhasPorPagina` (25 \| 50 \| 100 \| 200) |
| Preferência tabela | Configurações › Tabela · storage `bid-frete:config:tabela` (`shared/tabela-config-bid-frete.ts`) |
| Sync config | evento `SYNC_EVENT_TABELA_BID_FRETE` + `storage` + `focus` na lista |
| Reset `paginaLista` | ao mudar aba (`filtroTab`), busca ou `linhasPorPagina` |
| 1º segmento rodapé | total de **linhas pai filtradas** (paridade Pedido: pedidos = entidade paginada) — omitir `totalRodapePai` para usar `totalItens` |
| 2º segmento | `cotacoesFiltradas.length` via prop `totalFilhos` |
| Labels i18n | `bidfrete.lista.label_bid_one/other`, `label_cotacao_one/other` (pt, en) |
| Botões 1·2·3 | GTV `gtv-paginacao-controles` — só quando `totalPaginas > 1`; com 1 página, texto do rodapé permanece visível |

### Props GTV (extensão opt-in — núcleo)

Documentadas em `nucleo-global/Tabelas/tabela-virtual-global/src/tipos.ts`:

| Prop | Uso BID Frete |
|------|----------------|
| `labelPai` | bid / bids (i18n) |
| `labelFilho` | cotação / cotações (i18n) — default núcleo: item/itens |
| `totalFilhos` | total de cotações filtradas |
| `totalRodapePai` | opcional — só quando 1º segmento difere de `totalItens`; preferir omitir e deixar `totalItens={linhasPaiFiltradas.length}` |
| `paginaAtual` + `onMudarPagina` + `totalItens` | modo paginação externa (mesmo contrato do Pedido) |

Pedido permanece inalterado — props novas são opcionais com defaults retrocompatíveis.

### Altura da tabela (WIP layout)

| Item | Valor |
|------|-------|
| CSS interim | `.bf-lista-page .lp-tabela-wrapper { min-height: 620px; }` — `bid-frete-page-shell.css` |
| Alvo | cadeia flex/viewport até o rodapé (sem vazio abaixo da grid), como Pedido |

### Visão fornecedor

Paginação client-side idêntica (`lista-visao-fornecedor-bid-frete-internacional.tsx`). Rodapé exibe **cotações** — **sem** segmento “bids” (persona sem BID na grid).

---

## API

`/api/v1/bid-frete-internacional/lista/paineis`

## Migração

Na primeira carga, preferências em `localStorage` (`bid-frete-internacional:config:tabela_preferencias`) são copiadas para o painel **Principal** via PUT.

## UI

`BidFreteListaPainelBar` na visão lista de `lista-bid-frete-internacional.tsx`.

**Renomear aba Padrão:** ver [§5.2 do contrato Pedido](../pedido/PAINEL-LISTA-CONTRATO.md#52-rótulo-e-renomear-painel-task-000288) — banco `Principal`, UI `Padrão`, input vazio ao renomear.

---

## Filtros de coluna (paridade Pedido — TASK-000269)

Todas as colunas visíveis na grid exibem ícone ▾ no header (`FiltroPopoverColuna` + `FiltroChips` do `@nucleo/tabela-virtual-global`). Filtros são **client-side** sobre o dataset já carregado na lista.

| Peça | Caminho |
|------|---------|
| Estado / wiring | `lista-bid-frete-internacional.tsx` — `filtrosAtivosLista`, `onFiltroColuna`, `filtrosAtivosKeys` |
| Lógica filtro | `shared/filtros-coluna-lista-bid-frete-internacional.ts` |
| Colunas fixas | `pages/colunas-lista-bid-frete-internacional.ts` — `garantirFiltravelColunaLista` |

**Colunas manuais:** `mapColunaUsuarioBidFreteParaGTColuna` com `filtravel: true` explícito; valores em `_colunas_usuario[col.id]` via `bid-frete:config:valores-colunas-usuario` (localStorage WIP até API Pedido).

**Testes UNI:** `testes/testes-unitarios/produto-gravity/bid-frete-internacional/lista/filtros-coluna-lista-bid-frete-internacional.test.ts`

---

## Filtros de coluna (paridade Pedido — TASK-000269)

Todas as colunas visíveis na grid exibem ícone ▾ no header (`FiltroPopoverColuna` + `FiltroChips` do `@nucleo/tabela-virtual-global`). Filtros são **client-side** sobre o dataset já carregado na lista.

| Peça | Caminho |
|------|---------|
| Estado / wiring | `lista-bid-frete-internacional.tsx` — `filtrosAtivosLista`, `onFiltroColuna`, `filtrosAtivosKeys` |
| Lógica filtro | `shared/filtros-coluna-lista-bid-frete-internacional.ts` — `cotacaoPassaFiltrosColuna`, `calcularValoresUnicosPorCampoBidFrete` |
| Colunas fixas | `pages/colunas-lista-bid-frete-internacional.ts` — `garantirFiltravelColunaLista` |
| Persistência painel | `config_json` do painel inclui `filtrosAtivos` (via `useListaPainelBidFrete`) |

**Valores únicos:** derivados de todas as cotações na sessão (lista principal, avulsas e filhas de BID), não só da página paginada.

**Núcleo:** sem alteração em `nucleo-global/TabelaVirtualGlobal` — reutiliza props existentes.

---

## Colunas personalizadas (Configurações › Colunas)

Definição das colunas manuais (ex.: Líder, Coordenador, Margem Comercial):

| Item | Valor |
|------|-------|
| Storage definição | `bid-frete:config:colunas-personalizadas` |
| Evento sync lista | `bid-frete:colunas-personalizadas-atualizado` (`EVENTO_COLUNAS_PERSONALIZADAS_BID_FRETE_ATUALIZADO`) |
| Helper leitura | `shared/colunas-personalizadas-lista-bid-frete-internacional.ts` |
| Mapper GTColuna | `mapColunaUsuarioBidFreteParaGTColuna` em `filtros-coluna-lista-bid-frete-internacional.ts` |

Colunas manuais com `escopo` `pedido` ou `ambos` entram na lista; novas chaves são auto-incluídas em `preferencias.colunas_visiveis` quando o usuário já tem preferências salvas.

### Valores por cotação (WIP — paridade Pedido pendente API)

Até existir rota `colunas-usuario/valores` no backend, valores editados na lista ficam em:

| Item | Valor |
|------|-------|
| Storage valores | `bid-frete:config:valores-colunas-usuario` |
| Shape | `Record<id_cotacao, Record<id_coluna, string>>` |
| Helper | `shared/valores-colunas-usuario-bid-frete-internacional.ts` |
| Campo na linha | `_colunas_usuario` keyed por **col.id** (não por `chave`) — espelha Pedido |

Na carga (`carregar`), cotações são enriquecidas com `enriquecerCotacoesComColunasUsuario`. Edição inline em coluna manual salva no localStorage e atualiza `_colunas_usuario` no estado local.

**Filtro:** `cotacaoPassaFiltrosColuna` resolve valor via `findDisplay` / mapa `colunasPersonalizadasPorChave` (chave → `col.id`).

**Testes UNI:** `testes/testes-unitarios/produto-gravity/bid-frete-internacional/lista/filtros-coluna-lista-bid-frete-internacional.test.ts`
