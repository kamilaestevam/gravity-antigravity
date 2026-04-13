# E2E · Pedido / Lista · Feature — Busca Global

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Campo de busca global na toolbar (filtra numero_pedido, exportador, referência, part number)

---

## 1. Campo de busca — presença e visual

- [ ] **BG-R01** — O campo de busca está visível na toolbar?
- [ ] **BG-R02** — O placeholder contém "Buscar pedido, exportador, referência..."?
- [ ] **BG-R03** — O campo está habilitado e focável com clique?
- [ ] **BG-R04** — O campo está focável via Tab do teclado?

---

## 2. Comportamento de filtragem

- [ ] **BG-F01** — Digitar texto filtra a tabela sem recarregar a página?
- [ ] **BG-F02** — A busca por `número do pedido` (ex: `PO-2026/001`) retorna o pedido correto?
- [ ] **BG-F03** — A busca por `nome do exportador` (ex: `Gravity`) retorna pedidos com aquele exportador?
- [ ] **BG-F04** — A busca por `referência` (ex: `REF-001`) retorna pedidos com aquela referência?
- [ ] **BG-F05** — A busca por `part number de item filho` (ex: `PCB-MCU-32F`) retorna o pedido pai?
- [ ] **BG-F06** — A busca é case-insensitive: `gravity` retorna o mesmo que `GRAVITY`?
- [ ] **BG-F07** — A busca é case-insensitive: `po-2026` retorna o mesmo que `PO-2026`?

---

## 3. Estado vazio e restauração

- [ ] **BG-E01** — Texto sem resultado → tabela não fica em branco silencioso?
- [ ] **BG-E02** — Uma mensagem de estado vazio é exibida quando não há resultados?
- [ ] **BG-E03** — Limpar o campo restaura a lista completa imediatamente?
- [ ] **BG-E04** — Pressionar `Escape` com o campo focado limpa o valor?
- [ ] **BG-E05** — Após `Escape`, a lista volta ao estado completo?

---

## 4. Combinação com filtros

- [ ] **BG-C01** — Busca com tab `Aberto` ativa retorna apenas pedidos abertos que contenham o termo?
- [ ] **BG-C02** — Busca com filtro de coluna ativo retorna interseção (busca + filtro)?
- [ ] **BG-C03** — Trocar de tab com busca ativa mantém o termo de busca no campo?

---

## 5. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Campo preenchido com resultado filtrado | `busca-01-resultado.png` |
| 2 | Estado vazio após busca sem resultado | `busca-02-vazio.png` |
| 3 | Busca combinada com tab Aberto | `busca-03-combinada.png` |

---

## 6. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 22 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
