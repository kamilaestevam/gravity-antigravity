# Relatório de Ajuste — Kanban não exibe todos os pedidos

**Data**: 2026-04-06  
**Produto**: `produto/pedido`  
**Arquivo principal**: `produto/pedido/client/src/pages/KanbanPedidos.tsx`  
**Classificação**: MEDIUM  
**Decisão**: AJUSTE (cirúrgico)

---

## Problema

A Lista mostra 102 pedidos totais, mas o Kanban exibe apenas 70 (distribuídos entre 5 colunas).
O toolbar do Kanban já mostra "102 pedidos" (`itensFiltrados.length`), confirmando que o Kanban
carrega todos os 102 records da API — mas **32 ficam orphaned** (carregados, invisíveis).

---

## Causa Raiz

O Kanban define **5 colunas hardcoded**:
```
['draft', 'aberto', 'transferencia', 'consolidado', 'cancelado']
```

O Kanban distribui itens por `colunaKey = p.status`. Pedidos cujo `status` não bate com nenhuma
das 5 chaves não aparecem em nenhuma coluna.

A Lista suporta **abas dinâmicas** geradas a partir do `PedidoStatus` config do tenant
(`GET /api/v1/pedidos/config/status`). Quando o tenant cria status customizados (ex: `em_revisao`,
`aguardando_aprovacao`) e pedidos recebem esses valores — via `duplicarExcluirService` com
`duplicar_status_inicial ≠ 'copiar'` ou outra via — eles aparecem na Lista mas somem do Kanban.

---

## Mapeamento de Dependências

| Camada | Arquivo | Impacto |
|--------|---------|---------|
| Frontend | `KanbanPedidos.tsx` | Origem do bug — adicionar colunas dinâmicas |
| API (leitura) | `pedidoConfigApi.listarStatus()` | Já existe — apenas adicionar chamada |
| Tipos | `PedidoStatusConfig` | Já importado |
| Backend | `pedidos-config.ts GET /status` | Sem alteração |
| KanbanGlobal | `nucleo-global/Kanban` | Sem alteração |

---

## Escopo do Ajuste

**Apenas `KanbanPedidos.tsx`**:
1. Adicionar `statusConfig` state
2. Em `carregar`, fazer `Promise.all` com `pedidoConfigApi.listarStatus()`
3. Calcular `colunasComputadas` via `useMemo`: COLUNAS base + custom statuses do config
4. Substituir `COLUNAS` por `colunasComputadas` nos 2 componentes filhos

---

## Risco

**LOW** — mudança localizada em 1 arquivo. Sem alteração de contrato API, DB, ou nucleo-global.
Fallback: se `listarStatus()` falhar, continua com as 5 colunas base (`.catch(() => ({ data: [] }))`).
