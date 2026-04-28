---
name: antigravity-cost-budget
description: "Use esta skill sempre que for escalar, redimensionar infraestrutura, aprovar gasto ou tomar qualquer decisão com impacto financeiro na plataforma. Define os limites mensais por ambiente, thresholds de alerta (70/80/90/95%) e a regra absoluta 'scaling automático bloqueado em 95% do budget'. Fonte única de verdade da governança de custos."
---

# Gravity — Cost Budget (Lei)

> **Lei absoluta.** A plataforma escala automaticamente em picos, mas com orçamento controlado.
> **Nunca escalar sem limite. Nunca gastar mais do que o aprovado.**
> Implementação Railway (min/max instâncias, triggers de CPU/RAM, scale-to-zero, otimizações) está em `governanca/operacao/auto-scaling/SKILL.md`. Esta skill define apenas os **limites**.

## Limites de Orçamento

| Ambiente | Budget mensal | Alertas |
|:---|:---|:---|
| Staging | $50 | 80% ($40) |
| Production | $200 | 70% ($140) e 90% ($180) |
| **Total** | **$250** | 80% ($200) |

---

## Thresholds de Alerta

| % do budget | Severidade | Canal |
|:---|:---|:---|
| **70%** | Informativo | Email |
| **80%** | Atenção | Email + Slack |
| **90%** | Crítico | Email + Slack + notificação ao Daniel |
| **95%** | **BLOQUEIO** | Scaling automático bloqueado (só vertical, não horizontal) |

---

## Regras Absolutas

1. **Nenhum agente pode autorizar gasto além do budget aprovado.**
   Em caso de necessidade real (pico legítimo de tráfego), parar e abrir chamado para o Coordenador. O Coordenador é o único autorizado a aprovar exceção temporária.

2. **Scale-to-zero apenas para serviços sem banco ativo.**
   Risco de connection drop em serviços com DB. O único serviço autorizado a `scale-to-zero` hoje é o `marketplace` (site estático).

3. **Projeção de custo deve ser revisada mensalmente** antes de aprovar qualquer mudança de capacity planning. Estouro recorrente do budget → revisão arquitetural obrigatória.

---

## Onde Está a Implementação

- **Configuração Railway por serviço (min/max instâncias, triggers, vCPU/RAM)** → `governanca/operacao/auto-scaling/SKILL.md`
- **Estratégia horizontal vs vertical e quando usar cada uma** → mesma skill
- **Otimizações de custo (PgBouncer, cache Redis, gzip, queries)** → mesma skill
- **Dashboard de monitoramento de custos** → mesma skill
