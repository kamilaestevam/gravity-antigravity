# Insights — Smart Docs

> **Tela:** `client/src/pages/insights-smart-read/InsightsSmartRead.tsx`  
> **Escopo desta doc:** aba Insights apenas — **não** altera Lista (`ListaLeituraSmartRead`).

---

## 1. Fonte de dados (lista + detalhe)

Insights **não** tem API própria. O hook `use-dados-insights-leitura-smart-read.ts` consome:

1. `GET /api/v1/smart-read/leituras` (lista por **workspace** — merge legado + progresso + snapshot no BFF)
2. `GET /api/v1/smart-read/leituras/:id` em **paralelo** (`Promise.allSettled`) para cada leitura `COMPLETED` ou `PROCESSING`

**Onde está o banco real:** PDFs, fila OCR e JSON bruto (`processingResult` / `finalProcessingResult`) **permanecem no legado DATI** — não no Railway Gravity. O Postgres Gravity só guarda **cópia** (`snapshot_leitura_smart_read`) e sessão do wizard (`progresso_leitura_smart_read`). Ver [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md).

### Cadeia do detalhe (BFF)

`GET /leituras/:id`: **snapshot (workspace)** → **legado** (se vinculada ao workspace) → **progresso** (`catch`, `id_usuario` + workspace).

### Modo completo vs degradado (client)

| Modo | Condição | O que preenche |
|------|----------|----------------|
| **Completo** | `leiturasDetalhe` com `resultado_extracao` | KPIs, donut, tipos, evolução, rankings, BL/AWB — regra §2 |
| **Degradado** | Lista com métricas mas detalhe vazio/falhou | KPIs, tipos (aprox. por `tipos_documento`), evolução — via `TransacaoLeitura`; rankings e BL/AWB vazios |

Implementação degradado: `calcularMetricasInsightsDeTransacoes` e `montarSerieCamposPorDiaInsights` (branch sem documentos) em `calcular-metricas-insights-leitura-smart-read.ts` e `agrupar-campos-por-dia-insights-smart-read.ts`. Falhas de `obterLeitura` logam IDs em `console.warn`.

---

## 2. Fonte única de acerto e erro

| Conceito | Definição |
|----------|-----------|
| **Acerto** | Campo extraído pela IA **não editado** pelo usuário na conferência |
| **Erro** | Campo **editado** pelo usuário (valor final ≠ valor original) |

**Proibido** usar `accuracy`, `score`, `campos_medio` do catálogo ou estimativas para contagem de erros.

### Implementação

| Camada | Arquivo |
|--------|---------|
| Comparação campo a campo | `client/src/shared/comparar-campos-edicao-leitura-smart-read.ts` |
| Agregação por documento | `client/src/pages/insights-smart-read/extrair-dados-documento-leitura-smart-read.ts` |
| Métricas e savings | `client/src/pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read.ts` |

Campos achatados por caminho (`exportador`, `agente_carga.nome`, etc.). Metadados (`accuracy`, `score`, `confidence`, `origem`) são ignorados.

---

## 3. Contrato BFF — `dados_original`

O legado expõe dois snapshots por item de extração **somente quando houve edição na conferência** (`finalProcessingResult` distinto de `processingResult`):

| Legado | BFF normalizado |
|--------|-----------------|
| `processingResult[].data` | `resultado_extracao[].dados_original` *(omitido se sem edição)* |
| `finalProcessingResult[].data` (ou `processingResult` se ausente) | `resultado_extracao[].dados` |

Sem `dados_original` no payload → todos os campos contam como **acerto** (usuário ainda não editou). Ver §2.

**Arquivos (contrato bilateral — REGRA 07/09):**

- `server/src/schemas/leitura-smart-read.ts` — `normalizarLeitura()`, `parearResultadoOriginal()`
- `client/src/shared/schemas.ts` — `ItemResultadoExtracaoLeituraSchema`

```typescript
// Item de resultado_extracao
{
  tipo_documento: string | null
  dados: Record<string, unknown>           // pós-conferência
  dados_original?: Record<string, unknown> // extração IA (opcional no schema; obrigatório quando legado envia processingResult)
}
```

Pareamento original ↔ final: por índice, depois por `id`, depois por `fileType`.

---

## 4. Emissor responsável pelo acerto (rankings)

O ranking **não** atribui acerto/erro a todo participante encontrado no JSON. O **emissor do documento** é o responsável:

| Tipo de documento (normalizado) | Emissor responsável |
|---------------------------------|---------------------|
| `invoice`, `packing_list`, `proforma`, `pedido` | **Exportador** |
| `bl`, `awb` | **Agente de carga** |
| `financeiro` (boleto, fechamento, duplicata, etc.) | **Despachante** → agente → transportadora → armazém *(primeiro nome encontrado nesta ordem)* |

**Importador** é extraído para conferência, mas **não** entra nos rankings de emissor.

Exemplos:

- BL com `shipper: Asia Shipping` e `agente_carga.nome: Maersk` → ranking de **agente de carga** (Maersk), não exportador.
- Invoice com exportador e importador → ranking de **exportador** apenas.

### Implementação

| Arquivo | Função |
|---------|--------|
| `mapear-participante-insights-smart-read.ts` | `resolverResponsavelAcertoDocumentoInsights()`, `resolverTiposResponsaveisDocumentoInsights()` |
| `extrair-dados-documento-leitura-smart-read.ts` | Campo `responsavel_acerto: { tipo, nome } \| null` em cada documento |
| `calcular-metricas-insights-leitura-smart-read.ts` | Rankings filtram por `doc.responsavel_acerto.tipo` |

Normalização de tipo financeiro: `dados-base-produto-tempo-smart-read.ts` → `normalizarTipoDocumentoBaseSmartRead()` reconhece `boleto`, `fechamento`, `duplicata`, etc. como `financeiro`.

---

## 5. UI — painéis Insights

| Componente | Arquivo |
|------------|---------|
| KPIs, donut, tipos, **campos por dia**, rankings | `client/src/components/insights-smart-read-paineis.tsx` |
| Gráfico barras empilhadas (dia a dia) | `client/src/components/grafico-campos-por-dia-insights-smart-read.tsx` |
| Seletor 7/30/60/90 + calendário | `client/src/components/seletor-periodo-campos-dia-insights-smart-read.tsx` |
| Agregação diária | `agrupar-campos-por-dia-insights-smart-read.ts` — padrão **7 dias**, presets 7/30/60/90 ou intervalo customizado |
| **Modal Base de cálculo** + link nos KPIs de saving | `metodologia-saving-insights-smart-read.tsx` (`ProvedorMetodologiaSavingInsightsSmartRead`) |
| Layout / CSS (padrão BID Frete `bfd-dashboard`) | `client/src/pages/insights-smart-read/insights-smart-read.css` |
| Hook de dados | `client/src/pages/insights-smart-read/use-dados-insights-leitura-smart-read.ts` |

Rankings: abas por tipo de emissor (`PARTICIPANTES_RANKING_INSIGHTS_SMART_READ` — 5 tipos, sem importador). Top 5 acertos e top 5 erros por aba.

Subtítulo da UI deixa explícito: acerto = inalterado; erro = editado; emissor conforme tipo de documento.

### KPIs de saving — exibição vs detalhe

| KPI | Valor no card | Detalhe (tooltip / painel Economia) |
|-----|---------------|-------------------------------------|
| **Saving Digitação** | Minutos economizados | Soma da base manual fixa por documento − tempo de leitura (cronômetro); link **Base de cálculo →** |
| **Saving em Erros** | **Quantidade de campos errados** (`camposErrados`) | Minutos e custo no tooltip/subtítulo — não no número principal do card |

Link **Base de cálculo →** abre modal (`ModalOverlay`) com metodologia completa. Tooltip do card usa `CardBasicoGlobal` com `pointer-events: auto` e ponte de hover (`nucleo-global/Layout/card-global`) para permitir clicar no link sem o tooltip sumir.

---

## 6. Savings (tempo / custo)

Estimativas usam SSOT em `shared/dados-base-produto-tempo-smart-read.ts` (reexport client: `client/src/pages/insights-smart-read/dados-base-produto-tempo-smart-read.ts`) e funções em `shared/metricas-transacao-leitura-smart-read.ts`:

- **Saving digitação:** `soma(tempo_digitação_manual_minutos por documento) − tempo de leitura em minutos`. Tempo de leitura = cronômetro do processo (`tempo_processo_total_ms`, `created_at`→`completed_at`); fallback `tempo_extracao_ia_ms` quando o cronômetro não existir. **Não** usar `tempo_digitação_smart_read_minutos` da base como substituto do tempo medido.
- **Saving erros:** `campos_errados × (tempo_correcao_erro_manual − tempo_correcao_erro_smart_read por campo)`
- **Custo evitado:** `minutos_economizados ÷ 60 × R$ 115/h` (`custo_hora_operador_brl` R$ 85 + `markup_venda` 1,35)

Funções SSOT: `calcularSavingDigitaçãoTransacaoLeituraSmartRead`, `calcularRecursosReduzidosPorTempoLeituraSmartRead`, `resolverSavingTransacaoLeituraSmartRead`, `resolverSavingDetalhadoTransacaoLeituraSmartRead`, `agregarTempoExtracaoIaMedioPorTipoLeituraSmartRead`, `calcularMediasTabelaBaseCalculoSmartRead`. Wizard passo 2: `client/src/shared/calcular-saving-nova-leitura-smart-read.ts`.

Erros de saving dependem exclusivamente da contagem de campos editados (§2).

### Modal «Base de cálculo»

Componente: `metodologia-saving-insights-smart-read.tsx`. `ProvedorMetodologiaSavingInsightsSmartRead` recebe `transacoes` (leituras visíveis). Seções:

1. Como chegamos nos tempos manuais (estudo DOCS BASE PRODUTO)
2. Fórmulas (digitação com tempo real IA, erros, custo)
3. Tabela **Tempos por tipo de documento** — coluna **SR medido (s)** via `agregarTempoExtracaoIaMedioPorTipoLeituraSmartRead`; linha **Média**
4. **Observações — documento médio do estudo** — `OBSERVACOES_DOCUMENTO_MEDIO_ESTUDO_SMART_READ`

| Tipo (exibição) | Digitação manual (estudo) | Parâmetro interno |
|-----------------|---------------------------|-------------------|
| Pedido | 16,10 min | `pedido` |
| Proforma | 16,10 min | `proforma` |
| Invoice | 16,10 min | `invoice` |
| Packing List | 19,054 min | `packing_list` |
| BL | 12,10 min | `bl` |
| AWB | 9,02 min | `awb` |
| Documentos Financeiros | 20,00 min | `outros` |

**Documento médio (observações):** Invoice/Proforma/Pedido = 20 itens; Packing List = 10 linhas; Documentos Financeiros = 10 linhas; BL/AWB = cabeçalho (peso = contêineres, sem contagem de itens).

> Valores editáveis no Configurador quando a tabela oficial for publicada. Até lá, alterar `BASE_TEMPO_DOCUMENTO_SMART_READ` no shared (lista + insights + BFF leem o mesmo arquivo).

---

## 7. Testes unitários

| Arquivo | Cobertura |
|---------|-----------|
| `testes/testes-unitarios/produto-gravity/smart-read/comparar-campos-edicao-leitura.test.ts` | Comparação original × final |
| `testes/testes-unitarios/produto-gravity/smart-read/responsavel-acerto-documento-insights.test.ts` | Regra emissor por tipo |
| `testes/testes-unitarios/produto-gravity/smart-read/calcular-metricas-insights-leitura.test.ts` | Pipeline métricas + fallback por `TransacaoLeitura` |
| `testes/testes-unitarios/produto-gravity/smart-read/agrupar-campos-por-dia-insights.test.ts` | Série temporal + fallback por transação |
| `testes/testes-unitarios/produto-gravity/smart-read/fixtures/leituras-fixture-insights-smart-read.ts` | Leituras detalhadas (modo completo) |
| `testes/testes-unitarios/produto-gravity/smart-read/fixtures/transacoes-fixture-insights-smart-read.ts` | **SSOT** de transações — mesmos ids/datas nos dois specs acima |

---

## 8. Fora de escopo (Lista)

Não alterar nesta vertical Insights:

- `ListaLeituraSmartRead`, colunas, cards, modal nova leitura
- `media_acertos` na lista (campo legado da transação — Insights não usa para erro)
