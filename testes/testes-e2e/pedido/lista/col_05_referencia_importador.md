# E2E · Pedido / Lista · Coluna 05 — Referência Importador

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna 5 — cabeçalho + célula editável + propagação para itens
**Pré-requisito:** pedidos cadastrados com e sem referência do importador

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C05-H01** — O cabeçalho da coluna está visível?
- [ ] **C05-H02** — O texto exibido é exatamente `Referência Importador`?

### 1.2 Ícone de filtro
- [ ] **C05-H03** — O ícone de filtro está visível?
- [ ] **C05-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C05-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C05-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C05-H07** — O popover exibe campo de busca de texto?
- [ ] **C05-H08** — O popover exibe o botão `Aplicar`?
- [ ] **C05-H09** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação crescente
- [ ] **C05-H10** — Clicar em `Cresc.` fecha o popover?
- [ ] **C05-H11** — As referências aparecem em ordem A→Z?

### 1.4 Ordenação decrescente
- [ ] **C05-H12** — Clicar em `Decresc.` fecha o popover?
- [ ] **C05-H13** — As referências aparecem em ordem Z→A?

### 1.5 Busca por texto parcial
- [ ] **C05-H14** — Digitar parcial de uma referência existente preenche o campo?
- [ ] **C05-H15** — Clicar em `Aplicar` fecha o popover?
- [ ] **C05-H16** — Chip de filtro ativo aparece?
- [ ] **C05-H17** — Todas as linhas visíveis contêm o texto buscado?

### 1.6 Busca por texto completo
- [ ] **C05-H18** — Referência completa → apenas pedidos com aquela referência?

### 1.7 Busca sem resultado
- [ ] **C05-H19** — Texto inexistente → estado vazio com mensagem?

### 1.8 Limpar filtro
- [ ] **C05-H20** — Clicar no `X` do chip remove o filtro e restaura a lista?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição
- [ ] **C05-C01** — A célula exibe a referência do importador?
- [ ] **C05-C02** — Célula sem valor exibe `—`?
- [ ] **C05-C03** — Nenhuma célula exibe `null` ou `undefined`?

### 2.2 Edição inline
- [ ] **C05-C04** — Duplo clique na célula abre campo de edição?
- [ ] **C05-C05** — O campo de edição está pré-preenchido com o valor atual?
- [ ] **C05-C06** — Pressionar `Escape` cancela a edição sem salvar?
- [ ] **C05-C07** — O valor original é mantido após cancelar?
- [ ] **C05-C08** — Pressionar `Enter` confirma a edição?
- [ ] **C05-C09** — O novo valor aparece na célula após salvar?

### 2.3 Divergência entre itens
- [ ] **C05-C10** — Pedido cujos itens têm referências diferentes exibe ícone de alerta ⚠?
- [ ] **C05-C11** — O ícone de alerta tem cor amarela (`#F59E0B`)?
- [ ] **C05-C12** — Hover no ícone exibe tooltip com as referências divergentes?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c05-01-estado-inicial.png` |
| 2 | Popover de filtro aberto | `c05-02-popover.png` |
| 3 | Filtro ativo com chip | `c05-03-filtro-ativo.png` |
| 4 | Edição inline aberta | `c05-04-edicao-inline.png` |
| 5 | Ícone de divergência visível | `c05-05-divergencia.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 32 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
