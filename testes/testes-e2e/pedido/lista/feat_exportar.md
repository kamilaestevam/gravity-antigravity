# E2E · Pedido / Lista · Feature — Exportar

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Botão "Exportar" na toolbar — 6 formatos disponíveis

---

## 1. Botão e submenu

- [ ] **EXP-R01** — O botão `Exportar` está visível na toolbar?
- [ ] **EXP-R02** — Clicar em `Exportar` abre submenu com as opções de formato?
- [ ] **EXP-R03** — O submenu exibe a opção `Excel`?
- [ ] **EXP-R04** — O submenu exibe a opção `CSV`?
- [ ] **EXP-R05** — O submenu exibe a opção `TXT`?
- [ ] **EXP-R06** — O submenu exibe a opção `XML`?
- [ ] **EXP-R07** — O submenu exibe a opção `JSON`?
- [ ] **EXP-R08** — O submenu exibe a opção `PDF`?
- [ ] **EXP-R09** — Pressionar `Escape` fecha o submenu sem executar ação?
- [ ] **EXP-R10** — Clicar fora do submenu fecha sem executar ação?

---

## 2. Download de cada formato

- [ ] **EXP-D01** — Clicar em `Excel` inicia o download de arquivo `.xlsx`?
- [ ] **EXP-D02** — Clicar em `CSV` inicia o download de arquivo `.csv`?
- [ ] **EXP-D03** — Clicar em `TXT` inicia o download de arquivo `.txt`?
- [ ] **EXP-D04** — Clicar em `XML` inicia o download de arquivo `.xml`?
- [ ] **EXP-D05** — Clicar em `JSON` inicia o download de arquivo `.json`?
- [ ] **EXP-D06** — Clicar em `PDF` inicia o download ou abre preview de PDF?

---

## 3. Exportar com filtros ativos

- [ ] **EXP-F01** — Exportar com tab `Aberto` ativa → arquivo contém apenas pedidos abertos?
- [ ] **EXP-F02** — Exportar com busca global ativa → arquivo contém apenas pedidos filtrados?
- [ ] **EXP-F03** — Exportar com filtro de coluna ativo → arquivo contém apenas os pedidos filtrados?

---

## 4. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Submenu de exportação aberto | `exp-01-submenu.png` |
| 2 | Download de Excel iniciado | `exp-02-download-xlsx.png` |
| 3 | Exportar com filtro ativo | `exp-03-filtrado.png` |

---

## 5. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 19 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
