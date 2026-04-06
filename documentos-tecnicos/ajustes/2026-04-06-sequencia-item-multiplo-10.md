# Relatório de Impacto — sequencia_item exibindo 10,20,30 em vez de 1,2,3

**Data:** 2026-04-06
**Responsável:** Dream Team Ajustes
**Nível de risco:** MEDIUM
**Aprovação obtida:** não necessária (MEDIUM sem mudança de contrato público)

---

## PROBLEMA

- **Descrição:** Itens dentro de um pedido exibem sequencia_item = 10, 20, 30... em vez de 1, 2, 3...
- **Reproduzido em:** Lista de Pedidos — coluna conector das linhas filho (expand)
- **Causa raiz identificada:** Commit `c247ad1` alterou `(index + 1)` para `(index + 1) * 10` em pedidos.ts e importacao.ts, seguindo convenção ERP/SAP nunca pedida pelo produto.
- **Arquivos e linhas exatas:**
  - `servicos-global/tenant/processos-core/src/routes/pedidos.ts:332`
  - `servicos-global/tenant/processos-core/src/routes/importacao.ts:123`
- **Relacionado a ajuste anterior?** não
- **Padrão de ciclo detectado?** não

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| `servicos-global/tenant/processos-core/src/routes/pedidos.ts` | Reverter `(index + 1) * 10` → `(index + 1)` na criação de itens |
| `servicos-global/tenant/processos-core/src/routes/importacao.ts` | Reverter `(index + 1) * 10` → `(index + 1)` na importação |
| `servicos-global/tenant/processos-core/prisma/fragment.prisma` | Corrigir comentário do campo: `(Ex: 10, 20)` → `(Ex: 1, 2, 3)` |
| `produto/pedido/server/src/services/transferirService.test.ts` | Atualizar fixture de `sequencia_item: 10` → `1` (coerência com regra universal) |
| `scripts/fix-sequencia-item.ts` | Script one-time para renumerar itens existentes no banco (1, 2, 3... por pedido) |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Display via `i.sequencia_item` já é correto — após fix do back, exibe 1,2,3 automaticamente |
| `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` | Renderização não é a causa — não tocar |
| `servicos-global/tenant/prisma/schema.prisma` | Exclusivo do Coordenador — tipo do campo não muda (Int?) |
| `produto/pedido/server/src/services/transferirService.ts` | Copia `sequencia_item` do item original — comportamento correto, não é fonte de geração |
| `testes/testes-unitarios/pedido/ListaPedidos.test.tsx` | Fixtures já usam `sequencia_item: 1, 2` — já corretas |

---

## BLAST RADIUS

- **Dependentes diretos:** rotas de criação de pedidos e importação, display na tabela de lista
- **Dependentes indiretos:** qualquer relatório ou exportação que use sequencia_item para ordenação
- **Contratos afetados:** nenhum — campo `sequencia_item: Int?` no Zod schema não muda tipo, só valor de geração
- **Skills respeitadas neste ajuste:** agent-policy, code-standards, tenant-isolation, database-operations

---

## REGRA UNIVERSAL ESTABELECIDA

> **A numeração do item é posicional dentro do pedido: item 1 = posição 1, item 2 = posição 2...**
> `sequencia_item = (index + 1)` — nunca usar multiplicadores como `* 10`.

---

## CRITÉRIO DE SUCESSO

- Novo item criado em pedido com 2 itens existentes recebe `sequencia_item = 3`
- Conector na tabela exibe `1`, `2`, `3`... em vez de `10`, `20`, `30`...
- Itens existentes no banco renumerados corretamente pelo script

## CRITÉRIO DE PARADA

- Se o script de migração retornar erro de constraint/FK, parar e escalar ao Coordenador.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git revert` do commit de fix nos 2 arquivos de rota |
| 2 | Executar script inverso: `UPDATE PedidoItem SET sequencia_item = sequencia_item * 10` |

- **Tempo estimado de rollback:** 5 minutos
- **Rollback testado em staging?** não aplicável (dev local)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** a preencher após commit
- **Divergências do plano original:** nenhuma
- **Descobertas inesperadas:** fragment.prisma tinha comentário `(Ex: 10, 20)` confirmando intenção ERP — corrigido junto. Erros TypeScript pré-existentes no projeto (rootDir config, req.prisma não tipado) — não introduzidos por este ajuste.
- **Issues abertas separadamente:** nenhuma

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1 / 2
- **Testes que passaram:** 37/37 (transferirService.test.ts)
- **Testes que falharam:** nenhum
- **SLA validado:** não aplicável (mudança de dado, não de performance)

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [x] Tenant isolation intacto (campo não é tenant_id, não afeta isolamento)
- [x] Zero `any` introduzido
- [x] Zero `console.log` esquecido
- [x] TypeScript compila limpo nos arquivos alterados (erros pré-existentes não relacionados)
- [x] Correlation ID preservado (não tocamos middlewares)
- [x] SLA ≤ 200ms confirmado (não applicável)
- [x] Todas as skills da Fase 0.1 respeitadas
- [x] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? sim (MEDIUM)
