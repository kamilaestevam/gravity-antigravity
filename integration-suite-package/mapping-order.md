# Mapping Pedido — Gravity ↔ SAP

## Correlação de IDs

| Gravity (DDD) | Alias CPI | SAP |
|---------------|-----------|-----|
| `id_pedido` | `gravityOrderId` | — |
| `referencia_externa_erp_pedido` | `externalRef` | EBELN / PurchaseOrder |

## Status (v1)

Ver `mapping-order.json` para tabela completa bidirecional.

## Payload webhook

```json
{
  "event_id": "uuid",
  "event": "pedido.criado",
  "timestamp": "2026-07-14T20:00:00.000Z",
  "data": {
    "id_pedido": "clx...",
    "gravityOrderId": "clx...",
    "externalRef": "4500001234",
    "referencia_externa_erp_pedido": "4500001234",
    "status_pedido": "aberto"
  }
}
```

## Idempotência

Header `Idempotency-Key` obrigatório em `POST /v1/orders`.
TTL 24h por organização.
