# Plano Cross-Organização — Duplicar Lista Pedido

**ID:** `TST-CRO-DUPLICAR-LISTA-PEDIDO-000082`  
**Data:** 2026-06-11  
**Versão:** 1.0  
**Criticidade:** alta  
**Skill:** `skills/governanca/lei/isolamento-organizacao/SKILL.md`

---

## Escopo

Garante que usuário da **organização A** não duplica pedidos/itens da **organização B** via:

- `POST /api/v1/pedidos/duplicacoes/preview`
- `POST /api/v1/pedidos/duplicacoes/confirmar`
- `POST /api/v1/pedidos/duplicacoes/itens`

---

## Casos

| ID | Caminho | Caso | Resultado |
|----|---------|------|-----------|
| CRO-DUP-01 | Service | `preview` WHERE usa `id_organizacao` do token | `findMany.where.id_organizacao = org_A` |
| CRO-DUP-02 | Service | `confirmar` WHERE usa `id_organizacao` do token | idem |
| CRO-DUP-03 | Service | `duplicarItens` WHERE usa `id_organizacao` do token | `findFirst` + `findMany` com org |
| CRO-DUP-04 | Service | Preview org B com pedido org A | `404 NOT_FOUND` |
| CRO-DUP-05 | Service | Confirmar org B com pedido org A | `404` |
| CRO-DUP-06 | Service | DuplicarItens org B com pedido/item org A | `404 NOT_FOUND` |
| CRO-DUP-07 | Rota | Preview HTTP org B + ids org A | `404`, service não vaza existência |
| CRO-DUP-08 | Rota | Confirmar HTTP org B + ids org A | `404` |
| CRO-DUP-09 | Rota | Itens HTTP org B + pedido org A | `404` |

**Spec:** `TST-CRO-DUPLICAR-LISTA-PEDIDO-000082.test.ts`
