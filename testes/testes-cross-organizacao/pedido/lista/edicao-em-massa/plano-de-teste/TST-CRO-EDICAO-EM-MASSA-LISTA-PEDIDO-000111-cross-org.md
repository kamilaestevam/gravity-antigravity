# Plano Cross-Organização — Edição em Massa Lista Pedido

**ID:** `TST-CRO-EDICAO-EM-MASSA-LISTA-PEDIDO-000111`  
**Escopo pasta:** `testes/testes-cross-organizacao/pedido/lista/edicao-em-massa/`  
**Spec:** `plano-de-teste/TST-CRO-EDICAO-EM-MASSA-LISTA-PEDIDO-000111.test.ts`  

**Objetivo geral:** garantir que usuário da organização A não altere pedidos da org B via confirmar em massa.

**Ambiente Local:** Vitest node (service mock) — paridade com isolamento real em `:8030`.

## Runner

```bash
npx vitest run testes/testes-cross-organizacao/pedido/lista/edicao-em-massa/plano-de-teste/TST-CRO-EDICAO-EM-MASSA-LISTA-PEDIDO-000111.test.ts
```

**Pacote 5 tipos:** `run-pacote-edicao-em-massa-local.ts` · **Base UI:** `http://localhost:8000`

## Roteiro de execução

### ETAPA 1 — Service `EdicaoEmMassaService.confirmar`

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **CRO-01** | `findMany` WHERE usa `id_organizacao` do token | Filtro org correto |
| **CRO-02** | Org B confirma com `pedido_ids` da org A | `404 NOT_FOUND` — nenhum pedido |
| **CRO-03** | `updateMany` de itens filtra por `id_organizacao` | WHERE inclui org |

### ETAPA 2 — Rotas HTTP

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **CRO-04** | POST confirmar org B + ids org A | HTTP 404, sem vazamento |

---

## Como rodar

```bash
npx vitest run testes/testes-cross-organizacao/pedido/lista/edicao-em-massa/plano-de-teste/TST-CRO-EDICAO-EM-MASSA-LISTA-PEDIDO-000111.test.ts
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
