---
name: antigravity-sla-metas
description: "Use esta skill sempre que for definir, validar ou avaliar metas de SLA: latência (≤200ms p95), throughput (50.000 requisições simultâneas), disponibilidade (99,9%) e budget de latência por camada. Fonte única de verdade dos targets de performance — toda configuração de monitoramento, load test ou plano de otimização DEVE referenciar estas metas."
---

# Gravity — Metas de SLA (Lei)

> **Lei absoluta.** Estas metas valem para TODA rota, TODO serviço, TODO produto do Gravity. A implementação (configuração de Sentry, UptimeRobot, k6 e dashboards Grafana) é executada conforme `governanca/operacao/performance-monitoring/SKILL.md`. Esta skill define apenas os **targets**.

## Metas Fundamentais

| Requisito | Meta | Como medir |
|:---|:---|:---|
| Latência máxima | **≤ 200ms (p95)** | Sentry Performance |
| Requisições simultâneas | **50.000** | Load test com k6 |
| Disponibilidade | **99,9%** (≤ 8h45min downtime/ano) | UptimeRobot |
| Escalabilidade | Auto-scaling em pico | Railway auto-scale |

---

## Budget de Latência por Camada

Para atingir **≤ 200ms** end-to-end, cada camada tem budget fixo:

| Camada | Budget | Justificativa |
|:---|:---|:---|
| Rede (Railway internal) | 5ms | Rede interna, latência mínima |
| Express middleware | 10ms | Parse, auth, correlation |
| Validação Zod | 5ms | Validação de schema |
| Query Prisma | 80ms | Operação principal de banco |
| Lógica de negócio | 50ms | Cálculos, transformações |
| Serialização response | 5ms | JSON.stringify |
| Overhead/buffer | 45ms | Margem de segurança |
| **Total** | **200ms** | |

> Se uma camada excede o budget → investigar e otimizar antes de mergear.

---

## Disponibilidade 99,9% — Tradução

| Período | Downtime permitido |
|:---|:---|
| Anual | 8h 45min 36s |
| Mensal | 43min 28s |
| Semanal | 10min 4s |

---

## Quando Rodar Load Test (referência operacional)

| Cenário | Frequência | Meta |
|:---|:---|:---|
| Smoke test (10 users) | Cada deploy em staging | Sem erros |
| Load test (500 users) | Semanal | p95 < 200ms |
| Stress test (5000 users) | Mensal ou pré-release | Identificar limite |
| Spike test (0→5000 em 30s) | Trimestral | Auto-scaling funciona |

> Scripts k6 e procedimentos detalhados estão em `governanca/operacao/performance-monitoring/SKILL.md`.

---

## Onde Está a Implementação

- **Configuração de Sentry, UptimeRobot, dashboards Grafana, alertas** → `governanca/operacao/performance-monitoring/SKILL.md`
- **Auto-scaling Railway (min/max instâncias, triggers)** → `governanca/operacao/auto-scaling/SKILL.md`
- **Métricas obrigatórias por serviço** → `governanca/convencao-tecnica/observabilidade-minima/SKILL.md`
