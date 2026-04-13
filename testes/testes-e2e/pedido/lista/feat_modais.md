# E2E · Pedido / Lista · Feature — Modais de Ação em Massa

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Modais acionados pela toolbar — Transferir, Consolidar, Edição em Massa, Gerar PDF, Duplicar, Excluir

---

## 1. Modal Excluir (Trash)

- [ ] **MOD-EX01** — Com 1 pedido selecionado, o ícone `Trash` fica habilitado?
- [ ] **MOD-EX02** — Clicar em `Trash` abre modal de confirmação (não exclui imediatamente)?
- [ ] **MOD-EX03** — O modal de confirmação exibe o nome/número do pedido a ser excluído?
- [ ] **MOD-EX04** — Clicar em `Cancelar` fecha o modal sem excluir?
- [ ] **MOD-EX05** — O pedido ainda está presente na lista após cancelar?
- [ ] **MOD-EX06** — Pressionar `Escape` também fecha o modal sem excluir?
- [ ] **MOD-EX07** — Clicar em `Confirmar` exclui o pedido e exibe toast de sucesso?
- [ ] **MOD-EX08** — O pedido excluído desaparece da lista após confirmar?

---

## 2. Modal Transferir

- [ ] **MOD-TR01** — Com 1 pedido selecionado, o botão `Transferir` fica habilitado?
- [ ] **MOD-TR02** — Clicar em `Transferir` abre `ModalTransferir` (não navega para outra página)?
- [ ] **MOD-TR03** — O modal exibe campo para informar a quantidade a transferir?
- [ ] **MOD-TR04** — O modal exibe o pedido selecionado como referência?
- [ ] **MOD-TR05** — Pressionar `Escape` fecha o modal sem transferir?
- [ ] **MOD-TR06** — Clicar em `Cancelar` fecha o modal sem transferir?
- [ ] **MOD-TR07** — Confirmar a transferência exibe toast de sucesso?

---

## 3. Modal Consolidar

- [ ] **MOD-CO01** — Com apenas 1 pedido selecionado: botão `Consolidar` está desabilitado?
- [ ] **MOD-CO02** — Com 2+ pedidos selecionados: botão `Consolidar` fica habilitado?
- [ ] **MOD-CO03** — Clicar em `Consolidar` abre `ModalConsolidar` (não navega)?
- [ ] **MOD-CO04** — O modal lista os pedidos selecionados para consolidação?
- [ ] **MOD-CO05** — Pressionar `Escape` fecha o modal sem consolidar?
- [ ] **MOD-CO06** — Clicar em `Cancelar` fecha o modal sem consolidar?

---

## 4. Modal Edição em Massa (PencilLine)

- [ ] **MOD-EM01** — Com 1+ pedido selecionado, o ícone `PencilLine` fica habilitado?
- [ ] **MOD-EM02** — Clicar em `PencilLine` abre `ModalEdicaoEmMassa` (não navega)?
- [ ] **MOD-EM03** — O modal lista os pedidos selecionados pré-carregados?
- [ ] **MOD-EM04** — Pressionar `Escape` fecha o modal sem salvar?

---

## 5. Modal Gerar PDF (FilePdf)

- [ ] **MOD-PDF01** — Com 1+ pedido selecionado, o ícone `FilePdf` fica habilitado?
- [ ] **MOD-PDF02** — Clicar em `FilePdf` abre `ModalGerarPdf` (não navega)?
- [ ] **MOD-PDF03** — Pressionar `Escape` fecha o modal?

---

## 6. Modal Duplicar (CopySimple)

- [ ] **MOD-DUP01** — Com 1 pedido selecionado, o ícone `CopySimple` fica habilitado?
- [ ] **MOD-DUP02** — Clicar em `CopySimple` abre `ModalDuplicar` (não duplica imediatamente)?
- [ ] **MOD-DUP03** — Pressionar `Escape` fecha o modal sem duplicar?
- [ ] **MOD-DUP04** — Cancelar o modal não cria pedido novo na lista?

---

## 7. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Modal de confirmação de exclusão | `mod-01-excluir.png` |
| 2 | ModalTransferir aberto | `mod-02-transferir.png` |
| 3 | ModalConsolidar com 2 pedidos | `mod-03-consolidar.png` |
| 4 | ModalEdicaoEmMassa aberto | `mod-04-edicao-massa.png` |
| 5 | ModalDuplicar aberto | `mod-05-duplicar.png` |

---

## 8. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 34 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
