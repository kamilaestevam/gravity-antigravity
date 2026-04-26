---
name: antigravity-criptografia
description: "Use esta skill sempre que for implementar geração ou armazenamento de tokens de API, credenciais ERP/SAP, secrets de webhook ou qualquer dado sensível. Define os algoritmos obrigatórios: SHA-256 para hash de tokens, AES-256-GCM para criptografia de credenciais e HMAC-SHA256 para assinatura de webhooks. Convenção universal de criptografia para todo o Gravity."
---

# Gravity — Criptografia (Convenção Técnica)

> **Convenção universal.** Todo serviço/produto que emite token, armazena credencial sensível ou assina webhook DEVE seguir estes algoritmos.
> Implementação no API Cockpit (telas, fluxos, schema de tokens, conector ERP) está em `produtos-gravity/api-cockpit/SKILL.md`.

## Algoritmos por Tipo de Dado

| Dado | Algoritmo | Onde aplica |
|:---|:---|:---|
| **Token de API** | **SHA-256** (hash unidirecional) | `key_hash` em `ApiKey`; nunca plain text |
| **Credenciais ERP/SAP** | **AES-256-GCM** (criptografia simétrica) | `credentials_encrypted` em `ErpConnection` |
| **Secret de webhook** | **HMAC-SHA256** (assinatura) | `X-Gravity-Signature` no header de cada disparo |

---

## Tokens de API — Regras Absolutas

1. **Token armazenado SEMPRE como hash SHA-256** — nunca em plain text no banco.
2. **Token exibido apenas UMA VEZ** após a criação — usuário tem responsabilidade de copiar.
3. **Prefixo obrigatório:**
   - `gv_live_sk_` para produção
   - `gv_test_sk_` para sandbox
4. **Preview de últimos 4 chars** (`key_preview`) salvo para identificação na UI.
5. **Revogação imediata** disponível a qualquer momento (mata o token sem grace period).

---

## Credenciais ERP — Regras Absolutas

1. **AES-256-GCM** para credenciais (username, password, API keys de ERP/SAP/WMS).
2. **`ENCRYPTION_KEY` em variável de ambiente** — nunca hardcoded, nunca commitada.
3. **Descriptografia apenas no momento da query** — nunca exposta em log, response, cache ou erro.
4. **Rotação de `ENCRYPTION_KEY` requer re-criptografia** de todos os registros — operação coordenada com SRE.

```typescript
// Padrão mínimo de uso (referência)
const encrypted = await encrypt(JSON.stringify(creds), process.env.ENCRYPTION_KEY!)
// Persistir `encrypted` em coluna credentials_encrypted

const creds = JSON.parse(await decrypt(conn.credentials_encrypted, process.env.ENCRYPTION_KEY!))
// Usar `creds` no escopo da query e descartar
```

---

## Webhooks — Regras Absolutas

1. **Secret gerado automaticamente** ao criar webhook (HMAC-SHA256, ≥ 32 bytes).
2. **Cada disparo inclui `X-Gravity-Signature`** no header — calculado sobre o body completo.
3. **Cliente DEVE verificar signature** antes de processar (responsabilidade do consumidor, documentada).
4. **Retry automático com backoff exponencial** em caso de falha (3 tentativas, intervalos crescentes).
5. **Regenerar secret** invalida a versão anterior imediatamente — comunicação com cliente é responsabilidade do operador.

---

## Onde Está a Implementação

- **Telas de gestão de tokens, modal de criação, escopo, rate limit, expiração** → `produtos-gravity/api-cockpit/SKILL.md`
- **Playground, histórico de disparos de webhook, regenerar secret** → mesma skill
- **Conector ERP (OData/SAP/JDBC), fluxo Gabi → query OData** → mesma skill
- **Schema Prisma de `ApiKey` e `ErpConnection`** → `produtos-gravity/configurador/admin/SKILL.md`
