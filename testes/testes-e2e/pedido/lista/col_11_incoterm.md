# E2E · Pedido / Lista · Coluna 11 — Incoterm

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Incoterm — cabeçalho + célula editável + alerta de divergência
**Regra de negócio:** editável no pedido; propagado para todos os itens; alerta quando itens têm incoterms diferentes

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C11-H01** — O cabeçalho da coluna está visível (quando ativado)?
- [ ] **C11-H02** — O texto exibido é exatamente `Incoterm`?

### 1.2 Ícone de filtro
- [ ] **C11-H03** — O ícone de filtro está visível?
- [ ] **C11-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C11-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C11-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C11-H07** — O popover exibe campo de busca de texto?
- [ ] **C11-H08** — O popover exibe o botão `Aplicar`?
- [ ] **C11-H09** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação
- [ ] **C11-H10** — Clicar em `Cresc.` fecha o popover e ordena A→Z?
- [ ] **C11-H11** — Clicar em `Decresc.` fecha o popover e ordena Z→A?

### 1.4 Busca
- [ ] **C11-H12** — Busca por `FOB` retorna apenas pedidos com Incoterm FOB?
- [ ] **C11-H13** — Busca por `CIF` retorna apenas pedidos com Incoterm CIF?
- [ ] **C11-H14** — Limpar filtro restaura a lista completa?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição
- [ ] **C11-C01** — A célula exibe o Incoterm do pedido (ex: `FOB`, `CIF`, `EXW`)?
- [ ] **C11-C02** — Célula sem valor exibe `—`?
- [ ] **C11-C03** — Nenhuma célula exibe `null` ou `undefined`?
- [ ] **C11-C04** — O texto está centralizado na célula?

### 2.2 Edição inline
- [ ] **C11-C05** — Duplo clique na célula abre campo de edição?
- [ ] **C11-C06** — O campo está pré-preenchido com o valor atual?
- [ ] **C11-C07** — Pressionar `Escape` cancela sem salvar?
- [ ] **C11-C08** — Pressionar `Enter` confirma e atualiza a célula?

### 2.3 Divergência entre itens
- [ ] **C11-C09** — Pedido com itens de Incoterms diferentes exibe ícone de alerta ⚠?
- [ ] **C11-C10** — O ícone de alerta tem cor amarela (`#F59E0B`)?
- [ ] **C11-C11** — O tooltip do alerta lista os Incoterms divergentes (ex: `FOB | CIF`)?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c11-01-estado-inicial.png` |
| 2 | Filtro por FOB ativo | `c11-02-filtro-fob.png` |
| 3 | Edição inline aberta | `c11-03-edicao-inline.png` |
| 4 | Ícone de divergência de Incoterm | `c11-04-divergencia.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 25 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
