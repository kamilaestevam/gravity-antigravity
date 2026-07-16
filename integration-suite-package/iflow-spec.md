# Especificação iFlows CPI — Gravity Pedido v1

## IFlow 01 — Gravity → SAP (exportação)

1. **Timer / Event** — poll `GET /v1/orders?updatedSince=${lastRun}`
2. **REST Receiver** — Gravity API com Bearer
3. **Mapping** — `mapping-order.json` + campos SAP OData
4. **SAP Sender** — criar/atualizar Purchase Order

## IFlow 02 — SAP → Gravity (importação)

1. **SAP Receiver** — IDoc/OData novo PO
2. **Mapping** — `externalRef` = EBELN
3. **REST Receiver** — `POST /v1/orders` com `Idempotency-Key`
4. **Groovy** — `dedupe-idempotency.groovy` no header step

## IFlow 03 — Webhook Gravity → SAP

1. **HTTP Receiver** — URL do webhook configurado no portal
2. **Groovy** — `verify-hmac.groovy`
3. **Router** — `pedido.criado` vs `pedido.atualizado`
4. **SAP** — atualizar documento conforme evento

## Variáveis de tenant

- `GRAVITY_BASE_URL`
- `GRAVITY_CLIENT_ID` / `GRAVITY_CLIENT_SECRET` (OAuth)
- `GRAVITY_WEBHOOK_SECRET` (validação HMAC no CPI se CPI recebe de Gravity)
