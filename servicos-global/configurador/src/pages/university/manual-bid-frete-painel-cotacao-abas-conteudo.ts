import type { DocPassoVisual } from './manual-configurador-conteudo'
import { screenshotBidFreteInt as S } from './manual-bid-frete-catalogo-screenshots'

type PassoSemNumero = Omit<DocPassoVisual, 'num' | 'rotuloSecao' | 'numPai' | 'passosFilhos'>

/** §7.02–7.07 — abas do Painel da Cotação (cockpit da cotação). */
export const PASSOS_MANUAL_BID_FRETE_PAINEL_COTACAO_ABAS: PassoSemNumero[] = [
  {
    titulo: 'Visão geral do painel de cotação',
    tituloCurto: 'Visão geral do painel de cotação',
    paragrafos: [
      'A aba **Visão geral** é o cockpit da cotação: reúne **cabeçalho**, **prazo para resposta**, **métricas de competição**, **linha do tempo**, o **Painel de Insights Inteligente** e os cards de **Detalhes gerais**, **Rota** e **Detalhes da carga**.',
    ],
    mostrarInfograficoBidFreteAbasPainelCotacao: true,
    galeriaTelasAposTabela: [
      {
        legenda: 'Visão geral',
        pilaresAbasPainelCotacaoBidFrete: ['01'],
        paragrafoAntes:
          'Tela principal de **detalhamento**, **gestão** e **navegação** do **Painel de Cotações**.',
      },
      {
        legenda: 'Menu Superior',
        legendaAlinhamento: 'left',
        paragrafoAntes:
          'Dados do **prazo para resposta**, **quantificação** para controle rápido e **linha do tempo**.',
        imagem: S('painel_cotacao_menu_superior'),
        calloutDepois: {
          tipo: 'dica',
          texto: 'Todas as **métricas** são alimentadas automaticamente.',
        },
      },
      {
        legenda: 'Insights',
        legendaAlinhamento: 'left',
        paragrafoAntes:
          '**Painel de Insights Inteligente** com **melhor proposta**, **ranking** das respostas e **termômetro histórico**.',
        simuladorBidFretePainelInsights: true,
      },
    ],
  },
  {
    titulo: 'Dados gerais',
    tituloCurto: 'Dados gerais',
    paragrafos: [
      'Na aba **Dados gerais**, **alguns campos da cotação podem ser editados** — ajuste **tipo de operação**, **modal**, **incoterm**, **visibilidade**, **datas** e demais identificadores da solicitação.',
      'Use este espaço para corrigir o escopo da cotação **antes de reenviar** aos fornecedores ou para revisar o que já foi publicado na **Solicitação de Cotação**.',
    ],
    galeriaTelasAposTabela: [
      {
        imagem: S('painel_cotacao_dados_gerais'),
        legenda: '',
      },
    ],
  },
  {
    titulo: 'Solicitação de cotação',
    tituloCurto: 'Solicitação de cotação',
    paragrafos: [
      'A aba **Solicitação de Cotação** lista cada **disparo** enviado aos fornecedores: e-mails, visualizações, respostas e **recusas**.',
      'Acompanhe quem recebeu o pedido, filtre **recusas** e reenvie quando precisar ampliar o leque de agentes de carga.',
    ],
    imagem: S('painel_cotacao_solicitacao'),
    imagemAbaixoTexto: true,
  },
  {
    titulo: 'Propostas',
    tituloCurto: 'Propostas',
    paragrafos: [
      'Em **Propostas**, compare ofertas lado a lado: **frete total**, **transit time**, **escala/transbordo** e **prazo de pagamento**.',
      'Avance para **aprovar** a melhor resposta ou abra o **comparativo** completo quando houver múltiplos fornecedores no mesmo escopo.',
    ],
    imagem: S('painel_cotacao_propostas'),
    imagemAbaixoTexto: true,
  },
  {
    titulo: 'Comentários',
    tituloCurto: 'Comentários',
    paragrafos: [
      'A aba **Comentários** reunirá o histórico de observações internas e trocas com fornecedores sobre a cotação.',
    ],
    badgeEmDesenvolvimento: true,
  },
  {
    titulo: 'Documentos',
    tituloCurto: 'Documentos',
    paragrafos: [
      'A aba **Documentos** centralizará anexos comerciais, packing lists e demais arquivos vinculados à negociação.',
    ],
    badgeEmDesenvolvimento: true,
  },
]
