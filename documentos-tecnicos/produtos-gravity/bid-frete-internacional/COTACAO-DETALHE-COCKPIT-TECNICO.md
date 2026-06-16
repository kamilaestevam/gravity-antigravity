# Detalhe da cotação — Cockpit (Painel de Insights)

> **Tela:** `client/src/pages/cotacao-detalhe.tsx` · rota shell `/bid-frete/cotacoes/:id`  
> **CSS:** `client/src/pages/cotacao-detalhe-cockpit.css`  
> **Componente insights:** `client/src/shared/painel-fluxo-infograficos-cotacao-bid-frete-internacional.tsx`

---

## 1. Painel de Insights Inteligente

Bloco fixo no topo do cockpit (`InsightsGridFluxoCotacao`), acima das abas (Visão geral, Dados gerais, etc.).

| Status cotação | Banner / faixa no topo |
|----------------|------------------------|
| `RASCUNHO`, `EM_COTACAO`, `AGUARDANDO_APROVACAO`, … | `AvisoGraficosInsightsCotacao` — avisos «Comparativo visual quase pronto», rascunho, aguardando respostas |
| **`APROVADA`** | **`FaixaResumoAprovacaoInsightsCotacao`** — substitui o aviso comparativo |

**Regra UX:** com status `APROVADA`, **não** exibir o banner «Comparativo visual quase pronto» nem faixa duplicada na aba Visão geral (barra `dc-aprovado` removida).

Lógica do aviso: `montarConteudoAvisoGraficosInsights` retorna `null` quando `status === 'APROVADA'`.

---

## 2. Faixa de aprovação (`APROVADA`)

Classe CSS: `.dc-smart-faixa-aprovada` · grid 4 colunas (responsivo 2×2 / 1 col).

| Coluna (label UI) | Fonte de dados |
|-------------------|----------------|
| **Valor aprovado** | `valor_aprovado_ganho_bid_frete_internacional` + `moeda_aprovada` (fallback proposta `APROVADA`) |
| **Data da aprovação** | `data_aprovacao_cotacao_bid_frete_internacional` · `formatarDataBidFrete` |
| **Ganhador** | Proposta/fornecedor vencedor — `resolverNomeGanhadorCotacao` (ranking, proposta `APROVADA`, `id_fornecedor_vencedor_cotacao_bid_frete_internacional`) |
| **Quem aprovou** | `nome_usuario_aprovacao_ganho_bid_frete_internacional` (API) · fallback Configurador `/api/v1/usuarios` · usuário logado se `id` coincide |

Campos vazios exibem `—` (nunca omitir a coluna).

---

## 3. API — campos computados (somente leitura, não Prisma)

Enriquecimento na resposta JSON; **não** enviar no `PATCH` (lista em `CAMPOS_COTACAO_APENAS_CLIENTE` em `api.ts`).

| Campo resposta | Origem |
|----------------|--------|
| `id_usuario_aprovacao_ganho_bid_frete_internacional` | Último registro `ganho_bid_frete_internacional` da cotação (`id_usuario`) |
| `nome_usuario_aprovacao_ganho_bid_frete_internacional` | S2S Configurador `GET /api/v1/internal/gabi/usuarios/:id_usuario` · `resolver-nome-usuario-organizacao-bid-frete-internacional.ts` |

### Rotas

| Método | Rota | Quando preenche |
|--------|------|-----------------|
| GET | `/api/v1/bid-frete-internacional/cotacoes/:id_cotacao` | Se `status_cotacao_bid_frete_internacional === 'APROVADA'` |
| POST | `/api/v1/bid-frete-internacional/comparativo/:id_cotacao/aprovar` | Sempre na resposta pós-aprovação (`id` = header `x-id-usuario`) |

---

## 4. Arquivos principais

| Peça | Caminho |
|------|---------|
| Faixa UI | `FaixaResumoAprovacaoInsightsCotacao` em `painel-fluxo-infograficos-cotacao-bid-frete-internacional.tsx` |
| Helpers | `formatarMoedaInsightsBidFrete`, `resolverNomeGanhadorCotacao` em `infograficos-fluxo-cotacao-bid-frete-internacional.ts` |
| Resolver nome S2S | `server/src/lib/resolver-nome-usuario-organizacao-bid-frete-internacional.ts` |
| GET enriquecido | `server/src/routes/cotacoes.ts` |
| POST aprovar | `server/src/routes/comparativo.ts` |
| Map client | `mapCotacaoFromServer` em `client/src/shared/api.ts` |
| Teste UNI aviso | `testes/testes-unitarios/bid-frete-internacional/aviso-graficos-insights-cotacao.test.ts` |

---

## 5. Anti-padrões

- Duplicar faixa de aprovação na aba Visão geral (`dc-aprovado`).
- Exibir banner comparativo com 1 proposta quando status já é `APROVADA`.
- Persistir `id_usuario_aprovacao_*` / `nome_usuario_aprovacao_*` no Prisma — são agregados de leitura.
- Resolver «Quem aprovou» só no client sem enriquecer o GET (quebra para outros usuários da org).
