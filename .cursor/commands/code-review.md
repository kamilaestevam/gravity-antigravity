# /code-review — Revisão técnica pré-merge

> **SSOT:** espelho de `.claude/commands/code-review.md` — alterar nos dois lugares.
> **Skill canônica:** `skills/processos/code-review/SKILL.md` (checklist completo, SLAs, aprovação).
> **Este comando existe porque agentes pulam segurança, wiring de mutação e a regra WIP vs escopo fechado de testes.**

---

## Quando invocado

O agente **PARA** qualquer outra tarefa e executa as etapas **0 → 5 nesta ordem**, sem pular.

Papéis ativos: **Líder Técnico** (qualidade, segurança, wiring) + **Coordenador** (contrato, DDD, ondas) — consenso na coluna 4 da tabela. QA pós-entrega continua em `/qa`.

**Escopo do review** (inferir da mensagem do dono; se ambíguo, perguntar uma vez):
- `branch changes` — diff da branch atual vs base (padrão)
- `uncommitted changes` — working tree
- `PR #N` — usar `gh pr diff N`

---

## ETAPA 0 — Skills obrigatórias (ler antes de julgar)

1. `skills/governanca/lei/9-mandamentos/SKILL.md`
2. `skills/governanca/lei/agent-policy/SKILL.md`
3. `skills/processos/code-review/SKILL.md` ← **checklist deste comando**
4. Se o PR toca testes ou escopo fechado: `skills/testes/SKILL.md` + `.claude/commands/testes-criar.md`

---

## ETAPA 1 — Classificar o PR (WIP vs escopo fechado)

| Situação | Testes no review |
|:---|:---|
| **WIP** — tela/feature em construção (explícito no PR, título, ou acordo do dono) | **Não bloquear** por ausência de testes |
| **Escopo fechado** — merge staging, bugfix em produção, feature concluída | Pacote **100%** `/testes-criar` — ausência = `[blocker]` |

Registrar no output: `Classificação: WIP | ESCOPO FECHADO` + justificativa em uma linha.

---

## ETAPA 2 — Ler o diff completo

- [ ] Li **todo** o diff, não só arquivos conhecidos
- [ ] Listei arquivos tocados por categoria (front, back, testes, docs, skills)
- [ ] Identifiquei PATCH/POST/PUT novos ou alterados (dispara ETAPA 3 wiring)

---

## ETAPA 3 — Checklist técnico (skill code-review)

Percorrer **todas** as seções da skill e marcar PASS / FAIL / N/A:

1. **Segurança** — qualquer FAIL = `[blocker]`
2. **Qualidade de código**
3. **Testes** — aplicar regra da ETAPA 1
4. **Wiring de mutação** — cada PATCH/POST/PUT: cadeia Prisma → Zod request → rota → TS front → Zod response → useEffect modal; PATCH→GET só `[blocker]` se escopo fechado
5. **Arquitetura**
6. **Documentação e skills** — mudança de contrato sem update em `documentos-tecnicos/` ou `skills/` = `[blocker]`

---

## ETAPA 4 — Feedback em tabela (formato obrigatório)

Cada achado vira **uma linha** na tabela abaixo. Prefixos da skill vão no início da coluna **Deve ser alterado** (`[blocker]`, `[must-fix]`, `[suggestion]`, `[question]`, `[praise]`).

| # | Deve ser alterado | Motivo | Onde | Opinião e consenso (Líder + Coordenador) |
|:---:|:---|:---|:---|:---|
| 1 | `[blocker]` … o que mudar | Por que viola regra/skill (Mandamento, ADR, skill) | `caminho/arquivo.ts` L42 ou módulo/rota | **Líder:** … **Coordenador:** … **Consenso:** Aprovar alteração / Bloquear merge / Ressalva |
| 2 | … | … | … | … |

**Regras das colunas:**
- **Deve ser alterado** — ação concreta; em `[praise]`, descrever a boa prática (não exige mudança).
- **Motivo** — regra ou risco; citar skill, mandamento ou ADR quando aplicável.
- **Onde** — arquivo + linha, ou rota/endpoint/módulo se o diff for amplo.
- **Opinião e consenso** — duas linhas curtas (**Líder** = qualidade, segurança, wiring; **Coordenador** = contrato, DDD, ondas, schema); fechar com **Consenso** (alinhar os dois; se divergirem, Consenso = bloquear até alinhar).

Ordenar linhas: `[blocker]` → `[must-fix]` → `[suggestion]` → `[question]` → `[praise]`. Se nenhum achado: uma linha com `[praise]` «Nenhum blocker identificado» ou «Diff limpo no escopo revisado».

---

## ETAPA 5 — Veredito

```
## Code Review — [branch/PR/escopo]

Classificação: WIP | ESCOPO FECHADO
Arquivos revisados: N

### Resumo
- Blockers: N | Must-fix: N | Suggestions: N

### Veredito
APROVADO | APROVADO COM RESSALVAS | REPROVADO

### Tabela de achados
[copiar tabela da ETAPA 4 — colunas: # | Deve ser alterado | Motivo | Onde | Opinião e consenso]
```

**Regras de aprovação (skill):**
- Qualquer `[blocker]` ou `[must-fix]` pendente → **REPROVADO**
- Escopo fechado: exigir `npm run validate:test-ids` verde e pacote `/testes-criar` completo
- Autor não aprova o próprio PR
- Mudanças após feedback → re-review obrigatório

---

## Proibido

- Aprovar sem ler o diff inteiro
- Ignorar wiring em mutações “porque é WIP” quando o campo não persiste
- Exigir testes em PR marcado WIP sem acordo do dono
- Pular skills da ETAPA 0
