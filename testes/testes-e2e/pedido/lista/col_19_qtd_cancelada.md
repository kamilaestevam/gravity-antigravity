# E2E · Pedido / Lista · Coluna 19 — Qtd. Cancelada do Pedido

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Qtd. Cancelada — campo calculado, não editável, cor vermelha quando > 0
**Regra de negócio:** derivado da soma de `quantidade_cancelada_item_pedido`; cor de erro (`#ef4444`) quando valor > 0

---

## 1. Cabeçalho (Header)

- [ ] **C19-H01** — O cabeçalho está visível (quando ativado)?
- [ ] **C19-H02** — O texto exibido é exatamente `Qtd. Cancelada do Pedido`?
- [ ] **C19-H03** — Hover exibe tooltip com "Total cancelado permanentemente nos itens"?
- [ ] **C19-H04** — O popover exibe `Cresc.` e `Decresc.`?
- [ ] **C19-H05** — Clicar em `Cresc.` ordena do menor para o maior?
- [ ] **C19-H06** — Clicar em `Decresc.` ordena do maior para o menor?

---

## 2. Célula (Linhas Pai)

- [ ] **C19-C01** — A célula exibe o valor numérico quando > 0?
- [ ] **C19-C02** — O valor está alinhado à direita?
- [ ] **C19-C03** — Valor > 0 exibe na cor vermelha (`#ef4444`)?
- [ ] **C19-C04** — Valor = 0 não exibe cor vermelha (usa cor padrão)?
- [ ] **C19-C05** — Célula sem valor exibe `—`?
- [ ] **C19-C06** — Nenhuma célula exibe `null` ou `undefined`?
- [ ] **C19-C07** — Duplo clique NÃO abre edição (campo calculado)?

---

## 3. Evidências

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial com valores vermelhos visíveis | `c19-01-estado-inicial.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 13 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
