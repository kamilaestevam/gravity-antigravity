# /encerrar-agente — Encerrar task e registrar checklist

> **SSOT:** espelho de `.cursor/commands/encerrar-agente.md` — alterar nos dois lugares.
> **Registry:** `tasks/registros/registro-tasks.json`
> **Fichas:** `tasks/registros/TASK-{NNNNNN}.json`
> **Totais:** `tasks/registros/registro-totais.json`
> **Skill:** `skills/processos/registro-tasks/SKILL.md`

---

## Quando invocado

Ao **terminar** uma task (ou quando o dono pedir fechamento), o agente **PARA** e executa **0 → 6** nesta ordem.

**Entrada opcional na mesma mensagem:**

```
/encerrar-agente {tempo_dono_horas}h teste_local:sim code_review:nao doc_skill:sim qa:nao pr:nao deploy:nao teste_producao:nao
```

Se omitir checklist → perguntar **uma vez** com tabela abaixo (valores: `sim` | `nao` | `nao_aplicavel`).

---

## ETAPA 0 — Identificar a task

1. Ler `tasks/registros/registro-tasks.json`
2. Identificar ficha da sessão atual (`status: ABR`) ou pedir ao dono: «Qual `TASK-NNNNNN`?»
3. Ler `tasks/registros/TASK-{NNNNNN}.json`

Se já `status: RES` → avisar e **parar** (não reencerrar sem confirmação explícita).

---

## ETAPA 1 — Checklist de encerramento (obrigatório)

Preencher **`checklist_encerramento`** — cada item: `"sim"` | `"nao"` | `"nao_aplicavel"`.

| Chave | Descrição | Slash relacionado |
|:---|:---|:---|
| `teste_local` | Testes locais rodados (unitário, funcional, em tela) | `/testes-criar` |
| `code_review` | Code review feito | `/code-review` |
| `doc_skill` | Docs técnicos e/ou skills atualizados | `/docs-skills` |
| `qa` | QA pós-entrega executado | `/qa` |
| `pr` | Pull request aberto ou merge solicitado | `gh pr create` |
| `deploy` | Deploy / migration executado | `/deploy` |
| `teste_producao` | Validado em produção ou staging real | smoke pós-deploy |

Gravar também `*_descricao` em cada item (texto fixo da tabela acima).

---

## ETAPA 2 — Alertas (obrigatório se houver `nao`)

Para **cada item com valor `nao`**, incluir em `checklist_alertas[]`:

```json
{
  "item": "qa",
  "mensagem": "QA não executado — invocar /qa antes de considerar task fechada."
}
```

Entregar bloco ao dono:

```
## Alertas de encerramento

⚠️ qa — QA não executado (esperado: /qa)
⚠️ pr — PR não aberto
…
```

**Regra:** alerta **não bloqueia** o encerramento — o dono pode fechar mesmo assim; alertas ficam registrados para estatística e auditoria.

Itens `nao_aplicavel` → **sem alerta** (ex.: task só de documentação, sem código → `teste_local: nao_aplicavel`).

---

## ETAPA 3 — Tempos e tokens

1. `data_encerramento` ← agora (UTC)
2. Calcular `tempo_bruto_horas` (criação → encerramento)
3. Estimar `tempo_agente_horas` (transcript ou heurística)
4. `tempo_dono_horas` ← informado pelo dono ou na mensagem
5. `tempo_liquido_horas` = agente + dono
6. Estimar `tokens_estimados_*` se ainda vazios

---

## ETAPA 4 — Persistir

1. `status` ← `RES` + `status_descricao` padrão
2. Gravar ficha `TASK-{NNNNNN}.json`
3. Atualizar entrada no índice `registro-tasks.json`
4. **Recalcular** `registro-totais.json` (horas, tokens, **estatisticas_checklist**)

---

## ETAPA 5 — Rename sugerido

```
RES * {tempo_liquido_horas}h | {titulo_exibicao}
```

Instruir: «Renomeie esta conversa para: …»

---

## ETAPA 6 — Veredito final

```
## Task encerrada

**Referência:** TASK-000264
**Checklist:** teste_local sim · code_review nao · doc_skill sim · qa nao · pr nao · deploy nao · teste_producao nao
**Alertas:** 5 item(ns) pendente(s) — ver acima
**Rename:** RES * 2.5h | [BID Frete] LISTA | BUG — Erro abertura cotação
```

---

## Proibido

- Encerrar sem checklist completo (7 itens)
- Omitir alertas quando valor = `nao`
- Esquecer de recalcular `registro-totais.json`
- Valores fora de `sim` | `nao` | `nao_aplicavel`
