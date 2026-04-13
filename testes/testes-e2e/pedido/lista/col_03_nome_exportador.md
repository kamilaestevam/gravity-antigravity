# E2E · Pedido / Lista · Coluna 03 — Nome do Exportador

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna 3 — cabeçalho + célula + edição inline
**Pré-requisito:** pedidos de Importação cadastrados (Exportador é editável apenas em Importação)
**Regra de negócio:** campo `nome_exportador` só é editável em pedidos do tipo `importacao`

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C03-H01** — O cabeçalho da coluna está visível?
- [ ] **C03-H02** — O texto exibido é exatamente `Nome do Exportador`?

### 1.2 Ícone de filtro
- [ ] **C03-H03** — O ícone de filtro está visível?
- [ ] **C03-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C03-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C03-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C03-H07** — O popover exibe campo de busca de texto?
- [ ] **C03-H08** — O popover exibe o botão `Aplicar`?
- [ ] **C03-H09** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação crescente
- [ ] **C03-H10** — Clicar em `Cresc.` fecha o popover?
- [ ] **C03-H11** — Os exportadores aparecem em ordem A→Z?

### 1.4 Ordenação decrescente
- [ ] **C03-H12** — Clicar em `Decresc.` fecha o popover?
- [ ] **C03-H13** — Os exportadores aparecem em ordem Z→A?

### 1.5 Busca por texto parcial
- [ ] **C03-H14** — Digitar parcial de um exportador existente preenche o campo?
- [ ] **C03-H15** — Clicar em `Aplicar` fecha o popover?
- [ ] **C03-H16** — Chip de filtro ativo aparece?
- [ ] **C03-H17** — Todas as linhas visíveis contêm o texto buscado no exportador?

### 1.6 Busca por texto completo
- [ ] **C03-H18** — Digitar o nome completo de um exportador e aplicar?
- [ ] **C03-H19** — Apenas pedidos com aquele exportador exato aparecem?

### 1.7 Busca sem resultado
- [ ] **C03-H20** — Texto inexistente → estado vazio com mensagem?

### 1.8 Limpar filtro
- [ ] **C03-H21** — Clicar no `X` do chip remove o filtro e restaura a lista?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição
- [ ] **C03-C01** — A célula exibe o nome do exportador?
- [ ] **C03-C02** — Célula sem valor exibe `—`?
- [ ] **C03-C03** — Nenhuma célula exibe `null` ou `undefined`?

### 2.2 Edição inline — linha de Importação
- [ ] **C03-C04** — Duplo clique em linha de **Importação** abre campo de edição?
- [ ] **C03-C05** — O campo de edição está pré-preenchido com o valor atual?
- [ ] **C03-C06** — Pressionar `Escape` cancela a edição sem salvar?
- [ ] **C03-C07** — O valor original é mantido após cancelar com `Escape`?
- [ ] **C03-C08** — Pressionar `Enter` confirma a edição?
- [ ] **C03-C09** — O novo valor aparece na célula após salvar?

### 2.3 Não editável — linha de Exportação
- [ ] **C03-C10** — Duplo clique em linha de **Exportação** NÃO abre campo de edição?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c03-01-estado-inicial.png` |
| 2 | Popover de filtro aberto | `c03-02-popover.png` |
| 3 | Filtro por exportador ativo | `c03-03-filtro-ativo.png` |
| 4 | Edição inline aberta (linha Importação) | `c03-04-edicao-inline.png` |
| 5 | Após cancelar com Escape | `c03-05-escape-cancelou.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 31 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
