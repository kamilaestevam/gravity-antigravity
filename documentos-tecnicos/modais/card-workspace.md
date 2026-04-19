# Card Workspace

Componente de seleção de workspace na tela Hub (`SelecionarWorkspace.tsx`).

---

## Localização

- **Arquivo TSX:** `servicos-global/configurador/src/pages/SelecionarWorkspace.tsx`
- **Arquivo CSS:** `servicos-global/configurador/src/pages/selecionar-workspace.css`
- **Classe raiz:** `.sw-ws-card`

---

## Estrutura HTML

```tsx
<div
  className={`sw-ws-card${selecionado ? ' selected' : ''}${favorito ? ' favorited' : ''}`}
  onClick={() => handleSelectWs(ws.id)}
  role="button"
  tabIndex={0}
>
  {/* Área superior — logo centralizado */}
  <div className="sw-ws-card-top">
    <div
      className="sw-ws-logo"
      style={{ background: `linear-gradient(135deg, ${ws.gradientFrom} 0%, ${ws.gradientTo} 100%)` }}
    >
      {ws.iniciais}  {/* 2 letras maiúsculas, ex: "TE" */}
    </div>

    {/* Ações — posição absoluta canto superior direito */}
    <div className="sw-ws-card-top-actions">
      <button className="sw-ws-fav-btn">
        <Star size={14} weight="fill | regular" />
      </button>
      <div className="sw-ws-check">
        <Check size={12} color="white" weight="bold" />
      </div>
    </div>
  </div>

  {/* Nome e tipo de empresa — centralizados */}
  <div style={{ textAlign: 'center', marginTop: '-12px' }}>
    <div className="sw-ws-name">{ws.nome}</div>
    <div className="sw-ws-meta">
      <span className="sw-ws-role">{ws.role}</span>  {/* tipo_empresa do tenant */}
    </div>
  </div>

  {/* Estatísticas — centralizadas */}
  <div className="sw-ws-stats">
    <div>
      <div className="sw-ws-stat-n">{ws.modulos}</div>
      <div className="sw-ws-stat-l">Produtos</div>
    </div>
    <div>
      <div className="sw-ws-stat-n">{ws.membros}</div>
      <div className="sw-ws-stat-l">Usuários</div>
    </div>
  </div>

  {/* Botão de acesso — aparece no hover e no selected */}
  <button className="sw-ws-enter-btn">
    Entrar no Workspace <ArrowRight size={14} />
  </button>
</div>
```

---

## Elementos e Estilos

### Container `.sw-ws-card`
| Propriedade | Valor |
|---|---|
| Background | `var(--sw-surface)` |
| Border | `1.5px solid var(--sw-border)` — `rgba(255,255,255,0.06)` |
| Border radius | `var(--sw-r-xl)` |
| Padding | `20px 22px` |
| Display | `flex`, `flex-direction: column`, `gap: 16px` |
| Position | `relative` |
| Overflow | `hidden` |
| Transition | `border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s` |

### Linha decorativa topo `::before`
| Propriedade | Valor |
|---|---|
| Height | `1px` |
| Background | `linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)` |
| Position | `absolute`, `top: 0`, `left: 0`, `right: 0` |
| Transition | `background 0.2s` |

### Estado: Hover `:hover`
| Propriedade | Valor |
|---|---|
| Border color | `#818cf8` |
| Background | `rgba(79,99,255,0.07)` |
| Box shadow | `0 0 0 2px var(--sw-accent), 0 12px 40px rgba(79,99,255,0.28)` |
| `::before` | `linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)` |
| `::after` | `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,99,255,0.16) 0%, transparent 70%)` |

### Estado: Selecionado `.selected`
| Propriedade | Valor |
|---|---|
| Border color | `var(--sw-accent)` |
| Background | `var(--sw-surface-2)` |
| Box shadow | `0 0 0 1px var(--sw-accent), 0 8px 32px rgba(79,99,255,0.15)` |
| `::after` | `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,99,255,0.08) 0%, transparent 70%)` |

### Estado: Selecionado + Hover `.selected:hover`
| Propriedade | Valor |
|---|---|
| Border color | `#818cf8` |
| Background | `rgba(79,99,255,0.07)` |
| Box shadow | `0 0 0 2px var(--sw-accent), 0 12px 40px rgba(79,99,255,0.28)` |
| `::after` | `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,99,255,0.16) 0%, transparent 70%)` |

### Estado: Favoritado `.favorited`
| Propriedade | Valor |
|---|---|
| Border color | `rgba(245,158,11,0.3)` — âmbar |

---

### Logo `.sw-ws-logo`
| Propriedade | Valor |
|---|---|
| Tamanho | `44 × 44px` |
| Border radius | `12px` |
| Background | `linear-gradient(135deg, gradientFrom, gradientTo)` — dinâmico por índice |
| Fonte | `var(--sw-f-display)`, `14px`, `800`, `#fff` |
| Posicionamento | `margin-top: 16px` (desce 16px para espaçamento visual) |
| Conteúdo | 2 iniciais maiúsculas do nome do workspace |

### Ações `.sw-ws-card-top-actions`
| Propriedade | Valor |
|---|---|
| Position | `absolute`, `top: 14px`, `right: 14px` |
| Display | `flex`, `align-items: center`, `gap: 6px` |

### Botão Favorito `.sw-ws-fav-btn`
| Propriedade | Valor |
|---|---|
| Tamanho | `26 × 26px` |
| Border radius | `6px` |
| Ícone | `<Star size={14}>` — `fill` quando ativo, `regular` quando inativo |
| Cor padrão | `var(--sw-text-3)` |
| Opacity | `1` — sempre visível |
| Hover | Background `var(--sw-surface-3)`, cor `#f59e0b` (âmbar) |
| Ativo | Cor `#f59e0b` permanente |

### Check de seleção `.sw-ws-check`
| Propriedade | Valor |
|---|---|
| Tamanho | `22 × 22px`, `border-radius: 50%` |
| Ícone | `<Check size={12} color="white" weight="bold">` |
| Opacity | `0` padrão → `1` quando `.selected` com `background: var(--sw-accent)` |

### Nome `.sw-ws-name`
| Propriedade | Valor |
|---|---|
| Fonte | `var(--sw-f-display)`, `15px`, `700`, `var(--sw-text-1)` |
| Alinhamento | `text-align: center` |
| Margin bottom | `3px` |

### Subtítulo `.sw-ws-role` (Tipo de Empresa)
| Propriedade | Valor |
|---|---|
| Fonte | `11.5px`, `#CAD4E3` |
| Conteúdo | Valor de `tipo_empresa` do tenant (ex: "Importador") |

### Wrapper nome + subtítulo
| Propriedade | Valor |
|---|---|
| Style inline | `textAlign: 'center'`, `marginTop: '-12px'` |

### Stats `.sw-ws-stats`
| Propriedade | Valor |
|---|---|
| Display | `flex`, `gap: 16px`, `justify-content: center` |
| Separador | `border-top: 1px solid rgba(255,255,255,0.2)` |
| Padding top | `14px` |

### Número de stat `.sw-ws-stat-n`
| Propriedade | Valor |
|---|---|
| Fonte | `var(--sw-f-mono)`, `16px`, `500`, `var(--sw-text-1)` |
| Alinhamento | `text-align: center` |

### Label de stat `.sw-ws-stat-l`
| Propriedade | Valor |
|---|---|
| Fonte | `10px`, `#CAD4E3`, `uppercase`, `letter-spacing: 0.05em` |
| Alinhamento | `text-align: center` |
| Margin top | `2px` |

### Botão Entrar `.sw-ws-enter-btn`
| Propriedade | Valor |
|---|---|
| Background | `var(--sw-accent)` |
| Border radius | `var(--sw-r)` |
| Fonte | `var(--sw-f-body)`, `13px`, `600`, `#fff` |
| Padding | `9px` |
| Ícone | `<ArrowRight size={14}>` |
| Padrão | `opacity: 0`, `transform: translateY(4px)` — oculto |
| Visible | `.selected` ou `:hover` → `opacity: 1`, `transform: translateY(0)` |
| Hover | Background `var(--sw-accent-2)`, `box-shadow: 0 4px 12px rgba(79,99,255,0.35)` |

---

## Dados do Workspace (interface `Workspace`)

```typescript
interface Workspace {
  id: string
  nome: string          // Nome do workspace
  iniciais: string      // 2 letras maiúsculas para o logo
  role: string          // tipo_empresa do tenant (ex: "Importador")
  modulos: number       // Quantidade de produtos ativos
  membros: number       // Quantidade de usuários
  gradientFrom: string  // Cor inicial do gradiente do logo
  gradientTo: string    // Cor final do gradiente do logo
}
```

Os campos são populados a partir do endpoint `GET /api/v1/hub/init`:

| Campo | Fonte de dados |
|---|---|
| `role` | `data.tenant?.tipo_empresa` |
| `modulos` | Quantidade de produtos ativos retornados pelo hub/init |
| `membros` | Quantidade de usuários do workspace retornada pelo hub/init |

> **Nota Admin Panel:** No contexto do painel administrativo (`/admin/tenants`), o campo equivalente a `membros` é obtido via `_count.memberships` na query Prisma de `Company`, não pelo hub/init.

---

## Variáveis CSS utilizadas

| Variável | Uso |
|---|---|
| `--sw-surface` | Background padrão |
| `--sw-surface-2` | Background selected |
| `--sw-border` | `rgba(255,255,255,0.06)` — borda padrão |
| `--sw-border-hi` | `rgba(255,255,255,0.18)` — borda hover |
| `--sw-accent` | `#4f63ff` — cor principal |
| `--sw-accent-2` | Azul mais claro — hover do botão entrar |
| `--sw-r-xl` | Border radius grande do card |
| `--sw-r` | Border radius do botão |
| `--sw-f-display` | Fonte display (nome, logo) |
| `--sw-f-body` | Fonte corpo (botão) |
| `--sw-f-mono` | Fonte mono (números) |
| `--sw-text-1` | Cor texto principal |
| `--sw-text-3` | Cor texto terciário (ícones) |
