# /novo-agente — Registrar task (OBRIGATÓRIO antes de qualquer trabalho)

> **SSOT:** espelho de `.claude/commands/novo-agente.md` — alterar nos dois lugares.
> **Guia:** `tasks/README.md`
> **Registry:** `tasks/registros/registro-tasks.json`
> **Fichas:** `tasks/registros/TASK-{NNNNNN}.json`

---

## REGRA ZERO — BLOQUEIO ABSOLUTO (primeira coisa, sempre)

Se a mensagem contém **`/novo-agente`**, o agente **NÃO PODE** — nesta mesma resposta nem antes do veredito da ETAPA 4:

❌ Ler arquivos de código do produto  
❌ Grep / busca no codebase  
❌ Escrever ou editar código  
❌ Disparar subagentes (Explore, etc.)  
❌ Responder o pedido técnico do dono (bug, feature, análise)  
❌ Ler skills de produto (pedido, bid-frete, UX…)  

✅ **Só** pode: ler `tasks/registros/registro-tasks.json`, `tasks/README.md`, perguntar classificação, gravar ficha, inventariar branches/worktrees/portas (somente leitura), entregar veredito e **comunicar** `titulo_exibicao` (ver LIMITAÇÃO — agente não renomeia no sidebar).

❌ **Proibido** aceitar «continuar» ou executar pedido técnico sem o dono indicar **branch + pasta/worktree + porta** a seguir.

❌ **Proibido** inventar ou copiar número de task — alocar **somente** via `proximo_numero` em `registro-tasks.json` (ver seção anti-erro).

❌ **`/novo-agente` NÃO cria nem troca branch** — `git checkout`, `git switch`, `git checkout -b`, `git worktree` são **proibidos** neste comando e no veredito.

**Dois modos de entrada (obrigatório distinguir):**

| Modo | Mensagem do dono | O que o agente faz |
|:---|:---|:---|
| **A — vazio** | Só `/novo-agente` (sem pedido, sem print) | Responde **apenas**: «O que você quer fazer nesta task?» — **proibido** mostrar número, inventário, branch ou porta |
| **B — completo** | `/novo-agente` + pedido (texto, print, atalho `SMTRD MEL …`) | ETAPA 0 → 3.5 → gravar ficha → **veredito em tabela** pedindo validação |
| **C — resposta** | Dono descreveu após Modo A | Igual Modo B na mesma resposta |

**Proibido** no Modo A: antecipar `TASK-000405`, listar `master`, portas ou «próximo número reservado» em prosa solta (como no anti-padrão do screenshot).

**Se o dono colocou `/novo-agente` + pedido na mesma mensagem (Modo B):** executar fluxo completo e entregar **somente** a tabela de validação — não pedir «o que quer fazer» de novo.

**Não avance para o trabalho até o dono validar a tabela** (confirmar ou corrigir número, descrição e alvo branch+pasta+porta) **e** dizer **continuar**.

---

## Formato canônico (v2 — sem TIPO_SESSAO)

```
{AREA}(-{SUBAREA})?(-{VIS})?-{TIPO_ENTREGA}-{RESUMO}
```

| Parte | Obrigatório | Exemplos |
|:---|:---:|:---|
| `AREA` | Sim | `BIDFRT`, `SMTRD`, `PEDIDO`, `CONFIG`, `CORE`, … |
| `SUBAREA` | Não | `COTACOES`, `ADMIN-TESTES` |
| `VIS` | Não | `LISTA`, `KANBAN`, `DASHBOARD`, `INSIGHTS` |
| `TIPO_ENTREGA` | Sim | `BUG`, `MEL`, `NOV`, `REF`, `AUD`, `CFG`, `DUV` |
| `RESUMO` | Sim | `REMOVER-EXPANDIR-LINHA-COT` |

**Referência:** `TASK-{NNNNNN}` (não usar `AGT-`).

---

## Número da task — alocação obrigatória (anti-erro)

> **Erro frequente:** agente inventa número, copia da mensagem do dono, usa ordinal ou pega TASK de outra conversa. **Isso é proibido.**

| Regra | Detalhe |
|:---|:---|
| **Fonte única** | O número vem **somente** de `tasks/registros/registro-tasks.json` → campo `proximo_numero` **lido na ETAPA 0** |
| **Fórmula** | `referencia` = `TASK-` + `proximo_numero` com **6 dígitos** (`405` → `TASK-000405`) |
| **Após gravar** | Incrementar `proximo_numero` em **+1** na mesma ETAPA 3 — o veredito mostra **a task criada** e **o próximo livre** |
| **Reabrir task existente** | **Só** se o dono pedir explicitamente «continuar/reabrir `TASK-000384`» **e** existir `tasks/registros/TASK-000384.json` — **não** alocar número novo |
| **Nova sessão = número novo** | `/novo-agente` sem «reabrir TASK-…» → **sempre** alocar via `proximo_numero`; ignorar TASK citada pelo dono como rascunho |

**Proibido:** chutar número; usar `TASK-` da branch, do PR, do chat anterior, do título que o dono colou, ou `entradas[].ordinal`.

**Conferência antes do veredito (ETAPA 3):** arquivo `TASK-{NNNNNN}.json` criado; `referencia` na ficha = `referencia` em `entradas[]` = número no `titulo_exibicao`.

---

## Nome com número — obrigatório em toda comunicação

**`titulo_exibicao`** é o **único** nome humano da task. Formato fixo — **sempre** começa com o número:

```
TASK-{NNNNNN} | [{Área legível}] {Vis?} | {TIPO} — {resumo humano}
```

Exemplo: `TASK-000266 | [Admin] Taxas Moeda | NOV — Agendamento cotação atual e futura`

| Onde | Obrigatório |
|:---|:---|
| Ficha `TASK-{NNNNNN}.json` | campo `titulo_exibicao` com prefixo `TASK-{NNNNNN}` |
| `registro-tasks.json` → `entradas[]` | mesmo `titulo_exibicao` |
| **Veredito ETAPA 4** | **primeira linha visível** = `titulo_exibicao` completo (copiável) |
| **Toda resposta** do agente nesta conversa | mencionar `TASK-{NNNNNN}` no título ou primeira frase — **nunca** só «a task», «esta sessão» ou classificação canônica sem número |
| **Sidebar (dono)** | colar o `titulo_exibicao` com número |

**Proibido:** título sem `TASK-`; número diferente entre ficha, registry e veredito; veredito só com `ADMIN-TAXAS-…` sem `TASK-000266 | …`.

Gravar o mesmo valor em `titulo_exibicao` na ficha JSON e no índice.

---

## LIMITAÇÃO — rename no Cursor (ler antes da ETAPA 4)

O agente **NÃO TEM** ferramenta para renomear a conversa no sidebar. **Não finja** que renomeou; **não** peça confirmação de rename como se pudesse verificar.

| Quem | Como |
|:---|:---|
| **Cursor (auto)** | Título deriva da **primeira mensagem** do chat — inclua `titulo_exibicao` nela quando possível |
| **Dono (manual)** | Clique direito no chat → Renomear → colar o `titulo_exibicao` |

**Atalho recomendado (chat novo, auto-título na primeira mensagem):**

```
/novo-agente ADMIN TAXAS-MOEDA NOV AGENDAMENTO-COTACAO — TASK-000266 | [Admin] Taxas Moeda | NOV — Agendamento cotação atual e futura
```

**Proibido na resposta:** `AGT-`, `IMP-`, `TIPO_SESSAO`, blocos alternativos (citação, markdown). **Um** veredito ETAPA 4 completo + **um** `titulo_exibicao` copiável.

Legado `documentos-tecnicos/processos/convencao-titulos-agente.md` — **não usar**.

---

## Git, branches e previews — dono escolhe (bloqueio obrigatório)

| Regra | Detalhe |
|:---|:---|
| **Sem branch nova no `/novo-agente`** | Registrar task ≠ criar branch; **nunca** `git checkout -b` neste fluxo |
| **Sem troca automática** | **Proibido** `git checkout` / `git switch` / `git worktree` sem ordem explícita do dono |
| **Inventário obrigatório** | Na ETAPA 3.5, listar **todas** as branches ativas (repo principal + worktrees) e **todas** as portas de preview em uso (`:8000`–`:8019`; reservadas `:8005` API Config, `:8009` GABI) |
| **Dono define o alvo** | O agente **só pode trabalhar** após o dono indicar **qual branch**, **qual pasta/worktree** e **qual porta** seguir (ex.: «usa `:8001` na worktree manual») |
| **Sem alvo = bloqueado** | **Proibido** aceitar «continuar» ou executar pedido técnico sem essa escolha explícita do dono |
| **Agente novo** | Só grava ficha e inventaria ambiente — **não** assume `:8000` nem branch do disco como padrão |

**Por quê a tela «muda do nada»:** checkout ou Vite na pasta/porta errada. **Prevenção:** inventário completo no veredito + dono escolhe o alvo antes de qualquer código.

---

## Tabelas fechadas (classificação)

### AREA

`LOGIN` · `ONBOARDING` · `ADMIN` · `CONFIG` · `PEDIDO` · `BIDFRT` · `BIDCAM` · `PROCSO` · `FINCOM` · `SMTRD` · `OUTROS`

`SMTRD` = Smart Read (`servicos-global/produto/smart-read/`) — usar **área** `SMTRD` em vez de `OUTROS` + subárea `SMART-READ`.

### VIS (opcional)

`INSIGHTS` · `LISTA` · `KANBAN` · `DASHBOARD`

### TIPO_ENTREGA

`BUG` · `MEL` · `NOV` · `REF` · `AUD` · `CFG` · `DUV`

---

## Fluxo (0 → 5 — ordem fixa)

### ETAPA 0 — Ler registry e alocar número (sem chute)

1. Ler `tasks/registros/registro-tasks.json` **nesta execução** (não usar número de memória)
2. Se dono pediu **reabrir** `TASK-XXXXXXXX` existente → usar essa referência; **pular** alocação
3. Senão: `N = proximo_numero` → `referencia` = `TASK-` + `N` formatado com 6 dígitos (`String(N).PadLeft(6,'0')`)
4. Anotar `referencia` — **único** número válido para esta sessão até gravar a ficha

### ETAPA 1 — Entrada do dono

**Modo A (só `/novo-agente`):** parar aqui. Uma pergunta:

> «O que você quer fazer nesta task?» (texto livre, print ou atalho ex.: `/novo-agente SMTRD MEL …`)

**Modo B/C (já há pedido):** classificar sem re-perguntar o escopo:

1. Derivar **AREA** — confirmar só se ambíguo
2. **Subárea** / **visualização** — inferir ou perguntar uma coisa se faltar
3. **TIPO_ENTREGA** (`BUG`, `MEL`, `NOV`…)
4. **RESUMO** kebab + `resumo_detalhado` (parágrafo do pedido; print conta como contexto)

**Atalho** (Modo B — pula perguntas se válido):

```
/novo-agente BIDFRT LISTA MEL REMOVER-EXPANDIR-LINHA-COT
```

### ETAPA 2 — Montar títulos + `*_descricao`

Todo campo codificado deve ter par `campo` + `campo_descricao` (ver `TASK-000001.json`).

Montar também `resumo_detalhado` (parágrafo do pedido/escopo — o que será feito nesta task).

### ETAPA 3 — Gravar ficha (e validar número)

1. Criar `tasks/registros/TASK-{NNNNNN}.json` com `referencia` = número alocado na ETAPA 0 (`status: ABR`, `data_criacao` UTC)
2. `titulo_exibicao` **deve** começar com `TASK-{NNNNNN} |` — mesmo `{NNNNNN}` da `referencia`
3. Atualizar `registro-tasks.json` (`entradas[]` no topo, incrementar `proximo_numero` em +1)
4. **Validar:** `referencia` na ficha = `referencia` em `entradas[0]` = prefixo de `titulo_exibicao` — se divergir, **corrigir antes do veredito**
5. **Não** recalcular `registro-totais.json` na abertura (só no `/encerrar-agente`)

### ETAPA 3.5 — Inventário de branches e portas (OBRIGATÓRIO)

Após gravar a ficha, **somente leitura** — montar inventário completo para o dono escolher o alvo:

1. `git branch --show-current` no repo principal + `git worktree list` (cada pasta → branch)
2. Portas em uso: `Get-NetTCPConnection -LocalPort 8000..8019 -State Listen` (Windows) ou equivalente — anotar qual URL está ativa (`http://127.0.0.1:PORTA/`)
3. **Não** usar `dev-preview-registry.json` nem `npm run agente:preview` — removidos; fonte da verdade é o inventário ao vivo + instrução do dono

Incluir no veredito — **colunas separadas** (ETAPA 4): **Branch** | **Servidor** (`:porta` · URL · ativo sim/não) | **Worktree** (pasta absoluta; repo principal marcar `(principal)`; se branch só em `origin/` sem checkout local → Worktree `—`).

**Sugestão (última coluna):** o agente propõe branch + servidor + worktree com justificativa curta. Dono **valida** ou corrige.

### ETAPA 4 — Veredito de abertura (OBRIGATÓRIO — **somente tabela**)

**Única saída** antes de trabalhar (Modo B/C). **Proibido** veredito em prosa solta, listas fora da tabela ou «próximo número reservado» sem gravar ficha.

**Formato fixo — tabela com 6 colunas** (uma linha por ambiente checkoutado; colunas 1–2 iguais em todas as linhas; **Sugestão** repetida ou só na primeira linha):

| Número da Task | Descrição da Task | Branch | Servidor | Worktree | Sugestão de qual deve seguir |
|:---|:---|:---|:---|:---|:---|
| `TASK-000405` | `TASK-000405 \| [University] Manuais \| MEL — …` + resumo 1 linha | `master` | `:8000` · http://127.0.0.1:8000/ · ativo: sim | `C:/Users/danie/gravity-antigravity` (principal) | `ajustes-manual-gravity-4` · `:8001` · mesma pasta — validar (branch só em origin/) |
| `TASK-000405` | (mesmo) | `pr/manual-…` | `:8001` · http://127.0.0.1:8001/ · ativo: não | `C:/Users/danie/gravity-preview-manual` | (mesmo) |

**Regras da tabela:**

| Regra | Detalhe |
|:---|:---|
| **Coluna 1** | `referencia` gravada na ficha (`TASK-` + 6 dígitos) |
| **Coluna 2** | `titulo_exibicao` completo + `resumo_detalhado` em uma linha |
| **Coluna 3 — Branch** | Nome da branch naquele checkout (`git worktree list` / `git branch --show-current`) |
| **Coluna 4 — Servidor** | `:porta` · URL · `ativo: sim/não` (inventário ao vivo `:8000`–`:8019`; se nenhum Listen → `—` · — · ativo: não) |
| **Coluna 5 — Worktree** | Caminho absoluto da pasta; repo principal → sufixo `(principal)`; worktree extra → pasta irmã; sem pasta local → `—` |
| **Coluna 6 — Sugestão** | Branch + servidor + worktree que o agente recomenda; dono valida ou corrige |
| **Sem worktree extra** | Uma linha (só principal) — não inventar pastas |

**Fechamento obrigatório (uma frase após a tabela):**

> «Valide número, descrição e qual linha seguir (ou corrija branch + worktree + porta). Depois diga **continuar**.»

**Proibido:** tabela sem as 6 colunas; juntar Branch/Servidor/Worktree numa célula só; omitir `ativo` do servidor; aceitar «continuar» sem validação explícita do alvo.

**Detalhe opcional** (só se o dono pedir): classificação canônica (`AREA`, `TIPO`, etc.) — **não** substitui a tabela.

### ETAPA 5 — Só após validação da tabela + «continuar»

**Pré-requisitos (os três):** (1) dono **validou** a tabela (confirmou ou corrigiu número, descrição e linha branch+pasta+porta); (2) agente repetiu o alvo autorizado no chat; (3) dono disse **continuar**.

Aí sim: ler skills, código, executar o pedido técnico **somente** na pasta e branch autorizadas.

**Git (obrigatório):**

- Editar **apenas** na pasta/worktree e branch que o dono escolheu; **proibido** `git checkout` / `git switch` / `git checkout -b` / `git worktree` **salvo** nova ordem explícita do dono.
- Testar **somente** na porta que o dono indicou — **proibido** subir Vite ou assumir preview em outra porta.
- Se o alvo exigir pasta diferente da atual, **parar** e pedir ao dono (não trocar branch sozinho).

---

## Proibido

- Pular registro quando `/novo-agente` foi invocado
- Codar ou explorar repo antes do veredito ETAPA 4
- Veredito em prosa solta, sem tabela de 6 colunas (Modo B/C)
- Modo A: mostrar número, inventário ou ambiente antes do dono descrever a task
- Veredito incompleto (tabela sem número, descrição, servidores atuais ou sugestão)
- Usar `AGT-` ou `TIPO_SESSAO` (ANA, PLN, IMP…)
- Gravar em `documentos-tecnicos/processos/registro-agentes.json` (legado — usar `tasks/registros/`)
- Fingir que renomeou a conversa ou pedir «confirme o rename»
- Listar formatos alternativos (AGT, IMP, citação, markdown)
- Consultar `convencao-titulos-agente.md` ou `registro-agentes.json` (legado)
- `titulo_exibicao` sem prefixo `TASK-{NNNNNN}` ou com número diferente da ficha/registry
- Inventar, copiar ou reutilizar número de task sem ETAPA 0 + gravação (ou reabertura explícita)
- Veredito ou resposta sem `TASK-{NNNNNN}` visível no título ou primeira linha
- `git checkout`, `git switch`, `git checkout -b` ou `git worktree` sem ordem explícita do dono
- Criar branch no `/novo-agente` ou «porque é task nova»
- Assumir `:8000`, branch do disco ou preview sem o dono escolher no inventário (ETAPA 3.5)
- Prosseguir com só «continuar» sem o dono **validar** a tabela (alvo branch+pasta+porta)
