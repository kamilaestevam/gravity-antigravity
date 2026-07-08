# Termômetro histórico — Cockpit (Painel de Insights)

> **Tela:** `cotacao-detalhe.tsx` → `InsightsGridFluxoCotacao` → `CardTermometroHistoricoSmart`  
> **Código:** `painel-fluxo-infograficos-cotacao-bid-frete-internacional.tsx`, `infograficos-fluxo-cotacao-bid-frete-internacional.ts`  
> **Matching SSOT:** `shared/filtro-historico-termometro-bid-frete-internacional.ts`  
> **API:** `GET /api/v1/bid-frete-internacional/cotacoes/:id`  
> **CSS:** `cotacao-detalhe-cockpit.css`  
> **Relacionado:** [COTACAO-DETALHE-COCKPIT-TECNICO.md](./COTACAO-DETALHE-COCKPIT-TECNICO.md)

---

## 1. Objetivo

O **Termômetro histórico** compara o preço **Dele** (cotação aberta) com o **Mercado** (histórico da mesma organização), na mesma rota e condições operacionais, nos **últimos 6 meses**.

- **Dele:** melhor proposta atual (ou valor contratado) no **componente de preço** selecionado.
- **Mercado:** média mensal das cotações históricas que passam no **mesmo filtro de matching**, no **mesmo componente**.

**Fase 1 — persistência:** não há tabela dedicada. Dados vêm de `CotacaoBidFreteInternacional` + propostas; agregação em leitura no GET da cotação.

**Fase 2 (opcional):** snapshot/agregado `termometro_mercado_*` se consulta ficar pesada ou houver painéis globais de mercado.

---

## 2. Composição do preço (por que filtrar componente)

| Componente (UI) | Campo proposta | Uso no termômetro |
|:---|:---|:---|
| **Frete base** (padrão) | `valor_frete_proposta_bid_frete_internacional` | Frete internacional / linha |
| **Taxas origem** | `taxas_origem_proposta_bid_frete_internacional` | Pick-up, THC origem, etc. |
| **Taxas destino** | `taxas_destino_proposta_bid_frete_internacional` | Entrega, THC destino, etc. |
| **Total** | `valor_total_proposta_bid_frete_internacional` | All-in |

**Multi-seleção (tipo `SelecaoComponentesTermometro`):** o usuário pode marcar 2+ componentes — os valores são **somados** por proposta (ex.: Frete base + Taxas origem). Regras:

- **TOTAL é exclusivo:** se estiver na seleção, prevalece sozinho (já representa a soma completa — somar com outros duplicaria valores). A UI desmarca os demais ao marcar Total e vice-versa.
- Componentes com valor ausente/`null` são ignorados na soma; se **nenhum** componente da seleção tem valor, a proposta não entra (retorna `null`, nunca `0`).
- A seleção nunca fica vazia (a UI impede desmarcar o último).

**Regra:** Dele e Mercado usam **sempre a mesma seleção de componentes**.

---

## 3. Controles do card (UI)

Os filtros vivem em um **painel flutuante (popover)** aberto pelo botão de filtros no cabeçalho do card (renderizado via `createPortal`, fecha em clique externo/scroll). Todos os grupos são **multi-seleção**:

| Controle | Valores | Padrão | Efeito |
|:---|:---|:---|:---|
| **Base do histórico** (multi) | Contratado, Propostas — 1 ou ambos | Contratado | Define quais cotações entram no Mercado; com ambos marcados, as bases são combinadas com dedupe (§6) |
| **Componente de preço** (multi) | Frete base, Taxas origem, Taxas destino, Total | Frete base | Selecionados são somados (§2); Total é exclusivo |
| **Incoterm** (multi) | «Todos» ou lista de incoterms (EXW, FOB, CIF, …) | **Todos** (lista vazia = sem filtro) | Com 1+ incoterms marcados, só entram cotações históricas cujo incoterm está na lista; o incoterm da cotação atual ganha destaque visual no grid |
| **Exibição** | Dele + Mercado | — | Mercado = média 6m; Dele = melhor atual; savings se Dele &lt; Mercado |

**Invariantes da UI:** base e componente nunca ficam com seleção vazia; incoterm vazio significa «Todos».

**Botão de filtros (`dc-termometro-filtros-botao`) — dois estados, por descoberta:**

| Estado | Aparência | Por quê |
|:---|:---|:---|
| Sem filtro ativo (padrão) | **Pill índigo** com funil `FunnelSimple` bold + rótulo «Filtros» visível | O filtro é o recurso central do card — só o ícone de funil era discreto demais e o usuário não descobria |
| Com filtro ativo | Funil compacto **preenchido** (`fill`), sem rótulo | O chip de resumo ao lado já comunica «Filtros: …» — repetir o texto no botão seria redundante no header curto |

**Chip de resumo no cabeçalho:** quando qualquer filtro difere do padrão, o cabeçalho exibe o chip `Filtros: …` — até 2 seleções aparecem por nome; 3+ consolidam em «N selecionados» com tooltip listando todas. O `X` do chip restaura os padrões (`Contratado` + `Frete base` + todos os incoterms).

**Estado sem histórico:** mensagem *Aguardando…* (sem mock, sem Preview).

---

## 4. Variáveis de matching

| # | Variável | Campo (banco) | Obrigatória | Regra de match | Observação |
|:---:|:---|:---|:---:|:---|:---|
| 1 | Tipo de operação | `tipo_operacao_cotacao_bid_frete_internacional` | Sim | Igualdade exata | Importação ≠ exportação |
| 2 | Modal | `modal_cotacao_bid_frete_internacional` | Sim | Igualdade exata | MARITIMO \| AEREO \| RODOVIARIO |
| 3 | Origem | `origem_codigo_cotacao_bid_frete_internacional` | Sim | Igualdade exata | UN/LOCODE, IATA ou código rodoviário |
| 4 | Destino | `destino_codigo_cotacao_bid_frete_internacional` | Sim | Igualdade exata | Idem origem |
| 5 | Modalidade de carga | `modalidade_cotacao_bid_frete_internacional` | Marítimo: Sim | Igualdade exata | FCL ≠ LCL |
| 6 | Tipo de container | `tipo_container_cotacao_bid_frete_internacional` | Só FCL | Igualdade exata | 20' DRY ≠ 40' HC |
| 7 | Faixa carga (aéreo) | `peso_kg` + `cubagem_m3` | Só aéreo | Mesma faixa tarifária | §5.1 |
| 8 | Faixa carga (rodoviário) | `peso_ton` / `peso_kg` + `cubagem_m3` | Só rodoviário | Mesma faixa | §5.2; `max(ton, m³)` |
| 9 | Peso / cubagem (LCL) | `peso_kg` + `cubagem_m3` | LCL | Não filtra | Média de todo LCL na rota |
| 10 | Incoterm | `incoterm_cotacao_bid_frete_internacional` | Opcional | Pertence à lista selecionada | Lista vazia = todos (opção `incoterms` em `OpcoesFiltroHistoricoTermometro`); `filtrar_incoterm: true` legado exige igualdade com a cotação atual |
| 11 | Componente de preço | Campos proposta | Sim (UI) | Mesma seleção (soma se multi) | Dele = Mercado; TOTAL exclusivo |
| 12 | Organização | `id_organizacao` | Sim | Igualdade exata | Isolamento tenant |
| 13 | Cotação atual | `id_cotacao_bid_frete_internacional` | — | Excluir | Nunca no próprio histórico |

---

## 5. Faixas por modal

### 5.1 Aéreo

`peso_cubado_kg = max(peso_kg, cubagem_m3 × 167)`

| Faixa | Intervalo (kg cubados) |
|:---|:---|
| Mínimo / −45 | 0 ≤ x &lt; 45 |
| +45 | 45 ≤ x &lt; 100 |
| +100 | 100 ≤ x &lt; 300 |
| +300 | 300 ≤ x &lt; 400 |
| +100 (último) | x ≥ 400 |

### 5.2 Rodoviário

`carga_referencia = max(toneladas, cubagem_m3)`

| Faixa | Intervalo |
|:---|:---|
| Faixa 1 | ≤ 15 ton ou m³ |
| Faixa 2 | 15,01 – 24 |
| Faixa 3 | 24,01 – 30 |
| Faixa 4 | &gt; 30 |

### 5.3 Marítimo

| Modalidade | Filtro extra |
|:---|:---|
| FCL | `tipo_container` exato |
| LCL | Sem filtro peso/cubagem |

---

## 6. Base do histórico (Contratado / Propostas — multi)

| Modo | Cotações | Data bucket | Valor histórico |
|:---|:---|:---|:---|
| Contratado | `APROVADA` | `data_aprovacao` | Proposta contratada na seleção de componentes |
| Propostas | ≥1 proposta, ≠ RASCUNHO | 1ª `data_criacao_proposta` | Menor valor na seleção de componentes |

**Ambas selecionadas (dedupe):** `buildSerieTermometroBases` recebe uma entrada por base, na ordem da seleção. Cotação presente em mais de uma base (ex.: aprovada que também tem propostas) conta **uma vez só** — a **primeira entrada vence** por `id_cotacao_bid_frete_internacional` (na prática: Contratado prevalece, a cotação entra pela regra do valor contratado/`data_aprovacao`, não pela melhor proposta).

---

## 7. Cálculo Dele vs Mercado

| Métrica | Fonte |
|:---|:---|
| Dele | Melhor proposta aberta na seleção de componentes |
| Mercado | Média dos 6 meses (só meses com dado): média mensal = `soma dos valores do mês / count`; Mercado = média das médias mensais |
| Savings | `max(0, mercado − dele)` |
| Série | 6 pontos mensais Mercado (meses vazios interpolados **só para o gráfico**) |

> **Ordem de cálculo (regressão corrigida em 2026-07):** a média é calculada **antes** de `interpolarMesesVaziosSerie`, porque essa função **muta** a série dividindo `valor` por `count` para plotagem. Calcular a média depois dividia de novo — em meses com 2+ cotações a média do Mercado saía pela metade. Teste de regressão em `painel-smart-insights-termometro.test.ts` (multi-base com 2 cotações no mesmo mês → média 900, não 450).

---

## 8. API (fase 1)

`GET cotacoes/:id` retorna `historico_aprovado` e `historico_propostas_recebidas` (somente leitura). Server aplica `filtrarHistoricoTermometro` **sem filtro de incoterm** (retorna todos os compatíveis); o client reaplica o filtro com `{ incoterms: [...] }` quando o usuário seleciona incoterms no popover. Todos os filtros de UI (bases, componentes, incoterms) são **client-side** — nenhuma mudança de contrato na API.

---

## 9. Arquivos

| Peça | Caminho |
|:---|:---|
| Matching SSOT | `shared/filtro-historico-termometro-bid-frete-internacional.ts` |
| Contrato Zod GET | `shared/cotacao-historico-termometro-api-schema.ts` |
| Série / média | `client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional.ts` |
| Card UI | `client/src/shared/painel-fluxo-infograficos-cotacao-bid-frete-internacional.tsx` |
| GET | `server/src/routes/cotacoes.ts` |
| Testes | `testes/.../filtro-historico-termometro-bid-frete-internacional.test.ts`, `painel-smart-insights-termometro.test.ts`, `TST-FUN-BIDFRT-000124-cotacao-historico-termometro.test.ts` |

---

## 10. Anti-padrões

- Média Mercado em `valor_total` com Dele em frete base (seleções de componente diferentes entre Dele e Mercado).
- Somar TOTAL com outro componente na multi-seleção (dupla contagem — TOTAL é exclusivo).
- Contar a mesma cotação duas vezes quando Contratado + Propostas estão marcados (dedupe por id é obrigatório).
- Calcular a média do Mercado **depois** de `interpolarMesesVaziosSerie` (dupla divisão por `count` — média cai pela metade).
- FCL 20' vs 40' HC na mesma média.
- Importação vs exportação misturadas.
- Faixa de peso em LCL marítimo.
- Série ilustrativa / Preview em produção.
- Incoterm forçado sem seleção do usuário (padrão = todos).
