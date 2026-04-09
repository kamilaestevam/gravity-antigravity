# Bugs Modal de Transferência — 2026-04-09

## Resumo Executivo

5 bugs identificados no fluxo de transferência de pedidos:
- 2 bugs no arquivo de testes (`transferirService.test.ts`) com campos de schema errados
- 2 bugs no frontend (`ModalTransferir.tsx`) — quantidade não pré-preenchida e saldo após ausente
- 1 bug no frontend — passo 5 não exibe dados do resultado retornado pelo backend

---

## BUG 01 — Testes de `recalcularAgregados` com campos errados (CI quebrado)

**Classificação:** HIGH

**Causa raiz:** O teste espera que o `pedido.update` seja chamado com `data: { quantidade_total_pedido: 150 }` (nome da coluna SQL), mas o service usa corretamente o nome do campo Prisma `quantidade_total_inicial_pedido`. O segundo teste da mesma suite espera que `quantidade_total_inicial_pedido` seja `undefined` no `data`, mas o service usa exatamente esse campo.

**Arquivo:** `produto/pedido/server/src/services/transferirService.test.ts`

**Linhas exatas:**
- Linha 559: `data: { quantidade_total_pedido: 150 }` — deveria ser `data: { quantidade_total_inicial_pedido: 150 }`
- Linha 571: `expect(updateData.quantidade_total_inicial_pedido).toBeUndefined()` — teste invertido, deve ser removido ou trocar para `toBeDefined()`

**Schema (confirmação):** `produto/pedido/server/prisma/schema.prisma` linha 26:
```
quantidade_total_inicial_pedido  Float?  @map("quantidade_total_pedido")
```
O campo Prisma é `quantidade_total_inicial_pedido`. O `@map("quantidade_total_pedido")` é só o nome da coluna no banco.

**O que muda:** Corrigir as duas expectativas no teste de `recalcularAgregados`.

---

## BUG 02 — Testes de `prepararItemDestino` verificando campos inexistentes

**Classificação:** MEDIUM

**Causa raiz:** O teste nas linhas 623-625 espera que `saldo_item_pedido` e `quantidade_inicial_item_pedido` sejam `undefined` no objeto retornado por `prepararItemDestino`. Mas o service os inclui explicitamente (service linhas 417-418). Ambos são campos obrigatórios no schema `PedidoItem`.

**Arquivo:** `produto/pedido/server/src/services/transferirService.test.ts`

**Linhas exatas:**
- Linha 623: `expect(result.saldo_item_pedido).toBeUndefined()` — ERRADO, deve ser `toBeDefined()` e ter valor `10`
- Linha 624: `expect(result.quantidade_inicial_item_pedido).toBeUndefined()` — ERRADO, deve ser `toBeDefined()` e ter valor `10`

**O que muda:** Corrigir as duas expectativas para verificar que os campos estão presentes com os valores corretos.

---

## BUG 03 — Campo Quantidade no Passo 3 (Destinos) começa zerado

**Classificação:** HIGH

**Causa raiz:** No `useEffect` que reseta destinos ao mudar cenário (`ModalTransferir.tsx` linha 439), `quantidade` é inicializado como `0`:
```typescript
setDestinos([{ tipo: cenario === 'split_novo_pedido' ? 'novo' : 'existente', quantidade: 0 }])
```
O valor `quantidadeOrigem` já foi preenchido no passo 2, mas não é propagado para o destino inicial.

**Arquivo:** `produto/pedido/client/src/components/ModalTransferir.tsx`

**Linha exata:** 439

**O que muda:** O `useEffect` deve usar `quantidadeOrigem` no lugar de `0`. Como o `useEffect` depende de `[cenario]`, precisamos adicionar `quantidadeOrigem` à dependência também para que o valor atualizado seja usado quando o usuário avança do passo 2 para o passo 3.

---

## BUG 04 — Saldo Após não é exibido em tempo real no Passo 3

**Classificação:** MEDIUM

**Causa raiz:** O sub-componente `ConfigurarDestinos` não recebe nem exibe informação do saldo atual do item de origem. Não há texto "Saldo após: X" abaixo do campo de quantidade.

**Arquivo:** `produto/pedido/client/src/components/ModalTransferir.tsx`

**Linhas exatas:**
- Linha 211-218: interface `ConfigurarDestinosProps` — não tem prop `itemSelecionado`
- Linha 288-302: bloco do campo `Quantidade` — não tem texto de saldo após
- Linha 637-644: chamada de `<ConfigurarDestinos>` — não passa `itemSelecionado`

**O que muda:**
1. Adicionar `itemSelecionado: PedidoItem | undefined` como prop em `ConfigurarDestinosProps`
2. Importar o tipo `PedidoItem` para uso dentro do componente
3. Renderizar `"Saldo após: {fmtQuantidade(saldoAtual - destino.quantidade)}"` abaixo do input de quantidade
4. Passar `itemSelecionado` na chamada do componente dentro do `ModalTransferir`

---

## BUG 05 — Passo 5 (Confirmação) não exibe dados do resultado

**Classificação:** HIGH

**Causa raiz:** Quando `concluido` é `true`, o corpo do modal exibe apenas o texto genérico de sucesso. Não mostra o número do novo pedido criado, a quantidade processada, nem o item transferido. O `resultado` (estado `TransferResultado`) está corretamente populado via `setResultado(res)` na linha 525, mas não é exibido na tela de sucesso além de uma contagem genérica de pedidos criados.

**Arquivo:** `produto/pedido/client/src/components/ModalTransferir.tsx`

**Linhas exatas:**
- Linhas 602-609: bloco `concluido` — exibe apenas ícone, título e texto genérico. Não usa `resultado.pedidos_criados`, `quantidadeOrigem`, `itemSelecionado`, nem `numeroPedidoNovo`

**O que muda:** Expandir o bloco de `concluido` para exibir:
- Quantidade processada (`quantidadeOrigem`)
- Part number do item (`itemSelecionado?.part_number`)
- Número do(s) pedido(s) criado(s) quando `cenario === 'split_novo_pedido'` (`numeroPedidoNovo` ou `resultado?.pedidos_criados`)
- Cenário executado (`cenarioInfo?.nome`)

---

## Arquivos que Precisam Mudar

| Arquivo | Bugs |
|---------|------|
| `produto/pedido/server/src/services/transferirService.test.ts` | BUG 01, BUG 02 |
| `produto/pedido/client/src/components/ModalTransferir.tsx` | BUG 03, BUG 04, BUG 05 |

## Decisão: Ajuste Cirúrgico

Todos os 5 bugs são correções pontuais em linhas específicas. Não há necessidade de reescrita. Escopo: 2 arquivos, ~15 linhas alteradas.
