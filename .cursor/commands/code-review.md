# /code-review — Revisão técnica da conversa atual (somente)

> **SSOT:** espelho de `.claude/commands/code-review.md` — alterar nos dois lugares.
> **Skill canônica:** `skills/processos/code-review/SKILL.md` (checklist completo, SLAs, aprovação).
> **Este comando existe porque agentes pulam segurança, wiring de mutação e a regra WIP vs escopo fechado de testes.**

---

## Regra zero — SOMENTE code review desta conversa

`/code-review` faz **apenas** a revisão técnica do que foi **entregue ou alterado nesta conversa** (arquivos citados, edits do agente, diff discutido com o dono). **Nada mais.**

| ✅ Permitido | ❌ Proibido |
|:---|:---|
| Ler skills da ETAPA 0 | `git diff` da branch inteira, working tree global ou `gh pr diff` fora do escopo da conversa |
| Revisar arquivos tocados **nesta conversa** | Implementar correções, refatorar, commitar, abrir PR |
| Entregar tabela + veredito (ETAPAs 4–5) | Rodar testes, atualizar docs/skills (`/docs-skills`), criar planos de teste |
| Classificar WIP vs escopo fechado **desta entrega** | Revisar código legado não mencionado nem alterado nesta conversa |

Se o dono não deixou claro o que revisar, usar **somente** os arquivos que o agente editou ou que o dono citou nesta thread — **não** expandir escopo.

---

## Quando invocado

O agente **PARA** qualquer outra tarefa e executa as etapas **0 → 5 nesta ordem**, sem pular. **Ao terminar, encerra** — não continua implementação.

Papéis ativos: **Líder Técnico** (qualidade, segurança, wiring) + **Coordenador** (contrato, DDD, ondas) — consenso na coluna 4 da tabela.

**Escopo do review (único):** entrega da **conversa atual** — lista explícita de arquivos/mudanças inferida do histórico desta thread.

---

## ETAPA 0 — Skills obrigatórias (ler antes de julgar)

1. `skills/governanca/lei/9-mandamentos/SKILL.md`
2. `skills/governanca/lei/agent-policy/SKILL.md`
3. `skills/processos/code-review/SKILL.md` ← **checklist deste comando**
4. Se a entrega toca testes ou escopo fechado: `skills/testes/SKILL.md` + `.claude/commands/testes-criar.md`

---

## ETAPA 1 — Classificar a entrega (WIP vs escopo fechado)

| Situação | Testes no review |
|:---|:---|
| **WIP** — tela/feature em construção (explícito ou acordo do dono nesta conversa) | **Não bloquear** por ausência de testes |
| **Escopo fechado** — entrega concluída nesta conversa | Pacote **100%** `/testes-criar` — ausência = `[blocker]` |

Registrar no output: `Classificação: WIP | ESCOPO FECHADO` + justificativa em uma linha.

---

## ETAPA 2 — Ler o escopo desta conversa

- [ ] Listei **somente** arquivos alterados ou discutidos **nesta conversa**
- [ ] Li o conteúdo/diff **desse escopo** — não o repositório inteiro
- [ ] Identifiquei PATCH/POST/PUT novos ou alterados no escopo (dispara wiring na ETAPA 3)

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
## Code Review — conversa atual

Escopo: [lista de arquivos/mudanças desta conversa]
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

- Revisar fora do escopo desta conversa (branch inteira, PR alheio, arquivos não tocados aqui)
- Implementar, corrigir código, commitar ou abrir PR após o veredito
- Chamar `/docs-skills`, `/testes-criar` ou `/qa` no mesmo turno
- Aprovar sem ler todos os arquivos **do escopo da conversa**
- Ignorar wiring em mutações “porque é WIP” quando o campo não persiste
- Exigir testes em entrega WIP sem acordo do dono
- Pular skills da ETAPA 0
