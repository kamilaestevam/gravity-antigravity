# 📋 Plano de Teste Unitário — Edição em Massa Lista Pedido

**ID:** TST-UNI-EDICAO-EM-MASSA-LISTA-PEDIDO-000108  
**Escopo pasta:** `testes/testes-unitarios/pedido/lista/edicao-em-massa/`  
**Spec:** `plano-de-teste/TST-UNI-EDICAO-EM-MASSA-LISTA-PEDIDO-000108.test.ts`  
**Código-alvo:** `edicaoEmMassaService.ts` · `ModalPedidosEdicaoMassa.tsx` · `dateToIso` (nucleo)  
**Tipo:** [x] Unitário | [ ] Funcional | [ ] E2E | [ ] CRO | [ ] EMT  

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo.

---

## Escopo

Lógica pura e reproduções controladas da edição em massa: operações de campo, unique constraint, conversão de data local (`dateToIso`), contadores/audit do **fast path** (`pedidosAfetados`). Persistência HTTP e cross-org são FUN/CRO.

**Objetivo geral:** garantir que operações matemáticas e substituições produzam valores corretos, que datas no modal não sofram D−1 por UTC, e que o fast path conte/audite apenas pedidos efetivamente alterados.

**Ambiente Local:** lógica pura (Vitest node) — pacote integrado roda em `:8000` via `run-pacote-edicao-em-massa-local.ts`.

## Runner

```bash
npx vitest run testes/testes-unitarios/pedido/lista/edicao-em-massa/plano-de-teste/TST-UNI-EDICAO-EM-MASSA-LISTA-PEDIDO-000108.test.ts
```

**Pacote 5 tipos (Local):** `npx tsx testes/testes-em-tela/pedido/lista/edicao-em-massa/plano-de-teste/run-pacote-edicao-em-massa-local.ts`  
**Variáveis:** `PLAYWRIGHT_BASE_URL=http://localhost:8000`, `E2E_CLERK_USER_EMAIL`, `CLERK_SECRET_KEY`

---

## Roteiro de execução

### ETAPA 1 — Operações de campo (`aplicarOperacao`)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | `substituir` texto, número, data e NCM | Retorna o valor novo literal |
| **U02** | `somar` / `subtrair` / `percentual` em numérico | Resultado aritmético correto |
| **U03** | `avancar_dias` / `recuar_dias` em data ISO | Data deslocada N dias |

### ETAPA 2 — Unique constraint (Zod superRefine)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U04** | 1 pedido + `substituir` em `numero_pedido` | Permitido (`null` erro) |
| **U05** | 2+ pedidos + `substituir` em `numero_pedido` | Mensagem de bloqueio unique |
| **U06** | 2+ pedidos + `somar` em `numero_pedido` | Permitido (não é substituir) |

### ETAPA 3 — Data local (`dateToIso`)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U07** | `dateToIso(new Date(2026, 6, 15))` em fuso BR | Retorna `2026-07-15` (não D−1 via UTC) |
| **U08** | Comparar com anti-padrão `toISOString().split('T')[0]` às 22h BRT | `dateToIso` preserva dia civil local |

### ETAPA 4 — Fast path — `pedidosAfetados`

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U09** | Só campos de **pedido** alterados | Set = `pedidoIdsAlvo` |
| **U10** | Só campos de **item** (todos os pedidos) | Set = todos `pedidoIds` |
| **U11** | Só itens com `filtroItemIds` | Set = pedidos donos dos itens filtrados |
| **U12** | Pedido + item no mesmo batch | Set = união dos dois conjuntos |
| **U13** | Audit: pedido fora de `pedidosAfetados` | Não entra no audit log |

---

## Como rodar

```bash
npx vitest run testes/testes-unitarios/pedido/lista/edicao-em-massa/plano-de-teste/TST-UNI-EDICAO-EM-MASSA-LISTA-PEDIDO-000108.test.ts
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
