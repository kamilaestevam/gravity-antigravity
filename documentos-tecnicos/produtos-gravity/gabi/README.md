# GABI — Documentação técnica (índice)

> Assistente IA da plataforma Gravity — sidecar `servicos-global/servicos-plataforma/gabi` (:8009 Railway).

## Plano e operação

| Documento | Conteúdo |
|:---|:---|
| [PLANO-PLENITUDE-GABI-v2.md](./PLANO-PLENITUDE-GABI-v2.md) | Ondas 0–4 — **implementadas em código** (TASK-000390, PR #523); validação staging pendente |
| [GABI-RUNBOOK-OPS.md](./GABI-RUNBOOK-OPS.md) | Runbook ops: quota, proxy 503, deploy, migration Pedido |
| [POLITICA-SELECAO-TOOLS.md](./POLITICA-SELECAO-TOOLS.md) | Limite ~28 tools Gemini, executores v1/v2 |
| [servicos-global/configurador/docs/GABI-AMBIENTE.md](../../../servicos-global/configurador/docs/GABI-AMBIENTE.md) | Matriz dev (Vite) vs prod (Express proxy) |

## Capacidades

| Documento | Conteúdo |
|:---|:---|
| [GABI-AGENTE-USUARIO.md](./GABI-AGENTE-USUARIO.md) | Agente v2 — tools, memória, circuit breaker |
| [GABI-INSIGHTS-PERSONALIZADOS.md](./GABI-INSIGHTS-PERSONALIZADOS.md) | Dashboard Pedido — Fases 1–3 |
| [GABI-TECNICO.md](./GABI-TECNICO.md) | Fórmulas determinísticas (colunas) |
| [GABI-ONDEMAND-TOKENS.md](./GABI-ONDEMAND-TOKENS.md) | Ícone ✦ field-help |
| [GABI-LIMITES-MONETARIOS-F2.md](./GABI-LIMITES-MONETARIOS-F2.md) | Quota USD por organização |

## Rotas principais (pós-Onda 0)

| Caminho | Uso |
|:---|:---|
| `POST /api/v1/gabi/agente/chat` | Widget Hub, onboarding — **caminho principal** |
| `POST /api/v1/gabi/chats` | S2S Pedido Fase 3 LLM — **deprecated v1** |
| `POST /api/v1/pedidos/eventos-comportamento` | Tracking Fase 2 insights (Pedido) |

## Deploy pós-merge

1. Configurador: sidecar GABI + `CHAVE_INTERNA_SERVICO`
2. Pedido: `npx prisma migrate deploy` → health `gabi_behavior_events: ok`
3. Staging smoke antes de `GABI_INSIGHTS_LLM=true`
