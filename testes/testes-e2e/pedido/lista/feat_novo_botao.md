# E2E · Pedido / Lista · Feature — Botão "+ Novo"

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Botão "+ Novo" na toolbar — dropdown com opções de criação

---

## 1. Botão e dropdown

- [ ] **NOVO-R01** — O botão `+ Novo` está visível na toolbar?
- [ ] **NOVO-R02** — Clicar no botão abre dropdown?
- [ ] **NOVO-R03** — O dropdown exibe a opção `Novo Pedido`?
- [ ] **NOVO-R04** — O dropdown exibe a opção `Novo Item`?
- [ ] **NOVO-R05** — Pressionar `Escape` fecha o dropdown sem executar ação?
- [ ] **NOVO-R06** — Clicar fora do dropdown fecha sem executar ação?
- [ ] **NOVO-R07** — O dropdown fecha automaticamente após selecionar uma opção?

---

## 2. Submenu "Novo Pedido"

- [ ] **NOVO-P01** — Hover em `Novo Pedido` exibe submenu?
- [ ] **NOVO-P02** — O submenu exibe a opção `Manual`?
- [ ] **NOVO-P03** — O submenu exibe a opção `Importação`?
- [ ] **NOVO-P04** — Clicar em `Manual` abre `ModalNovoPedido` (não navega para outra página)?
- [ ] **NOVO-P05** — O modal de novo pedido está visível e funcional?
- [ ] **NOVO-P06** — Pressionar `Escape` fecha o modal sem criar pedido?

---

## 3. Submenu "Novo Item"

- [ ] **NOVO-I01** — Hover em `Novo Item` exibe submenu?
- [ ] **NOVO-I02** — O submenu exibe a opção `Manual` com descrição "Adicionar item"?
- [ ] **NOVO-I03** — Clicar em `Manual` abre `ModalNovoItem` (não navega)?
- [ ] **NOVO-I04** — O modal de novo item está visível e funcional?
- [ ] **NOVO-I05** — Pressionar `Escape` fecha o modal sem criar item?

---

## 4. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Dropdown "+ Novo" aberto | `novo-01-dropdown.png` |
| 2 | Submenu "Novo Pedido" visível | `novo-02-submenu-pedido.png` |
| 3 | ModalNovoPedido aberto | `novo-03-modal-pedido.png` |
| 4 | Submenu "Novo Item" visível | `novo-04-submenu-item.png` |

---

## 5. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 20 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
