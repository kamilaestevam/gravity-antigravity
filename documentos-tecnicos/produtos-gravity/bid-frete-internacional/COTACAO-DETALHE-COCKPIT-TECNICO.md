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
| Teste UNI aviso | `testes/testes-unitarios/produto-gravity/bid-frete-internacional/aviso-graficos-insights-cotacao.test.ts` |

---

## 5. Aba Propostas — detalhamento completo da proposta (TASK-000313)

Paridade visual com o portal do agente (`VALOR TOTAL DO FRETE`: Frete Base, Taxas Origem, Taxas Destino, Valor Total).

| Contexto | Comportamento |
|----------|---------------|
| Card combate (`variante="combate"`) | Após `GradeColocacaoEixosCombate`, renderiza `TabelaResumoPropostaReadonlyBidFreteInternacional` |
| 1 proposta na cotação | Tabela sempre visível |
| 2+ propostas | Botão **Ver detalhamento completo** / **Recolher detalhamento** (`colapsavel={propostasTodas.length >= 2}`) |
| Modal **Aprovar proposta** | Mesma tabela read-only substitui o grid legado de subtotais |

### SSOT de UI

| Peça | Caminho |
|------|---------|
| Tabela editável (portal agente) | `TabelaResumoPropostaBidFreteInternacional` em `resumo-composicao-total-frete-bid-frete-internacional.tsx` |
| Wrapper read-only (comprador) | `tabela-resumo-proposta-readonly-bid-frete-internacional.tsx` |
| Montagem de linhas a partir da proposta | `montarDadosTabelaResumoPropostaBidFreteInternacional` em `taxas-linha-proposta-bid-frete-internacional.ts` |
| Wiring aba Propostas | `propostas-detalhe-cotacao-bid-frete-internacional.tsx` |
| Modal aprovar | `modal-aprovar-proposta-bid-frete-internacional.tsx` |
| CSS cockpit | `cotacao-detalhe-cockpit.css` — classes `.dc-prop-tabela-resumo*` |
| CSS tabela (compartilhado portal) | `formulario-resposta-cotacao-bid-frete-internacional.css` — `.brc-tabela-resumo-estimado-brl*` |

**Fonte de dados:** `taxas_origem[]` e `taxas_destino[]` já presentes na proposta enriquecida pelo ranking (`motor-comparativo-bid-frete-internacional.ts`). Não inventar linhas no client — usar o helper SSOT.

### Estimativa em BRL (por moeda)

Abaixo de cada valor monetário, linha secundária `≈ R$ …` quando há taxa disponível.

| Prioridade | Fonte |
|------------|-------|
| 1 | Taxa manual do produto — `localStorage` `bid-frete:config:taxa-cambio` (`lerTaxasCambioConfigBidFreteInternacional`) |
| 2 | PTAX venda — `GET /api/v1/taxas-moeda` via `buscarTaxasMoedaAtuaisInsights` |
| Ausência de taxa | Omite a linha estimada (totais por coluna só somam moedas convertidas) |

Conversão **por moeda de origem** (USD→BRL, EUR→BRL separados); totais em reais **não** implicam câmbio cruzado entre moedas estrangeiras.

Helpers: `conversao-estimada-brl-proposta-bid-frete-internacional.ts`, `montarMapaTaxaParaBrl` em `taxas-cambio-insights-bid-frete-internacional.ts`.

**Testes UNI:** `conversao-estimada-brl-proposta.test.ts`, `visao-fornecedor/taxas-linha-proposta-bid-frete-internacional.test.ts` (caso `montarDadosTabelaResumoPropostaBidFreteInternacional`).

---

## 7. Termômetro histórico

Card no grid do Painel de Insights (`CardTermometroHistoricoSmart`). Regras de matching, faixas, componente de preço e Dele vs Mercado: **[TERMOMETRO-HISTORICO-COCKPIT-TECNICO.md](./TERMOMETRO-HISTORICO-COCKPIT-TECNICO.md)** (SSOT).

---

## 8. Anti-padrões

- Duplicar faixa de aprovação na aba Visão geral (`dc-aprovado`).
- Exibir banner comparativo com 1 proposta quando status já é `APROVADA`.
- Persistir `id_usuario_aprovacao_*` / `nome_usuario_aprovacao_*` no Prisma — são agregados de leitura.
- Resolver «Quem aprovou» só no client sem enriquecer o GET (quebra para outros usuários da org).
- Reimplementar grid de subtotais no modal Aprovar ou no card combate — usar `TabelaResumoPropostaReadonlyBidFreteInternacional`.

---

## 6. Card Rota — portos/aeroportos opcionais (TASK-000405)

Quando a cotação tem alternativas habilitadas, o card **Rota** na aba Visão geral exibe linhas abaixo da rota principal:

| Label UI | Fonte |
|----------|-------|
| Portos/Aeroportos de Origem opcionais | `codigos_opcao_porto_aeroporto_origem_*` + rótulos Cadastros |
| Portos/Aeroportos de Destino opcionais | `codigos_opcao_porto_aeroporto_destino_*` + rótulos Cadastros |

| Peça | Caminho |
|------|---------|
| UI | `cotacao-detalhe.tsx` — `InfoRow` após `RotaVisualCotacao` |
| Textos | `useTextosLocaisOpcionaisCotacaoBidFrete` em `locais-opcionais-cotacao-bid-frete-internacional.ts` |
| SSOT | `shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional.ts` |

Omite a linha quando toggle desligado ou lista vazia. Formato exibição: códigos resolvidos separados por vírgula (`Santos — BRSSZ, Paranaguá — BRPNG`).
- Converter moedas estrangeiras entre si ou somar USD+EUR num único total BRL sem conversão por coluna.
