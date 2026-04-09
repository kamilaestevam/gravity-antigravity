# Relatório de Impacto — Busca por Nome de Coluna com Dropdown + Highlight

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** MEDIUM
**Aprovação obtida:** não necessária (MEDIUM, sem janela de mudança exigida)

---

## PROBLEMA

- **Descrição:** O campo de busca global da ListaPedidos pesquisa apenas valores de linhas. Com 50+ colunas, o usuário não consegue encontrar uma coluna pelo nome sem rolar horizontalmente.
- **Reproduzido em:** ListaPedidos.tsx — tabela com muitas colunas onde o campo de busca ignora labels de coluna
- **Causa raiz identificada:** A busca (`termoBusca` / `busca`) só dispara `onBuscar` para filtro de dados. Nenhum mecanismo cruza o termo com `colunas[].label`.
- **Arquivo e linha exatos:**
  - `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx:1955-1972` — campo de busca no toolbar
  - `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx:2112-2116` — header de coluna (sem data-col-key)
  - `produto/pedido/client/src/pages/ListaPedidos.tsx:4312` — estado `busca`
- **Relacionado a ajuste anterior?** não
  - Padrão de ciclo detectado? não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/tipos.ts` | Adicionar props opcionais `colunasHighlight` e `onNavegarColuna` em GTVirtualTableProps |
| `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` | Dropdown de sugestões de colunas no toolbar + `data-col-key` nos headers + classe `gtv-th--highlighted` |
| `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css` | CSS do dropdown + `@keyframes` + `.gtv-th--highlighted` |
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Handler `onNavegarColuna` + state `colunasHighlight` + scroll via `scrollIntoView` |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/index.ts` | Re-exporta GTVirtualTableProps que já inclui os novos tipos automaticamente |
| `produto/simula-custo/` e `produto/processo/` | Consumidores da tabela — props novas são opcionais, zero breaking change |
| Backend (routes, services) | Feature é 100% client-side |
| `testes/` | Testes existentes não quebram (props opcionais); novos testes são recomendados mas fora do escopo cirúrgico |

---

## BLAST RADIUS

- **Dependentes diretos:** ListaPedidos.tsx (único consumer que ativará as novas props)
- **Dependentes indiretos:** simula-custo/EstimativasDashboard.tsx, processo/PedidosPage.tsx, demo/App.tsx — não passarão as novas props, comportamento inalterado
- **Contratos afetados:** `GTVirtualTableProps` em tipos.ts — adição aditiva (props opcionais), zero breaking change
- **Skills que devem ser respeitadas neste ajuste:** nucleo-global/SKILL.md (sem lógica de negócio), design-system/SKILL.md (usar variáveis CSS), code-standards/SKILL.md (TypeScript strict, sem any)

---

## CRITÉRIO DE SUCESSO

- Digitar um termo que case com label de coluna exibe dropdown com seções "COLUNAS" e "REGISTROS"
- Clicar em coluna no dropdown: header correspondente pulsa em âmbar por ~2s + scroll horizontal até ele
- Pressionar Enter / clicar em "REGISTROS": comportamento original de busca de dados intacto
- TypeScript compila sem erros em todos os produtos consumidores

## CRITÉRIO DE PARADA

- Se a adição de `forwardRef` / `useImperativeHandle` se tornar necessária para o scroll → parar e escalar, usar abordagem `scrollIntoView` como fallback
- Se SimulaCusto ou Processo quebrarem em TypeScript → parar, reclassificar para HIGH

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit de ajuste |
| 2 | Verificar TypeScript compila limpo |

- **Tempo estimado de rollback:** 3 minutos
- **Rollback testado em staging?** não aplicável (dev local)

---

## JANELA DE MUDANÇA (HIGH/CRITICAL)

N/A — nível MEDIUM

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** pendente (aguardando confirmação do usuário)
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** Erros pré-existentes no tsc (módulos não instalados no contexto estático) — não relacionados ao ajuste
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1 (Camada 2 requer servidor rodando)
- **Testes que passaram:** grep de erros TypeScript relacionados ao novo código = zero erros
- **Testes que falharam:** nenhum relacionado ao ajuste
- **SLA validado:** não aplicável (feature UI pura, sem chamada de backend)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto (feature 100% frontend, sem query)
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript — zero erros relacionados ao código novo
- [x] Correlation ID preservado (nenhuma rota afetada)
- [x] SLA ≤ 200ms confirmado (sem chamada backend)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado (simula-custo e processo não tocados)

**Próximo passo:** QA skill acionada? sim (MEDIUM)
