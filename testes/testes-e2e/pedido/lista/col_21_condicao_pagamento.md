# E2E · Pedido / Lista · Coluna 21 — Condição de Pagamento

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Condição de Pagamento — editável no pedido, propaga para itens
**Regra de negócio:** editável; editar no pedido propaga para todos os itens; alerta quando itens divergem

---

## 1. Cabeçalho (Header)

- [ ] **C21-H01** — O cabeçalho está visível (quando ativado)?
- [ ] **C21-H02** — O texto exibido é exatamente `Condição de Pagamento do Pedido`?
- [ ] **C21-H03** — O popover exibe `Cresc.`, `Decresc.`, campo de busca, `Aplicar` e `× Limpar filtro`?
- [ ] **C21-H04** — Clicar em `Cresc.` ordena A→Z?
- [ ] **C21-H05** — Clicar em `Decresc.` ordena Z→A?
- [ ] **C21-H06** — Busca parcial filtra corretamente?
- [ ] **C21-H07** — Limpar filtro restaura a lista?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição
- [ ] **C21-C01** — A célula exibe a condição de pagamento?
- [ ] **C21-C02** — Célula sem valor exibe `—`?
- [ ] **C21-C03** — Nenhuma célula exibe `null` ou `undefined`?

### 2.2 Edição inline
- [ ] **C21-C04** — Duplo clique na célula abre campo de edição?
- [ ] **C21-C05** — O campo está pré-preenchido com o valor atual?
- [ ] **C21-C06** — Pressionar `Escape` cancela sem salvar?
- [ ] **C21-C07** — Pressionar `Enter` confirma e atualiza a célula?

### 2.3 Divergência entre itens
- [ ] **C21-C08** — Pedido com itens de condições diferentes exibe ícone de alerta ⚠ amarelo?
- [ ] **C21-C09** — Hover no ícone exibe tooltip com as condições divergentes?

---

## 3. Evidências

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c21-01-estado-inicial.png` |
| 2 | Edição inline aberta | `c21-02-edicao-inline.png` |
| 3 | Ícone de divergência | `c21-03-divergencia.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 21 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
