# Seleção e Ações em Itens (Linhas Filho) — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026

---

## Contexto

A tabela de pedidos tem hierarquia pai (Pedido) / filho (PedidoItem). Hoje apenas os pedidos têm checkbox e ações. Os itens precisam ter o mesmo suporte.

O usuário pode selecionar itens de **pedidos diferentes** ao mesmo tempo — cada item carrega seu `pedido_id` para o backend saber a origem.

---

## Mudanças no TabelaVirtualGlobal (`nucleo-global`)

### Novas props em `GTVirtualTableProps`

```ts
// Habilita checkbox e seleção nas linhas filho
selecionavelFilhos?: boolean

// Callback chamado quando seleção de itens muda
onSelecaoFilho?: (itensSelecionados: C[]) => void

// Ações inline na linha filho (menu de três pontos)
acoesFilho?: (item: C) => GTAcaoLinha[]
```

### Comportamento

- Checkbox aparece na primeira célula da linha filho quando `selecionavelFilhos=true`
- Seleção de filho é **independente** da seleção do pai — selecionar o pedido não seleciona seus itens automaticamente
- "Selecionar tudo" na linha pai seleciona todos os itens daquele pedido (opcional, configurável)
- Itens de pedidos diferentes podem ser selecionados ao mesmo tempo

---

## Mudanças no ListaPedidos

### Novo estado

```ts
const [itensSelecionados, setItensSelecionados] = useState<PedidoItem[]>([])
```

### Toolbar contextual

Quando `itensSelecionados.length > 0`, mostrar toolbar de itens com:

| Botão | Ação | Ícone |
|---|---|---|
| Transferir (N itens) | Abre ModalTransferir com itens pré-selecionados | ArrowsLeftRight |
| Duplicar (N itens) | Abre ModalDuplicar em modo item | CopySimple |
| Editar em Massa (N itens) | Abre ModalEdicaoEmMassa em modo item | PencilLine |
| Excluir (N itens) | Preview + confirmação de exclusão de itens | Trash |

Quando há **mix** (pedidos E itens selecionados), mostrar os dois toolbars separados:
```
[Pedidos: Consolidar · Transferir · Duplicar · Excluir]
[Itens:   Transferir · Duplicar · Editar em Massa · Excluir]
```

### Passagem para os modais

Cada `PedidoItem` selecionado já contém `pedido_id` — passado diretamente para os modais sem necessidade de lookup adicional.

---

## Menu de ação inline na linha filho

Botão de três pontos (ou ícones rápidos) ao hover na linha filho:

```
PedidoItem row: [...] ⠿  ABC-001  100 un  $500  [→ Transferir] [⧉ Duplicar] [🗑]
```

Ações inline (sem seleção em massa):
- **Transferir** — abre ModalTransferir com esse item pré-selecionado
- **Duplicar** — duplica o item imediatamente (confirma inline)
- **Excluir** — confirma inline e exclui

---

## Fluxo de seleção cruzada (itens de pedidos diferentes)

```
PO-001 [expandido]
  ├── [✓] Item ABC-001  100 un
  └── [ ] Item DEF-002   50 un

PO-002 [expandido]
  ├── [✓] Item ABC-001   30 un   ← mesmo part_number, pedido diferente
  └── [ ] Item XYZ-003   20 un

Toolbar itens: Transferir (2) · Duplicar (2) · Excluir (2)
```

Cada item selecionado carrega: `{ id, pedido_id, part_number, quantidade_atual, ... }`
