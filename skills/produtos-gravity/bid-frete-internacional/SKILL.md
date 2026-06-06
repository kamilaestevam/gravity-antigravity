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
Agregação resumo BID: `client/src/shared/agregar-resumo-bid-frete-internacional.ts`

Query avulsas: `GET /cotacoes?apenas_avulsas=true` (sem `id_bid`).

### Painéis da Lista (paridade Pedido)

- Model: `ListaPainelUsuarioGlobal` (`id_produto_gravity = 'bid-frete-internacional'`)
- API: `GET|POST|PATCH|DELETE /api/v1/bid-frete-internacional/lista/paineis`
- Contrato `config_json`: `shared/listaPainelConfigSchema.ts` (Zod `.strict()`)
- UI: `BidFreteListaPainelBar` + `useListaPainelBidFrete` em `lista-bid-frete-internacional.tsx`
- Escopo de filiais: seletor lateral `modoWorkspace="multiplo"` (paridade Pedido) — preferência em `GET/PUT /config/escopo-workspaces`; painel Lista **não** guarda `ids_workspaces_escopo`
- Doc: `documentos-tecnicos/produtos-gravity/bid-frete-internacional/ESCOPO-MULTI-WORKSPACE-TECNICO.md`

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

Doc: [seletor-universal-visualizacoes.md](../../../documentos-tecnicos/arquitetura/seletor-universal-visualizacoes.md) · E2E: `TST-E2E-MBOTO-000003` (cliente), `000004` (fornecedor).

---

## Testes

- Unitários: `testes/testes-unitarios/bid-frete-internacional/` (60+ specs)
- Funcionais: `testes/testes-funcionais/bid-frete-internacional/`
- Hierarquia lista: `lista/lista-hierarquia-bid.test.ts`
- Seletor SLA 1s: `testes/testes-e2e/menu-botoes/seletor-universal-visoes/` (`MBOTO`)

---

## Governança (SSOT — não redefinir aqui)

> ⚠️ REGRA ABSOLUTA: Ver `skills/governanca/lei/9-mandamentos/SKILL.md`  
> ⚠️ Nomenclatura: Ver `skills/governanca/lei/ddd-nomenclatura/SKILL.md`  
> ⚠️ Schema/migrations: Ver `skills/governanca/lei/database-governance/SKILL.md` — alterações via `fragment.prisma` + script do Coordenador
