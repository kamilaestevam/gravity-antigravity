# Plano E2E — Novo Pedido Manual

> **ID:** TST-E2E-PEDIDO-NOVO-000001
> **Status:** Pendente aprovação do dono + execução em staging
> **Pasta:** `testes/testes-e2e/pedido/Lista/novo-pedido/`

---

## Smoke obrigatório pós-deploy (hotfix 2026-05-26)

1. Lista → Novo → selecionar importador (fornecedor Cadastros) → Salvar
2. Console do browser **sem** ZodError de `empresaSchema` / `cep_unidade_empresa`
3. Pedido criado aparece no topo da lista (status rascunho)

---

## Casos E2E completos (futuro)

| ID | Cenário |
|----|---------|
| E-NPM-01 | Criar pedido manual mínimo (sem campos obrigatórios) |
| E-NPM-02 | Criar pedido + adicionar item inline |
| E-NPM-03 | Fechar drawer com dados → confirma descarte |

Spec Playwright: `TST-E2E-PEDIDO-NOVO-001.spec.ts` (a criar após aprovação).
