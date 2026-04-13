# E2E · Pedido / Lista · Coluna 20 — Cobertura Cambial

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna Cobertura Cambial — campo lido dos itens, não editável inline
**Regra de negócio:** valores possíveis `com_cobertura` / `sem_cobertura`; alerta quando itens divergem

---

## 1. Cabeçalho (Header)

- [ ] **C20-H01** — O cabeçalho está visível (quando ativado)?
- [ ] **C20-H02** — O texto exibido é exatamente `Cobertura Cambial do Pedido`?
- [ ] **C20-H03** — O popover exibe `Cresc.`, `Decresc.`, campo de busca, `Aplicar` e `× Limpar filtro`?
- [ ] **C20-H04** — Clicar em `Cresc.` ordena A→Z?
- [ ] **C20-H05** — Clicar em `Decresc.` ordena Z→A?
- [ ] **C20-H06** — Busca por `com_cobertura` filtra corretamente?
- [ ] **C20-H07** — Limpar filtro restaura a lista?

---

## 2. Célula (Linhas Pai)

- [ ] **C20-C01** — A célula exibe `com_cobertura` ou `sem_cobertura`?
- [ ] **C20-C02** — Célula sem valor exibe `—`?
- [ ] **C20-C03** — Nenhuma célula exibe `null` ou `undefined`?
- [ ] **C20-C04** — Pedido com itens de coberturas diferentes exibe ícone de alerta ⚠ amarelo?
- [ ] **C20-C05** — Hover no ícone exibe tooltip com os valores divergentes?

---

## 3. Evidências

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial | `c20-01-estado-inicial.png` |
| 2 | Alerta de divergência | `c20-02-divergencia.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 12 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
