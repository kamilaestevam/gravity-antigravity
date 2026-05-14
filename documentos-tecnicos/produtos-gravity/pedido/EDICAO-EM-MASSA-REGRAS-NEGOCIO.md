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
| `data_embarque_origem` | ✅ Sim | — |
| `data_emissao_pedido` | ✅ Sim | — |
| `condicao_pagamento_pedido` | ✅ Sim | — |
| `nome_exportador` (JSON `detalhes_operacionais_pedido`) | ✅ Sim | — |
| `porto_origem` | ✅ Sim | — |
| `porto_destino` | ✅ Sim | — |
| Colunas criadas pelo usuário | ✅ Sim (com permissão) | — |
| `numero_pedido` | ✅ Sim (com permissão) | — |
| `valor_total_pedido` | ❌ Não | Campo calculado (soma dos itens) |
| `quantidade_total_pedido` | ❌ Não | Campo calculado (soma dos itens) |
| `peso_liquido_total_pedido` | ❌ Não | Campo calculado (soma dos itens) |
| `peso_bruto_total_pedido` | ❌ Não | Campo calculado (soma dos itens) |
| `cubagem_total_pedido` | ❌ Não | Campo calculado (soma dos itens) |
| `status_pedido` | ❌ Não | Gerenciado pelo fluxo de status |
| `data_consolidacao_pedido` | ❌ Não | Definido pelo fluxo de consolidação |
| `id_pedido`, `id_organizacao`, `id_workspace`, `id_status_pedido`, `data_criacao_pedido`, `data_atualizacao_pedido`, `data_exclusao_pedido` | ❌ Não | Campos de sistema |

### Item (`PedidoItem`)

Mesma regra — todos editáveis exceto calculados:

| Campo | Editável em massa? | Motivo bloqueio |
|---|---|---|
| `quantidade_inicial_item` | ✅ Sim | — |
| `quantidade_pronta_item` | ✅ Sim | — |
| `quantidade_cancelada_item` | ✅ Sim | — |
| `valor_por_unidade_item` | ✅ Sim | — |
| `data_embarque_item` | ✅ Sim | — |
| `part_number_item`, `ncm_item` | ✅ Sim (com permissão) | — |
| Colunas criadas pelo usuário | ✅ Sim (com permissão) | — |
| `valor_total_item` | ❌ Não | Campo calculado (qty × valor_por_unidade) |
| `quantidade_atual_item` | ❌ Não | Campo calculado pelo saldoEngine (inicial − transferida − cancelada) |
| `quantidade_transferida_item` | ❌ Não | Gerenciado pelo fluxo de transferência (saldoEngine) |
| `id_item`, `id_organizacao`, `id_workspace`, `id_pedido`, `data_criacao_item`, `data_atualizacao_item`, `data_exclusao_item` | ❌ Não | Campos de sistema |

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

| Nível | O que edita | Cascade automático? | Quando usar |
|---|---|---|---|
| **Pedido** | Campos do `Pedido` nos pedidos selecionados | ❌ Não | Mudar incoterm/data/condições do pedido sem tocar nos itens |
| **Item** | Campos do `PedidoItem` nos itens dos pedidos selecionados | ❌ Não | Ajustar quantidades ou valores dos itens |
| **Combinado** | Pedido + Item na mesma operação, com cascade automático | ✅ Sim (~61 pares) | Mudar valor "oficial" do pedido propagando para os itens |

---

## Cascade Pedido → Item (aba Combinado)

Na aba **Combinado**, alterações em campos do Pedido cujo conceito tem equivalente em PedidoItem **propagam automaticamente** para todos os itens dos pedidos selecionados.

### Composição SSOT (~61 pares)

**SSOT (57 pares)** em `shared/mapaPropagacaoPedidoItem.ts`: identidade comercial (5), casas decimais (4), câmbio (1), referências (3), datas pronto/inspeção/coleta (9), datas rascunho pedido (7), datas proforma (13), datas invoice (13), outras datas (2).

**Exclusivos edição em massa (+4):** `tipo_operacao_pedido→tipo_operacao_item`, `nome_exportador→nome_exportador_item`, `nome_importador→nome_importador_item`, `nome_fabricante→nome_fabricante_item`.

### Fora do cascade (não propagam)

- `numero_pedido` (identificador único do pedido)
- `porto_origem`, `porto_destino` (atributos do pedido apenas)
- Endereço/país/cidade do exportador/importador/fabricante (JSON pedido sem coluna item equivalente)
- Dados de OPE (JSON pedido sem coluna item equivalente)

### Comportamento detalhado

1. **Aba Pedido:** muda só o pedido. Items mantêm valor anterior (que pode divergir do novo do pedido).
2. **Aba Item:** muda só os itens. Pedido mantém valor anterior.
3. **Aba Combinado:**
   - Campo na whitelist → muda pedido + propaga para todos os itens (sobrescreve overrides individuais).
   - Campo fora da whitelist → muda só o pedido (idêntico ao comportamento da aba Pedido).
   - Se o usuário adicionar `incoterm_pedido` + `incoterm_item` explicitamente, o **explícito vence** sobre o cascade.
4. **Preview avisa:** quando houver overrides individuais sendo sobrescritos pelo cascade, o preview mostra "N itens serão sobrescritos".

### Contadores no preview

A aba **Combinado** mostra 4 contadores: pedidos afetados / itens afetados / campos pedido alterados / campos item alterados. Exemplo: 2 pedidos × 1 campo (`incoterm_pedido`) com 19 itens → "2 pedidos · 19 itens · 2 campos pedido · 19 campos item".

---

## Divergência Pedido vs Itens na Lista

Quando o valor do Pedido difere dos itens (ex: pedido `FOB`, itens variam entre `CIF`/`EXW`/`FCA`), a lista mostra:

- **Valor do pedido visível** (FOB) — não é mais escondido
- **Ícone de alerta ⚠ laranja** ao lado do valor
- **Tooltip** descrevendo a divergência ("Itens divergem do pedido")

Comportamento por estado da célula:

| Estado | Renderização |
|--------|--------------|
| Pedido tem valor + itens iguais | `FOB` (texto normal) |
| Pedido tem valor + itens divergem | `FOB ⚠` (valor + ícone) |
| Pedido sem valor + agregado impossível (ex: unidades incomparáveis) | `⚠ Unidades divergentes entre itens` (só alerta) |
| Pedido sem valor + sem divergência | `—` |

Para resolver a divergência, o usuário pode usar a **aba Combinado** para forçar o valor do pedido em todos os itens.

---

## Tipo de Operação — auto-fill do lado nacional

Quando o usuário altera **Tipo de Operação** (`tipo_operacao_pedido`) em massa, o sistema preenche automaticamente o lado nacional com **nome + CNPJ do Workspace** de cada pedido.

### Regra

- **Workspace = empresa nacional** (importador em IMP, exportador em EXP). Cada workspace tem nome + CNPJ próprios cadastrados no Configurador.
- Ao trocar tipo, o sistema:
  1. Preenche o lado nacional com `workspace.nome_workspace` + `workspace.cnpj_workspace`
  2. Limpa o lado oposto (nome+CNPJ do tipo anterior viram vazios)
  3. Cascadeia para todos os itens do pedido (coluna `nome_*_item` na PedidoItem)

### Cada pedido usa o seu próprio workspace

Se o usuário seleciona pedidos de **workspaces diferentes** (ex: 5 do CDE EXPORTADOR + 3 do AMSTED LTDA) e troca tipo em massa, cada pedido pega o seu workspace:
- Pedidos do CDE → `nome_exportador = "CDE EXPORTADOR"`
- Pedidos do AMSTED → `nome_exportador = "AMSTED LTDA"`

### Edição manual sobrescreve auto-fill

Se o usuário, **no mesmo batch**, troca `Tipo de Operação` E também edita manualmente o `Exportador — Nome`, o valor digitado pelo usuário vence sobre o auto-fill. O sistema avisa no Passo 2 com banner amarelo "Edição manual sobrescreve auto-fill".

### Avisos no Passo 2

3 banners podem aparecer ao confirmar:

| Cor | Quando | Comportamento |
|-----|--------|--------------|
| **Azul informativo** | Sempre que troca tipo_operacao | Mostra workspaces que serão aplicados (nome + CNPJ) |
| **Amarelo "sem CNPJ"** | Algum workspace tem `cnpj_workspace = NULL` | Avisa; não bloqueia. CNPJ ficará vazio. Usuário pode preencher no Cadastros depois. |
| **Laranja "status crítico"** | Algum pedido tem status diferente de `rascunho` ou `aberto` | Avisa que pode causar inconsistência com documentos legais. Não bloqueia. |
| **Amarelo "override manual"** | Usuário editou manualmente `nome_exportador`/`nome_importador`/`cnpj_*` no mesmo batch | Avisa que manual vence sobre auto-fill |

### Comportamento se Configurador estiver offline

Falha ruidosa (Mand. 08). O sistema retorna erro 503 com mensagem "Configurador indisponível". Operação não pôde ser concluída — usuário tenta novamente.

---

## Campos Únicos (não permitem multi-seleção)

Alguns campos do Pedido são **únicos por organização** — não podem ter o mesmo valor em dois pedidos diferentes. Exemplo: `numero_pedido` (você não pode ter dois pedidos `PO-001` na mesma organização).

**Regra:** quando >1 pedido está selecionado, esses campos ficam **bloqueados** para edição em massa:
- Input desabilitado
- Tooltip explicando o porquê
- Badge "Único por organização — selecione 1 pedido"
- Botão "Revisar alterações" desabilitado se algum campo unique está bloqueado

Para editar um campo único, o usuário precisa **reduzir a seleção para 1 pedido**.

**Campos atualmente protegidos:** `numero_pedido` (mais podem ser adicionados quando expostos).

---

## Máscara de Entrada por Tipo de Campo

| Tipo | Renderização |
|------|--------------|
| **Texto** | Input livre |
| **Número** | Input numérico |
| **Data** | Date picker |
| **Select (enum)** | Dropdown com opções válidas (ex: Incoterm, Tipo de Operação, Cobertura Cambial) |
| **NCM** | Input com máscara automática `0000.00.00`, limite 8 dígitos, ignora não-numéricos |
| **Coluna do usuário** | Conforme tipo definido na criação |

Os enums Incoterm, Tipo de Operação e Cobertura Cambial **não aceitam digitação livre** — só seleção do dropdown.

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
