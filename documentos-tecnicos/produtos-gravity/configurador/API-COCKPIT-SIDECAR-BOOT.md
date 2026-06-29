# API Cockpit — Boot do sidecar embutido (porta 8016)

> **TASK-000395** — confiabilidade do `_sidecarStatus['api-cockpit']` e diagnóstico do banner «Serviço de observabilidade temporariamente indisponível» na aba Tokens.

## Arquitetura

O **api-cockpit** roda como **sidecar** no mesmo processo do Configurador (Railway monólito), escutando em `http://127.0.0.1:8016`. O frontend **nunca** chama essa porta — apenas o BFF em `servicos-global/configurador/server/routes/api-cockpit.ts`.

```
Browser → Configurador BFF (/api/v1/api-cockpit/*) → loopback:8016 → api-cockpit sidecar
```

## Sequência de boot (produção)

1. **Preflight** (`coletarErrosPreflightApiCockpit` em `configurador/server/lib/verificar-health-sidecar.ts`)
   - **Produção** bloqueia se faltar `ORGANIZACAO_DATABASE_URL` ou `CHAVE_INTERNA_SERVICO`
   - **Dev** — `ORGANIZACAO_DATABASE_URL` opcional (fallback `DATABASE_URL` do configurador); `CHAVE_INTERNA_SERVICO` ausente só gera `console.warn` (tokens/webhooks falham em S2S)
2. **Import** dinâmico com `API_COCKPIT_SIDECAR=1`
3. **`sidecarListenReady`** — promise resolvida no `listen()`; rejeitada em `EADDRINUSE`
4. **`aguardarSidecarEmbutido`** — `Promise.race` com `clearTimeout` + `GET http://127.0.0.1:8016/health`
5. Só então `_sidecarStatus['api-cockpit'] = { ok: true }`

Helper compartilhado: `servicos-global/servicos-plataforma/middleware/sidecar-listen-ready.ts` (também **GABI** `:8009` e **Taxas Moeda** `:8032`).

## Variáveis obrigatórias (Railway)

| Variável | Uso |
|:---|:---|
| `ORGANIZACAO_DATABASE_URL` | Postgres `servicos-plataforma` — tabelas `api_token`, `log_requisicao_api` |
| `CHAVE_INTERNA_SERVICO` | Header `x-chave-interna-servico` nas rotas S2S (tokens, webhooks) |

Ver `scripts/start-site.sh` (migrations plataforma antes dos sidecars).

## Diagnóstico

- **Admin:** `GET /api/v1/internal/sidecar-status` → `api-cockpit.ok`
- **Logs:** `[api-cockpit proxy] GET /api-tokens: <detalhe>`
- **UI:** banner na aba Tokens = falha do proxy; KPIs zerados sem banner = `STATS_FALLBACK` silencioso

## Histórico

- **2026-06-29 (TASK-000395)** — boot confiável, preflight, logs proxy BFF.
