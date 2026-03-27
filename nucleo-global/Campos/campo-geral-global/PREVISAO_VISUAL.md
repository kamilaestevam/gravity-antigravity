# Documentação Visual — GeralCampoGlobal

Componente-base (wrapper) que envolve todos os campos de formulário do Gravity Design System. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Estados do componente: campo padrão, campo obrigatório (*), campo com tooltip de ajuda e campo composto (children). 

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica: stack vertical com label no topo e slot de children abaixo. Verificação milimétrica dos espaçamentos definidos em `campo.css`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Gap entre Campos** | **16px** (gap-4) de espaçamento vertical garantido entre instâncias consecutivas. |
| **Padding do Wrapper** | O componente não possui padding interno próprio, herdando a contenção do formulário pai (**24px**). |
| **Altura do Label** | Fonte pequena com uppercase e `line-height: normal` aproximado de **18px**. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento do wrapper dentro de formulários reais na interface Gravity Shell (ex: Painel de Organização).

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Fluxo vertical natural do formulário (empilhamento de blocos `.ws-field`). |
| **Referência Horizontal (X)** | Largura **100%** do container pai flexível. |
| **Margem Interna** | Respeitar o padding do formulário pai: **24px** (p-6). |

---

## Anatomia do Componente

| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Classe CSS** | `ws-field` |
| **Label** | Texto uppercase com fonte pequena, opcional |
| **Obrigatório** | Adiciona `*` em vermelho ao final do label |
| **Tooltip** | Envolve o label com `TooltipGlobal` quando `tooltipTitulo` e `tooltipDescricao` são definidos |
| **Children** | Slot genérico para qualquer input, select, calendário ou componente customizado |

---

## Exemplo de Uso (Código)

```tsx
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'

<GeralCampoGlobal
  label="Nome da Empresa"
  obrigatorio
  tooltipTitulo="Razão Social"
  tooltipDescricao="Informe o nome oficial da empresa conforme CNPJ."
>
  <input type="text" placeholder="Ex: Acme Importações" />
</GeralCampoGlobal>
```
