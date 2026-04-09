# Resultado — Teste em Tela
**Data:** 2026-04-09
**Produto:** produto/pedido/client
**Ajuste relacionado:** fix requireInternalKey + tenantIsolation (smart-import/template)
**Pasta de prints:** testes/testes-em-tela/produto/pedido/2026-04-09-vite-compile-useTaxasCambio/

---

## CAUSA RAIZ DO ERRO REPORTADO

O overlay "Failed to resolve import ../shared/useTaxasCambio" foi causado pelo
`git stash --include-untracked` executado durante a verificação de regressão anterior.
O arquivo `useTaxasCambio.ts` é **untracked** (não commitado), então o stash o removeu
temporariamente do disco. O Vite detectou a ausência via HMR e exibiu o overlay.
Após `git stash pop` o arquivo voltou e o Vite se recuperou automaticamente.

**Não é um bug no código — é um efeito colateral do processo de verificação.**

---

## FLUXO CORRIGIDO

| Teste | Resultado | Tempo | Observação |
|:------|:----------|:------|:-----------|
| Página /pedidos carrega sem overlay Vite | ✅ | 6.5s | Nenhum overlay detectado |
| useTaxasCambio sem erro de import | ✅ | 10.1s | Nenhum pageerror relacionado |

## PRINTS CAPTURADOS

| # | Arquivo | Etapa |
|:--|:--------|:------|
| 01 | [testes/testes-em-tela/produto/pedido/2026-04-09-vite-compile-useTaxasCambio/01-pagina-carregada.png](testes/testes-em-tela/produto/pedido/2026-04-09-vite-compile-useTaxasCambio/01-pagina-carregada.png) | Página /pedidos carregada |
| 02 | [testes/testes-em-tela/produto/pedido/2026-04-09-vite-compile-useTaxasCambio/02-console-errors.png](testes/testes-em-tela/produto/pedido/2026-04-09-vite-compile-useTaxasCambio/02-console-errors.png) | Estado após verificação de erros no console |
| 03 | [testes/testes-em-tela/produto/pedido/2026-04-09-vite-compile-useTaxasCambio/03-networkidle.png](testes/testes-em-tela/produto/pedido/2026-04-09-vite-compile-useTaxasCambio/03-networkidle.png) | Página em estado networkidle |

---

## DECISÃO

- [x] ✅ TUDO PASSOU — página carrega normalmente, useTaxasCambio resolvido corretamente
- [x] ⚠️ AÇÃO PREVENTIVA: arquivos untracked críticos devem ser commitados para evitar
       remoção acidental por git stash em próximas verificações
