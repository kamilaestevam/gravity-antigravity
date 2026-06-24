# Configurador — Gravity Store

> Catálogo autenticado de produtos Gravity para exploração e contratação adicional pelo tenant.
> Skill associada: [`antigravity-configurador`](../../../skills/produtos-gravity/configurador/SKILL.md).
> Entregue em produção via PR #187 (2026-06).

---

## Visão geral

| Item | Valor |
|------|-------|
| Rota FE | `/store` |
| Página | `servicos-global/configurador/src/pages/Store.tsx` |
| CSS | `servicos-global/configurador/src/pages/hub-store.css` |
| Layout | `layout-centered` — container `.gs-store`, `max-width: 1280px` (ver [layout-e-margens.md](../../ux/criacao-telas/layout-e-margens.md)) |
| Auth | `<ProtectedRoute>` — usuário autenticado com `organizacao` em `/api/v1/me` |

A Gravity Store **não** é o catálogo público do Marketplace. São rotas distintas:

| Consumidor | Endpoint | Auth |
|------------|----------|------|
| **Gravity Store** (`/store`) | `GET /api/v1/produtos-gravity` | Sessão Clerk (tenant logado) |
| **Marketplace / prospecção** | `GET /api/v1/catalogo/produtos` | Sem auth |
| **Admin** | `GET /api/v1/admin/produtos-gravity` | `gravity_admin` / cadeia admin |

---

## Fonte da verdade (SSOT)

### Catálogo

1. **Banco:** tabela `ProdutoGravity` (Admin).
2. **Serviço:** `produtoGravityCatalogoServico.listarPublico()` — mesmo DTO do Admin, filtra publicados `ATIVO` + `EM_BREVE`.
3. **Rota:** `GET /api/v1/produtos-gravity` → `server/routes/produto-gravity.ts`.
4. **Contrato Zod (FE):** `storeCatalogoRespostaApiSchema` em `src/schemas/store-catalogo-api.ts`.

Nome e descrição exibidos nos cards vêm **da API primeiro**; i18n (`product-meta`) só complementa quando o Admin não envia texto (`nomeExibicaoProdutoGravity`, `descricaoExibicaoProdutoGravity`).

### Assinaturas da organização

`GET /api/v1/organizacoes/me/assinaturas` — validado com `storeAssinaturasRespostaSchema`. Cruza `slug_produto_gravity` + `ativo_configuracao_produto_gravity` para saber o que está contratado.

### Regras de status de exibição

Implementação: `src/data/status-produto-store.ts`.

| `StatusExibicaoProdutoStore` | Condição |
|------------------------------|----------|
| `contratado` | `status_produto_gravity = ATIVO` **e** assinatura ativa na org |
| `disponivel` | `ATIVO` **sem** assinatura ativa — pronto para contratar |
| `em_breve` | `status_produto_gravity = EM_BREVE` |
| `fora_catalogo` | Slug fora do catálogo publicado — peça roadmap no puzzle, sem card |

**Precedência:** status do Admin prevalece sobre assinatura legada. `EM_BREVE` nunca aparece como contratado ou disponível.

Contadores dos cards superiores e da toolbar usam `contarStatusCatalogoStore()` — mesma regra.

### Aliases de slug (puzzle ↔ banco)

Alguns slugs do puzzle (`STACK_ORDER` em `product-meta.tsx`) divergem do slug gravado no Admin:

| Puzzle / `PRODUCT_META` | Slug no banco |
|-------------------------|---------------|
| `smart-transito` | `smart-trnsito` |
| `catalogo-produto` | `catlogo-de-produtos` |

Mapeamento em `slugPuzzleParaCatalogo` / `slugCatalogoParaPuzzle` (`status-produto-store.ts`).

---

## Arquitetura da UI

```
┌─────────────────────────────────────────────────────────┐
│ Topbar (Logo, busca, notificações, idioma, usuário — Localizador oculto no Hub) │
├─────────────────────────────────────────────────────────┤
│ Cards de estatística (publicados / contratados / …)     │
├─────────────────────────────────────────────────────────┤
│ PUZZLE — só contratados + disponíveis (sem Em breve)    │
│   StorePuzzleRow + StorePuzzleCarousel                  │
├─────────────────────────────────────────────────────────┤
│ Toolbar segmentada: Todos | Ativo | Assinar | Em breve  │
│   (scroll suave → seção; IntersectionObserver sync)     │
├─────────────────────────────────────────────────────────┤
│ 4 faixas em carrossel (ordem fixa):                     │
│   1. Assinar  2. Ativo  3. Em breve  4. Todos           │
│   StoreCardsRows → StorePuzzleCarousel → StoreProductCard│
└─────────────────────────────────────────────────────────┘
```

### Componentes

| Arquivo | Papel |
|---------|-------|
| `store-puzzle-row.tsx` | Peças do puzzle (ícone, cor, status) |
| `store-puzzle-carousel.tsx` | Carrossel horizontal reutilizável (setas quando overflow) |
| `store-cards-rows.tsx` | Quatro faixas + filtro por linha (`LINHAS_STORE`) |
| `store-product-card.tsx` | Card `gs-card--store` (altura fixa ~204px, tags no rodapé) |
| `store-puzzle-order.ts` | Ordem do puzzle: `STACK_ORDER` + produtos novos do catálogo |

### Toolbar e faixas

| Segmento | `StoreLinhaKey` | Conteúdo |
|----------|-----------------|----------|
| Todos | `todos` | Catálogo filtrado (busca + categoria) |
| Ativo | `ativo` | `contratado` |
| Assinar | `assinar` | `disponivel` |
| Em breve | `em_breve` | `em_breve` |

Ordem visual das **faixas** (independente da ordem dos botões na toolbar): **Assinar → Ativo → Em breve → Todos**.

Cada faixa tem `id="store-linha-{key}"` para scroll e observação de visibilidade.

### Puzzle

- Inclui apenas produtos com status `contratado` ou `disponivel`.
- Produtos `em_breve` aparecem **somente** na faixa de carrossel correspondente.
- Ordem: `ordenarSlugsPuzzleStore()` — `STACK_ORDER` primeiro, depois itens do catálogo ainda não listados.

### Cards (`gs-card--store`)

- Altura uniforme; descrição em até 2 linhas.
- Tags de recurso (NCM, Impostos, etc.) no **rodapé** do card — sem bloco "Combina com".
- Alinhamento à esquerda; carrossel não adiciona recuo extra nas setas.
- Mesma classe reutilizada em **`Assinaturas.tsx`** (workspace `/configurador/assinaturas`).

### Ícones e cores

SSOT visual: `nucleo-global/Logo/produtos/src/visual-produto-gravity.tsx` + `icone-produto-gravity.tsx`, consumidos via `@nucleo/logo-produtos` e `metaProdutoStore()`.

---

## Reuso no HUB (`/hub`) — paridade puzzle (PR #404)

A faixa **Seus Produtos Gravity** do HUB unificado (`SelecionarWorkspace`) reutiliza o mesmo stack visual da Store — não duplicar markup/CSS de puzzle fora dos componentes abaixo.

| Item | Valor |
|------|-------|
| Página | `src/pages/SelecionarWorkspace.tsx` |
| CSS HUB | `src/pages/hub-unificado.css` |
| Grade contratados | `src/components/grade-produtos-contratados-hub.tsx` |
| Stack de peças | `src/components/puzzle-stack-produtos-gravity.tsx` |
| Carrossel | `StorePuzzleCarousel` (`store-puzzle-carousel.tsx`) — **mesmo** da Store |
| Classe layout | `gs-stack--hub-paridade-store` |

### Layout da faixa superior (pós-#404)

```
┌──────────────────────────────────────────────────────────────┐
│ HERO (saudação + meta)                                       │
├──────────────────────────────────────────────────────────────┤
│ Seus Produtos Gravity — largura total (1 coluna)             │
│   gs-stack__head: título + pill Gravity Store + meter barras │
│   StorePuzzleCarousel → PuzzleStackProdutosGravity           │
├──────────────────────────────────────────────────────────────┤
│ Operações em andamento · Gravity Store (faixa inferior; GABI oculta) │
└──────────────────────────────────────────────────────────────┘
```

- A faixa superior **não** divide mais 50/50 com painel **Workspaces** (`sw-hub-panel--ws` removido do JSX).
- Preferências de workspace por produto continuam no componente `preferencias-workspaces-por-produto-hub.tsx` (reintroduzir em outra seção só com decisão de produto).

### Regras visuais HUB (diferem da Store na peça SVG)

| Regra | Implementação |
|-------|----------------|
| Escala das peças | `--gs-piece-scale: 1` (Store puzzle ativos também 1.0; HUB não usa mais `0.8`) |
| Interior da peça | Preenchimento neutro (`--hub-puzzle-fill-interno` / `--hub-puzzle-fill-disponivel`); cor do produto só no **contorno** (`stroke`) quando `owned` |
| Ícones | `iconeOficialProdutoGravity` via `@nucleo/logo-produtos` — **22px** fixos (`.gs-piece__icon svg`) |
| Centralização óptica | `.gs-piece__body` ancorado no quadrado **120×90px** (não no SVG 138px com aba); `.gs-piece__stack` centralizado nessa área |
| Espaço subtítulo → puzzle | **4px** — `.gs-stack--hub-paridade-store .gs-stack__head { margin-bottom: 4px }` |
| Contador do meter | Mesma tipografia do subtítulo (`.gs-stack__sub`): `0.8125rem`, peso normal, `--sw-text-2`, sem `text-transform: uppercase` |
| Peça BID Fornecedor | Extra HUB (`pecasExtras`) inserida **logo após** `bid-frete` via `slugVisual` + `ordenarPecasPuzzleComExtrasHub`; factory `buildPecaHubBidFreteFornecedor` (`verificar-cotar-bid-frete-internacional.ts`); exibida só com permissão `visao_fornecedor:cotar` |
| Carrossel | `PuzzleStackProdutosGravity` com `embutidoParidadeStore` — cabeçalho/meter no pai (`GradeProdutosContratadosHub`) |
| Navegação contratado | `onAbrirProdutoContratado` no HUB; disponível sem assinatura → `/store` |

Props relevantes em `PuzzleStackProdutosGravity`: `escala="hub"`, `embutidoParidadeStore`, `ocultarMeterNoStack`.

Doc fluxo `/hub`: [FLUXO-POS-LOGIN.md](./FLUXO-POS-LOGIN.md).

---

## Permissão de contratação

`podeComprarNoStore(tipo_usuario)` em `src/routing/route-policy.ts`:

- **Pode contratar:** `MASTER`, `SUPER_ADMIN`, `ADMIN` (Cadeia 1).
- **Vê catálogo, botão desabilitado:** `STANDARD`, `FORNECEDOR`.

Contratação: `POST /api/v1/organizacoes/me/assinaturas/assinar-produto` (compartilhado com Assinaturas).

---

## Dívida técnica documentada (ainda no código, não no Admin)

Estes metadados **não** vêm do Prisma/Admin hoje:

| Metadado | Onde |
|----------|------|
| Ícones e cores por produto | `product-meta.tsx` + `visual-produto-gravity` |
| Categorias de filtro (`frete`, `cambio`, …) | `product-meta.tsx` → `categoryFilter` |
| Tags de recurso (`tagKeys`) | `product-meta.tsx` |
| Ordem base do puzzle | `STACK_ORDER` em `product-meta.tsx` |
| Relações "combina com" | `RELACAO_ENTRE_PRODUTOS_GRAVITY` (legado; UI removida) |

Evolução futura: campos no Admin `ProdutoGravity` — alteração de schema somente via Coordenador.

---

## Operação e recuperação

### Script de restauração

`server/scripts/restaurar-produtos-gravity-apagados.ts` — recria slugs apagados por `ensureMissingProducts` legado (hard-delete). Idempotente.

```bash
cd servicos-global/configurador
npx tsx --env-file=.env server/scripts/restaurar-produtos-gravity-apagados.ts        # dry-run
npx tsx --env-file=.env server/scripts/restaurar-produtos-gravity-apagados.ts --apply
```

### Restart após mudança de rota

```bash
npx pm2 restart cfg-back cfg-front
```

---

## Testes

Escopo **STORE** — pasta `testes/**/gravity-store/` (registry `TST-*-STORE-*`).

| Tipo | Pasta | Execução |
|------|-------|----------|
| Unitário | `testes/testes-unitarios/gravity-store/` | `npx vitest run --config testes/testes-unitarios/gravity-store/vitest.config.ts` |
| Funcional | `testes/testes-funcionais/gravity-store/` | `npx vitest run --config testes/testes-funcionais/gravity-store/vitest.config.ts` |
| Cross-org | `testes/testes-cross-organizacao/gravity-store/` | `npx vitest run --config testes/testes-cross-organizacao/gravity-store/vitest.config.ts` |
| E2E | `testes/testes-e2e/gravity-store/` | Plano `TST-E2E-STORE-000070` (aguarda dono) |
| Em tela | `testes/testes-em-tela/gravity-store/` | `npx tsx testes/testes-em-tela/gravity-store/run-gravity-store.ts` |

| ID | Cobertura |
|----|-----------|
| `TST-UNI-STORE-000064` | Regras de status, aliases, contadores |
| `TST-UNI-STORE-000065` | Alinhamento catálogo ↔ puzzle (13 produtos) |
| `TST-UNI-STORE-000066` | Zod `store-catalogo-api.ts` |
| `TST-UNI-STORE-000067` | Faixas carrossel `store-cards-rows.tsx` |
| `TST-FUN-STORE-000068` | POST `assinar-produto` |
| `TST-FUN-STORE-000069` | GET `/api/v1/produtos-gravity` |
| `TST-CRO-STORE-000071` | Isolamento org (scaffold `it.todo`) |
| `testes-unitarios/nucleo-global/logo-produtos/icone-produto-gravity.test.ts` | Ícones SSOT (`@nucleo/logo-produtos`) |

---

## Entregas recentes

| PR / entrega | Escopo |
|--------------|--------|
| #404 (2026-06-23) | HUB `/hub`: puzzle **Seus Produtos Gravity** com paridade Store (`StorePuzzleCarousel`, escala 1.0, ícones 22px, contorno colorido) — ver § Reuso no HUB |
| pós-#404 (2026-06-23) | Refinos HUB: espaço subtítulo→puzzle **4px**, contador alinhado ao subtítulo, **BID Fornecedor** ancorado após Bid Frete, centralização no quadrado 120px |

---

## Documentos relacionados

- [FLUXO-POS-LOGIN.md](./FLUXO-POS-LOGIN.md) — navegação pós-auth; layout do HUB unificado; "Voltar ao Hub" a partir de `/store`
- [layout-e-margens.md](../../ux/criacao-telas/layout-e-margens.md) — container `.gs-store`
- [rotas-convencao.md](../../arquitetura/rotas-convencao.md) — convenção `/store`
- Painel GABI no Hub: **não exposto** até reativar `EXIBIR_PAINEL_GABI_HUB` em `SelecionarWorkspace.tsx` (código preservado).
