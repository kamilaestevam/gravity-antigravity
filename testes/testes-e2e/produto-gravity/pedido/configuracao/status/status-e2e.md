# Plano de Testes E2E — Pedido / Configurações / Status (fluxo completo)

**ID:** TST-E2E-PEDIDO-000044  
**Data:** 2026-06-02  
**Versão:** 1.0  
**Criticidade:** alta  
**Ambiente:** Playwright (Local / Staging)  
**SSOT índice:** `testes/testes-unitarios/produto-gravity/pedido/_planos/PLANO-PEDIDO-CONFIG-STATUS-SSOT.md`  
**Status:** Aguardando aprovação do dono

**Spec alvo:** `testes/testes-e2e/produto-gravity/pedido/configuracao/status/TST-E2E-PEDIDO-000044.spec.ts`

---

## Resumo executivo

Plano E2E end-to-end: alterar status em Configurações e verificar reflexo em **Lista** (abas + coluna), **Kanban** (colunas + drag), **Insights** (KPI topo + funil) e **Dashboard** (filtros pills). Inclui guards de status sistema (badge, sem editar/excluir) e ciclo criar → editar → reordenar → excluir custom.

---

## Pré-requisitos

| Requisito | Detalhe |
|-----------|---------|
| URL shell | `http://localhost:8000` ou staging |
| Login | Usuário ADMIN com org + workspace ativo |
| Pedidos | ≥ 3 pedidos em status diferentes (`aberto`, `em_andamento`, `rascunho`) |
| Permissões | Configurar pedido + editar lista + kanban |
| Backend | `processos-core` com PR #160 deployado |

---

## Cobertura — 20 categorias (checklist 10/10)

| Cat | Nome | Status plano | Passos |
|-----|------|--------------|--------|
| 1 | Carregamento | coberta | E-01 a E-04 |
| 2 | Identidade visual | coberta | E-05 a E-08 |
| 3 | Navegação | coberta | E-09 a E-12 |
| 4 | Read/Listagem | coberta | E-13 a E-22 |
| 5 | Update | coberta | E-23 a E-32 |
| 6 | Create | coberta | E-33 a E-38 |
| 7 | Delete | coberta | E-39 a E-43 |
| 8 | Validações | coberta | E-44 a E-48 |
| 9 | Erros | coberta | E-49 a E-51 |
| 10 | Vazio | parcial | E-52 (org nova — opcional staging) |
| 11 | Loading | coberta | E-53 |
| 12 | Filtros | coberta | E-54 a E-56 (Dashboard + Lista abas) |
| 13 | Ordenação | coberta | E-57 a E-59 (DnD config + ordem Kanban) |
| 14 | Permissões | parcial | E-60 (SUPPLIER sem config — se aplicável) |
| 15 | Cross-org | nao_aplicavel | Coberto em FUN/CRO |
| 16 | A11y | coberta | E-61 a E-62 (aria-label lápis/lixeira) |
| 17 | Responsividade | nao_aplicavel | Config desktop-only |
| 18 | i18n | coberta | E-63 (badge sistema pt/en) |
| 19 | Performance | parcial | E-64 (< 3s load config) |
| 20 | Persistência | coberta | E-65 a E-70 (F5 em cada superfície) |

---

## Fluxos de teste

### FLUXO 1 — Config Status: render e guards sistema

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-01 | Login → `/pedido/configuracoes?categoria=status` | Página carrega |
| E-02 | Aguardar lista status | ≥ 7 itens visíveis |
| E-03 | Verificar `Rascunho`, `Aberto`, `Transferido`, `Consolidado`, `Cancelado` | Badge **sistema** |
| E-04 | Mesmos 5 status | Sem ícone lápis, sem lixeira |
| E-05 | `Em Andamento`, `Aprovado` | Lápis + lixeira visíveis |
| E-06 | Hover badge sistema | Tooltip aviso fixo |
| E-07 | Tentar DnD `Rascunho` para posição 3 | Reordena (permitido) |
| E-08 | Barra dirty aparece | "Alterações não salvas" |

### FLUXO 2 — Config: editar status custom + salvar

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-23 | Clicar lápis em `Em Andamento` | Painel edição abre |
| E-24 | Alterar rótulo → `Em Execução QA` | Input atualiza |
| E-25 | Alterar cor → `#ff00ff` | Preview cor |
| E-26 | Clicar Salvar (barra sticky) | Toast sucesso |
| E-27 | F5 na página | Rótulo e cor persistem |
| E-28 | Verificar `localStorage pedido:status_config` | Entry `em_andamento` atualizada |

### FLUXO 3 — Config: criar novo status

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-33 | Clicar "+ Novo status" | Formulário criação |
| E-34 | Rótulo `QA Kanban 2026`, cor `#22c55e` | |
| E-35 | Confirmar adicionar | Item na lista (provisório) |
| E-36 | Salvar config global | POST API 201 |
| E-37 | F5 | Status permanece, slug `qa_kanban_2026` ou similar |
| E-38 | Item novo tem lápis + lixeira | Não é sistema |

### FLUXO 4 — Config: excluir status custom

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-39 | Criar status descartável `Temp Excluir` | |
| E-40 | Salvar | Persistido |
| E-41 | Lixeira no status temp | Remove da lista pending |
| E-42 | Salvar | DELETE API |
| E-43 | F5 | Status ausente |

### FLUXO 5 — Config: tentativas bloqueadas (sistema)

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-44 | API direta PUT status `rascunho` (via intercept) | 403 |
| E-44b | API DELETE `cancelado` | 403 |
| E-45 | UI: não há controle editar em `Consolidado` | |

### FLUXO 6 — Lista: abas e coluna status refletem config

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-54 | Após Fluxo 2, ir `/pedido/pedidos/lista` | |
| E-55 | Aba `Em Execução QA` visível (ex-Em Andamento) | Label do config |
| E-56 | Nova aba `QA Kanban 2026` se Fluxo 3 executado | |
| E-57 | Coluna status — pedido em `em_andamento` | Badge cor `#ff00ff` + label custom |
| E-58 | Clicar aba custom | Filtra pedidos daquele status |
| E-65 | F5 lista | Abas persistem |

### FLUXO 7 — Kanban: colunas 1:1 com config

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-59 | Ir `/pedido/pedidos/kanban` | |
| E-60 | Contar colunas visíveis | = status config − ocultas |
| E-61 | Coluna `Em Execução QA` com cor correta | Header cor `#ff00ff` |
| E-62 | Coluna nova `QA Kanban 2026` presente | Após Fluxo 3 |
| E-63 | Ordem colunas | Mesma ordem Config (pós DnD Fluxo 1) |
| E-64 | Arrastar card para coluna nova (se pedido teste) | Status persiste |
| E-66 | F5 kanban | Colunas intactas |

### FLUXO 8 — Config Kanban: ocultar coluna (não-sistema)

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-67 | Config → Kanban → Colunas | |
| E-68 | Ocultar `Aprovado` | Toggle/checkbox |
| E-69 | Salvar prefs | |
| E-70 | Voltar Kanban | Coluna Aprovado ausente |
| E-71 | Tentar ocultar `Rascunho` | Bloqueado (sistema) |

### FLUXO 9 — Insights (Visão Geral): KPI topo + funil

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-72 | Ir `/pedido/pedidos/insights` | |
| E-73 | Cards KPI topo (4 widgets) | Títulos usam `pedido:status_config` |
| E-74 | Card mapeado para `aberto` | Label/cor do config |
| E-75 | Seção funil por status | **Gap:** labels hardcoded — registrar falha se custom label não aparece |
| E-76 | Painel insights lateral (se ativo) | Lista pedidos com status badge config |

### FLUXO 10 — Dashboard: filtros status

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-77 | Ir `/pedido/pedidos/dashboard` | |
| E-78 | Pills `Abertos`, `Em andamento`, `Concluídos` | Labels/cores de `status_config` |
| E-79 | Após editar `em_andamento`, pill reflete novo label | |
| E-80 | F5 dashboard | Persistência visual |

### FLUXO 11 — KPIs fixos do topo (config removida — TASK-000325 / PR #429)

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-81 | Config → sidebar Visualizações | **Não** existe item «Visão Geral» (`dashboard-kpi`) |
| E-82 | `/pedido/pedidos/dashboard` | 4 cards do topo carregam sem erro (`ReferenceError`) |
| E-83 | Cards do topo | Contagens por status fixo: rascunho, aberto, em_andamento, consolidado (rótulos de `status_config`) |
| E-84 | Insights → 4 cards do topo | Mesmo mapeamento fixo; sem persistência em `localStorage` |

### FLUXO 12 — Persistência cross-tela (smoke integrado)

| Passo | Ação | Resultado esperado |
|-------|------|-------------------|
| E-85 | Sequência: Config edit → Lista → Kanban → Insights → Dashboard | Mesmo rótulo/cor em todas |
| E-86 | Logout + login | Config API devolve mesma lista |
| E-87 | Segunda aba aberta — salvar config | Event `pedido:status-config-updated` atualiza KPI |

---

## testids necessários (adicionar antes do spec)

| Elemento | testid proposto |
|----------|-----------------|
| Lista status config | `pedido-config-status-lista` |
| Row status | `pedido-config-status-row-{slug}` |
| Badge sistema | `pedido-config-status-badge-sistema` |
| Botão novo status | `pedido-config-status-novo` |
| Barra salvar dirty | `pedido-config-status-salvar` |
| Kanban coluna | `pedido-kanban-coluna-{slug}` |

---

## Execução

```bash
npx playwright test testes/testes-e2e/produto-gravity/pedido/configuracao/status/TST-E2E-PEDIDO-000044.spec.ts
```

**Estado atual:** 0/87 passos implementados (spec scaffold pendente)
