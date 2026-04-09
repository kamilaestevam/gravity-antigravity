# Relatório de Impacto — Taxa de Câmbio no Configurador

**Data:** 2026-04-07
**Responsável:** Dream Team Ajustes
**Nível de risco:** MEDIUM
**Aprovação obtida:** não necessária (feature nova, sem alteração de contrato existente)

---

## PROBLEMA

- **Descrição:** O sistema não possui uma tabela central de taxas de câmbio (PTAX) acessível a todos os produtos. O Pedido e outros produtos precisam converter valores entre moedas (ex: EUR + CNY → USD) para consolidar dívidas.
- **Reproduzido em:** N/A — feature nova
- **Causa raiz identificada:** Ausência de serviço centralizado de câmbio no Configurador
- **Arquivo e linha exatos:** N/A — criação de arquivos novos
- **Relacionado a ajuste anterior?** não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `configurador/prisma/schema.prisma` | Adicionar model `TaxaCambio` |
| `servicos-global/configurador/server/routes/taxaCambio.ts` | NOVO — rota de câmbio |
| `servicos-global/configurador/server/index.ts` | Registrar nova rota |
| `servicos-global/configurador/src/pages/workspace/TaxaCambio.tsx` | NOVA — página workspace |
| `servicos-global/configurador/src/App.tsx` | Adicionar lazy import + route |
| `servicos-global/configurador/src/pages/workspace/WorkspaceLayout.tsx` | Adicionar nav item |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `produto/bid-cambio/` | Apenas consumido via HTTP — não modificado |
| `produto/pedido/` | Consumirá a nova API em tarefa futura |
| `servicos-global/tenant/prisma/schema.prisma` | Tenant schema — não afetado |
| Qualquer outro produto | Fora do escopo |

---

## BLAST RADIUS

- **Dependentes diretos:** WorkspaceLayout.tsx (nav), App.tsx (rota)
- **Dependentes indiretos:** Nenhum (API nova, sem consumers ainda)
- **Contratos afetados:** Nenhum existente — apenas adição de novos endpoints
- **Skills verificadas:** agent-policy, code-standards, configurador, tenant-isolation, schema-composition

---

## CRITÉRIO DE SUCESSO

- `GET /api/v1/taxa-cambio` retorna taxas atuais de todas as moedas
- `GET /api/v1/taxa-cambio/historico` retorna histórico paginado
- `POST /api/v1/taxa-cambio/sync` busca do bid-cambio e persiste no DB
- Página `/workspace/taxa-cambio` exibe tabela de taxas + histórico
- TypeScript compila limpo (`npx tsc --noEmit`)

## CRITÉRIO DE PARADA

- Se o bid-cambio não estiver rodando na porta 8025, a sync falha graciosamente (não quebra a rota)
- Se migration falhar, parar e escalar

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | Reverter schema.prisma (remover TaxaCambio) |
| 2 | `prisma migrate dev --name rollback-taxa-cambio` |
| 3 | Remover route file e import no index.ts |
| 4 | Remover página e route em App.tsx |

- **Tempo estimado de rollback:** 10 minutos
- **Rollback testado em staging?** não aplicável (dev local)

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
- **SLA validado:** não aplicável (feature nova)

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

**Próximo passo:** QA skill acionada? aguardando execução
