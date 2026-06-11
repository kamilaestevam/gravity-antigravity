# Plano Cross-Organização — Seletor Produtos Gravity

**Documento canônico:** `testes/testes-unitarios/menu-botoes/seletor-produtos-gravity/_planos/PLANO-MESTRE-SELETOR-PRODUTOS-GRAVITY.json`

**Vetor crítico:** usuário da org A não deve obter lista de produtos de workspace da org B via API do seletor.  
**Produto Admin (Rodar Testes):** Configurador (`escopo` CONFIG)

---

## TST-CRO-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000080

| # | Cenário | Resultado esperado | Status |
|---|---------|-------------------|--------|
| C01 | PADRAO org_a consulta `ws_org_b` | 404; `findFirst` exige `id_organizacao: org_a` | implementado |
| C02 | Produto habilitado só em ws org_b | org_a não vê `product_key` no seletor | todo (integrado) |
| C03 | Portão 3 — usuário sem chave produto | slug omitido da resposta | todo (integrado) |

**Executar:**

```bash
npx vitest run --config testes/testes-cross-organizacao/menu-botoes/seletor-produtos-gravity/vitest.config.ts
```
