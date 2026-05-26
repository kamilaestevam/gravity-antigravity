# Duplicar e Excluir Pedidos — Regras de Negócio

> **Produto:** Pedido (COMEX)
> **Versão:** 2.0
> **Última atualização:** 2026-05-26
> **Status:** Implementado (commit `0ab3cc99`)

---

## Duplicar

### O que é
Cria cópia(s) de pedidos e/ou itens, respeitando configurações da organização e a regra arquitetural de sincronização pai↔filhos do `nucleo-global`.

### Escopo — 3 cenários no mesmo modal

| Seleção | O que acontece | Endpoint backend |
|---|---|---|
| **Só pedidos** | N pedidos novos são criados (cada um com todos seus itens via cascade) | `POST /api/v1/pedidos/duplicacoes/confirmar` |
| **Só itens** | M itens duplicados DENTRO do(s) pedido(s) pai(s), sem criar pedido novo | `POST /api/v1/pedidos/duplicacoes/itens` (1× por pedido pai) |
| **Misto** (pedido + item) | Ambos em paralelo via `Promise.all` — toast consolidado: "N pedidos e M itens duplicados" | Os 2 endpoints |

Pode duplicar pedidos em **qualquer status** (rascunho, aberto, em_andamento, aprovado, transferencia, consolidado, cancelado).

### Regra universal de sync pai↔filhos (nucleo-global)

> Documentada em `skills/arquitetura/nucleo-global/SKILL.md` — não é específica do Pedido.

A `TabelaVirtualGlobal` sincroniza pais e filhos automaticamente: **pai marcado ⟺ todos os filhos do pai marcados**. Marcar o checkbox do pedido marca todos os itens; marcar o último item que faltava marca o pai. Sem prop opcional — comportamento fixo.

**Para evitar duplicação dupla** (item seria criado 2 vezes — uma via cascade do pai, outra via `/duplicacoes/itens`), o modal **filtra** os itens cujo `pedido_id` já está em `pedidos` selecionados. O cascade do pai cuida deles.

### Regra de ordenação após duplicação (invioláveis)

| Tipo de duplicado | Posição na Lista | Como é garantido |
|---|---|---|
| **Pedido novo** | Primeira linha | `orderBy: data_criacao_pedido DESC` no GET /pedidos + `data_criacao_pedido @default(now())` no INSERT |
| **Item novo** (dentro do pedido pai) | Linha imediatamente abaixo do original | Algoritmo "renumerar limpo" em `duplicarExcluirService.ts:duplicarItens` |

### Configurações

| Configuração | Descrição | Default |
|---|---|---|
| `duplicar_numero_auto` | Se true: gera número automaticamente pela regra de numeração. Se false: usuário digita o número | `false` (usuário digita) |
| `duplicar_copiar_datas` | Se true: copia datas do original. Se false: reseta datas (ficam em branco). **NÃO afeta `data_emissao_pedido`** — ver exceção abaixo | `false` |
| `duplicar_status_inicial` | `'copiar'` (mesmo do original) ou qualquer status válido | `'copiar'` |

**Exceção arquitetural** — `data_emissao_pedido` é regra fixa, não respeita `duplicar_copiar_datas`. Razão: é chave de ordenação da Lista. Pedido duplicado sempre nasce com `new Date()` para garantir que apareça no topo.

### Campos sempre copiados (pedido novo)

- Todos os campos do pedido (incoterm, moeda, exportador, referências, etc.)
- Todos os itens via cascade (part_number, NCM, descrição, etc.)
- Colunas customizadas do usuário
- Snapshots de empresa congelados do original (não re-consulta Cadastros — duplicar não é re-emissão)

### Campos NUNCA copiados

| Campo | Razão |
|---|---|
| `id_pedido` | Novo ID gerado |
| `data_criacao_pedido`, `data_atualizacao_pedido` | Timestamps da cópia |
| `ids_origem_consolidacao_pedido` | Pedido novo não é consolidação |
| `data_consolidacao_pedido`, `data_transferencia_saldo_pedido` | Histórico não é herdado |

### Quantidades de execução SEMPRE zeradas no item duplicado

| Campo do `pedido_item` | Por que é zerado |
|---|---|
| `quantidade_pronta_item` | Representa marcação real de "pronto" — não pode ser copiada sem ação correspondente |
| `quantidade_transferida_item` | Representa transferência para processo de embarque — copiar geraria saldo fantasma sem processo correspondente |
| `quantidade_cancelada_item` | Representa cancelamento real — não faz sentido herdar |

`quantidade_atual_item` recebe `quantidade_inicial_item` (item nasce íntegro). Sem essa regra, soma do dashboard ficaria inflada por execução fantasma.

### Aviso pré-duplicação (transparência com o usuário)

Se algum item selecionado tem qualquer das 3 quantidades de execução > 0, o modal exibe um banner amarelo **antes do botão Duplicar**, listando que esses campos serão zerados e o motivo (evita saldo fantasma).

### Fluxo UX
1. Usuário seleciona pedido(s), item(s), ou mistura
2. Clica em "Duplicar" (toolbar) ou ação "Duplicar" do dropdown da linha
3. Modal abre com título dinâmico ("Duplicar 1 pedido e 2 itens")
4. Se há pedidos: usuário digita o número da cópia de cada um (ou aceita o auto-gerado)
5. Se há itens com execução > 0: banner amarelo de aviso aparece
6. Confirma → backend processa em paralelo, toast consolidado
7. Modal final mostra resumo dos novos pedidos + itens criados

---

## Excluir

### O que é
Remove definitivamente um ou mais pedidos (ou itens). **Hard delete** — não há recuperação.

### Escopo
- Usuário pode selecionar **1 ou mais pedidos** → exclui todos
- Usuário pode selecionar **1 ou mais itens** dentro de um pedido → exclui só os itens

### Regras fixas (sempre válidas)
- Excluir um pedido **remove todos os seus itens** automaticamente (cascade do schema Prisma)
- Excluir um item **mantém o pedido pai** — verificar configuração `excluir_pedido_sem_item_permitido`
- Requer permissão de exclusão configurada
- Auditoria obrigatória via `auditLog`: registra o que foi excluído, por quem e quando

### Configurações

| Configuração | Descrição | Default |
|---|---|---|
| `excluir_status_permitidos` | **Blacklist opt-out** — status **bloqueados** para exclusão (nome de coluna legado; semântica invertida em 2026-05-26) | `[]` (= todos os status permitidos, inclusive custom como `pagamento_aprovado`) |
| `excluir_pedido_sem_item_permitido` | Se false: ao excluir o último item, exclui o pedido pai também | `true` |

> **Migração (2026-05-26):** orgs com a whitelist legada dos 7 status canônicos são normalizadas para `[]` no backend e na UI de Configurações — comportamento equivalente a “liberar todos”. Orgs que tinham whitelist **custom** (subset dos 7) mantêm a lista como blacklist explícita; revisar manualmente se algum status custom legítimo ficou bloqueado por engano.

### Fluxo de restrição por status
- **Default (`[]`):** qualquer status pode ser excluído — inclusive status custom criados pela organização
- Se o status do pedido está na blacklist `excluir_status_permitidos` → bloqueia com mensagem: *"Status \"X\" está bloqueado para exclusão nas configurações da organização"*
- Na UI de Configurações, checkbox **marcado** = status **bloqueado** (opt-out)

### Fluxo UX
1. Usuário seleciona pedido(s) ou item(s)
2. Clica em "Excluir"
3. Modal de confirmação: "Você está excluindo X pedido(s) com Y item(s). Esta ação não pode ser desfeita."
4. Se algum pedido não pode ser excluído (status não permitido): lista os bloqueados com motivo
5. Usuário pode excluir só os permitidos ou cancelar tudo
6. Confirmar → exclusão permanente

### Regra `excluir_pedido_sem_item_permitido`
- `true` (default): pedido pode existir sem itens — ao excluir o último item, o pedido permanece vazio
- `false`: ao excluir o último item de um pedido, o pedido é excluído junto automaticamente

---

## Configurações Consolidadas (Duplicar + Excluir)

Tabela `configuracao_pedido` (model `ConfiguracaoPedido`):

```prisma
// Duplicar
duplicar_numero_auto              Boolean  @default(false)
duplicar_copiar_datas             Boolean  @default(false)
duplicar_status_inicial           String   @default("copiar")

// Excluir — coluna excluir_status_permitidos guarda BLACKLIST (nome legado)
excluir_status_permitidos         String[] @default([])   // [] = todos permitidos
excluir_pedido_sem_item_permitido Boolean  @default(true)
```

---

## Referências cruzadas

- **Documento técnico:** [`DUPLICAR-EXCLUIR-TECNICO.md`](./DUPLICAR-EXCLUIR-TECNICO.md) — arquitetura, endpoints, algoritmo de shift
- **Skill do produto:** [`skills/produtos-gravity/pedido/SKILL.md`](../../../skills/produtos-gravity/pedido/SKILL.md) — Parte 4
- **Skill do componente:** [`skills/arquitetura/nucleo-global/SKILL.md`](../../../skills/arquitetura/nucleo-global/SKILL.md) — seção "Tabelas hierárquicas — sync pai↔filhos"
