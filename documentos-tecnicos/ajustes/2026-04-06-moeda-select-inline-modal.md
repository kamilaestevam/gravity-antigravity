# Relatório de Impacto — Moeda: texto → select com lista ISO

**Data:** 2026-04-06  
**Risco:** LOW  
**Decisão:** AJUSTE (cirúrgico)

## Problema

Campos `moeda_pedido` e `moeda_item` abrem text input no inline edit da tabela e no ModalEdicaoEmMassa, em vez de exibir select com a lista de moedas ISO disponíveis.

## Causa Raiz

- `ListaPedidos.tsx:832` — coluna `moeda_pedido`: `tipo: 'texto'` sem `opcoes`
- `ListaPedidos.tsx:2105` — coluna `moeda_item`: `tipo: 'texto'` sem `opcoes`
- `ModalEdicaoEmMassa.tsx:107` — campo `moeda_pedido`: `tipo: 'texto'`
- `ModalEdicaoEmMassa.tsx:214` — campo `moeda_item`: `tipo: 'texto'`

## Infraestrutura já existente (não precisa criar)

- `GTColuna.opcoes: { valor: string; label: string }[]` — quando definido, inline edit mostra lista selecionável
- `TipoCampoEdicao: 'select'` — já suportado no ModalEdicaoEmMassa
- `MOEDAS_PADRAO` em `TabelaVirtualGlobal.tsx:277` — lista de referência

## Escopo Positivo (o que SERÁ alterado)

1. `produto/pedido/client/src/shared/types.ts` — adicionar `export const MOEDAS_ISO`
2. `produto/pedido/client/src/pages/ListaPedidos.tsx` — adicionar `opcoes` nas colunas `moeda_pedido` e `moeda_item`
3. `produto/pedido/client/src/components/ModalEdicaoEmMassa.tsx` — mudar `tipo: 'texto'` para `tipo: 'select'` e adicionar `opcoes` nos campos `moeda_pedido` e `moeda_item`

## Escopo Negativo (o que NÃO será alterado)

- Nenhum tipo TypeScript alterado
- Nenhuma rota de API alterada
- Nenhum schema Prisma alterado
- `TabelaVirtualGlobal.tsx` não alterado
- `ModalNovoPedido.tsx` e `DrawerPedido.tsx` não alterados (lista curta intencional)

## Blast Radius

| Arquivo | Impacto |
|---------|---------|
| `types.ts` | + constante exportada (não-breaking) |
| `ListaPedidos.tsx` | inline edit moeda_pedido e moeda_item passam a ter select |
| `ModalEdicaoEmMassa.tsx` | campos moeda passam a ter select |

## Critérios de Sucesso

- [ ] Clicar na célula moeda_pedido abre popover com lista de moedas selecionáveis
- [ ] Clicar na célula moeda_item abre popover com lista de moedas selecionáveis
- [ ] ModalEdicaoEmMassa mostra dropdown para moeda_pedido e moeda_item
- [ ] Seleção salva corretamente via API existente

## Rollback

Reverter as 3 propriedades adicionadas (`opcoes`) e os 2 `tipo` alterados.
