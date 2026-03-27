# Documentação Visual — LogoGlobal

Componente de marca unificado do Gravity Design System, responsável por manter a consistência do logotipo em todos os módulos e visualizações da plataforma. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Layout do componente em diferentes estados: logotipo completo, apenas ícone, versão com texto oculto, cores personalizadas e variantes de tamanho.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica do componente: medidas do ícone, espaçamentos padrão, tipografia personalizada e flexbox flow.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no Código (Real) |
| :--- | :--- |
| **Ícone (Marca)** | `Hexagon` (Phosphor, duotone), tamanho padrão `28px`. |
| **Gap (Ícone → Texto)** | `0.5rem` (~8px) entre o hexágono e a palavra "Gravity". |
| **Tipografia** | `font-weight: 700`, `letter-spacing: -0.02em` — tracking negativo premium. |
| **Cor Padrão** | `#818cf8` (indigo) ou herdado via `currentColor`. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento estratégico do componente nos diferentes contextos da aplicação (Sidebar, Auth, Marketplace).

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Menu Lateral (Sidebar)** | Ancora no TOPO-ESQUERDA. Fica `iconOnly` quando recolhida e completo quando expandida. |
| **Páginas de Autenticação** | Ancora no TOPO-CENTRO do formulário. Usa tamanho expandido (`iconSize={30}`). |
| **Marketplace (Navbar)** | Ancora à ESQUERDA na barra de navegação principal. |
| **Alinhamento Interno** | Flexbox com `align-items: center` para garantir base vertical entre ícone e texto. |

---

## Anatomia do Componente

| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Ícone (Marca)** | Hexagon (Phosphor Icons), estilo `duotone`. Default size: `28px`. |
| **Cor do Ícone** | Default: `#818cf8` ou herdado via `currentColor`. Personalizável via `iconColor`. |
| **Texto (Brand)** | "Gravity" com `font-weight: 700`, `letter-spacing: -0.02em`. |
| **Espaçamento (Gap)** | `0.5rem` (~8px) entre marca e texto. |
| **Modo iconOnly** | Remove o texto do DOM; útil para barras laterais minimizadas. |
| **Modo hideText** | Mantém o texto no DOM mas aplica `display: none`; útil para animações/acessibilidade. |

---

## Exemplo de Uso (Código)

```tsx
import { LogoGlobal } from '@nucleo/logo-global'

// 1. Logo Padrão (Tamanho 28px, Cor padrão indigo)
<LogoGlobal />

// 2. Apenas o Ícone (para Sidebar recolhida)
<LogoGlobal iconOnly iconSize={24} />

// 3. Versão Colorida Maior (para Tela de Login)
<LogoGlobal iconSize={36} iconColor="#10b981" />

// 4. No Cabecalho Global ou Barra de Navegação
<div className="flex items-center gap-4">
  <LogoGlobal iconColor="var(--ws-accent)" />
  <Title>Configurações</Title>
</div>
```
