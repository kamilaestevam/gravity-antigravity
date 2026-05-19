# Plano de Testes Unitarios — Editar e Salvar Inline (Lista de Pedidos)

**ID:** TST-UNI-PEDIDO-EDITAR-SALVAR-001
**Data:** 2026-05-17
**Versao:** 1.0
**Criticidade:** alta
**Cobertura minima:** 70%
**Ambiente:** `@vitest-environment node` (config) + `@vitest-environment jsdom` (hook/render)

---

## Resumo Executivo

Plano de teste unitario para edicao inline e salvamento na Lista de Pedidos. Cobre 4 camadas: (1) columnBehaviorConfig — classificacao de TODOS os campos por tipo, APIs getEditavel/getEditavelItem/isSomavel/hasAlerta/getTipoCampo; (2) useGTInlineEdit hook — ciclo completo iniciar→editar→confirmar/cancelar com rollback e propagacao; (3) helpers de renderizacao — renderTextoTruncado (50 chars + Eye), fmtQuantidade (pt-BR), fmtData; (4) configs de propagacao e alerta — isPropagavel, isAlertavel. Criticidade alta: erro na classificacao de editabilidade permite edicao de campos que deviam ser bloqueados ou bloqueia campos que deviam ser editaveis.

---

## Modulos Cobertos

| Modulo | Tipo | Arquivo Fonte |
|--------|------|---------------|
| `COLUMN_CONFIG` + `TIPO_DEFAULTS` | Constantes | `servicos-global/produto/pedido/client/src/shared/columnBehaviorConfig.ts` |
| `getEditavel` | Funcao pura | Mesmo arquivo |
| `getEditavelItem` | Funcao pura | Mesmo arquivo |
| `isSomavel` | Funcao pura | Mesmo arquivo |
| `hasAlerta` | Funcao pura | Mesmo arquivo |
| `getTipoCampo` | Funcao pura | Mesmo arquivo |
| `useGTInlineEdit` | Hook React | `nucleo-global/Tabelas/tabela-virtual-global/src/hooks/useGTInlineEdit.ts` |
| `isPropagavel` | Funcao pura | `servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem.ts` |
| `isAlertavel` | Funcao pura | `servicos-global/produto/pedido/shared/columnAlertConfig.ts` |
| `renderTextoTruncado` | Helper render | `servicos-global/produto/pedido/client/src/components/lista/ColunasPai.tsx` |
| `renderDescricaoTruncada` | Helper render | `servicos-global/produto/pedido/client/src/components/lista/ColunasFilho.tsx` |
| `fmtQuantidade` | Funcao pura | `servicos-global/produto/pedido/client/src/shared/types.ts` |
| `fmtData` | Funcao pura | Mesmo arquivo |
| `classeMoedaBadge` | Funcao pura | Mesmo arquivo |

---

## Casos de Teste

### 1. getEditavel — Campos alfanumericos retornam true

**Arquivo:** `columnBehaviorConfig.test.ts`

| ID | Campo | Resultado Esperado |
|----|-------|--------------------|
| U-EDT-01 | `numero_pedido` | `getEditavel('numero_pedido') === true` |
| U-EDT-02 | `tipo_operacao` | `true` |
| U-EDT-03 | `nome_fabricante` | `true` |
| U-EDT-04 | `referencia_importador` | `true` |
| U-EDT-05 | `referencia_exportador` | `true` |
| U-EDT-06 | `ncm` | `true` |
| U-EDT-07 | `numero_proforma` | `true` |
| U-EDT-08 | `numero_invoice` | `true` |
| U-EDT-09 | `incoterm` | `true` |
| U-EDT-10 | `data_emissao_pedido` | `true` |
| U-EDT-11 | `referencia_fabricante` | `true` |
| U-EDT-12 | `cobertura_cambial` | `true` |
| U-EDT-13 | `condicao_pagamento` | `true` |
| U-EDT-14 | `nome_exportador` | Retorna funcao (editavelFn) |
| U-EDT-15 | `nome_importador` | Retorna funcao (editavelFn) |

### 2. getEditavel — 47 campos de data retornam true

| ID | Grupo | Quantidade | Resultado |
|----|-------|------------|-----------|
| U-EDT-16 | Pedido Pronto (prevista/confirmada/meta) | 3 | Todos `true` |
| U-EDT-17 | Inspecao (prevista/confirmada/meta) | 3 | Todos `true` |
| U-EDT-18 | Coleta (prevista/confirmada/meta) | 3 | Todos `true` |
| U-EDT-19 | Consolidacao + Transferencia | 2 | Todos `true` |
| U-EDT-20 | Rascunho Pedido (receb + aprov) | 6 | Todos `true` |
| U-EDT-21 | Documento Pedido | 1 | `true` |
| U-EDT-22 | Proforma (4 grupos × 3 + documento) | 13 | Todos `true` |
| U-EDT-23 | Invoice (4 grupos × 3 + documento) | 13 | Todos `true` |
| U-EDT-24 | **Nenhuma data classificada como calculado/saldo/somente_leitura** | 47 | Confirmacao negativa |

### 3. getEditavel — Campos calculados retornam false

| ID | Campo | Resultado |
|----|-------|----|
| U-EDT-30 | `valor_total_pedido` | `false` |
| U-EDT-31 | `valor_item` | `false` |
| U-EDT-32 | `quantidade_total_pedido` | `false` |
| U-EDT-33 | `quantidade_pronta_itens_pedido_total` | `false` |
| U-EDT-34 | `quantidade_transferida_total` | `false` |
| U-EDT-35 | `quantidade_cancelada_total_pedido` | `false` |
| U-EDT-36 | `peso_liquido_total_pedido` | `false` |
| U-EDT-37 | `peso_bruto_total_pedido` | `false` |
| U-EDT-38 | `cubagem_total_pedido` | `false` |

### 4. getEditavel — Saldo e somente_leitura retornam false

| ID | Campo | Tipo | Resultado |
|----|-------|------|-----------|
| U-EDT-40 | `saldo_itens_do_pedido` | saldo | `false` |
| U-EDT-41 | `status` | somente_leitura | `false` |
| U-EDT-42 | `pais_exportador` | somente_leitura | `false` |
| U-EDT-43 | `estado_exportador` | somente_leitura | `false` |
| U-EDT-44 | `cidade_exportador` | somente_leitura | `false` |
| U-EDT-45 | `endereco_exportador` | somente_leitura | `false` |
| U-EDT-46 | `zip_code_exportador` | somente_leitura | `false` |

### 5. getEditavel — Campo nao registrado

| ID | Caso | Resultado |
|----|------|-----------|
| U-EDT-50 | `getEditavel('campo_inexistente')` | `false` |
| U-EDT-51 | `isSomavel('campo_inexistente')` | `false` |
| U-EDT-52 | `hasAlerta('campo_inexistente')` | `false` |
| U-EDT-53 | `getTipoCampo('campo_inexistente')` | `null` |

### 6. editavelFn — Condicionais por tipo_operacao

| ID | Caso | Resultado |
|----|------|-----------|
| U-EDT-60 | `nome_exportador` com `tipo_operacao='importacao'` | `true` |
| U-EDT-61 | `nome_exportador` com `tipo_operacao='exportacao'` | `false` |
| U-EDT-62 | `nome_importador` com `tipo_operacao='exportacao'` | `true` |
| U-EDT-63 | `nome_importador` com `tipo_operacao='importacao'` | `false` |

### 7. isSomavel — Calculados e saldo true, demais false

| ID | Campo | Resultado |
|----|-------|----|
| U-EDT-70 | `valor_total_pedido` (calculado) | `true` |
| U-EDT-71 | `quantidade_total_pedido` (calculado) | `true` |
| U-EDT-72 | `saldo_itens_do_pedido` (saldo) | `true` |
| U-EDT-73 | `numero_pedido` (alfanumerico) | `false` |
| U-EDT-74 | `tipo_operacao` (alfanumerico) | `false` |
| U-EDT-75 | `status` (somente_leitura) | `false` |

### 8. hasAlerta — Alfanumericos true, demais false

| ID | Campo | Resultado |
|----|-------|----|
| U-EDT-80 | `ncm` (alfanumerico) | `true` |
| U-EDT-81 | `incoterm` (alfanumerico) | `true` |
| U-EDT-82 | `referencia_importador` (alfanumerico) | `true` |
| U-EDT-83 | `data_prevista_pedido_pronto` (alfanumerico) | `true` |
| U-EDT-84 | `valor_total_pedido` (calculado) | `false` |
| U-EDT-85 | `saldo_itens_do_pedido` (saldo) | `false` |
| U-EDT-86 | `status` (somente_leitura) | `false` |

### 9. getEditavelItem — Nivel ITEM

| ID | Campo | Tipo PAI | Override | Resultado |
|----|-------|----------|---------|-----------|
| U-EDT-90 | `numero_pedido` | alfanumerico | — | `true` |
| U-EDT-91 | `valor_total_pedido` | calculado | — | `true` (item tem valor proprio) |
| U-EDT-92 | `valor_item` | calculado | — | `true` |
| U-EDT-93 | `quantidade_total_pedido` | calculado | — | `true` |
| U-EDT-94 | `peso_liquido_total_pedido` | calculado | — | `true` |
| U-EDT-95 | `saldo_itens_do_pedido` | saldo | — | `false` (nunca editavel) |
| U-EDT-96 | `pais_exportador` | somente_leitura | — | `false` |
| U-EDT-97 | `status` | somente_leitura | **true** | `true` (override) |
| U-EDT-98 | `quantidade_transferida_total` | calculado | **false** | `false` (override) |
| U-EDT-99 | `quantidade_cancelada_total_pedido` | calculado | **false** | `false` (override) |

### 10. getTipoCampo — Retorna tipo correto

| ID | Campo | Resultado |
|----|-------|----|
| U-EDT-100 | `numero_pedido` | `'alfanumerico'` |
| U-EDT-101 | `valor_total_pedido` | `'calculado'` |
| U-EDT-102 | `saldo_itens_do_pedido` | `'saldo'` |
| U-EDT-103 | `status` | `'somente_leitura'` |
| U-EDT-104 | `nao_existe` | `null` |

### 11. useGTInlineEdit — Ciclo iniciar → confirmar → sucesso

**Arquivo:** `useGTInlineEdit.test.ts`
**Ambiente:** `@vitest-environment jsdom`

| ID | Caso | Resultado |
|----|------|-----------|
| U-HOOK-01 | `iniciarEdicao(id, campo, valor)` | `editandoCelula === { id, campo }`, `valorEditando === valor` |
| U-HOOK-02 | `atualizarValor(novoValor)` | `valorEditando === novoValor` |
| U-HOOK-03 | `confirmarEdicao()` chama onEditar | `onEditar(id, campo, novoValor)` chamado |
| U-HOOK-04 | Apos confirmar: resultado sucesso | `resultado === 'sucesso'`, `salvando === false` |
| U-HOOK-05 | Apos 600ms: cleanup automatico | `editandoCelula === null`, `resultado === null` |
| U-HOOK-06 | Valor identico: nao chama onEditar | `onEditar` nao chamado, popover fecha |

### 12. useGTInlineEdit — Cancelar e erro com rollback

| ID | Caso | Resultado |
|----|------|-----------|
| U-HOOK-10 | `cancelarEdicao()` | `editandoCelula === null`, `valorEditando === null` |
| U-HOOK-11 | onEditar rejeita → rollback | `valorEditando === valorOriginal` |
| U-HOOK-12 | Apos erro: resultado erro | `resultado === 'erro'`, `erro === mensagem` |
| U-HOOK-13 | Apos 1000ms: cleanup | `editandoCelula === null` |
| U-HOOK-14 | onEditar nao fornecido → noop | Fecha sem chamar nada |

### 13. useGTInlineEdit — Propagacao replicar_em_itens

| ID | Caso | Resultado |
|----|------|-----------|
| U-HOOK-20 | `confirmarEdicao({ replicar_em_itens: true })` com valor identico | Chama onEditar (propagar mesmo valor) |
| U-HOOK-21 | `confirmarEdicao({ replicar_em_itens: false })` com valor identico | NAO chama onEditar |
| U-HOOK-22 | `confirmarEdicao()` sem opts com valor identico | NAO chama onEditar |
| U-HOOK-23 | opts passado intacto para onEditar | `onEditar(id, campo, valor, { replicar_em_itens: true })` |

### 14. isPropagavel e isAlertavel

**Arquivo:** `propagacao-alerta.test.ts`

| ID | Funcao | Campo | Resultado |
|----|--------|-------|----|
| U-PROP-01 | isPropagavel | `incoterm_pedido` | `true` |
| U-PROP-02 | isPropagavel | `moeda_pedido` | `true` |
| U-PROP-03 | isPropagavel | `condicao_pagamento_pedido` | `true` |
| U-PROP-04 | isPropagavel | `data_prevista_pedido_pronto` | `true` |
| U-PROP-05 | isPropagavel | `numero_pedido` | `false` |
| U-PROP-06 | isPropagavel | `valor_total_pedido` | `false` |
| U-ALRT-01 | isAlertavel | `tipo_operacao` | `true` |
| U-ALRT-02 | isAlertavel | `incoterm` | `true` |
| U-ALRT-03 | isAlertavel | `moeda_item` | `true` |
| U-ALRT-04 | isAlertavel | `valor_total_pedido` | `false` |

### 15. renderTextoTruncado e formatacao

**Arquivo:** `renderizacao-helpers.test.ts`
**Ambiente:** `@vitest-environment jsdom`

| ID | Funcao | Input | Resultado |
|----|--------|-------|-----------|
| U-RND-01 | renderTextoTruncado | `null` | Renderiza "—" (travessao) |
| U-RND-02 | renderTextoTruncado | `""` (vazio) | Renderiza "—" |
| U-RND-03 | renderTextoTruncado | 50 chars | Texto completo sem truncamento |
| U-RND-04 | renderTextoTruncado | 51+ chars | 50 chars + "…" + Eye(14px) + TooltipGlobal |
| U-RND-05 | fmtQuantidade | `274519.34, 2` | `"274.519,34"` |
| U-RND-06 | fmtQuantidade | `0, 2` | `"0,00"` |
| U-RND-07 | fmtQuantidade | `null` | `"—"` |
| U-RND-08 | fmtData | `'2026-05-17'` | Contém `"17/05/2026"` |
| U-RND-09 | fmtData | `null` | `"—"` |
| U-RND-10 | classeMoedaBadge | `'USD'` | Classe contendo `'usd'` |

---

## Mocks Necessarios

| Dependencia | Mock | Padrao |
|-------------|------|--------|
| React (renderTextoTruncado) | `@testing-library/react` | `render()` para snapshots |
| `@phosphor-icons/react` Eye | `vi.mock()` | Componente stub |
| `@nucleo/tooltip-global` | `vi.mock()` | Componente passthrough |
| localStorage (ColunasPai) | `vi.stubGlobal` | Mock de getItem |

---

## Estrutura de Arquivos Esperada

```
testes/testes-unitarios/pedido/lista/editar-salvar/
├── editar-salvar-unitario.md        ← este plano
├── columnBehaviorConfig.test.ts     ← U-EDT-01 a U-EDT-104 (config + getEditavel/Item + isSomavel + hasAlerta + getTipoCampo)
├── useGTInlineEdit.test.ts          ← U-HOOK-01 a U-HOOK-23 (hook ciclo completo)
├── propagacao-alerta.test.ts        ← U-PROP-01 a U-ALRT-04 (isPropagavel + isAlertavel)
└── renderizacao-helpers.test.ts     ← U-RND-01 a U-RND-10 (truncamento + formatacao)
```

**Total de casos:** ~137
