/**
 * SSOT manual: motor `generateSuggestions` + `BUILT_IN_DERIVED` (Dashboard Pedido).
 * Atualizar quando o catálogo ou métricas derivadas mudarem.
 */

export type ManualPedidoLinhaSugestaoDashboard = {
  titulo: string
  tipoGrafico: string
  periodo: string
  campos: string
  oQueFaz: string
}

export type ManualPedidoGrupoSugestaoDashboard = {
  id: string
  titulo: string
  itens: ManualPedidoLinhaSugestaoDashboard[]
}

export const TOTAL_SUGESTOES_DASHBOARD_PEDIDO = 12

export const GRUPOS_SUGESTOES_DASHBOARD_PEDIDO: ManualPedidoGrupoSugestaoDashboard[] = [
  {
    id: 'distribuicao',
    titulo: 'Distribuição (pizza)',
    itens: [
      {
        titulo: 'Distribuição de Status dos Pedidos',
        tipoGrafico: 'Distribuição',
        periodo: '30 dias (recorte global)',
        campos: 'Pedidos Abertos · Em Andamento · Pedidos Atrasados · Consolidados · Cancelados · Rascunhos',
        oQueFaz:
          'Mostra a **proporção** de pedidos em cada **status** no período e filtros ativos — cada fatia é uma contagem; o total reflete o recorte da barra.',
      },
    ],
  },
  {
    id: 'tendencia_volume',
    titulo: 'Evolução mensal — volume (linha)',
    itens: [
      {
        titulo: 'Total de Pedidos por Mês',
        tipoGrafico: 'Linha',
        periodo: '12 meses (fixo no widget)',
        campos: 'Total de Pedidos (contagem)',
        oQueFaz:
          'Série **mensal** da quantidade de pedidos nos **últimos 12 meses**. Usa período **próprio** (12m) — **não acompanha** o seletor global da barra.',
      },
    ],
  },
  {
    id: 'tendencia_valor',
    titulo: 'Evolução mensal — valores (linha)',
    itens: [
      {
        titulo: 'Evolução — Valor Total dos Pedidos',
        tipoGrafico: 'Linha',
        periodo: '12 meses (fixo no widget)',
        campos: 'Valor Total dos Pedidos (soma)',
        oQueFaz: 'Curva mensal da **soma** do valor total dos POs — tendência de exposição comercial no ano.',
      },
      {
        titulo: 'Evolução — Exposição Cambial (BRL)',
        tipoGrafico: 'Linha',
        periodo: '12 meses (fixo no widget)',
        campos: 'Exposição Cambial BRL (soma)',
        oQueFaz: 'Evolução mensal do valor convertido para **real** — acompanha pressão cambial agregada.',
      },
      {
        titulo: 'Evolução — Cobertura Cambial a Contratar',
        tipoGrafico: 'Linha',
        periodo: '12 meses (fixo no widget)',
        campos: 'Cobertura Cambial a Contratar (soma)',
        oQueFaz: 'Série da **cobertura ainda pendente** mês a mês — útil para antecipar necessidade de hedge.',
      },
      {
        titulo: 'Evolução — Valor dos Itens (FOB/CIF)',
        tipoGrafico: 'Linha',
        periodo: '12 meses (fixo no widget)',
        campos: 'Valor dos Itens FOB/CIF (soma)',
        oQueFaz: 'Tendência do **valor agregado das linhas** de item — complementa o valor total do pedido.',
      },
    ],
  },
  {
    id: 'comparativo_qty',
    titulo: 'Comparativo de quantidades (barras)',
    itens: [
      {
        titulo: 'Comparativo de Quantidades — Itens',
        tipoGrafico: 'Barras',
        periodo: '30 dias (recorte global)',
        campos: 'Itens Prontos · Qtd. Atual (Itens) · Qtd. Transferida',
        oQueFaz:
          'Barras lado a lado com **soma de quantidades** de item no recorte — compara prontidão, saldo atual e volume já transferido.',
      },
    ],
  },
  {
    id: 'metricas_derivadas',
    titulo: 'Métricas derivadas (KPI)',
    itens: [
      {
        titulo: 'Taxa de Atraso dos Pedidos',
        tipoGrafico: 'KPI',
        periodo: '30 dias (recorte global)',
        campos: 'Pedidos Atrasados ÷ Total de Pedidos',
        oQueFaz: '**Percentual** de POs atrasados sobre o total no período — indicador de pontualidade da carteira.',
      },
      {
        titulo: 'Ticket Médio',
        tipoGrafico: 'KPI',
        periodo: '30 dias (recorte global)',
        campos: 'Valor Total ÷ Total de Pedidos',
        oQueFaz: '**Valor médio** por pedido no recorte — divide soma financeira pela contagem de POs.',
      },
      {
        titulo: 'Conclusão de Itens',
        tipoGrafico: 'KPI',
        periodo: '30 dias (recorte global)',
        campos: 'Itens Prontos ÷ Qtd. Inicial (itens)',
        oQueFaz: '**Percentual** de itens prontos em relação à quantidade inicial — progresso de preparação das linhas.',
      },
      {
        titulo: 'Exposição Financeira',
        tipoGrafico: 'KPI',
        periodo: '30 dias (recorte global)',
        campos: 'Cobertura Pendente ÷ Valor Total',
        oQueFaz: 'Quanto da **cobertura cambial pendente** representa sobre o valor total — risco financeiro relativo.',
      },
      {
        titulo: 'Progresso de Transferência',
        tipoGrafico: 'KPI',
        periodo: '30 dias (recorte global)',
        campos: 'Qtd. Transferida ÷ Qtd. Inicial (itens)',
        oQueFaz: '**Percentual** já transferido em relação ao volume inicial de itens — acompanha movimentação entre POs.',
      },
    ],
  },
]
