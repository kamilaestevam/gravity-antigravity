# E2E · Pedido / Lista · Feature — Seleção e Checkboxes

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Checkboxes de seleção de linha + checkbox global no header + toolbar de ações

---

## 1. Checkbox de linha individual

- [ ] **CHK-L01** — O checkbox de cada linha pai está visível?
- [ ] **CHK-L02** — Clicar no checkbox marca a linha (`checked = true`)?
- [ ] **CHK-L03** — A linha selecionada recebe visual de destaque imediatamente?
- [ ] **CHK-L04** — Clicar novamente desmarca a linha (`checked = false`)?
- [ ] **CHK-L05** — Selecionar a linha pai NÃO seleciona automaticamente os itens filho?

---

## 2. Toolbar de ações — estado com 0 selecionados

- [ ] **CHK-Z01** — Com 0 pedidos selecionados, os botões de ação estão desabilitados ou ocultos?
- [ ] **CHK-Z02** — O botão `Transferir` está desabilitado?
- [ ] **CHK-Z03** — Os ícones `PencilLine`, `FilePdf`, `CopySimple`, `Trash` estão desabilitados?

---

## 3. Toolbar de ações — estado com 1+ selecionados

- [ ] **CHK-U01** — Com 1 pedido selecionado, os botões de ação ficam habilitados?
- [ ] **CHK-U02** — O botão `Transferir` está habilitado?
- [ ] **CHK-U03** — O ícone `Trash` (excluir) está habilitado?
- [ ] **CHK-U04** — O ícone `CopySimple` (duplicar) está habilitado?
- [ ] **CHK-U05** — O ícone `FilePdf` (gerar PDF) está habilitado?
- [ ] **CHK-U06** — O ícone `PencilLine` (edição em massa) está habilitado?

---

## 4. Checkbox global (header)

- [ ] **CHK-G01** — O checkbox global está visível no header da tabela?
- [ ] **CHK-G02** — Com 1 de N pedidos selecionados: checkbox global fica `indeterminate`?
- [ ] **CHK-G03** — Clicar no checkbox global (indeterminate) seleciona todos os pedidos visíveis?
- [ ] **CHK-G04** — Com todos selecionados: clicar no checkbox global deseleciona todos?
- [ ] **CHK-G05** — Checkbox global seleciona apenas os pedidos da tab ativa (não os de outras tabs)?

---

## 5. Seleção e regras especiais

- [ ] **CHK-E01** — Com 2+ pedidos selecionados: botão `Consolidar` fica habilitado?
- [ ] **CHK-E02** — Com apenas 1 pedido selecionado: botão `Consolidar` fica desabilitado?
- [ ] **CHK-E03** — Trocar de tab limpa a seleção atual?
- [ ] **CHK-E04** — Aplicar filtro de coluna com pedidos selecionados limpa a seleção?

---

## 6. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | 1 pedido selecionado — toolbar ativa | `chk-01-selecionado.png` |
| 2 | Checkbox global indeterminate | `chk-02-indeterminate.png` |
| 3 | Todos selecionados | `chk-03-todos.png` |
| 4 | 0 selecionados — toolbar desabilitada | `chk-04-zerado.png` |

---

## 7. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 26 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
