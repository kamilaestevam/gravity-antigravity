# E2E · Pedido / Lista · Coluna 16 — Qtd. Pronta do Pedido

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Qtd. Pronta do Pedido — campo calculado, não editável
**Regra de negócio:** soma de `quantidade_pronta_total_item_pedido` de todos os itens

---

## 1. Cabeçalho (Header)

- [ ] **C16-H01** — O cabeçalho está visível (quando ativado)?
- [ ] **C16-H02** — O texto exibido é exatamente `Qtd. Pronta do Pedido`?
- [ ] **C16-H03** — Hover exibe tooltip com "Calculado com base nos itens — não editável"?
- [ ] **C16-H04** — O popover exibe `Cresc.` e `Decresc.`?
- [ ] **C16-H05** — Clicar em `Cresc.` ordena do menor para o maior?
- [ ] **C16-H06** — Clicar em `Decresc.` ordena do maior para o menor?

---

## 2. Célula (Linhas Pai)

- [ ] **C16-C01** — A célula exibe o valor numérico?
- [ ] **C16-C02** — O valor está alinhado à direita?
- [ ] **C16-C03** — Célula sem valor exibe `—`?
- [ ] **C16-C04** — Nenhuma célula exibe `null` ou `undefined`?
- [ ] **C16-C05** — Duplo clique na célula NÃO abre edição?
- [ ] **C16-C06** — Pedido com itens de unidades diferentes exibe ícone de alerta ⚠?

---

## 3. Evidências

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c16-01-estado-inicial.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 12 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
