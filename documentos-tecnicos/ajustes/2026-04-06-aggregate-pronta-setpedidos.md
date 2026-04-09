# Relatório de Impacto — Recalcular aggregate pronta no setPedidos

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária (LOW)

---

## PROBLEMA

- **Descrição:** Após edição inline de `quantidade_pronta_total` de um item filho, a coluna do pedido pai `quantidade_pronta_itens_pedido_total` não recalcula em tempo real. A linha pai permanece com o valor antigo até o próximo fetch.
- **Reproduzido em:** `ListaPedidos.tsx` — branch `quantidade_pronta_total` de `handleEditarFilho`
- **Causa raiz identificada:** O `setPedidos` no branch `quantidade_pronta_total` (linha 4972) retorna `{ ...p, itens: itensAtualizados }` sem recalcular o aggregate. O `render` da coluna usa `??` que curto-circuita quando `quantidade_pronta_itens_pedido_total` é um número (não null/undefined), então o fallback para `reduce` não é atingido.
- **Arquivo e linha exatos:** `produto/pedido/client/src/pages/ListaPedidos.tsx:4972`
- **Relacionado a ajuste anterior?** sim
  - Se sim, qual: `documentos-tecnicos/ajustes/2026-04-06-edicao-inline-item-pedido.md`
  - Padrão de ciclo detectado? Não — é uma lacuna nova identificada pelo QA no mesmo dia, não um sintoma recorrente.

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Adicionar recálculo de `quantidade_pronta_itens_pedido_total` no setPedidos do branch `quantidade_pronta_total` |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `shared/types.ts` | Campo já existe como opcional — sem mudança |
| `shared/api.ts` | Nenhuma rota afetada |
| `servicos-global/tenant/processos-core/` | Backend não envolvido |
| `Configuracoes.tsx` | Referencia field name como string — não afetado |
| `gabiSemantica.ts` | Referencia field name como string — não afetado |

---

## BLAST RADIUS

- **Dependentes diretos:** nenhum (campo consumido apenas por render da coluna no mesmo arquivo)
- **Dependentes indiretos:** nenhum
- **Contratos afetados:** nenhum
- **Skills que devem ser respeitadas:** agent-policy, code-standards

---

## CRITÉRIO DE SUCESSO

- Após editar `quantidade_pronta_total` de um item filho, a linha do pedido pai exibe o total recalculado imediatamente, sem necessidade de reload.

## CRITÉRIO DE PARADA

- Se a mudança exigir tocar qualquer arquivo fora do escopo positivo, parar e reclassificar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert HEAD` ou restaurar a linha 4972 para `return { ...p, itens: itensAtualizados }` |

- **Tempo estimado de rollback:** < 2 minutos
- **Rollback testado em staging?** não aplicável (LOW)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** pendente
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** pendente
- **Testes que passaram:** pendente
- **Testes que falharam:** pendente
- **SLA validado:** não aplicável (frontend state)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [ ] Tenant isolation intacto
- [ ] Zero `any` introduzido
- [ ] Zero `console.log` esquecido
- [ ] TypeScript compila limpo
- [ ] Correlation ID preservado
- [ ] SLA ≤ 200ms confirmado
- [ ] Todas as skills da Fase 0.1 respeitadas
- [ ] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não obrigatória (LOW sem regressão)
