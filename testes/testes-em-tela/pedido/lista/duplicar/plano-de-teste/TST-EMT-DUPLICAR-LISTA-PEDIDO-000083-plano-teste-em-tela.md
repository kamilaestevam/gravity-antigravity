# Plano de Teste em Tela — Pedido / Lista / Duplicar

**ID:** `TST-EMT-DUPLICAR-LISTA-PEDIDO-000083`  
**Data:** 2026-06-11  
**Versão:** 1.0  
**Criticidade:** alta  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**Regras de negócio:** `documentos-tecnicos/produtos-gravity/pedido/DUPLICAR-EXCLUIR-REGRAS-NEGOCIO.md`  
**Escopo pasta:** `testes/testes-em-tela/pedido/lista/duplicar/`  
**Plano + runner:** `plano-de-teste/TST-EMT-DUPLICAR-LISTA-PEDIDO-000083-plano-teste-em-tela.md` + `run-TST-EMT-DUPLICAR-LISTA-PEDIDO-000083.ts`  
**Prints:** `../resultado-teste/<runId>/`

> O modal Admin («O que será testado») agrupa casos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Regra universal — persistência ao fim de cada ETAPA

> **Obrigatório** em toda ETAPA que altera dados (1–5), **exceto** ETAPA 0.

Último passo da etapa:

1. Navegar para o **hub**
2. Voltar à **Lista de Pedidos**
3. Reencontrar o pedido pelo **nº pedido** e **reexpandir**
4. **APROVADO** quando dados persistem na grade

**Print:** `{passo}-{slug}-persistencia-apos-navegar-resultado.png`

---

## Pré-requisitos

| Requisito | Detalhe |
|-----------|---------|
| Ambiente | Staging (`www.usegravity.com.br`) ou local (`http://localhost:8000` via `npm run dev`) |
| Usuário | `pedido:lista:editar` |
| Sidebar | ≥ 2 workspaces marcados (lista agregada) |
| Dados | Pedido A (WS1, ≥ 3 itens); Pedido B (WS2, ≥ 2 itens identificáveis, ex. "deve duplicar"); Pedido C opcional (`qtd_pronta > 0`) |
| Config | `duplicar_numero_auto=true` (ETAPAs 1–5); org com `=false` só na ETAPA 6 |

---

## Resumo executivo

| ETAPA | Foco |
|-------|------|
| 0 | Preparação multi-workspace |
| 1 | 1 pedido (happy path) |
| 2 | Itens avulsos (#273) |
| 3 | Misto multi-WS (#276) |
| 4 | Toggle zeramento |
| 5 | Aviso saldo |
| 6 | Wizard / número manual |

---

### ETAPA 0 — Preparação

| Passo | Ação | APROVADO quando | Print |
|-------|------|-----------------|-------|
| 0.1 | Login + abrir Lista | Grade carregada | `01-lista-carregada.png` |
| 0.2 | Sidebar: marcar ≥ 2 workspaces | Pedidos de WS distintos visíveis | `02-sidebar-multi-workspace.png` |

---

### ETAPA 1 — Duplicar 1 pedido (happy path)

| Passo | Ação | APROVADO quando | Print |
|-------|------|-----------------|-------|
| 1.1 | Selecionar Pedido A | Toolbar Duplicar habilitada | `03-pedido-selecionado.png` |
| 1.2 | Abrir modal → Passo 1 (Raio X) | Título "Duplicar 1 pedido"; 5 toggles | `04-modal-passo1-raio-x.png` |
| 1.3 | Avançar → Passo 2 | Tabela preview | `05-modal-passo2-preview.png` |
| 1.4 | Confirmar | Resultado verde; toast sucesso | `06-resultado-sucesso.png` |
| 1.5 | Fechar modal | Cópia no topo | `07-novo-pedido-no-topo.png` |
| 1.6 | Persistência | Cópia permanece após hub→lista | `08-persistencia-pedido-inteiro.png` |

---

### ETAPA 2 — Itens avulsos multi-workspace (regressão #273)

| Passo | Ação | APROVADO quando | Print |
|-------|------|-----------------|-------|
| 2.1 | Expandir Pedido B (outro WS), sem marcar pedido | Itens visíveis | `09-pedido-b-expandido.png` |
| 2.2 | Selecionar 2 itens avulsos | Toolbar Duplicar | `10-dois-itens-selecionados.png` |
| 2.3 | Modal passo 1 | Seção itens avulsos | `11-modal-itens-avulsos.png` |
| 2.4 | Confirmar | Sem "Pedido não encontrado" / 404 | `12-resultado-itens-avulsos-ok.png` |
| 2.5 | Reexpandir Pedido B | +2 itens (cópias abaixo) | `13-itens-copiados-visiveis.png` |
| 2.6 | Persistência | Contagem mantida | `14-persistencia-itens-avulsos.png` |

---

### ETAPA 3 — Misto pedido + itens outro WS (regressão #276)

| Passo | Ação | APROVADO quando | Print |
|-------|------|-----------------|-------|
| 3.1 | Pedido A + 2 itens avulsos do Pedido B | Seleção mista | `15-selecao-mista.png` |
| 3.2 | Modal passo 1 | Pedido + avulsos separados | `16-modal-misto-passo1.png` |
| 3.3 | Confirmar | Toast "N pedido(s) e M item(ns)" | `17-resultado-misto-ok.png` |
| 3.4 | Expandir cópia do Pedido A | Cascade + avulsos visíveis | `18-misto-itens-no-pedido-copia.png` |
| 3.5 | Persistência | Dados mantidos | `19-persistencia-misto.png` |

---

### ETAPA 4 — Opções de zeramento (1 toggle)

| Passo | Ação | APROVADO quando | Print |
|-------|------|-----------------|-------|
| 4.1 | Selecionar 1 pedido; abrir modal | Passo 1 | `20-opcoes-inicial.png` |
| 4.2 | Desmarcar "Copiar valores e preços" | Toggle off | `21-toggle-valores-off-selecao.png` |
| 4.3 | Duplicar; expandir cópia | Valores vazios/zero | `22-valores-zerados-resultado.png` |

---

### ETAPA 5 — Aviso saldo de execução (se Pedido C existir)

| Passo | Ação | APROVADO quando | Print |
|-------|------|-----------------|-------|
| 5.1 | Selecionar pedido com `qtd_pronta > 0` | — | — |
| 5.2 | Passo 2 modal | Banner amarelo zeramento | `23-aviso-zeramento-saldo.png` |

---

### ETAPA 6 — Wizard e número manual (smoke)

| Passo | Ação | APROVADO quando | Print |
|-------|------|-----------------|-------|
| 6.1 | Navegação passo 1 ↔ 2 | Voltar/Próximo corretos | `24-wizard-navegacao.png` |
| 6.2 | Org `numero_auto=false` | Número obrigatório; Duplicar off se vazio | `25-numero-manual-obrigatorio.png` |

---

**Total:** 6 ETAPAs · ~25 prints · foco funcional #273/#276.

> **Performance / SLA:** fora deste plano — coberto por agente e planos dedicados a velocidade.

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-lista-carregada.png` | Lista após login |
| 02 | `02-sidebar-multi-workspace.png` | ≥2 workspaces na sidebar |
| 03 | `03-pedido-selecionado.png` | Pedido A selecionado |
| 04 | `04-modal-passo1-raio-x.png` | Modal passo 1 |
| 05 | `05-modal-passo2-preview.png` | Modal passo 2 |
| 06 | `06-resultado-sucesso.png` | Resultado verde |
| 07 | `07-novo-pedido-no-topo.png` | Cópia no topo |
| 08 | `08-persistencia-pedido-inteiro.png` | Persistência ETAPA 1 |
| 09 | `09-pedido-b-expandido.png` | Pedido B expandido |
| 10 | `10-dois-itens-selecionados.png` | 2 itens avulsos |
| 11 | `11-modal-itens-avulsos.png` | Modal itens avulsos |
| 12 | `12-resultado-itens-avulsos-ok.png` | Sucesso itens (#273) |
| 13 | `13-itens-copiados-visiveis.png` | Cópias visíveis |
| 14 | `14-persistencia-itens-avulsos.png` | Persistência ETAPA 2 |
| 15 | `15-selecao-mista.png` | Seleção mista |
| 16 | `16-modal-misto-passo1.png` | Modal misto |
| 17 | `17-resultado-misto-ok.png` | Sucesso misto (#276) |
| 18 | `18-misto-itens-no-pedido-copia.png` | Itens na cópia |
| 19 | `19-persistencia-misto.png` | Persistência ETAPA 3 |
| 20 | `20-opcoes-inicial.png` | Toggle ETAPA 4 |
| 21 | `21-toggle-valores-off-selecao.png` | Toggle desmarcado |
| 22 | `22-valores-zerados-resultado.png` | Valores zerados |
| 23 | `23-aviso-zeramento-saldo.png` | Banner saldo |
| 24 | `24-wizard-navegacao.png` | Wizard |
| 25 | `25-numero-manual-obrigatorio.png` | Número manual |
