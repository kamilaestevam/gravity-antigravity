# Catálogo de aeroportos (Cadastros) — BID Frete Internacional

> **SSOT código:** `@nucleo/catalogo-aeroportos-cadastros`  
> **Pacote:** `nucleo-global/Utilidades/catalogo-aeroportos-cadastros/`  
> **Proxy BID:** `servicos-global/produto/bid-frete-internacional/server/src/routes/aeroportos.ts`  
> **Entrega:** PR #302 (cache client + limit alto no proxy)

---

## Objetivo

Reduzir round-trips ao Cadastros na Nova Cotação (modal **Aéreo**): uma requisição indexada com cache em memória por sessão, em vez de múltiplas buscas por país.

---

## Limites

| Contexto | Constante | Valor |
|----------|-----------|-------|
| Catálogo global | `LIMITE_CATALOGO_AEROPORTOS_GLOBAL` | 10.000 |
| Por país | `LIMITE_CATALOGO_AEROPORTOS_POR_PAIS` | 2.000 |

Se `total > itens.length`, o client emite `console.warn` `[catalogo-aeroportos] truncado` — monitorar orgs com catálogo muito grande.

---

## Fluxo

1. **Front** (`useCadastrosLogistica` / `useAeroportosPorPais`) chama `GET /api/v1/bid-frete-internacional/dados-mestre/aeroportos`
2. **Proxy** repassa para Cadastros com `apenas_ativos=true` e `limit` até 10.000 (sem filtro q/pais)
3. **Núcleo** (`carregarCatalogoAeroportosCadastros`) cacheia por chave `__all__` ou código ISO do país

---

## Consumidores no monorepo

- BID Frete Internacional (client + server proxy)
- BID Frete nacional (`bid-frete/client`, `bid-frete/server`)
- Pedido / Processo (`useLogisticaCadastrosPedido`)

---

## Atualização 2026-07-05 — TASK-000415: sem filtro de país nos selects do wizard

Os selects de porto/aeroporto de origem/destino no wizard Nova Cotação **não** enviam `?pais=` — o catálogo consultado é sempre o global (ver modal §8). O parâmetro `pais` permanece disponível na API para outros consumidores (lista, importação) que precisem filtrar explicitamente.

---

## Backlog

| Item | Nota |
|------|------|
| Zod no parse Cadastros → client | Mandamento 06 — hoje `fetchCadastrosJson` + tipos TS |
| Invalidar cache pós-deploy Cadastros | TTL ou evento — hoje cache vitalício por sessão |
