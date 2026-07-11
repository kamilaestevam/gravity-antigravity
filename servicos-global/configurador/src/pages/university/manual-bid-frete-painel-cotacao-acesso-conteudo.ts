import { screenshotBidFreteInt as S } from './manual-bid-frete-catalogo-screenshots'

/** §7.01 — três formas de abrir o Painel da Cotação. */
export const GALERIAS_BID_FRETE_PAINEL_COTACAO_ACESSO = [
  {
    indice: 0,
    textoAcimaEstiloCorpo: true,
    cenariosAcesso: [
      {
        titulo: 'Via mapa',
        chipAcessoPainelCotacao: 'mapa',
        texto:
          'No mapa de **Insights**, selecione uma **rota** ou pin{{icone:pin-mapa-bid-frete}} para abrir o painel na rota destacada.',
        imagem: S('painel_cotacao_acesso_1'),
      },
      {
        titulo: 'Via tooltip',
        chipAcessoPainelCotacao: 'tooltip',
        texto:
          'Passe o mouse sobre um **KPI** na aba **Insights** e clique no **link** da cotação no tooltip para abrir o **Painel da Cotação**.',
        imagem: S('painel_cotacao_acesso_2'),
      },
      {
        titulo: 'Via Lista',
        chipAcessoPainelCotacao: 'lista',
        texto:
          'Na aba **Lista**, clique no ícone {{icone:abrir-cotacao-lista-bid-frete}} na linha da cotação — ou use o botão {{botao:ir-para-cotacao-bid-frete}} após criar uma nova solicitação.',
        imagem: S('lista'),
      },
    ],
    telas: [
      {
        legenda: '',
        imagem: S('painel_cotacao_visao_geral'),
        paragrafoAntes:
          'Os **três** levam ao mesmo destino: o **Painel da Cotação**.',
      },
    ],
    colunas: 1,
    espacoInferiorAposEtapaPx: 22,
  },
] as const
