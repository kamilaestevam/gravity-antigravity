---
name: antigravity-sprint-management
description: "Use esta skill para organizar sprints, definir velocity, conduzir plannings e retrospectivas. Define a cadência de trabalho, como priorizar backlog, critérios de entrada/saída de sprint e métricas de acompanhamento. Consultada pelo Líder do Projeto e PO antes de iniciar qualquer ciclo de desenvolvimento."
---

# Gravity — Sprint Management

## Cadência

| Item | Valor |
|:---|:---|
| Duração da sprint | 2 semanas |
| Planning | Segunda-feira, início da sprint |
| Daily sync | Diária, 15 min máximo |
| Review/Demo | Sexta-feira da 2ª semana |
| Retrospectiva | Logo após a review |

---

## Critérios de Entrada na Sprint

Uma tarefa só entra na sprint se:

1. **Escopo definido** — o que entregar está claro e documentado
2. **Skill lida** — a skill relevante foi consultada e entendida
3. **Dependências resolvidas** — onda anterior validada, APIs disponíveis
4. **Estimativa acordada** — time concordou com o esforço estimado
5. **Critérios de aceite** — pelo menos 3 critérios mensuráveis definidos

> Tarefa sem critério de aceite **não entra** na sprint.

---

## Critérios de Saída da Sprint (Definition of Done)

Ver skill `antigravity-definition-of-done` para o checklist completo. Resumo:

- Código entregue com testes (unitários + funcionais)
- QA revisou e aprovou
- Sem regressão nos testes existentes
- Documentação atualizada (se aplicável)

---

## Métricas de Acompanhamento

| Métrica | Como medir | Meta |
|:---|:---|:---|
| Velocity | Story points entregues por sprint | Estabilizar após 3 sprints |
| Burndown | Pontos restantes vs dias da sprint | Curva descendente linear |
| Lead time | Tempo entre "pronto para dev" e "em produção" | ≤ 5 dias úteis |
| Cycle time | Tempo entre início do trabalho e entrega | ≤ 3 dias úteis |
| Bug escape rate | Bugs encontrados em produção / total entregue | < 5% |

---

## Priorização do Backlog

Usar matriz de priorização:

| | Alto Impacto | Baixo Impacto |
|:---|:---|:---|
| **Baixo Esforço** | Fazer primeiro | Fazer se sobrar tempo |
| **Alto Esforço** | Planejar para próxima sprint | Não fazer agora |

**Ordem de prioridade absoluta:**
1. Bugs em produção (P0)
2. Segurança (sempre P1)
3. Features da onda atual
4. Tech debt crítico
5. Melhorias de UX

---

## Gestão de Bloqueios

Quando um agente/dev está bloqueado:

1. Sinalizar imediatamente no daily (não esperar o próximo)
2. Líder avalia se pode resolver em < 2h
3. Se não → realocar para outra tarefa e escalar o bloqueio
4. Bloqueios que passam de 24h → Líder notifica stakeholders

---

## Retrospectiva — Formato

1. **O que foi bem?** — manter
2. **O que pode melhorar?** — ação concreta para próxima sprint
3. **O que aprendemos?** — documentar na skill relevante

> Cada retro gera no máximo 3 ações. Mais que isso dilui o foco.

---

## Checklist — Planning de Sprint

- [ ] Backlog priorizado e estimado?
- [ ] Capacity do time calculada (férias, feriados, overhead)?
- [ ] Dependências entre tarefas mapeadas?
- [ ] Todas as tarefas têm critérios de aceite?
- [ ] Sprint goal definido em uma frase?
- [ ] Nenhuma tarefa sem skill lida?
