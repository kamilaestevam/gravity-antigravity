# Plano de Testes Unitários — Consolidar Pedido

**ID:** TST-UNI-PEDIDO-CONSOLIDAR-001
**Data:** 2026-05-17
**Versão:** 1.0
**Criticidade:** alta
**Cobertura mínima:** 70%
**Ambiente:** `@vitest-environment node`

---

## Resumo Executivo

Plano de teste unitário para a feature de consolidação de pedidos. Cobre 2 camadas: schemas Zod (PreviewSchema, ConfirmarSchema) e lógica pura do router (gerarNumeroPedido, detecção de divergências, merge de itens). A criticidade é alta porque envolve merge de dados financeiros e operacionais entre pedidos — erro aqui cria pedidos consolidados com dados incorretos, perda de itens ou vazamento cross-organização.

---

## Módulos Cobertos

| Módulo | Tipo | Arquivo Fonte |
|--------|------|---------------|
| `PreviewSchema` | Schema Zod | `consolidacoes-pedido.ts:49` |
| `ConfirmarSchema` | Schema Zod | `consolidacoes-pedido.ts:53` |
| `gerarNumeroPedido` | Função Pura | `consolidacoes-pedido.ts:210` |
| `CAMPOS_COMPARAR` | Constante | `consolidacoes-pedido.ts:71` |
| `detectarTiposMistos` | Função Pura (shared) | `bulkSchemas.ts:53` |

---

## Casos de Teste

### 1. PreviewSchema — Validação Zod

**Arquivo:** `consolidar-schemas.test.ts`

| ID | Caso | Input | Resultado |
|----|------|-------|-----------|
| U-ZOD-01 | ids com 2 strings válidas → aceita | `{ ids: ['a', 'b'] }` | `success = true` |
| U-ZOD-02 | ids com 3+ strings → aceita | `{ ids: ['a', 'b', 'c'] }` | `success = true` |
| U-ZOD-03 | ids vazio → rejeita | `{ ids: [] }` | `success = false`, mensagem "ao menos 2" |
| U-ZOD-04 | ids com 1 só → rejeita | `{ ids: ['a'] }` | `success = false` |
| U-ZOD-05 | ids com string vazia → rejeita | `{ ids: ['', 'b'] }` | `success = false` |
| U-ZOD-06 | ids com número → rejeita | `{ ids: [1, 2] }` | `success = false` |
| U-ZOD-07 | body vazio → rejeita | `{}` | `success = false` |
| U-ZOD-08 | ids com null → rejeita | `{ ids: [null, 'b'] }` | `success = false` |

### 2. ConfirmarSchema — Validação Zod

| ID | Caso | Input | Resultado |
|----|------|-------|-----------|
| U-ZOD-10 | Payload completo válido → aceita | `{ ids: ['a','b'], numero_pedido: 'X', campos_escolhidos: {}, fundir_itens_mesmo_part_number: true }` | `success = true` |
| U-ZOD-11 | numero_pedido vazio → rejeita | `{ ..., numero_pedido: '' }` | `success = false` |
| U-ZOD-12 | numero_pedido > 100 chars → rejeita | `{ ..., numero_pedido: 'A'.repeat(101) }` | `success = false` |
| U-ZOD-13 | Sem fundir_itens_mesmo_part_number → rejeita | `{ ids: ['a','b'], numero_pedido: 'X', campos_escolhidos: {} }` | `success = false` |
| U-ZOD-14 | campos_escolhidos com valor string → aceita | `{ ..., campos_escolhidos: { campo: 'valor' } }` | `success = true` |
| U-ZOD-15 | campos_escolhidos com valor número → aceita | `{ ..., campos_escolhidos: { campo: 42 } }` | `success = true` |
| U-ZOD-16 | campos_escolhidos com valor null → aceita | `{ ..., campos_escolhidos: { campo: null } }` | `success = true` |
| U-ZOD-17 | campos_escolhidos vazio {} → aceita | `{ ..., campos_escolhidos: {} }` | `success = true` |
| U-ZOD-18 | ids com 1 só → rejeita (min 2) | `{ ids: ['a'], ... }` | `success = false` |

### 3. detectarTiposMistos — Função Pura (shared)

**Arquivo:** `consolidar-logica.test.ts`

| ID | Caso | Input | Resultado |
|----|------|-------|-----------|
| U-MIX-01 | Todos iguais 'importacao' → false | `['importacao', 'importacao']` | `false` |
| U-MIX-02 | Todos iguais 'exportacao' → false | `['exportacao', 'exportacao']` | `false` |
| U-MIX-03 | Mistos → true | `['importacao', 'exportacao']` | `true` |
| U-MIX-04 | Array vazio → false | `[]` | `false` |
| U-MIX-05 | 1 elemento → false | `['importacao']` | `false` |
| U-MIX-06 | Com strings vazias misturadas → true | `['importacao', '']` | `true` |

### 4. CAMPOS_COMPARAR — Integridade da constante

| ID | Caso | Verificação |
|----|------|-------------|
| U-CMP-01 | Tem ao menos 40 campos | `CAMPOS_COMPARAR.length >= 40` |
| U-CMP-02 | Cada campo tem { campo, rotulo, grupo, fonte } | Shape check |
| U-CMP-03 | fonte é 'direto' ou 'json' | Validação de enum |
| U-CMP-04 | Sem campos duplicados | `new Set(campos).size === campos.length` |
| U-CMP-05 | Grupos conhecidos existem | Comercial, Exportador, Importador, Fabricante, OPE, Câmbio, Documentos, Logística, Datas |

---

## Estrutura de Arquivos Esperada

```
testes/testes-unitarios/pedido/lista/consolidar/
├── consolidar-unitario.md              ← este plano
├── consolidar-schemas.test.ts          ← U-ZOD-01 a U-ZOD-18
└── consolidar-logica.test.ts           ← U-MIX-01 a U-CMP-05
```

**Total de casos:** ~29
