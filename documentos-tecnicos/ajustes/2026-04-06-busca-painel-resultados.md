# Relatório de Impacto — Find-in-page (Localizar no Painel de Pedidos)

**Data:** 2026-04-06  
**Nível de risco:** HIGH  
**Status:** EXECUTADO ✓ — v2 corretivo pendente

## BUG v2 — onBuscar destrói os dados do find

**Causa raiz:** `handleBusca` chama `onBuscar?.(v)` → servidor refiltra `dados` → `findMatches` recomputa sobre conjunto menor → `findAtivo` reseta para 0 constantemente → scroll nunca chega ao match 3+, conteúdo some.

**Fix:** Adicionar prop `modoLocalizar?: boolean`. Quando `true`, não chamar `onBuscar` durante digitação. `ListaPedidos.tsx` passa `modoLocalizar={true}`. Outros produtos (`EstimativasDashboard`, `PedidosPage`) continuam sem a prop → comportamento inalterado.

**Arquivos:** `tipos.ts` (nova prop), `TabelaVirtualGlobal.tsx` (condicional), `ListaPedidos.tsx` (passar prop)

## PROBLEMA
O campo de busca era server-side (filtro de dados). O usuário quer find-in-page: busca em cabeçalhos de coluna E conteúdo das células, com destaque amarelo, navegação prev/next "X de N" e scroll automático até o match.

## ARQUIVOS ALTERADOS
| Arquivo | Alteração |
|---|---|
| `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` | Estado `findAtivo`, `findMatches` useMemo, `findProximo/Anterior` callbacks, helpers `isCelulaMatch/Ativo`, classes de destaque em células e headers, UI de navegação na barra |
| `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css` | Classes `gtv-find-bar`, `gtv-find-nav`, `gtv-find-count`, `gtv-find-btn`, `gtv-find-sem-resultado`, `gtv-celula--find-match`, `gtv-celula--find-match-ativo`, `gtv-th--find-match`, `gtv-th--find-match-ativo` |

## ESCOPO NEGATIVO
- `tipos.ts`, `ListaPedidos.tsx`, outros produtos — sem alteração (API `onBuscar` inalterada)
- Nenhum backend, schema ou outro produto tocado

## COMPORTAMENTO IMPLEMENTADO
1. Digitar no campo → varre headers (`col.label`) e células (`item[col.key]`) em tempo real
2. Matches aparecem com fundo amarelo tênue em todas as ocorrências
3. Match ativo tem fundo amarelo forte + outline amarelo
4. Contador "X de N" exibido à direita do campo quando há resultados
5. Botões ↑ ↓ (setas) para navegar — aparecem somente quando >1 match
6. Enter = próximo, Shift+Enter = anterior (atalho de teclado)
7. Scroll automático via `virtualizer.scrollToIndex` para matches em células
8. Headers de coluna com match ficam destacados (sem scroll necessário — header é sticky)
9. "Sem resultados" em vermelho quando termo não encontra nada

## VERIFICAÇÃO
- TypeScript: zero erros novos (erros pré-existentes de resolução de módulos são do monorepo, não do ajuste)
- Build pré-existente falhava por `@dnd-kit/core` no KanbanGlobal — sem relação com este ajuste
