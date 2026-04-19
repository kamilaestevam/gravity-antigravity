# PLAN_FRONTEND_Pedido — Plano de Batalha (Frontend)

> **Diretório raiz:** `produto/pedido/client/src/`
> **Fase:** 2 — Plano aprovado. Não executar sem Fase 3 iniciada.

---

## 1. ARQUIVOS MODIFICADOS ATUALMENTE (git status — ponto de partida)

| Arquivo | Relevância para DDD |
|---|---|
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Principal tabela de pedidos — campo names em colunas |
| `produto/pedido/client/src/shared/api.ts` | Tipos de API — campo names da interface |
| `produto/pedido/client/src/shared/columnBehaviorConfig.ts` | Config de colunas por nome de campo |
| `produto/pedido/client/src/shared/state/useLinkContextualSync.ts` | Sync de estado — referências a campos |

---

## 2. CAMPOS A SUBSTITUIR — GREP PATTERNS

Execute em `produto/pedido/client/src/`:

### Campos de `Pedido`
```bash
grep -r "quantidade_total_inicial_pedido" src/    # → quantidade_total_pedido
grep -r "condicao_pagamento_pedido" src/           # → condicao_pagamento
grep -r "taxa_cambio_estimada_pedido" src/         # → taxa_cambio_estimada
grep -r "pedido_criado_em" src/                    # → created_at
grep -r "pedido_atualizado_em" src/                # → updated_at
```

### Campos de `PedidoItem`
```bash
grep -r "quantidade_inicial_item_pedido" src/              # → quantidade_inicial_pedido
grep -r "saldo_item_pedido" src/                           # → quantidade_atual_pedido
grep -r "quantidade_pronta_total_item_pedido" src/         # → quantidade_pronta_pedido
grep -r "quantidade_transferida_item_pedido" src/          # → quantidade_transferida_pedido
grep -r "quantidade_cancelada_item_pedido" src/            # → quantidade_cancelada_pedido
grep -r "valor_total_itens\b" src/                         # → valor_total_item
grep -r "valor_unitario_item\b" src/                       # → valor_por_unidade_item
grep -r "peso_liquido_unitario_item" src/                  # → peso_liquido_unitario
grep -r "peso_bruto_unitario_item" src/                    # → peso_bruto_unitario
grep -r "cubagem_unitaria_item" src/                       # → cubagem_unitaria
grep -r "item_criado_em" src/                              # → created_at
grep -r "item_atualizado_em" src/                          # → updated_at
```

### Campos de `Processo`
```bash
grep -r "numero_processo" src/                             # → id_processo
```

### Campos de `ProcessoContainer`
```bash
grep -r "numero_container" src/                            # → container_numero
grep -r "numero_lacre" src/                                # → container_lacre
grep -r "tipo_container\b" src/                            # → container_tipo
grep -r "\.tara\b" src/                                    # → container_tara
grep -r "peso_bruto\b" src/                                # → container_peso_bruto (filtrar por contexto container)
```

### Tabelas renomeadas (referências no frontend)
```bash
grep -r "pedidos_comerciais" src/                          # → pedido_produto_gravity
grep -r "mapeamento_import\b" src/                         # → aprendizado_importacao_dados
grep -r "transfer_historico" src/                          # → tracking_items_transferidos
grep -r "dashboard_config\b" src/                          # → dashboard_preferencias
```

---

## 3. COMPONENTES ESPECÍFICOS

### `ListaPedidos.tsx`
**Colunas da tabela** que provavelmente referenciam campos antigos:
- Coluna de quantidade: `quantidade_total_inicial_pedido` → `quantidade_total_pedido`
- Coluna de saldo: `saldo_item_pedido` → `quantidade_atual_pedido`
- Coluna de condição de pagamento: `condicao_pagamento_pedido` → `condicao_pagamento`

**Atualizar:** `columnBehaviorConfig.ts` junto (campos são referenciados nos dois)

### `shared/api.ts`
Interface TypeScript dos tipos de resposta da API. Campos a renomear (mesma lista do backend):
- Todos os campos de `Pedido` e `PedidoItem`
- Tipos de `Processo`, `ProcessoContainer`

### `shared/columnBehaviorConfig.ts`
Configuração de comportamento de colunas por `key` de campo. Toda key que usa nome antigo precisa ser atualizada.

---

## 4. LABELS DE TELA — REFERÊNCIA COMPLETA

### Pedido
| Campo banco | Label na tela |
|---|---|
| `quantidade_total_pedido` | (manter label atual) |
| `condicao_pagamento` | (manter label atual) |
| `taxa_cambio_estimada` | (manter label atual) |

### PedidoItem
| Campo banco | Label na tela |
|---|---|
| `quantidade_inicial_pedido` | (manter label atual) |
| `quantidade_atual_pedido` | (manter label — era "Saldo") |
| `quantidade_pronta_pedido` | (manter label atual) |
| `quantidade_transferida_pedido` | (manter label atual) |
| `quantidade_cancelada_pedido` | (manter label atual) |
| `valor_total_item` | (manter label atual) |
| `valor_por_unidade_item` | (manter label atual) |
| `peso_liquido_unitario` | (manter label atual) |
| `peso_bruto_unitario` | (manter label atual) |
| `cubagem_unitaria` | (manter label atual) |

### ProcessoContainer (novos campos)
| Campo banco | Label na tela |
|---|---|
| `container_peso_liquido` | "Peso Líquido do Container" |
| `container_metragem_cubica` | "Metragem Cúbica do Container" |
| `data_devolucao_prevista` | "Data prevista da devolução do container" |
| `data_devolucao_real` | "Data confirmada da devolução do container" |
| `local_devolucao` | "Local de Devolução do Container" |

### Processo
| Campo banco | Label na tela |
|---|---|
| `id_processo` | "Número do Processo Gravity" |

---

## 5. NOVOS COMPONENTES / CAMPOS UI

### Campos novos em `ProcessoContainer`
Adicionar ao formulário/tabela de container:
- `container_peso_liquido` (input numérico, Decimal)
- `container_metragem_cubica` (input numérico, Decimal)

### `aprendizado_importacao_dados` (MapeamentoImport)
Se há UI de importação CSV, o componente de mapeamento de colunas deve mostrar o nome da API atualizado. Funcionalidade em si não muda — só o nome do model/endpoint.

### `dashboard_preferencias` (DashboardConfig pedido)
Se há tela de configuração de dashboard do pedido, atualizar referências ao endpoint.

---

## 6. ESTRATÉGIA PARA `created_at` / `updated_at`

Atenção: `pedido_criado_em` → `created_at` e `item_criado_em` → `created_at` são mudanças que unificam nomes. O frontend pode já estar usando `created_at` em alguns lugares — fazer grep para confirmar qual nome está sendo usado atualmente e atualizar consistentemente.

```bash
grep -r "pedido_criado_em\|item_criado_em\|pedido_atualizado_em\|item_atualizado_em" src/
grep -r "created_at" src/    # verificar quantos já usam o nome correto
```

---

## 7. CHECKLIST FASE 3

```bash
# Todos esses devem retornar zero ao final:
grep -r "saldo_item_pedido" produto/pedido/client/src/            # zero
grep -r "quantidade_total_inicial_pedido" produto/pedido/client/  # zero
grep -r "quantidade_inicial_item_pedido" produto/pedido/client/   # zero
grep -r "valor_total_itens\b" produto/pedido/client/              # zero
grep -r "valor_unitario_item\b" produto/pedido/client/            # zero
grep -r "peso_liquido_unitario_item" produto/pedido/client/       # zero
grep -r "peso_bruto_unitario_item" produto/pedido/client/         # zero
grep -r "cubagem_unitaria_item" produto/pedido/client/            # zero
grep -r "pedido_criado_em\|item_criado_em" produto/pedido/client/ # zero
grep -r "numero_processo" produto/pedido/client/                  # zero
grep -r "numero_container" produto/pedido/client/                 # zero

npx tsc --noEmit                                                   # zero erros TypeScript
```
