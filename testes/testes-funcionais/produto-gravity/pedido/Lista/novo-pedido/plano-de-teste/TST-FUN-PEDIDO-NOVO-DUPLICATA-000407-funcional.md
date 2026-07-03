# TST-FUN-PEDIDO-NOVO-DUPLICATA-000407 — Novo Pedido: número duplicado

**Task:** TASK-000407  
**Escopo:** Modal Novo Pedido — feedback quando `numero_pedido` já existe na organização.

## Rotas

| Método | Rota | Expectativa |
|:---|:---|:---|
| GET | `/api/v1/pedidos/duplicatas-numero?numero_pedido=` | 200 + `pedidos_existentes[]` |
| GET | `/api/v1/pedidos/duplicatas-numero` (sem query) | 400 |
| POST | `/api/v1/pedidos` (duplicata, sem confirmar) | 409 + `DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED` |

## Spec

`TST-FUN-PEDIDO-NOVO-DUPLICATA-000408.test.ts`
