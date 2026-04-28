---
name: antigravity-performance-monitoring
description: "Use esta skill para configurar APM, dashboards, alertas, profiling e monitoramento de performance. Define ferramentas, métricas obrigatórias e limiares de alerta. Consultada pelo DevOps/SRE ao configurar monitoramento de qualquer serviço."
---

# Gravity — Performance & Monitoring (Operação)

> ⚠️ **REGRA ABSOLUTA:** Ver [SLA Metas](../../lei/sla-metas/SKILL.md) para metas (200ms p95, 50k req/s, 99,9% uptime) e budget de latência por camada.
> ⚠️ **REGRA ABSOLUTA:** Ver [Observabilidade Mínima](../../convencao-tecnica/observabilidade-minima/SKILL.md) para métricas obrigatórias por serviço e ferramentas obrigatórias.
>
> Esta skill cobre apenas **configuração e implementação** (Sentry, UptimeRobot, Grafana, alertas, profiling).

## Stack de Monitoramento

| Ferramenta | Função | Custo |
|:---|:---|:---|
| **Sentry** | Erros + Performance (APM) | Free tier |
| **UptimeRobot** | Health checks externos | Free tier |
| **Railway Metrics** | CPU, memória, rede | Incluso |
| **Grafana Cloud** | Dashboards customizados (Fase 2) | Free tier |

---

## Sentry — Configuração de Performance

```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // APM — capturar transações
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Profiling (Fase 2)
  profilesSampleRate: 0.05,

  integrations: [
    // Auto-instrumentar Express (Sentry v8+)
    Sentry.expressIntegration(),
    // Auto-instrumentar Prisma (Sentry v8+)
    Sentry.prismaIntegration({ client: prisma }),
  ],
})
```

---

## Dashboard de Performance (Grafana — Fase 2)

Painéis obrigatórios:

1. **Overview** — latência p50/p95/p99 por serviço
2. **Error Rate** — % de erros por serviço nos últimos 30 min
3. **Throughput** — req/s por serviço
4. **Database** — query time, conexões ativas, dead tuples
5. **Infra** — CPU, memória, disco por serviço

---

## Alertas

| Alerta | Condição | Canal | Ação |
|:---|:---|:---|:---|
| Serviço down | Health check falhou 2x | Slack + Email | Runbook P0 |
| Latência alta | p95 > 200ms por 5 min | Slack | Investigar queries |
| Error spike | Error rate > 5% por 5 min | Slack + Sentry | Investigar stack traces |
| DB connections | > 80% pool por 5 min | Slack | Verificar leaks |
| Memory high | > 85% por 10 min | Slack | Verificar memory leaks |
| Disk high | > 80% | Email | Cleanup ou upgrade |

---

## Profiling (Fase 2)

Para queries lentas ou CPU spikes:

```typescript
// Usar Sentry Profiling para flame graphs
Sentry.init({
  profilesSampleRate: 0.05, // 5% das transações
})

// Para debug pontual: Node.js built-in profiler
node --prof server/index.ts
node --prof-process isolate-*.log > profile.txt
```

---

## Checklist — Ao Configurar Monitoramento

- [ ] Sentry inicializado com performance tracking?
- [ ] UptimeRobot monitor criado para `/health`?
- [ ] Métricas conforme [Observabilidade Mínima](../../convencao-tecnica/observabilidade-minima/SKILL.md) expostas?
- [ ] Alertas configurados para thresholds definidos?
- [ ] Budget de latência validado conforme [SLA Metas](../../lei/sla-metas/SKILL.md)?
- [ ] Railway Metrics acessível para CPU/memória?
