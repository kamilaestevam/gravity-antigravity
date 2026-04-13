# E2E · Pedido / Lista · Coluna 13 — Data P.O

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Data P.O — cabeçalho + célula com data formatada
**Regra de negócio:** data de emissão da Purchase Order; formatada via `fmtData()`

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C13-H01** — O cabeçalho da coluna está visível (quando ativado)?
- [ ] **C13-H02** — O texto exibido é exatamente `Data P.O`?

### 1.2 Ícone de filtro
- [ ] **C13-H03** — O ícone de filtro está visível?
- [ ] **C13-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C13-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C13-H06** — O popover exibe o botão `Decresc.`?

### 1.3 Ordenação por data
- [ ] **C13-H07** — Clicar em `Cresc.` ordena da data mais antiga para a mais recente?
- [ ] **C13-H08** — Clicar em `Decresc.` ordena da data mais recente para a mais antiga?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição
- [ ] **C13-C01** — A célula exibe a data no formato correto (ex: `15/04/2026` ou `2026-04-15`)?
- [ ] **C13-C02** — Célula sem valor exibe `—`?
- [ ] **C13-C03** — Nenhuma célula exibe `null`, `undefined`, `Invalid Date` ou string vazia?

### 2.2 Não editável inline
- [ ] **C13-C04** — Duplo clique na célula não abre campo de texto livre?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial com datas formatadas | `c13-01-estado-inicial.png` |
| 2 | Após ordenar por data crescente | `c13-02-crescente.png` |
| 3 | Após ordenar por data decrescente | `c13-03-decrescente.png` |

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
