# E2E · Pedido / Lista · Feature — Drawer do Pedido

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** DrawerPedido — painel lateral que abre ao visualizar um pedido

---

## 1. Abertura do Drawer

- [ ] **DRW-R01** — O botão de visualização (Eye) está visível na linha pai?
- [ ] **DRW-R02** — Clicar no botão Eye abre o DrawerPedido?
- [ ] **DRW-R03** — O Drawer abre sem navegar para outra página (SPA)?
- [ ] **DRW-R04** — O Drawer exibe o número do pedido no título/header?

---

## 2. Abas do Drawer

- [ ] **DRW-A01** — A aba `Dados` está visível no Drawer?
- [ ] **DRW-A02** — A aba `Dados` está ativa por padrão ao abrir?
- [ ] **DRW-A03** — A aba `Itens` está visível?
- [ ] **DRW-A04** — Clicar em `Itens` exibe a lista de itens do pedido?
- [ ] **DRW-A05** — A aba `Transferências` está visível?
- [ ] **DRW-A06** — Clicar em `Transferências` exibe o histórico de transferências?

---

## 3. Aba Dados — campos

- [ ] **DRW-D01** — Os campos principais do pedido estão visíveis (número, tipo, exportador, status)?
- [ ] **DRW-D02** — Os campos exibem os mesmos valores que a tabela?
- [ ] **DRW-D03** — Campos sem valor exibem `—` (não vazio ou null)?

---

## 4. Aba Itens

- [ ] **DRW-I01** — A lista de itens está visível na aba Itens?
- [ ] **DRW-I02** — Cada item exibe Part Number, quantidade e outros campos principais?
- [ ] **DRW-I03** — Pedido sem itens exibe estado vazio com mensagem?

---

## 5. Fechar o Drawer

- [ ] **DRW-F01** — Pressionar `Escape` fecha o Drawer?
- [ ] **DRW-F02** — Clicar no botão `X` do Drawer fecha?
- [ ] **DRW-F03** — Após fechar, a tabela de pedidos continua visível e inalterada?
- [ ] **DRW-F04** — Abrir o Drawer de outro pedido atualiza o conteúdo (não mantém dados do anterior)?

---

## 6. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Drawer aberto — aba Dados | `drw-01-dados.png` |
| 2 | Drawer — aba Itens | `drw-02-itens.png` |
| 3 | Drawer — aba Transferências | `drw-03-transferencias.png` |

---

## 7. Resultado

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
