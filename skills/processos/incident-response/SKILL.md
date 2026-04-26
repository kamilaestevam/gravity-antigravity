---
name: antigravity-incident-response
description: "Use esta skill ao lidar com incidentes em produção. Define severidades, runbooks, comunicação, escalonamento e post-mortem. Consultada pelo DevOps/SRE e Segurança quando um serviço cai ou é detectada uma vulnerabilidade."
---

# Gravity — Incident Response

## Severidades

| Severidade | Definição | Tempo de resposta | Exemplo |
|:---|:---|:---|:---|
| **P0 — Critical** | Plataforma fora do ar ou dados expostos | < 15 min | DB down, vazamento de dados |
| **P1 — High** | Feature principal indisponível | < 1 hora | Login falhando, pagamento quebrado |
| **P2 — Medium** | Feature secundária com problema | < 4 horas | Relatório não exporta, email atrasado |
| **P3 — Low** | Inconveniência sem impacto direto | < 24 horas | Tooltip errado, layout quebrado |

---

## Runbook de Incidente

### 1. Detectar (< 5 min)

- UptimeRobot alerta que health check falhou
- Sentry reporta erro crítico
- Usuário reporta problema

### 2. Triagem (< 10 min)

```
Qual serviço? → Verificar health check de cada um
Qual erro?    → Sentry → stack trace + correlation ID
Desde quando? → Railway logs → timestamp do primeiro erro
Quantos?      → Sentry → count de ocorrências
```

### 3. Mitigar (tempo varia por severidade)

**Se causa identificada e fix < 15min:**
- Corrigir, testar, deploy rápido

**Se causa não identificada:**
- Rollback imediato para deploy anterior (Railway Dashboard)
- Verificar health check após rollback

**Se é problema de banco:**
- Verificar conexões ativas
- Verificar locks/deadlocks
- Se necessário: restore do último backup

### 4. Comunicar

| Audiência | Canal | Frequência |
|:---|:---|:---|
| Time técnico | Slack #incidents | A cada 30 min durante P0/P1 |
| Stakeholders | Email | Início + resolução |
| Clientes afetados | Email/in-app | Se P0 durar > 30 min |

Template de comunicação:
```
[P0] Configurador — Login indisponível
Status: Investigando / Mitigado / Resolvido
Impacto: Todos os clientes não conseguem fazer login
Início: 2026-03-29 14:30 UTC
Próxima atualização: 15:00 UTC
```

### 5. Resolver

- Confirmar que o fix funciona em staging
- Deploy em produção
- Monitorar por 30 min após o fix
- Atualizar status para "Resolvido"

### 6. Post-mortem (obrigatório para P0 e P1)

Documento em até 48h após resolução:

```markdown
# Post-mortem: [Título do incidente]

## Timeline
- 14:30 — Alerta do UptimeRobot
- 14:35 — Triagem iniciada
- 14:45 — Rollback executado
- 15:00 — Causa raiz identificada
- 15:30 — Fix deployado
- 16:00 — Monitoramento OK

## Causa raiz
[Descrição técnica detalhada]

## Impacto
- Duração: X min
- Clientes afetados: N
- Dados perdidos: Nenhum / [detalhar]

## Ações preventivas
1. [Ação 1] — responsável — prazo
2. [Ação 2] — responsável — prazo

## Lições aprendidas
[O que vamos mudar para evitar recorrência]
```

---

## Escalonamento

```
Dev/SRE → Líder Técnico (se não resolver em 30 min)
         → Líder do Projeto (se P0 > 1 hora)
         → Daniel (se dados expostos ou downtime > 2 horas)
```

---

## Checklist — Durante um Incidente

- [ ] Severidade classificada?
- [ ] Canal de comunicação aberto?
- [ ] Health checks verificados?
- [ ] Sentry consultado para stack trace?
- [ ] Rollback considerado (se causa não clara)?
- [ ] Stakeholders notificados (se P0/P1)?
- [ ] Monitoramento ativo após resolução?
- [ ] Post-mortem agendado (P0/P1)?
