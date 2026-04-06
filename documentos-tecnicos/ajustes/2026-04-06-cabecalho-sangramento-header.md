# Relatório de Impacto — Cabeçalho da Tabela Sangrando ao Rolar

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** Ao rolar a tabela, conteúdo de linhas de dados (texto e badges) aparece visível dentro da área do cabeçalho sticky.
- **Reproduzido em:** localhost:5179/pedidos — tela Lista, qualquer rolagem vertical
- **Causa raiz identificada:** `.gtv-cabecalho` tem `background: rgba(129, 140, 248, 0.04)` (4% opacidade — quase transparente). Com a abordagem `paddingStart: CABECALHO_HEIGHT` + `top: virtualItem.start - CABECALHO_HEIGHT` (commit d4eeafd), os primeiros itens visíveis são posicionados em y=0 no viewport (atrás do header sticky). Com background transparente, o conteúdo das linhas sangra através do header.
- **Arquivo e linha exatos:** `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css:565`
- **Relacionado a ajuste anterior?** sim
  - Commit: d4eeafd (fix paddingStart duplicado) introduziu o padrão paddingStart=40/top=start-40 que coloca rows em y=0 atrás do header
  - Padrão de ciclo detectado? **não** — causa raiz identificada e isolada no CSS

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css` | Mudar background de `.gtv-cabecalho` para `var(--gtv-bg)` (opaco) |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `TabelaVirtualGlobal.tsx` | Lógica do virtualizer está correta; problema é só CSS |
| `produto/pedido/` | Produto consumidor, sem alteração necessária |
| Qualquer arquivo backend | Problema puramente visual/CSS |

---

## BLAST RADIUS

- **Dependentes diretos:** Todo componente que usa `TabelaVirtualGlobal` (todos os produtos)
- **Dependentes indiretos:** nenhum — mudança puramente visual no CSS
- **Contratos afetados:** nenhum
- **Skills que devem ser respeitadas:** `skills/ux/design-system/SKILL.md`, `skills/arquitetura/nucleo-global/SKILL.md`

---

## CRITÉRIO DE SUCESSO

- Header tem background sólido — linhas que rolam atrás dele não ficam visíveis
- Células frozen continuam com background consistente
- Light theme continua correto (usa `var(--gtv-bg)` via CSS vars)

## CRITÉRIO DE PARADA

- Se a mudança quebrar o visual do light-theme de forma inesperada, reverter e investigar

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | Reverter linha 565 de `var(--gtv-bg)` para `rgba(129, 140, 248, 0.04)` |

- **Tempo estimado de rollback:** 1 minuto
- **Rollback testado em staging?** não aplicável

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** pendente
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** visual check
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável (CSS)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo (sem alteração .ts)
- [x] Correlation ID preservado
- [x] SLA ≤ 200ms confirmado (sem alteração backend)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não (LOW sem regressão detectada)
