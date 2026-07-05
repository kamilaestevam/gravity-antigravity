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

## Atualização 2026-07-05 — paginação + busca remota no modal Nova Cotação

Os selects do wizard **não** carregam mais o catálogo inteiro de uma vez: usam paginação por `offset` (100 por página no scroll) e busca remota no banco completo (150 resultados). SSOT: `shared/limites-catalogo-logistica-bid-frete-internacional.ts` + hook `use-select-catalogo-logistica-cadastros-bid-frete-internacional.ts`. Rotas do Cadastros (`portos.ts`, `aeroportos.ts`) e proxies BID aceitam `offset` e devolvem `total`. Detalhes: [MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md](./MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md) §8.1.

**Portos:** mesmo hook paginado e mesmas rotas (`dados-mestre/portos?tipo=porto`). **TASK-000415:** selects de origem/destino no wizard **não** enviam `?pais=` — catálogo sempre global (ver modal §8.2). O parâmetro `pais` permanece disponível na API para outros consumidores (lista, importação) que precisem filtrar explicitamente.

**Importação por planilha (TASK-000415):** o contexto base da importação carrega uma página do catálogo (500 portos de ~17k ativos). Locais citados na planilha que não resolvem contra a página são buscados remotamente (`?q=valor`) e anexados ao contexto por `enriquecerContextoCatalogoLocaisImportacaoBid` (`client/src/shared/carregar-contexto-catalogo-importacao-bid-frete-internacional.ts`) — o preview recalcula e nenhum porto/aeroporto vira «inválido» por estar fora da página. Teste UNI: `testes/testes-unitarios/produto-gravity/bid-frete-internacional/catalogo/enriquecer-contexto-catalogo-importacao-bid-frete-internacional.test.ts`.

---

## Backlog

| Item | Nota |
|------|------|
| Zod no parse Cadastros → client | Mandamento 06 — hoje `fetchCadastrosJson` + tipos TS |
| Invalidar cache pós-deploy Cadastros | TTL ou evento — hoje cache vitalício por sessão |
