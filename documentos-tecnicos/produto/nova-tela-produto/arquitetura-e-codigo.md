# Nova Tela de Produto — Arquitetura e Código

> Documento técnico de referência para criação, edição e manutenção de telas de produto no ecossistema Gravity.
> Referência canônica: `nucleo-global/Layout/tela-produto-global/demo/`

---

## 1. Dois Níveis de Código

O ecossistema Gravity separa código em dois níveis com comportamentos distintos:

### Nível 1 — Compartilhado (`nucleo-global/`)
Qualquer alteração aqui **propaga automaticamente** para todos os produtos que importam o componente. Nenhuma ação adicional é necessária nos produtos.

```
nucleo-global/
├── Layout/
│   ├── tela-produto-global/   ← Shell do layout (sidebar + topo + conteúdo)
│   ├── menu-lateral-global/   ← Menu lateral com logo e cor do produto
│   ├── menu-topo-global/      ← Menu superior com localizador e usuário
│   ├── card-global/           ← Componente de KPI card
│   └── localizador-global/    ← Breadcrumb de navegação do ecossistema
├── Feedback/
│   └── tooltip-global/        ← Tooltip padrão
└── Logo/
    └── produtos/              ← Registry de cor + logo por produto
```

### Nível 2 — Isolado por Produto (`produto/X/client/src/`)
Alterações aqui **nunca afetam** outros produtos. Cada produto é dono completo dos seus arquivos.

```
produto/X/client/src/
├── App.tsx                    ← Configuração do shell para este produto
├── shared/                    ← Lógica de domínio (cards, API, tipos)
└── pages/                     ← Telas do produto
```

### O Demo — Referência, Não Biblioteca
```
nucleo-global/Layout/tela-produto-global/demo/
```
O demo **não é importado** por nenhum produto. É o padrão visual e estrutural de referência. Quando um produto é criado, copia-se o padrão do demo. Após a cópia, os arquivos divergem livremente dentro de cada produto.

---

## 2. Registro de Produto — Pré-requisito Absoluto

**Arquivo:** `nucleo-global/Logo/produtos/src/produtos.tsx`

```ts
export const PRODUTO_META: Record<string, ProdutoMeta> = {
  'meu-produto': {
    icon:     <LogoMeuProduto size={16} />,   // SVG próprio em ./logos/
    color:    '#HEXCOR',                       // cor de destaque do produto
    sublabel: 'domínio · função',              // descrição curta
  },
  // ...outros produtos
}
```

Com esse registro, `TelaProdutoGlobal` aplica automaticamente:
- Cor no sidebar e menu topo
- Logo no sidebar e menu topo
- Cor no localizador do ecossistema

**Fallback seguro:** produto não registrado recebe LogoGravity + `#818cf8`.

---

## 3. Componente Shell — `TelaProdutoGlobal`

**Importação:** `@nucleo/tela-produto-global`

```tsx
<TelaProdutoGlobal
  productId="meu-produto"        // ← busca cor + logo automaticamente
  productName="Meu Produto"
  tenantName={currentUser.tenantName}
  tenantPlan="Pro"
  navItems={NAV_ITEMS}
  tooltipsDisabled={tooltipsDisabled}
  onToggleTooltips={toggleTooltips}
  localizador={{
    workspaceName: currentUser.tenantName,
    currentPageLabel: pageLabel,         // ← "Dashboard" / "Lista" / "Kanban"
    history,
    nodes: ECOSYSTEM_NODES,
    onNavigate: (node) => { ... },
  }}
  usuario={{
    userName, userEmail, userInitials, userRole,
    isLight: currentTheme === 'light',
    onToggleTheme, onNavigateWorkspace,
    onNavigateMarketPlace, onSignOut,
  }}
>
  {/* Conteúdo da página — routes */}
</TelaProdutoGlobal>
```

**Responsabilidades do shell (automáticas):**
- Sidebar com collapse/expand
- Título do topo muda para nome do produto quando sidebar colapsa
- Menu topo com tooltips, localizador, usuário, tema
- Área de conteúdo com scroll independente

---

## 4. Título da Página — Convenção Obrigatória

O título exibido no topo sempre reflete a **view atual**:

```ts
// Fora do componente — evita TDZ (Temporal Dead Zone)
const ROUTE_LABELS: Record<string, string> = {
  'dashboard':     'Dashboard',
  'lista':         'Lista',
  'kanban':        'Kanban',
  'configuracoes': 'Configurações',
  // rotas específicas do produto:
  'nova':          'Nova Estimativa',
  'importar':      'Importar',
}

// Dentro do componente
const routeSeg  = location.pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
const pageLabel = ROUTE_LABELS[routeSeg] ?? routeSeg.charAt(0).toUpperCase() + routeSeg.slice(1)
```

**Regra:** sempre primeira letra maiúscula. Nunca o nome do produto como título (esse papel é do topo quando o menu está colapsado).

---

## 5. Sistema de Cards Configuráveis

### 5.1 Catálogo (`shared/cardCatalog.ts`)
Define todas as métricas disponíveis para o produto:

```ts
export const CARDS_CATALOGO: CardDefinicao[] = [
  { id: 'total', label: 'Total', descricao: 'Total de registros', tipoAgg: 'Contagem' },
  // métricas reais do domínio...
]

export const CARDS_PADRAO = ['total', 'ativos', 'concluidos', 'valor_total']
// IDs exibidos na primeira vez (máx. 4 recomendado)
```

### 5.2 Preferências (`shared/useCardPreferences.ts`)
Gerencia ordem, visibilidade e catálogo no localStorage:

```ts
// OBRIGATÓRIO: prefixo único do produto
const STORAGE_KEY = 'X:cards-v1'      // substitua X pelo id do produto
const SYNC_EVENT  = 'X:cards-updated'
```

Retorna: `{ prefs, visiveis, disponiveis, adicionar, remover, toggle, reordenar, resetar }`

### 5.3 Valores (`shared/useCardValues.ts`)
Mapeia os KPIs da API para display:

```ts
export function computeCardValues(kpis: ProdutoKpis): Record<string, CardValor> {
  return {
    total: {
      valor: kpis.total,
      subtexto: `${kpis.ativos} ativos`,
      tooltip: <...>,
    },
    // uma entrada por card do catálogo
  }
}

export function useCardValues(kpis: ProdutoKpis): Record<string, CardValor> {
  return useMemo(() => computeCardValues(kpis), [kpis])
}
```

### 5.4 Dashboard (`pages/dashboard/Dashboard.tsx`)

```tsx
export default function Dashboard() {
  const [kpis, setKpis] = useState<ProdutoKpis>(valorInicial)
  const { visiveis } = useCardPreferences()
  const valores      = useCardValues(kpis)

  // Uma única chamada à API — sem loop por card
  const carregar = useCallback(async () => {
    try { setKpis(await getProdutoKpis()) }
    catch { /* mantém zeros */ }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="X-db-page">
      <div className="X-db-cards">
        {visiveis.map(pref => {
          const v = valores[pref.id]
          if (!v) return null
          return <CardBasicoGlobal key={pref.id} ... />
        })}
      </div>
    </div>
  )
}
```

**Performance:** O(1) por card. `computeCardValues` roda uma vez via `useMemo`. Nunca iterar pela API dentro do `.map()`.

### 5.5 CSS do Dashboard
```css
/*
 * Prefixo: abreviação do produto
 *   demo          → .demo-db-page
 *   simula-custo  → .sc-db-page
 *   nf-importacao → .nf-db-page
 *   lpco          → .lpco-db-page
 */
.X-db-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 2rem 1.5rem;   /* ← idêntico em todos os produtos */
  min-height: 0;
  flex: 1;
}

.X-db-cards {
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 6px;
}

.X-db-cards .cg-card {
  flex: 1;
  min-width: 220px;
  max-width: 320px;
  width: auto;                   /* cancela width: 240px fixo do nucleo */
}
```

---

## 6. Tela de Configurações

### 6.1 Estrutura de seções
```
Configurações
├── [sidebar]
│   ├── Cards        ← ativo
│   ├── Tabela       ← em breve
│   ├── Notificações ← em breve
│   └── Exportação   ← em breve
└── [conteúdo]
    ├── Período de comparação  ← pills 7d/30d/6m/1a/Tudo
    ├── Meus cards             ← DnD + toggle + restaurar
    └── Métricas disponíveis   ← catálogo com botão +
```

### 6.2 Período de comparação
```ts
const PERIODO_KEY = 'X:periodo-comparacao'    // prefixo do produto

const [periodo, setPeriodo] = useState<PeriodoId>(
  () => (localStorage.getItem(PERIODO_KEY) as PeriodoId) ?? '30d'
)
```

### 6.3 CSS das seções — padrão idêntico entre produtos
```css
.cfg-secao {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.07));
}
.cfg-secao:last-child { border-bottom: none; }
```

---

## 7. `vite.config.ts` — Aliases Obrigatórios

```ts
const monoRoot = path.resolve(__dirname, '../../..')    // ajustar profundidade
const nucleo   = (sub: string) => path.resolve(monoRoot, `nucleo-global/${sub}`)

alias: {
  '@nucleo/tela-produto-global':  nucleo('Layout/tela-produto-global/src/index.ts'),
  '@nucleo/menu-topo-global':     nucleo('Layout/menu-topo-global/src/index.ts'),
  '@nucleo/menu-lateral-global':  nucleo('Layout/menu-lateral-global/src/index.ts'),
  '@nucleo/card-global':          nucleo('Layout/card-global/src/index.ts'),
  '@nucleo/tooltip-global':       nucleo('Feedback/tooltip-global/src/index.ts'),
  '@nucleo/localizador-global':   nucleo('Layout/localizador-global/src/index.ts'),
  '@nucleo/logo-produtos':        nucleo('Logo/produtos/src/index.ts'),
  // + demais componentes que o produto usar
  '@gravity/shell': path.resolve(monoRoot, 'servicos-global/shell/index.ts'),
}
```

---

## 8. Propagação de Mudanças — Fluxograma de Decisão

```
Nova feature ou correção
│
├── Faz sentido em TODOS os produtos?
│   ├── SIM → editar em nucleo-global/ → propagação automática
│   └── NÃO → editar em produto/X/client/src/ → só X é afetado
│
├── É novo padrão de tela?
│   ├── 1. Atualizar demo/ com o padrão
│   ├── 2. Replicar manualmente nos produtos que precisam
│   └── 3. Produtos que não precisam → não são tocados
│
└── É bug visual?
    ├── Afeta todos os produtos → nucleo-global/
    └── Afeta só um produto    → produto/X/
```

---

## 9. Regras de Código — Lista de Verificação

| Regra | ✅ Correto | ❌ Proibido |
|---|---|---|
| Imports de UI | `@nucleo/card-global` | `../../pedido/src/components/Card` |
| Imports cross-produto | — | `import x from '@produto/simula-custo'` |
| Storage keys | `'nf:cards-v1'` | `'cards-v1'` |
| Cores CSS | `var(--ws-accent)` | `#34d399` hardcoded em CSS compartilhado |
| TypeScript | `strict: true`, sem `any` | `@ts-ignore`, `any` explícito |
| API calls | `async/await` com try/catch | Sem tratamento de erro |
| Performance cards | `useMemo` + O(1) lookup | Iteração da API dentro do `.map()` |
| Arquivos | `.tsx` e `.ts` | `.js` ou `.jsx` |

---

## 10. Portas de Desenvolvimento

| Produto | Porta Client | Porta Server |
|---|---|---|
| Demo (padrão) | 5200 | — |
| SimulaCusto | 5180 | 8020 |
| Pedido | 5179 | — |
| Bid Câmbio | 5002 | — |
| LPCO | 5182 | 8027 |
| NF Importação | 5183 | 8028 |
| Processo | 5000 | — |
| Financeiro COMEX | 5184 | — |
| Bid Frete | 5181 | — |
