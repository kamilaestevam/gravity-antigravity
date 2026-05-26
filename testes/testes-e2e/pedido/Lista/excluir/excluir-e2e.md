# Plano E2E — Excluir Pedido

> **ID:** TST-E2E-PEDIDO-EXCLUIR-000001
> **Status:** Pendente aprovação do dono + execução em staging
> **Pasta:** `testes/testes-e2e/pedido/Lista/excluir/`

---

## Smoke obrigatório pós-deploy (hotfix 2026-05-26)

1. Pedido com status custom `pagamento_aprovado` → Excluir → preview mostra permitido
2. Marcar status `consolidado` como bloqueado em Configurações → preview bloqueia
3. Excluir item de pedido com muitos itens → conclui sem timeout (< 30s)

---

## Casos E2E completos (futuro)

| ID | Cenário |
|----|---------|
| E-EXC-01 | Excluir pedido único permitido |
| E-EXC-02 | Excluir mix permitido + bloqueado (parcial) |
| E-EXC-03 | Excluir último item com `excluir_pedido_sem_item_permitido=false` |

Spec Playwright: `TST-E2E-PEDIDO-EXCLUIR-001.spec.ts` (a criar após aprovação).
