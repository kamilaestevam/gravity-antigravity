# Duplicar e Excluir Pedidos — Regras de Negócio

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026
> **Status:** Definido — aguardando implementação

---

## Duplicar

### O que é
Cria uma cópia exata de um ou mais pedidos (ou itens), respeitando as configurações do tenant.

### Escopo
- Usuário pode selecionar **1 ou mais pedidos** → duplica todos
- Usuário pode selecionar **1 ou mais itens** dentro de um pedido → duplica só os itens selecionados dentro do mesmo pedido
- Pode duplicar pedidos em **qualquer status** (rascunho, aberto, transferencia, consolidado, cancelado)

### Configurações

| Configuração | Descrição | Default |
|---|---|---|
| `duplicar_numero_auto` | Se true: gera número automaticamente pela regra de numeração configurada. Se false: usuário digita o número | `false` (usuário digita) |
| `duplicar_copiar_datas` | Se true: copia as datas do pedido original. Se false: reseta datas (ficam em branco) | `false` (reseta datas) |
| `duplicar_status_inicial` | Status com que o pedido duplicado começa: `'copiar'` (mesmo do original) ou qualquer status válido | `'copiar'` |

### Campos sempre copiados
- Todos os campos do pedido (incoterm, moeda, exportador, referências, etc.)
- Todos os itens (part_number, NCM, descrição, quantidades, valores)
- Colunas customizadas do usuário

### Campos nunca copiados
- `id` — novo ID gerado
- `created_at`, `updated_at` — timestamps da cópia
- `pedidos_origem` — não é uma consolidação, começa limpo
- Histórico de transferências

### Campos condicionais (por configuração)
- `numero_pedido` — auto ou usuário digita
- `data_emissao_pedido`, `data_embarque` — copia ou reseta
- `status` — copia ou começa em outro status

### Fluxo UX
1. Usuário seleciona pedido(s) ou item(s)
2. Clica em "Duplicar"
3. Se `duplicar_numero_auto = false`: modal pede o número (ou números, um por pedido)
4. Se `duplicar_numero_auto = true`: modal exibe o(s) número(s) gerado(s) (editável)
5. Preview com campos que serão copiados vs resetados
6. Confirmar → pedidos/itens criados

---

## Excluir

### O que é
Remove definitivamente um ou mais pedidos (ou itens). **Hard delete** — não há recuperação.

### Escopo
- Usuário pode selecionar **1 ou mais pedidos** → exclui todos
- Usuário pode selecionar **1 ou mais itens** dentro de um pedido → exclui só os itens

### Regras fixas (sempre válidas)
- Excluir um pedido **remove todos os seus itens** automaticamente
- Excluir um item **mantém o pedido pai** — verificar configuração `excluir_pedido_sem_item`
- Requer permissão de exclusão configurada
- Auditoria obrigatória: registra o que foi excluído, por quem e quando

### Configurações

| Configuração | Descrição | Default |
|---|---|---|
| `excluir_status_permitidos` | Lista de status que podem ser excluídos | `['rascunho']` |
| `excluir_pedido_sem_item_permitido` | Se false: ao excluir o último item, exclui o pedido pai também | `false` |

### Fluxo de restrição por status
- Se pedido não está em um status da lista `excluir_status_permitidos` → bloqueia com mensagem explicando quais status permitem exclusão

### Fluxo UX
1. Usuário seleciona pedido(s) ou item(s)
2. Clica em "Excluir"
3. Modal de confirmação: "Você está excluindo X pedido(s) com Y item(s). Esta ação não pode ser desfeita."
4. Se algum pedido não pode ser excluído (status não permitido): lista os bloqueados com motivo
5. Usuário pode excluir só os permitidos ou cancelar tudo
6. Confirmar → exclusão permanente

### Regra `excluir_pedido_sem_item_permitido`
- `false` (default): ao excluir o último item de um pedido, o pedido é excluído junto automaticamente
- `true`: pedido pode existir sem itens — ao excluir o último item, o pedido permanece vazio

---

## Configurações Consolidadas (Duplicar + Excluir)

Adicionar ao model `ConfiguracaoPedido`:

```prisma
// Duplicar
duplicar_numero_auto              Boolean  @default(false)
duplicar_copiar_datas             Boolean  @default(false)
duplicar_status_inicial           String   @default("copiar")

// Excluir
excluir_status_permitidos         String[] @default(["rascunho"])
excluir_pedido_sem_item_permitido Boolean  @default(false)
```
