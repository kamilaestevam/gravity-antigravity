# Documentação Visual — TabelaGlobal 📊

Tabela de dados completa com busca global, filtros por coluna (texto/número/período), ordenação, seleção com checkboxes, linhas expandíveis, ações por linha, exportação e paginação.

---

## 🎨 Especificação Técnica de UX
Features do componente: toolbar com busca e badges, barra de chips de filtros, popover de filtro/ordenação por coluna, linha expandida, estado vazio e paginação.

![UX Specification](../assets/componentes/tabela-global/preview-estados.png)

---

## 🏗️ Anatomia e Layout
O container possui 4 zonas principais: toolbar → chips bar (condicional) → tabela scrollável (thead + tbody) → footer de paginação.

![Layout Anatomy](../assets/componentes/tabela-global/preview-layout.png)

---

## ⚓ Ancoragem e Contexto
Posicionamento padrão no corpo principal de uma `PaginaGlobal`, abaixo dos Stats Cards e botões de ação primária.

![Context Overview](../assets/componentes/tabela-global/preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Abaixo do `BotaoNovoGlobal`, gap **16px** vertical. |
| **Referência Horizontal (X)** | Largura **100%** da área útil do `PaginaGlobal`. |
| **Container** | `borderRadius: 12px`, `border: 1px solid var(--ws-accent-border)`, `overflow: hidden`. |

---

## 📑 Tabela de Propriedades Visuais (Design System)

### Container (`tg-container`)
| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Background** | `var(--ws-surface, #1e293b)` |
| **Borda** | `1px solid var(--ws-accent-border)` |
| **Border Radius** | `12px` |
| **Font Family** | `Plus Jakarta Sans` |

### Cabeçalho (`thead`)
| Propriedade | Valor / Descrição |
| :--- | :--- |
| **Padding** | `0.75rem 1rem` |
| **Fonte** | `0.6875rem`, `fontWeight: 700`, `letterSpacing: 0.07em` |
| **Background** | `rgba(129,140,248,0.04)` |

---

## 🔑 Propriedades Obrigatórias

Estas três props devem **sempre** ser passadas — TypeScript bloqueia o build se faltarem.

| Prop | Tipo | Descrição |
| :--- | :--- | :--- |
| `dados` | `T[]` | Array de itens a renderizar. |
| `colunas` | `TabelaGlobalColuna<T>[]` | Definição das colunas (chave, label, tipo, render). |
| `idKey` | `keyof T & string` | Campo **único** que identifica cada linha. Ex: `'id_workspace'`, `'id_usuario'`, `'codigo_ncm'`. |

> ⚠️ **Armadilha histórica corrigida em 2026-05-06:** `idKey` tinha default `"id"` silencioso. Quando o tipo `T` não tinha campo `id` (ex: `Workspace.id_workspace`), todas as linhas viravam `"undefined"` no Set de seleção — **clicar 1 checkbox marcava TODAS as linhas**. A prop é agora obrigatória em compile-time para prevenir esse bug.

---

## 💻 Exemplo de Implementação

```tsx
<TabelaGlobal<Workspace>
  idKey="id_workspace"          // OBRIGATÓRIO — campo único da linha
  dados={workspaces}
  colunas={colunas}
  acoes={acoes}
  renderExpandido={(ws) => <DetalheWorkspace workspace={ws} />}
/>
```
