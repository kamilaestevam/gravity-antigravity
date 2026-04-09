# Relatório de Impacto — Alinhamento células filho vs pai (Pedido)

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** Células das linhas filho (itens) aparecem com conteúdo deslocado ~6px para a direita em relação às células das linhas pai (pedidos) e ao cabeçalho.
- **Reproduzido em:** Tabela da Lista de Pedidos — qualquer pedido expandido com itens visíveis
- **Causa raiz identificada:** `padding-left: calc(0.5rem + 12px)` nas células filho cria padding assimétrico (20px esquerda vs 8px direita). Com `justify-content: center`, o ponto visual de centro é deslocado 6px para a direita comparado às células pai que têm `padding: 0 0.5rem` (8px simétrico).
- **Arquivo e linha exatos:** `produto/pedido/client/src/pages/ListaPedidos.css` — linha 97–101
- **Relacionado a ajuste anterior?** não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/client/src/pages/ListaPedidos.css` | Remover padding-left assimétrico; usar `padding: 0 0.5rem` simétrico nas células filho |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css` | Problema é específico da customização do produto Pedido |
| `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` | Nenhuma lógica de renderização afetada |
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Sem mudanças em componente/lógica |

---

## BLAST RADIUS

- **Dependentes diretos:** ListaPedidos.tsx (importa o CSS)
- **Dependentes indiretos:** nenhum
- **Contratos afetados:** nenhum
- **Skills que devem ser respeitadas neste ajuste:** `design-system` (padding/espaçamento), `code-standards`

---

## CRITÉRIO DE SUCESSO

- Conteúdo das células filho alinha visualmente com cabeçalho e células pai na mesma coluna
- Distinção visual filho/pai mantida (background, font-weight, cor)

## CRITÉRIO DE PARADA

- Se a remoção do indent quebrar alguma lógica de hierarquia visual em outra tela, parar e escalar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit ou restaurar `padding-left: calc(0.5rem + 12px)` na linha 97 |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável (LOW)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** a preencher
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** verificação visual
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo (alteração só em CSS)
- [x] Correlation ID preservado
- [x] SLA ≤ 200ms confirmado (não aplicável — CSS)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não necessária (LOW sem regressão)
