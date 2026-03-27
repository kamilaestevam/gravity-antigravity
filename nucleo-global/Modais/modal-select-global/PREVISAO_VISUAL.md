# Documentação Visual — ModalSelectGlobal

Bloco de seleção contextual para uso dentro de modais de formulário do Gravity Design System. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Layout do bloco: título com ícone, descrição, campo select com ação lateral e indicador de item selecionado (highlight verde).

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica do card de pick contextual, que quebra o formulário normal e usa um container delineado próprio. Medidas exatas do CSS.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Card Wrapper** | `border-radius: 12px`, `padding: 1.5rem`, container claro isolado das lines de formulário. |
| **Background** | `rgba(129,140,248,0.04)` baseando em tons `ws-surface` para dar destaque. |
| **Título Uppercase** | `font-size: 0.75rem` text-xs, `letter-spacing: 0.06em` com gap de ícone `8px`. |
| **Seleção Verde (Ativo)**| Quando um item realocar o select, um highlight de `10px 16px` em fundo esmeralda surge substituindo a select row para confirmação visual rápida. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento inline dentro de uma seção pesada do formulário ou body do ModalFormularioGlobal centralizado.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Fluxo inline do container pai, não quebra a ordem. Respeita grids. |
| **Margens Constantes** | Mantém gap fixo com as features acima/abaixo, isolando a interação pesada de seleção (ex: `margin-bottom: 20px`). |

---

## Anatomia do Componente

| Área | Medida / Valor |
| :--- | :--- |
| **Card Wrapper** | `border-radius: 12px`, padding luxuoso `1.5rem`, outline indigo subtil |
| **Título** | Textos estruturais para contextualizar o `Select` acoplado |
| **Row Flex** | `flex: 1` pro campo select (que cresce total) e shrink 0 pra ação adjacente (botão +Novo). |
| **Item Ativo** | Fallback visual (Card Verde de highlight) para dar lock na seleção após completa |

---

## Exemplo de Uso (Código)

```tsx
import { ModalSelectGlobal } from '@nucleo/modal-select-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { Buildings, Plus } from '@phosphor-icons/react'

<ModalSelectGlobal
  icone={<Buildings size={14} />}
  titulo="ORGANIZAÇÃO VINCULADA"
  descricao="Selecione a organização."
  labelContext="Organização"
  selectElement={
    <SelectGlobal
      valor={orgSelecionada}
      opcoes={organizacoes}
      aoMudarValor={setOrgSelecionada}
    />
  }
  botoesAcao={<BotaoGlobal icone={<Plus />}>Nova</BotaoGlobal>}
  itemAtivo={null} // Passa objeto completo quando finalizado
/>
```
