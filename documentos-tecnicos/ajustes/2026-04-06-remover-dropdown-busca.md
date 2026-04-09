# Relatório de Impacto — Remover dropdown busca, auto-ativar nav

**Data:** 2026-04-06
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

## PROBLEMA

- **Descrição:** O campo de busca exibe um dropdown intermediário (COLUNAS/REGISTROS) exigindo clique para ativar a navegação. O usuário quer busca automática em ambos os eixos ao digitar.
- **Causa raiz:** `dropdownColunaAberto` state e clique no dropdown como gate para setar `navColunas`.
- **Arquivo:** `TabelaVirtualGlobal.tsx` — handleBusca, JSX dropdown (~linha 2040-2072)

## ESCOPO POSITIVO

| Arquivo | Alteração |
|---|---|
| `TabelaVirtualGlobal.tsx` | Remover dropdown JSX + estado; `handleBusca` auto-seta `navColunas` ao digitar |
| `tabela-virtual.css` | Manter classes dropdown (não quebrar se outro produto usar); apenas não serão mais renderizadas |

## ESCOPO NEGATIVO

| Arquivo | Motivo |
|---|---|
| `ListaPedidos.tsx` | `onBuscar` já dispara em tempo real — sem mudança |
| `tipos.ts` | Nenhuma prop removida |
| Outros produtos | `navColunas` vazio quando `onNavegarColuna` não é passado → sem efeito |

## BLAST RADIUS
- Dependentes: apenas `ListaPedidos.tsx` (único consumer com `onNavegarColuna`)
- Contratos: nenhum alterado
- Scroll automático por coluna: **NÃO** — só scrollar ao clicar ← → (evitar scroll a cada keystroke)

## CRITÉRIO DE SUCESSO
- Digitar "expor" → pill expande imediatamente com `COLUNAS ‹ Nome do Exportador 1/6 ›`
- Digitar "ABC" → pill expande com `CONTEÚDO ‹ 1/1 ›`
- Nenhum dropdown aparece

## PLANO DE ROLLBACK
- `git revert` do commit — 3 minutos
