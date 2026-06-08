# Plano Funcional — Seletor Produtos Gravity

**Documento canônico:** `testes/testes-unitarios/menu-botoes/seletor-produtos-gravity/_planos/PLANO-MESTRE-SELETOR-PRODUTOS-GRAVITY.json`

**Escopo:** `menu-botoes/seletor-produtos-gravity`  
**Feature:** API Configurador consumida pelo `useProdutosSwitcher`  
**Produto Admin (Rodar Testes):** Configurador (`escopo` CONFIG)

---

## TST-FUN-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000077 — GET produtos-gravity workspace

| # | Pré-condição | Passos | Resultado esperado |
|---|--------------|--------|-------------------|
| F01 | Auth org_a, workspace ws_a da mesma org | GET `/api/v1/workspaces/ws_a/produtos-gravity` | 200, body `{ products: [...] }` com `product_key`, `is_active`, `catalog` |
| F02 | Auth org_a, workspace inexistente ou de org_b | GET com id_workspace alheio | 404 NOT_FOUND |

**Spec:** `TST-FUN-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000077.test.ts`

**Executar:**

```bash
npx vitest run --config testes/testes-funcionais/menu-botoes/seletor-produtos-gravity/vitest.config.ts
```

---

## Resultado

| ID | Status |
|----|--------|
| TST-FUN-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000077 | implementado |
