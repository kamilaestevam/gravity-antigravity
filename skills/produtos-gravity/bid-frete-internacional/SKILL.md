---
name: antigravity-bid-frete-internacional
description: "Use em tarefas do BID Frete Internacional — pedido de cotação, BID opcional, propostas, lista hierárquica, configurador de status."
---

# Gravity — BID Frete Internacional

## Hierarquia de negócio

```
Fluxo padrão (diário):
  Pedido de cotação (cotacao_bid_frete_internacional) → Proposta(s)

Exceção — conjunto BID:
  bid_frete_internacional → N cotações → propostas por cotação
```

- **BID** é opcional (`id_bid_bid_frete_internacional` nullable na cotação).
- **Proposta** não tem `id_bid` — deriva via cotação.
- **Proposta** tem `id_workspace` (snapshot da cotação na criação).

## Lista (UI)

| Caso | Camadas |
|------|---------|
| Avulsa | Cotação → Propostas |
| BID | BID → Cotações → (propostas no detalhe da cotação filha) |

## Banco (SSOT)

| Tabela | Model Prisma |
|--------|--------------|
| `bid_frete_internacional` | `BidFreteInternacional` |
| `cotacao_bid_frete_internacional` | `CotacaoBidFreteInternacional` |
| `proposta_bid_frete_internacional` | `PropostaBidFreteInternacional` |
| `status_bid_config_bid_frete_internacional` | `StatusBidConfigBidFreteInternacional` |

## API

- `GET/POST /api/v1/bid-frete-internacional/bids-frete-internacional`
- `GET /api/v1/bid-frete-internacional/cotacoes?apenas_avulsas=true`
- `GET/POST /api/v1/bid-frete-internacional/config/status-bid-frete-internacional`

## Anti-padrões

- Agrupar BID por `referencia_interna` na cotação (legado — usar `id_bid`).
- `id_bid` em proposta (redundante).
- Confundir status de cotação com status de BID no configurador.

## Governança

> ⚠️ Schema via `fragment.prisma` + `compose-schema.js` — Coordenador aprova migrations.

Referências: `skills/governanca/lei/9-mandamentos`, `skills/governanca/lei/ddd-nomenclatura`, `skills/governanca/lei/database-governance`.
