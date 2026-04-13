# E2E · Pedido / Lista · Coluna 10 — Número da Invoice

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Número da Invoice — cabeçalho + célula
**Regra de negócio:** campo de texto livre; exibe `—` quando não informado

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C10-H01** — O cabeçalho da coluna está visível (quando ativado)?
- [ ] **C10-H02** — O texto exibido é exatamente `Número da Invoice`?

### 1.2 Ícone de filtro
- [ ] **C10-H03** — O ícone de filtro está visível?
- [ ] **C10-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C10-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C10-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C10-H07** — O popover exibe campo de busca de texto?
- [ ] **C10-H08** — O popover exibe o botão `Aplicar`?
- [ ] **C10-H09** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação
- [ ] **C10-H10** — Clicar em `Cresc.` fecha o popover e ordena A→Z?
- [ ] **C10-H11** — Clicar em `Decresc.` fecha o popover e ordena Z→A?

### 1.4 Busca
- [ ] **C10-H12** — Busca parcial por número de invoice filtra corretamente?
- [ ] **C10-H13** — Busca completa retorna apenas o pedido com aquele número?
- [ ] **C10-H14** — Busca sem resultado exibe estado vazio?
- [ ] **C10-H15** — Limpar filtro restaura a lista?

---

## 2. Célula (Linhas Pai)

- [ ] **C10-C01** — A célula exibe o número da invoice quando informado?
- [ ] **C10-C02** — Célula sem valor exibe `—`?
- [ ] **C10-C03** — Nenhuma célula exibe `null` ou `undefined`?
- [ ] **C10-C04** — Duplo clique na célula NÃO abre edição (campo não editável inline)?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c10-01-estado-inicial.png` |
| 2 | Filtro por número de invoice ativo | `c10-02-filtro-ativo.png` |

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
