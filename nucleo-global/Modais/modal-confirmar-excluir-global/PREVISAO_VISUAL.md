# Documentação Visual — SelecaoExcluirGlobal

Modal de confirmação de ações destrutivas (Exclusão) do Gravity Design System. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Layout do modal centralizado: ícone de alerta, título, descrição, card do item afetado e botões de ação bilaterais.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica do modal de exclusão com medidas, gradientes e dimensões exatas de `.selecao-excluir-container`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Ícone de Alerta** | Div redonda de **56px**, anel externo com fundo `rgba(239,68,68,0.15)`. Ícone Trash size `28px`. |
| **Paddings Internos** | Body generoso com textos grandes para clareza destrutiva. |
| **Card Destino** | `padding: 0.75rem 1rem`, `border-radius: 8px` e outline sutil vermelho em `rgba(239,68,68,0.2)`. |
| **Botões Simétricos** | Botões com largura pareada para peso semântico igual na exclusão. |
| **Botão Danger** | Gradiente linear do vermelho 500 ao 600, ícone `Trash` e focus ring agressivo de outline vermelho escuro. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento de sobreposição central ancorado via stack modal e focus-trap global.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Centro do viewport (`align-items: center` do ModalGlobal pai). |
| **Referência Horizontal (X)** | Centro do viewport (`justify-content: center`). |
| **Propagação Eventos** | Ação suspende overlays abaixo mas isola eventos (blur background de **4px** no `.mg-overlay`). |

---

## Anatomia do Componente

| Área | Medida / Valor |
| :--- | :--- |
| **Ícone de Alerta** | Círculo de **56px**, fundo vermelho translúcido, ícone Trash Bold. |
| **Título** | `font-size: 1.125rem`, `font-weight: 700`, cor primária |
| **Descrição** | `font-size: 0.875rem`, cor secundária, `max-width: 480px` |
| **Card do Item** | `padding: 0.75rem 1rem`, `border-radius: 8px`, borda customizada |
| **Botão Cancelar** | Fundo neutro ghost, interage com cancelamento. |
| **Botão Excluir** | Variante `danger` explícita. Opcionalmente passa a `loading` spinner. |

---

## Exemplo de Uso (Código)

```tsx
import { SelecaoExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'

<SelecaoExcluirGlobal
  aberto={confirmarExclusao}
  titulo="Excluir Espaço de Trabalho?"
  descricao="Esta ação é irreversível."
  nomeItem="Acme Importações"
  aoConfirmar={handleExcluir}
  aoCancelar={() => setConfirmarExclusao(false)}
/>
```
