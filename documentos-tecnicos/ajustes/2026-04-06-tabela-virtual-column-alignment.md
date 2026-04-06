# Relatório de Impacto — Desalinhamento de Colunas na TabelaVirtualGlobal

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** MEDIUM
**Aprovação obtida:** não necessária (1 linha CSS, sem contrato público)

---

## PROBLEMA

- **Descrição:** Colunas da tabela visualmente desalinhadas — títulos do cabeçalho aparecem deslocados em relação às células de dados.
- **Reproduzido em:** produto/pedido — tela Lista (screenshot confirmado pelo usuário)
- **Causa raiz identificada:** `min-width: 80px` adicionado ao `.gtv-th` na sessão atual contradiz o sistema `getColWidth` que já calcula a largura unificada de coluna (cabeçalho + célula). As colunas especiais `.gtv-th--check` e `.gtv-th--expand` têm `flex: 0 0 40px` mas são forçadas a 80px pelo `min-width` herdado do `.gtv-th`, enquanto as células correspondentes permanecem em 40px. Isso cria um shift de 40px acumulado em todos os headers seguintes.
- **Arquivo e linha exatos:** `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css:514`
- **Relacionado a ajuste anterior?** sim
  - Referência: commit `5b5dbe8` — "fix(nucleo-global/pedido): corrige edição inline de moeda em linhas filho e alinhamento de células"
  - **Padrão de ciclo detectado: sim** — alinhamento foi corrigido antes e voltou a quebrar

---

## REGRAS DO USUÁRIO (fonte de verdade)

1. Não existe "largura de célula" separada de "largura de coluna" — tudo é uma coisa só
2. Largura auto-ajustada com base no conteúdo, com máximo de 150px
3. Sistema `getColWidth` + `autoFit` já implementam corretamente: `Math.min(Math.max(col.label.length, maxConteudo) + 4, 150) * 8`
4. O CSS **não pode** ter `min-width` que contradiga o JS

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Linha | Motivo da alteração |
|:--------|:------|:--------------------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css` | 514 | Reverter `min-width: 80px` → `min-width: 0` em `.gtv-th` |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `TabelaVirtualGlobal.tsx` | Lógica `getColWidth` e `autoFit` já estão corretos |
| `produto/pedido/` e demais consumidores | Nenhuma prop ou contrato muda |
| Schema Prisma, rotas, tipos Zod | Não afetados por mudança visual |

---

## BLAST RADIUS

- **Dependentes diretos:** ListaPedidos.tsx, PedidosPage.tsx (processo), EstimativasDashboard.tsx (simula-custo), demo App.tsx
- **Dependentes indiretos:** Qualquer produto futuro que usar TabelaVirtualGlobal
- **Contratos afetados:** Nenhum
- **Skills respeitadas neste ajuste:** nucleo-global, design-system, code-standards, agent-policy

---

## CRITÉRIO DE SUCESSO

- Títulos de colunas alinhados pixel-a-pixel com as células correspondentes em todas as colunas (checkbox, expand, dados)
- Larguras continuam sendo calculadas pelo `getColWidth` (autoFit + max 150px)
- Nenhum produto consumidor quebra visualmente

## CRITÉRIO DE PARADA

- Se reverter `min-width: 0` causar colapso visual inesperado em outras colunas, parar e investigar antes de commitar

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git checkout -- nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css` |
| 2 | Verificar visualmente que a tabela voltou ao estado anterior |

- **Tempo estimado de rollback:** < 1 minuto
- **Rollback testado em staging?** não aplicável

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** aguardando aprovação do usuário
- **Divergências do plano original:** —
- **Descobertas inesperadas:** —
- **Issues abertas separadamente:** A mudança estrutural de tirar o header do scroll container (mudança #2 da sessão) deve ser avaliada separadamente como possível problema arquitetural — sincronização via JS é frágil comparado ao modelo anterior onde header e body estavam no mesmo scroll container.

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** aguardando execução
- **Testes que passaram:** —
- **Testes que falharam:** —
- **SLA validado:** não aplicável (mudança CSS)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [ ] Tenant isolation intacto (não aplicável — CSS puro)
- [ ] Zero `any` introduzido (não aplicável — CSS puro)
- [ ] Zero `console.log` esquecido (não aplicável)
- [ ] TypeScript compila limpo (não afetado)
- [ ] Correlation ID preservado (não aplicável)
- [ ] SLA ≤ 200ms confirmado (não aplicável)
- [ ] Todas as skills da Fase 0.1 respeitadas
- [ ] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? aguardando execução
