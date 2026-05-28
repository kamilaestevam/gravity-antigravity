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

- Linhas **BID** expandem para cotações filhas.
- Cotações **avulsas** (`id_bid` null) aparecem no nível raiz.
- Propostas: expand da cotação (3º nível quando implementado inline).

Query backend: `apenas_avulsas=true` exclui cotações já vinculadas a um BID.

---

## 6. Migração de legado

Migration `20260529140000_add_bid_frete_internacional_entity`:

- Cria tabela `bid_frete_internacional`
- Adiciona `id_bid` nullable na cotação
- Agrupa cotações legadas por `referencia_interna_cotacao_bid_frete_internacional` (quando repetida)

---

## 7. Anti-padrões

| ❌ Não fazer | ✅ Fazer |
|-------------|----------|
| Filtrar BID por `referencia_interna` na cotação | Usar `id_bid_bid_frete_internacional` |
| Escrever `id_bid` na proposta sem ler cotação | `snapshotPropostaFromCotacao(cotacao)` |
| Reutilizar status de cotação para BID | Config e enum separados |

---

## 8. Referências de código

- `prisma/fragment.prisma` — models `BidFreteInternacional`, FKs
- `server/src/lib/snapshot-proposta-bid-frete.ts`
- `server/src/services/motor-bid-frete-internacional.ts`
- `testes/testes-unitarios/bid-frete-internacional/lista/lista-hierarquia-bid.test.ts`
