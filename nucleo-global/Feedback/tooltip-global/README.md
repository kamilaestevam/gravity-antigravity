# @nucleo/tooltip-global

Componente de tooltip unificado da plataforma Gravity.  
Renderiza um card minimalista via `ReactDOM.createPortal` com posicionamento automático acima ou abaixo do elemento-alvo.

---

## ⚠️ Antes de escrever qualquer tooltip

**Leia a skill de escrita:** [`skills/ux/tooltip/SKILL.md`](../../../../skills/ux/tooltip/SKILL.md)

Ela define as regras exatas de tom, tamanho e conteúdo para que as tooltips da plataforma sejam consistentes e úteis ao usuário final.

**Resumo das regras:**
- Sem ponto final na `descricao`
- Linguagem do usuário, nunca do desenvolvedor
- Máximo ~90 caracteres na `descricao`
- A `descricao` responde: *"o que esse campo faz pela minha empresa?"*

---

## Uso

```tsx
import { TooltipGlobal } from '@nucleo/tooltip-global'

<TooltipGlobal
  titulo="Nome do Campo"
  descricao="O que esse dado representa para o usuário"
>
  <label>Nome do Campo</label>
</TooltipGlobal>
```

## Props

| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `titulo` | `string` | Não | Título em negrito no card |
| `descricao` | `string` | Sim | Texto explicativo — seguir skill de escrita |
| `children` | `ReactNode` | Sim | Elemento que dispara o hover |

## Comportamento

- Aparece **acima** do elemento quando há espaço (> 80px)
- Aparece **abaixo** quando está próximo ao topo da tela
- Centralizado horizontalmente sobre o elemento-alvo
- Renderizado no `document.body` via portal — nunca é cortado por `overflow: hidden`
- Desaparece ao tirar o mouse (`onMouseLeave`)
