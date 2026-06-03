# Seletor universal de visualizações (cross-produto)

> **SSOT** do padrão de pills no topo (Insights | Lista | Dashboard | Kanban — ou subconjunto) com troca de rota sem remount desnecessário.  
> Implementado em: **Pedido**, **BID Frete Internacional**, **Processo** (Lista | Kanban).  
> Testes transversais: escopo **`MBOTO`** — `testes/*/menu-botoes/seletor-universal-visoes/`.

---

## Objetivo

Trocar de visualização deve ser **rápida e estável**: mesma instância de layout/tabs, painéis com **keep-alive** após a primeira visita, **prefetch** no hover/focus das pills.

| Métrica | Meta | Onde medir |
|---------|------|------------|
| Troca de aba (UI) | **≤ 1000 ms** (cold + warm) | `TST-E2E-MBOTO-*` (Playwright) |
| API por rota | **≤ 200 ms p95** | [sla-metas](../../skills/governanca/lei/sla-metas/SKILL.md) + k6 |

> O SLA de **1 s** é meta de **produto/UI**. Não entra na lei de API (200 ms).

---

## Anatomia (Pedido — referência)

```text
PedidosVisualizacaoLayout (layout route + Outlet)
├── PedidosVisualizacaoTabs (pills + prefetch)
└── PedidosMultiView (keep-alive)
    ├── painel visao-geral → PedidosVisaoGeral
    ├── painel lista       → Pedidos
    ├── painel dashboard   → PedidosDashboard
    └── painel kanban      → PedidosKanban
```

**Rotas irmãs** no `App.tsx` apontam para o **mesmo elemento** `<PedidosMultiView />` (referência estável).

| Produto | Layout | MultiView | Prefetch |
|---------|--------|-----------|----------|
| Pedido | `PedidosVisualizacaoLayout` | `PedidosMultiView` | `pedidos-prefetch.ts` (+ React Query) |
| BID Frete Intl. | `BidFreteVisualizacaoLayout` | `BidFreteMultiView` | `bid-frete-prefetch.ts` (chunks) |
| Processo | `ProcessoVisualizacaoLayout` | `ProcessoMultiView` | `processo-prefetch.ts` (chunks) |

---

## `data-testid` (E2E)

| Elemento | testid |
|----------|--------|
| Pill Insights | `seletor-visao-tab-insights` |
| Pill Lista | `seletor-visao-tab-lista` |
| Pill Dashboard | `seletor-visao-tab-dashboard` |
| Pill Kanban | `seletor-visao-tab-kanban` |
| Painel ativo | `seletor-visao-painel-{insights\|lista\|dashboard\|kanban}` |
| Interativo | `seletor-visao-painel-pronto` |

Mapeamento versionado: `testes/testes-em-tela/menu-botoes/seletor-universal-visoes/QA-ENTREGA-MBOTO.md` + registry `TST-*-MBOTO-*`.

---

## Keep-alive

1. `visitados: Set<VisualizacaoId>` — painel só monta após **1ª visita**.
2. Painel inativo: `hidden` + `aria-hidden={true}` (não desmontar).
3. Insights (Pedido): `usePainelInsightsAtivo()` pausa canvas/rAF quando aba inativa.

---

## Prefetch (Pedido)

`prefetchVisualizacao()` em `pedidos-prefetch.ts`:

- Chunk lazy da página alvo.
- Se escopo hidratado: `visao-geral` / `kanban` → prefetch listar (`limit=1000`).
- `visao-geral` com **≥ 4 workspaces** → prefetch `GET /api/v1/pedidos/visao-geral/agregado`.

Doc da API agregada: [VISAO-GERAL-AGREGADO.md](../produtos-gravity/pedido/VISAO-GERAL-AGREGADO.md).

---

## Anti-padrões

❌ Envolver cada rota com `<Layout><Page /></Layout>` — remonta tabs e página inteira.  
❌ `useState({} as Entidade)` ou fallback silencioso em autorização.  
❌ E2E com seletores `.pvt-tab` / `.bft-tab` sem `data-testid`.  
❌ Misturar SLA 1 s de UI com SLA 200 ms de API na mesma métrica de alerta.

---

## Novo produto com seletor

Antes do merge:

1. Adotar `*VisualizacaoLayout` + `*MultiView` + pills com testids acima.
2. Registrar em `test-plans-registry.json` (escopo `MBOTO` + variantes por `produto_slug`).
3. Adicionar bloco E2E cold (≥ 6 passos, assert ≤ 1000 ms).
4. Ver [criar-produto — Passo 18](../../skills/processos/criar-produto/SKILL.md).

---

## Referências

- Convenção de IDs: [01-convencao-ids.md](../testes/regras/01-convencao-ids.md) (escopo `MBOTO`)
- Arquitetura de testes: [01-arquitetura-sistema-testes.md](../testes/tecnico/01-arquitetura-sistema-testes.md)
- Skills: `skills/produtos-gravity/pedido`, `bid-frete-internacional`, `processo`
