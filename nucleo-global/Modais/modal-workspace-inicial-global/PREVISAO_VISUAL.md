# Documentação Visual — WorkspaceSelecaoGlobal (Modal Workspace Inicial)

Modal/página de seleção inicial de workspace com cards de empresa, avatar dinâmico, badge de plano e estado de seleção animado ("Entrando..."). Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Estados do componente: listagem inativa, hover (destaque indigo de foco), selecionando (fade roxo e CheckCircle spinner) e outros desabilitados após o clique primário.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica: botão flexbox horizontal complexo atuando como card interativo completo.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Avatar e Chip** | Ícone/Div `40×40px`, borderRadius 10px em cores parametrizáveis passadas via props `empresa.cor`. |
| **Badge de Planos** | Cores dinâmicas injetadas inline a partir de classes de background/texto baseadas na string Enterprise/Básico. |
| **Largura do Card** | Padding envolto restrito horizontalmente, ativando ellipsis (`text-overflow: ellipsis`) em nomes muito longos no Flex column de title/CNPJ. |
| **Hover / Fokus** | Borda animada `all 0.15s`. Cor transita para outline índigo sólido na intenção visual do User. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento dentro da página global autenticada, flutuando no eixo central primário em uma caixa branca/branca-densa.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Fluxo vertical (Stack) central num box restrito central. |
| **Referência Horizontal (X)** | Preenche horizontalmente as margens do Form pai. Width 100%. |
| **Sons de Seleção** | Ao ativar a opção principal, toda a lista abaixo restringe blur ou fade-out diminuindo contrastes para sinalizar lockdown de estado global e navegação ativa. |

---

## Anatomia do Componente

| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Wrapper `<button>`**| Foco de teclado tab-navigavel, com ids acessíveis.  |
| **Ícone Avatar** | `Buildings` (Phosphor, duotone, 18px), bg dinâmico |
| **Nome** | `fontWeight: 600`, truncate nativo |
| **Plano Pill** | Pill right-aligned (`margin-left: auto`) ou pós título |
| **Selecionando State** | Intervenção via React gerando ícone `CheckCircle` com background modificado na root do card. |

---

## Exemplo de Uso (Código)

```tsx
import { WorkspaceSelecaoGlobal, type Empresa } from '@nucleo/modal-workspace-inicial-global'

const empresas = [
  { id: '1', nome: 'Acme', cnpj: '...', plano: 'Enterprise', cor: '#818cf8' }
]

<div className="flex-column gap-3">
  {empresas.map(emp => (
    <WorkspaceSelecaoGlobal
      key={emp.id}
      empresa={emp}
      selecionando={selecionando === emp.id}
      onClick={() => handle(emp.id)}
      disabled={selecionando !== null}
    />
  ))}
</div>
```
