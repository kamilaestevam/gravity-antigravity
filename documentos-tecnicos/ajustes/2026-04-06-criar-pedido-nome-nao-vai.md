# Relatório de Impacto — Criar Pedido: não cria ou nome não aparece

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** HIGH
**Produto:** produto/pedido

---

## PROBLEMA

Ao criar um novo pedido pelo botão "+ Novo" → "Manual":
- **Cenário A:** o pedido não é criado (usuário vê erro 500 ou silêncio)
- **Cenário B:** o pedido é criado mas o número não aparece na lista

## CAUSA RAIZ

O rename `quantidade_atual_pedido → quantidade_saldo_pedido` foi executado PARCIALMENTE (terceira iteração sem completar):

| Arquivo | Estado |
|---------|--------|
| `pedidos.ts` routes | ✅ já usa `quantidade_saldo_pedido` (mudança não commitada) |
| `fragment.prisma` | ❌ ainda tem `quantidade_atual_pedido` (sem @map) |
| Prisma client gerado | ❌ ainda tem `quantidade_atual_pedido` |
| `saldoEngine.ts` | ❌ ainda usa `quantidade_atual_pedido` |
| `transferirService.ts` | ❌ ainda usa `quantidade_atual_pedido` |
| `types.ts` client | ✅ já usa `quantidade_saldo_pedido` |

**Consequência direta:**
- `pedidos.ts` POST `/` tenta criar `PedidoItem` com `quantidade_saldo_pedido: N` → Prisma lança `PrismaClientValidationError` (campo desconhecido) → transação falha → HTTP 500
- Se o usuário não preencher nenhum campo do item (form vazio), `itensMapped = []` → pedido é criado sem itens (cria), mas `mapItem` lê `item.quantidade_saldo_pedido` que é `undefined` → saldo retorna `0`
- `mapItem` tem chave duplicada: `quantidade_saldo_pedido` aparece duas vezes no objeto retornado

## ESCOPO DA CORREÇÃO

| Arquivo | Operação |
|---------|----------|
| `servicos-global/tenant/processos-core/prisma/fragment.prisma` | Renomear campo + `@map("quantidade_atual_pedido")` |
| `servicos-global/tenant/processos-core/src/services/saldoEngine.ts` | `replace_all quantidade_atual_pedido → quantidade_saldo_pedido` |
| `produto/pedido/server/src/services/transferirService.ts` | `replace_all quantidade_atual_pedido → quantidade_saldo_pedido` |
| `servicos-global/tenant/processos-core/src/routes/pedidos.ts` | Remover chave duplicada `quantidade_saldo_pedido` em `mapItem` |
| `scripts/compose-tenant-schema.ts` + `prisma generate` | Regenerar schema e client |

## ESCOPO NEGATIVO (não tocar)

| Arquivo | Motivo |
|---------|--------|
| `servicos-global/tenant/prisma/schema.prisma` | Gerado pelo compose script |
| `servicos-global/tenant/generated/` | Regenerado via `prisma generate` |
| Migration SQL files | Histórico imutável — coluna DB `quantidade_atual_pedido` permanece via @map |
| `duplicarExcluirService.ts` | Não usa o campo diretamente |

## ZERO MIGRATION

A coluna no banco permanece como `quantidade_atual_pedido`.
O `@map("quantidade_atual_pedido")` no Prisma mapeia o novo nome TypeScript para a coluna existente.

## CRITÉRIO DE SUCESSO

- `POST /api/v1/pedidos` com itens retorna 201 (não 500)
- `mapItem` retorna `quantidade_saldo_pedido` com o valor real (não zero)
- `saldoEngine` lê/escreve `quantidade_saldo_pedido` corretamente
- `npx tsc --noEmit` sem erros novos
