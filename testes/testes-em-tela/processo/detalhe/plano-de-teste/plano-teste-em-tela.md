# Plano EMT — Processo › Detalhe › Conteúdo central

**ID:** `TST-EMT-PROCESSO-DETALHE-CONTEUDO-001`

## Objetivo

Confirmar que a área central do detalhe do processo **não fica vazia** após correção do roteamento (`Outlet` + rotas aninhadas).

## Pré-requisitos

- `cfg-front` em `http://localhost:8000`
- `CLERK_SECRET_KEY` + `VITE_CLERK_PUBLISHABLE_KEY` no `.env`
- Usuário E2E (`E2E_CLERK_USER_EMAIL` ou `dmmltda@gmail.com`)

## Execução

```bash
npx tsx testes/testes-em-tela/processo/detalhe/plano-de-teste/run-detalhe-conteudo.ts
```

## Cenários

| # | URL / ação | Assertivas | Print |
|---|------------|------------|-------|
| 1 | `/processo/detalhe/workflow?id=proc-1&idOrganizacao=org_mock` | `.p2-shell`, `.cg-header`, `.wf-timeline`, follow-up, sidebar Acme | `01-workflow-visao-geral.png` |
| 2 | Menu → Dados do Processo | título, ≥5 `.dt-row` | `02-dados-tecnicos.png` |
| 3 | Menu → Pedidos | título, insights ou cards de pedido | `03-pedidos-resumo.png` |

## Resultado

Prints em `../resultado-teste/<runId>/` + `RESULTADO.txt`.
