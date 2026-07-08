# /salvar-pr-mesma-branch — Commit + PR na branch atual (sem trocar branch)

> **SSOT:** espelho de `.claude/commands/salvar-pr-mesma-branch.md` — alterar nos dois lugares.
> **Relacionado:** `/pr` (fluxo completo com validação), `/novo-agente` (TASK), `/encerrar-agente`.

---

## Quando invocado

Salvar o trabalho **nesta conversa**, **commitar na branch atual** (sem `git checkout -b` / `git switch`) e abrir PR com `base` padrão `master` **a partir da mesma branch**.

O agente executa **0 → 4** nesta ordem.

---

## ETAPA 0 — TASK e escopo

1. Identificar `TASK-{NNNNNN}` da conversa (ficha em `tasks/registros/`).
2. Montar `arquivos_escopo[]`: apenas arquivos editados **nesta thread** + paths citados pelo dono.
3. **Proibido** `git add -A` — só paths do escopo.

Se `arquivos_escopo[]` vazio → parar e pedir confirmação.

---

## ETAPA 1 — Branch (ficar na mesma)

1. `git branch --show-current` → anotar branch (ex.: `site-gravity-8888`).
2. **Proibido** `git checkout`, `git switch`, `git checkout -b`, `git worktree` — salvar **na branch já ativa**.
3. Informar ao dono: «Commit e PR sairão de `{branch}`».

---

## ETAPA 2 — Commit

1. `git status` + `git diff` dos arquivos do escopo.
2. `git add` **somente** `arquivos_escopo[]`.
3. Mensagem: padrão do repo + `(TASK-{NNNNNN})` quando houver TASK.
4. `git status` após commit — confirmar sucesso.

**Proibido:** incluir `dist/`, `.env`, artefatos temporários, trabalho de outra TASK não citada.

---

## ETAPA 3 — Push + PR (mesma branch)

1. Ler `skills/processos/pull-request/SKILL.md` (template **Tasks vinculadas**).
2. `git push -u origin HEAD` (na branch atual).
3. `gh pr create --base master --head {branch_atual}` com body da skill (seção Tasks vinculadas obrigatória).
4. Se PR já existir para a branch → informar URL existente em vez de criar duplicata (`gh pr view --head {branch}`).

---

## ETAPA 4 — Veredito

```
## salvar-pr-mesma-branch — TASK-{NNNNNN}

**Branch:** {branch} (inalterada)
**Commit:** {hash curto} — {subject}
**PR:** {URL ou «já existia»}
**Arquivos:** {N} paths do escopo
```

---

## Proibido

- Trocar ou criar branch
- `git add .` / commit fora do escopo da conversa
- PR sem seção **Tasks vinculadas**
- Push force
