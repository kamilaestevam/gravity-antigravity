# Relatório de Impacto — Edição Inline de Campos do Item de Pedido

**Data:** 2026-04-06  
**Produto:** Pedido  
**Severidade:** HIGH  
**Decisão:** Ajuste cirúrgico (não reescrita)

---

## Problema

Ao editar um campo inline de uma linha-filho (item) na `TabelaVirtualGlobal`, o toast "Campo atualizado com sucesso." exibia, mas o valor não atualizava visualmente nem era salvo no banco.

---

## Causa Raiz

`atualizarItemSchema` em `servicos-global/tenant/processos-core/src/routes/pedidos.ts:74` aceita apenas 7 campos. O Zod usa `.object()` que **strip silently** — qualquer campo não declarado é descartado antes de chegar ao Prisma.

O frontend envia o campo pelo seu **alias** (`quantidade_inicial_item_pedido`), mas o schema não o declara. O Prisma nunca recebe a quantidade nova. Retorna 200 → toast falso de sucesso.

---

## Mapeamento de Todos os Campos Editáveis do Filho

| Coluna PAI (key) | `campo` enviado | Status antes | Correção |
|---|---|---|---|
| `numero_pedido` | `part_number` | ✅ Funciona | — |
| `exportador_nome`, `fabricante_nome`, `referencia_*`, `incoterm`, etc. | campos do pedido pai | ✅ Funciona | Roteado via `CAMPOS_PAI_TEXTO` → `pedidoApi.atualizar` |
| `valor_total_pedido` | `valor_total_item` + `moeda_item` | ✅ Funciona | Está no schema |
| `valor_por_unidade_item` (COLUNAS_FILHO) | `valor_por_unidade_item` + `moeda_item` | ✅ Funciona | Está no schema |
| **`quantidade_total_inicial_pedido`** | **`quantidade_inicial_item_pedido`** | ❌ **BUG PRINCIPAL** | Alias adicionado ao schema + mapeado para `quantidade_inicial_pedido` + recalcular `quantidade_atual_pedido` |
| `quantidade_pronta_itens_pedido_total` | `quantidade_pronta_total` | ❌ Sem rota correta | Dispatch especial → `pedidoItemApi.atualizarPronta` |
| `saldo_item_pedido` | `saldo_item_pedido` | ❌ Campo calculado | Removido `editavel: true` (não editável diretamente) |
| `quantidade_transferida_total` | `quantidade_transferida_item` | ❌ Gerenciado pelo sistema de transfer | Removido `editavel: true` |
| `peso_liquido_total_pedido` | `peso_liquido_unitario` | ❌ Campo **não existe** em PedidoItem DB | Removido `editavel: true` |
| `peso_bruto_total_pedido` | `peso_bruto_unitario` | ❌ Campo **não existe** em PedidoItem DB | Removido `editavel: true` |
| `cubagem_total_pedido` | `cubagem_unitaria` | ❌ Campo **não existe** em PedidoItem DB | Removido `editavel: true` |

---

## Arquivos Modificados

### 1. `servicos-global/tenant/processos-core/src/routes/pedidos.ts`
- Linha 74: `atualizarItemSchema` — adicionar `quantidade_inicial_item_pedido: z.number().min(0).optional()`
- Linha 687: handler do PUT — destruturar alias, mapear para Prisma field, recalcular `quantidade_atual_pedido`

### 2. `produto/pedido/client/src/pages/ListaPedidos.tsx`
- `handleEditarFilho` (~linha 4857): adicionar dispatch para `quantidade_pronta_total` → `pedidoItemApi.atualizarPronta`
- `MAPA_COLUNAS_FILHO` (~linha 3761): remover `editavel: true` de `saldo_item_pedido`, `quantidade_transferida_total`, `peso_liquido_total_pedido`, `peso_bruto_total_pedido`, `cubagem_total_pedido`

---

## Lógica do Recálculo do Saldo

Quando `quantidade_inicial_pedido` é alterada:
```
quantidade_atual_pedido = max(0, nova_inicial - quantidade_transferida_pedido - quantidade_cancelada_pedido)
```

Isso garante que o saldo (exibido na coluna "Saldo") seja sempre consistente com a quantidade inicial, sem quebrar as operações de transfer e cancelamento já realizadas.

---

## Campos NÃO em PedidoItem (DB)

`peso_liquido_unitario`, `peso_bruto_unitario` e `cubagem_unitaria` existem em `ProcessoItem` (embarque), não em `PedidoItem` (pedido comercial). Para habilitar edição desses campos em PedidoItem no futuro, seria necessário:
1. Adicionar as colunas ao `fragment.prisma` (Coordenador)
2. Rodar migração
3. Atualizar `mapItem` para incluir os campos no response
