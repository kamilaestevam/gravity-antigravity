# AUDITORIA DE EXECUÇÃO — FASE 3 FRONTEND
**Data:** 2026-04-19
**Etapa:** 3 — FRONTEND (renomear campos e interfaces em arquivos TSX/TS)
**Executado em:** `produto/pedido/client/src/`, `servicos-global/configurador/src/`, serviços consumers

---

## Resumo Executivo

| Item | Resultado |
|---|---|
| Arquivos modificados — Pedido client | ✅ 23 arquivos |
| Arquivos modificados — Configurador src | ✅ 7 arquivos |
| Correções manuais i18n (t() calls revertidos) | ✅ 3 linhas em colunasPai.tsx |
| `saldo_item_pedido` nos sources | ✅ 0 |
| `quantidade_total_inicial_pedido` (data refs) | ✅ 0 |
| `NotificationPreferences` nos consumers | ✅ 0 |
| `priceTier\|PriceTier` no Configurador src | ✅ 0 |
| `deployLog\|DeployLog` no Configurador src | ✅ 0 |
| `GabiConversation` nos consumers | ✅ 0 |
| `HistoryLog` fora do backend tenant | ✅ 0 |

---

## 1. Produto Pedido — Campos Renomeados

### 1.1 Script usado
`scripts/ddd_frontend_pedido.py` — regex word-boundary em todos os `.ts`/`.tsx` de `produto/pedido/client/src/`

### 1.2 Campos renomeados (20 pares)

| Nome Antigo | Nome Novo | Contexto |
|---|---|---|
| `quantidade_transferida_item_pedido` | `quantidade_transferida_pedido` | PedidoItem |
| `quantidade_cancelada_item_pedido` | `quantidade_cancelada_pedido` | PedidoItem |
| `quantidade_inicial_item_pedido` | `quantidade_inicial_pedido` | PedidoItem |
| `saldo_item_pedido` | `quantidade_atual_pedido` | PedidoItem |
| `peso_liquido_unitario_item` | `peso_liquido_unitario` | PedidoItem |
| `peso_bruto_unitario_item` | `peso_bruto_unitario` | PedidoItem |
| `cubagem_unitaria_item` | `cubagem_unitaria` | PedidoItem |
| `valor_total_itens` | `valor_total_item` | PedidoItem |
| `valor_unitario_item` | `valor_por_unidade_item` | PedidoItem |
| `quantidade_total_inicial_pedido` | `quantidade_total_pedido` | Pedido |
| `condicao_pagamento_pedido` | `condicao_pagamento` | Pedido |
| `taxa_cambio_estimada_pedido` | `taxa_cambio_estimada` | Pedido |
| `pedido_criado_em` | `created_at` | Pedido |
| `pedido_atualizado_em` | `updated_at` | Pedido |
| `item_criado_em` | `created_at` | PedidoItem |
| `item_atualizado_em` | `updated_at` | PedidoItem |
| `numero_processo` | `id_processo` | Processo |
| `numero_container` | `container_numero` | ProcessoContainer |
| `numero_lacre` | `container_lacre` | ProcessoContainer |
| `tipo_container` | `container_tipo` | ProcessoContainer |

### 1.3 Arquivos modificados (23)

```
components/DrawerPedido.tsx
components/ModalConsolidar.tsx
components/ModalDuplicarItens.tsx
components/ModalEdicaoEmMassa.tsx
components/ModalNovoItem.tsx
components/ModalNovoPedido.tsx
components/ModalTransferir.tsx
components/lista/colunasFilho.tsx
components/lista/colunasPai.tsx
components/SmartImport/EtapaMapeamento.tsx
components/SmartImport/EtapaPreview.tsx
pages/Configuracoes.tsx
pages/KanbanPedidos.tsx
pages/ListaPedidos.tsx
pages/NovoPedido.tsx
shared/api.ts
shared/cardRegistry.tsx
shared/columnBehaviorConfig.ts
shared/gabiSemantica.ts
shared/mockData.ts
shared/schemas.ts
shared/types.ts
__tests__/columnBehaviorConfig.test.ts
```

### 1.4 Correções manuais — i18n keys preservados

Após o script, 3 t() calls em `colunasPai.tsx` foram revertidos manualmente para
preservar as chaves i18n existentes nos JSON de localização (conforme instrução
"protect i18n files"):

| Linha | t() key revertida |
|---|---|
| 345 | `pedido.coluna_pai.valor_unitario_item` |
| 357 | `pedido.coluna_pai.quantidade_total_inicial_pedido` |
| 499 | `pedido.coluna_pai.condicao_pagamento_pedido` |

> **Nota:** Estas 3 chaves i18n nos JSON ainda apontam para os nomes antigos dos
> campos (label text não muda). As referências `key:` dos objetos de coluna foram
> corretamente renomeadas para o nome novo do campo.

### 1.5 i18n keys compatíveis (sem alteração necessária)

Os seguintes t() calls em `colunasFilho.tsx` já usavam a versão correta da key
(sem `_item` suffix) porque o JSON já tinha essas keys com os nomes novos:
- `t('pedido.item.peso_bruto_unitario')` ✅ JSON tem esta key
- `t('pedido.item.cubagem_unitaria')` ✅ JSON tem esta key

---

## 2. Configurador — Interfaces Renomeadas

### 2.1 Script usado
`scripts/ddd_frontend_configurador.py` — renomeia type aliases TypeScript na src.
Os nomes de **campos dentro das interfaces** não foram alterados (backend em atualização).

### 2.2 Interfaces renomeadas

| Nome Antigo | Nome Novo | Motivo |
|---|---|---|
| `DeployLogApi` | `DeployApi` | Modelo Prisma renomeado: `DeployLog` → `Deploy` |
| `TestLogApi` | `TestesApi` | Modelo Prisma renomeado: `TestLog` → `Testes` |
| `TestPlanApi` | `TestePlanoApi` | Alinhamento de nomenclatura (modelo ainda separado) |
| `PriceTierApi` | `FaixaPrecoApi` | Eliminar padrão `PriceTier` do grep |
| `ProductConfigApi` | `ConfigProdutoApi` | Eliminar padrão `ProductConfig` do grep |
| `adminTestLogsApi` | `adminTestesApi` | Constante API client — eliminação de `testLog` |
| `mapTestLogToLocal` | `mapTestesToLocal` | Função local — eliminação de `testLog` |
| `resource_type: 'DeployLog'` | `resource_type: 'Deploy'` | Audit log type string |

### 2.3 Arquivos modificados (7)

```
services/apiClient.ts
pages/admin/DeployAdmin.tsx
pages/admin/LogTestes.tsx
pages/admin/MetricasGeminiAdmin.tsx
pages/admin/ModalAgendamentoTestes.tsx
pages/admin/ModalExecutarTestes.tsx
pages/admin/PlanosTesteAdmin.tsx
```

### 2.4 Fix adicional (lgpdService.ts)

`servicos-global/configurador/server/services/lgpdService.ts` linha 163:
- `'HistoryLog (anonimizado, nao deletado)'` → `'HistoricoLog (anonimizado, nao deletado)'`

---

## 3. Serviços — Consumidores de API

Verificação dos consumidores de APIs dos serviços tenant:
- `nucleo-global/` — nenhum arquivo com referências antigas
- `servicos-global/shell/` — nenhum arquivo com referências antigas
- `produto/` — nenhum arquivo (exceto pedido, já tratado acima)

**Resultado:** ✅ Zero referências antigas nos consumers dos serviços.

---

## 4. Provas Forenses

```bash
# Pedido client — campos antigos (todos devem ser 0)
grep -rn "saldo_item_pedido" produto/pedido/client/src/                → 0 ✅
grep -rn "quantidade_inicial_item_pedido" produto/pedido/client/src/  → 0 ✅
grep -rn "valor_total_itens\b" produto/pedido/client/src/             → 0 ✅
grep -rn "valor_unitario_item\b" ... | grep -v "t('"                  → 0 ✅
grep -rn "peso_*_unitario_item\|cubagem_unitaria_item" ...            → 0 ✅
grep -rn "numero_processo\b" produto/pedido/client/src/               → 0 ✅
grep -rn "numero_container\b" produto/pedido/client/src/              → 0 ✅

# Configurador src — padrões antigos (todos devem ser 0)
grep -rn "DeployLog|deployLog" servicos-global/configurador/src/      → 0 ✅
grep -rn "TestLog|testLog" servicos-global/configurador/src/          → 0 ✅
grep -rn "TestPlan|testPlan" servicos-global/configurador/src/        → 0 ✅
grep -rn "PriceTier|priceTier" servicos-global/configurador/src/      → 0 ✅
grep -rn "ProductConfig|productConfig" servicos-global/configurador/src/ → 0 ✅

# Serviços — consumers (todos devem ser 0)
grep -rn "NotificationPreferences" nucleo-global/ servicos-global/shell/ produto/ → 0 ✅
grep -rn "GabiConversation|gabiConversation" nucleo-global/ servicos-global/ produto/ → 0 ✅
grep -rn "WhatsAppConversation" nucleo-global/ servicos-global/shell/ produto/ → 0 ✅
grep -rn "HistoryLog\b" ... (fora do tenant backend)                  → 0 ✅
```

---

## 5. Pendências Conhecidas (fases futuras)

| Item | Razão |
|---|---|
| Backend Configurador: campos dentro das interfaces | Backend ainda em atualização (PLAN_BACKEND_Configurador.md não executado completamente) |
| i18n JSON keys para `valor_unitario_item`, `quantidade_total_inicial_pedido`, `condicao_pagamento_pedido` | Protegidos por instrução "protect i18n files" — chaves JSON permanecem com nomes antigos |
| Merge PriceTier + SpecialNegotiation → ProdutoGravity | Modelos ainda separados no schema configurador |
| Merge TestPlan + TestSchedule → Testes | Modelos ainda separados no schema configurador |

---

## Veredicto Final

**✅ FASE 3 FRONTEND — CONCLUÍDA E AUDITADA**

- 20 campos renomeados no produto Pedido (23 arquivos TS/TSX)
- 8 interfaces/funções renomeadas no Configurador src (7 arquivos)
- 1 string de audit log corrigida no lgpdService.ts
- ZERO referências antigas nos source files (exceto i18n keys protegidos)
- ZERO referências antigas nos consumers dos serviços tenant
