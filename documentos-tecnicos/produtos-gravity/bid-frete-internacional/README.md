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

## Entregas recentes (2026-06)

| PR / entrega | Escopo |
|--------------|--------|
| AGT-000264 (2026-06-15) | Lista: chevron só em BID (COT avulsa sem expand); `filtrarBidsParaLista` + enrich; fix cotações sumidas ao vincular subset — ver [ENTIDADE-BID-TECNICO.md](./ENTIDADE-BID-TECNICO.md) §5 e [LISTA-ACOES-LOTE](./LISTA-ACOES-LOTE-BID-FRETE-INTERNACIONAL.md) |
| 2026-06 carga perigosa | Catálogo `mercadoria_perigosa` (Cadastros), 7 colunas DG na cotação, proxy `dados-mestre/mercadorias-perigosas`, modal passos 1/3 — ver [CARGA-PERIGOSA-TECNICO.md](./CARGA-PERIGOSA-TECNICO.md) |
| #284 | Passo Fornecedores: preview Aberta, calendário prazo, `criarCotacaoComDisparo`, feedback ruidoso disparo |
| #288 | Selecionar/Desmarcar todos (Direcionada), rótulo *Ver fornecedores e notas* |
| #290 | Barras de nota na Direcionada (`BarrasNotasFornecedores` abaixo da lista) |
| #289 | Lista: expandir/recolher, seleção, duplicar e excluir em lote |
| #294 | Lista: botões Duplicar/Excluir só ícone (paridade Pedido) |
| #300 | Modal excluir: layout paridade `ModalPedidosExcluir` (Solid Slate) |
| #302 | Passo 4 WIP: loader, meta tipo/nota, excluir Aberta, catálogo aeroportos, filtro elegíveis POST |
| #301 | Modal excluir: anti-flicker (preview 1× ao montar, montagem condicional no pai) |

## Entregas recentes (2026-05)

| PR / entrega | Escopo |
|--------------|--------|
| #108 | Entidade `bid_frete_internacional`, FK na cotação, lista hierárquica, config status BID |
| #114 | Reorder colunas Railway, snapshot `id_bid` na proposta, fixup bid/ganho |

---

## Atlas DDD (refatoração histórica)

Mapeamento campo-a-campo e rotas legado→DDD: `documentos-tecnicos/ddd-atlas/bid-frete/`  
Documentação **operacional atual** deste produto: pasta deste README.
