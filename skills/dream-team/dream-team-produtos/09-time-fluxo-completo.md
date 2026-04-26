---
name: gravity-time-fluxo-completo
description: "Skill do fluxo completo do Dream Team de Produtos Gravity. Define como os 8 agentes (PM, SME, Data Analyst, Pesquisador, UX Researcher, Business Analyst, Designer, Tech Lead) trabalham em paralelo com 3 checkpoints obrigatórios, regras de colaboração, como escalar decisões e quando pausar para validação com o dono do produto. Consultada para orquestrar o time completo."
---

# Dream Team de Produtos — Fluxo Completo

## O Que É o Dream Team de Produtos

O Dream Team de Produtos é o **time de descoberta, validação e especificação** que trabalha ANTES do Dream Team de Tecnologia. Seu objetivo é garantir que o time de tecnologia receba um handoff completo, sem ambiguidades, com todas as decisões de produto já tomadas.

### Os 8 Agentes

| # | Agente | Papel Principal | Skill |
|:---|:---|:---|:---|
| 1 | **PM** | Orquestrador, dono do PRD | `01-agente-pm.md` |
| 2 | **SME** | Guardião de regras de negócio e legislação | `02-agente-sme.md` |
| 3 | **Data Analyst** | Dados quantitativos, TAM/SAM/SOM, preços | `03-agente-data-analyst.md` |
| 4 | **Pesquisador** | Análise competitiva, tendências, gaps | `04-agente-pesquisador.md` |
| 5 | **UX Researcher** | Personas, jornadas, fricções, validação | `05-agente-ux-researcher.md` |
| 6 | **Business Analyst** | Casos de uso, critérios de aceite, integrações | `06-agente-business-analyst.md` |
| 7 | **Designer** | Fluxos, wireframes, telas de alta fidelidade | `07-agente-designer.md` |
| 8 | **Tech Lead** | Viabilidade, arquitetura, estimativas | `08-agente-tech-lead.md` |

---

## O Fluxo Iterativo — 3 Fases, 3 Checkpoints

O trabalho é dividido em 3 fases, cada uma terminando em um checkpoint de aprovação com o dono do produto. Nenhuma fase avança sem aprovação.

```
FASE 1: DESCOBERTA                    FASE 2: ESPECIFICAÇÃO               FASE 3: DETALHAMENTO
┌─────────────────────┐               ┌─────────────────────┐            ┌─────────────────────┐
│ PM: Entrevistas     │               │ PM: PRD completo    │            │ PM: Handoff doc     │
│ SME: Regras legais  │               │ SME: Regras detail  │            │ BA: Specs finais    │
│ Data: TAM/SAM/SOM   │──→ CP1 ──→   │ BA: Casos de uso    │──→ CP2 ──→│ Designer: Hi-fi     │
│ Pesq: Competitiva   │               │ Designer: Wireframe │            │ Tech Lead: Arq.     │
│ UXR: Personas       │               │ Tech: Viabilidade   │            │ PM: Backlog final   │
└─────────────────────┘               └─────────────────────┘            └─────────────────────┘
        │                                      │                                  │
   CHECKPOINT 1                           CHECKPOINT 2                       CHECKPOINT 3
   "Problema validado?"                "Solução viável?"                "Handoff completo?"
```

---

## Fase 1 — Descoberta

### Objetivo
Validar que o problema existe, é relevante e vale a pena resolver.

### Quem Trabalha e o Que Faz

| Agente | Atividade | Entregável |
|:---|:---|:---|
| **PM** | Conduz entrevistas de descoberta (mín. 5) | Síntese de entrevistas |
| **SME** | Levanta regras de negócio e legislação aplicável | Documento de regras brutas |
| **Data Analyst** | Calcula TAM/SAM/SOM, volumes de mercado | Análise de mercado |
| **Pesquisador** | Mapeia concorrentes, identifica gaps | Fichas de concorrentes + mapa competitivo |
| **UX Researcher** | Cria personas baseadas em dados reais | Personas detalhadas |

### Trabalho em Paralelo — Fase 1

Os agentes trabalham **simultaneamente**, não sequencialmente:

```
PM ──────────── Entrevistas ──────────────────→ Síntese
SME ─────────── Legislação ───────────────────→ Regras brutas
Data Analyst ── Dados de mercado ─────────────→ TAM/SAM/SOM
Pesquisador ─── Análise competitiva ──────────→ Mapa competitivo
UX Researcher ─ Personas ────────────────────→ Personas

                                    ↓
                         PM compila → CHECKPOINT 1
```

### Pontos de Sincronização — Fase 1

| Momento | Quem sincroniza com quem | Por quê |
|:---|:---|:---|
| Início | PM → Todos | Alinhar escopo, perguntas-chave, segmento-alvo |
| Mid-sprint | SME ↔ Pesquisador | Cruzar regulação com práticas do mercado |
| Mid-sprint | Data ↔ Pesquisador | Cruzar dados quantitativos com qualitativos |
| Mid-sprint | PM ↔ UXR | Cruzar entrevistas com construção de personas |
| Final | PM ← Todos | Receber entregáveis para compilar |

### Checkpoint 1 — Validação do Problema

**Apresentado ao dono do produto pelo PM:**

```markdown
## Checkpoint 1 — Validação do Problema

### Resumo
[O que descobrimos em 3-5 frases]

### Problema Validado?
- ✅ Sim — evidências: [X/Y entrevistados confirmam, dados de mercado suportam]
- ❌ Não — [motivo, o que faltou]
- ⚠️ Parcial — [o que precisa de mais investigação]

### Entregáveis Apresentados
1. Síntese de entrevistas (PM)
2. Análise de mercado — TAM/SAM/SOM (Data Analyst)
3. Mapa competitivo (Pesquisador)
4. Personas (UX Researcher)
5. Regras de negócio brutas (SME)

### Decisão Solicitada
- ✅ Avançar para Fase 2 (Especificação)
- ❌ Pivotar [sugestão de pivot]
- ⏸️ Investigar mais [o que investigar]
```

---

## Fase 2 — Especificação

### Objetivo
Especificar a solução: PRD, wireframes, viabilidade técnica, casos de uso detalhados.

### Quem Trabalha e o Que Faz

| Agente | Atividade | Entregável |
|:---|:---|:---|
| **PM** | Escreve PRD completo (13 seções) | PRD |
| **SME** | Detalha regras com exceções e exemplos | Regras detalhadas |
| **Data Analyst** | Benchmark, precificação, métricas | Benchmark + pricing |
| **Pesquisador** | Relatório qualitativo consolidado | Relatório de mercado |
| **UX Researcher** | Jornadas do usuário, fricções | Mapas de jornada |
| **Business Analyst** | Casos de uso, critérios de aceite iniciais | Casos de uso |
| **Designer** | Wireframes de todas as telas | Wireframes + fluxo navegacional |
| **Tech Lead** | Validação técnica, mapa de reutilização | Viabilidade técnica |

### Trabalho em Paralelo — Fase 2

```
PM ──────────── PRD (usa inputs de todos) ────→ PRD completo
SME ─────────── Regras detalhadas ────────────→ Regras + exceções
Data Analyst ── Benchmark + pricing ──────────→ Análise de preço
Pesquisador ─── Relatório final ──────────────→ Relatório qualitativo
UXR ─────────── Jornadas + fricções ──────────→ Mapas de jornada
BA ──────────── Casos de uso ─────────────────→ UCs + CAs iniciais
Designer ────── Wireframes ───────────────────→ Wireframes (todos os estados)
Tech Lead ───── Viabilidade ──────────────────→ Análise técnica

     ↕ Sincronização contínua: Designer ↔ Tech Lead
     ↕ Sincronização contínua: BA ↔ SME
     ↕ Sincronização contínua: PM ↔ Todos

                                    ↓
                         PM compila → CHECKPOINT 2
```

### Pontos de Sincronização — Fase 2

| Momento | Quem sincroniza com quem | Por quê |
|:---|:---|:---|
| Início | PM → Todos | Compartilhar resultados do CP1, definir MVP scope |
| Contínuo | Designer ↔ Tech Lead | **Trabalho em tempo real** — componentes, viabilidade |
| Contínuo | BA ↔ SME | Operacionalizar regras de negócio |
| Contínuo | BA ↔ UXR | Cruzar jornadas com casos de uso |
| Mid-sprint | Designer → UXR | Validar wireframes contra personas e fricções |
| Mid-sprint | Tech Lead → Data | Alinhar volumes vs capacidade técnica |
| Final | PM ← Todos | Receber entregáveis para compilar |

### Checkpoint 2 — Validação da Solução

**Apresentado ao dono do produto pelo PM:**

```markdown
## Checkpoint 2 — Validação da Solução

### Resumo
[O que especificamos e por que acreditamos que resolve o problema]

### MVP Definido?
- ✅ Sim — [X] funcionalidades, [Y] telas, estimativa de [Z] semanas
- ❌ Não — [o que faltou definir]

### Entregáveis Apresentados
1. PRD completo — 13 seções (PM)
2. Regras detalhadas com exceções (SME)
3. Benchmark + precificação (Data Analyst)
4. Relatório de mercado (Pesquisador)
5. Mapas de jornada (UX Researcher)
6. Casos de uso + critérios de aceite (Business Analyst)
7. Wireframes — todos os estados (Designer)
8. Viabilidade técnica + estimativas (Tech Lead)

### Decisão Solicitada
- ✅ Avançar para Fase 3 (Detalhamento + Handoff)
- ❌ Revisar escopo do MVP [sugestão]
- ⏸️ Detalhar mais [o que está incompleto]
```

---

## Fase 3 — Detalhamento e Handoff

### Objetivo
Produzir todos os artefatos finais que o Dream Team de Tecnologia precisa para implementar sem dúvidas.

### Quem Trabalha e o Que Faz

| Agente | Atividade | Entregável |
|:---|:---|:---|
| **PM** | Monta documento de handoff, backlog priorizado | Handoff + Backlog |
| **Business Analyst** | Finaliza specs detalhadas, critérios de aceite completos | Especificação completa |
| **Designer** | Cria telas de alta fidelidade (dark + light, responsive) | Telas hi-fi + specs |
| **Tech Lead** | Define arquitetura final, estimativas detalhadas | Arquitetura + estimativas |
| **SME** | Revisão final de conformidade regulatória | Sign-off regulatório |
| **UX Researcher** | Testa protótipos com usuários (se possível) | Resultado de testes |
| **Data Analyst** | Define métricas de sucesso e instrumentação | Framework de métricas |

### Trabalho em Paralelo — Fase 3

```
PM ──────────── Handoff doc + backlog ────────→ Documento de handoff
BA ──────────── Specs finais ─────────────────→ Especificação completa
Designer ────── Alta fidelidade ──────────────→ Telas hi-fi
Tech Lead ───── Arquitetura final ────────────→ Arquitetura detalhada
SME ─────────── Review de compliance ─────────→ Sign-off
UXR ─────────── Testes de usabilidade ────────→ Resultados
Data Analyst ── Métricas + instrumentação ────→ Framework de métricas

     ↕ Sincronização contínua: Designer ↔ Tech Lead
     ↕ Sincronização contínua: BA ↔ Designer (comportamento por tela)

                                    ↓
                         PM compila → CHECKPOINT 3
```

### Checkpoint 3 — Aprovação do Handoff

**Apresentado ao dono do produto pelo PM:**

```markdown
## Checkpoint 3 — Aprovação do Handoff

### Resumo
[Tudo pronto para entregar ao Dream Team de Tecnologia]

### Checklist de Completude
- [ ] PRD completo e aprovado
- [ ] Telas hi-fi para todas as telas do MVP (dark + light)
- [ ] Todos os estados de tela documentados (empty, loading, error, filled, disabled)
- [ ] Critérios de aceite em Gherkin para todo requisito
- [ ] Arquitetura técnica definida (client/server, models, endpoints)
- [ ] Mapa de reutilização (serviços Gravity existentes)
- [ ] Estimativa de complexidade por tela
- [ ] Backlog priorizado com RICE
- [ ] Sign-off regulatório do SME
- [ ] Métricas de sucesso e instrumentação definidas

### Entregáveis do Handoff
[Ver skill 10-entregaveis-handoff.md para estrutura completa]

### Decisão Solicitada
- ✅ Entregar para o Dream Team de Tecnologia
- ❌ Revisar [item específico]
- ⏸️ Completar [lacuna]
```

---

## Regras de Colaboração

### 1. Comunicação

- **Toda comunicação é documentada** — nenhuma decisão "de corredor"
- **Conflitos escalam para o PM** — ele decide prioridade e escopo
- **Conflitos técnicos escalam para o Tech Lead** — ele decide viabilidade
- **Conflitos de domínio escalam para o SME** — ele decide conformidade

### 2. Dependências entre Agentes

```
PM ──────→ orquestra todos
SME ─────→ alimenta: PM, BA, Designer (constraints)
Data ────→ alimenta: PM, Pesquisador, Tech Lead (números)
Pesq ────→ alimenta: PM, Data, Designer (referências)
UXR ─────→ alimenta: PM, Designer, BA (personas, jornadas)
BA ──────→ alimenta: PM, Designer, Tech Lead (specs)
Designer ↔ Tech Lead (trabalho contínuo em paralelo)
```

### 3. Quando Pausar e Validar

O time PARA e consulta o dono do produto quando:

| Situação | Quem Para | Quem Consulta |
|:---|:---|:---|
| Escopo está ambíguo | Todos | PM → Dono |
| Regra de negócio contradiz outra | BA, SME | PM → Dono |
| Concorrente lança feature idêntica ao MVP | Pesquisador | PM → Dono |
| Tech Lead diz que algo é inviável no prazo | Tech Lead | PM → Dono |
| Dados de mercado não suportam a hipótese | Data Analyst | PM → Dono |
| Usuários rejeitam protótipo no teste | UXR | PM → Dono |
| Custos de infraestrutura excedem orçamento | Tech Lead | PM → Dono |

### 4. Velocidade vs Qualidade

- **Fase 1:** Velocidade alta — explorar rápido, invalidar rápido
- **Fase 2:** Equilíbrio — wireframes validados, mas não precisa ser perfeito
- **Fase 3:** Qualidade alta — handoff incompleto causa retrabalho no tech team

### 5. O PM Como Orquestrador

O PM é responsável por:

1. **Iniciar cada fase** com kick-off claro (objetivo, prazo, expectativa)
2. **Monitorar progresso** de cada agente
3. **Identificar bloqueios** e resolvê-los rapidamente
4. **Sincronizar informações** — garantir que todos têm o contexto atualizado
5. **Compilar entregas** para cada checkpoint
6. **Apresentar ao dono** e obter decisão

---

## Escalação de Decisões

### Matriz de Escalação

| Tipo de Decisão | Decide | Escala Para |
|:---|:---|:---|
| Escopo do MVP | PM | Dono do Produto |
| Prioridade de features | PM | Dono do Produto |
| Conformidade legal | SME | PM → Dono (se impacta escopo) |
| Viabilidade técnica | Tech Lead | PM (se inviável, renegociar escopo) |
| Design de telas | Designer | PM (se conflito com requisitos) |
| Critérios de aceite | BA | PM + Tech Lead |
| Preço do produto | PM | Dono do Produto |
| Prazo de entrega | PM + Tech Lead | Dono do Produto |

### Regra de Escalação

**Nenhum agente toma decisão fora do seu escopo.** Se um agente percebe que precisa decidir algo que não é sua responsabilidade:

1. Documenta a decisão necessária
2. Identifica o decisor correto (tabela acima)
3. Escala com contexto claro (opções, prós/contras, recomendação)
4. Aguarda decisão — não assume

---

## Cronograma Típico

| Fase | Duração Típica | Saída |
|:---|:---|:---|
| **Fase 1 — Descoberta** | 1-2 semanas | Checkpoint 1 |
| **Checkpoint 1** | 1 sessão (1-2h) | Decisão: avançar/pivotar |
| **Fase 2 — Especificação** | 2-3 semanas | Checkpoint 2 |
| **Checkpoint 2** | 1 sessão (2-3h) | Decisão: avançar/revisar |
| **Fase 3 — Detalhamento** | 1-2 semanas | Checkpoint 3 |
| **Checkpoint 3** | 1 sessão (1-2h) | Decisão: entregar/completar |
| **Total** | **4-7 semanas** | Handoff completo |

---

## Anti-Padrões do Time

- ❌ Começar a especificar sem validar o problema (pular Fase 1)
- ❌ Avançar entre fases sem checkpoint aprovado
- ❌ Designer trabalhando sem input do UXR e Tech Lead
- ❌ BA escrevendo critérios sem validação do SME
- ❌ Tech Lead estimando sem ver wireframes
- ❌ PM decidindo sozinho sem dados do Data Analyst
- ❌ Agentes trabalhando em silos sem sincronização
- ❌ Handoff incompleto "para ir mais rápido"
- ❌ Mudar escopo do MVP após Checkpoint 2 sem novo checkpoint

---

## Checklist — Fluxo Completo

### Pré-Fase 1
- [ ] Dono do produto definiu o problema/oportunidade inicial?
- [ ] PM fez kick-off com todos os agentes?
- [ ] Cada agente sabe o que entregar e para quando?

### Pós-Checkpoint 1
- [ ] Problema foi validado com dados e entrevistas?
- [ ] Dono do produto aprovou avanço para Fase 2?

### Pós-Checkpoint 2
- [ ] MVP está claramente definido e é viável?
- [ ] Wireframes cobrem todos os fluxos e estados?
- [ ] Dono do produto aprovou avanço para Fase 3?

### Pós-Checkpoint 3
- [ ] Todos os entregáveis do handoff estão completos?
- [ ] Dream Team de Tecnologia consegue implementar sem dúvidas?
- [ ] Dono do produto aprovou entrega para tecnologia?
