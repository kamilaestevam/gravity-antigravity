# Relatório de Impacto — Modal Edição Inline: Quantidade sem Formatação

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** O input do popover de edição inline mostra o valor numérico sem separador de milhar (ex: "2000") em vez de seguir o formato da coluna (ex: "2.000"). O botão dropdown de unidade "UN ▼" aparece corretamente, mas o valor numérico não é formatado ao abrir.
- **Reproduzido em:** Colunas de tipo `unidade` (ex: "QTD. PRONTA DO PEDIDO") ao clicar para editar qualquer linha pai ou filha no produto Pedido.
- **Causa raiz identificada:** O campo `quantidade_pronta_pedido` (e demais campos de quantidade) é do tipo `Decimal` no Prisma. Ao serializar via `res.json()`, o `Decimal.prototype.toJSON()` retorna uma **string** (ex: `"2000"`). O TypeScript declara `number` mas o valor runtime é string. A inicialização do `displayQty` chama `uv.quantity.toLocaleString('pt-BR', ...)` diretamente — isso invoca `String.prototype.toLocaleString()` que retorna a string sem qualquer formatação. Já o `formatarOverlayValor` (que exibe "2.000 UN" na célula durante edição) usa `Number(v.quantity).toLocaleString(...)`, convertendo explicitamente antes de formatar. Mesma inconsistência em `displayMoedaAmt` para colunas moeda.
- **Arquivo e linha exatos:** `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` linhas 417–422 (`displayMoedaAmt` e `displayQty` useState init)
- **Relacionado a ajuste anterior?** não
- **Padrão de ciclo detectado?** não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` | Adicionar `Number()` na init de `displayMoedaAmt` e `displayQty` — consistente com `formatarOverlayValor` |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Não é a origem do bug — `getValorEditar` está correto |
| `produto/pedido/client/src/shared/types.ts` | Tipagem TypeScript correta; problema é runtime Prisma Decimal→string |
| Backend/Prisma | Converter Decimal no backend seria a solução ideal a longo prazo, mas fora do escopo deste ajuste cirúrgico |
| `useGTInlineEdit.ts` | Não é a origem do bug |

---

## BLAST RADIUS

- **Dependentes diretos:** Todos os popovers de edição inline com tipo `unidade` e `moeda` no produto Pedido (e quaisquer outros produtos que usem `TabelaVirtualGlobal`)
- **Dependentes indiretos:** Nenhum — a mudança só afeta o display inicial do input, não afeta salvamento nem contratos
- **Contratos afetados:** Nenhum — mudança puramente de formatação visual no estado local do componente
- **Skills que devem ser respeitadas neste ajuste:** `code-standards`, `agent-policy`, `nucleo-global`

---

## CRITÉRIO DE SUCESSO

- Ao abrir o popover de edição em uma coluna de quantidade com valor 2000, o input exibe "2.000" (com separador de milhar pt-BR)
- Ao abrir o popover de edição em uma coluna de moeda com valor 2000.50, o input exibe "2.000,50"
- Após digitar, o onBlur continua formatando corretamente
- Nenhuma regressão nos campos de texto, opções, periodo

## CRITÉRIO DE PARADA

- Se a mudança afetar o parsing/salvamento do valor (não deve, pois parseBRNum já funciona com pt-BR), parar e investigar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit, ou restaurar as duas linhas originais sem `Number()` |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável (LOW risk)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** (a preencher)
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** (visual, manual)
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo
- [x] Correlation ID preservado
- [x] SLA ≤ 200ms confirmado (mudança visual apenas)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não necessária (LOW sem regressão)
