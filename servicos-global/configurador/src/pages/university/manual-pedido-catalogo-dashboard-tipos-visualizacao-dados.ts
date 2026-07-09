/**
 * SSOT manual: `buildChartOptions` em DashboardConstrutorConsulta (Passo 3 — Visualizar).
 */

export type ManualPedidoLinhaTipoVisualizacaoDashboard = {
  titulo: string
  requisitos: string
  melhorPara: string
  oQueFaz: string
}

export type ManualPedidoGrupoTipoVisualizacaoDashboard = {
  id: string
  titulo: string
  itens: ManualPedidoLinhaTipoVisualizacaoDashboard[]
}

export const TOTAL_TIPOS_VISUALIZACAO_DASHBOARD_PEDIDO = 10

export const GRUPOS_TIPOS_VISUALIZACAO_DASHBOARD_PEDIDO: ManualPedidoGrupoTipoVisualizacaoDashboard[] = [
  {
    id: 'indicador',
    titulo: 'Indicador único',
    itens: [
      {
        titulo: 'KPI',
        requisitos: '1 campo · qualquer unidade (#, R$ ou %)',
        melhorPara: 'Número agregado em destaque (total, média, taxa)',
        oQueFaz:
          'Exibe **um único valor** resultante da operação escolhida (soma, contagem, média…) no período do widget — ideal para metas e totais rápidos.',
      },
      {
        titulo: 'Gauge',
        requisitos: '1 campo · preferencialmente percentual ou meta',
        melhorPara: 'Progresso ou nível em relação a um teto',
        oQueFaz:
          'Mostra o valor em um **medidor semicircular** — útil para percentuais (ex.: taxa de conclusão) quando você quer leitura visual de «quanto falta».',
      },
    ],
  },
  {
    id: 'serie_temporal',
    titulo: 'Série temporal',
    itens: [
      {
        titulo: 'Linha',
        requisitos: '1 campo · série mensal no período',
        melhorPara: 'Tendência ao longo do tempo',
        oQueFaz:
          'Plota a evolução **mês a mês** do campo agregado — linha contínua para acompanhar crescimento, queda ou sazonalidade.',
      },
      {
        titulo: 'Área',
        requisitos: '1 campo · série mensal no período',
        melhorPara: 'Volume acumulado visualmente',
        oQueFaz:
          'Mesma lógica da **linha**, com a área abaixo da curva preenchida — enfatiza magnitude do valor no tempo.',
      },
    ],
  },
  {
    id: 'comparativo',
    titulo: 'Comparativo',
    itens: [
      {
        titulo: 'Barras',
        requisitos: '1 campo · categorias ou meses no eixo',
        melhorPara: 'Comparar magnitudes lado a lado',
        oQueFaz:
          'Barras **verticais** — cada barra representa o valor agregado do campo no recorte (ex.: total por mês ou por fatia de status quando aplicável).',
      },
      {
        titulo: 'Barras H.',
        requisitos: '1 campo',
        melhorPara: 'Ranking ou rótulos longos',
        oQueFaz:
          'Barras **horizontais** — mesma agregação das barras verticais, com leitura mais confortável quando há muitos rótulos ou ordenação por tamanho.',
      },
    ],
  },
  {
    id: 'proporcao',
    titulo: 'Proporção',
    itens: [
      {
        titulo: 'Distribuição',
        requisitos: '≥ 2 campos · **mesma unidade** (#, R$ ou %)',
        melhorPara: 'Fatias de um todo (status, mix)',
        oQueFaz:
          'Gráfico de **pizza** com uma fatia por campo — mostra a proporção relativa entre contagens ou valores compatíveis. No **Criar do zero** (1 campo por widget) fica **indisponível**; use **Explorar sugestões** para montar distribuições prontas (ex.: status dos pedidos).',
      },
      {
        titulo: 'Donut',
        requisitos: '1 campo',
        melhorPara: 'Proporção simples ou composição mono-métrica',
        oQueFaz:
          'Rosca com segmentos derivados do campo — alternativa compacta à pizza quando há uma métrica principal a destacar.',
      },
    ],
  },
  {
    id: 'estruturado',
    titulo: 'Estruturado',
    itens: [
      {
        titulo: 'Tabela',
        requisitos: '1 campo (ou mais quando suportado)',
        melhorPara: 'Consulta detalhada com números exatos',
        oQueFaz:
          'Lista os valores em **linhas e colunas** — quando você precisa ler números precisos em vez de inferir pelo gráfico.',
      },
      {
        titulo: 'Funil',
        requisitos: '1 campo · estágios ordenados',
        melhorPara: 'Etapas sequenciais com queda progressiva',
        oQueFaz:
          'Visualização em **funil** — cada degrau representa um estágio; útil para ver perda entre fases (ex.: abertos → em andamento → consolidados).',
      },
    ],
  },
]
