# /code-review — Revisão técnica pré-merge

> **SSOT:** espelho de `.cursor/commands/code-review.md` — alterar nos dois lugares.
> **Skill canônica:** `skills/processos/code-review/SKILL.md` (checklist completo, SLAs, aprovação).
> **Este comando existe porque agentes pulam segurança, wiring de mutação e a regra WIP vs escopo fechado de testes.**

---

## Quando invocado

O agente **PARA** qualquer outra tarefa e executa as etapas **0 → 5 nesta ordem**, sem pular.

Papel ativo: **Líder Técnico** (review pré-merge). QA pós-entrega continua em `/qa`.

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

## ETAPA 4 — Feedback estruturado

Entregar comentários com prefixos da skill:

| Prefixo | Uso |
|:---|:---|
| `[blocker]` | Segurança, arquitetura, escopo fechado sem testes |
| `[must-fix]` | Bug ou violação de padrão |
| `[suggestion]` | Melhoria opcional |
| `[question]` | Dúvida de abordagem |
| `[praise]` | Boa prática |

Cada item: **arquivo + linha** (quando possível), **porquê**, **alternativa sugerida**.

---

## ETAPA 5 — Veredito

```
## Code Review — [branch/PR/escopo]

Classificação: WIP | ESCOPO FECHADO
Arquivos revisados: N

### Resumo
- Blockers: N
- Must-fix: N
- Suggestions: N

### Veredito
APROVADO | APROVADO COM RESSALVAS | REPROVADO

### Itens (ordenados: blockers → must-fix → suggestions → questions → praise)
...
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
