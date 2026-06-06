# Plano de Teste em Tela — Pedido / Configurações / Status

**ID:** TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001  
**Data:** 2026-06-02  
**Versão:** 1.0  
**Criticidade:** alta  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**SSOT índice:** `testes/testes-unitarios/pedido/_planos/PLANO-PEDIDO-CONFIG-STATUS-SSOT.md`  
**Status:** Aguardando aprovação do dono

**Escopo pasta:** `testes/testes-em-tela/pedido/lista/editar-salvar/`  
**Plano + runner:** `plano-de-teste/` (este arquivo + `run-status-config-reflexo.ts`)  
**Prints:** `../resultado-teste/<runId>/` — uma pasta por execução

---

## Resumo executivo

Validação visual com Playwright: fluxo único partindo de Config Status, passando por Lista, Kanban, Insights e Dashboard, documentando cada estado com PNG numerado. Complementa E2E (assertivas) com evidência para QA/homologação.

---

## Plano do teste

```
Produto: Pedido
Porta: 8000 (shell) / 5179 (vite direto)
Fluxo: Config status → reflexo em Lista, Kanban, Insights, Dashboard
Critério de sucesso: 5 canônicos com badge sistema; custom editado visível em todas as superfícies
```

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-login-hub.png` | Hub pós-login |
| 02 | `02-config-status-inicial.png` | Config Status carregada |
| 03 | `03-status-sistema-badge-sem-lapis.png` | Zoom nos 5 status sistema |
| 04 | `04-status-custom-com-lapis.png` | Em Andamento + Aprovado com ações |
| 05 | `05-editar-em-andamento-painel.png` | Painel edição aberto |
| 06 | `06-apos-editar-label-cor.png` | Pending dirty antes de salvar |
| 07 | `07-pos-salvar-config-toast.png` | Toast sucesso |
| 08 | `08-novo-status-form.png` | Form criar `QA Kanban 2026` |
| 09a | `09a-lista-pedido-itens-carregando.png` | Pedido expandido — grade pai + itens carregando |
| 09b | `09b-lista-editar-pedido-sucesso.png` | Edição inline do pedido salva com sucesso |
| 09c | `09c-lista-editar-item-sucesso.png` | Edição inline do item salva com sucesso |
| 09 | `09-lista-com-novo-status-aba.png` | Lista — abas refletindo config |
| 10 | `10-lista-coluna-status-badge.png` | Célula status cor custom |
| 11 | `11-kanban-colunas-ordem.png` | Kanban — todas colunas visíveis |
| 12 | `12-kanban-coluna-nova.png` | Coluna status custom |
| 13 | `13-insights-kpi-topo.png` | Visão Geral — 4 KPI cards |
| 14 | `14-insights-funil-status.png` | Funil por status |
| 15 | `15-dashboard-filtros-status.png` | Dashboard pills |
| 16 | `16-config-kanban-ocultar-coluna.png` | Config ocultar Aprovado |
| 17 | `17-kanban-sem-coluna-oculta.png` | Kanban após ocultar |
| 18 | `18-estado-final-config.png` | Config final consistente |
| 99 | `99-erro.png` | Só se falhar |

Viewport: **1440×900** (fixo)

---

## Roteiro de execução

### ETAPA 0 — Preparação
1. Confirmar servidor em `localhost:8000`
2. Runner cria `resultado-teste/<EMT_RUN_ID>/` automaticamente
3. Login com credenciais org de teste

### ETAPA 1 — Config Status
1. Navegar `/pedido/configuracoes?categoria=status`
2. Prints 02–04
3. Editar `Em Andamento` → label `Em Execução QA`, cor `#ff00ff` → prints 05–06
4. Salvar → print 07
5. Criar status `QA Kanban 2026` cor `#22c55e` → salvar → print 08

### ETAPA 2 — Lista
1. Abrir `/pedido/pedidos/lista` — expandir um pedido; se houver itens, confirmar que a grade carrega (linhas pai + filhos visíveis) → print `09a-lista-pedido-itens-carregando.png`
2. Editar um campo do pedido (linha pai, ex.: `referencia_importador`) e salvar — deve exibir toast de sucesso → print `09b-lista-editar-pedido-sucesso.png`
3. Editar um campo do item (linha filho, ex.: `part_number`) e salvar — deve exibir toast de sucesso → print `09c-lista-editar-item-sucesso.png`
4. Validar abas de status refletindo config → print `09-lista-com-novo-status-aba.png`
5. Validar aba custom e label editado na coluna status → print `10-lista-coluna-status-badge.png`

### ETAPA 3 — Kanban
1. `/pedido/pedidos/kanban` → prints 11–12
2. Validar ordem e coluna nova

### ETAPA 4 — Insights
1. `/pedido/pedidos/insights` → prints 13–14
2. **Anotar no RESULTADO.txt** se funil não reflete label custom (gap conhecido)

### ETAPA 5 — Dashboard
1. `/pedido/pedidos/dashboard` → print 15

### ETAPA 6 — Kanban ocultar coluna
1. Config → Kanban → Colunas → ocultar `Aprovado` → salvar → print 16
2. Kanban → print 17

### ETAPA 7 — Relatório
Gerar `RESULTADO.txt`:

```
TESTE EM TELA — status-reflexo-completo
Data: 2026-06-02
Produto: Pedido | Porta: 8000
Pasta: testes/testes-em-tela/pedido/lista/editar-salvar/resultado-teste/<runId>/

Resultado: PASSOU / FALHOU / PASSOU COM RESSALVAS
Observações: [funil hardcoded, etc.]
```

---

## Diferença vs E2E

| | Este plano (EMT) | Plano E2E |
|--|------------------|-----------|
| Entrega | PNG + RESULTADO.txt | `.spec.ts` + CI |
| Assertivas | Manual/visual | `expect()` automatizado |
| Quando | Homologação pós-deploy | Regressão contínua |

---

## Execução

```bash
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-status-config-reflexo.ts
```

**Estado atual:** script e prints pendentes (plano aprovado → implementar)
