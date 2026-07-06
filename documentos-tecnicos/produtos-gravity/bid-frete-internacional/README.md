# BID Frete Internacional — Documentação Técnica

> **Produto:** `bid-frete-internacional`  
> **Código:** `servicos-global/produto/bid-frete-internacional/`  
> **Skill operacional:** `skills/produtos-gravity/bid-frete-internacional/SKILL.md`  
> **Atlas DDD (legado/refatoração):** `documentos-tecnicos/ddd-atlas/bid-frete/`

---

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md](./MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) | Wizard Nova Cotação (5 passos), passo Fornecedores, disparo, preview e seleção |
| [CARGA-PERIGOSA-TECNICO.md](./CARGA-PERIGOSA-TECNICO.md) | Catálogo ONU (Cadastros), 7 colunas na cotação, proxy, Zod, UX passos 1/3 |
| [CATALOGO-AEROPORTOS-CADASTROS.md](./CATALOGO-AEROPORTOS-CADASTROS.md) | Cache aeroportos Cadastros (#302) — limites, proxy, consumidores |
| [ENTIDADE-BID-TECNICO.md](./ENTIDADE-BID-TECNICO.md) | Entidade BID opcional, hierarquia, FKs, snapshots, API CRUD |
| [LISTA-ACOES-LOTE-BID-FRETE-INTERNACIONAL.md](./LISTA-ACOES-LOTE-BID-FRETE-INTERNACIONAL.md) | Lista: expandir/recolher, seleção, duplicar e excluir em lote (API + UX) |
| [PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md](./PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md) | Painéis persistidos da lista de cotações |
| [ORDEM-COLUNAS-BANCO-TECNICO.md](./ORDEM-COLUNAS-BANCO-TECNICO.md) | Convenção de ordem física no PostgreSQL (Railway UI), migrations |
| [SNAPSHOT-PROPOSTA-TECNICO.md](./SNAPSHOT-PROPOSTA-TECNICO.md) | `id_workspace` + `id_bid` na proposta — quando e como preencher |
| [DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md](./DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md) | Namespace `visao_fornecedor_bid_frete_internacional` — API, SPA, contratos, i18n |
| [INSIGHTS-VISAO-GERAL-TECNICO.md](./INSIGHTS-VISAO-GERAL-TECNICO.md) | Aba Insights: KPIs fixos + regra operacional #427, `/kpis` ampliado, tooltips UX 10, drill-down, PTAX, mapa Cadastros |
| [COTACAO-DETALHE-COCKPIT-TECNICO.md](./COTACAO-DETALHE-COCKPIT-TECNICO.md) | Cockpit detalhe cotação: Painel de Insights, faixa `APROVADA`, aba Propostas (tabela completa + estimativa BRL), modal Aprovar |

---

## Identidade do produto

| Atributo | Valor |
|----------|-------|
| `id_produto_gravity` | `bid-frete-internacional` |
| Porta backend | 8023 |
| Banco Railway prod | `gravity-bid-frete-internacional-producao` |
| Banco Railway teste | `gravity-bid-frete-internacional-teste` |
| Env migration | `BID_FRETE_INTERNATIONAL_DATABASE_URL` |
| Fragment Prisma | `servicos-global/produto/bid-frete-internacional/prisma/fragment.prisma` |

---

## Entregas recentes (2026-07)

| Task / entrega | Escopo |
|----------------|--------|
| TASK-000407 (2026-07-04) | Nº da cotação editável: wizard passo 1 (auto-gerado + customizável no POST), lista inline (PATCH), UX texto vs ícone abrir — ver [MODAL-NOVA-COTACAO](./MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §2.1 e [PAINEL-LISTA](./PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md) § Nº da cotação |
| TASK-000405 (2026-07-04) | Portos/aeroportos alternativos opcionais: wizard passo 2 + resumo, card Rota no detalhe, seleção obrigatória na resposta do fornecedor — ver [MODAL-NOVA-COTACAO](./MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §2.1 · [COTACAO-DETALHE-COCKPIT](./COTACAO-DETALHE-COCKPIT-TECNICO.md) §6 · [DDD-VISAO-FORNECEDOR](./DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md) § Resposta — locais opcionais |

## Entregas recentes (2026-06)

| PR / entrega | Escopo |
|--------------|--------|
| KPIs Insights semânticos (#427, 2026-06-23) | Cards aguardando aprovação/resposta: where operacional, `Math.max(api, funil)`, tooltips UX 10, campos `/kpis` (`kpi_insights_*`, `valor_*_usd`, modais) — ver [INSIGHTS-VISAO-GERAL-TECNICO.md](./INSIGHTS-VISAO-GERAL-TECNICO.md) §3 |
| Mapa Insights + validação rota (2026-06-23) | Mapa geocodifica via Cadastros (não nome da cotação); alerta hover quando nome/país diverge (ex. Athens+MMI); `POST`/`PATCH` cotação valida rota contra catálogo — ver [INSIGHTS-VISAO-GERAL-TECNICO.md](./INSIGHTS-VISAO-GERAL-TECNICO.md) §7–9 |
| TASK-000318 (2026-06-23) | Toggle Refinar mapa: cor e tooltip no padrão `MenuLateralGlobal` — ver [INSIGHTS-VISAO-GERAL-TECNICO.md](./INSIGHTS-VISAO-GERAL-TECNICO.md) §5.1 |
| TASK-000313 (2026-06-23) | Aba Propostas (card combate) e modal Aprovar: tabela completa da composição (paridade portal agente) + estimativa `≈ R$` por moeda (taxa produto ou PTAX) — ver [COTACAO-DETALHE-COCKPIT-TECNICO.md](./COTACAO-DETALHE-COCKPIT-TECNICO.md) §5 |
| TASK-000286 (2026-06-16) | Cockpit cotação `APROVADA`: faixa verde no Painel de Insights (valor, data, ganhador, quem aprovou); remove banner comparativo e barra legada em Visão geral — ver [COTACAO-DETALHE-COCKPIT-TECNICO.md](./COTACAO-DETALHE-COCKPIT-TECNICO.md) |
| #338 (2026-06-15) | Detalhe cotação: scroll vertical restaurado (`cotacao-detalhe-cockpit.css`); disparo multi-e-mail/WhatsApp via Cadastros `contatos_fornecedor`; modal fornecedor Configurador com abas — ver [MODAL-NOVA-COTACAO](./MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §5.5 |
| TASK-000269 (2026-06-15) | Lista: filtros ▾ em todas colunas (paridade Pedido), colunas manuais com `filtravel` + `_colunas_usuario` (localStorage WIP) — ver [PAINEL-LISTA](./PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md) § Filtros |
| GABI Dashboard Fase 1 (2026-06-15) | `GET /dashboard/insights`, motor server, Zod client, fallback client — ver [ENTIDADE-BID-TECNICO.md](./ENTIDADE-BID-TECNICO.md) §5.1 |
| QueryClient BID Frete (2026-06-15) | `bid-frete-query-client.ts` + `QueryClientProvider` em `App.tsx` (perm. dashboard) |
| TASK-000264 Insights (2026-06-15) | Dados reais, KPIs↔Config, `data_referencia` drill-down, Zod query server — ver [INSIGHTS-VISAO-GERAL-TECNICO.md](./INSIGHTS-VISAO-GERAL-TECNICO.md) |
| Dashboard paridade Pedido (2026-06-15) | Menu ⋮ por widget, `layoutInteracao`, permissões `dashboard:editar`, ordem pós-drag — ver [ENTIDADE-BID-TECNICO.md](./ENTIDADE-BID-TECNICO.md) §5.1 |
| AGT-000264 (2026-06-15) | Lista: chevron só em BID (COT avulsa sem expand); `filtrarBidsParaLista` + enrich — ver [ENTIDADE-BID-TECNICO.md](./ENTIDADE-BID-TECNICO.md) §5 e [LISTA-ACOES-LOTE](./LISTA-ACOES-LOTE-BID-FRETE-INTERNACIONAL.md) |
| 2026-06 carga perigosa | Catálogo `mercadoria_perigosa` (Cadastros), 7 colunas DG na cotação, proxy `dados-mestre/mercadorias-perigosas`, modal passos 1/3 — ver [CARGA-PERIGOSA-TECNICO.md](./CARGA-PERIGOSA-TECNICO.md) |
| #284 | Passo Fornecedores: preview Aberta, calendário prazo, `criarCotacaoComDisparo`, feedback ruidoso disparo |
| #288 | Selecionar/Desmarcar todos (Direcionada), rótulo *Ver fornecedores e notas* |
| #290 | Barras de nota na Direcionada (`BarrasNotasFornecedores` abaixo da lista) |
| #289 | Lista: expandir/recolher, seleção, duplicar e excluir em lote |
| #294 | Lista: botões Duplicar/Excluir só ícone (paridade Pedido) |
| #300 | Modal excluir: layout paridade `ModalPedidosExcluir` (Solid Slate) |
| #302 | Passo 4 WIP: loader, meta tipo/nota, excluir Aberta, catálogo aeroportos, filtro elegíveis POST |
| #301 | Modal excluir: anti-flicker (preview 1× ao montar, montagem condicional no pai) |

## Entregas recentes (2026-07)

| Task / entrega | Escopo |
|----------------|--------|
| TASK-000415 (2026-07-05) | Pontos cegos do catálogo de portos/aeroportos eliminados em 3 frentes: (1) wizard sem filtro invisível por país — busca global (Hamburg, Frankfurt); (2) server resolve origem/destino individualmente no snapshot de rota (`garantirTerminaisRotaNoContextoCatalogo`) — fim do erro «Nome gravado (BRSSZ) não corresponde ao Cadastros (Santos)»; (3) importação por planilha enriquece o contexto com busca remota dos locais fora da página (`enriquecerContextoCatalogoLocaisImportacaoBid`) — ver [MODAL-NOVA-COTACAO](./MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §8.2/§8.4 · [CATALOGO-AEROPORTOS-CADASTROS](./CATALOGO-AEROPORTOS-CADASTROS.md) |
| Catálogo paginado + busca remota (2026-07-05) | Hook `use-select-catalogo-logistica-cadastros-bid-frete-internacional`, limites SSOT, `offset`/`total` no Cadastros e proxy BID — ver [MODAL-NOVA-COTACAO](./MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §8.1 |

## Entregas recentes (2026-05)

| PR / entrega | Escopo |
|--------------|--------|
| #108 | Entidade `bid_frete_internacional`, FK na cotação, lista hierárquica, config status BID |
| #114 | Reorder colunas Railway, snapshot `id_bid` na proposta, fixup bid/ganho |

---

## Atlas DDD (refatoração histórica)

Mapeamento campo-a-campo e rotas legado→DDD: `documentos-tecnicos/ddd-atlas/bid-frete/`  
Documentação **operacional atual** deste produto: pasta deste README.
