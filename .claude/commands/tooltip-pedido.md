# /tooltip-pedido — Consultor de tooltips da Lista de Pedidos

> **Atalho de consulta.** Não implementa código nem altera matriz — orienta o dono na escolha de **título** e **pills (tags)** por coluna, com base no código vigente.

**Docs:** [`LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md` §0](../../documentos-tecnicos/produtos-gravity/pedido/LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md) · [`LISTA-EDITAR-SALVAR-TECNICO.md` §6](../../documentos-tecnicos/produtos-gravity/pedido/LISTA-EDITAR-SALVAR-TECNICO.md)

---

## Quando invocado

O agente **PARA** qualquer outra tarefa e executa as etapas abaixo **nesta ordem**, sem pular.

Se a mensagem do dono citar uma **coluna** (nome, label ou `key` Prisma), incluir a **ETAPA 4** (conclusão). Se não citar coluna, entregar só o catálogo (ETAPAs 1–3).

---

## ETAPA 1 — Ler SSOT no código (obrigatório)

Ler **antes** de responder:

1. `servicos-global/produto/pedido/client/src/shared/pillsTooltipColunaLista.ts` — `RegraPillId`, `ORDEM_PILLS_PEDIDO`, `ORDEM_PILLS_ITEM`, `MAPA_REGRA_PILLS`, overrides por `key`
2. `servicos-global/produto/pedido/client/src/shared/regrasTooltipColunaLista.ts` — `classificarRegraTooltipColuna`, `CHAVES_COLUNA_DINAMICA_PEDIDO_ITEM`
3. `servicos-global/produto/pedido/client/src/shared/buildTooltipRegraLista.tsx` — `isLinhaItemLista`, `tooltipNivelCelula`, `tituloTooltipColuna`, títulos por célula
4. `nucleo-global/Tabelas/tabela-virtual-global/src/tooltipCelulaResolver.ts` — SSOT núcleo (título + descrição pelo mesmo nível)
5. `nucleo-global/Utilidades/Localization/locales/pt.json` — bloco `pedido.lista.regras_pill.*` e títulos em `pedido.coluna_pai.*_titulo*`
6. `servicos-global/produto/pedido/client/src/shared/columnBehaviorConfig.ts` — `editavel`, alertas, somável (para conclusão)

---

## ETAPA 2 — Catálogo de TÍTULOS (sempre exibir)

### Regra padrão (framework 01/02)

| Nível | Padrão do título | Exemplo |
|-------|------------------|---------|
| **Linha pedido** (cabeçalho + célula pai) | `{Nome da coluna} do Pedido` | Moeda do Pedido |
| **Linha item** (célula filho expandido) | `{Nome da coluna} do Item` | Moeda do item |

### SSOT pedido vs item (obrigatório em colunas dual/piloto)

1. **`isLinhaItemLista(row)`** — única heurística no Pedido (`_p` > `pedido_id` > `part_number` > `moeda_item` > `numero_pedido`).
2. **`tooltipNivelCelula(row)`** — injetado pelo enricher; núcleo usa em título **e** descrição base.
3. **`tooltipTituloCelula(row)`** — título final (sem parâmetro `isFilho`).
4. **`tooltipDescricaoCelula(row)`** — pills do mesmo nível.

**Anti-padrão:** título «do Pedido» + pill «Editável no item» → falta `tooltipNivelCelula` ou `isLinhaItemLista` errado.

### Como o código resolve o título hoje

| Prioridade | Fonte | Quando |
|------------|-------|--------|
| 1 | `tooltipTituloCelula(row)` via `tituloTooltipCelulaLista` | Colunas dual/piloto com `tooltipNivelCelula` |
| 2 | `tooltipTituloItem` / `tooltipTitulo` | Fallback no núcleo (`tooltipCelulaResolver.ts`) conforme `tooltipNivelCelula` |
| 3 | i18n `pedido.coluna_pai.{key}_titulo_linha_pedido` | Cabeçalho/tooltip pedido (se existir) |
| 4 | `tituloTooltipColuna` → `label` da coluna em `ColunasPai` | Fallback — **ainda não segue** `{Coluna} do Pedido/Item` |

**Chaves i18n de título já mapeadas (piloto):**

- `moeda_pedido` → pedido: `moeda_pedido_titulo_linha_pedido` · item: `moeda_item_titulo`
- `valor_total_pedido` → pedido: `valor_total_pedido_titulo_linha_pedido` · item: `valor_total_item_titulo`
- `valor_por_unidade_item` → pedido: `valor_unitario_item_titulo_linha_pedido` · item: `valor_unitario_item_titulo`

**Recomendação ao dono (nova coluna):** criar par i18n `{key}_titulo_linha_pedido` = `"{Label} do Pedido"` e `{key}_item_titulo` ou `moeda_item_titulo` = `"{Label} do Item"`; registrar em `tituloTooltipCelulaPorColuna` até generalizar o fallback.

---

## ETAPA 3 — Catálogo de TAGS / PILLS (sempre exibir)

### Ordem canônica — LINHA PEDIDO (slots 1–7)

Exibir na resposta **nesta ordem**, com o **rótulo PT** de `pedido.lista.regras_pill.{id}`:

| Slot | IDs (`RegraPillId`) | Rótulo UI (pt.json) |
|------|---------------------|---------------------|
| 1 — Bloqueado | `bloqueado_edicao`, `bloqueado_valor_item`, `somente_leitura`, `itens_bloqueados_pedido`, `so_operacao` | Bloqueado para edição / Somente leitura / etc. |
| 2 — Total/somatória | `calculado_pedido`, `calculado_pedido_qtd_pronta`, `valor_total_soma_mesma_moeda`, `valor_unitario_sem_somatoria`, `soma_mesma_unidade`, `valor_total_item_formula` | Total do pedido / sem somatória / fórmula… |
| 3 — Editável pedido | `editavel_pedido`, `editavel_pedido_numero`, `editavel_atualiza_pedido` | Editável no pedido |
| 4 — Replicar | `replica_itens`, `replica_itens_auto` | Aplicar em todos os itens / Replica em todos os itens |
| 5 — Editável item (no bloco pedido) | `editavel_item`, `editavel_nos_itens` | Editável no item / Editável nos itens |
| 6 — Alerta | `alerta_divergencia`, `alerta_moeda_divergente` | Alerta se itens divergirem / Alerta se tipo de moeda se divergem |
| 7 — Condição | `cond_import_export` | Depende de Importação ou Exportação |

**Pills extras** (fora dos 7 slots — usar quando a regra exigir, após ordenação canônica):  
`formula_config`, `casas_decimais_config`, `coluna_personalizada`, `espelhado_workspace`, `espelhado_importador`, `espelhado_logistica_pedido`, `espelhado_logistica_item`, `espelhado_logistica_bidirecional`

> **Colunas anexo na lista (`anexo_*`):** regra `pai_anexo` usa pills **`editavel_pedido`** / **`editavel_item`** (dual). A pill `anexo` permanece no vocabulário legado, mas **não** é emitida nas colunas padrão desde 2026-06-09.

**Metadados no tooltip (não são pills coloridas):** `ghost_sem_checkbox`, `numero_unico_org`, `link_configurador`, `mais_regras`

### Ordem canônica — LINHA ITEM (slots 1–3)

| Slot | IDs | Rótulo UI |
|------|-----|-----------|
| 1 — Bloqueado | `bloqueado_edicao`, `bloqueado_valor_item`, `somente_leitura`, `itens_bloqueados_pedido`, `so_operacao` | (mesmos do pedido) |
| 2 — Editável item | `editavel_item`, `editavel_nos_itens` | Editável no item / Editável nos itens |
| 3 — Alerta | `alerta_divergencia`, `alerta_moeda_divergente` | Alertas de divergência |

**Extras no item:** `valor_total_item_formula`, `formula_config`, `cond_import_export`, `coluna_personalizada`

### Aviso amarelo (opcional, abaixo das pills)

Não é pill — texto livre (`avisoImpacto` / `AvisoImpactoEdicao`). Exemplos no código:

- `pedido.coluna_pai.aviso_impacto_moeda`
- `pedido.lista.regras_coluna.valor_unitario_item_impacto_moeda`
- `pedido.lista.regras_coluna.valor_item_impacto_moeda`

---

## ETAPA 4 — Conclusão para a coluna citada (se houver)

Quando o dono nomear uma coluna, o agente DEVE:

1. Resolver `key` da coluna (grep em `ColunasPai.tsx` / `ColunasFilho.tsx` se necessário).
2. Ler `classificarRegraTooltipColuna(key)` → `RegraTooltipId`.
3. Ler pills atuais: `obterPillsTooltipColuna(key)` e `pillsParaNivelColuna(key, 'pai'|'item')`.
4. Cruzar com `columnBehaviorConfig` (`getEditavelItem`, `hasAlerta`, `isSomavel`, `ALERTA_OVERRIDE`, `ITEM_EDITAVEL_OVERRIDE`).
5. Entregar **Conclusão** neste formato fixo:

```
### Coluna: {label} (`{key}`)

**Título pedido:** {texto recomendado} — i18n sugerido: `pedido.coluna_pai.{key}_titulo_linha_pedido`
**Título item:** {texto recomendado} — i18n sugerido: `pedido.coluna_pai.{key}_item_titulo`

**Pills pedido (recomendadas):** [id1, id2, …] — {justificativa em 1 frase}
**Pills item (recomendadas):** [id1, id2, …] — {justificativa em 1 frase}

**Aviso amarelo:** sim/não — {texto ou chave i18n}

**Estado no código hoje:** pills pedido […] · pills item […] · diverge da recomendação? sim/não

**Próximo passo:** aguardar OK do dono → atualizar `MAPA_REGRA_PILLS` / overrides em `pillsTooltipColunaLista.ts` + i18n + doc § da coluna em `LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md`
```

### Árvore de decisão rápida (conclusão)

| Situação no código | Pills pedido típicas | Pills item típicas |
|--------------------|----------------------|-------------------|
| Só pedido edita, replica auto (TOP, workspace) | `editavel_pedido` + `replica_itens_auto` ou `somente_leitura` no item | `somente_leitura` |
| Pedido edita + checkbox replicar + alerta (Incoterm, Ref.) | `editavel_pedido`, `replica_itens`, `alerta_divergencia` | `editavel_item`, `alerta_divergencia` |
| Calculado no pedido, editável no item (qtd, peso) | `calculado_*`, `bloqueado_edicao`, `alerta_*` | `editavel_item` |
| Moeda / valor com impacto cruzado | ver piloto `PILLS_PEDIDO_MOEDA` / `PILLS_ITEM_MOEDA` | item só `editavel_item` + aviso amarelo |
| Logística espelhada | `editavel_pedido`, `editavel_item`, `espelhado_logistica_bidirecional` | revisar se item deve ter só subset (pendente dono) |
| Ghost descrição/NCM | `editavel_pedido`, `replica_itens`, `editavel_item` | em migração — dono define |

**Não implementar** neste comando — só orientar. Implementação exige OK explícito do dono.

---

## ETAPA 5 — Formato da resposta ao dono

Resposta **estruturada**, nesta ordem:

1. **Títulos** — tabela pedido vs item (padrão + piloto i18n)
2. **Tags pedido** — lista numerada slots 1–7 + extras
3. **Tags item** — lista numerada slots 1–3 + extras
4. **Avisos amarelos** — quando usar
5. **Conclusão** — só se coluna citada (ETAPA 4)

Tom: direto, português, sem implementar código nesta invocação.

---

## Histórico

| Data | Evento |
|------|--------|
| 2026-06-07 | Comando criado a pedido do dono — consultor tooltip lista Pedido |
