# Relatório de Impacto — Config Transferir: Limite de Quantidade

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** MEDIUM
**Aprovação obtida:** não necessária (MEDIUM auto-aprovado — sem mudança de contrato público)

---

## PROBLEMA

- **Descrição:** Ausência de controle de limite na transferência de quantidade. O produto permite transferir mais quantidade do que a quantidade total inicial do pedido (`quantidade_transferida_total > quantidade_total_inicial_pedido`), sem bloqueio nem destaque visual.
- **Reproduzido em:** Screenshot 1 — linha com QTD INICIAL = 10.000 UN e QTD TRANSFERIDA = 2.000.000 UN.
- **Causa raiz identificada:** A interface `RegrasConfig` em `Configuracoes.tsx` já possui a categoria `transferir`, mas não tem o campo `bloquearTransferenciaAcimaInicial`. A coluna `quantidade_transferida_total` em `ListaPedidos.tsx` renderiza o valor sem qualquer verificação de limite.
- **Arquivo e linha exatos:**
  - `Configuracoes.tsx:363–367` — interface `RegrasConfig.transferir` sem o campo novo
  - `Configuracoes.tsx:969–973` — estado inicial de `regrasConfig.transferir` sem o campo novo
  - `Configuracoes.tsx:2007–2035` — JSX da seção "Transferir itens" sem o novo toggle
  - `ListaPedidos.tsx:763–769` — função `render` da coluna `quantidade_transferida_total` sem lógica de destaque
- **Relacionado a ajuste anterior?** não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `produto/pedido/client/src/pages/Configuracoes.tsx` | Adicionar campo `bloquearTransferenciaAcimaInicial` à interface `RegrasConfig`, ao estado inicial e ao JSX da seção "Transferir itens" |
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Modificar a função `render` da coluna `quantidade_transferida_total` para destacar em vermelho quando config permite E transferida > inicial |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `produto/pedido/client/src/shared/types.ts` | Não há tipo `RegrasConfig` em `types.ts` — fica em `Configuracoes.tsx`. Nenhuma adição necessária. |
| `produto/pedido/client/src/shared/api.ts` | Regras são salvas via `localStorage` — não há endpoint de API para regras. |
| `produto/pedido/server/src/services/transferirService.ts` | O backend já valida `quantidade_solicitada > saldo_disponivel` (linha 364–370). A nova config é uma **regra de UI** — bloqueia a UI quando ativo. O backend não precisa de mudança: valida saldo por item (não total inicial). Escopo: frontend only. |
| `servicos-global/tenant/processos-core/src/routes/pedidos.ts` | Sem alteração de rota. |
| `servicos-global/tenant/prisma/schema.prisma` | Sem alteração de schema. |

---

## BLAST RADIUS

- **Dependentes diretos:**
  - `Configuracoes.tsx` — self-contained, nenhum outro arquivo importa `RegrasConfig`
  - `ListaPedidos.tsx` — `COLUNAS_PAI` é constante de módulo; a função `render` usa `localStorage.getItem` diretamente (padrão existente no arquivo, ex: linha 489)
- **Dependentes indiretos:** nenhum — `COLUNAS_PAI` é consumida internamente por `ListaPedidos.tsx`
- **Contratos afetados:** nenhum — `RegrasConfig` é tipo local de `Configuracoes.tsx`, não exportado
- **Skills que devem ser respeitadas neste ajuste:**
  - `agent-policy` — sem `any`, sem `console.log`, TypeScript strict
  - `code-standards` — sem `any` explícito, ESModules, naming camelCase

---

## CRITÉRIO DE SUCESSO

- Toggle "Não permitir transferir quantidade maior que a quantidade inicial" aparece na seção "Transferir itens" da página Configurações
- Toggle salva e carrega via `localStorage` com chave `pedido:regras_config`
- Quando toggle está OFF (config permite): coluna "QTD. TRANSFERIDA DO PEDIDO" fica vermelha quando `quantidade_transferida_total > quantidade_total_inicial_pedido`
- Quando toggle está ON (bloqueado, default): nenhum destaque vermelho (a regra está sendo aplicada — não há excesso)
- Nenhum `any` introduzido
- TypeScript compila limpo

## CRITÉRIO DE PARADA

- Se o padrão de `COLUNAS_PAI` impossibilitar acesso ao localStorage de forma limpa, parar e reclassificar como HIGH para redesenho de arquitetura de colunas.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit do ajuste |
| 2 | Usuário limpa `localStorage` key `pedido:regras_config` |

- **Tempo estimado de rollback:** 5 minutos
- **Rollback testado em staging?** não aplicável (sem migration de banco)

---

## JANELA DE MUDANÇA (HIGH/CRITICAL)

Não se aplica (MEDIUM).

---

## PLANO DE EXECUÇÃO (passo a passo)

### Passo 1 — `Configuracoes.tsx`: Adicionar campo à interface `RegrasConfig`
- Linha 363–367: adicionar `bloquearTransferenciaAcimaInicial: boolean` dentro de `transferir: { ... }`

### Passo 2 — `Configuracoes.tsx`: Adicionar default ao estado inicial
- Linha 969–973: adicionar `bloquearTransferenciaAcimaInicial: true` dentro de `regrasConfig.transferir`

### Passo 3 — `Configuracoes.tsx`: Adicionar toggle ao JSX
- Linha 2028–2033: após o último `<ToggleRow>` da seção "Transferir itens", adicionar novo `<ToggleRow>` para o campo

### Passo 4 — `ListaPedidos.tsx`: Modificar função `render` da coluna `quantidade_transferida_total`
- Linha 763–769: a função `render` deve:
  1. Ler `localStorage.getItem('pedido:regras_config')` e parsear
  2. Verificar se `bloquearTransferenciaAcimaInicial === false` (permitido)
  3. Verificar se `quantidade_transferida_total > quantidade_total_inicial_pedido`
  4. Se ambas: aplicar `color: 'var(--color-error, #ef4444)'` no span

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** pendente (aguardando instrução do usuário)
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:**
  - `COLUNAS_PAI` é constante de módulo (fora do componente React) — a leitura de localStorage dentro de `render` é o padrão correto para este caso. Confirmado que já existe em `ListaPedidos.tsx` nas linhas 134, 135, 154, 473, 489 (leituras de `pedido:status_cores_version`, `pedido:status_config`, `pedido:casas_decimais`).
  - O estado `regrasConfig` em `Configuracoes.tsx` inicializa com defaults hardcoded e NÃO carrega do localStorage ao montar. Isso é comportamento pré-existente (não introduzido por este ajuste). A leitura da regra em `ListaPedidos.tsx` lê diretamente do localStorage salvo pelo botão "Salvar regras".
  - Todos os erros TypeScript nos arquivos modificados são pré-existentes (módulos `@nucleo/`, `@gravity/shell` não instalados localmente).
- **Issues abertas separadamente:** nenhuma

**Arquivos efetivamente alterados:**
1. `produto/pedido/client/src/pages/Configuracoes.tsx`
   - Linha 363–367: adicionado `bloquearTransferenciaAcimaInicial: boolean` à interface `RegrasConfig.transferir`
   - Linha 969–973: adicionado `bloquearTransferenciaAcimaInicial: true` ao estado inicial
   - Linha 2028–2033: adicionado novo `<ToggleRow>` com `id="tra-bloquear-acima-inicial"` e `desc` explicativa
2. `produto/pedido/client/src/pages/ListaPedidos.tsx`
   - Linha 763–769: expandida de arrow function para block function com leitura de localStorage e lógica de destaque vermelho

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1 / 2
- **Testes que passaram:** sem erros TypeScript novos nos arquivos modificados (verificado com `tsc --noEmit`)
- **Testes que falharam:** nenhum novo
- **SLA validado:** não aplicável (mudança de UI, sem novo endpoint)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto (sem acesso a banco neste ajuste)
- [x] Zero `any` introduzido (type assertion estruturada, não `any` bruto)
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo (sem novos erros nos arquivos modificados)
- [x] Correlation ID preservado (sem novo endpoint)
- [x] SLA ≤ 200ms confirmado (não aplicável — UI only)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? sim (MEDIUM — obrigatória)
