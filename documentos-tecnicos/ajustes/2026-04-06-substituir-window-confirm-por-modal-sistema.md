# Relatório de Impacto — Substituir window.confirm por SelecaoExcluirGlobal/ModalGlobal

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** MEDIUM
**Aprovação obtida:** não necessária (MEDIUM interno ao produto)

---

## PROBLEMA

- **Descrição:** O produto Pedido usa `window.confirm()` / `confirm()` nativo do browser em 7 locais para confirmações de ações destrutivas ou irreversíveis. O padrão correto do sistema é `SelecaoExcluirGlobal` (@nucleo/modal-confirmar-excluir-global) para exclusões e `ModalGlobal` (@nucleo/modal-global) para outras confirmações.
- **Reproduzido em:** Screenshot da tela ListaPedidos mostrando dialog nativo do browser ao excluir pedidos em lote
- **Causa raiz identificada:** Padrão não foi seguido — os componentes corretos existem no nucleo-global e já estão configurados no vite.config.ts do produto, mas os devs usaram a API nativa do browser
- **Arquivo e linha exatos:**
  - `produto/pedido/client/src/pages/ListaPedidos.tsx:4484` (delete lote)
  - `produto/pedido/client/src/pages/ListaPedidos.tsx:4427` (duplicate item row action)
  - `produto/pedido/client/src/pages/Configuracoes.tsx:940` (delete template PDF)
  - `produto/pedido/client/src/components/DrawerPedido.tsx:237` (fechar com dados não salvos)
  - `produto/pedido/client/src/components/ConfiguracaoColunas/GerenciadorColunas.tsx:201` (delete column)
  - `produto/pedido/client/src/components/SmartImport/EtapaConfirmacao.tsx:83` (reverter importação)
  - `produto/pedido/client/src/components/PainelAnexos.tsx:168` (delete anexo)
- **Relacionado a ajuste anterior?** não
  - Padrão de ciclo detectado? não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Substituir 2x confirm() por SelecaoExcluirGlobal + ModalGlobal com estados reativos |
| `produto/pedido/client/src/pages/Configuracoes.tsx` | Substituir confirm() por SelecaoExcluirGlobal para delete de template |
| `produto/pedido/client/src/components/DrawerPedido.tsx` | Substituir window.confirm por ModalGlobal para unsaved changes warning |
| `produto/pedido/client/src/components/ConfiguracaoColunas/GerenciadorColunas.tsx` | Substituir window.confirm por SelecaoExcluirGlobal para delete de coluna |
| `produto/pedido/client/src/components/SmartImport/EtapaConfirmacao.tsx` | Substituir window.confirm por SelecaoExcluirGlobal para reversão de importação |
| `produto/pedido/client/src/components/PainelAnexos.tsx` | Substituir confirm() por SelecaoExcluirGlobal para delete de anexo |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `nucleo-global/Modais/modal-confirmar-excluir-global/` | Não modificar componente do nucleo — apenas consumir |
| `nucleo-global/Modais/modal-global/` | Não modificar — apenas consumir |
| Lógica de negócio / API calls | Apenas a camada de confirmação UI muda |
| Backend / servidor | Sem alterações |
| Banco de dados / schema | Sem alterações |
| Outros produtos (bid-cambio, bid-frete, etc.) | Fora do escopo desta tarefa |

---

## BLAST RADIUS

- **Dependentes diretos:** Somente os 6 arquivos listados no escopo positivo
- **Dependentes indiretos:** Nenhum — cada componente é folha na árvore de dependências
- **Contratos afetados:** Nenhum — apenas troca de UI de confirmação
- **Skills que devem ser respeitadas neste ajuste:** code-standards, agent-policy, ux/componentes

---

## CRITÉRIO DE SUCESSO

- Nenhum `window.confirm()` ou `confirm()` nativo restante no produto pedido
- Todas as ações destrutivas exibem `SelecaoExcluirGlobal` ou `ModalGlobal` do sistema
- A lógica de negócio (API calls, state updates) continua idêntica
- TypeScript compila sem erros

## CRITÉRIO DE PARADA

- Se a substituição exigir alteração no nucleo-global, parar e escalar ao Coordenador
- Se encontrar dependência circular ou breaking change em tipos, parar e documentar

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1     | `git revert HEAD` — desfaz o commit |
| 2     | Verificar que window.confirm voltou ao comportamento anterior |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável (mudança de UI apenas)

---

## DECISÃO Ajuste vs. Reescrita

**AJUSTE** — causa raiz isolada (API de UI incorreta), sem impacto em contratos públicos, blast radius mapeável.

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** a preencher
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1 / 2
- **Testes que passaram:** TypeScript compila
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável (mudança de UI)

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

**Próximo passo:** QA skill acionada? aguardando conclusão da execução
