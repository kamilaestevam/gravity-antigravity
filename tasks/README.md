# Tasks — Registro de sessões com agente

Este diretório guarda **todas as tasks** (conversas de trabalho com agente de IA) do projeto Gravity, com numeração sequencial, tempos, tokens e checklist de entrega.

Qualquer pessoa — dev, QA ou gestor — pode ler os JSON aqui e entender **o que foi feito**, **quanto tempo levou** e **o que ficou pendente**.

---

## O que é uma task?

Uma **task** = **uma conversa** no Cursor (ou Claude Code) dedicada a um objetivo concreto.

| Conceito | Exemplo |
|:---|:---|
| Referência | `TASK-000001` |
| Nome legível | `[BID Frete] \| DOC — Onboarding, planilha DDD e plano refatoração` |
| Encerrada | `RES * 2.0h \| [BID Frete] \| DOC — Onboarding…` |

**Números:** `TASK-000001` … `TASK-000005` = cinco conversas mais antigas já fichadas (retroativo). Sessões 6–263 existem no Cursor mas ainda **sem ficha**. Novas tasks a partir de **`TASK-000264`**.

---

## Estrutura de pastas

```
tasks/
├── README.md                 ← este arquivo (explicação geral)
└── registros/
    ├── registro-tasks.json   ← índice de todas as tasks (lista resumida)
    ├── registro-totais.json  ← totais agregados (horas, tokens, checklist)
    ├── TASK-000001.json      ← ficha completa da task 1
    ├── TASK-000002.json
    └── …
```

| Arquivo | Função |
|:---|:---|
| `registro-tasks.json` | Catálogo — busca rápida, próximo número, ponteiro para cada ficha |
| `registro-totais.json` | Soma de tasks, período, tokens, horas e estatísticas do checklist |
| `TASK-NNNNNN.json` | Detalhe completo de **uma** sessão |

**Documentação técnica** (tabelas de área, subárea, fluxos): `documentos-tecnicos/tasks/registro-tasks-agente.md` *(quando publicado)*.

**Skill do agente** (como abrir/fechar task): `skills/processos/registro-tasks/SKILL.md` *(quando publicado)*.

**Comandos no chat:** ver seção [Comandos — início, encerramento e reinício](#comandos--início-encerramento-e-reinício) abaixo.

---

## Comandos — início, encerramento e reinício

### 1. Iniciar task (nova conversa)

Abra um **chat novo** no Cursor e envie **somente** (ou com atalho de classificação):

```
/novo-agente
```

**Regra:** o agente **para tudo**, classifica, grava `TASK-NNNNNN`, comunica **um** `titulo_exibicao` — **só depois** executa seu pedido técnico (após «continuar»).

Se colocar pedido + `/novo-agente` na mesma mensagem → registro **primeiro**, código **depois** de «continuar».

**Rename no sidebar:** o agente **não consegue** renomear a conversa no Cursor (sem API). Duas opções:

1. **Auto-título** — na **primeira mensagem** do chat novo, inclua o título legível com número:
   ```
   /novo-agente ADMIN TAXAS-MOEDA NOV AGENDAMENTO — TASK-000266 | [Admin] Taxas Moeda | NOV — Agendamento cotação
   ```
2. **Manual** — clique direito no chat → Renomear → cole a linha **Copiar como nome da conversa** do veredito.

**Atalho** (se já souber a classificação):

```
/novo-agente BIDFRT LISTA BUG ERRO-ABERTURA-COTACAO
/novo-agente ADMIN TESTES LISTA MEL REGISTRY-PLANOS
```

**Veredito de abertura (obrigatório):** após gravar a ficha, o agente entrega tabela **Classificação completa** (canônico, área, subárea, visualização, tipo, resumo — cada um com descrição), bloco **Escopo registrado** (`resumo_detalhado`) e linha **Copiar como nome da conversa** com `TASK-NNNNNN | …`. Não basta uma linha `Classificação: ADMIN-…`.

---

### 2. Reiniciar (nova task ou retomar)

| Situação | O que fazer |
|:---|:---|
| **Nova task** (assunto diferente) | Chat **novo** → `/novo-agente` (gera próximo `TASK-NNNNNN`) |
| **Mesma task, chat perdido** | Chat novo → `/novo-agente` **não** — localizar ficha `ABR` em `registros/` ou informar `TASK-NNNNNN` ao agente |
| **Pausar e voltar depois** | `/encerrar-agente` com status manual `SUS` *(futuro)* ou deixar `ABR` e retomar no mesmo chat |
| **Task errada aberta** | Não encerrar; abrir chat novo com `/novo-agente` para task correta |

**Regra:** cada `/novo-agente` consome **um** número sequencial. Não invoque de novo na mesma task só para “reiniciar” o agente — continue no mesmo chat.

---

### 3. Encerrar task (fim da conversa)

Quando terminar o trabalho:

```
/encerrar-agente
```

O agente pergunta checklist (`sim` / `nao` / `nao_aplicavel`), tempos e gera alertas para itens `nao`.

**Atalho completo:**

```
/encerrar-agente 0.5h teste_local:sim code_review:sim doc_skill:nao qa:nao pr:sim deploy:nao teste_producao:nao
```

| Item | Slash relacionado |
|:---|:---|
| `teste_local:sim` | `/testes-criar` |
| `code_review:sim` | `/code-review` |
| `doc_skill:sim` | `/docs-skills` |
| `qa:sim` | `/qa` |
| `pr:sim` | PR no GitHub |
| `deploy:sim` | `/deploy` |
| `teste_producao:sim` | smoke staging/prod |

**Depois:** renomeie a conversa:

```
RES * {tempo_liquido}h | {titulo_exibicao}
```

Exemplo: `RES * 2.5h | [BID Frete] LISTA | BUG — Erro abertura cotação`

---

### 4. Comandos auxiliares (durante a task)

Não abrem/fecham task — usam-se **dentro** da sessão:

| Comando | Uso |
|:---|:---|
| `/resposta-curta` | Resposta objetiva, sem entrega longa |
| `/comando-inicial-padrao` | Diagnóstico + plano antes de codar |
| `/testes-criar` | Criar/rodar plano de testes |
| `/code-review` | Review antes do PR |
| `/docs-skills` | Atualizar docs e skills |
| `/qa` | Revisão QA pós-entrega |
| `/deploy` | Deploy ou migration |

Marque o que foi feito no **`/encerrar-agente`** (checklist).

---

### 5. Git — guardar registros no repositório

Após o agente atualizar `tasks/registros/`:

```powershell
cd c:\Users\danie\gravity-antigravity

git checkout -b feat/tasks-registro-agente

git add tasks/
git add .claude/commands/novo-agente.md .claude/commands/encerrar-agente.md
git add .cursor/commands/novo-agente.md .cursor/commands/encerrar-agente.md
git add CLAUDE.md

git commit -m "feat(tasks): registro de sessões agente, comandos e fichas 001-005"

git push -u origin feat/tasks-registro-agente

gh pr create --title "feat(tasks): registro de sessões agente" --body "## Summary
- Pasta tasks/registros com TASK-000001 a 000005 (retroativo real)
- Comandos /novo-agente e /encerrar-agente (Claude + Cursor)
- registro-totais, checklist sim/nao, README explicativo

## Test plan
- [ ] /novo-agente em chat novo aloca TASK-000264
- [ ] /encerrar-agente grava checklist e alertas
- [ ] registro-totais.json recalculado"
```

---

## Comandos no chat (resumo)

| Comando | Quando usar |
|:---|:---|
| `/novo-agente` | **Início** da conversa — aloca número, classifica, sugere nome |
| `/encerrar-agente` | **Fim** da conversa — checklist, alertas, tempos, rename `RES *` |

---

## Como ler uma ficha (`TASK-NNNNNN.json`)

### Identificação

| Campo | Significado |
|:---|:---|
| `referencia` | ID único imutável (`TASK-000001`) |
| `ordinal` | Ordem entre as fichadas (1, 2, 3…) |
| `id_transcript` | UUID da conversa no Cursor (rastreio local) |
| `titulo_canonico` | Nome máquina: `{AREA}-{TIPO}-{RESUMO}` |
| `titulo_exibicao` | Nome para renomear a conversa: `TASK-NNNNNN \| [Área] … \| TIPO — resumo` |
| `resumo` | Palavras-chave curtas (kebab UPPER) |
| `resumo_descricao` | Frase curta do objetivo |
| `resumo_detalhado` | Parágrafo completo do que aconteceu |

### Classificação

Cada sigla tem um campo `*_descricao` logo abaixo explicando o valor.

| Campo | Valores | O que é |
|:---|:---|:---|
| `status` | `ABR`, `RES`, `SUS`, `CAN` | Aberta, resolvida/arquivada, suspensa, cancelada |
| `area` | `LOGIN`, `CONFIG`, `PEDIDO`, `BIDFRT`, `BIDCAM`, `SMTRD`, `CORE`, … | Produto ou módulo principal |
| `subarea` | ex.: `TESTES`, ou `null` | Sub-módulo (`admin/testes`) |
| `visualizacao` | `LISTA`, `KANBAN`, `DASHBOARD`, `INSIGHTS`, ou `null` | Tipo de tela |
| `tipo_entrega` | `BUG`, `MEL`, `NOV`, `DOC`, `CFG`, `AUD`, `DUV` | Natureza do trabalho |

### Tempos (em horas, decimal)

| Campo | Significado |
|:---|:---|
| `data_criacao` / `data_encerramento` | Abertura e fechamento (ISO UTC) |
| `tempo_bruto_horas` | Relógio de parede (abertura → encerramento) |
| `tempo_agente_horas` | Tempo estimado de geração do agente |
| `tempo_dono_horas` | Tempo estimado de leitura/escrita do humano |
| `tempo_liquido_horas` | **agente + dono** — vira o `XXX` em `RES * XXXh` |
| `duracao_horas` | Tempo efetivo de trabalho |

### Tokens

| Campo | Significado |
|:---|:---|
| `tokens_estimados_entrada` | Mensagens e contexto enviados |
| `tokens_estimados_saida` | Respostas geradas pelo agente |
| `tokens_estimados_total` | Soma (estimativa a partir do transcript) |

### Checklist de encerramento

Ao fechar com `/encerrar-agente`, cada etapa do processo de entrega é marcada:

| Item | O que confirma |
|:---|:---|
| `teste_local` | Testes locais rodados (`/testes-criar`) |
| `code_review` | Review feito (`/code-review`) |
| `doc_skill` | Docs/skills atualizados (`/docs-skills`) |
| `qa` | QA executado (`/qa`) |
| `pr` | Pull request aberto |
| `deploy` | Deploy/migration (`/deploy`) |
| `teste_producao` | Validado em staging/produção |

**Valores possíveis:** `sim` · `nao` · `nao_aplicavel`

- **`nao`** → gera **alerta** em `checklist_alertas[]` (não bloqueia o fechamento)
- **`nao_aplicavel`** → etapa não faz sentido para aquela task (ex.: task só de config do editor)

Estatísticas agregadas ficam em `registro-totais.json` → `estatisticas_checklist`.

### Outros

| Campo | Significado |
|:---|:---|
| `fases_concluidas` | Etapas do processo na sessão (`ENTENDIMENTO`, `CODIGO`, `TESTE`, …) |
| `entregas` | Lista do que foi produzido (arquivos, docs, ajustes) |
| `checklist_alertas` | Pendências registradas no encerramento |

---

## Ciclo de vida resumido

```
1. /novo-agente          → TASK-NNNNNN, status ABR, nome da conversa
2. Trabalho na sessão    → código, testes, docs (slash commands à parte)
3. /encerrar-agente      → checklist, alertas, tempos, status RES
4. Renomear conversa     → RES * {liquido}h | {titulo_exibicao}
```

**Importante:** `/resposta-curta`, `/testes-criar`, `/qa`, `/deploy` etc. são **ações dentro** da task — não são tipos de task. O checklist só **registra** se foram feitos ao encerrar.

---

## `registro-totais.json` em uma linha

Sempre atualizado ao abrir/fechar tasks:

- **total_tasks** — quantas fichas existem vs. sessões legado no Cursor  
- **total_periodo** — da task mais antiga à mais recente fichada  
- **total_tokens** / **total_horas** — somas de todas as fichas  
- **estatisticas_checklist** — quantos `sim` / `nao` / `nao_aplicavel` por etapa  
- **total_alertas_registrados** — pendências acumuladas  

---

## O que NÃO fica aqui

| Dado | Onde fica |
|:---|:---|
| Transcript bruto (mensagens) | Cursor local (`agent-transcripts/`) |
| Nome visual da aba no Cursor | Você renomeia manualmente na UI |
| Código do produto | Monorepo (`produtos/`, `servicos-global/`, …) |

---

## Manutenção

- **Recalcular totais** após qualquer edição manual em `TASK-*.json` ou via `/encerrar-agente`.
- **Nunca reutilizar** um número `TASK-NNNNNN` já emitido.
- **Backfill** das sessões 6–263: futuro — uma ficha por conversa histórica, na ordem cronológica.

---

## Exemplo rápido

Abra `registros/TASK-000001.json` — primeira sessão real (24/04/2026): onboarding, planilha DDD, plano BID Frete, documentação e revisão de skills, **sem** QA/PR/deploy (alertas registrados).
