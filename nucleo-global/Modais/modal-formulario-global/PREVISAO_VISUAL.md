# Documentação Visual — ModalFormularioGlobal

Modal padrão de formulário (sem abas) do Gravity Design System. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Layout do modal com cabeçalho personalizado, corpo rolável com seções e rodapé tri-zona.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica do modal: padding do cabeçalho, altura padrão, footer bilateral e sub-componente SecaoFormularioGlobal. Medidas alinhadas ao padrão UX 10 do sistema.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Tamanho Fixo Horizontal** | `lg` por padrão (representa `720px` no layout geral). |
| **Altura Fixo Vertical** | Altura padrão `680px` (prop `altura`), força o scroll no `.mg-body`. |
| **Padding do Header** | `padding: 1.5rem 3.5rem 1rem 1.5rem`, `border-bottom: 1px solid var(--ws-accent-border)`. |
| **Margem do Corpo** | `margin-bottom: 1.5rem` do cabeçalho. |
| **Rodapé Bilateral** | Flexbox distribuído (`justify-content: space-between`). Esquerda: Excluir. Direita: Ações neutras/positivas com indicador `StatusSalvarGlobal`. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento de sobreposição central com backdrop escuro herdado de `ModalSemSessoesGlobal`.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Centro do viewport flex. |
| **Referência Horizontal (X)** | Centro do viewport flex. |
| **Stack Global** | Fica num `z-index` altíssimo e restringe overflow global. |

---

## Anatomia do Componente

| Área | Medida / Valor |
| :--- | :--- |
| **Cabeçalho** | Via `CabecalhoGlobal` com margens neutralizadas |
| **Corpo (Body)** | Área rolável com children |
| **Rodapé** | Layout bilateral: Excluir vs Cancelar + Status + Salvar |

---

## Sub-componente: SecaoFormularioGlobal

| Propriedade | Valor |
| :--- | :--- |
| **Classe CSS** | `ws-section-title` |
| **Layout** | Flex horizontal: ícone (cor `var(--ws-accent)`) + título, `gap: 6px` |
| **Margem Inferior** | `1rem` (configurável via `marginBottom`) |

---

## Exemplo de Uso (Código)

```tsx
import { ModalFormularioGlobal, SecaoFormularioGlobal } from '@nucleo/modal-formulario-global'
import { Buildings, Globe } from '@phosphor-icons/react'

<ModalFormularioGlobal
  aberto={editarAberto}
  aoFechar={() => setEditarAberto(false)}
  aoSalvar={handleSalvar}
  aoExcluir={handleExcluir}
  icone={<Buildings size={20} />}
  titulo="Acme Importações"
  subtitulo="Edite as informações e configurações"
  dirty={formDirty}
  podesSalvar={formValido}
>
  <SecaoFormularioGlobal icone={<Globe size={14} />} titulo="ACESSO E WEB" />
  {/* Campos do formulário... */}
</ModalFormularioGlobal>
```
