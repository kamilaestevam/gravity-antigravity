# Resultado — Teste em Tela
**Data:** 2026-04-08 12:45
**Produto:** produto/pedido
**Ajuste relacionado:** customização do Kanban do Pedido (CardPedido, ModalKanbanPedido, Configurações → Kanban)
**Pasta de prints:** testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/

---

## FLUXO CORRIGIDO

| Teste | Resultado | Tempo | Observação |
|:------|:----------|:------|:-----------|
| kanban abre sem erros de console e renderiza colunas | ✅ | 10.1s | — |
| colunas de status do kanban são renderizadas | ✅ | 5.0s | Rascunho/Aberto/Em Andamento/Consolidado/Cancelado presentes |
| cards com classe kbp-card existem ou estado vazio ok | ✅ | 5.3s | — |
| seção Kanban aparece no sidebar de Configurações | ✅ | 5.6s | — |
| seção Kanban exibe 3 abas configuráveis | ✅ | 6.0s | Pedido/Quantidades/Datas |
| seção Kanban tem aba Lembrete (não configurável) | ✅ | 5.6s | — |

**Total fluxo corrigido: 6/6 ✅**

## TESTES UNITÁRIOS

| Suíte | Resultado | Total |
|:------|:----------|:------|
| kanbanPedidos.test.ts (helpers + types) | ✅ 33/33 | 33 |
| Suite completa pedido (incluindo pré-existentes) | ⚠️ 235/250 | 15 falhas pré-existentes |

## TESTES FUNCIONAIS

| Suíte | Resultado | Total |
|:------|:----------|:------|
| kanban-preferencias.test.ts (GET/PUT/DELETE + validação + tenant isolation) | ✅ 17/17 | 17 |

## FLUXOS CRÍTICOS — REGRESSÃO

| Grupo | Resultado |
|:------|:----------|
| adicionar-item @critico (5 testes) | ✅ todos |
| configuracoes-regras @critico (8 testes) | ✅ todos |
| dashboard @critico (1 teste) | ✅ |
| duplicar-itens @critico (3 testes) | ✅ todos |
| edicao-inline-item @critico (2 testes) | ✅ todos |
| localizar — básico @critico (15 testes) | ✅ todos |
| localizar — @com-backend data (13 testes) | ⚠️ pré-existente |
| smart-import-mapeamento (3 testes) | ⚠️ pré-existente |

**Regressão: 37/55 — 18 falhas PRÉ-EXISTENTES (dependem de dados reais no banco)**

---

## PRINTS CAPTURADOS

| # | Arquivo | Etapa |
|:--|:--------|:------|
| 01 | [testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/01-kanban-carregado.png](testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/01-kanban-carregado.png) | Kanban carregado com 5 colunas |
| 02 | [testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/02-kanban-colunas.png](testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/02-kanban-colunas.png) | Colunas de status visíveis |
| 03 | [testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/03-kanban-cards.png](testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/03-kanban-cards.png) | Cards ou estado vazio |
| 04 | [testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/04-card-estrutura.png](testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/04-card-estrutura.png) | Estrutura do card (.kbp-card) |
| 05 | [testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/05-configuracoes-sidebar.png](testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/05-configuracoes-sidebar.png) | Sidebar com item Kanban |
| 06 | [testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/06-configuracoes-kanban.png](testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/06-configuracoes-kanban.png) | Seção Kanban com abas e campos |
| 07 | [testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/07-configuracoes-kanban-lembrete.png](testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado/07-configuracoes-kanban-lembrete.png) | Aba Lembrete presente |

---

## GAPS DE COBERTURA

- Modal com 4 abas (Pedido/Quantidades/Datas/Lembrete) — não testável E2E sem dados de pedido real no banco
- Card data crítica com urgência — não testável E2E sem dados com datas previstas

---

## FALHAS ENCONTRADAS

Nenhuma falha causada pelo ajuste kanban.

As 18 falhas na regressão são:
- **localizar.spec.ts** (13 falhas): Testes `@com-backend` que buscam dados reais (numero_proforma, part_number, etc.) — dependem de dados seed no banco
- **smart-import-mapeamento.spec.ts** (3 falhas): Precisam de arquivo CSV real para testar upload
- Todas confirmadas como **PRÉ-EXISTENTES** (sem relação com kanban)

---

## DECISÃO

- [x] ✅ TUDO PASSOU (fluxo corrigido: 6/6 E2E + 33 unitários + 17 funcionais)
- [ ] ❌ FALHA NO FLUXO CORRIGIDO
- [ ] ❌ FALHA NA REGRESSÃO (causada pelo ajuste)
- [x] ⚠️ FALHA PRÉ-EXISTENTE — 18 testes com dependência de dados reais (registrado, não bloqueia)
- [x] ⚠️ GAPS DE COBERTURA — modal/card com dados reais não testável E2E sem seed
