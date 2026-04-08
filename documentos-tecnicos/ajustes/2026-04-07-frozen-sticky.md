# Relatório de Impacto — Migração Frozen Columns: transform → sticky

**Data:** 2026-04-07
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária (LOW)

---

## PROBLEMA

- **Descrição:** Colunas congeladas da TabelaVirtualGlobal apresentam tremor (jitter) ao rolar horizontalmente e permitem que conteúdo apareça atrás delas (fundo semi-transparente em alguns estados)
- **Reproduzido em:** produto/pedido — ListaPedidos.tsx, coluna `numero_pedido` com `frozen: true`
- **Causa raiz identificada:** A implementação atual usa `transform: translateX(var(--gtv-scroll-left, 0px))` atualizado via listener de scroll na main thread JS. O listener roda com atraso em relação ao compositor do browser (1 frame de defasagem), causando jitter. O `transform` também cria novo stacking context, quebrando backgrounds em alguns estados.
- **Arquivo e linha exatos:**
  - `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css:645` — `transform: translateX` em `.gtv-th--frozen`
  - `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css:663` — `transform: translateX` em `.gtv-celula--frozen`
  - `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx:982-990` — listener de scroll que atualiza `--gtv-scroll-left`
- **Relacionado a ajuste anterior?** não
- **Padrão de ciclo detectado?** não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css` | Trocar `transform: translateX` por `position: sticky; left: var(--gtv-frozen-left, 0px)` em `.gtv-th--frozen` e `.gtv-celula--frozen` |
| `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` | Remover listener de scroll; adicionar `useLayoutEffect` que mede divs do header e injeta `left` via style inline nas células frozen |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `nucleo-global/Tabelas/tabela-global/` | Pacote separado, já usa `position: sticky` corretamente |
| `produto/pedido/` | Consumidor — não alterar; apenas smoke test |
| `produto/processo/` | Consumidor — não alterar; apenas smoke test |
| `produto/simula-custo/` | Consumidor — não alterar; apenas smoke test |
| `nucleo-global/Tabelas/tabela-virtual-global/src/tipos.ts` | `frozen?: boolean` permanece igual — sem quebra de contrato |
| Qualquer coluna não-frozen | Fora do escopo |

---

## BLAST RADIUS

- **Dependentes diretos:** `TabelaVirtualGlobal.tsx` (componente raiz do pacote)
- **Dependentes indiretos (consumidores):**
  - `produto/pedido/client/src/pages/ListaPedidos.tsx` — usa `frozen: true` em `numero_pedido`
  - `produto/processo/client/src/pages/pedidos/PedidosPage.tsx` — a verificar se usa frozen
  - `produto/simula-custo/client/src/pages/estimativas/EstimativasDashboard.tsx` — a verificar
- **Contratos afetados:** nenhum — `frozen?: boolean` na definição de coluna permanece inalterado
- **Skills verificadas neste ajuste:**
  - `skills/governanca/agent-policy/SKILL.md` ✅
  - `skills/governanca/code-standards/SKILL.md` ✅
  - `skills/arquitetura/nucleo-global/SKILL.md` ✅
  - `skills/ux/design-system/SKILL.md` ✅
  - `skills/ux/acessibilidade/SKILL.md` ✅

---

## CRITÉRIO DE SUCESSO

- Scroll horizontal sem tremor (jitter) visível
- Nada aparece atrás da coluna frozen (background completamente sólido)
- Funciona em todos os estados: linha normal, filho, selecionada, expandida
- Light theme: backgrounds corretos
- `npx tsc --noEmit` sem erros
- Smoke nos 3 produtos consumidores sem regressão

## CRITÉRIO DE PARADA

- Se `position: sticky` não funcionar no scroll container (ex: `overflow: hidden` inesperado em ancestral), parar e escalar
- Se qualquer produto consumidor apresentar regressão visual não corrigível sem tocar no produto, parar e replanejar

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert HEAD` (reverter commit da migração) |
| 2 | Verificar que `transform: translateX` voltou no CSS |
| 3 | Verificar que listener de scroll voltou no TSX |

- **Tempo estimado de rollback:** < 5 minutos
- **Rollback testado em staging?** não aplicável (LOW)

---

## DECISÃO: AJUSTE vs. REESCRITA

**AJUSTE** — pode prosseguir.
- Causa raiz isolada em 1 módulo ✅
- Não exige alterar contratos públicos ✅
- Blast radius verificável em 1 ciclo de QA ✅

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** pendente
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** pendente
- **Testes que passaram:** pendente
- **Testes que falharam:** pendente
- **SLA validado:** não aplicável (mudança puramente visual/CSS)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [ ] Tenant isolation intacto
- [ ] Zero `any` introduzido
- [ ] Zero `console.log` esquecido
- [ ] TypeScript compila limpo
- [ ] Correlation ID preservado
- [ ] SLA ≤ 200ms confirmado
- [ ] Todas as skills da Fase 0.1 respeitadas
- [ ] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? pendente
