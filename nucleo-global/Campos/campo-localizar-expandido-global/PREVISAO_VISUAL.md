# Documentação Visual — LocalizarExpandidoCampoGlobal

Barra de busca global com filtragem DOM ao vivo e expansão animada. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Estados do componente: recolhido, expandido vazio (⌘K), com busca ativa (X) e filtragem DOM.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica: flexbox horizontal com ícone de lupa, input expansível e ação contextual (⌘K ou XCircle). Verificação milimétrica dos espaçamentos definidos em `localizar.css`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Largura Expandido** | O componente expande até **240px** (`w-60`) para garantir clareza na digitação. |
| **Gap com Ícones** | **8px** de espaçamento entre ícones adjacentes na barra de ações. |
| **Altura da Barra** | Altura centralizada de **36px** no cabeçalho do Shell. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento no cabeçalho do Shell (Barra de Ações Globais).

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Centralizado verticalmente no cabeçalho do Shell. |
| **Referência Horizontal (X)** | Slot de ações globais, à esquerda do avatar do usuário. |
| **Expansão** | Expande para a esquerda via transição CSS de largura (`transition: width 0.2s`). |

---

## Anatomia do Componente

| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Classe CSS** | `ws-global-search` (+ `.expanded` quando aberto) |
| **Ícone de Busca** | `MagnifyingGlass` (Phosphor), 18px, weight bold |
| **Placeholder** | `"Localizar no sistema..."` |
| **Atalho** | Badge `⌘K` exibido quando expandido e vazio |
| **Botão Limpar** | `XCircle` (Phosphor), 18px, aparece quando há texto |
| **Filtragem DOM** | Oculta elementos não correspondentes via classe `ws-search-hidden` |
| **Reset Automático** | Limpa o termo ao trocar de rota (`location.pathname`) |

---

## Exemplo de Uso (Código)

```tsx
import { LocalizarExpandidoCampoGlobal } from '@nucleo/campo-localizar-expandido-global'

// Modo autônomo (filtra o DOM automaticamente)
<LocalizarExpandidoCampoGlobal />

// Modo controlado (busca via API)
<LocalizarExpandidoCampoGlobal
  value={termoBusca}
  onChange={setTermoBusca}
  disableGlobalDOMFilter
  onBuscarNavigate={(termo) => navigate(`/busca?q=${termo}`)}
  alwaysExpanded
/>
```
