# Documentação Visual — ModalFormularioAbasGlobal

Este é o **Modal Principal Definitivo** do Gravity Design System. Ele consolida o padrão "UX 10" para todos os modais de criação/edição pesada do sistema. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Estrutura e Composição (Visual)
Organiza dados robustos em múltiplas abas horizontais com navegação constante e persistência fluida.

![Composição Visual do Modal de Abas](./real-preview-estados.png)

---

## 2. Blueprint de Layout (Specs)
Estrutura técnica construída focando na imutabilidade do `Header` e `Footer`.

![Blueprint: Estrutura, Altura e Rodapé Fixado](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Tamanho (Largura)** | Padrão `lg` (`720px`). Variável via prop `tamanho`. |
| **Altura Travada** | Padrão `680px`. Fixo para garantir que o rodapé nunca saia da tela. |
| **Composição 4-Zonas** | O modal é construído com quatro flex zones: Cabecalho + Abas + Body + RodaPe. Os três periféricos não flexionam; o Body absorve todo o espaço e gerencia scroll vertical. |

---

## 3. Composição de Ancoragem Global (Contexto)
Comandos fixos e layout ancorado, evitando redimensionamento brusco conforme se navega entre abas longas e curtas.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Rodapé Inteligente** | Excluir na ponta esquerda. Salvar + Status Salvar na direita. |
| **Scroll Interno** | `flex: 1`, `overflow-y: auto`. Protege os CTAs primários de saída de view. |

---

## Notas de Comportamento (UX/Interação)

- **Scroll Interno Protegido:** O design deste modal garante que o botão de "Salvar" no rodapé esteja **sempre visível**.
- **Rodapé Inteligente:** O rodapé embute nativamente o `StatusSalvarGlobal`.
- **Botão Excluir:** Se a prop `aoExcluir` for passada, surge na extrema esquerda.

---

## Exemplo de Uso (Código)

```tsx
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { HardDrives } from '@phosphor-icons/react'
import { useState } from 'react'

export function GestaoProdutoModal() {
  const [aberto, setAberto] = useState(false);

  return (
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={() => setAberto(false)}
      titulo="Novo Produto"
      subtitulo="Preencha os dados."
      icone={<HardDrives size={24} />}
      abas={[
        { id: 'geral', rotulo: 'Básico', conteudo: <FormularioBasicoProjeto /> }
      ]}
      textoSalvar="Criar"
    />
  )
}
```

> [!CAUTION]
> **Adoção Exclusiva:** **Todos** os fluxos de criação no sistema devem usar o `ModalFormularioAbasGlobal`. Se o modal for simples e não precisar de abas, crie apenas uma aba de nome "Geral" para manter a estrutura coerente com o restante de UX 10.
