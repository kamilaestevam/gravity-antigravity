---
name: antigravity-bid-frete-internacional
description: "Use em tarefas do BID Frete Internacional — entidade BID opcional, cotações, propostas, lista hierárquica, snapshots, migrations e configurador de status."
---

# Gravity — BID Frete Internacional

> Produto: `bid-frete-internacional` · Porta: **8023** · Banco dedicado Railway  
> Código: `servicos-global/produto/bid-frete-internacional/`  
> Docs: `documentos-tecnicos/produtos-gravity/bid-frete-internacional/` · Atlas DDD: `documentos-tecnicos/ddd-atlas/bid-frete/`

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

Consumidores: `motor-bid-frete-internacional.ts`, `portal.ts`, `cotacoes-publicas.ts`.

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

## Testes

- Unitários: `testes/testes-unitarios/bid-frete-internacional/` (60+ specs)
- Funcionais: `testes/testes-funcionais/bid-frete-internacional/`
- Hierarquia lista: `lista/lista-hierarquia-bid.test.ts`

---

## Governança (SSOT — não redefinir aqui)

> ⚠️ REGRA ABSOLUTA: Ver `skills/governanca/lei/9-mandamentos/SKILL.md`  
> ⚠️ Nomenclatura: Ver `skills/governanca/lei/ddd-nomenclatura/SKILL.md`  
> ⚠️ Schema/migrations: Ver `skills/governanca/lei/database-governance/SKILL.md` — alterações via `fragment.prisma` + script do Coordenador
