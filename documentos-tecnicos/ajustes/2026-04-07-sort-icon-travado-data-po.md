# Ajuste: Ícone de Sort Travado na Coluna "DATA P.O"

**Data:** 2026-04-07  
**Classificação:** MEDIUM  
**Produto:** Pedido — ListaPedidos  
**Componente:** TabelaVirtualGlobal  

---

## Problema

O ícone de ordenação (↓) aparecia permanentemente fixo na coluna "DATA P.O", independentemente de qual coluna estava ativa no sort. Confundia o usuário e sinalizava sort incorretamente.

## Causa Raiz

`TabelaVirtualGlobal.tsx:951` inicializa `sortLocal` via `useState` com os valores dos props `sortCampo`/`sortDir`.

```typescript
// ANTES — bugado
const [sortLocal, setSortLocal] = useState<...>(
  sortCampo && sortDir ? { campo: sortCampo, dir: sortDir } : null,
)
```

`ListaPedidos.tsx:4102` define o default como `'data_emissao_pedido'` (desc), então `sortLocal` nasce apontando para "DATA P.O".

Quando o usuário ordena por outra coluna via `FiltroPopoverColuna` → `handleOrdenar` → `setSortCampo`, os props `sortCampo`/`sortDir` mudam, mas `useState` ignora mudanças de prop após o mount. O `sortLocal` nunca era atualizado — ícone ficava travado.

## Arquivos Modificados

| Arquivo | Linha | Tipo de mudança |
|---------|-------|-----------------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` | ~953 | Adicionar `useEffect` de sincronização |

## Solução

Adicionar `useEffect` logo após o `useState` de `sortLocal`:

```typescript
useEffect(() => {
  setSortLocal(
    sortCampo && sortDir ? { campo: sortCampo, dir: sortDir } : null,
  )
}, [sortCampo, sortDir])
```

## Efeitos Colaterais

Nenhum. O `handleSort` (click direto no header) já chama `onOrdenar` que atualiza os props — o `useEffect` vai sincronizar na sequência, resultando no mesmo estado final (idempotente).

## Decisão

Ajuste cirúrgico — não reescrita.
