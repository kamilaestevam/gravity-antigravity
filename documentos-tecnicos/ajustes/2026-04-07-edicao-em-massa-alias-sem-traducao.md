# Ajuste — Edição em Massa: aliases sem tradução no service

**Data:** 2026-04-07  
**Classificação:** MEDIUM  
**Decisão:** AJUSTE cirúrgico  
**Arquivo principal:** `produto/pedido/server/src/services/edicaoEmMassaService.ts`

---

## Problema

A edição em massa de itens retorna sucesso (HTTP 200) mas não persiste nenhum valor de quantidade no banco de dados.

## Causa Raiz

O `edicaoEmMassaService.ts` usa os aliases do frontend (`quantidade_inicial_item_pedido`, etc.) diretamente em operações Prisma (`update` e `select`). O Prisma ignora silenciosamente campos desconhecidos no `update` e retorna `undefined` no `select`.

O padrão correto já existe no restante do sistema: `mapItem()` em `pedidos.ts` cria os aliases na leitura, e o handler de update individual traduz de volta antes de salvar. O service de edição em massa foi escrito sem implementar essa tradução.

## Dicionário de Tradução (alias → campo Prisma)

| Alias frontend | Campo Prisma real |
|---|---|
| `quantidade_inicial_item_pedido` | `quantidade_inicial_pedido` |
| `quantidade_transferida_item` | `quantidade_transferida_pedido` |
| `quantidade_pronta_total` | `quantidade_pronta_pedido` |
| `quantidade_cancelada_item_pedido` | `quantidade_cancelada_pedido` |
| `saldo_item_pedido` | `quantidade_atual_pedido` |

## Ocorrências a Corrigir

| Linha | Método | Tipo | Descrição |
|---|---|---|---|
| 364–367 | `recalcularAgregados()` | SELECT | `select` usa aliases — todos retornam `undefined` |
| 372, 376, 381 | `recalcularAgregados()` | REDUCE | Reduz sobre campos `undefined` → totais = 0 |
| ~266 | `confirmar()` | UPDATE | `dadosItem[c.campo]` com alias → Prisma ignora |

## Escopo da Mudança

- **Arquivo alterado:** `produto/pedido/server/src/services/edicaoEmMassaService.ts`
- **Nenhum outro arquivo** precisa ser alterado
- Nenhuma interface, tipo, contrato ou schema muda
- Nenhum endpoint novo

## Mudanças Planejadas

1. Adicionar constante `ALIAS_PARA_PRISMA` com o dicionário de tradução
2. Adicionar função helper `traduzirCampoItem(campo: string): string`
3. Em `confirmar()`: aplicar `traduzirCampoItem` antes de montar `dadosItem`
4. Em `recalcularAgregados()`: corrigir o `select` para usar nomes Prisma reais

## Riscos

- **Ausência de testes:** `edicaoEmMassaService.ts` não tem cobertura de testes. A correção é trivial mas recomenda-se adicionar teste de smoke após o ajuste.
- **Campos `quantidade_pronta_total` e `quantidade_cancelada_item_pedido`** estão em `CAMPOS_QUANTIDADE_ITEM` mas nunca aparecem em `recalcularAgregados()` — são dead code nessa função. O ajuste não altera esse comportamento.

## Verificação Pós-Ajuste

- [ ] Editar quantidade de item via edição em massa → valor persiste no banco
- [ ] Totais do pedido são recalculados corretamente após edição em massa
- [ ] Edição individual de item continua funcionando (sem regressão)
- [ ] Build TypeScript sem erros
