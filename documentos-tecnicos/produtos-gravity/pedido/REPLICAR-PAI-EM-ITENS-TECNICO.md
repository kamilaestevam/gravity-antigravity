# Pedido — Replicar valor do Pai em todos os Itens (Técnico)

> Feature UX para edição inline na linha pai: usuário marca um checkbox no
> popover de edição e o valor do campo é **replicado em todos os itens** do
> pedido na mesma transação backend. Sem o checkbox, mantém comportamento
> divergente (pai diverge dos itens → coluna pai mostra alerta).
>
> **Status:** entregue em 2026-05-13 (commits `8568d412` → `827064e6`).
> Aprovação: Coordenador + Líder Técnico + QA + dono.

---

## 1. Visão geral

```
┌───────────────────────────────────────────────────┐
│ ✏ DATA DO PEDIDO                              ×  │
│                                                   │
│ [09/05/2026                              📅 ]    │
│                                                   │
│ ☐ Aplicar a todos os itens deste pedido          │ ← novo
│                                                   │
│ [Cancelar]  [✓ Confirmar]                         │
└───────────────────────────────────────────────────┘
```

- **Sem o checkbox** (default) → atualiza só o Pedido pai. Os itens mantêm
  seus valores; coluna pai mostra `⚠` se diverge dos itens.
- **Com o checkbox** → atualiza Pedido + **bulk-update em todos os itens**
  na mesma transação. Resultado: pai e itens homogêneos, `⚠` desaparece.

A checkbox aparece **apenas**:
- Na linha **PAI** (não em filho/item)
- Em campos **propagáveis** (whitelist em `mapaPropagacaoPedidoItem.ts`)

---

## 2. Whitelist de campos elegíveis (57 campos)

> **Atualização 2026-05-13 (2ª onda):** whitelist subiu de 22 → 57 campos. Migration `20260513120000_pedido_item_datas_replicaveis` adicionou 35 colunas novas no `PedidoItem` para permitir replicar **TODAS** as datas do Pedido (rascunho, proforma, invoice, etc.).

SSOT: `pedido/shared/mapaPropagacaoPedidoItem.ts` exporta
`MAPA_PROPAGACAO_PEDIDO_ITEM` e `CAMPOS_PEDIDO_PROPAGAVEIS`.

Critério: campo precisa existir **tanto** em `Pedido` quanto em `PedidoItem`
(o item precisa de coluna para receber o valor). Campos pedido-only
(`numero_proforma_pedido`, agregados, IDs) **não** entram.

| Grupo | Pedido → Item |
|---|---|
| **Identidade comercial (5)** | `incoterm_pedido` → `incoterm_item`, `moeda_pedido` → `moeda_item`, `unidade_comercializada_pedido` → `unidade_comercializada_item`, `condicao_pagamento_pedido` → `condicao_pagamento_item`, `data_emissao_pedido` → `data_emissao_item` |
| **Casas decimais (4)** | `casas_decimais_valor_pedido` → `casas_decimais_valor_item`, `casas_decimais_quantidade_pedido` → `casas_decimais_quantidade_item`, `casas_decimais_peso_pedido` → `casas_decimais_peso_item`, `casas_decimais_cubagem_pedido` → `casas_decimais_cubagem_item` |
| **Câmbio (1)** | `cobertura_cambial_pedido` → `cobertura_cambial_item` |
| **Referências (3)** | `referencia_importador_pedido` → `referencia_importador_item`, `referencia_exportador_pedido` → `referencia_exportador_item`, `referencia_fabricante_pedido` → `referencia_fabricante_item` |
| **Datas Pedido Pronto (3)** | `data_prevista/confirmada/meta_pedido_pronto` → `data_prevista/confirmada/meta_item_pronto` |
| **Datas Inspeção (3)** | `data_prevista/confirmada/meta_inspecao_pedido` → `data_prevista/confirmada/meta_inspecao_item` |
| **Datas Coleta (3)** | `data_prevista/confirmada/meta_coleta_pedido` → `data_prevista/confirmada/meta_coleta_item` |
| **Datas Rascunho Pedido (6)** | `data_previsao/confirmacao/meta_recebimento+aprovacao_rascunho_pedido` → `..._item` |
| **Documento Pedido (1)** | `data_documento_pedido` → `data_documento_item` |
| **Datas Proforma (13)** | `data_..._proforma_pedido` → `data_..._proforma_item` (recebimento + aprovação + envio + documento) |
| **Datas Invoice (13)** | `data_..._invoice_pedido` → `data_..._invoice_item` (mesma estrutura da proforma) |
| **Consolidação Pedido (1)** | `data_consolidacao_pedido` → `data_consolidacao_pedido_replicada_item` (coluna separada: `data_consolidacao_item` já tem semântica própria) |
| **Transferência Saldo (1)** | `data_transferencia_saldo_pedido` → `data_transferencia_saldo_item` |
| **TOTAL** | **57 campos** |

**Para escalar a whitelist:** adicionar nova entry em
`MAPA_PROPAGACAO_PEDIDO_ITEM` (e a coluna correspondente já existir em
ambos os models). Nenhuma mudança em código de aplicação necessária.

---

## 3. Arquitetura

### Backend (`processos-core/src/routes/pedidos.ts`)

`editarCampoSchema` aceita campo novo:

```ts
const editarCampoSchema = z.object({
  campo: z.string().min(1),
  valor: z.unknown(),
  replicar_em_itens: z.boolean().optional().default(false),
})
```

`PATCH /api/v1/pedidos/:id/campo` handler:
1. Parse Zod (`replicar_em_itens` default `false`)
2. Valida `campo` na whitelist `CAMPOS_EDITAVEIS`
3. `withOrganizacao(req, async (db) => { ... })` (transação implícita)
4. Atualiza pedido pai (com conversão `String YYYY-MM-DD` → `Date` para campos data — fix 2026-05-13)
5. **Se `replicar_em_itens=true`:**
   - Traduz `campo` legado → DDD pedido → DDD item via `obterCampoItemPropagado()`
   - Se traduzido for `null` → `AppError(400)` (Mandamento 08, sem fallback)
   - `db.pedidoItem.updateMany({ where: {id_pedido, id_organizacao}, data: {[campoItem]: valor} })`
   - Audit log agregado:
     ```json
     { "event": "PEDIDO_FIELD_REPLICATED_TO_ITEMS",
       "id_organizacao", "id_pedido",
       "campo_pedido", "campo_item",
       "itens_afetados", "valor_novo", "ts" }
     ```
6. Catch handler devolve detalhe completo no response (DEV) para debug

### Frontend (`pedido/client/`)

**`shared/api.ts`** — `pedidoVirtualApi.editarCampo` aceita 4° param:
```ts
editarCampo(id, campo, valor, replicar_em_itens = false)
```
Inclui `console.log` diagnóstico (request + response).

**`pages/Pedidos.tsx`** — `handleEditar` propaga opts e atualiza cache local:
- Recebe `opts?: { replicar_em_itens?: boolean }`
- Quando `replicar=true && isPropagavel(campo)`:
  - **Atualiza cada item no cache** (`itensCarregadosRef`) com o novo valor
  - `calcularDivergencias` recomputa → `_divergente=false`
  - `setPedidos` propaga itens atualizados na linha
- Passa `permiteReplicacaoPaiEmItens={isPropagavel}` ao `TabelaVirtualGlobal`

### Núcleo global (`nucleo-global/Tabelas/tabela-virtual-global/`)

**`hooks/useGTInlineEdit.ts`** — `confirmarEdicao(opts?)` recebe opts e propaga para `onEditar`.

**`tipos.ts`:**
- `onEditar` tipado com `opts?: { replicar_em_itens?: boolean }`
- Nova prop `permiteReplicacaoPaiEmItens?: (campo: string) => boolean`

**`TabelaVirtualGlobal.tsx`** — `GTEditPopover`:
- Estado local `replicarEmItens` (default `false`)
- Helper `confirmarComOpts = () => onConfirmar({ replicar_em_itens: replicarEmItens })`
- Substitui `onConfirmar()` por `confirmarComOpts()` em todas as chamadas
- Checkbox renderizado quando `mostrarCheckboxReplicar` (linha pai + permite(campo))
- Footer Cancelar/Confirmar visível mesmo em `isOpcoes` quando há checkbox
- Click em opção (modo `isOpcoes`) **apenas seleciona** quando há checkbox — usuário decide se replica e confirma manualmente

---

## 4. Mandamentos atendidos

| Mand. | Como |
|---|---|
| **02** (schema intocável) | Zero mudança em `schema.prisma` |
| **06** (Zod) | `editarCampoSchema` estendido bilateral (front + back) |
| **07** (sincronia front+back) | 1 commit cobre Zod + ACL + hook + popover |
| **08** (sem fallback silencioso) | Campo fora da whitelist → `AppError(400)` ruidoso |
| **09** (Zod bilateral) | API client envia `replicar_em_itens`; Zod backend espelha |

---

## 5. Testes

`testes/testes-unitarios/pedido/replicar-pai-em-itens.test.ts` — **26 testes**:

- `obterCampoItemPropagado`: 9 casos (DDD ok, pedido-only null, agregados null, ID null, inexistente null)
- `isPropagavel`: 6 casos (DDD aceito, legado aceito, pedido-only rejeitado, agregados rejeitados, IDs rejeitados, vazio rejeitado)
- `CAMPOS_PEDIDO_PROPAGAVEIS` contrato: 4 casos (consistência com mapa, sufixos `_item`, sem `_pedido` em destinos, cobertura 5 críticos)
- Cenários end-to-end simulados: 7 casos (incoterm, condicao_pagamento, referencias, valor null, data, milestones)

---

## 6. Bugs pré-existentes corrigidos de quebra

### Bug 1 — `updateMany` nunca funcionou (silencioso)
Antes:
```ts
if (isPropagavel(campo)) {
  await db.pedidoItem.updateMany({
    where: { id_pedido, id_organizacao },
    data: { [campo]: valor },  // ← BUG: 'incoterm' não é coluna do item
  })
}
```
A coluna real é `incoterm_item`. Prisma rejeitava silenciosamente; propagação nunca aconteceu apesar de `isPropagavel` retornar `true`.

Agora a tradução `obterCampoItemPropagado()` gera o nome correto.

### Bug 2 — Date-only crashava o Prisma
Frontend envia `'YYYY-MM-DD'`, Prisma `DateTime` exige ISO-8601 completo:
> `Invalid db.pedido.update() invocation: Premature end of input. Expected ISO-8601 DateTime.`

Manifestava-se em qualquer edição de campo de data. Backend agora converte `string YYYY-MM-DD` → `new Date(valor)` antes de passar pro Prisma (com validação `isNaN` que lança `AppError 400`).

### Bug 3 — Cache local stale após replicação
Backend atualizava items via `updateMany`, mas o frontend cache (`itensCarregadosRef`) mantinha valores antigos. Resultado: a flag `⚠ divergente` persistia visualmente até o user expandir + refetch.

Frontend agora atualiza cada item no cache com o novo valor após `replicar=true && isPropagavel(campo)`.

---

## 7. Ressalvas e bandeiras

1. **Sem suite funcional HTTP do `processos-core`** — testes funcionais da rota PATCH `/campo` seriam ideais mas a suite não existe. Mesmo gap que existe em outras entregas. Recomendação: criar a suite separadamente.
2. **Sem modal de confirmação para >5 itens** — Coordenadora sugeriu mas não foi implementado nesta entrega. Pode ser melhoria iterativa.
3. **Sem undo nativo** — após replicação, não há "desfazer em lote". Usuário precisaria editar 1-a-1 cada item. UX explícito: tooltip no checkbox poderia avisar.
4. **Audit log via `console.log`** — funcional mas não estruturado em tabela de audit. Trade-off conhecido; pode evoluir.
5. **PATCH `/campo` ainda não valida Incoterm contra `cadastros.incoterm`** — a validação cruzada (Mandamento 06+09) existe em PUT `/pedidos/:id` e PUT `/itens/:id` mas não no PATCH inline. Pode ser adicionada como tarefa pequena.

---

## 8. Como escalar para novos campos

1. Adicionar entry em `MAPA_PROPAGACAO_PEDIDO_ITEM` (`pedido/shared/mapaPropagacaoPedidoItem.ts`)
2. Garantir que a coluna existe **tanto** em `Pedido` quanto em `PedidoItem` no schema
3. Pronto. O front (via `isPropagavel(campo)`) e backend (via `obterCampoItemPropagado()`) reconhecem automaticamente. Sem outra mudança necessária.

---

## 9. Histórico

- **2026-05-13** — Entrega inicial (commit `8568d412`) + 4 fixes:
  - `c7695527` log diag frontend
  - `db94e7fb` log diag backend
  - `7331a4f9` date-only → Date object
  - `827064e6` atualiza cache local após replicar
- **2026-05-13 (2ª onda)** — Escalada para TODAS as datas:
  - Migration `20260513120000_pedido_item_datas_replicaveis`: +35 colunas em `PedidoItem`
  - Mapa estendido (+35 entries), aliases legados atualizados
  - Helper `criarColunaDataReplicavel(t, campo, label)` em `ColunasPai.tsx`: 43 datas migradas para pattern unificado (`renderAgregado` + checkbox replicar)
  - Whitelist: 22 → 57 campos
  - Testes: 26 → 32 (cobertura das 35 novas entries)
- Aprovação: Coordenador + Líder Técnico + QA + dono visual.
