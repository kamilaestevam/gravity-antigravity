# E2E · Pedido / Lista · Coluna 12 — Valor Total do Pedido

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Valor Total do Pedido — campo calculado, não editável
**Regra de negócio:** calculado com base nos itens; alerta quando itens têm moedas diferentes; exibe badge de moeda + valor

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C12-H01** — O cabeçalho da coluna está visível (quando ativado)?
- [ ] **C12-H02** — O texto exibido é exatamente `Valor Total do Pedido`?

### 1.2 Tooltip do header
- [ ] **C12-H03** — Hover sobre o header exibe tooltip?
- [ ] **C12-H04** — O tooltip contém o texto "Calculado com base nos itens — não editável"?

### 1.3 Ícone de filtro (numérico)
- [ ] **C12-H05** — O ícone de filtro está visível?
- [ ] **C12-H06** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C12-H07** — O popover exibe o botão `Cresc.`?
- [ ] **C12-H08** — O popover exibe o botão `Decresc.`?
- [ ] **C12-H09** — O popover exibe campo de valor mínimo?
- [ ] **C12-H10** — O popover exibe campo de valor máximo?
- [ ] **C12-H11** — O popover exibe o botão `Aplicar`?

### 1.4 Ordenação
- [ ] **C12-H12** — Clicar em `Cresc.` fecha o popover e ordena do menor para o maior?
- [ ] **C12-H13** — Clicar em `Decresc.` fecha o popover e ordena do maior para o menor?

### 1.5 Filtro numérico
- [ ] **C12-H14** — Informar um valor mínimo e aplicar exibe apenas pedidos com valor ≥ mínimo?
- [ ] **C12-H15** — Limpar filtro restaura a lista completa?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição
- [ ] **C12-C01** — A célula exibe badge de moeda (ex: `USD`, `BRL`) + valor numérico?
- [ ] **C12-C02** — O valor está alinhado à direita?
- [ ] **C12-C03** — Célula sem valor exibe `—`?
- [ ] **C12-C04** — Nenhuma célula exibe `null` ou `undefined`?

### 2.2 Divergência de moeda entre itens
- [ ] **C12-C05** — Pedido com itens em moedas diferentes exibe ícone de alerta ⚠?
- [ ] **C12-C06** — O ícone de alerta tem cor amarela (`#F59E0B`)?
- [ ] **C12-C07** — O tooltip do alerta lista as moedas divergentes (ex: `USD | BRL`)?

### 2.3 Campo calculado — não editável
- [ ] **C12-C08** — Duplo clique na célula NÃO abre campo de edição?
- [ ] **C12-C09** — Hover na célula exibe tooltip com explicação do cálculo?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial com badge de moeda | `c12-01-estado-inicial.png` |
| 2 | Popover de filtro numérico | `c12-02-popover-numerico.png` |
| 3 | Filtro por valor mínimo ativo | `c12-03-filtro-ativo.png` |
| 4 | Alerta de moeda divergente | `c12-04-divergencia-moeda.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 24 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
