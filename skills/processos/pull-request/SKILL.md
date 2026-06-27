---
name: antigravity-pull-request
description: "Use esta skill sempre que o dono pedir para abrir ou atualizar Pull Request (`/pr`, gh pr create/edit). Define o body obrigatório com Tasks vinculadas, mapeamento commit→TASK e modos conversa vs branch."
---

# Gravity — Pull Request

## Regra fundamental

Todo PR do Gravity **vincula entregas a `TASK-NNNNNN`** no body — não só no título. O formato canônico está na seção [Template — Tasks vinculadas](#template--tasks-vinculadas) abaixo.

**Disparo:** comando `/pr` (`.claude/commands/pr.md` e espelho `.cursor/commands/pr.md`).

**Relacionado:** `skills/processos/code-review/SKILL.md` · `/novo-agente` · `/encerrar-agente` (checklist `pr`).

---

## Modos de escopo

| Modo | Quando usar | Diff do PR | Validação anti-intruso |
|:---|:---|:---|:---|
| **`conversa`** | Uma sessão, uma TASK; dono não pediu «PR da branch» | Só arquivos desta conversa | **Obrigatória** — bloquear intrusos |
| **`branch`** | Branch compartilhada (ex. `ajustes-gerais-smart-read`); várias TASKs acumuladas | `master..HEAD` inteiro | Dono confirmou — listar todas as TASKs no body |

**Default:** se o dono disser apenas «fazer PR» e a branch tiver commits de várias TASKs → perguntar uma vez: **conversa** ou **branch**. Se já disse «PR da branch» / exemplo #508 → **`branch`**.

---

## Mapear commits → TASK

1. `git log master..HEAD --oneline --no-merges`
2. Por commit, extrair `(TASK-NNNNNN)` da mensagem (regex case-insensitive).
3. Agrupar hashes curtos (`git rev-parse --short`) por `TASK-NNNNNN`.
4. Para cada TASK, ler `tasks/registros/TASK-{NNNNNN}.json`:
   - `titulo_exibicao` → cabeçalho da seção (usar **texto completo**, ex. `TASK-000370 | [Smart Read] Lista | BUG — …`)
   - `resumo_descricao` ou primeira frase de `resumo_detalhado` → linha **Entrega**
5. Commits **sem** `(TASK-…)` na mensagem → seção **«Entrega sem ficha TASK dedicada»** (ou agrupar por área se óbvio); incluir **Nota:** sugerir `/novo-agente` para registrar ficha.
6. Um commit pode citar uma TASK; outro arquivo do mesmo PR pode atender outra TASK — usar diff do commit (`git show --stat`) para atribuir quando a mensagem for ambígua.

**Proibido:** inventar TASK; citar ficha inexistente; omitir seção **Tasks vinculadas** no body.

---

## Título do PR

| Cenário | Formato |
|:---|:---|
| Uma TASK | `TASK-NNNNNN \| {resumo humano curto}` (espelhar `titulo_exibicao` sem repetir prefixo duas vezes se já redundante) |
| Várias TASKs | `{tipo}({área}): {resumo} (TASK-000368–372)` — intervalo ou lista explícita |

---

## Template — Tasks vinculadas

> **Trecho obrigatório** em todo body de PR (modos `conversa` e `branch`). Preencher com dados reais; não deixar placeholders.

```markdown
## Summary

Entregas da branch `{nome-branch}` — {uma frase do que entra neste PR}. Cada bloco referencia ficha em `tasks/registros/`.

---

## Tasks vinculadas

### TASK-000369 | [Hub] Insights | MEL — Subir linha de dados dos cards GABI 8px

- **Ficha:** `tasks/registros/TASK-000369.json`
- **Commits:** `50e65a5`, `59ae28c`
- **Entrega:** deslocar faixa label+valor nos cards GABI AI Insights sem mover links de ação.

### TASK-000370 | [Smart Read] Lista | BUG — Scroll travado nos cards da conferência

- **Ficha:** `tasks/registros/TASK-000370.json`
- **Commits:** `d78acdc`
- **Entrega:** liberar scroll vertical na aba Análise de Riscos.

### {Entrega sem ficha TASK dedicada} — {rótulo curto, ex. layout Análise de Riscos}

- **Commits:** `bda3afe`, `f4d2544`, `9072e6a`
- **Entrega:** {o que mudou em uma ou duas frases}
- **Nota:** escopo da mesma branch/sessão; registrar `TASK-NNNNNN` via `/novo-agente` se quiser rastreio formal.

---

## Test plan

- [ ] **TASK-000369** — {critério verificável}
- [ ] **TASK-000370** — {critério verificável}
- [ ] **{rótulo sem ficha}** — {critério}
- [ ] Regressão / smoke geral se aplicável
```

**Regras do template:**

- Uma subseção `###` por TASK (ou por bloco sem ficha).
- **Ficha** sempre com caminho relativo `tasks/registros/TASK-….json`.
- **Commits** em backticks, hash curto 7 caracteres.
- **Test plan** repete o id **TASK-NNNNNN** em cada checkbox quando houver ficha.

---

## Comando `gh`

```powershell
git push -u origin HEAD
gh pr create --base master --head {branch} --title "…" --body "$( @'
… body completo com Tasks vinculadas …
'@ )"
```

Atualizar PR existente: `gh pr edit {número} --body "…"` (mesmo template).

---

## Referência

Exemplo aprovado pelo dono: PR #508 (`ajustes-gerais-smart-read`, TASK-000368–372 + layout Smart Read sem ficha).
