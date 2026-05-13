# Seleção e Ações em Itens (Linhas Filho) — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 2.0
> **Última atualização:** 2026-05-13
> **Status:** Implementado (selecionável + sync universal pai↔filhos)

---

## Contexto

A tabela de pedidos tem hierarquia pai (Pedido) / filho (PedidoItem). A seleção de itens (linhas filho) está habilitada via `selecionavelFilhos={true}` no `TabelaVirtualGlobal`, e segue a **regra universal de sincronização pai↔filhos** do `nucleo-global` (aprovada 2026-05-11).

O usuário pode selecionar itens de **pedidos diferentes** ao mesmo tempo — cada item carrega seu `pedido_id` para o backend saber a origem.

---

## Regra universal de sync pai↔filhos

> Documentada em [`skills/arquitetura/nucleo-global/SKILL.md`](../../../skills/arquitetura/nucleo-global/SKILL.md) — seção "Tabelas hierárquicas — sync pai↔filhos".

**Invariante:** pai marcado ⟺ todos os filhos do pai marcados. Sem prop opcional — comportamento fixo do componente.

| Ação | Resultado automático |
|---|---|
| Marca pai | Todos os filhos cached do pai marcam |
| Desmarca pai | Todos desmarcam |
| Marca último filho que faltava | Pai marca automaticamente |
| Desmarca qualquer filho com pai marcado | Pai desmarca |
| Header "selecionar todos" | Todos pais visíveis + todos os filhos cached |

---

## Props ativas no `TabelaVirtualGlobal`

```ts
selecionavelFilhos: boolean           // habilita checkbox nas linhas filho (true no Pedido)
onSelecaoFilho?: (itens: C[]) => void  // callback ao mudar seleção de filhos
acoesFilho?: (item: C) => GTAcaoLinha[] // dropdown de ações inline na linha filho
filhoId?: (filho: C) => string         // extrai id do filho (default: `(f) => f.id`)
```

A `TabelaVirtualGlobal` mantém internamente:
- `selecionados: Set<string>` — ids dos pedidos pais marcados (hook `useGTSelecao`)
- `filhosSelecionados: Set<string>` — ids dos itens marcados (`useState` local)
- `filhosCacheMap: Map<string, C>` — objetos dos filhos marcados (ref local)

Os 2 estados são sincronizados automaticamente pela lógica do componente (não pelo consumidor).

---

## Estado no `Pedidos.tsx` (`selecaoStore`)

```ts
// store Zustand em produto/pedido/client/src/shared/state/selecaoStore.ts
interface SelecaoState {
  pedidosSelecionados: Pedido[]
  itensSelecionados: PedidoItem[]
  hasMixedTipos: boolean    // true quando há importação + exportação juntos
}
```

Consumido pela página via `usePedidosSelecionados()` e `useItensSelecionados()` (selectors estáveis).

---

## Toolbar contextual (compartilhada)

Os botões da toolbar aceitam **pedido OU item OU mistura** — não há toolbars separadas. Label e tooltip são dinâmicos.

Exemplo do botão **Duplicar**:

```tsx
disabled={pedidosSelecionados.length === 0 && itensSelecionados.length === 0}
titulo={
  pedidosSelecionados.length > 0 && itensSelecionados.length > 0
    ? `Duplicar · ${nP} pedido(s) + ${nI} item(ns)`
    : pedidosSelecionados.length > 0
      ? `Duplicar · ${nP} pedido(s)`
      : `Duplicar · ${nI} item(ns)`
}
```

Botões que se comportam assim hoje: **Duplicar**, **Transferir**.

| Botão | Aceita só pedido | Aceita só item | Aceita misto |
|---|:-:|:-:|:-:|
| Transferir | ✅ | ✅ | ✅ |
| Duplicar | ✅ | ✅ | ✅ |
| Consolidar | ✅ (≥2) | ❌ | ❌ |
| Editar em Massa | ✅ | — | — |
| Gerar Documento | ✅ | — | — |
| Excluir | ✅ | (via dropdown da linha) | — |

---

## Dropdown de ações da linha filho

Botão de três pontos ao hover. Implementado via prop `acoesFilho` da `TabelaVirtualGlobal`:

```ts
const acoesFilhoEstavel = useCallback((item: PedidoItem) => ([
  {
    label: 'Transferir',
    icone: <ArrowsLeftRight size={13} weight="duotone" />,
    onClick: () => {
      setItensSelecionados([item])
      setModalTransferirAberto(true)
    },
  },
  {
    label: 'Duplicar',
    icone: <CopySimple size={13} weight="duotone" />,
    onClick: () => {
      setItensSelecionados([item])
      setModalDuplicarAberto(true)
    },
  },
  {
    label: 'Excluir',
    icone: <Trash size={13} weight="duotone" />,
    perigo: true,
    onClick: async () => { /* excluirApi.excluirItens(...) */ },
  },
]), [/* deps */])
```

Quando o usuário clica em "Duplicar" no dropdown, o handler popula `itensSelecionados` com aquele item e abre o modal — que então trata o cenário "só item" do fluxo misto.

---

## Fluxo de seleção cruzada (itens de pedidos diferentes)

```
PO-001 [expandido]
  ├── [✓] Item ABC-001  100 un      ← seq 1, marcado
  └── [ ] Item DEF-002   50 un

PO-002 [expandido]
  ├── [✓] Item ABC-001   30 un      ← mesmo part_number, pedido diferente
  └── [ ] Item XYZ-003   20 un
```

`itensSelecionados` = `[item1_PO001, item1_PO002]`. Toolbar mostra "Duplicar (2 itens)".

Quando o usuário confirma Duplicar:
- Modal agrupa por `pedido_id` (`itensPorPedido` no `ModalPedidosDuplicar.tsx`)
- Faz **1 chamada `duplicarItens` por pedido pai distinto** — 2 chamadas em paralelo
- Backend renumera filhos do pai (cada cópia abaixo do original)

---

## Referências cruzadas

- [`DUPLICAR-EXCLUIR-REGRAS-NEGOCIO.md`](./DUPLICAR-EXCLUIR-REGRAS-NEGOCIO.md) e [`DUPLICAR-EXCLUIR-TECNICO.md`](./DUPLICAR-EXCLUIR-TECNICO.md)
- [`TRANSFERIR-REGRAS-NEGOCIO.md`](./TRANSFERIR-REGRAS-NEGOCIO.md)
- [`skills/arquitetura/nucleo-global/SKILL.md`](../../../skills/arquitetura/nucleo-global/SKILL.md) — Sync pai↔filhos
- [`skills/produtos-gravity/pedido/SKILL.md`](../../../skills/produtos-gravity/pedido/SKILL.md) — Parte 4 (Duplicar) + Parte 3 (Transferir)
