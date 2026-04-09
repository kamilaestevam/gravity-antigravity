# Relatório de Impacto — Edição em Massa: mensagem de erro P2002 ilegível

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** Ao aplicar edição em massa com campo `numero_pedido` para N pedidos selecionados, apenas 1 é atualizado e os demais falham com mensagem de erro que expõe caminhos internos, stack traces e texto técnico do Prisma na UI.
- **Reproduzido em:** Selecionar 19 pedidos → Editar em Massa → campo "Número do Pedido" → valor "001" → Aplicar em Massa. Toast vermelho exibe a mensagem bruta do Prisma.
- **Causa raiz identificada:** No `catch` da transação em `edicaoEmMassaService.ts:234`, o erro Prisma P2002 (violação de `@@unique([tenant_id, numero_pedido])`) é capturado mas `err.message` contém texto técnico completo. O frontend em `ModalEdicaoEmMassa.tsx:800` exibe `resultado.erros[0].motivo` diretamente no toast.
- **Arquivo e linha exatos:** `produto/pedido/server/src/services/edicaoEmMassaService.ts` linhas 234–238
- **Relacionado a ajuste anterior?** não
  - Padrão de ciclo detectado? Não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/server/src/services/edicaoEmMassaService.ts` | Detectar erro Prisma P2002 no catch e retornar mensagem amigável em português |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `ModalEdicaoEmMassa.tsx` | Frontend já exibe `erros[0].motivo` corretamente — basta corrigir o texto no backend |
| `shared/types.ts` | Nenhuma alteração de contrato |
| `fragment.prisma` | Não é bug da constraint, é ausência de mensagem amigável |
| Quaisquer outros serviços | Escopo isolado ao serviço de edição em massa |

---

## BLAST RADIUS

- **Dependentes diretos:** `ModalEdicaoEmMassa.tsx` (consome o resultado)
- **Dependentes indiretos:** nenhum
- **Contratos afetados:** nenhum (shape de `EdicaoMassaResultado` permanece idêntico)
- **Skills que devem ser respeitadas neste ajuste:** agent-policy, code-standards

---

## CRITÉRIO DE SUCESSO

- Toast de erro exibe mensagem legível: "Valor duplicado: o campo 'numero_pedido' já existe para outro pedido"
- Pedidos sem conflito de unique continuam sendo atualizados normalmente
- TypeScript compila sem erros

## CRITÉRIO DE PARADA

- Se a detecção de P2002 exigir import de `@prisma/client/runtime/library` gerando dependência circular → parar e escalar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert HEAD` no commit do fix |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável

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
- **SLA validado:** não aplicável

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

**Próximo passo:** QA skill acionada? não necessária (LOW sem regressão)
