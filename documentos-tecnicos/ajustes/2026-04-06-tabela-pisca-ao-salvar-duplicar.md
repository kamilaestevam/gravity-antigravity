# Relatório de Impacto — Tabela pisca ao salvar/duplicar

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária (LOW, 1 arquivo, sem mudança de contrato)

---

## PROBLEMA

- **Descrição:** Ao concluir operações via modal (duplicar pedido, edição em massa, transferir, consolidar, criar novo pedido, excluir, etc.) a tabela de pedidos pisca — some e reaparece — antes de mostrar os dados atualizados.
- **Reproduzido em:** qualquer operação que chama `carregarInicial()` após fechar um modal
- **Causa raiz identificada:** `carregarInicial()` sempre chama `setCarregando(true)`, o que faz `TabelaVirtualGlobal` esconder header e body via `{!carregando && ...}` e renderizar o GTSkeleton. Após o fetch, `setCarregando(false)` restaura a tabela com novos dados. Esse ciclo hide/show é o "pisca".
- **Arquivo e linha exatos:**
  - `produto/pedido/client/src/pages/ListaPedidos.tsx:4502` — `setCarregando(true)` em `carregarInicial`
  - `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx:2228` — `{!carregando && ...}` oculta o header
  - `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx:2363` — `{!carregando && ...}` oculta o body
- **Relacionado a ajuste anterior?** não
- **Padrão de ciclo detectado?** não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Adicionar `refreshSilenciosoRef` + lógica condicional em `carregarInicial` + 13 call sites |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `TabelaVirtualGlobal.tsx` | Comportamento do componente está correto; o problema está em quem controla o estado |
| Backend (qualquer rota) | Mudança puramente de estado frontend |
| `shared/types.ts` | Nenhuma alteração de tipo |
| Outros produtos | Isolado ao produto Pedido |

---

## BLAST RADIUS

- **Dependentes diretos:** apenas `ListaPedidos.tsx`
- **Dependentes indiretos:** nenhum (mudança interna de estado React)
- **Contratos afetados:** nenhum
- **Skills que devem ser respeitadas neste ajuste:** agent-policy, code-standards, state-management

---

## CRITÉRIO DE SUCESSO

- Após duplicar pedido: lista atualiza sem piscar (header e dados permanecem visíveis)
- Após edição em massa: idem
- Após criar novo pedido: idem
- Após excluir: idem
- Mudança de aba/sort/busca: continua mostrando skeleton (comportamento correto, usuário muda o contexto)

## CRITÉRIO DE PARADA

- Se encontrar efeito cascata em outro componente, parar e escalar.
- Se TypeScript reclamar de algo inesperado, parar e documentar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit de ajuste |
| 2 | Verificar que tabela volta ao comportamento anterior |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável (LOW risk, dev local)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

### Estratégia de implementação

Adicionar `refreshSilenciosoRef = useRef(false)` em `ListaPedidos.tsx`. Em `carregarInicial`, ler e resetar o ref antes de decidir se chama `setCarregando(true)`. Nas 13 chamadas pós-operação, setar `refreshSilenciosoRef.current = true` imediatamente antes de `carregarInicial()`.

**Calls que MANTÊM o spinner (navegação explícita do usuário):**
- `useEffect(() => { carregarInicial() }, [])` — carga inicial
- `carregarInicial(aba, ...)` — mudar aba
- `carregarInicial(abaAtiva, campo, ...)` — mudar sort
- `carregarInicial(abaAtiva, sortCampo, sortDir, termo)` — mudar busca

**Calls que FICAM SILENCIOSAS (operações em background):**
- Excluir pedido (linha ~4550)
- Duplicar item (linha ~4576)
- Excluir item (linha ~4591)
- Excluir lote (linha ~4635)
- Criar novo pedido (linha ~5329)
- Adicionar item (linha ~5346)
- Drawer salvo (linha ~5357)
- SmartImport concluído (linha ~5367)
- Modal Transferir concluído (linha ~5422)
- Modal Edição em Massa concluído (linha ~5435)
- Modal Consolidar concluído (linha ~5448)
- Modal Duplicar Itens concluído (linha ~5461)
- Modal Duplicar Pedidos concluído (linha ~5474)

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** verificação manual + TypeScript
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável (mudança de UI state)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto (nenhuma query tocada)
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo
- [x] Correlation ID preservado
- [x] SLA não afetado
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não obrigatória (LOW sem regressão)
