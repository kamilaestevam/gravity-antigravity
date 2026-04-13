# E2E · Pedido / Lista · Coluna 17 — Saldo do Pedido

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Saldo do Pedido — campo calculado, não editável, cor azul, tooltip interativo
**Regra de negócio:** fórmula configurável via Configurações; padrão = `qtd_inicial - qtd_transferida - qtd_cancelada`; valor > 0 exibe em azul `#60a5fa`

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C17-H01** — O cabeçalho da coluna está visível (quando ativado)?
- [ ] **C17-H02** — O texto exibido é exatamente `Saldo do Pedido`?

### 1.2 Tooltip interativo
- [ ] **C17-H03** — Hover sobre o header exibe tooltip?
- [ ] **C17-H04** — O tooltip contém "Calculado com base nos itens — não editável"?
- [ ] **C17-H05** — O tooltip contém um link clicável para `/configuracoes?tab=colunas-campos-calculados`?
- [ ] **C17-H06** — Clicar no link do tooltip navega para a tela de configurações?

### 1.3 Ícone de filtro
- [ ] **C17-H07** — O ícone de filtro está visível?
- [ ] **C17-H08** — O popover exibe `Cresc.` e `Decresc.`?
- [ ] **C17-H09** — Clicar em `Cresc.` ordena do menor saldo para o maior?
- [ ] **C17-H10** — Clicar em `Decresc.` ordena do maior saldo para o menor?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição e cor
- [ ] **C17-C01** — A célula exibe o saldo calculado?
- [ ] **C17-C02** — O valor está alinhado à direita?
- [ ] **C17-C03** — Saldo > 0 exibe na cor azul (`#60a5fa`)?
- [ ] **C17-C04** — Saldo = 0 não exibe a cor azul (usa cor padrão)?
- [ ] **C17-C05** — Célula sem dados exibe `—`?
- [ ] **C17-C06** — Nenhuma célula exibe `null` ou `undefined`?

### 2.2 Não editável
- [ ] **C17-C07** — Duplo clique na célula NÃO abre campo de edição?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial com saldos em azul | `c17-01-saldo-azul.png` |
| 2 | Tooltip interativo com link aberto | `c17-02-tooltip-interativo.png` |
| 3 | Após ordenar por saldo crescente | `c17-03-crescente.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 17 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
