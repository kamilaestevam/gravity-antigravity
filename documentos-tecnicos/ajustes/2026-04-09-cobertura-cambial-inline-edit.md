# Relatório de Impacto — COBERTURA CAMBIAL: edição inline não persiste

**Data:** 2026-04-09  
**Produto:** Pedido  
**Classificação:** LOW  
**Decisão:** AJUSTE  

---

## Problema Relatado

Coluna COBERTURA CAMBIAL na lista de pedidos: ao editar inline, exibe toast "Campo atualizado com sucesso", mas o valor não persiste após salvar. Apenas esta coluna apresenta o problema.

---

## Causa Raiz Identificada

**Discrepância de nome de campo entre `schema.prisma` e `fragment.prisma`.**

O campo no banco foi introduzido na `fragment.prisma` (fonte autoritativa) com o nome `cobertura_cambial_pedido` (com sufixo `_pedido`). Porém, no arquivo compilado `produto/pedido/server/prisma/schema.prisma`, o campo ficou como `cobertura_cambial` (sem sufixo). Isso criou a seguinte cadeia de falha:

1. Frontend envia `PATCH /api/v1/pedidos/:id/campo` com `{ campo: "cobertura_cambial_pedido", valor: "sem_cobertura" }`  
2. `CAMPOS_EDITAVEIS` no backend aceita `"cobertura_cambial_pedido"` ✅  
3. `dadosUpdate = { cobertura_cambial_pedido: valor }` → enviado ao Prisma  
4. Prisma tenta atualizar campo `cobertura_cambial_pedido` — **não existe no modelo gerado** (existe `cobertura_cambial`) → Prisma lança erro de campo desconhecido  
5. `editarCampo()` no frontend captura o erro no fallback DEV: retorna mock com `{ cobertura_cambial_pedido: valor }` → toast "sucesso" dispara  
6. DB nunca foi atualizado

Em produção (sem fallback DEV): o erro propagaria e o toast de falha apareceria.

---

## Campo com Mesmo Problema (Não Reportado)

`condicao_pagamento` também está com o mesmo mismatch:
- `schema.prisma`: `condicao_pagamento` (sem sufixo)
- `fragment.prisma`: `condicao_pagamento_pedido`
- Rotas e frontend: `condicao_pagamento_pedido`

Este campo está **fora do escopo** deste ajuste, mas deve ser corrigido na próxima janela.

---

## Arquivos Impactados

| Arquivo | Linha | Alteração |
|---------|-------|-----------|
| `produto/pedido/server/prisma/schema.prisma` | 29 | Renomear campo + adicionar `@map("cobertura_cambial")` |
| `produto/pedido/server/prisma/seed.ts` | 49, 147, 225, 323, 399, 478 | Renomear key `cobertura_cambial` → `cobertura_cambial_pedido` |
| `produto/pedido/server/prisma/seed-bulk.ts` | 96 | Renomear key `cobertura_cambial` → `cobertura_cambial_pedido` |

---

## Sem Migração Necessária

A diretiva `@map("cobertura_cambial")` mantém o nome da coluna no banco inalterado. Apenas o Prisma Client TypeScript será regenerado com o novo nome. Nenhuma migration de banco é necessária.

---

## Arquivos Não Alterados

- `servicos-global/tenant/processos-core/src/routes/pedidos.ts` — já usa `cobertura_cambial_pedido` corretamente
- `produto/pedido/client/src/` — já usa `cobertura_cambial_pedido` corretamente  
- `servicos-global/tenant/processos-core/prisma/fragment.prisma` — fonte autoritativa, já correto

---

## Verificação Pós-Fix

1. Backend: confirmar que `prisma.pedido.update({ data: { cobertura_cambial_pedido: 'sem_cobertura' } })` não lança erro
2. Frontend: editar o campo inline → toast deve aparecer → valor deve persistir após reload da página
3. Seed: `npx prisma db seed` não deve lançar erro de campo desconhecido
