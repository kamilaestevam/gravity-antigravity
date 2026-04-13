# E2E · Pedido / Lista · Coluna 07 — Status

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna 7 — cabeçalho + badge com cor configurável + filtro enum
**Pré-requisito:** pedidos com variados status cadastrados (draft, aberto, em_andamento, aprovado, transferencia, consolidado, cancelado)

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C07-H01** — O cabeçalho da coluna está visível?
- [ ] **C07-H02** — O texto exibido é exatamente `Status`?

### 1.2 Ícone de filtro
- [ ] **C07-H03** — O ícone de filtro está visível?
- [ ] **C07-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C07-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C07-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C07-H07** — O popover exibe os status como checkboxes?
- [ ] **C07-H08** — O popover **NÃO** exibe botão `Aplicar` (enum aplica ao marcar)?
- [ ] **C07-H09** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação
- [ ] **C07-H10** — Clicar em `Cresc.` fecha o popover e ordena por status A→Z?
- [ ] **C07-H11** — Clicar em `Decresc.` fecha o popover e ordena por status Z→A?

### 1.4 Filtro por status individual
- [ ] **C07-H12** — Marcar `Aberto` → apenas pedidos com badge Aberto aparecem?
- [ ] **C07-H13** — Marcar `Rascunho` → apenas pedidos com badge Rascunho aparecem?
- [ ] **C07-H14** — Marcar `Em Andamento` → apenas pedidos com badge Em Andamento aparecem?
- [ ] **C07-H15** — Marcar `Aprovado` → apenas pedidos com badge Aprovado aparecem?
- [ ] **C07-H16** — Marcar `Transferido` → apenas pedidos com badge Transferido aparecem?
- [ ] **C07-H17** — Marcar `Consolidado` → apenas pedidos com badge Consolidado aparecem?
- [ ] **C07-H18** — Marcar `Cancelado` → apenas pedidos com badge Cancelado aparecem?

### 1.5 Limpar filtro
- [ ] **C07-H19** — Clicar no `X` do chip remove o filtro e restaura a lista?
- [ ] **C07-H20** — Botão `× Limpar filtro` no popover também limpa e fecha?

---

## 2. Célula (Badge de status)

### 2.1 Exibição
- [ ] **C07-C01** — Cada linha pai exibe um badge de status?
- [ ] **C07-C02** — Nenhum badge exibe `null` ou `undefined`?

### 2.2 Cores exatas (STATUS_CORES_DEFAULT)
- [ ] **C07-C03** — Badge `Rascunho` tem cor `#94a3b8`?
- [ ] **C07-C04** — Badge `Aberto` tem cor `#f472b6`?
- [ ] **C07-C05** — Badge `Em Andamento` tem cor `#fb923c`?
- [ ] **C07-C06** — Badge `Aprovado` tem cor `#facc15`?
- [ ] **C07-C07** — Badge `Transferido` tem cor `#2dd4bf`?
- [ ] **C07-C08** — Badge `Consolidado` tem cor `#a78bfa`?
- [ ] **C07-C09** — Badge `Cancelado` tem cor `#f87171`?
- [ ] **C07-C10** — Status desconhecido/customizado usa cor fallback `#64748b`?

### 2.3 Comportamento
- [ ] **C07-C11** — Clicar no badge abre seletor inline de status?
- [ ] **C07-C12** — Pressionar `Escape` fecha o seletor sem alterar o status?
- [ ] **C07-C13** — O badge não está cortado (largura suficiente)?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial com badges variados | `c07-01-badges-variados.png` |
| 2 | Popover de filtro enum (sem Aplicar) | `c07-02-popover-enum.png` |
| 3 | Filtro Aberto ativo | `c07-03-filtro-aberto.png` |
| 4 | Filtro Cancelado ativo | `c07-04-filtro-cancelado.png` |
| 5 | Seletor inline de status aberto | `c07-05-seletor-inline.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 33 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
