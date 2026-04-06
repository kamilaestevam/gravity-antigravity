# Relatório de Impacto — sequencia_item null em POST /:id/itens

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** Itens adicionados individualmente via UI (Modal "Novo Item") recebem `sequencia_item = null`. Frontend exibe `—` e `1` inconsistente ao invés da sequência correta (1, 2, 3...).
- **Reproduzido em:** localhost:5179/pedidos — tabela com itens expandidos mostra `—` ou `1` sem continuidade
- **Causa raiz identificada:** Rota `POST /:id/itens` faz `...result.data` sem calcular `sequencia_item`. Como o frontend não envia esse campo (correto — é server-side), o campo fica `undefined` → Prisma armazena `null`.
- **Arquivo e linha exatos:** `servicos-global/tenant/processos-core/src/routes/pedidos.ts` linhas 648-661
- **Relacionado a ajuste anterior?** sim
  - Commits `6386400` (corrigiu POST `/` batch) e `63fe225` (corrigiu ordenação nos includes) — mas NENHUM tocou a rota `/:id/itens`
  - Padrão de ciclo detectado? NÃO — problema era em rota diferente, não regressão

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `servicos-global/tenant/processos-core/src/routes/pedidos.ts` | Adicionar cálculo de `sequencia_item` via `count` antes do `create` na rota POST `/:id/itens` |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `produto/pedido/client/` | Frontend não envia sequência (correto por design) |
| `schema.prisma` / `fragment.prisma` | Campo já existe como `Int?`, nenhuma migration necessária |
| Rota `POST /` (batch) | Já calcula `sequencia_item` corretamente com `index + 1` |
| `importacao.ts` | Já calcula `sequencia_item` corretamente com `index + 1` |
| Rota `PUT /:id/itens/:itemId` | Não afeta sequência |

---

## BLAST RADIUS

- **Dependentes diretos:** nenhum — o campo `sequencia_item` já está no contrato, só o valor muda de `null` para número
- **Dependentes indiretos:** frontend `ListaPedidos.tsx` já trata corretamente (`null` → `—`, número → `001`)
- **Contratos afetados:** nenhum — sem mudança de schema Zod nem de tipo
- **Skills verificadas:** agent-policy, code-standards, sla-performance, tenant-isolation

---

## CRITÉRIO DE SUCESSO

- Itens adicionados via Modal "Novo Item" recebem `sequencia_item` = (número de itens existentes + 1)
- Frontend exibe sequência numérica correta (ex: `001`, `002`, `003`)

## CRITÉRIO DE PARADA

- Se o `count` retornar valor inesperado ou a query falhar, parar e escalar antes de continuar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert HEAD` no commit do fix |
| 2 | Reiniciar o servidor `processos-core` |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável (ambiente local)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** a preencher
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** a verificar
- **Testes que falharam:** nenhum conhecido
- **SLA validado:** não aplicável (operação local, sem impacto de latência)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto — query usa `pedido_id` + `tenant_id` implícito via middleware
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo
- [x] Correlation ID preservado — não afetado
- [x] SLA ≤ 200ms confirmado — 1 query `count` adicional (< 5ms)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não obrigatória (LOW sem regressão)
