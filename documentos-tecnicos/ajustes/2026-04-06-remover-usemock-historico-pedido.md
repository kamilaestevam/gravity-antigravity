# Relatório de Impacto — Remover useMock do Histórico (produto Pedido)

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** A tela Histórico do produto Pedido exibe dados mock em DEV em vez de consultar a API real.
- **Reproduzido em:** localhost:5179/historico — exibe 320 registros mock gerados localmente.
- **Causa raiz identificada:** prop `useMock={import.meta.env.DEV}` adicionado na sessão atual para fins de demonstração temporária.
- **Arquivo e linha exatos:** `produto/pedido/client/src/pages/Historico.tsx:16`
- **Relacionado a ajuste anterior?** Não — adicionado nesta mesma sessão. Padrão de ciclo: não detectado.

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/client/src/pages/Historico.tsx` | Remover prop `useMock={import.meta.env.DEV}` — restaurar comportamento padrão (API real) |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `servicos-global/tenant/historico-global/src/Historico.tsx` | Definição do componente — sem alteração necessária |
| `servicos-global/tenant/historico-global/client/src/main.tsx` | Demo do serviço — escopo separado |
| `nucleo-global/Layout/tela-produto-global/demo/src/pages/Historico.tsx` | Demo da tela global — escopo separado |

---

## BLAST RADIUS

- **Dependentes diretos:** nenhum
- **Dependentes indiretos:** nenhum
- **Contratos afetados:** nenhum
- **Skills verificadas:** agent-policy, code-standards

---

## CRITÉRIO DE SUCESSO

- Prop `useMock` removido do arquivo.
- Histórico passa a buscar da API real via `/historico-api`.
- TypeScript compila sem erros.

## CRITÉRIO DE PARADA

- Se a remoção causar erro de TypeScript inesperado, parar e investigar antes de continuar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1     | Reverter com `git checkout produto/pedido/client/src/pages/Historico.tsx` |

- **Tempo estimado de rollback:** < 1 minuto
- **Rollback testado em staging?** não aplicável (LOW)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** a executar
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** TypeScript + smoke visual
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo
- [x] Correlation ID preservado
- [x] SLA ≤ 200ms confirmado (não aplicável — mudança de prop)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não (LOW sem regressão)
