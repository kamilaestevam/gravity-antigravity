# Relatório de Impacto — depara CSS ausente (espaçamento no preview de edição em massa)

**Data:** 2026-04-07
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** Seção "Detalhe por pedido" no modal de edição em massa mostra o número do pedido, valor atual, seta e valor novo concatenados sem espaçamento (ex: `PO-2026/001"PRO-2026/001"→"001"`).
- **Reproduzido em:** Modal Editar em Massa → Passo 1 → Preview → seção "Detalhe por pedido" (expandir campo).
- **Causa raiz identificada:** Família de classes `.modal-edicao-massa__depara*` usada no JSX (ModalEdicaoEmMassa.tsx:556-630) mas nunca definida em ModalEdicaoEmMassa.css. Os `<span>` fluem como elementos `inline` sem gap.
- **Arquivo e linha exatos:** `ModalEdicaoEmMassa.css` — ausência total de regras para `__depara`.
- **Relacionado a ajuste anterior?** não.

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/client/src/components/ModalEdicaoEmMassa.css` | Adicionar regras CSS para a família `.modal-edicao-massa__depara*` |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `ModalEdicaoEmMassa.tsx` | JSX já está correto — spans com classes corretas, sem alteração necessária |
| `edicaoEmMassaService.ts` | Backend não afetado — apenas visual |
| Qualquer outro arquivo | Ajuste cirúrgico de CSS puro |

---

## BLAST RADIUS

- **Dependentes diretos:** nenhum — classes sem uso externo ao componente
- **Dependentes indiretos:** nenhum
- **Contratos afetados:** nenhum
- **Skills relevantes:** `skills/ux/design-system/SKILL.md`

---

## CRITÉRIO DE SUCESSO

- Linhas do "Detalhe por pedido" exibem: `PO-2026/001  "PRO-2026/001"  →  "001"` com espaçamento legível
- Acordeão de campos abre/fecha visualmente correto
- Linha "sem alteração" aparece com opacidade reduzida

## CRITÉRIO DE PARADA

- Se CSS causar quebra visual em outro componente (vazamento de estilo), parar e revisar seletores.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git checkout -- produto/pedido/client/src/components/ModalEdicaoEmMassa.css` |

- **Tempo estimado de rollback:** < 1 minuto
- **Rollback testado em staging?** não aplicável (LOW)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** —
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** —

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** —
- **SLA validado:** não aplicável

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto (CSS puro)
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo (sem mudança de TS)
- [x] Correlation ID preservado (sem mudança de rota)
- [x] SLA ≤ 200ms confirmado (sem mudança de lógica)
- [x] Escopo Negativo respeitado

**Próximo passo:** LOW sem regressão — QA não obrigatória
