# Documentação Visual — CabecalhoGlobal

Cabeçalho padrão do Gravity Design System, responsável por introduzir a identidade e ações globais de uma página. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Demonstra as três variações principais: (1) Completo com ícone e subtítulo, (2) Simples com título e ícone, (3) Apenas texto. Também mostra o slot de `acoes` à direita.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia detalhada apontando compensações de margem negativa e alinhamento do bloco esquerdo (título e subtítulo). Medidas extraídas diretamente de `cabecalho.css`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Altura Mínima** | `min-height: 74px` — garante consistência mesmo sem subtítulo. |
| **Compensação de Margem** | `margin: -24px -2rem 0 -2rem` cancela o padding do `ws-content` → fullbleed. |
| **Padding Interno** | `padding: 0 2rem` mantém o conteúdo alinhado com o restante da página. |
| **Título `<h1>`** | `font-size: 1.25rem` (20px), `font-weight: 700`, cor `var(--cg-text)`. |
| **Subtítulo `<p>`** | `font-size: 0.8125rem` (13px), cor `var(--cg-muted)`, `line-height: 1.4`. |
| **Slot Ações** | Flex row, `gap: 0.5rem`, alinhado à direita (justify-content: space-between). |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento sticky (`z-index: 50`) preso ao topo do container de conteúdo principal. Demonstrado na interface real do Gravity Shell.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Posição Sticky** | `position: sticky; top: 0` — acompanha o scroll do usuário. |
| **Z-Index** | `z-index: 50` — sobrepõe o conteúdo rolável da página. |
| **Espaçamento Relacional** | Conteúdo abaixo (StatCards ou Tabela) herda gap de **24px** do `PaginaGlobal`. |

---

## Anatomia do Componente

| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Altura** | Fixa em `74px` (`min-height: 74px`). |
| **Display Base** | `flex`, `justify-content: space-between`, `align-items: center`. |
| **Ícone** | ReactNode injetado colorizado com `var(--cg-accent)`. |
| **Título principal** | Tag `<h1>`, 1.25rem (20px), peso 700, cor `var(--cg-text)`. |
| **Subtítulo** | Tag `<p>`, 0.8125rem (13px), cor `var(--cg-muted)`. |
| **Slot "Ações"** | Espaço de contenção à direita (`gap: 0.5rem`) para CTAs primárias. |

---

## Exemplo de Uso (Código)

```tsx
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { Buildings, Plus } from '@phosphor-icons/react'

<CabecalhoGlobal
  icone={<Buildings weight="duotone" size={22} />}
  titulo="Empresas Filhas"
  subtitulo="Gerencie as empresas filhas do seu tenant Gravity."
  acoes={
    <BotaoGlobal
      variante="primario"
      icone={<Plus weight="bold" size={14} />}
    >
      Nova Empresa
    </BotaoGlobal>
  }
/>
```
