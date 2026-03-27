# Documentação Visual — CardGlobal

Biblioteca de cards do Gravity Design System: **CardBasicoGlobal** (métrica numérica com tendência e seletor de período) e **CardGraficoGlobal** (gauge circular com legenda). Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Todos os estados visuais, variantes de cor (padrão, sucesso, aviso, perigo, primário), hover com tooltip CSS-only e seletor de período interativo.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Blueprint técnico com anatomia dos dois cards: dimensões, paddings, tipografia, gap do gauge SVG, legenda e trend badge. Medidas extraídas de `card.css`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Dimensão do Card** | `width: 240px`, `min-width: 240px` — largura fixa. |
| **Padding Interno** | `1.25rem` (20px) em todos os lados. |
| **Border-radius** | `12px` — arredondamento premium. |
| **Fonte do Valor** | `font-size: 1.875rem` (30px), `font-weight: 700`. |
| **Gauge SVG** | `48×48px`, `stroke-width: 3.5`, dasharray proporcional ao %. |
| **Dots da Legenda** | `7×7px`, `border-radius: 50%`. |
| **Período Picker** | Dropdown ao hover do badge, `position: absolute`, glassmorphism. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento dos cards como linha de métricas entre o CabecalhoGlobal e a TabelaGlobal. Exibição em linha horizontal com wrap responsivo.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Abaixo do `CabecalhoGlobal`, topo da área de conteúdo. |
| **Referência Horizontal (X)** | Flex row com `gap: 16px`, distribui horizontalmente. |
| **Espaçamento Relacional** | **16px** de distância do topo da `TabelaGlobal`. |
| **Margem Lateral** | **24px** do limite da `PaginaGlobal`. |
| **Responsividade** | `flex-wrap: wrap` — cards quebram linha em telas estreitas. |

---

## Anatomia — CardBasicoGlobal

| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Classe CSS** | `cg-card` (+ `cg-card--{variante}`, `cg-card--align-{alinhamento}`, `cg-card--has-tooltip`) |
| **Dimensão** | `width: 240px`, `min-width: 240px` |
| **Padding** | `1.25rem` (20px) |
| **Border** | `1px solid var(--ws-accent-border)`, `border-radius: 12px` |
| **Header** | Flex row, `gap: 0.5rem` — ícone + label (0.75rem, weight 600, uppercase) |
| **Valor** | `font-size: 1.875rem` (30px), weight 700 |
| **Trend Badge** | Pill `border-radius: 9999px`, 0.875rem (14px), weight 700 |
| **Tooltip** | CSS-only, `position: absolute`, seta, 230px de largura |

---

## Anatomia — CardGraficoGlobal

| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Chart Body** | Flex row, `gap: 0.875rem` (14px), `margin-top: 0.375rem` (6px) |
| **Gauge SVG** | 48×48px, `stroke-width: 3.5`, `strokeDasharray` proporcional ao % |
| **Valor Central** | 0.9375rem (15px), weight 700, centralizado via `position: absolute; inset: 0` |
| **Legenda** | Flex column, `gap: 0.375rem` (6px), 0.75rem (12px) |
| **Dots da Legenda** | 7×7px, `border-radius: 50%` — green (#34d399), yellow (#fbbf24), red (#f87171) |

---

## Variantes de Cor

| Variante | Border Padrão | Border Hover | Cor |
| :--- | :--- | :--- | :--- |
| `padrao` | `rgba(129,140,248,0.2)` | `#818cf8` | Indigo Workspace |
| `sucesso` | `rgba(52,211,153,0.3)` | `#34d399` | Emerald |
| `aviso` | `rgba(251,191,36,0.3)` | `#fbbf24` | Amber |
| `perigo` | `rgba(248,113,113,0.3)` | `#f87171` | Red |
| `primario` | `rgba(129,140,248,0.3)` | `#818cf8` | Indigo forte |

---

## Exemplo de Uso (Código)

```tsx
import { CardBasicoGlobal, CardGraficoGlobal } from '@nucleo/card-global'
import { TreeStructure, ChartPieSlice } from '@phosphor-icons/react'

// Card de métrica com seletor de período
<CardBasicoGlobal
  titulo="Total de Filhas"
  icone={<TreeStructure weight="duotone" size={16} />}
  valor={30}
  periodos={[
    { periodo: '7d',  rotulo: '7 dias',   valor: '+1',   direcao: 'up'   },
    { periodo: '30d', rotulo: '30 dias',  valor: '+5%',  direcao: 'up'   },
  ]}
  subtexto="20 slots disponíveis"
/>

// Card com gauge circular
<CardGraficoGlobal
  titulo="Status das Filhas"
  icone={<ChartPieSlice weight="duotone" size={16} />}
  total={30}
  valorPrincipal={23}
  corGauge="#34d399"
  legenda={[
    { label: 'Ativas',    valor: 23, cor: 'green'  },
    { label: 'Suspensas', valor:  7, cor: 'yellow' },
  ]}
/>
```
