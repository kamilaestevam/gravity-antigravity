# Documentação Visual — UsuarioGlobal

Menu de perfil de usuário do Gravity Design System — pill compactado no cabeçalho com dropdown de ações (perfil, tema, acesso admin, sign-out). Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Detalhamento de todos os estados do componente: botão compactado padrão e em hover, e a carta flutuante do dropdown com controle de acesso, perfis administrativos e variação visual.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Blueprint técnico do container `ws-global-user` tipo pill com gap de `10px`, medidas exatas para cada fonte e espaçamento no avatar. Anatomia do `ws-profile-dropdown` com largura `280px`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Avatar** | `28×28px` (`width/height: 1.75rem`), `border-radius: 50%`. |
| **Gap do Trigger** | `10px` gap entre avatar e texto no pill. |
| **Largura do Dropdown** | `280px` — comporta nome, e-mail e ações completas. |
| **Offset do Dropdown** | `top: calc(100% + 8px)` — **8px** de flutuação abaixo do trigger. |
| **Z-Index do Dropdown** | `z-index: 1000` — sobrepõe tabelas e headers. |
| **Altura do Cabeçalho** | `74px` — alinhado com o `CabecalhoGlobal` e `MenuLateralGlobal`. |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento dentro da barra de ações globais superior: extremidade direita, `position: absolute; right: 0`.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Alinhado no topo (`top: 0`), `height: 74px`. |
| **Referência Horizontal (X)** | `position: absolute; right: 0` dentro de `ws-global-actions`. |
| **Z-Index do Dropdown** | `z-index: 1000` — sobrepõe tabelas e headers. |
| **Flutuação do Dropdown** | `top: calc(100% + 8px)` — 8px de espaço entre trigger e card. |

---

## Exemplo de Uso (Código)

```tsx
import { UsuarioGlobal } from '@nucleo/usuario-global'

<UsuarioGlobal
  userName="Daniel Martins"
  userEmail="daniel@gravity.com"
  userInitials="DM"
  userRole="Master"
  isLight={isLightMode}
  onToggleTheme={() => setLightMode(!isLightMode)}
  onNavigateOrganizacao={() => navigate('/workspace/dados')}
  onNavigateAssinaturas={() => navigate('/workspace/planos')}
  onSignOut={() => auth.signOut()}
  isAdmin={usuario.possuiCargoAdmin}
  onNavigateAdmin={() => window.location.assign('/admin/dashboard')}
/>
```
