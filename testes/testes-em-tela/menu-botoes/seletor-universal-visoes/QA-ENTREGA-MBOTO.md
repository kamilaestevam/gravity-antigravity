# QA — Entrega MBOTO (Seletor universal SLA 1s)

**Data:** 2026-06-02  
**Código base:** mergeado em `master` via PR [#162](https://github.com/dmmltda/gravity-antigravity/pull/162)  
**Follow-up SLA 1s:** PR `#163` — branch `feat/menu-botoes/mboto-sla-1s-follow-up`

## Critérios bloqueantes

| # | Critério | Status |
|---|----------|--------|
| 1 | Plano mestre JSON | ✅ `testes/_planos/menu-botoes/seletor-universal-visoes/PLANO-MESTRE-SELETOR-UNIVERSAL.json` |
| 2 | TST-E2E-MBOTO-000001 Pedido T0 | ⏳ Executar com `PLAYWRIGHT_PEDIDO_AUTH=1` |
| 3 | APIs p95 < 200ms staging | ⏳ Sentry 7d (fora do escopo automatizado aqui) |
| 4 | T2 16 WS | ⏳ `PLAYWRIGHT_PEDIDO_T2=1` nightly |
| 5 | BID + Processo smoke E2E | ⏳ flags `PLAYWRIGHT_BID_AUTH` / `PLAYWRIGHT_PROCESSO_AUTH` |
| 6 | data-testid | ✅ Pedido, BID, Processo |
| 7 | Registry | ✅ `test-plans-registry.json` |

## Código de paridade

- **Pedido:** keep-alive + prefetch + agregado (pré-existente nesta branch).
- **BID:** `BidFreteMultiView`, layout route, prefetch chunk.
- **Processo:** `ProcessoMultiView`, layout route, prefetch chunk.

## Testes automatizados locais

```bash
npx vitest run --config testes/testes-unitarios/menu-botoes/seletor-universal-visoes/vitest.config.ts
npx vitest run --config testes/testes-funcionais/menu-botoes/seletor-universal-visoes/vitest.config.ts
npm run validate:test-ids
```

## Aprovação dono

Aguardando execução E2E em staging e assinatura do plano mestre.
