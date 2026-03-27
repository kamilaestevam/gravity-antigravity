# Documentação Visual — ModalGlobal

Modal-base do Gravity Design System com overlay, header, abas (underline/pill), body scrollável, footer com botões, stack empilhável via modal-manager e responsividade mobile (bottom-sheet). Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Configurações do componente: básico (sem abas), com abas underline, com abas pill, tamanhos (sm/md/lg/xl/full), mobile bottom-sheet e variantes de botão no footer.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica: overlay fixed → dialog flex-column (header → abas opcionais → body scrollável → footer) com slots de conteúdo. Medidas verificadas em `modal.css`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Tamanhos Padrão** | `sm: 400px`, `md: 560px` (padrão), `lg: 720px`, `xl: 960px`, `full: 100%`. |
| **Max-Height e Scroll** | `max-height: calc(100vh - 2rem)` garantindo no mínimo `1rem` de overlay em torno. |
| **Borda e Sombra** | `border-radius: var(--radius-lg)` (12px), com box-shadow profundo. |
| **Background do Overlay**| `rgba(0,0,0,0.65)` com `backdrop-filter: blur(4px)`. |
| **Estrutura Flex** | `.mg-dialog` tem `display: flex`, `flex-direction: column`. Body é `flex: 1` rolável. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento global sobre o viewport inteiro via `position: fixed`. Suporte a stack empilhável via `modal-manager` (pub-sub).

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Centralizado verticalmente no overlay flex (`align-items: center`). |
| **Referência Horizontal (X)** | Centralizado horizontalmente (`justify-content: center`). |
| **Fixação Global** | `position: fixed`, `inset: 0`, `z-index: 1000`. |
| **Mobile (≤640px)** | Bottom-sheet: `align-items: flex-end`, border-radius apenas no topo, entra de baixo. |

---

## Anatomia do Componente

| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Overlay** | `.mg-overlay` — `position: fixed`, `background: rgba(0,0,0,0.65)`, `backdrop-filter: blur(4px)` |
| **Dialog** | `.mg-dialog` — bg `var(--ws-surface)`, animação `mg-slide-up 0.2s` |
| **Altura** | Dinâmica (fit-content) por padrão; fixa via prop `altura` (ex: `'680px'`) |
| **Header** | flex row, título `h2` + subtítulo opcional + botão X (`2rem × 2rem`) |
| **Abas Underline/Pill**| Suporte para navegação interna (`tipoAbas`) dentro do header ou abaixo dele. |
| **Body** | `.mg-body` — `flex: 1`, `overflow-y: auto`, padding customizável. |
| **Footer** | Suporta array de botões primary/secondary/ghost/danger. |
| **Acessibilidade** | `role="dialog"`, `aria-modal="true"`, focus trap automático. |

---

## Exemplo de Uso (Código)

```tsx
import { ModalGlobal, useModalLocal } from '@nucleo/modal-global'

const { aberto, abrir, fechar } = useModalLocal()

<ModalGlobal
  aberto={aberto}
  aoFechar={fechar}
  titulo="Editar Produto"
  subtitulo="Atualize os dados do produto"
  tamanho="lg"
  abas={[
    { id: 'dados', rotulo: 'Dados', conteudo: <FormDados /> },
  ]}
  tipoAbas="pill"
  botoes={[
    { rotulo: 'Cancelar', variante: 'ghost', ao_clicar: fechar },
    { rotulo: 'Salvar', variante: 'primary', ao_clicar: handleSalvar },
  ]}
/>
```
