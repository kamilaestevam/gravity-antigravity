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

✅ **Só** pode: ler `tasks/registros/registro-tasks.json`, `tasks/README.md`, perguntar classificação, gravar ficha, ler **branch atual** (`git branch --show-current` — só leitura), entregar veredito e **comunicar** `titulo_exibicao` (ver LIMITAÇÃO — agente não renomeia no sidebar).

❌ **`/novo-agente` NÃO cria nem troca branch** — `git checkout`, `git switch`, `git checkout -b`, `git worktree` são **proibidos** neste comando e no veredito.

**Se o dono colocou `/novo-agente` + pedido técnico na mesma mensagem:**

> «Primeiro registro a task (abaixo). Cole o título no sidebar se quiser (clique direito → Renomear). Diga **continuar** — aí executo seu pedido.»

**Não avance para o trabalho até o dono pedir para continuar.**

---

## Formato canônico (v2 — sem TIPO_SESSAO)

```
{AREA}(-{SUBAREA})?(-{VIS})?-{TIPO_ENTREGA}-{RESUMO}
```

| Parte | Obrigatório | Exemplos |
|:---|:---:|:---|
| `AREA` | Sim | `BIDFRT`, `PEDIDO`, `CONFIG`, `CORE`, … |
| `SUBAREA` | Não | `COTACOES`, `ADMIN-TESTES` |
| `VIS` | Não | `LISTA`, `KANBAN`, `DASHBOARD`, `INSIGHTS` |
| `TIPO_ENTREGA` | Sim | `BUG`, `MEL`, `NOV`, `REF`, `AUD`, `CFG`, `DUV` |
| `RESUMO` | Sim | `REMOVER-EXPANDIR-LINHA-COT` |

**Referência:** `TASK-{NNNNNN}` (não usar `AGT-`).

**Exibição (`titulo_exibicao` — único título copiável para o sidebar):**

```
TASK-{NNNNNN} | [{Área legível}] {Vis?} | {TIPO} — {resumo humano}
```

Exemplo: `TASK-000266 | [Admin] Taxas Moeda | NOV — Agendamento cotação atual e futura`

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

## Git e preview — uma pasta, uma branch, um `:8000`

| Regra | Detalhe |
|:---|:---|
| **Uma pasta** | Todos os agentes compartilham `gravity-antigravity` |
| **Uma branch ativa** | O que o `:8000` mostra é **só** a branch **já checkoutada** no disco |
| **Sem branch nova no `/novo-agente`** | Registrar task ≠ criar branch; **nunca** `git checkout -b` neste fluxo |
| **Branch até o PR** | A branch da task em curso fica até merge; **não trocar** sem ordem do dono |
| **Agente novo** | Só grava ficha — **não** abre branch Y; continua na branch que já estava (X ou outra) |
| **Trocar branch** | **Só** se o dono pedir explicitamente (ex.: «crie branch `pr/TASK-000336-…`») — **depois** do «continuar» |
| **Preview** | `http://localhost:8000` — não existe porta automática por task |

**Por quê a tela «muda do nada»:** um agente fez `git checkout` na pasta compartilhada e o `:8000` passou a servir outra branch. **Prevenção:** proibir checkout automático; avisar branch atual no veredito.

---

## Tabelas fechadas (classificação)

### AREA

`LOGIN` · `ONBOARDING` · `ADMIN` · `CONFIG` · `PEDIDO` · `BIDFRT` · `BIDCAM` · `PROCSO` · `FINCOM` · `OUTROS`

### VIS (opcional)

`INSIGHTS` · `LISTA` · `KANBAN` · `DASHBOARD`

### TIPO_ENTREGA

`BUG` · `MEL` · `NOV` · `REF` · `AUD` · `CFG` · `DUV`

---

## Fluxo (0 → 5 — ordem fixa)

### ETAPA 0 — Ler registry

1. Ler `tasks/registros/registro-tasks.json`
2. `proximo_numero` → alocar `TASK-{NNNNNN}`

### ETAPA 1 — Perguntar (se faltou na mensagem)

**Uma pergunta por vez** ou bloco único se o dono preferir resposta única:

1. «**O que você quer fazer nesta task?**» (texto livre)
2. Classificar **AREA** — confirmar com o dono
3. «Tem **subárea**?» (ou pular)
4. «Qual **visualização**?» LISTA / KANBAN / … (ou pular)
5. «É **BUG, MEL, NOV**…?»
6. Derivar **RESUMO** kebab — confirmar

**Atalho** (pula perguntas se válido):

```
/novo-agente BIDFRT LISTA MEL REMOVER-EXPANDIR-LINHA-COT
```

### ETAPA 2 — Montar títulos + `*_descricao`

Todo campo codificado deve ter par `campo` + `campo_descricao` (ver `TASK-000001.json`).

Montar também `resumo_detalhado` (parágrafo do pedido/escopo — o que será feito nesta task).

### ETAPA 3 — Gravar ficha

1. Criar `tasks/registros/TASK-{NNNNNN}.json` (`status: ABR`, `data_criacao` UTC)
2. Atualizar `registro-tasks.json` (`entradas[]`, incrementar `proximo_numero`)
3. **Não** recalcular `registro-totais.json` na abertura (só no `/encerrar-agente`)

### ETAPA 3.5 — Preview hub (alerta `:8000` / porta seguinte)

Após gravar a ficha, executar:

```powershell
npm run agente:preview -- status
```

Incluir no veredito bloco **Alerta preview** (branch atual, `:8000` ativo sim/não, URLs `:8000`–`:8019` em uso; `:8005` API Config e `:8009` GABI reservadas). Se `ALERTA_PREVIEW=1` no stdout, repetir `ALERTA_MSG` **em destaque**.

**Automático (git hook):** `post-checkout` — se `:8000` estava ativo e a branch mudou, preserva a branch **anterior** em `:8001` (ou próxima livre) e emite alerta sonoro + `ALERTA_MSG`.

**Manual:** `npm run agente:preview -- alocar` — próxima porta livre (`8001`, `8002`…).

**Proibido** trocar branch sem o dono saber onde testar — após `git checkout` o agente **deve** informar `:8000` vs `:8001` no chat.

### ETAPA 4 — Veredito de abertura (OBRIGATÓRIO — formato fixo, completo)

**Única saída** antes de trabalhar. **Proibido** resumir só em `Classificação: ADMIN-…` — entregar **todos** os campos abaixo (espelham a ficha gravada).

```
## Task registrada

**Referência:** TASK-000266
**Próximo número:** TASK-000267

### Classificação completa

| Campo | Sigla | Descrição |
|:---|:---|:---|
| Canônico | `ADMIN-TAXAS-MOEDA-NOV-AGENDAMENTO-COTACAO-ATUAL-FUTURA` | Nome máquina (titulo_canonico) |
| Área | `ADMIN` | Painel Admin Gravity (configurador/admin) — telas internas de gestão da plataforma |
| Subárea | `TAXAS-MOEDA` | Módulo Taxas de Moeda — cotações PTAX e projeções BACEN Focus |
| Visualização | — | Não aplicável — tela admin com abas, não é LISTA/KANBAN/DASHBOARD/INSIGHTS |
| Tipo entrega | `NOV` | Nova funcionalidade — controle de agendamento com execução automática |
| Resumo | `AGENDAMENTO-COTACAO-ATUAL-FUTURA` | Agendamento funcional para sincronizar PTAX e Focus |

### Escopo registrado

{resumo_detalhado — parágrafo completo do que será feito, copiado da ficha}

### Ambiente (somente leitura — não alterar branch)

| Campo | Valor |
|:---|:---|
| **Branch atual** | `{git branch --show-current}` |
| **Hub principal** | http://127.0.0.1:8000 |
| **Nome completo (copiar)** | `TASK-000266 | [Admin] Taxas Moeda | NOV — Agendamento cotação atual e futura` |

### Alerta preview (ETAPA 3.5)

| Campo | Valor |
|:---|:---|
| **:8000 ativo** | sim / não |
| **Outros previews** | `:8001` → `pr/TASK-000336` (se houver) |
| **Alerta** | — ou mensagem `ALERTA_MSG` |

**Aviso:** este agente **não** criará branch nova. Se a branch mudar com `:8000` no ar, o hook abre **`:8001`** com a branch anterior.

Diga **continuar** para eu executar seu pedido.
```

**Regras do veredito:**

- Cada linha da tabela = valor real gravado na ficha + `*_descricao` correspondente
- Se `subarea` ou `visualizacao` for `null` → coluna Sigla: `—` e Descrição explica por quê
- `Escopo registrado` = `resumo_detalhado` (não omitir)
- Uma linha copiável com prefixo `TASK-{NNNNNN}`

### ETAPA 5 — Só após «continuar»

Aí sim: ler skills, código, executar o pedido técnico.

**Git (obrigatório):**

- Confirmar branch atual antes de editar; **proibido** `git checkout` / `git switch` / `git checkout -b` / `git worktree` **salvo** ordem explícita do dono na conversa.
- **Após** qualquer `git checkout`: informar no chat URLs de preview (`:8000`, `:8001`…) — hook `post-checkout` pode ter aberto porta seguinte.
- Branch da task em andamento permanece até PR/merge — agente paralelo **não** abre branch própria.

---

## Proibido

- Pular registro quando `/novo-agente` foi invocado
- Codar ou explorar repo antes do veredito ETAPA 4
- Veredito incompleto (só `Classificação:` canônica, sem tabela + escopo + descrições)
- Omitir `resumo_detalhado` no bloco **Escopo registrado**
- Usar `AGT-` ou `TIPO_SESSAO` (ANA, PLN, IMP…)
- Gravar em `documentos-tecnicos/processos/registro-agentes.json` (legado — usar `tasks/registros/`)
- Fingir que renomeou a conversa ou pedir «confirme o rename»
- Listar formatos alternativos (AGT, IMP, citação, markdown)
- Consultar `convencao-titulos-agente.md` ou `registro-agentes.json` (legado)
- `titulo_exibicao` sem prefixo `TASK-{NNNNNN}`
- `git checkout`, `git switch`, `git checkout -b` ou `git worktree` sem ordem explícita do dono
- Criar branch no `/novo-agente` ou «porque é task nova»
