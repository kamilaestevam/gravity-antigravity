import type { DocPassoVisual } from './manual-configurador-conteudo'
import { screenshotBidFreteInt as S } from './manual-bid-frete-catalogo-screenshots'

type PassoSemNumero = Omit<DocPassoVisual, 'num' | 'rotuloSecao' | 'numPai' | 'passosFilhos'>

/** §7.02–7.07 — abas do Painel da Cotação (cockpit da cotação). */
export const PASSOS_MANUAL_BID_FRETE_PAINEL_COTACAO_ABAS: PassoSemNumero[] = [
  {
    titulo: 'Visão geral',
    tituloCurto: 'Visão geral',
    paragrafos: [
      'O cockpit da cotação abre com **cabeçalho**, **prazo para resposta**, **métricas de competição** e a **linha do tempo** do status.',
      'O **Painel de Insights Inteligente** destaca a **melhor proposta**, o **ranking das respostas** e o **termômetro histórico** — atalhos para decidir com rapidez.',
      'Na aba **Visão geral**, consulte **Detalhes gerais**, **Rota** e **Detalhes da carga** em cards lado a lado.',
    ],
    imagem: S('painel_cotacao_visao_geral'),
    imagemAbaixoTexto: true,
  },
  {
    titulo: 'Dados gerais',
    tituloCurto: 'Dados gerais',
    paragrafos: [
      'A aba **Dados gerais** concentra os campos editáveis da solicitação: **tipo de operação**, **modal**, **incoterm**, **visibilidade**, **datas** e demais identificadores da cotação.',
      'Use esta área para ajustar o escopo antes de reenviar aos fornecedores ou revisar o que foi publicado na **Solicitação de Cotação**.',
    ],
    imagem: S('painel_cotacao_dados_gerais'),
    imagemAbaixoTexto: true,
  },
  {
    titulo: 'Solicitação de Cotação',
    tituloCurto: 'Solicitação de Cotação',
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
