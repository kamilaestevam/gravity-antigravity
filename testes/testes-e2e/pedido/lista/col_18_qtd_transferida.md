# E2E · Pedido / Lista · Coluna 18 — Qtd. Transferida do Pedido

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Qtd. Transferida — campo calculado, não editável, cor azul
**Regra de negócio:** soma de `quantidade_transferida_item_pedido` de todos os itens; sempre azul (`#60a5fa`)

---

## 1. Cabeçalho (Header)

- [ ] **C18-H01** — O cabeçalho está visível (quando ativado)?
- [ ] **C18-H02** — O texto exibido é exatamente `Qtd. Transferida do Pedido`?
- [ ] **C18-H03** — Hover exibe tooltip com "Soma da quantidade transferida de todos os itens"?
- [ ] **C18-H04** — O popover exibe `Cresc.` e `Decresc.`?
- [ ] **C18-H05** — Clicar em `Cresc.` ordena do menor para o maior?
- [ ] **C18-H06** — Clicar em `Decresc.` ordena do maior para o menor?

---

## 2. Célula (Linhas Pai)

- [ ] **C18-C01** — A célula exibe o valor numérico?
- [ ] **C18-C02** — O valor está alinhado à direita?
- [ ] **C18-C03** — O valor é sempre exibido na cor azul (`#60a5fa`)?
- [ ] **C18-C04** — Célula com valor 0 ou sem dados exibe `—`?
- [ ] **C18-C05** — Nenhuma célula exibe `null` ou `undefined`?
- [ ] **C18-C06** — Duplo clique NÃO abre edição (campo calculado)?

---

## 3. Evidências

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial com valores azuis | `c18-01-estado-inicial.png` |

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
