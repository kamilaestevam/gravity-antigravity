# Documentação Visual — TooltipGlobal

Tooltip unificada da plataforma Gravity — card minimalista renderizado via portal com posicionamento automático. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Estados visuais (com título / sem título), posicionamento automático (acima/abaixo) e paleta de cores do componente.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Blueprint técnico com medidas verificadas 100% no `tooltip.css` real: lógica de smart-positioning, card portal, triggers e animações.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Padding do Card** | `0.75rem 1rem` → 12px vertical / 16px horizontal. |
| **Max-width** | `260px` (`width: max-content`) — adapta-se ao conteúdo sem quebrar. |
| **Border** | `1px solid rgba(129, 140, 248, 0.22)` — borda violeta translúcida. |
| **Border-radius** | `8px` — levemente arredondado. |
| **Box-shadow** | `0 12px 32px rgba(0,0,0,0.6)` — sombra de elevação profunda. |
| **Gap Vertical (âncora)** | **8px** de distância entre o elemento âncora e o card. |
| **Animação** | `0.15s cubic-bezier(0.16, 1, 0.3, 1)` — tg-in-up (acima) ou tg-in-down (abaixo). |
| **Cursor do Trigger** | Cursor `i` (ícone de info SVG inline) em roxo `#6366f1`. |

---

## 3. Composição de Ancoragem Global (Contexto)
Contextos reais de uso: labels de formulário, cabeçalhos de seção, colunas de tabela e badges de status. O card é renderizado via portal, nunca cortado por `overflow: hidden`.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Renderização** | `ReactDOM.createPortal` em `document.body` — nunca cortado por `overflow`. |
| **Posição (fixed)** | `position: fixed`, `z-index: 99999`, `pointer-events: none`. |
| **Smart Vertical** | Acima quando `espacoAcima > 80px`; abaixo como fallback. Gap de **8px**. |
| **Smart Horizontal** | Centralizado: `left = clamp(138, rect.center, viewport − 138)`. |
| **Tooltips Desabilitadas** | `body.tooltips-disabled .tg-card { display: none !important }` — toggle global. |

---

## Anatomia do Componente

| Área / Propriedade | Medida / Valor |
| :--- | :--- |
| **Card (`.tg-card`)** | `background: #0f172a`, `border: 1px solid rgba(129,140,248,0.22)`, `border-radius: 8px` |
| **Padding** | `0.75rem 1rem` (12px 16px) |
| **Max-width** | `260px` (`width: max-content`) |
| **Sombra** | `0 12px 32px rgba(0,0,0,0.6)` |
| **Título (`.tg-titulo`)** | `font-size: 0.8125rem (13px)`, `font-weight: 700`, `color: #f1f5f9`, `margin-bottom: 0.3rem` |
| **Descrição (`.tg-descricao`)** | `font-size: 0.75rem (12px)`, `color: #94a3b8`, `line-height: 2` |
| **Font-family** | `var(--font, 'Plus Jakarta Sans', sans-serif)` |
| **Trigger (`.tg-trigger`)** | `display: inline-flex`, cursor SVG info icon `#6366f1` |

---

## Exemplo de Uso (Código)

```tsx
import { TooltipGlobal } from '@nucleo/tooltip-global'

<TooltipGlobal
  titulo="Nome Fantasia"
  descricao="O nome público da sua empresa nos documentos"
>
  <label>Nome Fantasia</label>
</TooltipGlobal>
```
