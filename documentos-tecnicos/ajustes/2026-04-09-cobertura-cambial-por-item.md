# Relatório de Impacto — COBERTURA CAMBIAL: migrar do Pedido para o PedidoItem

**Data:** 2026-04-09
**Produto:** Pedido
**Classificação:** MEDIUM
**Decisão:** AJUSTE

---

## Requisito

Mover `cobertura_cambial` de campo do `Pedido` para campo do `PedidoItem`. Cada item deve ter seu próprio valor independente. Na linha PAI: se todos os itens têm o mesmo valor → exibir esse valor; se divergem → exibir indicador de alerta ▲. NÃO tocar: NCM, VALOR TOTAL DO PEDIDO, QTD. INICIAL, QTD. PRONTA, SALDO, QTD. TRANSFERIDA, QTD. CANCELADA, PESO LÍQ. TOTAL, PESO BRUTO TOTAL, CUBAGEM TOTAL.

---

## Causa Raiz / Motivação

O campo `cobertura_cambial_pedido` existe atualmente apenas no model `Pedido`. O novo requisito de negócio é que cada item de um pedido possa ter sua própria cobertura cambial (ex: parte do pedido pode ser antecipado, outra parte à vista). Isso exige migrar o campo para `PedidoItem`.

---

## Análise de Impacto Completa

### Arquivos AFETADOS (com linhas)

| Arquivo | Linhas Relevantes | Alteração |
|---------|------------------|-----------|
| `produto/pedido/server/prisma/schema.prisma` | L29, L68-103 | Remover `cobertura_cambial_pedido` do Pedido; adicionar `cobertura_cambial String @default("com_cobertura")` ao PedidoItem |
| `produto/pedido/server/prisma/seed.ts` | L49, L147, L225, L323, L399, L478 | Remover `cobertura_cambial_pedido` dos objetos pedido; adicionar `cobertura_cambial` em cada objeto item |
| `produto/pedido/server/prisma/seed-bulk.ts` | L96 | Remover `cobertura_cambial_pedido` do pedidoData; adicionar `cobertura_cambial` no itemData |
| `servicos-global/tenant/processos-core/src/routes/pedidos.ts` | L66, L618, L75-88 | Remover `cobertura_cambial_pedido` do criarPedidoSchema e CAMPOS_EDITAVEIS; adicionar `cobertura_cambial` ao atualizarItemSchema |
| `servicos-global/tenant/processos-core/prisma/fragment.prisma` | L40, L87-143 | Remover `cobertura_cambial_pedido` do Pedido; adicionar `cobertura_cambial String @default("com_cobertura")` ao PedidoItem |
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | L811-818, L1783, L3207, L3225, L3352-3356, L4482-4523, L4508, L4553, L4605, L4646, L4792, L4909 | Remover de CAMPOS_PAI_TEXTO; nova lógica PAI (consensus/alerta); lógica FILHO lê direto do item |
| `produto/pedido/client/src/shared/types.ts` | L321 | Mover `cobertura_cambial_pedido: string` do Pedido para `cobertura_cambial?: string` no PedidoItem |
| `produto/pedido/client/src/shared/api.ts` | L371, L936 | Atualizar referências na consolidação preview e mock |
| `produto/pedido/client/src/shared/mockData.ts` | L31, L126, L200, L275, L349 | Remover `cobertura_cambial_pedido` dos pedidos mock; adicionar `cobertura_cambial` nos itens mock |
| `produto/pedido/server/src/services/smartImportService.ts` | L616 | Remover `cobertura_cambial_pedido` do payload do pedido |
| `produto/pedido/server/src/routes/consolidar.ts` | L63, L253 | `CAMPOS_COMPARAR` e `camposBase` — remover cobertura_cambial_pedido do pedido consolidado |
| `produto/pedido/server/src/services/transferirService.ts` | L389 | Remover `cobertura_cambial_pedido` do pedido novo criado na transferência |
| `produto/pedido/server/src/services/transferirService.test.ts` | L68 | Atualizar mock do pedido |
| `produto/pedido/server/src/services/edicaoEmMassaService.integration.test.ts` | L40 | Atualizar mock do pedido |

### Arquivos a MANTER INTACTOS

| Arquivo | Motivo |
|---------|--------|
| `produto/pedido/client/src/components/ModalNovoPedido.tsx` | Campo no formulário de criação de PEDIDO — deve ser removido (pedido não terá mais o campo) ou mantido como default para todos os itens. Decisão: remover do form de pedido (será por item). |
| `produto/pedido/client/src/components/DrawerPedido.tsx` | Campo no drawer de edição do PEDIDO — deve ser removido ou convertido para form de item. Decisão: remover do drawer de pedido. |
| `produto/pedido/client/src/components/ModalEdicaoEmMassa.tsx` | Campo de edição em massa nível pedido (`nivel: 'pedido'`) — deve ser mantido como edição em massa de ITEM, não de pedido. Decisão: alterar `nivel: 'pedido'` para `nivel: 'item'`. |
| `produto/pedido/client/src/pages/KanbanPedidos.tsx` | Usa `p.cobertura_cambial_pedido` — lógica de KPI/filtro no Kanban precisa de adaptação para consenso dos itens. |
| `produto/pedido/client/src/shared/cardRegistry.tsx` | Mapeia `cobertura_cambial_pedido` para tab do drawer — adaptar. |
| `produto/pedido/client/src/pages/NovoPedido.tsx` | Campo no form de novo pedido full-page — remover do form de pedido. |

---

## Plano de Execução (Ordem Obrigatória)

### Passo 1 — Schema Prisma (local do produto)
**Arquivo:** `produto/pedido/server/prisma/schema.prisma`
- Remover linha `cobertura_cambial_pedido String @default("com_cobertura") @map("cobertura_cambial")` do model `Pedido`  
  _(campo não usava @map — remover linha L29 diretamente)_
- Adicionar `cobertura_cambial String @default("com_cobertura")` ao model `PedidoItem` após `casas_decimais_valor_item`

### Passo 2 — Fragment Prisma (fonte autoritativa)
**Arquivo:** `servicos-global/tenant/processos-core/prisma/fragment.prisma`
- Remover `cobertura_cambial_pedido  String  @default("com_cobertura")` do model `Pedido` (L40)
- Adicionar `cobertura_cambial String @default("com_cobertura") // com_cobertura | sem_cobertura` ao model `PedidoItem` após `casas_decimais_valor_item`

### Passo 3 — Backend: Zod schema + CAMPOS_EDITAVEIS
**Arquivo:** `servicos-global/tenant/processos-core/src/routes/pedidos.ts`
- Remover `cobertura_cambial_pedido: z.string().default('com_cobertura')` do `criarPedidoSchema` (L66)
- Remover `'cobertura_cambial_pedido'` do `CAMPOS_EDITAVEIS` (L618)
- Adicionar `cobertura_cambial: z.string().optional()` ao `atualizarItemSchema` (após L88)

### Passo 4 — Backend: duplicar pedido na transferência
**Arquivo:** `produto/pedido/server/src/services/transferirService.ts`
- Remover `cobertura_cambial_pedido: base.cobertura_cambial_pedido ?? 'com_cobertura'` (L389)
  _(campo não existe mais no Pedido — o item já carregará o valor próprio)_

### Passo 5 — Backend: SmartImport
**Arquivo:** `produto/pedido/server/src/services/smartImportService.ts`
- Remover `cobertura_cambial_pedido: 'com_cobertura'` do payload do pedido (L616)

### Passo 6 — Backend: Consolidar
**Arquivo:** `produto/pedido/server/src/routes/consolidar.ts`
- Remover `{ campo: 'cobertura_cambial_pedido', rotulo: 'Cobertura Cambial' }` de CAMPOS_COMPARAR (L63)
  _(campo agora é por item — a comparação de divergência não se aplica mais no nível do pedido)_
- Remover `cobertura_cambial_pedido: primeiro.cobertura_cambial_pedido` de camposBase (L253)
  _(o pedido consolidado não precisa mais do campo; itens herdam seus próprios valores)_

### Passo 7 — Seeds
**Arquivo:** `produto/pedido/server/prisma/seed.ts`
- Em cada bloco de pedido: remover `cobertura_cambial_pedido: '...'`
- Em cada objeto de item: adicionar `cobertura_cambial: 'com_cobertura'`

**Arquivo:** `produto/pedido/server/prisma/seed-bulk.ts`
- Remover `cobertura_cambial_pedido: i % 3 === 0 ? 'sem_cobertura' : 'com_cobertura'` do `pedidoData`
- Adicionar `cobertura_cambial: i % 3 === 0 ? 'sem_cobertura' : 'com_cobertura'` no `itemData`

### Passo 8 — Frontend: types.ts
**Arquivo:** `produto/pedido/client/src/shared/types.ts`
- Remover `cobertura_cambial_pedido: string` do type `Pedido` (L321)
- Adicionar `cobertura_cambial?: string` ao type `PedidoItem`

### Passo 9 — Frontend: ListaPedidos.tsx (parte 1 — estrutural)
**Arquivo:** `produto/pedido/client/src/pages/ListaPedidos.tsx`
- Remover `'cobertura_cambial_pedido'` de `CAMPOS_PAI_TEXTO` (L3207)
- Remover `cobertura_cambial_pedido: string | null` de `PedidoItemEnriquecido._p` (L3225)
- Remover todas as referências a `_p.cobertura_cambial_pedido` nas construções de `_p` (L4508, L4553, L4605, L4646)

### Passo 10 — Frontend: ListaPedidos.tsx (parte 2 — coluna PAI)
**Arquivo:** `produto/pedido/client/src/pages/ListaPedidos.tsx`
- Coluna PAI `cobertura_cambial_pedido` (L811-818): nova lógica de consenso — se todos os itens têm o mesmo valor → exibir esse valor; se divergem → exibir ▲ com tooltip
- `key` da coluna PAI muda de `cobertura_cambial_pedido` para `cobertura_cambial` para refletir o campo do item

### Passo 11 — Frontend: ListaPedidos.tsx (parte 3 — MAPA_COLUNAS_FILHO + handleEditarFilho)
**Arquivo:** `produto/pedido/client/src/pages/ListaPedidos.tsx`
- `MAPA_COLUNAS_FILHO.cobertura_cambial_pedido` (L3352-3356): renomear para `cobertura_cambial`, tornar editável diretamente no item (sem `_p`), lê `row.cobertura_cambial`
- `handleEditarFilho`: remover `cobertura_cambial_pedido` do bloco CAMPOS_PAI_TEXTO — será tratado como campo normal do item

### Passo 12 — Frontend: ListaPedidos.tsx (parte 4 — filtros/tooltip/misc)
- L4792: filtro `p.cobertura_cambial_pedido === 'sem_cobertura'` → adaptar para checar se algum item tem `sem_cobertura`
- L4909: tooltip KPI similar — adaptar para consenso de itens
- L1783: `COLUNAS_PAI_CHAVES` — substituir `'cobertura_cambial_pedido'` por `'cobertura_cambial'`
- L3207: `COLUNAS_FILHO_HERDADAS_PAI` — remover (não é mais herdada do pai)
- L3540: definição de coluna de exportação — atualizar key

### Passo 13 — Frontend: api.ts
- L371: `verificarCampo('cobertura_cambial_pedido', ...)` na função de consolidação preview → remover ou adaptar
- L936: mock de pedido com `cobertura_cambial_pedido` → remover do pedido (campo não existe mais no Pedido)

### Passo 14 — Frontend: mockData.ts
- Remover `cobertura_cambial_pedido` dos objetos pedido; adicionar `cobertura_cambial` nos itens de cada pedido

### Passo 15 — Testes
- `transferirService.test.ts` L68: remover `cobertura_cambial_pedido` do mock de pedido
- `edicaoEmMassaService.integration.test.ts` L40: remover `cobertura_cambial_pedido` do mock de pedido

### Passo 16 — Prisma Generate
- Executar `npx prisma generate` em `produto/pedido/server/`
- **Migração de banco:** O campo `cobertura_cambial_pedido` DEVE PERMANECER na tabela `pedidos_comerciais` (soft-remove: campo pode ser mantido com `@map` mas não usado, ou deve ser feita migration removendo-o). O campo `cobertura_cambial` DEVE SER ADICIONADO na tabela `pedido_itens`. Isso requer uma migration SQL: `ALTER TABLE pedido_itens ADD COLUMN cobertura_cambial VARCHAR DEFAULT 'com_cobertura'`.

---

## Considerações Especiais

### Campos NÃO tocados (conforme requisito)
- NCM, VALOR TOTAL DO PEDIDO, QTD. INICIAL, QTD. PRONTA, SALDO, QTD. TRANSFERIDA, QTD. CANCELADA, PESO LÍQ. TOTAL, PESO BRUTO TOTAL, CUBAGEM TOTAL — todos preservados

### Consolidação de Pedidos
A lógica de consolidação (`consolidar.ts`) usava `cobertura_cambial_pedido` para detectar divergências entre pedidos a serem consolidados. Com a mudança, a cobertura cambial é por item — cada item do pedido consolidado herda o valor do item de origem. A verificação de divergência no nível do pedido é removida.

### Transferência de Pedidos
O `transferirService.ts` criava um novo pedido com `cobertura_cambial_pedido` herdado do pedido base. Com a mudança, o pedido novo não terá mais o campo — os itens transferidos herdarão seus próprios valores.

### KanbanPedidos e CardRegistry
Usam `p.cobertura_cambial_pedido` para KPI de "pedidos sem cobertura". Com a mudança, essa lógica deve checar consenso dos itens (se algum item tem `sem_cobertura`). **Escopo:** Incluído neste ajuste apenas as alterações de tipos e remoção de referências diretas ao campo do pedido. A lógica de KPI do Kanban é adaptada para verificar itens.

### ModalNovoPedido, DrawerPedido, NovoPedido
O campo `cobertura_cambial` passa a existir por item. O formulário de criação de pedido não precisa mais coletar esse campo no nível do pedido — será gerenciado inline por item. **Escopo:** Remover o campo dos formulários de pedido.

### ModalEdicaoEmMassa
Atualmente `nivel: 'pedido'`. Com a mudança, deve ser `nivel: 'item'` para edição em massa de itens.

---

## Riscos e Mitigações

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Migração de banco incompleta — campo não existe em `pedido_itens` | ALTO | Criar migration SQL explícita antes de `prisma generate` |
| Dados existentes no `pedidos_comerciais.cobertura_cambial_pedido` perdidos | MÉDIO | O campo deve ser mantido na tabela via migration (não DROP — apenas não usado pelo Prisma) |
| KanbanPedidos e CardRegistry quebram com campo inexistente | MÉDIO | Atualizar type PedidoItem e adaptar lógica de itens |
| ModalEdicaoEmMassa envia para rota errada (pedido vs item) | ALTO | Alterar `nivel: 'pedido'` para `nivel: 'item'` |
| Consolidação falha ao tentar copiar campo do pedido | MÉDIO | Remover do camposBase e CAMPOS_COMPARAR |

---

## Nível de Risco: MEDIUM

Mudança estrutural no schema afetando múltiplos arquivos, mas bem contida. Nenhuma lógica de negócio crítica (transferência de quantidades, cálculo de saldo) é afetada. Os testes existentes cobrem os serviços impactados.
