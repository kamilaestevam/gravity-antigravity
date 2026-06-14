# 📋 Plano de Teste Funcional — Edição em Massa Lista Pedido

**ID:** TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109  
**Escopo pasta:** `testes/testes-funcionais/pedido/Lista/edicao-em-massa/`  
**Specs:** `plano-de-teste/TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109-*.test.ts`  
**Código-alvo:** `edicoes-em-massa-pedido.ts` · `edicaoEmMassaService.ts`  
**Tipo:** [ ] Unitário | [x] Funcional | [ ] E2E | [ ] CRO | [ ] EMT  

**Objetivo geral:** validar contratos Zod das rotas `/preview` e `/confirmar`, isolamento por `id_organizacao`, seleção mista e contadores do fast path.

**Ambiente Local:** Vitest node (contratos) + stack `:8000`/`:8030` para execução E2E/EMT integrada do pacote.

## Runner

```bash
npx vitest run testes/testes-funcionais/pedido/Lista/edicao-em-massa/plano-de-teste/
```

**Pacote 5 tipos:** `run-pacote-edicao-em-massa-local.ts` · **Base UI:** `http://localhost:8000`

## Roteiro de execução

### ETAPA 1 — Contrato Zod (preview/confirmar)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F01** | Payload válido 1 pedido + 1 campo | `safeParse.success === true` |
| **F02** | `campos: []` | Rejeita com mensagem de campo obrigatório |
| **F03** | `pedido_ids: []` | Rejeita com mensagem de pedido obrigatório |
| **F04** | 2+ pedidos + `substituir` em `numero_pedido` | Rejeita unique em massa |
| **F05** | Campo data `YYYY-MM-DD` no payload | Aceita e converte para ISO no service |

### ETAPA 2 — Isolamento organização

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F06** | Org A solicita pedidos próprios | Retorna só pedidos da org A |
| **F07** | Org A envia `pedido_id` da org B | Resultado vazio / 404 |

### ETAPA 3 — Seleção mista

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F08** | Payload com `pedido_ids_completo` + `item_ids` | Schema aceita; nível `combinado` válido |

### ETAPA 4 — Fast path contadores

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F09** | Confirmar só campos item (substituir) | `pedidos_atualizados` = pedidos com itens tocados, não total cego |
| **F10** | Confirmar 100 pedidos + data substituir | Resposta 200 dentro do timeout 60s |

---

## Como rodar

```bash
npx vitest run testes/testes-funcionais/pedido/Lista/edicao-em-massa/plano-de-teste/
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
