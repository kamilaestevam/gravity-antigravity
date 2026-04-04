# Dashboard BI — Catálogo de Métricas

> **Total:** 48 métricas | **8 produtos** | **Atualizado:** 2026-04-02

---

## Como Usar o Catálogo

Cada métrica possui uma **chave única** no formato `produtoId.nomeDaMetrica` (ex.: `bid-cambio.saving_total`). Essa chave é usada em dois contextos:

1. **`WidgetQuerySpec.fields`** — ao montar a query de um widget, você passa a chave no array `fields`
2. **`CatalogField.key`** — ao registrar uma nova métrica no `DATA_CATALOG` em `catalog.ts`

O `DashboardQueryEngine` usa a chave para:
- Verificar se o usuário tem permissão para acessar a métrica
- Identificar qual produto (e qual porta) deve ser consultado via REST
- Prefixar os dados da resposta do produto com `produtoId.` antes de retornar ao cliente

A coluna **Operações** indica quais valores são válidos para `WidgetQuerySpec.operation`. Usar uma operação não listada pode resultar em resposta vazia ou erro do produto.

A coluna **Chart Types** indica os tipos de gráfico compatíveis com a métrica. O `chart-advisor.ts` usa essa informação para sugerir o chart type mais adequado quando nenhum é explicitado na query.

---

## Permissões Necessárias

Para acessar métricas de um produto, o usuário precisa ter a permissão correspondente no header `x-user-permissions` (lista separada por vírgula). O serviço de dashboard recusa a query com HTTP 403 se algum campo solicitado não tiver permissão.

| Produto | Permissão obrigatória |
|---------|----------------------|
| BID Câmbio | `bid-cambio:read` |
| BID Frete | `bid-frete:read` |
| Financeiro COMEX | `fin-comex:read` |
| Processo | `processo:read` |
| Pedido | `pedido:read` |
| NF Importação | `nf-importacao:read` |
| Simula Custo | `simula-custo:read` |
| LPCO | `lpco:read` |

---

## BID Câmbio — 6 métricas

**Produto:** `bid-cambio` | **Porta:** 8025 | **Permissão:** `bid-cambio:read`

| Chave | Label | Tipo | Operações válidas | Chart types compatíveis | Descrição |
|-------|-------|------|------------------|------------------------|-----------|
| `bid-cambio.saving_total` | Saving Total (R$) | `currency` | `sum`, `avg` | KPI_CARD, LINE, BAR | Soma ou média do saving financeiro obtido comparando a taxa contratada com a taxa de mercado nas operações de câmbio do período |
| `bid-cambio.valor_operado` | Valor Operado (R$) | `currency` | `sum` | KPI_CARD, LINE | Volume financeiro total operado em câmbio no período selecionado, em reais |
| `bid-cambio.cotacoes_status` | Cotações por Status | `string` | `distribution` | DONUT, BAR | Contagem de cotações de câmbio agrupadas por status: Aguardando, Respondidas, Aprovadas, Encerradas |
| `bid-cambio.taxa_resposta` | Taxa de Resposta (%) | `percentage` | `avg` | KPI_CARD, GAUGE | Percentual médio de corretoras que responderam às cotações enviadas no período |
| `bid-cambio.economia_percentual` | Economia Média (%) | `percentage` | `avg` | KPI_CARD, GAUGE | Percentual médio de economia obtido em relação à taxa de referência nas operações fechadas |
| `bid-cambio.volume_mensal` | Volume Mensal | `number` | `count`, `trend` | LINE, BAR | Quantidade de cotações de câmbio criadas por mês; uso com `trend` retorna série temporal |

---

## BID Frete — 6 métricas

**Produto:** `bid-frete` | **Porta:** 8023 | **Permissão:** `bid-frete:read`

| Chave | Label | Tipo | Operações válidas | Chart types compatíveis | Descrição |
|-------|-------|------|------------------|------------------------|-----------|
| `bid-frete.saving_total` | Saving Total (R$) | `currency` | `sum`, `avg` | KPI_CARD, LINE, BAR | Soma ou média do saving financeiro obtido comparando o frete contratado com a cotação mais cara recebida |
| `bid-frete.valor_medio` | Valor Médio de Frete | `currency` | `avg` | KPI_CARD, LINE | Valor médio dos fretes contratados nas cotações fechadas no período |
| `bid-frete.cotacoes_status` | Cotações por Status | `string` | `distribution` | DONUT, BAR | Distribuição das cotações de frete por status: Aberta, Aguardando, Respondida, Contratada, Cancelada |
| `bid-frete.saving_percentual` | Saving Médio (%) | `percentage` | `avg` | KPI_CARD, GAUGE | Percentual médio de saving entre a proposta mais cara e a proposta contratada |
| `bid-frete.transit_time` | Prazo Médio (dias) | `number` | `avg`, `min`, `max` | KPI_CARD, HISTOGRAM, BAR | Prazo médio (ou mínimo/máximo) de trânsito das cotações de frete contratadas em dias |
| `bid-frete.volume_mensal` | Volume Mensal | `number` | `count`, `trend` | LINE, BAR | Quantidade de cotações de frete criadas por mês; uso com `trend` retorna série temporal |

---

## Financeiro COMEX — 6 métricas

**Produto:** `financeiro-comex` | **Porta:** 8029 | **Permissão:** `fin-comex:read`
**Path override:** `/api/v1/financeiro/dashboard/widgets`

| Chave | Label | Tipo | Operações válidas | Chart types compatíveis | Descrição |
|-------|-------|------|------------------|------------------------|-----------|
| `fin-comex.total_brl` | Total (R$) | `currency` | `sum` | KPI_CARD, LINE, BAR | Valor total consolidado de todas as transações financeiras de COMEX no período, em reais |
| `fin-comex.pendente` | Pendente (R$) | `currency` | `sum` | KPI_CARD, GAUGE | Valor total de pagamentos com status Pendente — ainda não quitados |
| `fin-comex.pagos` | Pago (R$) | `currency` | `sum` | KPI_CARD, LINE | Valor total de pagamentos quitados no período selecionado |
| `fin-comex.agendados` | Agendado (R$) | `currency` | `sum` | KPI_CARD | Valor total de pagamentos com data de vencimento futura já agendados |
| `fin-comex.por_moeda` | Por Moeda | `string` | `distribution` | DONUT, BAR | Distribuição dos valores financeiros agrupados por moeda de origem (USD, EUR, CNY, etc.) |
| `fin-comex.vencimentos_proximos` | Vencimentos Próximos | `number` | `count` | KPI_CARD, TABLE | Quantidade de pagamentos com vencimento nos próximos 7 dias |

---

## Processo — 6 métricas

**Produto:** `processo` | **Porta:** 8026 | **Permissão:** `processo:read`
**Path override:** `/api/v1/processos/dashboard/widgets`

| Chave | Label | Tipo | Operações válidas | Chart types compatíveis | Descrição |
|-------|-------|------|------------------|------------------------|-----------|
| `processo.total_ativos` | Processos Ativos | `number` | `count` | KPI_CARD | Quantidade total de processos de importação com status ativo (em andamento) no momento da consulta |
| `processo.atraso_chegada` | Atraso Médio (dias) | `number` | `avg`, `diff_days` | KPI_CARD, HISTOGRAM, LINE | Atraso médio em dias entre a data prevista e a data real (ou estimada) de chegada dos processos; `diff_days` calcula a diferença por processo |
| `processo.etapas_atrasadas` | Etapas Atrasadas | `number` | `count` | KPI_CARD, TABLE | Quantidade de etapas de processos que ultrapassaram o prazo esperado e ainda não foram concluídas |
| `processo.por_status` | Por Status | `string` | `distribution` | DONUT, FUNNEL, BAR | Distribuição dos processos agrupados por status (ex.: Pré-Embarque, Em Trânsito, Desembaraço, Entregue) |
| `processo.chegadas_7d` | Chegando em 7 dias | `number` | `count` | KPI_CARD | Quantidade de processos com previsão de chegada (ETA) nos próximos 7 dias |
| `processo.volume_mensal` | Volume Mensal | `number` | `count`, `trend` | LINE, BAR | Quantidade de processos de importação abertos por mês; uso com `trend` retorna série temporal |

---

## Pedido — 12 métricas + 5 métricas derivadas

**Produto:** `pedido` | **Porta:** 8026 (servidor dedicado) | **Permissão:** `pedido:read`
**Path override:** `/api/v1/pedidos/dashboard/widgets`
**Power BI:** `GET /api/v1/analytics/pedido/*` (ver seção abaixo)

> **Atualizado em 2026-04-03:** O produto Pedido passou a ter servidor dedicado (`produto/pedido/server/`) com 12 métricas diretas, 5 métricas derivadas built-in e endpoint nativo de integração Power BI (OData v4).

### Métricas diretas

| Chave | Label | Tipo | `semanticType` | `domain` | Operações válidas | Chart types compatíveis | Descrição |
|-------|-------|------|----------------|----------|------------------|------------------------|-----------|
| `total_pedidos` | Total de Pedidos | `number` | `count` | pedido | `COUNT` | KPI_CARD, LINE, BAR | Quantidade total de pedidos no período |
| `pedidos_abertos` | Pedidos Abertos | `number` | `count` | pedido | `COUNT` | KPI_CARD, LINE, DONUT | Pedidos com status ABERTO |
| `pedidos_em_andamento` | Em Andamento | `number` | `count` | pedido | `COUNT` | KPI_CARD, LINE, DONUT | Pedidos com status EM_ANDAMENTO |
| `pedidos_atrasados` | Pedidos Atrasados | `number` | `count` | pedido | `COUNT` | KPI_CARD, LINE, BAR | Pedidos com prazo vencido e não concluídos |
| `valor_total` | Valor Total dos Pedidos | `currency` | `sum_currency` | pedido | `SUM` | KPI_CARD, LINE, BAR | Soma do valor total de todos os pedidos no período |
| `cobertura_pendente` | Cobertura Pendente | `currency` | `sum_currency` | pedido | `SUM` | KPI_CARD, LINE | Valor ainda não coberto financeiramente |
| `valor_itens_total` | Valor Total dos Itens | `currency` | `sum_currency` | pedido | `SUM` | KPI_CARD, LINE, BAR | Soma de `valor_unitario × qtd_inicial` de todos os itens |
| `qtd_total` | Quantidade Total | `number` | `sum_qty` | pedido | `SUM` | KPI_CARD, LINE, BAR | Soma da quantidade total dos pedidos |
| `itens_prontos` | Itens Prontos | `number` | `sum_qty` | item | `SUM` | KPI_CARD, LINE, BAR | Quantidade de itens com `pronto = true` |
| `qtd_atual_total` | Qtd. Atual (Itens) | `number` | `sum_qty` | item | `SUM` | KPI_CARD, LINE, BAR | Soma de `qtd_atual` de todos os itens |
| `qtd_transferida_total` | Qtd. Transferida | `number` | `sum_qty` | item | `SUM` | KPI_CARD, LINE, BAR | Soma de `qtd_transferida` de todos os itens |
| `qtd_inicial_total` | Qtd. Inicial (Itens) | `number` | `sum_qty` | item | `SUM` | KPI_CARD, LINE, BAR | Soma de `qtd_inicial` de todos os itens |

### Métricas derivadas (built-in)

Calculadas no frontend via fórmulas puras em `derivedMetrics.ts`. O endpoint `/analytics/pedido/kpis` também as retorna pré-calculadas.

| ID | Label | Fórmula | Tipo |
|----|-------|---------|------|
| `taxa_atraso` | Taxa de Atraso | `pedidos_atrasados / total_pedidos × 100` | `percentage` |
| `ticket_medio` | Ticket Médio | `valor_total / total_pedidos` | `currency` |
| `taxa_conclusao_itens` | Conclusão de Itens | `itens_prontos / qtd_inicial_total × 100` | `percentage` |
| `exposicao_financeira` | Exposição Financeira | `cobertura_pendente / valor_total × 100` | `percentage` |
| `taxa_transferencia` | Progresso de Transferência | `qtd_transferida_total / qtd_inicial_total × 100` | `percentage` |

### Endpoints Power BI (OData v4)

Autenticação: `Authorization: Bearer <ANALYTICS_API_KEY>` + `x-tenant-id: <id>`

| Endpoint | Parâmetros | Retorna |
|----------|------------|---------|
| `GET /api/v1/analytics/pedido/metadata` | — | Schema OData — Power BI configura tipos automaticamente |
| `GET /api/v1/analytics/pedido/kpis` | `period` | Todas as 12 métricas + 5 derivadas agregadas |
| `GET /api/v1/analytics/pedido/trend` | `field`, `period`, `granularity` | Série temporal (day/week/month) |
| `GET /api/v1/analytics/pedido/distribution` | `period` | Distribuição por status com contagem e valor |
| `GET /api/v1/analytics/pedido/items` | `period` | Dados de itens agregados |
| `GET /api/v1/analytics/pedido/raw` | `period`, `page`, `pageSize` | Raw paginado com `@odata.nextLink` |

---

## NF Importação — 6 métricas

**Produto:** `nf-importacao` | **Porta:** 8028 | **Permissão:** `nf-importacao:read`

| Chave | Label | Tipo | Operações válidas | Chart types compatíveis | Descrição |
|-------|-------|------|------------------|------------------------|-----------|
| `nf-imp.total_fob` | Total FOB (R$) | `currency` | `sum`, `avg` | KPI_CARD, LINE, BAR | Soma ou média do valor FOB declarado nas notas fiscais de importação emitidas no período |
| `nf-imp.total_cif` | Total CIF (R$) | `currency` | `sum`, `avg` | KPI_CARD, LINE | Soma ou média do valor CIF (custo + seguro + frete) das notas fiscais de importação no período |
| `nf-imp.total_tributos` | Total Tributos (R$) | `currency` | `sum` | KPI_CARD, BAR, DONUT | Soma total de tributos recolhidos (II + IPI + PIS + COFINS + ICMS) nas notas fiscais do período |
| `nf-imp.nfs_por_status` | NFs por Status | `string` | `distribution` | DONUT, BAR | Distribuição das notas fiscais de importação por status (ex.: Rascunho, Emitida, Cancelada, Retificada) |
| `nf-imp.tributos_breakdown` | Breakdown de Tributos | `string` | `distribution` | BAR_HORIZONTAL, DONUT | Composição dos tributos por tipo: II (Imposto de Importação), IPI, PIS, COFINS, ICMS — em valor absoluto |
| `nf-imp.volume_mensal` | Volume Mensal | `number` | `count`, `trend` | LINE, BAR | Quantidade de notas fiscais de importação emitidas por mês; uso com `trend` retorna série temporal |

> **Atenção:** As chaves de `nf-importacao` usam o prefixo `nf-imp.` (não `nf-importacao.`) para maior brevidade. A chave completa no catálogo é sempre `nf-imp.{metrica}`.

---

## Simula Custo — 6 métricas

**Produto:** `simula-custo` | **Porta:** 8020 | **Permissão:** `simula-custo:read`

| Chave | Label | Tipo | Operações válidas | Chart types compatíveis | Descrição |
|-------|-------|------|------------------|------------------------|-----------|
| `simula-custo.landed_cost_medio` | Landed Cost Médio (R$) | `currency` | `avg` | KPI_CARD, LINE, BAR | Custo médio de importação (landed cost = FOB + frete + seguro + tributos + despesas) calculado nas simulações do período |
| `simula-custo.estimativas_ativas` | Estimativas Ativas | `number` | `count` | KPI_CARD | Quantidade de simulações de custo de importação com status ativo (não arquivadas) no momento da consulta |
| `simula-custo.total_tributos_medio` | Tributos Médios (R$) | `currency` | `avg` | KPI_CARD | Valor médio total de tributos (II, IPI, PIS, COFINS, ICMS) calculados nas simulações do período |
| `simula-custo.tributos_breakdown` | Breakdown de Tributos | `string` | `distribution` | DONUT, BAR_HORIZONTAL | Composição média dos tributos por tipo nas simulações: II, IPI, PIS, COFINS, ICMS — em percentual do total |
| `simula-custo.ptax_media` | PTAX Média | `number` | `avg` | KPI_CARD, LINE | Taxa PTAX (cotação oficial do dólar pelo Banco Central) média utilizada nas simulações do período |
| `simula-custo.volume_mensal` | Volume Mensal | `number` | `count`, `trend` | LINE, BAR | Quantidade de simulações de custo criadas por mês; uso com `trend` retorna série temporal |

---

## LPCO — 6 métricas

**Produto:** `lpco` | **Porta:** 8027 | **Permissão:** `lpco:read`
**Path override:** `/api/v1/lpcos/dashboard/widgets`

| Chave | Label | Tipo | Operações válidas | Chart types compatíveis | Descrição |
|-------|-------|------|------------------|------------------------|-----------|
| `lpco.total_ativo` | LPCOs Ativos | `number` | `count` | KPI_CARD | Quantidade total de licenças, permissões, certificados e outros documentos (LPCOs) com status ativo |
| `lpco.vencendo_30d` | Vencendo em 30 dias | `number` | `count` | KPI_CARD, TABLE | Quantidade de LPCOs com data de validade nos próximos 30 dias — alerta operacional crítico |
| `lpco.exigencias_pendentes` | Exigências Pendentes | `number` | `count` | KPI_CARD, TABLE | Quantidade de exigências lançadas por órgãos anuentes (MAPA, ANVISA, INMETRO etc.) ainda não atendidas |
| `lpco.por_orgao` | Por Órgão Anuente | `string` | `distribution` | DONUT, BAR | Distribuição dos LPCOs agrupados por órgão anuente responsável pela anuência |
| `lpco.por_status` | Por Status | `string` | `distribution` | DONUT, BAR | Distribuição dos LPCOs por status do documento (ex.: Em Análise, Deferido, Indeferido, Exigência, Vencido) |
| `lpco.taxa_deferimento` | Taxa de Deferimento (%) | `percentage` | `avg` | KPI_CARD, GAUGE | Percentual médio de LPCOs com resultado Deferido em relação ao total de solicitações do período |

---

## Tipos de Dados

| Tipo | Descrição | Formato de retorno | Exemplos de uso |
|------|-----------|--------------------|-----------------|
| `currency` | Valor monetário em reais (R$) | `number` (float) — ex.: `123456.78` | Saving Total, Valor FOB, Landed Cost |
| `percentage` | Percentual entre 0 e 100 | `number` (float) — ex.: `87.5` | Taxa de Resposta, Saving %, Taxa de Deferimento |
| `number` | Quantidade ou contagem inteira | `number` (integer ou float) — ex.: `42` | Processos Ativos, Volume Mensal, Transit Time |
| `string` | Categoria ou distribuição | `Record<string, number>` — ex.: `{ "Aprovada": 10, "Pendente": 5 }` | Status de cotações, Por Moeda, Por NCM |
| `date` | Data ou diferença temporal | `number` (dias) para `diff_days`; `string` ISO 8601 para outros | Atraso Médio (internamente) |

> **Nota sobre `string`:** Métricas do tipo `string` sempre requerem operação `distribution`. O retorno é um objeto onde cada chave é um valor de categoria e cada valor é a contagem ou soma daquela categoria.

---

## Filtros de Período

O campo `filters.period` está presente em toda `WidgetQuerySpec`. Os produtos calculam o `WHERE created_at >= :startDate` baseados neste valor.

| Valor | Descrição | Exemplo de janela (hoje = 2026-04-02) |
|-------|-----------|--------------------------------------|
| `7d` | Últimos 7 dias | 2026-03-26 a 2026-04-02 |
| `30d` | Últimos 30 dias (padrão) | 2026-03-03 a 2026-04-02 |
| `90d` | Últimos 90 dias | 2025-12-03 a 2026-04-02 |
| `12m` | Últimos 12 meses | 2025-04-02 a 2026-04-02 |
| `mtd` | Mês corrente até hoje | 2026-04-01 a 2026-04-02 |
| `ytd` | Ano corrente até hoje | 2026-01-01 a 2026-04-02 |

> O período padrão, quando não especificado, é `30d`.

---

## Exemplos de Query Spec

### Exemplo 1 — KPI simples: Saving Total do BID Câmbio

```json
{
  "spec": {
    "fields": ["bid-cambio.saving_total"],
    "operation": "sum",
    "filters": {
      "period": "30d"
    },
    "chartType": "KPI_CARD"
  }
}
```

**Resposta esperada:**
```json
{
  "data": {
    "data": {
      "bid-cambio.saving_total": 45230.50
    },
    "chartType": "KPI_CARD",
    "partial": false,
    "cached": false,
    "computed_at": "2026-04-02T10:30:00.000Z"
  }
}
```

---

### Exemplo 2 — Distribuição de cotações por status (Donut)

```json
{
  "spec": {
    "fields": ["bid-frete.cotacoes_status"],
    "operation": "distribution",
    "filters": {
      "period": "mtd"
    },
    "chartType": "DONUT"
  }
}
```

**Resposta esperada:**
```json
{
  "data": {
    "data": {
      "bid-frete.cotacoes_status": {
        "Aberta": 12,
        "Respondida": 34,
        "Contratada": 18,
        "Cancelada": 3
      }
    },
    "chartType": "DONUT",
    "partial": false,
    "cached": true,
    "computed_at": "2026-04-02T10:25:00.000Z"
  }
}
```

---

### Exemplo 3 — Multi-produto: métricas de Processo e NF Importação no mesmo widget

```json
{
  "spec": {
    "fields": [
      "processo.total_ativos",
      "processo.etapas_atrasadas",
      "nf-imp.total_tributos"
    ],
    "operation": "count",
    "filters": {
      "period": "ytd"
    }
  }
}
```

**Resposta esperada (com falha parcial em um produto):**
```json
{
  "data": {
    "data": {
      "processo.total_ativos": 87,
      "processo.etapas_atrasadas": 14
    },
    "chartType": "KPI_CARD",
    "partial": true,
    "cached": false,
    "computed_at": "2026-04-02T10:31:00.000Z"
  }
}
```

> `partial: true` indica que `nf-importacao` não respondeu. O cliente deve exibir os dados de Processo e indicar visualmente que o widget de tributos está indisponível.

---

## Adicionando Novas Métricas

### Passo 1 — Adicionar em `DATA_CATALOG` (`catalog.ts`)

```typescript
// Arquivo: servicos-global/tenant/dashboard/server/lib/catalog.ts
{
  key: 'meu-produto.nova_metrica',
  label: 'Nova Métrica',
  productId: 'meu-produto',
  productPort: 8030,
  type: 'currency',          // 'number' | 'currency' | 'date' | 'string' | 'percentage'
  aggregations: ['sum', 'avg'],
  permission: 'meu-produto:read',
  chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
}
```

**Regras:**
- `key` deve ser único em todo o `DATA_CATALOG`
- `key` deve seguir o padrão `produtoId.nomeEmSnakeCase`
- `productPort` deve corresponder ao valor em `contracts.json`
- `permission` deve ser registrada no sistema de permissões do Configurador

### Passo 2 — Adicionar em `CATALOG_WIDGETS` (`widget-registry.ts`)

```typescript
// Arquivo: servicos-global/tenant/dashboard/server/lib/widget-registry.ts
{
  id: 'meu-produto.nova_metrica',      // igual à key do CatalogField
  title: 'Nova Métrica',
  description: 'Descrição clara para o usuário final — aparece no tooltip do widget',
  productId: 'meu-produto',
  chartType: 'KPI_CARD',               // chart type padrão para este widget
  querySpec: {
    fields: ['meu-produto.nova_metrica'],
    operation: 'sum',
    filters: { period: '30d' },
  },
  size: 'sm',                           // 'sm' | 'md' | 'lg'
  category: 'financeiro',              // 'financeiro' | 'operacional'
}
```

### Passo 3 — Implementar no endpoint do produto

No servidor do produto (`produto/meu-produto/server/src/routes/dashboard.routes.ts`), adicionar o cálculo da nova métrica dentro do handler `POST /dashboard/widgets`:

```typescript
if (metrics.includes('nova_metrica')) {
  const result = await prisma.minhaEntidade.aggregate({
    where: { tenant_id: tenantId, created_at: { gte: startDate } },
    _sum: { valor: true },
  })
  response.nova_metrica = result._sum.valor ?? 0
}
```

### Verificação após adicionar

Após implementar os três passos, verifique:

- [ ] `GET /api/v1/dashboard/catalog/fields?product_id=meu-produto` retorna a nova métrica
- [ ] `GET /api/v1/dashboard/catalog/widgets?product_id=meu-produto` retorna o novo widget
- [ ] `POST /api/v1/dashboard/widgets/query` com a nova chave retorna dados (não `partial: true`)
- [ ] Um teste unitário foi adicionado em `testes/testes-unitarios/dashboard/catalog.test.ts`
- [ ] Um teste funcional foi adicionado em `testes/testes-funcionais/dashboard/product-dashboard-endpoints.test.ts`
