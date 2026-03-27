# Documentação Visual — MenuLateralGlobal

Componente de navegação primária (sidebar) do Gravity Design System, projetado para alocação no lado esquerdo da aplicação com dois estados: Expandido e Recolhido. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Layout de navegação mostrando os estados *Expandido* (240px) e *Recolhido* (72px), incluindo item ativo, hover e toggle button.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica do componente, incluindo espaçamentos verticais, posicionamento do botão de alternância (toggle) e seções de informação de contexto. Medidas extraídas de `menu-lateral.css`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Largura Expandida** | `240px` (`min-width: 240px`) — comporta label + ícone. |
| **Largura Recolhida** | `72px` (`min-width: 72px`) — apenas ícone centralizado. |
| **Área do Logo** | Padding `36px 0.875rem 26px 1.25rem`. |
| **Botão Toggle** | `right: -13px`, `top: 138px` (expandido) / `top: 82px` (recolhido). |
| **Item Ativo** | `border-radius: 9999px` + `box-shadow` simula borda direita interna de destaque. |
| **Transição** | `0.3s` CSS transition na largura — expansão/retração suave. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento fixo lateral ocupando toda a altura da viewport, servindo como shell de navegação da aplicação.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | `top: 0`, estendendo-se por `height: 100vh` do viewport. |
| **Referência Horizontal (X)** | Posição fixa à esquerda do container flex principal. |
| **Z-Index** | `50` para sobrepor conteúdos rolantes do corpo da página. |
| **Scroll Oculto** | `::-webkit-scrollbar { width: 0px }` — rolagem invisível. |

---

## Anatomia do Componente

| Área | Medida / Comportamento |
| :--- | :--- |
| **Área do Logo** | Padding `36px 0.875rem 26px 1.25rem`, contém Hexágono + Chip do Módulo. |
| **Bloco do Tenant** | Avatar Organizacional + Nome + Plano. No recolhido, centraliza o avatar. |
| **Navegação (Itens)** | Items `border-radius: 9999px`, ícone esquerdo. Ativo usa `--mlg-accent` translúcido. |
| **Botão Toggle** | `right: -13px`, alternado entre `top: 138px` e `top: 82px`. |

---

## Exemplo de Uso (Código)

```tsx
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
import { Buildings, Users } from '@phosphor-icons/react'

const itensDeNavegacao = [
  { to: '/workspace/organizacao', label: 'Organização', icon: <Buildings size={18} /> },
  { to: '/workspace/usuarios', label: 'Usuários', icon: <Users size={18} /> }
]

<MenuLateralGlobal
  tenantName="Importes SA"
  tenantPlan="Profissional"
  navItems={itensDeNavegacao}
  moduleName="CONFIGURADOR"
  moduleColor="#818cf8"
  defaultCollapsed={false}
/>
```
