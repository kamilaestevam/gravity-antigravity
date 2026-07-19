import { screenshotBidFreteInt as S } from './manual-bid-frete-catalogo-screenshots'

/** §7.01 — acesso ao Painel da Cotação via Lista e Insights. */
export const GALERIAS_BID_FRETE_PAINEL_COTACAO_ACESSO = [
  {
    indice: 0,
    colunas: 1,
    telas: [
      {
        legenda: 'Via Lista',
        imagem: S('lista_cotacao_painel_acesso_via_lista'),
        paragrafoAntes:
          'Na aba **Lista**, clique no ícone {{icone:abrir-cotacao-lista-bid-frete}} na linha da cotação — ou use o botão {{botao:ir-para-cotacao-bid-frete}} após criar uma nova solicitação.',
      },
      {
        legenda: 'Via Insights',
        imagem: S('lista_cotacao_painel_acesso_via_insight'),
        paragrafoAntes:
          'Em **Insights**, selecione uma **rota** ou pin{{icone:pin-mapa-bid-frete}} no **mapa** para abrir o painel na rota destacada.',
      },
      {
        legenda: '',
        imagem: S('lista_cotacao_painel_acesso_via_insight_1'),
        paragrafoAntes:
          'Passe o mouse sobre um **KPI** e clique no **link** da cotação no tooltip — os dois caminhos levam ao mesmo **Painel da Cotação**.',
      },
    ],
  },
] as const
