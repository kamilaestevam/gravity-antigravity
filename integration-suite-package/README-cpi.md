# Kit SAP Integration Suite — Gravity ↔ Pedido

Pacote de artefatos para importação no **SAP Integration Suite (CPI)** do cliente.

## Conteúdo

| Arquivo | Uso |
|---------|-----|
| `openapi.yaml` | Contrato REST dual (DDD + aliases CPI) |
| `mapping-order.json` | De-para status Gravity ↔ SAP |
| `mapping-order.md` | Documentação humana do mapping |
| `verify-hmac.groovy` | Validação `X-Gravity-Signature` no iFlow |
| `dedupe-idempotency.groovy` | Propaga `Idempotency-Key` |
| `iflow-spec.md` | Especificação dos iFlows recomendados |
| `postman_collection.json` | Coleção para sandbox |
| `docker-compose.mock-webhook.yml` | Receiver local para homologação |

## Endpoints Gravity (sandbox)

- Base: `https://<tenant>.gravity.app/api/v1/cockpit`
- OAuth: `POST /oauth/token` (`client_credentials`)
- Pedidos alias CPI: `GET|POST /v1/orders`
- Pedidos DDD: `GET|POST /pedidos`

## Autenticação

1. **Bearer API Token** — portal Configurador → API Cockpit → Tokens
2. **OAuth2** — `client_id` + `client_secret` via portal (credencial OAuth)

## Webhooks

Eventos: `pedido.criado`, `pedido.atualizado`

Headers de entrega:
- `X-Gravity-Signature` — HMAC-SHA256 do body
- `X-Gravity-Event-Id` — dedupe no receptor

## Homologação local

```bash
# Aplicar migrations (org DB + schemas tenant pedido)
npx tsx scripts/ativamente/aplicar-kit-integracao-sap.ts

# Smoke test (portas 8016 cockpit, 8030 pedido, 8000 frontend)
npx tsx scripts/ativamente/smoke-kit-integracao-sap.ts

# Mock webhook receiver
docker compose -f integration-suite-package/docker-compose.mock-webhook.yml up
```

Configure no portal um webhook apontando para `http://host.docker.internal:9090/webhook`.

## Importação CPI

1. Importar `openapi.yaml` como REST adapter reference
2. Criar iFlows conforme `iflow-spec.md`
3. Colar scripts Groovy nos steps indicados
4. Ajustar URLs e credenciais do tenant
