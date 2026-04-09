# Relatório de Impacto — Duplicar: Unknown argument 'quantidade_saldo_pedido'

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** MEDIUM
**Aprovação obtida:** não necessária (MEDIUM sem mudança de contrato)

---

## PROBLEMA

- **Descrição:** Duplicar pedido (inteiro ou itens) falha silenciosamente. Em DEV o `.catch()` retorna mock de sucesso, em PROD lança "Unknown argument 'quantidade_saldo_pedido'"
- **Causa raiz:** `PedidoItem` no Prisma schema real (`produto/pedido/node_modules/.prisma/client`) usa `quantidade_atual_pedido`. O service usava `quantidade_saldo_pedido` tanto no destructuring quanto no create — campo inexistente.
- **Arquivo e linhas:**
  - `duplicarExcluirService.ts:241` — destructuring `quantidade_saldo_pedido: _qsp` em `confirmar()`
  - `duplicarExcluirService.ts:253` — create `quantidade_saldo_pedido: item.quantidade_inicial_pedido` em `confirmar()`
  - `duplicarExcluirService.ts:352` — destructuring em `duplicarItens()`
  - `duplicarExcluirService.ts:369` — create em `duplicarItens()`

---

## ESCOPO POSITIVO

| Arquivo | Alteração |
|:--------|:----------|
| `produto/pedido/server/src/services/duplicarExcluirService.ts` | `quantidade_saldo_pedido` → `quantidade_atual_pedido` em 4 pontos (2 métodos) |

## ESCOPO NEGATIVO

| Arquivo | Motivo |
|:--------|:-------|
| `types.ts` (frontend) | Frontend usa `quantidade_saldo_pedido` como nome de exibição transformado pela API — correto lá |
| Prisma schema | Schema correto — service é que estava errado |
| Rotas | Sem alteração |

---

## CRITÉRIO DE SUCESSO

- Duplicar pedido inteiro cria novo pedido com itens com `quantidade_atual_pedido = quantidade_inicial_pedido`
- Duplicar itens dentro do pedido cria itens com `quantidade_atual_pedido = quantidade_inicial_pedido` e `sequencia_item` correto
- Sem erros "Unknown argument"
