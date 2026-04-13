# E2E · Pedido / Lista · Coluna 04 — Nome do Importador

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna 4 — cabeçalho + célula + edição inline
**Pré-requisito:** pedidos de Exportação cadastrados (Importador é editável apenas em Exportação)
**Regra de negócio:** campo `nome_importador` só é editável em pedidos do tipo `exportacao`

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C04-H01** — O cabeçalho da coluna está visível?
- [ ] **C04-H02** — O texto exibido é exatamente `Nome do Importador`?

### 1.2 Ícone de filtro
- [ ] **C04-H03** — O ícone de filtro está visível?
- [ ] **C04-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C04-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C04-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C04-H07** — O popover exibe campo de busca de texto?
- [ ] **C04-H08** — O popover exibe o botão `Aplicar`?
- [ ] **C04-H09** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação crescente
- [ ] **C04-H10** — Clicar em `Cresc.` fecha o popover?
- [ ] **C04-H11** — Os importadores aparecem em ordem A→Z?

### 1.4 Ordenação decrescente
- [ ] **C04-H12** — Clicar em `Decresc.` fecha o popover?
- [ ] **C04-H13** — Os importadores aparecem em ordem Z→A?

### 1.5 Busca por texto parcial
- [ ] **C04-H14** — Digitar parcial de um importador existente preenche o campo?
- [ ] **C04-H15** — Clicar em `Aplicar` fecha o popover e aplica o filtro?
- [ ] **C04-H16** — Chip de filtro ativo aparece?
- [ ] **C04-H17** — Todas as linhas visíveis contêm o texto buscado?

### 1.6 Busca por texto completo
- [ ] **C04-H18** — Nome completo de importador → apenas pedidos com aquele importador?

### 1.7 Busca sem resultado
- [ ] **C04-H19** — Texto inexistente → estado vazio com mensagem?

### 1.8 Limpar filtro
- [ ] **C04-H20** — Clicar no `X` do chip remove o filtro e restaura a lista?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição
- [ ] **C04-C01** — A célula exibe o nome do importador?
- [ ] **C04-C02** — Célula sem valor exibe `—`?
- [ ] **C04-C03** — Nenhuma célula exibe `null` ou `undefined`?

### 2.2 Edição inline — linha de Exportação
- [ ] **C04-C04** — Duplo clique em linha de **Exportação** abre campo de edição?
- [ ] **C04-C05** — O campo de edição está pré-preenchido com o valor atual?
- [ ] **C04-C06** — Pressionar `Escape` cancela a edição sem salvar?
- [ ] **C04-C07** — O valor original é mantido após cancelar?
- [ ] **C04-C08** — Pressionar `Enter` confirma a edição?
- [ ] **C04-C09** — O novo valor aparece na célula após salvar?

### 2.3 Não editável — linha de Importação
- [ ] **C04-C10** — Duplo clique em linha de **Importação** NÃO abre campo de edição?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c04-01-estado-inicial.png` |
| 2 | Popover de filtro aberto | `c04-02-popover.png` |
| 3 | Filtro por importador ativo | `c04-03-filtro-ativo.png` |
| 4 | Edição inline aberta (linha Exportação) | `c04-04-edicao-inline.png` |
| 5 | Após cancelar com Escape | `c04-05-escape-cancelou.png` |

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
