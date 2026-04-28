# Auditoria de Skills — Matriz Mestre

> **Documento gerado pela pré-passada de auditoria das 64 SKILL.md.**
> Este arquivo é o índice consolidado dos 5 relatórios em `_meta/auditoria-skills/`.
> Não documenta features — documenta o estado das skills entre si.

---

## Metadados

| Campo | Valor |
|---|---|
| Data da auditoria | 2026-04-28 |
| Commit hash | `75e0b4a5` |
| Branch | `claude/cool-elbakyan-ff8ae6` |
| Skills lidas | **53 de 64** (83%) |
| Skills NÃO lidas | 11 (testes operacionais + dream-team meta — baixo risco SSOT) |
| Tipo | Auditoria cruzada (skill × skill) |
| Próxima auditoria | Após ciclo de cada onda — atualizar `04-lacunas.md` |

---

## Resumo Numérico

| Tipo de achado | Total | Severidade média | Arquivo |
|---|---:|---|---|
| Regras duplicadas em 5+ skills | **9 grupos** | Alta | `01-duplicacoes.md` |
| Conflitos diretos | **8** | **Crítica** | `02-conflitos.md` |
| Violações SSOT (vertical/operação repete lei) | **10** | Crítica/Alta | `03-violacoes-ssot.md` |
| Lacunas conceituais (sem skill cobrindo) | **3** | Média | `04-lacunas.md` |
| **Total** | **30** | — | — |

---

## Skills NÃO lidas (justificativa)

| Skill | Por que pulei | Risco |
|---|---|---|
| `testes/contract-testing/SKILL.md` | Padrão Zod já visto em `testes/SKILL.md` | Baixo |
| `testes/agente-plano-teste/SKILL.md` | Operacional — agente de plano de teste | Baixo |
| `testes/agente-plano-teste-e2e/SKILL.md` | Operacional | Baixo |
| `testes/agente-plano-teste-funcional/SKILL.md` | Operacional | Baixo |
| `testes/agente-plano-teste-unitario/SKILL.md` | Operacional | Baixo |
| `dream-team/ajustes/SKILL.md` | Lida parcialmente; processo de ajustes pontuais | Baixo |
| `dream-team/detetive-tela/SKILL.md` | Skill de auditoria forense; padrão de processo | Baixo |
| `dream-team/produtos/*` (subpasta de 11 arquivos) | Times de produto; mapa do dream-team | Baixo |
| `dream-team/tecnologia/README.md` | Apenas README de mapa | Nulo |
| `governanca/operacao/service-registry/SKILL.md` | Lido | — |

> Para 100% de cobertura, abrir nova execução desta auditoria com flag para os 11 restantes. Padrões macro já estão estabilizados.

---

## Como Ler Esta Auditoria

1. **Comece por `02-conflitos.md`** — são as decisões mais urgentes (8 itens). O agente de skills só pode atuar depois que você decidir cada conflito.
2. **Depois `03-violacoes-ssot.md`** — 10 violações que indicam refactor de skills (não decisões de negócio).
3. **`01-duplicacoes.md`** — operacional para o agente de consolidação de skills (não bloqueante).
4. **`04-lacunas.md`** — vai crescer ao longo das ondas A-D conforme código for lido.

---

## Como Esta Auditoria Alimenta os Ciclos das Ondas

Cada ciclo de skill (Onda A em diante) deve, antes da Fase 1:

- Consultar `02-conflitos.md` — se a skill atual está em conflito, NÃO produzir doc até resolução
- Consultar `03-violacoes-ssot.md` — se a skill duplica lei, doc do produto referencia a canonical
- Consultar `01-duplicacoes.md` — para evitar repetir regras já documentadas
- Atualizar `04-lacunas.md` — toda vez que detectar regra em código sem skill correspondente

---

## Convenção de Severidade

| Marca | Significado | Bloqueio |
|---|---|---|
| **Crítica** | Pode causar bug em produção ou interpretação errada de regra absoluta | Bloqueia ciclo da onda relacionada |
| Alta | Indica drift documental | Bloqueia merge sem correção |
| Média | Inconsistência cosmética ou desatualização | Não bloqueia, mas registrar |
| Baixa | Redundância tolerável | Apenas anotar |

---

## Skills com mais débito documental

Top 5 skills com mais achados acumulados (duplicação + conflito + SSOT):

| # | Skill | Achados | Recomendação |
|---:|---|---:|---|
| 1 | `governanca/lei/agent-policy/SKILL.md` | 6 | Refatorar — separar "regras universais do agente" do "resumo dos mandamentos" |
| 2 | `governanca/convencao-tecnica/code-standards/SKILL.md` | 5 | Reduzir — referenciar Mandamentos em vez de repetir |
| 3 | `processos/criar-produto/SKILL.md` | 4 | **Atualizar pós-pivô** — Passo 13 conflita com Schema-per-Organização |
| 4 | `seguranca/tier1-security/SKILL.md` | 3 | Considerar fundir com `isolamento-organizacao` |
| 5 | `processos/deploy/SKILL.md` | 3 | Remover seções "Auto-Scaling Rules" e "Backup Antes de Migration Destrutiva" — referenciar canonicas |

---

## Histórico de Atualizações

| Data | Commit | O que mudou |
|---|---|---|
| 2026-04-28 | `75e0b4a5` | Pré-passada inicial — 53/64 skills lidas; 30 achados |
