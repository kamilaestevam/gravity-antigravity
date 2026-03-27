# Documentação Visual — StatusSalvarGlobal

Indicador de estado de salvamento (idle → dirty → saving → success/error) com auto-reset. Componente inline que tipicamente vive ao lado do `BotoesSalvarGlobal`. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Detalhamento de todos os 5 estados visuais: idle, dirty, saving, success e error — com ícones, cores e textos padrão.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

| Estado | Ícone (Phosphor) | Texto Padrão | Comportamento |
| :--- | :--- | :--- | :--- |
| `idle` | `CloudCheck` duotone | "Salvo" | Oculto por padrão (`hideOnIdle: true`) |
| `dirty` | `Clock` duotone | "Alterações pendentes" | Visível enquanto há mudanças |
| `saving` | `CircleNotch` bold + spin | "Salvando..." | Animação de rotação via CSS |
| `success` | `CheckCircle` fill | "Salvo com sucesso" | Auto-reset após `autoResetMs` (padrão 3000ms) |
| `error` | `WarningCircle` fill | "Erro ao salvar" | Auto-reset após `autoResetMs` (padrão 3000ms) |

---

## 2. Blueprint: Layout de Composição
Blueprint técnico do componente inline com medidas, gaps, tamanhos de fonte e ícones. Medidas verificadas em `status-salvar.css`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no Código (Real) |
| :--- | :--- |
| **Tamanho do Ícone** | Todos os ícones têm `size={14}` — alinhados com a tipografia inline. |
| **Auto-Reset** | Timer interno de **3000ms** via `setTimeout` para success/error. |
| **Classe CSS** | `status-salvar-global status-salvar-global--{status}` (variante por estado). |

---

## 3. Composição de Ancoragem Global (Contexto)
Blueprint de posicionamento do status dentro de barras de ação, rodapés de formulário e cabeçalhos.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Display** | `inline-flex` — flui junto com outros elementos no rodapé da página. |
| **Posição Típica** | Ao lado esquerdo dos `BotoesSalvarGlobal` ou integrado ao `CabecalhoGlobal`. |
| **Auto-Reset** | Retorna a `idle` após **3000ms** (success/error) via timer interno. |
| **Hide on Idle** | Por padrão oculto quando `idle` (`hideOnIdle: true` — retorna `null`). |
| **Acessibilidade** | `aria-live="polite"` + `role="status"` — lido por screen readers. |

---

## Exemplo de Uso (Código)

```tsx
import { StatusSalvarGlobal } from '@nucleo/status-salvar-global'

<StatusSalvarGlobal
  status={statusAtual}
  autoResetMs={3000}
  onAutoReset={() => setStatus('idle')}
/>
```
