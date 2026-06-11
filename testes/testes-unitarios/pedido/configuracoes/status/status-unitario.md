# Plano de Testes Unitários — Pedido / Configurações / Status

**ID:** TST-UNI-PEDIDO-000042  
**Data:** 2026-06-02  
**Versão:** 1.0  
**Criticidade:** alta  
**Cobertura mínima:** 70%  
**SSOT índice:** `testes/testes-unitarios/pedido/_planos/PLANO-PEDIDO-CONFIG-STATUS-SSOT.md`  
**Status:** Aguardando aprovação do dono

---

## Resumo executivo

Plano unitário para a feature de status de pedido: helpers de sistema (`statusPedidoSistema.ts`), normalização de lista, geração de slug, sincronização com `localStorage`, consumo nas abas da Lista, KPIs da Visão Geral e guards de Kanban. Complementa testes de API (funcional) e fluxo visual (E2E/em-tela).

**Spec alvo:** `testes/testes-unitarios/pedido/configuracoes/status/status-pedido-config.test.ts`  
**Legado a consolidar:** `testes/testes-unitarios/pedido/status-pedido-sistema.test.ts` (2 testes existentes)

---

## Módulos cobertos

| Módulo | Arquivo fonte |
|--------|---------------|
| Slugs sistema + normalização | `servicos-global/produto/pedido/client/src/shared/statusPedidoSistema.ts` |
| Export backend slugs | `servicos-global/produto/processos-core/src/routes/pedidos-config.ts` (`NOMES_STATUS_SISTEMA_PEDIDO`) |
| Slug a partir de rótulo | `Configuracoes.tsx` (`gerarNomeSlug` — extrair para helper testável ou testar via export) |
| Sync localStorage | `Configuracoes.tsx` (`sincronizarStatusLocal`) |
| Abas lista | `Pedidos.tsx` (`lerAbasDoLocalStorage`) |
| KPI Visão Geral | `visaoGeralTopKpi.ts`, `dashboardStatusKpi.ts` |
| Ordem funil (gap) | `useVisaoGeralPedido.ts` (`ORDEM_STATUS`, `STATUS_ROTULO`) |
| Kanban colunas ocultas guard | `Configuracoes.tsx` (coluna sistema não ocultável) |

---

## Casos de teste

### 1. `statusEhSistemaPedido` — slugs reservados

| ID | Entrada | Esperado |
|----|---------|----------|
| U-ST-01 | `{ nome: 'rascunho', is_sistema: false }` | `true` |
| U-ST-02 | `{ nome: 'aberto', is_sistema: false }` | `true` |
| U-ST-03 | `{ nome: 'transferencia', is_sistema: false }` | `true` |
| U-ST-04 | `{ nome: 'consolidado', is_sistema: false }` | `true` |
| U-ST-05 | `{ nome: 'cancelado', is_sistema: false }` | `true` |
| U-ST-06 | `{ nome: 'em_andamento', is_sistema: false }` | `false` |
| U-ST-07 | `{ nome: 'aprovado', is_sistema: false }` | `false` |
| U-ST-08 | `{ nome: 'custom_x', is_sistema: true }` | `true` (flag backend) |
| U-ST-09 | `{ nome: 'teste_kanban', is_sistema: false }` | `false` |

### 2. `normalizarListaStatus`

| ID | Cenário | Esperado |
|----|---------|----------|
| U-ST-10 | Lista com `rascunho` sem `is_sistema` | Primeiro item `is_sistema: true` |
| U-ST-11 | Lista mista sistema + custom | Apenas slugs reservados normalizados |
| U-ST-12 | Lista vazia | `[]` |
| U-ST-13 | Preserva ordem e demais campos | `ordem`, `rotulo`, `cor` intactos |

### 3. `SLUGS_STATUS_SISTEMA_PEDIDO` paridade back/front

| ID | Verificação |
|----|-------------|
| U-ST-14 | Set front === array export `NOMES_STATUS_SISTEMA_PEDIDO` back (5 slugs) |
| U-ST-15 | Nenhum slug editável (`em_andamento`, `aprovado`) no set |

### 4. `gerarNomeSlug` (rótulo → nome)

| ID | Rótulo | Ordem | Esperado |
|----|--------|-------|----------|
| U-ST-16 | `Teste Kanban` | 7 | `teste_kanban` |
| U-ST-17 | `Em Andamento!!!` | 2 | slug válido `[a-z0-9_]+` |
| U-ST-18 | `   ` (vazio) | 3 | `status_3` |
| U-ST-19 | Acentos `Transferência` | 4 | `transferencia` (NFD) |
| U-ST-20 | > 40 chars | 0 | truncado ≤ 40 |

### 5. `sincronizarStatusLocal` / mapa `pedido:status_config`

| ID | Cenário | Esperado |
|----|---------|----------|
| U-ST-21 | Lista 3 status | localStorage JSON com `{ slug: { label, cor } }` |
| U-ST-22 | Rótulo custom `Em Andamento` → `Em Execução` | Map reflete novo label |
| U-ST-23 | Falha localStorage (mock throw) | Não lança — swallow |

### 6. `lerAbasDoLocalStorage` (Lista)

| ID | Cenário | Esperado |
|----|---------|----------|
| U-ST-24 | Map válido 7 status | Aba `todos` + 7 abas na ordem do map |
| U-ST-25 | Custom `teste_kanban` label `QA Status` | Aba com label `QA Status` |
| U-ST-26 | localStorage ausente | `null` (fallback i18n) |
| U-ST-27 | JSON inválido | `null` |

### 7. `calcularTopKpiCardsVisaoGeral` / `rotuloStatusSlug`

| ID | Cenário | Esperado |
|----|---------|----------|
| U-ST-28 | Widget mapeado para `aberto` + config custom | Título = label do config |
| U-ST-29 | Slug sem config | Fallback i18n |
| U-ST-30 | Contagem pedidos por slug | `count` correto |

### 8. Funil Insights — ordem e labels (documentar gap)

| ID | Cenário | Esperado atual | Esperado desejado (bug?) |
|----|---------|----------------|--------------------------|
| U-ST-31 | Editar rótulo `aberto` → `Aberto QA` | Funil ainda mostra `Aberto` hardcoded | Paridade config — **falha esperada até fix** |
| U-ST-32 | Novo status custom com pedidos | Não aparece no funil (`ORDEM_STATUS` fixo) | Deve aparecer após fix |

### 9. Guards UI (jsdom — `StatusSortavel` isolado)

| ID | Cenário | Esperado |
|----|---------|----------|
| U-ST-33 | Render status sistema | Badge `sistema` visível, sem lápis/lixeira |
| U-ST-34 | Render `em_andamento` | Lápis + lixeira visíveis |
| U-ST-35 | Click lápis em sistema | Painel edição não abre |

---

## Execução

```bash
npx vitest run testes/testes-unitarios/pedido/configuracoes/status/
```

**Estado atual:** 2/35 casos implementados (`status-pedido-sistema.test.ts` — U-ST-01 parcial, U-ST-10 parcial)
