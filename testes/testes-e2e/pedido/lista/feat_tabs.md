# E2E · Pedido / Lista · Feature — Tabs de Status

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Barra de tabs de filtro por status
**Tabs esperadas (ordem):** Todos | Aberto | Em Andamento | Aprovado | Transferido | Consolidado | Cancelado | (tab pessoal do usuário)

---

## 1. Renderização das Tabs

- [ ] **TAB-R01** — A barra de tabs está visível acima da tabela?
- [ ] **TAB-R02** — A tab `Todos` está presente?
- [ ] **TAB-R03** — A tab `Aberto` está presente?
- [ ] **TAB-R04** — A tab `Em Andamento` está presente?
- [ ] **TAB-R05** — A tab `Aprovado` está presente?
- [ ] **TAB-R06** — A tab `Transferido` está presente?
- [ ] **TAB-R07** — A tab `Consolidado` está presente?
- [ ] **TAB-R08** — A tab `Cancelado` está presente?
- [ ] **TAB-R09** — A tab pessoal (ex: `DANIEL`) está presente ao final da lista?
- [ ] **TAB-R10** — A tab `Todos` está com estilo ativo ao carregar a página pela primeira vez?

---

## 2. Comportamento de cada tab

### Tab: Todos
- [ ] **TAB-T01** — Clicar em `Todos` não recarrega a página (SPA)?
- [ ] **TAB-T02** — `Todos` fica com estilo ativo após clicar (`aria-selected="true"` ou classe)?
- [ ] **TAB-T03** — Todos os pedidos são exibidos após clicar em `Todos`?

### Tab: Aberto
- [ ] **TAB-A01** — Clicar em `Aberto` não recarrega a página?
- [ ] **TAB-A02** — `Aberto` fica com estilo ativo?
- [ ] **TAB-A03** — Apenas linhas com badge `Aberto` aparecem?
- [ ] **TAB-A04** — Nenhuma linha com badge `Rascunho`, `Cancelado` ou outro aparece?
- [ ] **TAB-A05** — Se não há pedidos abertos: exibe mensagem de estado vazio (não tela em branco)?

### Tab: Em Andamento
- [ ] **TAB-EA01** — Clicar em `Em Andamento` não recarrega a página?
- [ ] **TAB-EA02** — Apenas linhas com badge `Em Andamento` aparecem?
- [ ] **TAB-EA03** — Se não há pedidos em andamento: exibe estado vazio com mensagem?

### Tab: Aprovado
- [ ] **TAB-AP01** — Clicar em `Aprovado` não recarrega a página?
- [ ] **TAB-AP02** — Apenas linhas com badge `Aprovado` aparecem?
- [ ] **TAB-AP03** — Se vazia: exibe estado vazio com mensagem?

### Tab: Transferido
- [ ] **TAB-TR01** — Clicar em `Transferido` não recarrega a página?
- [ ] **TAB-TR02** — Filtra pelo status backend `transferencia` (não `transferido`)?
- [ ] **TAB-TR03** — Apenas linhas com badge `Transferido` aparecem?
- [ ] **TAB-TR04** — Se vazia: exibe estado vazio com mensagem?

### Tab: Consolidado
- [ ] **TAB-CO01** — Clicar em `Consolidado` não recarrega a página?
- [ ] **TAB-CO02** — Apenas linhas com badge `Consolidado` aparecem?
- [ ] **TAB-CO03** — Se vazia: exibe estado vazio com mensagem?

### Tab: Cancelado
- [ ] **TAB-CA01** — Clicar em `Cancelado` não recarrega a página?
- [ ] **TAB-CA02** — Apenas linhas com badge `Cancelado` aparecem?
- [ ] **TAB-CA03** — Se vazia: exibe estado vazio com mensagem?

### Tab pessoal
- [ ] **TAB-P01** — A tab pessoal exibe apenas pedidos do usuário logado?
- [ ] **TAB-P02** — Não exibe pedidos de outros usuários?

---

## 3. Comportamento transversal

- [ ] **TAB-X01** — `aria-selected="true"` migra para a tab clicada?
- [ ] **TAB-X02** — As demais tabs ficam com `aria-selected="false"`?
- [ ] **TAB-X03** — Trocar de tab limpa a seleção de checkboxes?
- [ ] **TAB-X04** — O estado de expansão de pedidos é mantido ao voltar para `Todos`?
- [ ] **TAB-X05** — Busca global combinada com tab filtra corretamente (interseção)?

---

## 4. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial — tab Todos ativa | `tabs-01-todos.png` |
| 2 | Tab Aberto ativa — só pedidos abertos | `tabs-02-aberto.png` |
| 3 | Tab Cancelado ativa | `tabs-03-cancelado.png` |
| 4 | Tab vazia com mensagem de estado vazio | `tabs-04-vazia.png` |
| 5 | Tab pessoal ativa | `tabs-05-pessoal.png` |

---

## 5. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 40 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
