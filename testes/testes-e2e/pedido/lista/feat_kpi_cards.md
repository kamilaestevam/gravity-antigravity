# E2E · Pedido / Lista · Feature — KPI Cards

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Área de cards KPI acima da tabela (5 cards)

---

## 1. Renderização geral

- [ ] **KPI-R01** — A área de KPI cards está visível acima da tabela?
- [ ] **KPI-R02** — A área usa `display: grid` (verificado via CSS computado)?
- [ ] **KPI-R03** — Nenhum card exibe o texto `undefined`?
- [ ] **KPI-R04** — Nenhum card exibe o texto `NaN`?
- [ ] **KPI-R05** — Todos os cards estão visíveis sem sobreposição ou corte?

---

## 2. Card: Total Pedidos

- [ ] **KPI-T01** — O card "Total Pedidos" está visível?
- [ ] **KPI-T02** — O valor numérico no card é um número inteiro positivo?
- [ ] **KPI-T03** — O subtexto está no formato `X itens no total`?
- [ ] **KPI-T04** — Hover sobre o card exibe tooltip em até 700ms?

---

## 3. Card: Pedidos Abertos

- [ ] **KPI-A01** — O card "Pedidos Abertos" está visível?
- [ ] **KPI-A02** — O subtexto exibe exatamente `Pedidos com status aberto`?
- [ ] **KPI-A03** — O valor numérico bate com a contagem de linhas com badge Aberto na tab `Todos`?
- [ ] **KPI-A04** — Hover sobre o card exibe tooltip?

---

## 4. Card: Quantidade Total

- [ ] **KPI-Q01** — O card de Quantidade Total está visível?
- [ ] **KPI-Q02** — O subtexto contém o texto `saldo atual`?
- [ ] **KPI-Q03** — O valor exibe separador de milhar e casas decimais (ex: `1.234,56`)?
- [ ] **KPI-Q04** — Hover sobre o card exibe tooltip?

---

## 5. Card: Valor Total

- [ ] **KPI-V01** — O card de Valor Total está visível?
- [ ] **KPI-V02** — O subtexto contém `Soma de todos os pedidos`?
- [ ] **KPI-V03** — O valor exibe símbolo de moeda ou código (ex: `R$`, `USD`)?
- [ ] **KPI-V04** — Hover sobre o card exibe tooltip?

---

## 6. Comportamento com filtros

- [ ] **KPI-F01** — Ao ativar a tab `Aberto`, os cards atualizam para refletir apenas os pedidos filtrados?
- [ ] **KPI-F02** — Ao voltar para `Todos`, os cards voltam aos valores totais?

---

## 7. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Cards no estado inicial | `kpi-01-estado-inicial.png` |
| 2 | Tooltip de um card aberto | `kpi-02-tooltip.png` |
| 3 | Cards após filtro por tab Aberto | `kpi-03-filtrado.png` |

---

## 8. Resultado

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
