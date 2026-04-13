# E2E · Pedido / Lista · Coluna 09 — Número da Proforma

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Número da Proforma — cabeçalho + célula
**Regra de negócio:** campo de texto livre; exibe `—` quando não informado

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C09-H01** — O cabeçalho da coluna está visível (quando ativado)?
- [ ] **C09-H02** — O texto exibido é exatamente `Número da Proforma`?

### 1.2 Ícone de filtro
- [ ] **C09-H03** — O ícone de filtro está visível?
- [ ] **C09-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C09-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C09-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C09-H07** — O popover exibe campo de busca de texto?
- [ ] **C09-H08** — O popover exibe o botão `Aplicar`?
- [ ] **C09-H09** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação
- [ ] **C09-H10** — Clicar em `Cresc.` fecha o popover e ordena A→Z?
- [ ] **C09-H11** — Clicar em `Decresc.` fecha o popover e ordena Z→A?

### 1.4 Busca
- [ ] **C09-H12** — Busca parcial por número de proforma filtra corretamente?
- [ ] **C09-H13** — Busca completa retorna apenas o pedido com aquele número?
- [ ] **C09-H14** — Busca sem resultado exibe estado vazio?
- [ ] **C09-H15** — Limpar filtro restaura a lista?

---

## 2. Célula (Linhas Pai)

- [ ] **C09-C01** — A célula exibe o número da proforma quando informado?
- [ ] **C09-C02** — Célula sem valor exibe `—`?
- [ ] **C09-C03** — Nenhuma célula exibe `null` ou `undefined`?
- [ ] **C09-C04** — Duplo clique na célula NÃO abre edição (campo não editável inline)?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c09-01-estado-inicial.png` |
| 2 | Filtro por número de proforma ativo | `c09-02-filtro-ativo.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 19 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
