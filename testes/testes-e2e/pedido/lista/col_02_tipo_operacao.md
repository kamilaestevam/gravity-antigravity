# E2E · Pedido / Lista · Coluna 02 — Tipo de Operação

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna 2 — cabeçalho + badge + filtro enum
**Pré-requisito:** pedidos de ambos os tipos (Importação e Exportação) cadastrados

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C02-H01** — O cabeçalho da coluna está visível?
- [ ] **C02-H02** — O texto exibido é exatamente `Tipo de Operação`?

### 1.2 Ícone de filtro
- [ ] **C02-H03** — O ícone de filtro está visível no cabeçalho?
- [ ] **C02-H04** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C02-H05** — O popover exibe o botão `Cresc.`?
- [ ] **C02-H06** — O popover exibe o botão `Decresc.`?
- [ ] **C02-H07** — O popover exibe a opção `Importação` como checkbox?
- [ ] **C02-H08** — O popover exibe a opção `Exportação` como checkbox?
- [ ] **C02-H09** — O popover **NÃO** exibe botão `Aplicar` (filtro enum aplica ao marcar)?
- [ ] **C02-H10** — O popover exibe o botão `× Limpar filtro`?

### 1.3 Ordenação crescente
- [ ] **C02-H11** — Clicar em `Cresc.` fecha o popover?
- [ ] **C02-H12** — A tabela continua exibindo linhas após ordenar?

### 1.4 Ordenação decrescente
- [ ] **C02-H13** — Clicar em `Decresc.` fecha o popover?
- [ ] **C02-H14** — A tabela continua exibindo linhas após ordenar?

### 1.5 Filtro por Importação
- [ ] **C02-H15** — Marcar `Importação` aplica o filtro automaticamente (sem clicar Aplicar)?
- [ ] **C02-H16** — Um chip de filtro ativo aparece acima da tabela?
- [ ] **C02-H17** — Todas as linhas visíveis exibem badge `Importação`?
- [ ] **C02-H18** — Nenhuma linha com badge `Exportação` aparece?

### 1.6 Filtro por Exportação
- [ ] **C02-H19** — Marcar `Exportação` aplica o filtro automaticamente?
- [ ] **C02-H20** — Todas as linhas visíveis exibem badge `Exportação`?
- [ ] **C02-H21** — Nenhuma linha com badge `Importação` aparece?

### 1.7 Filtro com ambos marcados
- [ ] **C02-H22** — Marcar ambos (`Importação` + `Exportação`) exibe todos os pedidos?

### 1.8 Limpar filtro
- [ ] **C02-H23** — Clicar no `X` do chip ativo remove o filtro?
- [ ] **C02-H24** — A lista completa é restaurada?
- [ ] **C02-H25** — Botão `× Limpar filtro` dentro do popover também limpa e fecha?

---

## 2. Célula (Badge visual)

### 2.1 Badge Importação
- [ ] **C02-C01** — O badge `Importação` está visível nas linhas do tipo correto?
- [ ] **C02-C02** — A cor do badge `Importação` é azul (`#60a5fa`)?
- [ ] **C02-C03** — O badge não está cortado (largura suficiente para exibir o texto)?

### 2.2 Badge Exportação
- [ ] **C02-C04** — O badge `Exportação` está visível nas linhas do tipo correto?
- [ ] **C02-C05** — A cor do badge `Exportação` é verde (`#34d399`)?
- [ ] **C02-C06** — O badge não está cortado?

### 2.3 Comportamento
- [ ] **C02-C07** — Nenhuma célula exibe `null`, `undefined` ou string vazia?
- [ ] **C02-C08** — Clicar no badge não abre edição (Tipo de Operação não é editável diretamente)?

---

## 3. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial — badges visíveis | `c02-01-estado-inicial.png` |
| 2 | Popover aberto (sem botão Aplicar) | `c02-02-popover-enum.png` |
| 3 | Filtro Importação ativo | `c02-03-filtro-importacao.png` |
| 4 | Filtro Exportação ativo | `c02-04-filtro-exportacao.png` |
| 5 | Chip de filtro ativo | `c02-05-chip-ativo.png` |

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
