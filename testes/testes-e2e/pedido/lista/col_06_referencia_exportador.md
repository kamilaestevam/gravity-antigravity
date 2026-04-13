# E2E · Pedido / Lista · Coluna 06 — Referência Exportador

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna 6 — cabeçalho + célula editável + propagação para itens
**Pré-requisito:** pedidos cadastrados com e sem referência do exportador

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C06-H01** — O cabeçalho da coluna está visível?
- [ ] **C06-H02** — O texto exibido é exatamente `Referência Exportador`?

### 1.2 Ícone de filtro
- [ ] **C06-H03** — O ícone de filtro está visível?
- [ ] **C06-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C06-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C06-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C06-H07** — O popover exibe campo de busca de texto?
- [ ] **C06-H08** — O popover exibe o botão `Aplicar`?
- [ ] **C06-H09** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação crescente
- [ ] **C06-H10** — Clicar em `Cresc.` fecha o popover e ordena A→Z?

### 1.4 Ordenação decrescente
- [ ] **C06-H11** — Clicar em `Decresc.` fecha o popover e ordena Z→A?

### 1.5 Busca por texto parcial
- [ ] **C06-H12** — Digitar parcial de uma referência existente preenche o campo?
- [ ] **C06-H13** — Clicar em `Aplicar` fecha o popover?
- [ ] **C06-H14** — Chip de filtro ativo aparece?
- [ ] **C06-H15** — Todas as linhas visíveis contêm o texto buscado?

### 1.6 Busca por texto completo
- [ ] **C06-H16** — Referência completa → apenas pedidos com aquela referência?

### 1.7 Busca sem resultado
- [ ] **C06-H17** — Texto inexistente → estado vazio com mensagem?

### 1.8 Limpar filtro
- [ ] **C06-H18** — Clicar no `X` do chip remove o filtro e restaura a lista?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição
- [ ] **C06-C01** — A célula exibe a referência do exportador?
- [ ] **C06-C02** — Célula sem valor exibe `—`?
- [ ] **C06-C03** — Nenhuma célula exibe `null` ou `undefined`?

### 2.2 Edição inline
- [ ] **C06-C04** — Duplo clique na célula abre campo de edição?
- [ ] **C06-C05** — O campo de edição está pré-preenchido com o valor atual?
- [ ] **C06-C06** — Pressionar `Escape` cancela a edição sem salvar?
- [ ] **C06-C07** — O valor original é mantido após cancelar?
- [ ] **C06-C08** — Pressionar `Enter` confirma a edição?
- [ ] **C06-C09** — O novo valor aparece na célula após salvar?

### 2.3 Divergência entre itens
- [ ] **C06-C10** — Pedido cujos itens têm referências diferentes exibe ícone de alerta ⚠?
- [ ] **C06-C11** — O ícone de alerta tem cor amarela (`#F59E0B`)?
- [ ] **C06-C12** — Hover no ícone exibe tooltip com as referências divergentes?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c06-01-estado-inicial.png` |
| 2 | Popover de filtro aberto | `c06-02-popover.png` |
| 3 | Filtro ativo com chip | `c06-03-filtro-ativo.png` |
| 4 | Edição inline aberta | `c06-04-edicao-inline.png` |
| 5 | Ícone de divergência visível | `c06-05-divergencia.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 30 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
