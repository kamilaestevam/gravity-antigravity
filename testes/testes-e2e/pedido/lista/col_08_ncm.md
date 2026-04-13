# E2E · Pedido / Lista · Coluna 08 — NCM

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna NCM — cabeçalho + célula com formatação + divergência entre itens
**Regra de negócio:** NCM é formatado como `XXXX.XX.XX` para 8 dígitos; usa fonte monospace; alerta quando itens têm NCMs diferentes

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C08-H01** — O cabeçalho da coluna está visível (quando ativado)?
- [ ] **C08-H02** — O texto exibido é exatamente `NCM`?

### 1.2 Ícone de filtro
- [ ] **C08-H03** — O ícone de filtro está visível?
- [ ] **C08-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C08-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C08-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C08-H07** — O popover exibe campo de busca de texto?
- [ ] **C08-H08** — O popover exibe o botão `Aplicar`?
- [ ] **C08-H09** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação
- [ ] **C08-H10** — Clicar em `Cresc.` fecha o popover e ordena A→Z?
- [ ] **C08-H11** — Clicar em `Decresc.` fecha o popover e ordena Z→A?

### 1.4 Busca por NCM parcial
- [ ] **C08-H12** — Digitar os 4 primeiros dígitos de um NCM existente filtra corretamente?
- [ ] **C08-H13** — Chip de filtro ativo aparece após aplicar?
- [ ] **C08-H14** — Limpar filtro restaura a lista completa?

### 1.5 Busca por NCM completo
- [ ] **C08-H15** — Digitar o NCM completo (`8542.31.90`) filtra apenas pedidos com aquele NCM?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição e formato
- [ ] **C08-C01** — Células sem NCM exibem `—`?
- [ ] **C08-C02** — NCM de 8 dígitos é formatado como `XXXX.XX.XX` (ex: `8542.31.90`)?
- [ ] **C08-C03** — A célula usa fonte monospace (`font-family: monospace`)?
- [ ] **C08-C04** — Nenhuma célula exibe `null` ou `undefined`?

### 2.2 Divergência entre itens
- [ ] **C08-C05** — Pedido com itens de NCMs diferentes exibe ícone de alerta ⚠?
- [ ] **C08-C06** — O ícone de alerta tem cor amarela (`#F59E0B`)?
- [ ] **C08-C07** — O texto do alerta lista os NCMs divergentes (ex: `8542.31.90 | 8471.30.12`)?

### 2.3 Editável
- [ ] **C08-C08** — Duplo clique na célula abre campo de edição?
- [ ] **C08-C09** — Pressionar `Escape` cancela sem salvar?
- [ ] **C08-C10** — Pressionar `Enter` salva e atualiza a célula?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial com NCMs formatados | `c08-01-estado-inicial.png` |
| 2 | Popover de filtro aberto | `c08-02-popover.png` |
| 3 | Filtro por NCM parcial ativo | `c08-03-filtro-ativo.png` |
| 4 | Ícone de divergência de NCM | `c08-04-divergencia.png` |

---

## 4. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 25 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
