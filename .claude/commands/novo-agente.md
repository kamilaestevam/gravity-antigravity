# /novo-agente — Registrar task (OBRIGATÓRIO antes de qualquer trabalho)

> **SSOT:** espelho de `.cursor/commands/novo-agente.md` — alterar nos dois lugares.
> **Guia:** `tasks/README.md`
> **Registry:** `tasks/registros/registro-tasks.json`
> **Fichas:** `tasks/registros/TASK-{NNNNNN}.json`

---

## REGRA ZERO — BLOQUEIO ABSOLUTO (primeira coisa, sempre)

Se a mensagem contém **`/novo-agente`**, o agente **NÃO PODE** — nesta mesma resposta nem antes do veredito da ETAPA 6:

❌ Ler arquivos de código do produto  
❌ Grep / busca no codebase  
❌ Escrever ou editar código  
❌ Disparar subagentes (Explore, etc.)  
❌ Responder o pedido técnico do dono (bug, feature, análise)  
❌ Ler skills de produto (pedido, bid-frete, UX…)  

✅ **Só** pode: ler `tasks/registros/registro-tasks.json`, `tasks/README.md`, perguntar classificação, gravar ficha, entregar veredito e pedir rename.

**Se o dono colocou `/novo-agente` + pedido técnico na mesma mensagem:**

> «Primeiro registro a task (abaixo). **Renomeie a conversa** com o título indicado. Depois me confirme ou peça para continuar — aí executo seu pedido.»

**Não avance para o trabalho até o dono confirmar o rename ou pedir para continuar.**

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

**Exibição (rename no Cursor):**

```
[{Área legível}] {Vis?} | {TIPO} — {resumo humano}
```

Exemplo: `[BID Frete] LISTA | MEL — Remover expandir linha COT`

---

## Tabelas fechadas (classificação)

### AREA

`LOGIN` · `ONBOARDING` · `ADMIN` · `CONFIG` · `PEDIDO` · `BIDFRT` · `BIDCAM` · `PROCSO` · `FINCOM` · `OUTROS`

### VIS (opcional)

`INSIGHTS` · `LISTA` · `KANBAN` · `DASHBOARD`

### TIPO_ENTREGA

`BUG` · `MEL` · `NOV` · `REF` · `AUD` · `CFG` · `DUV`

---

## Fluxo (0 → 6 — ordem fixa)

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

### ETAPA 3 — Gravar ficha

1. Criar `tasks/registros/TASK-{NNNNNN}.json` (`status: ABR`, `data_criacao` UTC)
2. Atualizar `registro-tasks.json` (`entradas[]`, incrementar `proximo_numero`)
3. **Não** recalcular `registro-totais.json` na abertura (só no `/encerrar-agente`)

### ETAPA 4 — Rename (OBRIGATÓRIO informar)

Entregar em destaque:

```
⚠️ RENOMEIE ESTA CONVERSA AGORA:
[{Área}] {Vis?} | {TIPO} — {resumo}
```

### ETAPA 5 — Veredito (formato fixo — única saída antes de trabalhar)

```
## Task registrada — aguardando rename

**Referência:** TASK-000264
**Título canônico:** BIDFRT-LISTA-MEL-REMOVER-EXPANDIR-LINHA-COT
**Rename obrigatório:** [BID Frete] LISTA | MEL — Remover expandir linha COT
**Próximo número:** TASK-000265

Confirme o rename (ou diga "continuar") para eu executar seu pedido.
```

### ETAPA 6 — Só após confirmação

Aí sim: ler skills, código, executar o pedido técnico.

---

## Proibido

- Pular registro quando `/novo-agente` foi invocado
- Codar ou explorar repo antes do veredito ETAPA 5
- Usar `AGT-` ou `TIPO_SESSAO` (ANA, PLN, IMP…)
- Gravar em `documentos-tecnicos/processos/registro-agentes.json` (legado — usar `tasks/registros/`)
- Omitir instrução de rename
