# E2E · Pedido / Lista · Coluna 14 — Referência do Fabricante

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Referência do Fabricante — cabeçalho + célula editável + alerta de divergência
**Regra de negócio:** editável; alerta quando itens têm referências diferentes

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C14-H01** — O cabeçalho da coluna está visível (quando ativado)?
- [ ] **C14-H02** — O texto exibido é exatamente `Referência do Fabricante`?

### 1.2 Ícone de filtro
- [ ] **C14-H03** — O ícone de filtro está visível?
- [ ] **C14-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C14-H05** — O popover exibe `Cresc.`, `Decresc.`, campo de busca, `Aplicar` e `× Limpar filtro`?

### 1.3 Ordenação
- [ ] **C14-H06** — Clicar em `Cresc.` ordena A→Z?
- [ ] **C14-H07** — Clicar em `Decresc.` ordena Z→A?

### 1.4 Busca
- [ ] **C14-H08** — Busca parcial filtra corretamente?
- [ ] **C14-H09** — Limpar filtro restaura a lista?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição
- [ ] **C14-C01** — A célula exibe a referência do fabricante?
- [ ] **C14-C02** — Célula sem valor exibe `—`?
- [ ] **C14-C03** — Nenhuma célula exibe `null` ou `undefined`?

### 2.2 Edição inline
- [ ] **C14-C04** — Duplo clique na célula abre campo de edição?
- [ ] **C14-C05** — O campo está pré-preenchido com o valor atual?
- [ ] **C14-C06** — Pressionar `Escape` cancela sem salvar?
- [ ] **C14-C07** — Pressionar `Enter` confirma e atualiza a célula?

### 2.3 Divergência entre itens
- [ ] **C14-C08** — Pedido com itens de referências diferentes exibe ícone de alerta ⚠ amarelo?
- [ ] **C14-C09** — Hover no ícone exibe tooltip com as referências divergentes?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c14-01-estado-inicial.png` |
| 2 | Edição inline aberta | `c14-02-edicao-inline.png` |
| 3 | Ícone de divergência | `c14-03-divergencia.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 22 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
