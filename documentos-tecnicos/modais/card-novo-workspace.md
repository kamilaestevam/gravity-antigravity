# Card Novo Workspace

Botão/card para criação de um novo workspace na tela Hub (`SelecionarWorkspace.tsx`). Aparece ao lado dos cards de workspace existentes, dentro do carrossel.

---

## Localização

- **Arquivo TSX:** `servicos-global/configurador/src/pages/SelecionarWorkspace.tsx`
- **Arquivo CSS:** `servicos-global/configurador/src/pages/selecionar-workspace.css`
- **Classe raiz:** `.sw-ws-add-card`

---

## Estrutura HTML

```tsx
<button className="sw-ws-add-card" type="button" onClick={handleCriarWorkspace}>
  <Plus size={20} />
  <span className="sw-ws-add-label">Criar novo workspace</span>
</button>
```

---

## Elementos e Estilos

### Container `.sw-ws-add-card`
| Propriedade | Valor |
|---|---|
| Elemento | `<button>` |
| Background | `transparent` |
| Border | `2px dashed rgba(255,255,255,0.22)` |
| Border radius | `var(--sw-r-xl)` |
| Display | `flex`, `flex-direction: column`, `align-items: center`, `justify-content: center` |
| Gap | `10px` (entre ícone e label) |
| Min height | `160px` |
| Padding | `0` |
| Cor padrão | `var(--sw-text-3)` |
| Cursor | `pointer` |
| Transition | `border-color 0.15s, color 0.15s, background 0.15s` |

### Estado: Hover `.sw-ws-add-card:hover`
| Propriedade | Valor |
|---|---|
| Border color | `rgba(79,99,255,0.35)` — roxo accent semi-transparente |
| Cor | `var(--sw-accent-2)` — azul accent mais claro |
| Background | `var(--sw-accent-dim)` — fill accent muito sutil |

### Ícone
| Propriedade | Valor |
|---|---|
| Componente | `<Plus size={20}>` — Phosphor Icons |
| Cor | Herda do container (`var(--sw-text-3)` → `var(--sw-accent-2)` no hover) |

### Label `.sw-ws-add-label`
| Propriedade | Valor |
|---|---|
| Texto | "Criar novo workspace" |
| Fonte | `13px`, `font-weight: 500` |
| Cor | Herda do container |

---

## Comportamento

- **Click:** Dispara `handleCriarWorkspace()` que abre o modal de criação (`ModalNovaOrganizacao`) ou navega para o fluxo de novo workspace
- **Posição:** Último item do carrossel `.sw-ws-grid`, após todos os cards de workspace existentes
- **Sem estados** `selected`, `favorited` ou `disabled` — é sempre um botão simples

---

## Variáveis CSS utilizadas

| Variável | Uso |
|---|---|
| `--sw-r-xl` | Border radius |
| `--sw-text-3` | Cor padrão do ícone e label |
| `--sw-accent-2` | Cor no hover |
| `--sw-accent-dim` | Background no hover |
