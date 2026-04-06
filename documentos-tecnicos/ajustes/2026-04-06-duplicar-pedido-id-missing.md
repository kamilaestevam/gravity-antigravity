# Relatório de Impacto — Duplicar Pedido: Argument 'id' is missing

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** MEDIUM
**Aprovação obtida:** não necessária (MEDIUM sem mudança de contrato)

---

## PROBLEMA

- **Descrição:** Ao duplicar um pedido, a operação falha com "Argument 'id' is missing" e reporta "1 pedido com erro"
- **Reproduzido em:** Lista de Pedidos → selecionar pedido → Duplicar → Confirmar
- **Causa raiz identificada:** `Pedido.id` e `PedidoItem.id` são `String @id` sem `@default(cuid())` no schema. O service remove corretamente o `id` original mas nunca gera um novo ID para o clone.
- **Arquivo e linha exatos:** `produto/pedido/server/src/services/duplicarExcluirService.ts:272` (pedido create), linha 246 (itensClonados), linha 363 (duplicarItens)
- **Problemas encadeados (após fix do id):**
  - `datas` spread inclui campos inexistentes no schema: `data_prevista_pedido_pronto`, `data_confirmada_pedido_pronto`, `data_meta_pedido_pronto`, `data_prevista_inspecao_pedido`, `data_confirmada_inspecao_pedido`, `data_meta_inspecao_pedido`
  - `pedidos_origem: []` não existe no modelo Pedido
  - `itensClonados` usa nomes errados: `saldo_item_pedido`, `quantidade_transferida_item`, `quantidade_cancelada_item_pedido`, `quantidade_pronta_total`, `data_transferencia_item`, `data_consolidacao_item` (schema usa `quantidade_atual_pedido`, `quantidade_transferida_pedido`, `quantidade_cancelada_pedido`, `quantidade_pronta_pedido`)
- **Relacionado a ajuste anterior?** não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/server/src/services/duplicarExcluirService.ts` | Adicionar `gerarId`, corrigir criação de pedido e itens clonados |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `produto/pedido/server/prisma/schema.prisma` | Schema correto — service é que estava errado |
| `produto/pedido/server/src/routes/duplicarExcluir.ts` | Rotas não têm bug |
| Qualquer outro serviço ou produto | Fora do escopo |

---

## BLAST RADIUS

- **Dependentes diretos:** `duplicarExcluir.ts` (chama o service) — sem mudança de contrato
- **Dependentes indiretos:** nenhum
- **Contratos afetados:** nenhum (correção interna do service)
- **Skills verificadas:** agent-policy, code-standards

---

## CRITÉRIO DE SUCESSO

- Duplicar um pedido cria um novo pedido com novo ID e itens clonados com novos IDs
- Status e campos do pedido original são copiados corretamente
- Quantidades dos itens são resetadas (pronta/transferida/cancelada = 0, atual = inicial)

## CRITÉRIO DE PARADA

- Se após o fix aparecerem outros erros de "Unknown field" não mapeados aqui, parar e reclassificar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit de fix |

- **Tempo estimado de rollback:** 2 minutos

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** a preencher
- **Arquivos alterados:** duplicarExcluirService.ts
- **Divergências do plano:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1 / 2
- **Testes que passaram:** a verificar
- **SLA validado:** não aplicável (operação batch, não crítica de latência)

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

**Próximo passo:** QA skill acionada? não (LOW sem regressão detectada, mas validar manualmente)
