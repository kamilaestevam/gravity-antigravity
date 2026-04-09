# Relatório de Impacto — Renomear campo para quantidade_saldo_pedido

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** HIGH
**Aprovação obtida:** usuário confirmou explicitamente

---

## PROBLEMA

- **Descrição:** Campo "saldo vivo do item" tem 3 nomes diferentes por camada (`quantidade_atual` no DB, `quantidade_atual_pedido` no Prisma/backend, `saldo_item_pedido` no frontend), criando confusão semântica e dificultando manutenção.
- **Decisão de negócio:** Padronizar para `quantidade_saldo_pedido` em todas as camadas — mantém coerência com família `quantidade_*_pedido` e torna explícita a relação de saldo calculado.
- **Coluna DB:** permanece `quantidade_atual` via `@map("quantidade_atual")` → **zero migration necessária**

---

## MAPEAMENTO DE RENOMEAÇÕES

| Camada | De | Para |
|:-------|:---|:-----|
| DB column | `quantidade_atual` | `quantidade_atual` (**não muda**) |
| Prisma model (`fragment.prisma`) | `quantidade_atual_pedido` | `quantidade_saldo_pedido` |
| Backend reads/writes | `quantidade_atual_pedido` | `quantidade_saldo_pedido` |
| Frontend alias | `saldo_item_pedido` | `quantidade_saldo_pedido` |
| Label tabela | "SALDO DO PEDIDO" | **não muda** |

---

## ESCOPO POSITIVO

| Arquivo | Ocorrências | Operação |
|:--------|:------------|:---------|
| `servicos-global/tenant/processos-core/prisma/fragment.prisma` | 1 | rename field |
| `servicos-global/tenant/processos-core/src/services/saldoEngine.ts` | ~15 | replace_all |
| `servicos-global/tenant/processos-core/src/routes/pedidos.ts` | ~8 | replace_all |
| `produto/pedido/server/src/services/transferirService.ts` | ~15 | replace_all |
| `produto/pedido/server/src/services/duplicarExcluirService.ts` | ~4 | replace_all |
| `produto/pedido/client/src/shared/types.ts` | ~3 | replace_all |
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | ~12 | replace_all |
| `produto/pedido/client/src/components/ModalTransferir.tsx` | ~4 | replace_all |
| `produto/pedido/server/prisma/seed.ts` | ~13 | replace_all |
| Testes unitários e funcionais | ~20 | replace_all |

## ESCOPO NEGATIVO

| Arquivo | Motivo |
|:--------|:-------|
| `servicos-global/tenant/prisma/schema.prisma` | Gerado pelo compose script — atualizar via script |
| `servicos-global/tenant/generated/` | Regenerado via `prisma generate` |
| Migration SQL files | Histórico imutável |
| Coluna DB `quantidade_atual` | Permanece via @map |
| Label "SALDO DO PEDIDO" | Nome de exibição, não campo de código |

---

## BLAST RADIUS

- **Contratos:** `saldo_item_pedido` some do tipo `PedidoItem` → qualquer código externo que use esse campo quebra em TypeScript
- **API JSON:** campo na resposta muda de nome → frontend deve ser atualizado na mesma execução (feito neste ajuste)
- **Testes:** todos os mocks com `saldo_item_pedido` ou `quantidade_atual_pedido` precisam ser atualizados

---

## CRITÉRIO DE SUCESSO

- `npx tsc --noEmit` sem erros novos
- `grep -r "saldo_item_pedido\|quantidade_atual_pedido" src/` retorna zero no código (exceto comentários históricos)
- Testes unitários: `saldoEngine.test.ts` 17/17, demais passam

## PLANO DE ROLLBACK

```bash
git checkout servicos-global/tenant/processos-core/prisma/fragment.prisma
git checkout servicos-global/tenant/processos-core/src/
git checkout produto/pedido/server/src/services/
git checkout produto/pedido/client/src/
git checkout testes/
```

---

## EXECUÇÃO

- **Commits realizados:** pendente
- **Divergências:** nenhuma
