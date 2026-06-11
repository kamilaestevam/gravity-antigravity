# Plano E2E — Usuário × Organização (fluxo do usuário)

> Parte do domínio `PEDIDO-USUARIO-FALTA-ORGANIZACAO`. Tipo **E2E** (Playwright).
> Família de ID: `TST-E2E-PEDIDO-USUARIO-FALTA-ORGANIZACAO-{NNNNNN}`.

## Cenários (da Matriz DEFINITIVA)

| ID matriz | Cenário | Equivalente em tela |
|-----------|---------|---------------------|
| E2E-01 | Login `user_*` → lista do Pedido carrega | EMT-01 |
| E2E-02 | Login `pending_*` → lista carrega, sem 404 "Usuário ou organização não encontrada" | EMT-02 |
| E2E-03 | Logout limpa storage → novo login não herda org anterior | EMT-05 |
| E2E-04 | Cross-org: admin override A→B→A + logout → usuário comum vê só A | EMT-07/08 |

## Relação com o em-tela
O comportamento já é coberto, com prints, pelo runner em
`testes/testes-em-tela/usuario/teste-organizacao/plano-de-teste/run-teste-organizacao.ts`
(`TST-EMT-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000084`). Os specs E2E aqui são a versão
assertiva (sem prints), para o gate de CI.

## Status
⏳ **Specs a gerar** (`TST-E2E-PEDIDO-USUARIO-FALTA-ORGANIZACAO-0000NN.spec.ts`). Requer seed (U_OK, U_PENDING, U_ADMIN, ORG_A/B).

> ⚠️ Não deletar — mantém a pasta `plano-de-teste/` versionada.
