# Dream Team de Produtos — Documentação Completa

> **Versão:** 1.0
> **Data:** Março 2026
> **Autor:** Daniel Mendes
> **Status:** Ativo

---

## O Que É

O Dream Team de Produtos é o **time de 8 agentes especializados** que transforma uma ideia de produto em uma **especificação completa**, pronta para o Dream Team de Tecnologia construir sem nenhuma dúvida.

### Em uma frase

> "Antes de escrever uma linha de código, o produto precisa ser pesquisado, validado, desenhado e especificado — com nota 10."

---

## Relação com o Dream Team de Tecnologia

| | Dream Team de Produtos | Dream Team de Tecnologia |
|:---|:---|:---|
| **Quando atua** | Antes do código | Durante o código |
| **O que entrega** | PRD, telas, backlog, handoff | Código, testes, deploy |
| **Comando** | `/dream-team-produtos` | `/dream-team-tecnologia` |
| **Agentes** | 8 (PM, SME, Data, Pesquisador, UXR, BA, Designer, Tech Lead) | 11 papéis (Backend, Frontend, QA, DevOps, etc.) |
| **Skills** | 11 | 57 |
| **Ponto de conexão** | Checkpoint 3 → Handoff | Recebe handoff → Constrói |

---

## Os 8 Agentes

### 1. Product Manager (PM)

**Papel:** Orquestrador do time. Dono do PRD. Conduz checkpoints.

**O que faz:**
- Conduz entrevistas com o dono do produto (junto com SME)
- Escreve e mantém o PRD (13 seções obrigatórias)
- Define MVP vs fases futuras (framework RICE)
- Garante os 3 checkpoints de aprovação
- Entrega o documento de handoff final

**Nunca faz sozinho:** coletar requisitos (precisa do SME), criar telas (Designer + Tech Lead), definir arquitetura (Tech Lead).

### 2. Especialista de Domínio (SME)

**Papel:** Guardião das regras de negócio e legislação.

**O que faz:**
- Valida regras de negócio, legislação e especificidades do setor
- Mapeia integrações obrigatórias (SISCOMEX, BACEN, Receita Federal)
- Alerta sobre armadilhas e exceções do domínio
- Documenta fontes legais e regulatórias

**Cobertura fiscal:** II, IPI, PIS/COFINS importação, ICMS, DIFAL, substituição tributária, ex-tarifário, drawback.

### 3. Data Analyst

**Papel:** Dados quantitativos que embasam decisões.

**O que faz:**
- TAM/SAM/SOM (top-down e bottom-up)
- Volume e demanda de mercado
- Benchmarking de produtos similares
- Análise de pricing (cost-plus, value-based, competitor-based)
- Métricas AARRR (Aquisição, Ativação, Retenção, Receita, Referência)

**Fontes:** ComexStat, SISCOMEX, BACEN, IBGE, Receita Federal, Crunchbase, G2, Gartner.

### 4. Pesquisador de Mercado

**Papel:** Análise qualitativa do mercado e concorrência.

**O que faz:**
- Análise detalhada de concorrentes (ficha por concorrente)
- Mapa competitivo (matriz de posicionamento, heatmap de features)
- Análise de tendências (emergente/crescente/madura/declinante)
- Identificação de gaps e diferenciais para o Gravity

### 5. UX Researcher

**Papel:** Voz do usuário no time.

**O que faz:**
- Cria personas detalhadas (mínimo 2, máximo 4)
- Mapeia jornadas completas com pontos de fricção
- Valida hipóteses com dados reais
- Conduz testes de usabilidade (5-8 participantes)
- Garante acessibilidade WCAG 2.1 AA

### 6. Business Analyst

**Papel:** Ponte entre negócio e tecnologia.

**O que faz:**
- Documenta regras de negócio operacionalizadas
- Cria casos de uso (fluxo principal, alternativo, exceção)
- Escreve critérios de aceite em Gherkin (Given/When/Then)
- Mapeia integrações com serviços Gravity existentes
- Compila documento de especificação detalhada

### 7. Product Designer (UX/UI)

**Papel:** Transforma requisitos em interfaces.

**O que faz:**
- Cria fluxos navegacionais completos
- Cria wireframes com os 5 estados (empty, loading, error, filled, disabled)
- Cria telas de alta fidelidade no design system Solid Slate
- Usa componentes do nucleo-global (nunca recria)
- Lucide Icons (nunca emojis)
- Dark mode first, depois valida light mode
- Responsivo (desktop, tablet, mobile)

**Trabalha JUNTO com o Tech Lead** — nunca sozinho.

### 8. Tech Lead

**Papel:** Guardião da viabilidade técnica.

**O que faz:**
- Valida viabilidade de cada funcionalidade enquanto é desenhada
- Mapeia serviços Gravity reutilizáveis (Configurador, tenant, nucleo-global)
- Define arquitetura do novo produto (client/server, fragment.prisma, PRODUCT_CONFIG)
- Estima complexidade (P/M/G/GG)
- Valida segurança e isolamento de tenant

**Trabalha JUNTO com o Designer** — nunca no final.

---

## Fluxo de Trabalho

### Etapa 1 — Descoberta (1-2 semanas)

```
PM + SME → Entrevistas com o dono do produto
Data Analyst + Pesquisador → Rodam em paralelo (mercado + dados)
```

**Saída:** Problema validado, mercado mapeado, regras de negócio iniciais.

### Etapa 2 — Análise (1-2 semanas)

```
UX Researcher → Personas e jornadas
Business Analyst → Regras de negócio e casos de uso
```

**✅ CHECKPOINT 1** — Apresentar ao dono:
- Relatório de mercado (quanti + quali)
- Personas e jornadas
- Regras de negócio mapeadas
- **Aguardar aprovação**

### Etapa 3 — Desenho (2-3 semanas)

```
Designer + Tech Lead → Trabalham juntos:
  → Fluxos navegacionais
  → Wireframes (5 estados)
  → Telas de alta fidelidade (dark + light)
  → Viabilidade técnica validada por tela
```

**✅ CHECKPOINT 2** — Apresentar ao dono:
- Todos os fluxos e telas
- Mapa de componentes Gravity usados
- Arquitetura técnica
- **Aguardar aprovação**

### Etapa 4 — Especificação Final (1-2 semanas)

```
PM → Consolida PRD final (13 seções)
BA → Finaliza critérios de aceite (Gherkin)
Designer → Entrega telas finais (dark + light + responsivo)
Tech Lead → Entrega arquitetura e estimativas
```

**✅ CHECKPOINT 3** — Aprovação final do dono
- Pacote completo de handoff
- **Entrega ao Dream Team de Tecnologia**

### Timeline Total: 4-7 semanas

---

## Os 7 Entregáveis (nota 10)

### 1. Pesquisa de Mercado
- TAM/SAM/SOM com fontes
- Análise de concorrentes (ficha por concorrente)
- Tendências e gaps identificados
- Diferenciais competitivos do Gravity

### 2. Personas e Jornadas
- Mínimo 2 personas detalhadas (Jobs-to-be-Done)
- Jornada completa de cada persona (etapas, emoções, touchpoints)
- Pontos de fricção ranqueados por severidade
- Momentos de valor identificados

### 3. PRD (Product Requirements Document)
13 seções obrigatórias:
1. Sumário Executivo
2. Contexto e Motivação
3. Público-Alvo (com personas)
4. Regras de Negócio
5. Requisitos Funcionais (MVP / Fase 2 / Fase 3)
6. Requisitos Não-Funcionais
7. Fluxos de Usuário
8. Wireframes e Telas
9. Integrações com Gravity
10. Métricas de Sucesso
11. Cronograma e Fases
12. Riscos e Mitigações
13. Decisões Tomadas

**Regra:** nenhum TBD no PRD final.

### 4. MVP vs Fases Futuras
- MVP: máximo 5-7 funcionalidades, todas com evidência
- Priorização via RICE (Reach 25%, Impact 30%, Confidence 20%, Effort 25%)
- Fases 2 e 3 documentadas com justificativa

### 5. Fluxos e Telas
- Fluxos navegacionais completos
- Wireframes com 5 estados (empty, loading, error, filled, disabled)
- Telas de alta fidelidade dark mode
- Telas de alta fidelidade light mode
- Responsivo (desktop, tablet, mobile)
- Mapa de componentes Gravity por tela
- Acessibilidade (tab order, aria-labels, contraste)

### 6. Arquitetura Técnica
- Serviços Gravity reutilizados (Configurador, tenant, nucleo-global)
- O que precisa ser construído do zero
- Integrações externas (SISCOMEX, BACEN, etc.)
- fragment.prisma com models
- PRODUCT_CONFIG completo
- Estimativa de complexidade (P/M/G/GG por funcionalidade)

### 7. Documento de Handoff
- Backlog priorizado (RICE) com critérios de aceite
- User stories no formato: "Como [persona], quero [ação], para [benefício]"
- Critérios de aceite em Gherkin (Given/When/Then)
- Notas para desenvolvedores (componentes, endpoints, regras)
- Riscos identificados e mitigações
- Perguntas que o time de tecnologia faria — já respondidas
- Sessão de handoff agendada (60-90 min)

---

## Skills do Dream Team de Produtos

| # | Arquivo | Conteúdo |
|---|:---|:---|
| 0 | `00-projeto-gravity.md` | Regras do ecossistema, design system Solid Slate, tenant isolation |
| 1 | `01-agente-pm.md` | Product Manager: PRD, entrevistas, MVP, RICE, checkpoints |
| 2 | `02-agente-sme.md` | Especialista: legislação fiscal, SISCOMEX, BACEN, armadilhas |
| 3 | `03-agente-data-analyst.md` | Data: TAM/SAM/SOM, benchmarks, pricing, métricas AARRR |
| 4 | `04-agente-pesquisador.md` | Pesquisador: concorrentes, tendências, gaps, posicionamento |
| 5 | `05-agente-ux-researcher.md` | UX Research: personas, jornadas, fricções, usabilidade |
| 6 | `06-agente-business-analyst.md` | BA: casos de uso, critérios de aceite, integrações |
| 7 | `07-agente-designer.md` | Designer: fluxos, wireframes, telas, Solid Slate, Lucide |
| 8 | `08-agente-tech-lead.md` | Tech Lead: viabilidade, arquitetura, reuso, estimativas |
| 9 | `09-time-fluxo-completo.md` | Fluxo dos 8 agentes, 3 fases, 3 checkpoints |
| 10 | `10-entregaveis-handoff.md` | Entregáveis obrigatórios, checklists, formato de handoff |

---

## Padrões Inegociáveis

- Nunca avançar de etapa sem aprovação no checkpoint
- Nunca criar componente visual que já existe no Gravity
- Nunca desenhar tela sem o Tech Lead validar viabilidade
- Nunca o PM coletar requisitos sem o SME presente
- Nunca entregar handoff sem critérios de aceite por funcionalidade
- Sempre seguir design system Solid Slate
- Sempre Lucide Icons, nunca emojis
- Sempre dark mode first
- Nenhum TBD no handoff final

---

## Como Ativar

```
/dream-team-produtos
```

Depois diga: **"Dream Team de Produtos, o novo produto é [NOME]. Comecem pela Etapa 1."**
