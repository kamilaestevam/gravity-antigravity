# Relatório de Impacto — Tooltip no alerta de divergência

**Data:** 2026-04-07
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** ícone ⚠️ nas colunas "Valor Total do Pedido" e "Qtd. Inicial do Pedido" não exibe tooltip. O usuário não consegue ver o valor esperado, soma dos itens, divergência absoluta e percentual sem abrir o pedido.
- **Reproduzido em:** ListaPedidos — coluna valor total ou qtd. inicial com divergência entre pedido e itens
- **Causa raiz identificada:** `Warning` icon renderizado sem wrapper `TooltipGlobal`. Os dados necessários (num, somaItens) já existem nas variáveis locais do render.
- **Arquivo e linha exatos:** `produto/pedido/client/src/pages/ListaPedidos.tsx:625` e `:651`
- **Relacionado a ajuste anterior?** não
- **Padrão de ciclo detectado?** não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Wrap do `Warning` com `TooltipGlobal` nos dois renders (valor e qtd.) |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `shared/types.ts` | Nenhuma mudança de contrato |
| `shared/api.ts` | Nenhuma chamada de API envolvida |
| Qualquer backend | Puramente visual |
| `nucleo-global/tooltip-global` | TooltipGlobal já importado e funcional |

---

## BLAST RADIUS

- **Dependentes diretos:** nenhum (render interno da coluna)
- **Dependentes indiretos:** nenhum
- **Contratos afetados:** nenhum
- **Skills verificadas:** tooltip, code-standards, agent-policy

---

## CRITÉRIO DE SUCESSO

- Hover no ícone ⚠️ exibe tooltip com: valor do pedido, soma dos itens, diferença absoluta, divergência percentual

## CRITÉRIO DE PARADA

- Se TooltipGlobal causar erro de TypeScript ou conflito de prop, parar e investigar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit ou remoção manual do wrapper `TooltipGlobal` |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável (LOW)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** pendente
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** visual + TypeScript
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo
- [x] Correlation ID preservado (não afetado)
- [x] SLA ≤ 200ms confirmado (não afetado)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não (LOW sem regressão)
