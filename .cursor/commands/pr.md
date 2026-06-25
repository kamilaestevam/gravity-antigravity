# /pr — Abrir Pull Request (escopo desta conversa SOMENTE)

> **SSOT:** espelho de `.claude/commands/pr.md` — alterar nos dois lugares.
> **Relacionado:** `/novo-agente` (TASK), `/code-review`, `/encerrar-agente` (checklist `pr:sim`).

---

## Regra zero — PR = escopo desta conversa, não da branch inteira

`/pr` abre PR **apenas** do que foi **entregue ou alterado nesta conversa**, vinculado à **TASK-NNNNNN** da sessão. **Nada mais.**

| ✅ Permitido | ❌ Proibido |
|:---|:---|
| Commitar **só** arquivos tocados **nesta conversa** | `git add .` ou commit de arquivos de outro agente/task |
| PR com diff **somente** arquivos desta sessão vs `master` | PR da branch inteira se houver diff de outra task |
| Ler ficha `tasks/registros/TASK-{NNNNNN}.json` | Inventar TASK ou usar branch sem ficha |
| `gh pr create` após validação ETAPA 3 | Abrir PR se validação falhar (bloquear e explicar) |

**Mesma branch, vários agentes:** se `git diff master` incluir arquivos **fora** desta conversa → **BLOQUEAR** PR e listar intrusos; pedir ao dono separar branch ou reverter commits alheios.

---

## Quando invocado

O agente **PARA** implementação e executa **0 → 5** nesta ordem. **Não** abrir PR sem passar ETAPA 3.

---

## ETAPA 0 — Identificar TASK e escopo da conversa

1. Identificar `TASK-NNNNNN` (título da conversa, ficha `status: ABR`, ou pergunta ao dono).
2. Ler `tasks/registros/TASK-{NNNNNN}.json` → `titulo_exibicao`, `resumo_detalhado`, `titulo_canonico`.
3. Montar **`arquivos_escopo[]`** = união de:
   - arquivos que **este agente editou** nesta thread;
   - arquivos que o **dono citou** nesta thread;
   - **não** incluir arquivos só porque aparecem no `git status` global.

Se `arquivos_escopo[]` vazio → **parar** e pedir confirmação ao dono.

---

## ETAPA 1 — Branch (sem trocar silenciosamente)

1. `git branch --show-current` → informar ao dono.
2. **Proibido** `git checkout -b` / `git switch` **salvo** ordem explícita do dono nesta conversa.
3. Branch esperada: `pr/TASK-{NNNNNN}-*` ou branch acordada na abertura da task.

---

## ETAPA 2 — Commit (somente escopo da conversa)

1. `git status` + diff dos arquivos em `arquivos_escopo[]`.
2. **Commitar apenas** esses arquivos (paths explícitos — **nunca** `git add -A`).
3. Mensagem de commit: `feat(smart-read): …` ou padrão do repo + `(TASK-{NNNNNN})`.
4. Se houver alterações **fora** do escopo já commitadas na branch → ETAPA 3 detecta (não incluir no commit novo).

---

## ETAPA 3 — Validação antes do PR (obrigatória)

Executar e entregar tabela:

| Verificação | Resultado |
|:---|:---|
| TASK | TASK-NNNNNN |
| Arquivos desta conversa | lista |
| `git diff master --name-only` | lista completa |
| **Intrusos** (diff − escopo conversa) | nenhum ✅ ou lista ❌ |
| Commits na branch vs master | só desta task ✅ ou ❌ |

**Regras de bloqueio:**

- **Intruso** = arquivo em `git diff master` que **não** está em `arquivos_escopo[]` e **não** é gerado/legítimo da mesma entrega (ex.: `package-lock` só se este agente rodou install).
- Se **intrusos** ou commits de outra task → **NÃO** abrir PR; veredito `BLOQUEADO` + o que fazer (cherry-pick, branch nova, revert).

---

## ETAPA 4 — Abrir PR

Somente se ETAPA 3 **OK**:

```powershell
git push -u origin HEAD
gh pr create --title "TASK-NNNNNN | {titulo_exibicao curto}" --body "…"
```

**Body mínimo:**

- Referência `TASK-NNNNNN`
- Escopo (`resumo_detalhado` resumido)
- **Arquivos incluídos** (lista)
- Test plan checklist

Entregar **URL do PR** ao dono.

---

## ETAPA 5 — Veredito

```
## PR — TASK-NNNNNN

**Status:** ABERTO | BLOQUEADO
**Branch:** …
**Arquivos (esta conversa):** …
**Intrusos detectados:** nenhum | …
**URL:** https://github.com/…
```

Se bloqueado → não executar `gh pr create`.

---

## Proibido

- PR da branch inteira com trabalho de outro agente/task
- `git add .` / `git commit -a` no `/pr`
- Abrir PR sem TASK identificada
- Ignorar intrusos no diff vs `master`
- Fazer checkout de branch nova sem ordem do dono
