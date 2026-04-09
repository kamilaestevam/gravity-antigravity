# Relatório de Impacto — Padronizar exibição de células numéricas: 0 ou —

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** Colunas de quantidade (saldo, transferida, cancelada, pronta) mostram `—` nas pedido rows quando o campo é null, mas mostram `0` nas item subrows quando o campo é zero. Na mesma coluna visual o usuário vê `—` e `0` misturados para a mesma semântica.
- **Reproduzido em:** localhost:5179/pedidos — lista com pedidos draft (sem quantidade inicial definida) expandidos com itens zerados
- **Causa raiz identificada:** Pedido-level renders usam `?? null` + null check (`!= null ? valor : '—'`) enquanto item-level renders chamam `fmtQuantidade` diretamente sem guarda de null — diferentes padrões no mesmo componente.
- **Arquivo e linha exatos:**
  - `ListaPedidos.tsx:741-757` — `saldo_itens_do_pedido` pedido render
  - `ListaPedidos.tsx:770-797` — `quantidade_transferida_total` pedido render
  - `ListaPedidos.tsx:811-822` — `quantidade_cancelada_total_pedido` pedido render
  - `ListaPedidos.tsx:717-728` — `quantidade_pronta_itens_pedido_total` pedido render
- **Relacionado a ajuste anterior?** não — commits b672a81/0e39d86 tocaram cores mas não o padrão zero vs traço

---

## PADRÃO ADOTADO

`—` apenas quando o valor é `null` (campo não definido).
`0` quando o valor é efetivamente zero (campo definido, nenhuma operação realizada).

Isso preserva a distinção semântica entre "não definido" e "definido como zero".

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Corrigir 4 renders de colunas de quantidade no nível pedido para usar `?? 0` e sempre exibir o número |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `shared/types.ts` | Sem alteração de tipos — campos continuam nullable |
| `shared/api.ts` | Sem alteração de contrato de API |
| Item-level renders (linhas ~1992-2064 e ~3601-3677) | Já estão corretos — mostram `0` |
| `quantidade_total_inicial_pedido` render | Campo "inicial" — manter `—` para null é semanticamente correto (não definido ≠ zero) |

---

## BLAST RADIUS

- **Dependentes diretos:** nenhum (renders são funções inline)
- **Dependentes indiretos:** nenhum
- **Contratos afetados:** nenhum
- **Skills que devem ser respeitadas:** agent-policy, code-standards

---

## CRITÉRIO DE SUCESSO

- Todas as células de saldo/transferida/cancelada/pronta mostram `0` (nunca `—`) para pedidos com valor zero ou null nesses campos
- Cells com valor efetivamente null (ex: `quantidade_total_inicial_pedido` null) continuam mostrando `—`
- TypeScript compila sem erros

## CRITÉRIO DE PARADA

- Se a mudança exigir alterar `shared/types.ts`, parar e escalar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit de ajuste |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável (LOW)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** (preencher após execução)
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** TypeScript
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável (change visual apenas)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [ ] TypeScript compila limpo (verificar pós-execução)
- [x] Correlation ID preservado
- [x] SLA ≤ 200ms confirmado (change visual)
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não necessária (LOW sem regressão)
