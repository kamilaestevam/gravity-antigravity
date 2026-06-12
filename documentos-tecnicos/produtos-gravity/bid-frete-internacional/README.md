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
| [ENTIDADE-BID-TECNICO.md](./ENTIDADE-BID-TECNICO.md) | Entidade BID opcional, hierarquia, FKs, snapshots, API CRUD |
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
| #284 | Passo Fornecedores: preview Aberta, calendário prazo, `criarCotacaoComDisparo`, feedback ruidoso disparo |
| #288 | Selecionar/Desmarcar todos (Direcionada), rótulo *Ver fornecedores e notas* |
| #290 | Barras de nota na Direcionada (`BarrasNotasFornecedores` abaixo da lista) |
| #289 | Lista: expandir/recolher, seleção, duplicar e excluir em lote |

## Entregas recentes (2026-05)

| PR / entrega | Escopo |
|--------------|--------|
| #108 | Entidade `bid_frete_internacional`, FK na cotação, lista hierárquica, config status BID |
| #114 | Reorder colunas Railway, snapshot `id_bid` na proposta, fixup bid/ganho |

---

## Atlas DDD (refatoração histórica)

Mapeamento campo-a-campo e rotas legado→DDD: `documentos-tecnicos/ddd-atlas/bid-frete/`  
Documentação **operacional atual** deste produto: pasta deste README.
