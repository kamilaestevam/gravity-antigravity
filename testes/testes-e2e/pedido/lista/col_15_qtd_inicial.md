# E2E · Pedido / Lista · Coluna 15 — Qtd. Inicial do Pedido

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Qtd. Inicial do Pedido — campo calculado, não editável
**Regra de negócio:** soma de `quantidade_inicial_item_pedido` de todos os itens; alerta quando itens têm unidades diferentes

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C15-H01** — O cabeçalho da coluna está visível (quando ativado)?
- [ ] **C15-H02** — O texto exibido é exatamente `Qtd. Inicial do Pedido`?

### 1.2 Tooltip do header
- [ ] **C15-H03** — Hover sobre o header exibe tooltip?
- [ ] **C15-H04** — O tooltip contém "Calculado com base nos itens — não editável"?

### 1.3 Ícone de filtro
- [ ] **C15-H05** — O ícone de filtro está visível?
- [ ] **C15-H06** — O popover exibe `Cresc.` e `Decresc.`?
- [ ] **C15-H07** — O popover exibe campos de valor mínimo e máximo?

### 1.4 Ordenação
- [ ] **C15-H08** — Clicar em `Cresc.` ordena do menor para o maior?
- [ ] **C15-H09** — Clicar em `Decresc.` ordena do maior para o menor?

---

## 2. Célula (Linhas Pai)

- [ ] **C15-C01** — A célula exibe o valor numérico com separador de milhar quando aplicável?
- [ ] **C15-C02** — O valor está alinhado à direita?
- [ ] **C15-C03** — Célula sem valor exibe `—`?
- [ ] **C15-C04** — Nenhuma célula exibe `null` ou `undefined`?
- [ ] **C15-C05** — Duplo clique na célula NÃO abre edição (campo calculado)?
- [ ] **C15-C06** — Pedido com itens de unidades diferentes exibe ícone de alerta ⚠?

---

## 3. Evidências

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c15-01-estado-inicial.png` |
| 2 | Alerta de unidades divergentes | `c15-02-divergencia.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 14 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
