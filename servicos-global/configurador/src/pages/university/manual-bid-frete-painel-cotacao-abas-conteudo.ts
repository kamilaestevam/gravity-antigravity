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
      'Nesse local é possível acompanhar todas as solicitações de cotacões enviadas, para quem, como, status, link da resposta, data de envio e data da resposta.',
    ],
    imagem: S('painel_cotacao_solicitacao_cotacao'),
    imagemAbaixoTexto: true,
    calloutAposImagem: {
      tipo: 'dica',
      texto: 'Todas as colunas são atualizadas automaticamente.',
    },
    paragrafosAposImagem: [
      'O usuário pode clicar e abrir e ver exatamente o que seu fornecedor irá receber.',
    ],
    galeriaComparacaoAposImagem: [
      {
        colunas: 1,
        telas: [{ legenda: '', imagem: S('painel_cotacao_solicitacao_cotacao_link_acesso_cliente') }],
      },
      {
        colunas: 1,
        telas: [{
          legenda: '',
          paragrafoAntes:
            'Caso o e-mail não esteja correto ou não cadastrado, o erro de envio será exibido.',
          imagem: S('painel_cotacao_solicitacao_cotacao_erro_email'),
        }],
      },
      {
        tituloEtapa: 'Cotação válida e token não utilizado',
        textoIntro:
          'Esta é exatamente a visão e o formulário que o fornecedor deve responder.',
        chipBidFreteTokenNaoUtilizado: true,
        colunas: 1,
        telas: [{ legenda: '', imagem: S('painel_cotacao_solicitacao_cotacao_link_resposta') }],
        calloutApos: {
          tipo: 'dica',
          texto:
            'No último passo da cotação existe a opção **Permitir edição da proposta**. Se estiver marcado **Sim**, enquanto o prazo estiver válido a proposta pode ser editada.',
        },
      },
      {
        tituloEtapa: 'Token utilizado ou prazo vencido',
        textoIntro:
          'Neste caso o token foi usado pelo fornecedor ou prazo da cotação não é mais válido.',
        chipBidFreteTokenUtilizado: true,
        colunas: 1,
        telas: [{ legenda: '', imagem: S('painel_cotacao_solicitacao_cotacao_link_expirado') }],
        calloutApos: {
          tipo: 'dica',
          texto:
            'No último passo da cotação existe a opção **Permitir edição da proposta**. Se estiver marcado **Não**, após o fornecedor responder uma vez, esta é a mensagem que será exibida.',
        },
      },
    ],
  },
  {
    titulo: 'Propostas',
    tituloCurto: 'Propostas',
    paragrafos: [
      'Neste local encontra-se todas as propostas detalhadas respondidas pelos fornecedores.',
    ],
    imagem: S('painel_cotacao_propostas_1'),
    imagemAbaixoTexto: true,
    legendaAposImagem: 'Ranking',
    legendaAposImagemAlinhamento: 'left',
    galeriaComparacaoAposImagem: [
      {
        colunas: 1,
        telas: [{
          legenda: '',
          paragrafoAntes:
            'Aqui ficam os rankings das cotações respondidas podendo ser ordenadas por: **Menor preço**, **Melhor trânsito**, **Melhor avaliação**, **Melhor transbordo**, **Maior free time**.',
          imagem: S('painel_cotacao_propostas_ranking'),
          legendaApos: 'Detalhamento da proposta',
          legendaAposAlinhamento: 'left',
        }],
      },
      {
        colunas: 1,
        telas: [{
          legenda: '',
          paragrafoAntes:
            'Para acessar o detalhamento completo da proposta, clique em **Ver detalhamento completo**.',
          imagem: S('painel_cotacao_propostas_detalhamento_completo'),
        }],
      },
    ],
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
