# Relatório de Impacto — Header Sorted Color Fora do Padrão

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** LOW
**Aprovação obtida:** não necessária

---

## PROBLEMA

- **Descrição:** Coluna "DATA P.O" exibe texto do header em azul/roxo (`var(--gtv-accent)` = #6366f1) quando está ativa de ordenação, divergindo do padrão dos outros headers (branco/cinza `--text-primary`).
- **Reproduzido em:** Lista de Pedidos — qualquer coluna sortável que estiver ativa de ordenação
- **Causa raiz identificada:** `.gtv-th--sorted { color: var(--gtv-accent) }` em `tabela-virtual.css:679` aplica a cor de acento no **texto inteiro** do header. O ícone de seta (`.gtv-sort-icon`) já tem `color: var(--gtv-accent)` separadamente — a cor no texto é redundante e viola o design system (headers devem ser `--text-primary`).
- **Arquivo e linha exatos:** `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css:679-681`
- **Relacionado a ajuste anterior?** não
  - Padrão de ciclo detectado? Não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css` | Remover `color: var(--gtv-accent)` de `.gtv-th--sorted` |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `TabelaVirtualGlobal.tsx` | Lógica de aplicação da classe `gtv-th--sorted` está correta |
| `ListaPedidos.tsx` | Definição de colunas não tem relação com a cor do header |
| `.gtv-sort-icon` CSS | Já tem `color: var(--gtv-accent)` — esse é o indicador visual correto |

---

## BLAST RADIUS

- **Dependentes diretos:** todos os produtos que usam TabelaVirtualGlobal (Pedido, LPCO, NF Importação, etc.)
- **Dependentes indiretos:** nenhum — mudança é só visual
- **Contratos afetados:** nenhum
- **Skills verificadas:** design-system (cores de texto devem ser `--text-primary`/`--text-secondary`)

---

## CRITÉRIO DE SUCESSO

- Header da coluna sorted mantém cor branca/cinza padrão; apenas o ícone de seta continua azul

## CRITÉRIO DE PARADA

- Se remover a regra quebrar outros estados visuais esperados, parar e revisar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit de fix |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável (LOW)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** a preencher
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** nenhuma
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1
- **Testes que passaram:** visual — header sorted sem cor azul no texto
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo (sem alteração TS)
- [x] Correlation ID preservado
- [x] SLA ≤ 200ms confirmado (sem alteração de lógica)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? não (LOW sem regressão)
