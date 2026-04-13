# E2E · Pedido / Lista · Coluna 01 — Nº Pedido / Part Number

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Coluna 1 — cabeçalho + célula + interações
**Pré-requisito:** usuário autenticado, ao menos 3 pedidos cadastrados com itens filho

---

## 1. Cabeçalho (Header)

### 1.1 Exibição
- [ ] **C01-H01** — O cabeçalho da coluna 1 está visível?
- [ ] **C01-H02** — O texto exibido é exatamente `Nº Pedido / Part Number`?
- [ ] **C01-H03** — O texto não está truncado (largura suficiente para exibir o label completo)?

### 1.2 Ícone de filtro
- [ ] **C01-H04** — O ícone de filtro está visível no cabeçalho?
- [ ] **C01-H05** — Ao clicar no ícone, o popover de filtro abre?
- [ ] **C01-H06** — O popover exibe o nome da coluna no topo (`Nº PEDIDO / PART NUMBER`)?
- [ ] **C01-H07** — O botão `Cresc.` está visível no popover?
- [ ] **C01-H08** — O botão `Decresc.` está visível no popover?
- [ ] **C01-H09** — O campo de busca de texto está visível no popover?
- [ ] **C01-H10** — O botão `× Limpar filtro` está visível no popover?
- [ ] **C01-H11** — O botão `Aplicar` está visível no popover?

### 1.3 Ordenação crescente
- [ ] **C01-H12** — Clicar em `Cresc.` fecha o popover?
- [ ] **C01-H13** — A tabela continua exibindo linhas após ordenar?
- [ ] **C01-H14** — O primeiro pedido visível vem antes (A→Z) do último?

### 1.4 Ordenação decrescente
- [ ] **C01-H15** — Clicar em `Decresc.` fecha o popover?
- [ ] **C01-H16** — A tabela continua exibindo linhas após ordenar?
- [ ] **C01-H17** — O primeiro pedido visível vem depois (Z→A) do último?

### 1.5 Busca por texto parcial
- [ ] **C01-H18** — Digitar as 3 primeiras letras de um pedido existente preenche o campo?
- [ ] **C01-H19** — Clicar em `Aplicar` fecha o popover?
- [ ] **C01-H20** — Um chip de filtro ativo aparece acima da tabela?
- [ ] **C01-H21** — Todas as linhas visíveis contêm o texto buscado?

### 1.6 Busca por texto completo (nome exato)
- [ ] **C01-H22** — Digitar o número completo de um pedido existente preenche o campo?
- [ ] **C01-H23** — Clicar em `Aplicar` fecha o popover?
- [ ] **C01-H24** — Exatamente 1 linha aparece e corresponde ao texto exato?

### 1.7 Busca sem resultado
- [ ] **C01-H25** — Digitar texto inexistente e aplicar → tabela não fica em branco silencioso?
- [ ] **C01-H26** — Uma mensagem de estado vazio é exibida?

### 1.8 Limpar filtro
- [ ] **C01-H27** — Clicar no `X` do chip ativo remove o filtro?
- [ ] **C01-H28** — A lista completa de pedidos é restaurada?
- [ ] **C01-H29** — Botão `× Limpar filtro` dentro do popover também limpa e fecha?

### 1.9 Filtro múltiplo (seleção de mais de um valor)
- [ ] **C01-H30** — Quando o campo de busca exibe uma lista de valores únicos, é possível marcar mais de um?
- [ ] **C01-H31** — Com dois valores selecionados, a tabela mostra apenas pedidos que correspondam a um dos dois?
- [ ] **C01-H32** — Desmarcando todos os valores, a lista completa é restaurada?

---

## 2. Célula (Linhas Pai)

### 2.1 Exibição básica
- [ ] **C01-C01** — A célula da coluna 1 em cada linha pai está visível?
- [ ] **C01-C02** — A célula exibe o número do pedido (ex: `PO-2026/001`)?
- [ ] **C01-C03** — Nenhuma célula exibe `null`, `undefined` ou string vazia?
- [ ] **C01-C04** — Células sem valor exibem `—` (travessão), nunca vazio?

### 2.2 Tooltip
- [ ] **C01-C05** — Hover sobre a célula exibe tooltip após ~700ms?
- [ ] **C01-C06** — O tooltip exibe título e descrição preenchidos (não vazio)?

### 2.3 Não editável
- [ ] **C01-C07** — Duplo clique na célula NÃO abre campo de edição?
- [ ] **C01-C08** — Clicar uma vez na célula NÃO abre campo de edição?

---

## 3. Célula (Linhas Filho)

- [ ] **C01-F01** — Expandir um pedido com itens filho: a célula da col 1 nos filhos exibe o Part Number?
- [ ] **C01-F02** — O Part Number do filho é diferente do número do pedido pai?
- [ ] **C01-F03** — Nenhuma célula filho exibe `null`, `undefined` ou string vazia?
- [ ] **C01-F04** — Filho sem Part Number exibe `—`?

---

## 4. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Estado inicial — coluna 1 visível | `c01-01-estado-inicial.png` |
| 2 | Popover aberto com todos os botões | `c01-02-popover-aberto.png` |
| 3 | Após ordenar crescente | `c01-03-crescente.png` |
| 4 | Após ordenar decrescente | `c01-04-decrescente.png` |
| 5 | Chip de filtro ativo | `c01-05-chip-ativo.png` |
| 6 | Resultado filtrado (1 linha exata) | `c01-06-resultado-exato.png` |
| 7 | Estado vazio após busca sem resultado | `c01-07-vazio.png` |
| 8 | Linha filho com Part Number | `c01-08-filho-partnumber.png` |

---

## 5. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 36 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
