# Documentação Visual — ModalSemSessoesGlobal

Variante simplificada do `ModalGlobal` — **sem suporte a abas/sessões**. Estrutura: Header → Body → Footer. Ideal para confirmações, alertas e formulários simples. Serve como base para `ModalFormularioGlobal`. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Configurações do componente: básico (título + body + footer), com footer customizado, e mobile bottom-sheet.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica: overlay fixed → dialog flex-column com **3 zonas apenas** (header → body → footer). Sem slot de abas — diferença do `ModalGlobal`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Body Padding Explícito** | `padding: 0 1.5rem 1.5rem 1.5rem` (esta é a diferença principal em relação ao ModalGlobal que tem padding neutro para tabelas bleed). |
| **Header Fixo** | `h2` de título + botão de fechar (2rem × 2rem). |
| **Layout 3-zonas** | Garante que nunca haverá uma quarta faixa (como as *tabs*). |

---

## 3. Composição de Ancoragem Global (Contexto)
Ancoragem viewport global (idêntica ao `ModalGlobal`).

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Centro do viewport do navegador (`align-items: center`). |
| **Z-Index** | `z-index: 1000` na classe `.mg-overlay`. |

---

## Diferença vs ModalGlobal

| Recurso | ModalGlobal | ModalSemSessoesGlobal |
| :--- | :---: | :---: |
| Header (título + subtítulo) | ✅ | ✅ |
| Body (children) | ✅ | ✅ |
| Footer (botões) | ✅ | ✅ |
| Abas (underline/pill) | ✅ | ❌ |
| Body padding explícito | ❌ | ✅ (`0 1.5rem 1.5rem`) |

---

## Exemplo de Uso (Código)

```tsx
import { ModalSemSessoesGlobal, useModalLocal } from '@nucleo/modal-sem-sessoes-global'

const { aberto, abrir, fechar } = useModalLocal()

<ModalSemSessoesGlobal
  aberto={aberto}
  aoFechar={fechar}
  titulo="Confirmar Exclusão"
  subtitulo="Esta ação não pode ser desfeita."
  tamanho="sm"
  botoes={[
    { rotulo: 'Cancelar', variante: 'ghost', ao_clicar: fechar },
    { rotulo: 'Excluir', variante: 'danger', ao_clicar: handleExcluir },
  ]}
>
  <p>Deseja realmente excluir o registro selecionado?</p>
</ModalSemSessoesGlobal>
```
