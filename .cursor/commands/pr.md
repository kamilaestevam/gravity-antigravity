# /pr — Abrir Pull Request (com Tasks vinculadas)

> **SSOT:** espelho de `.claude/commands/pr.md` — alterar nos dois lugares (`.cursor/commands/pr.md`).
> **Skill:** `skills/processos/pull-request/SKILL.md` (**ler na ETAPA 0** — template obrigatório).
> **Relacionado:** `/novo-agente` (TASK), `/code-review`, `/encerrar-agente` (checklist `pr:sim`).

---

## Quando invocado

O agente **PARA** implementação e executa **0 → 5** nesta ordem. **Não** abrir PR sem passar ETAPA 3.

---

## ETAPA 0 — Skill + modo + TASK(s)

1. **Ler** `skills/processos/pull-request/SKILL.md` (template [Tasks vinculadas](skills/processos/pull-request/SKILL.md#template--tasks-vinculadas)).
2. Definir **modo** (perguntar uma vez se ambíguo):
   - **`conversa`** — escopo **desta thread** + em geral **uma** TASK.
   - **`branch`** — `master..HEAD` inteiro; **várias** TASKs no body (ex. branch compartilhada).
3. Identificar TASK(s): título da conversa, fichas `tasks/registros/TASK-*.json`, `(TASK-NNNNNN)` nos commits, ou confirmação do dono.
4. Montar **`arquivos_escopo[]`** (modo `conversa`):
   - arquivos editados **nesta thread** + citados pelo dono;
   - **não** incluir só porque aparecem no `git status` global.

Se modo `conversa` e `arquivos_escopo[]` vazio → parar e pedir confirmação.

---

## ETAPA 1 — Branch (sem trocar silenciosamente)

1. `git branch --show-current` → informar ao dono.
2. **Proibido** `git checkout -b` / `git switch` **salvo** ordem explícita do dono nesta conversa.
3. Branch esperada: `pr/TASK-{NNNNNN}-*` ou branch acordada na abertura da task.

---

## ETAPA 2 — Commit

**Modo `conversa`:**

1. `git status` + diff de `arquivos_escopo[]`.
2. Commitar **apenas** esses paths (**nunca** `git add -A`).
3. Mensagem: padrão do repo + `(TASK-{NNNNNN})` quando houver TASK.

**Modo `branch`:**

1. Garantir working tree limpo (commitar pendências do escopo **antes** do PR, com `(TASK-…)` nas mensagens).
2. **Não** exigir que tudo tenha sido feito nesta conversa.

---

## ETAPA 3 — Validação antes do PR (obrigatória)

| Verificação | Modo `conversa` | Modo `branch` |
|:---|:---|:---|
| TASK(s) | TASK-NNNNNN | lista de TASKs no diff |
| Arquivos escopo | `arquivos_escopo[]` | `git diff master --name-only` |
| Intrusos | bloquear se diff ≠ escopo | informar; dono já escolheu branch inteira |
| Commits vs master | `git log master..HEAD --oneline --no-merges` | idem |

**Bloqueio (modo `conversa`):** intrusos no diff → **NÃO** abrir PR; veredito `BLOQUEADO`.

**Mapeamento:** seguir skill — agrupar commits por `(TASK-…)`; ler cada ficha JSON.

---

## ETAPA 4 — Abrir PR

Somente se ETAPA 3 **OK** (ou modo `branch` com dono ciente):

```powershell
git push -u origin HEAD
gh pr create --base master --title "…" --body "$( @'
…
'@ )"
```

### Body obrigatório

Usar **integralmente** a estrutura da skill — seção **Tasks vinculadas** não é opcional:

1. `## Summary` (branch + uma frase)
2. `## Tasks vinculadas` — por TASK: `### {titulo_exibicao da ficha}` + **Ficha** + **Commits** + **Entrega**
3. Bloco **sem ficha** quando houver commits sem `(TASK-…)`
4. `## Test plan` — checkbox por **TASK-NNNNNN** (+ regressão se aplicável)

Ver template completo: `skills/processos/pull-request/SKILL.md#template--tasks-vinculadas`.

**Título:** ver skill (uma TASK vs intervalo `TASK-000368–372`).

Entregar **URL** do PR. Se o dono pedir ajuste na descrição → `gh pr edit`.

---

## ETAPA 5 — Veredito

```
## PR — {TASK-NNNNNN ou intervalo}

**Status:** ABERTO | BLOQUEADO
**Modo:** conversa | branch
**Branch:** …
**Tasks no body:** TASK-…, …
**URL:** https://github.com/…
```

Modo `conversa` — incluir **Intrusos detectados:** nenhum | …

Se bloqueado → não executar `gh pr create`.

---

## Proibido

- Body sem seção **Tasks vinculadas** (formato da skill)
- `git add .` / `git commit -a` no modo `conversa`
- Inventar TASK ou ficha inexistente
- Modo `conversa` com diff da branch inteira sem bloquear intrusos
- Abrir PR sem ler `skills/processos/pull-request/SKILL.md`
- `git checkout` de branch nova sem ordem do dono
