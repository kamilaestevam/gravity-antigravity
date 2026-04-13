# E2E · Pedido / Lista · Feature — Expandir e Recolher Itens Filho

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Chevron de expandir/recolher na linha pai

---

## 1. Chevron — presença e acessibilidade

- [ ] **EXP-R01** — O chevron está visível na linha pai que possui itens filho?
- [ ] **EXP-R02** — Pedido sem itens filho: chevron está desabilitado ou não renderizado?
- [ ] **EXP-R03** — O chevron tem atributo `aria-expanded="false"` no estado recolhido?
- [ ] **EXP-R04** — O chevron é ativável via `Enter` (acessibilidade por teclado)?
- [ ] **EXP-R05** — O chevron é ativável via `Space` (acessibilidade por teclado)?

---

## 2. Expandir

- [ ] **EXP-E01** — Clicar no chevron expande as linhas filho imediatamente?
- [ ] **EXP-E02** — Após expandir: `aria-expanded` muda para `"true"`?
- [ ] **EXP-E03** — As linhas filho aparecem visualmente abaixo do pai?
- [ ] **EXP-E04** — Cada linha filho tem índice numérico sequencial (1, 2, 3...)?
- [ ] **EXP-E05** — Cada linha filho exibe seu Part Number na célula correspondente?
- [ ] **EXP-E06** — Linhas filho não exibem `null`, `undefined` ou string vazia nas células?

---

## 3. Recolher

- [ ] **EXP-C01** — Clicar novamente no chevron recolhe os itens filho?
- [ ] **EXP-C02** — Após recolher: `aria-expanded` volta para `"false"`?
- [ ] **EXP-C03** — As linhas filho desaparecem do DOM ou ficam com `display: none`?

---

## 4. Múltiplos expandidos

- [ ] **EXP-M01** — Expandir o pedido 1 e depois o pedido 2: ambos ficam expandidos simultaneamente?
- [ ] **EXP-M02** — Não há comportamento de accordion (expandir 2 NÃO colapsa o 1)?

---

## 5. Visual das linhas

- [ ] **EXP-V01** — Linha pai tem `font-weight: 600` e cor de texto `#f1f5f9`?
- [ ] **EXP-V02** — Linha filho tem `font-weight: 400` e cor de texto `#cbd5e1`?
- [ ] **EXP-V03** — As linhas filho têm estilo visual diferente das linhas pai (destaque menor)?

---

## 6. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Linha pai recolhida (chevron down) | `exp-01-recolhido.png` |
| 2 | Linha pai expandida com filhos visíveis | `exp-02-expandido.png` |
| 3 | Dois pedidos expandidos simultaneamente | `exp-03-dois-expandidos.png` |

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
