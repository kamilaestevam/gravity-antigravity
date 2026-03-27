# Documentação Visual — PaginaGlobal

Container base arquitetural do Gravity Design System. Define o grid de topo a base, organizando cabeçalho, métricas, ações e conteúdo para garantir padronização, comportamentos de full-bleed e scroll isolado. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Layout flexível que suporta `"lista"` (100% da largura, típico para Tabelas) e `"formulario"` (centralizado, típico para formulários de edição).

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica de grid baseada em `flex-direction: column`. O componente abstrai comportamentos complexos como altura `100%` da página com scroll seguro e full-bleed. Medidas extraídas de `pagina.css`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Padding Horizontal** | `2rem` (32px) em toda a `ws-content`. |
| **Padding Top (lista)** | Sem padding top adicional — cabeçalho sticky gerencia o espaço. |
| **Padding Top (formulário)** | Espaço adicional interno para formulários centralizados. |
| **Gap Interno** | `16px` entre as zonas de stats, toolbar e conteúdo principal. |
| **Scroll Isolado** | `min-height: 0` no container principal isola o scroll na área de conteúdo. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento nativo — o `PaginaGlobal` ocupa a área principal da interface excluindo apenas a sidebar e o cabeçalho global.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Preenche `100%` via flex do Layout pai. |
| **Referência Horizontal (X)** | Preenche horizontalmente, padding `2rem` lateral. |
| **Overflow & Scroll** | `min-height: 0` → scroll **apenas** no bloco principal, não na janela toda. |
| **Full-Bleed** | StatCards cancelam o padding via `margin: 0 -2rem` para ocupar 100% visual. |

---

## Anatomia do Componente (Props e Slots)

| Propriedade / Slot | Valor / Descrição |
| :--- | :--- |
| **`cabecalho`** | Slot para `CabecalhoGlobal`. `flex-shrink: 0`, não rola. |
| **`stats`** e **`acoes`** | Área para cards informativos e botões globais (criar/exportar). |
| **`toolbar`** | Faixa entre estatísticas e conteúdo — filtros tabulares, switches. |
| **`layout`** | `'lista'` (100% largura) ou `'formulario'` (max-width centralizado). |
| **`children`** | Ponto de ancoragem principal — tabelas, formulários, blocos. |

---

## Exemplo de Uso (Código)

```tsx
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { Plus } from '@phosphor-icons/react'

export default function PaginaWorkspaces() {
  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Gestão de Workspaces"
          subtitulo="Consulte ou adicione novos espaços de trabalho"
        />
      }
      stats={[<StatCard key="1" titulo="Total" valor="4" />]}
      acoes={
        <BotaoGlobal icone={<Plus size={14} weight="bold" />}>
          Novo Workspace
        </BotaoGlobal>
      }
    >
      <TabelaGlobal dados={[]} colunas={[]} />
    </PaginaGlobal>
  )
}
```
