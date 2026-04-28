# 03 — Violações SSOT (Single Source of Truth)

> Skills onde uma vertical/processo **redefine** uma regra absoluta ao invés de **referenciar** a skill canônica.
> Princípio violado declarado em `CLAUDE.md` linha 218-220.

---

## SSOT Suprema — `CLAUDE.md`

> **Citação literal de `CLAUDE.md` linhas 216-220:**
>
> > ⚠️ **PRINCÍPIO ARQUITETURAL — FONTE ÚNICA DE VERDADE (SSOT)**
> >
> > **NENHUMA REGRA ABSOLUTA DEVE SER ESCRITA EM SKILLS DE OPERAÇÃO OU VERTICAIS. REGRAS MORAM EM GOVERNANÇA.**
> >
> > Toda regra absoluta vive em `skills/governanca/lei/` (regras de negócio/arquitetura) ou `skills/governanca/convencao-tecnica/` (convenções de código). Skills em `produtos-gravity/`, `arquitetura/`, `seguranca/`, `governanca/operacao/` etc. **referenciam** as regras via blocos `> ⚠️ REGRA ABSOLUTA: Ver [...]`. **Nunca redefinem.**
> >
> > Se você for escrever uma regra absoluta em uma vertical/operação — pare. Mova para `governanca/lei/` ou `governanca/convencao-tecnica/` e referencie da vertical.

**Toda violação listada abaixo viola este princípio.**

---

## S1 — `governanca/convencao-tecnica/code-standards`

| Aspecto | Conteúdo |
|---|---|
| **O que repete** | Mandamentos 01, 02, 03, 06 inteiros |
| **Skill canônica** | `governanca/lei/9-mandamentos/SKILL.md` |
| **Tolerância** | ⚠️ Lei dentro de lei é tolerável, mas atualizado → drift |
| **Ação recomendada** | Substituir conteúdo dos Mandamentos por bloco `> ⚠️ REGRA ABSOLUTA: Ver 9-mandamentos M01/M02/M03/M06` |
| **Status Atual** | ❌ Pendente |

---

## S2 — `governanca/lei/agent-policy`

| Aspecto | Conteúdo |
|---|---|
| **O que repete** | Mandamento 01 inteiro + (anteriormente) 3 índices em models — agora desatualizado |
| **Skill canônica** | `9-mandamentos` |
| **Tolerância** | ⚠️ Lei dentro de lei é tolerável, mas drift comprovado: 3 índices ficou stale |
| **Ação recomendada** | Substituir Mandamento 01 por referência. Confirmar que regra dos 3 índices não voltou (grep limpo nesta sessão) |
| **Status Atual** | ⚠️ Parcial — drift de 3 índices já resolvido, mas Mandamento 01 ainda repetido |

---

## S3 — `governanca/lei/visao-geral`

| Aspecto | Conteúdo |
|---|---|
| **O que repete** | Mandamentos 01, 02, 03, 06 + Stripe (desatualizado) |
| **Skill canônica** | `9-mandamentos` (mandamentos) + `produtos-gravity/configurador` (Stripe removido) |
| **Tolerância** | ⚠️ Lei dentro de lei tolerável, mas Stripe é drift confirmado |
| **Ação recomendada** | Substituir Mandamentos por referência + remover Stripe |
| **Status Atual** | ❌ Pendente (vinculado a C3) |

---

## S4 — `isolamento-organizacao` ↔ `sdk-resolvedor-organizacao`

| Aspecto | Conteúdo |
|---|---|
| **O que repete** | ~40% sobreposição de conteúdo (regras de SDK, search_path, exemplos) |
| **Skill canônica** | Decisão pendente — qual fica com o quê |
| **Tolerância** | 🔴 Crítico — duas leis cobrindo o mesmo território cria armadilha de drift |
| **Ação recomendada** | Decidir fronteira explícita: `isolamento-organizacao` = O QUE (regra de isolamento físico); `sdk-resolvedor-organizacao` = COMO (API do SDK). Refatorar uma para não tocar no escopo da outra |
| **Status Atual** | ❌ Pendente — exige decisão arquitetural |

---

## S5 — `seguranca/tier1-security`

| Aspecto | Conteúdo |
|---|---|
| **O que repete** | Quase 100% duplica `isolamento-organizacao` |
| **Skill canônica** | `governanca/lei/isolamento-organizacao` |
| **Tolerância** | 🔴 Crítico — skill inteira é redundância |
| **Ação recomendada** | Reescrever `tier1-security` como **complemento** de segurança (anti-enumeração, IDs sequenciais, defesa-em-profundidade, S3 pre-signed URLs) — remover toda repetição de regras de isolamento |
| **Status Atual** | ❌ Pendente |

---

## S6 — `seguranca/seguranca-5-camadas`

| Aspecto | Conteúdo |
|---|---|
| **O que repete** | Camada 4 duplica `isolamento-organizacao` inteiro |
| **Skill canônica** | `governanca/lei/isolamento-organizacao` |
| **Tolerância** | 🟡 Alto — Camada 4 deveria ser link, não cópia |
| **Ação recomendada** | Camada 4 da skill vira: parágrafo curto + `> ⚠️ REGRA ABSOLUTA: Ver isolamento-organizacao` |
| **Status Atual** | ❌ Pendente |

---

## S7 — `processos/criar-produto` Passo 13

| Aspecto | Conteúdo |
|---|---|
| **O que repete** | Mandamento 02 + (anteriormente) 3 índices |
| **Skill canônica** | `9-mandamentos` + `isolamento-organizacao` |
| **Tolerância** | 🟡 Alto — drift confirmado (3 índices); Mandamento 02 é repetição |
| **Ação recomendada** | Substituir por referências. Drift de 3 índices já corrigido nesta sessão |
| **Status Atual** | ⚠️ Parcial — 3 índices resolvidos; Mandamento 02 ainda repetido |

---

## S8 — `papeis/qa` + `processos/code-review`

| Aspecto | Conteúdo |
|---|---|
| **O que repete** | Checklists duplicam Mandamentos inteiros |
| **Skill canônica** | `9-mandamentos` (regras) |
| **Tolerância** | 🟢 Médio — checklist consolidado é prática útil para QA, MAS é vetor de drift |
| **Ação recomendada** | Manter checklist em formato de pergunta (`- [ ] Mandamento 01 respeitado?`) com link, não copiar conteúdo da regra |
| **Status Atual** | ❌ Pendente |

---

## S9 — `processos/deploy` (linhas 343-407)

| Aspecto | Conteúdo |
|---|---|
| **O que repete** | Auto-Scaling Rules + Backup pré-migration repetidos inteiros |
| **Skill canônica** | `governanca/operacao/auto-scaling` + `governanca/lei/backup-policy` |
| **Tolerância** | 🟡 Alto — drift confirmado em outros pontos do projeto |
| **Ação recomendada** | Substituir seções por referências |
| **Status Atual** | ❌ Pendente |

---

## S10 — `database-governance` em `convencao-tecnica/`

| Aspecto | Conteúdo |
|---|---|
| **O que viola** | Define **regras absolutas próprias** (CUID obrigatório, paridade Front=Back=Banco, DB-per-service, public vazio, FK Nullable Proibida) — todas leis, não convenções |
| **Skill canônica** | A própria — mas no lugar errado |
| **Tolerância** | 🔴 Crítico — viola CLAUDE.md SSOT explicitamente ("convenção" não pode dizer "regra absoluta") |
| **Ação recomendada** | Mover para `governanca/lei/database-governance/` |
| **Status Atual** | ✅ **Resolvido nesta sessão** — `git mv` aplicado, CLAUDE.md atualizado, 2 referências em `dream-team/ajustes` e `dream-team/tecnologia/README` corrigidas |

---

## Resumo

| # | Severidade | Status |
|:---|:---:|:---|
| S1 | ⚠️ | ❌ Pendente |
| S2 | ⚠️ | ⚠️ Parcial |
| S3 | ⚠️ | ❌ Pendente |
| S4 | 🔴 | ❌ Pendente (decisão arquitetural) |
| S5 | 🔴 | ❌ Pendente |
| S6 | 🟡 | ❌ Pendente |
| S7 | 🟡 | ⚠️ Parcial |
| S8 | 🟢 | ❌ Pendente |
| S9 | 🟡 | ❌ Pendente |
| S10 | 🔴 | ✅ Resolvido nesta sessão |

**1 violação resolvida, 7 pendentes, 2 parciais.**

## Próxima ação recomendada

Priorizar S4 e S5 — são as duas violações 🔴 que sobreviveram. S4 exige decisão arquitetural (fronteira entre isolamento e SDK); S5 é refatoração mecânica.
