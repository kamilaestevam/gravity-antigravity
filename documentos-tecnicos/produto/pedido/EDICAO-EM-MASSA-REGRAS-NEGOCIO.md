# Edição em Massa — Regras de Negócio

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026
> **Status:** Definido — aguardando implementação

---

## O que é "Editar em Massa"

Editar em massa é a operação de **alterar campos de múltiplos pedidos e/ou seus itens simultaneamente**, a partir de uma seleção na lista. Elimina a necessidade de abrir cada pedido individualmente para aplicar a mesma alteração.

---

## Escopo de Campos Editáveis

### Pedido (`Pedido`)

Todos os campos são editáveis em massa, **exceto campos calculados automaticamente**:

| Campo | Editável em massa? | Motivo bloqueio |
|---|---|---|
| `incoterm` | ✅ Sim | — |
| `moeda_pedido` | ✅ Sim | — |
| `data_embarque` | ✅ Sim | — |
| `data_emissao_pedido` | ✅ Sim | — |
| `cobertura_cambial` | ✅ Sim | — |
| `condicao_pagamento` | ✅ Sim | — |
| `exportador_nome` | ✅ Sim | — |
| `porto_origem` | ✅ Sim | — |
| `porto_destino` | ✅ Sim | — |
| Colunas criadas pelo usuário | ✅ Sim (com permissão) | — |
| `numero_pedido` | ✅ Sim (com permissão) | — |
| `valor_total_pedido` | ❌ Não | Campo calculado (soma dos itens) |
| `quantidade_inicial_total` | ❌ Não | Campo calculado (soma dos itens) |
| `quantidade_transferida_total` | ❌ Não | Campo calculado (soma dos itens) |
| `status` | ❌ Não | Gerenciado pelo saldoEngine / fluxo de status |
| `id`, `tenant_id`, `created_at` | ❌ Não | Campos de sistema |

### Item (`PedidoItem`)

Mesma regra — todos editáveis exceto calculados:

| Campo | Editável em massa? | Motivo bloqueio |
|---|---|---|
| `quantidade_inicial` | ✅ Sim | — |
| `quantidade_transferida` | ✅ Sim | — |
| `valor_unitario` | ✅ Sim | — |
| `data_embarque_item` | ✅ Sim | — |
| `part_number` | ✅ Sim (com permissão) | — |
| Colunas criadas pelo usuário | ✅ Sim (com permissão) | — |
| `valor_item` | ❌ Não | Campo calculado (qty × valor_unitario) |
| `quantidade_atual` | ❌ Não | Campo calculado pelo saldoEngine |

---

## Operações por Tipo de Campo

| Tipo | Operações disponíveis | Exemplo |
|---|---|---|
| **Numérico** | Substituir / Somar / Subtrair / Aplicar percentual | 1.000 + 100 = 1.100 · 1.000 × 1,1 = 1.100 |
| **Texto** | Substituir | "FOB" → "CIF" |
| **Data** | Substituir / Avançar N dias / Recuar N dias | 10/04 + 5 dias = 15/04 |
| **Select / Enum** | Substituir | Status "Aberto" → outro valor válido |
| **Coluna do usuário** | Igual ao tipo definido na criação da coluna | — |

---

## Regra de Conflito (Múltiplos Valores)

Quando os pedidos selecionados têm **valores diferentes** no mesmo campo:

- O campo aparece **em branco** com placeholder "Múltiplos valores"
- O usuário só altera o campo se digitar/selecionar algo explicitamente
- Campos **não tocados** mantêm o valor original de cada pedido individualmente
- Não há merge automático — o que não foi editado não muda

---

## Níveis de Edição

| Nível | O que edita | Quando usar |
|---|---|---|
| **Pedido** | Campos do `Pedido` nos pedidos selecionados | Mudar incoterm, data, condições de vários pedidos |
| **Item** | Campos do `PedidoItem` nos itens dos pedidos selecionados | Ajustar quantidades ou valores de itens |
| **Combinado** | Pedido + Item na mesma operação | Alterar campos de ambos os níveis de uma vez |

---

## Permissões

- Permissão separada do Consolidar e Transferir
- Granularidade a ser definida em sprint de permissões
- Default: desabilitado até permissão configurada
- Colunas criadas pelo usuário exigem permissão adicional para edição em massa

---

## Regras Transversais

| Regra | Descrição | Default |
|---|---|---|
| **Auditoria** | Toda edição em massa grava histórico com campos alterados, valores anteriores/novos, usuário e timestamp | Sempre ativo |
| **Campos calculados** | Nunca podem ser editados em massa — são recalculados automaticamente após a edição | Sempre ativo |
| **Preview** | Antes de confirmar, exibe resumo das alterações (quantos pedidos afetados, quais campos, quais valores) | Sempre ativo |
| **Status automático** | Após edição de campos de quantidade, recalcula status dos pedidos afetados via saldoEngine | Sempre ativo |
| **Colunas do usuário** | Edição em massa suporta colunas customizadas criadas pelo usuário, respeitando o tipo definido | Sempre ativo |

---

## UX do Modal de Edição em Massa

```
┌─────────────────────────────────────────────────────────┐
│  Editar em Massa (5 pedidos selecionados)               │
├─────────────────────────────────────────────────────────┤
│  Nível: [● Pedido]  [○ Item]  [○ Combinado]             │
│                                                         │
│  Campos do Pedido                                       │
│  ─────────────────                                      │
│  Incoterm          [Múltiplos valores ▼]                │
│  Data Embarque     [__/__/____] [+ dias] [- dias]       │
│  Cond. Pagamento   [________________________]           │
│  Moeda             [Múltiplos valores ▼]                │
│                                                         │
│  + Adicionar campo                                      │
│                                                         │
│  Preview                                                │
│  ──────────────────                                     │
│  5 pedidos serão afetados                               │
│  2 campos serão alterados                               │
│  ⚠ 3 pedidos têm valores diferentes em "Incoterm"      │
│                                                         │
│        [Cancelar]           [Aplicar em Massa]          │
└─────────────────────────────────────────────────────────┘
```

- Usuário seleciona quais campos quer editar (não precisa preencher todos)
- Campos com múltiplos valores mostram placeholder "Múltiplos valores"
- Preview em tempo real mostra impacto antes de confirmar
- Campos calculados não aparecem na lista de edição
