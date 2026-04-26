---
name: antigravity-observabilidade-minima
description: "Use esta skill sempre que for criar ou modificar serviço, produto ou rota. Define as métricas obrigatórias que TODO serviço deve expor (latência p50/p95/p99, error rate, health check, CPU, memória, conexões DB), as ferramentas obrigatórias (Sentry, UptimeRobot) e as ações sensíveis que DEVEM gerar log de auditoria (impersonação, acesso admin, deploy, alteração financeira)."
---

# Gravity — Observabilidade Mínima (Convenção Técnica)

> **Convenção universal.** Todo serviço/produto Gravity DEVE expor o conjunto mínimo de métricas e DEVE registrar log de auditoria em ações sensíveis.
> Implementação completa (configuração Sentry, integração Express+Prisma, dashboards Grafana, alertas, profiling) está em `governanca/operacao/performance-monitoring/SKILL.md`.

## Métricas Obrigatórias por Serviço

| Métrica | Como medir | Alerta quando |
|:---|:---|:---|
| Latência p50 | Sentry Performance | > 100ms |
| Latência p95 | Sentry Performance | > 200ms |
| Latência p99 | Sentry Performance | > 500ms |
| Error rate | Sentry | > 1% |
| Health check `/health` | UptimeRobot | 2 falhas consecutivas |
| CPU | Railway Metrics | > 80% por 5 min |
| Memória | Railway Metrics | > 85% |
| Conexões DB | Railway/PgBouncer | > 80% do pool |

> Serviço sem essas métricas em produção → **bloqueado para deploy**.

---

## Ferramentas Obrigatórias

| Ferramenta | Função | Status |
|:---|:---|:---|
| **Sentry** | Errors + Performance (APM) | OBRIGATÓRIO em todo serviço |
| **UptimeRobot** | Health checks externos a cada 5 min | OBRIGATÓRIO em todo serviço público |
| **Railway Metrics** | CPU, memória, rede | Incluso na plataforma |

---

## Auditoria de Ações Sensíveis

Toda ação privilegiada DEVE gerar log no `historico` com `actor_type` e `triggered_by`:

| Ação | Log obrigatório? | Detalhes mínimos |
|:---|:---|:---|
| Impersonação de usuário (Gravity Admin) | **SIM** | `actor_type: 'gravity_admin'`, `triggered_by: idAdmin`, `impersonating: idUsuario` |
| Acesso de Gravity Admin a histórico de organização | **SIM** | `action: 'ACESSO_ADMIN'`, `entity: 'historico'`, `description` |
| Deploy/Rollback de serviço | **SIM** | versão antes/depois, ator, timestamp |
| Alteração de plano/financeiro de organização | **SIM** | valor antes/depois, ator |
| Geração/revogação de token de API | **SIM** | escopo, expiração, prefixo (preview) |

> Ação sensível sem log → falha de compliance, **trabalho rejeitado pelo QA**.

---

## Middleware Mínimo de Observabilidade

Toda rota DEVE registrar latência, status code e endpoint em log estruturado para alimentar Sentry e Grafana. Padrão mínimo:

```typescript
res.on('finish', () => {
  const latency = Date.now() - start
  // log estruturado: { id_organizacao, endpoint, method, status_code, latency_ms, api_key_id }
})
```

> Implementação completa do `apiObservabilityMiddleware` (incluindo persistência em `ApiRequestLog` e `checkApiAlerts`) está em `produtos-gravity/configurador/admin/SKILL.md`.

---

## Onde Está a Implementação

- **Configuração Sentry (Express, Prisma, profiling)** → `governanca/operacao/performance-monitoring/SKILL.md`
- **Dashboards Grafana e alertas por canal** → mesma skill
- **Schema Prisma de `ApiRequestLog`, `ApiMonitor`, `ApiIncident`** → `produtos-gravity/configurador/admin/SKILL.md`
- **Metas de SLA (200ms p95, 99,9% uptime, budget de latência)** → `governanca/lei/sla-metas/SKILL.md`
