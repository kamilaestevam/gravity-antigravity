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

**Regra:** Dele e Mercado usam **sempre o mesmo componente**.

---

## 3. Controles do card (UI)

| Controle | Valores | Padrão | Efeito |
|:---|:---|:---|:---|
| **Base do histórico** | Contratado \| Propostas | Contratado | Define quais cotações entram no Mercado |
| **Componente de preço** | Frete base \| Taxas origem \| Taxas destino \| Total | Frete base | Campo usado em Dele e Mercado |
| **Filtrar por incoterm** | Toggle off/on | **Off** | Off: ignora incoterm; On: exige igualdade exata |
| **Exibição** | Dele + Mercado | — | Mercado = média 6m; Dele = melhor atual; savings se Dele &lt; Mercado |

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
| 10 | Incoterm | `incoterm_cotacao_bid_frete_internacional` | Opcional | Igualdade exata | Só se toggle ativo |
| 11 | Componente de preço | Campos proposta | Sim (UI) | Mesmo componente | Dele = Mercado |
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

## 6. Base do histórico (Contratado / Propostas)

| Modo | Cotações | Data bucket | Valor histórico |
|:---|:---|:---|:---|
| Contratado | `APROVADA` | `data_aprovacao` | Proposta contratada no componente |
| Propostas | ≥1 proposta, ≠ RASCUNHO | 1ª `data_criacao_proposta` | Menor valor no componente |

---

## 7. Cálculo Dele vs Mercado

| Métrica | Fonte |
|:---|:---|
| Dele | Melhor proposta aberta no componente |
| Mercado | Média 6 meses (meses com dado) |
| Savings | `max(0, mercado − dele)` |
| Série | 6 pontos mensais Mercado |

---

## 8. API (fase 1)

`GET cotacoes/:id` retorna `historico_aprovado` e `historico_propostas_recebidas` (somente leitura). Server aplica `filtrarHistoricoTermometro` com `filtrar_incoterm: false`; client reaplica quando toggle incoterm ligado.

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

- Média Mercado em `valor_total` com Dele em frete base.
- FCL 20' vs 40' HC na mesma média.
- Importação vs exportação misturadas.
- Faixa de peso em LCL marítimo.
- Série ilustrativa / Preview em produção.
- Incoterm forçado sem toggle do usuário.
