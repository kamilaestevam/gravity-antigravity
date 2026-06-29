# GABI — Matriz de ambiente (Onda 0)

> SSOT operacional: `documentos-tecnicos/produtos-gravity/gabi/PLANO-PLENITUDE-GABI-v2.md`

## Caminho HTTP do browser

| Ambiente | Quem atende `/api/v1/gabi` | Upstream | Quem injeta identidade |
|:---|:---|:---|:---|
| **Dev — Vite (`:8000`)** | `vite.config.ts` proxy | `localhost:3001` (PM2) ou sidecar | Vite: headers fixos dev (`org_dev_default`, `SUPER_ADMIN`) |
| **Prod / staging — Express (`:8005`)** | `server/proxy/proxy-gabi.ts` | `127.0.0.1:8009` sidecar | `requireAuth` → `x-chave-interna-servico` + `x-id-organizacao` + `x-id-usuario` + `x-tipo-usuario` |
| **S2S (Pedido, workers)** | Direto no sidecar ou super-servidor | `GABI_SERVICE_URL` | Caller envia headers + chave |

## Variáveis

| Variável | Onde | Valor típico |
|:---|:---|:---|
| `GABI_SERVICE_URL` | Configurador, Pedido, BID | `http://127.0.0.1:8009` (monolito) ou `http://localhost:3001` (PM2 dev) |
| `CHAVE_INTERNA_SERVICO` | Configurador + sidecar | Obrigatória — única chave S2S (não usar `INTERNAL_API_KEY` em código novo) |
| `GABI_PROXY_ENABLED` | Configurador | `false` desliga proxy e retorna 503 (rollback) |
| `GEMINI_API_KEY` | Sidecar GABI | Obrigatória para respostas LLM |

## Degradação

- Sidecar inacessível → proxy retorna **503** `{ code: 'GABI_UNAVAILABLE' }` — não propaga 500 ao shell.
- Rollback: `GABI_PROXY_ENABLED=false`.

## Smoke pós-deploy

1. Widget Hub com usuário **PADRAO** (não SUPER_ADMIN)
2. `/gabi` no workspace responde sem mock
3. Sidecar parado → 503 explícito
