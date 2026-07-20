/**
 * Manual BID Frete — comparar propostas e fechar (16 prints, 1 frase + 1 tela).
 * Academy: uma galeria contínua (mesmo padrão das respostas do fornecedor).
 */
import type { DocGaleriaComparacaoTela, DocPassoVisual } from './manual-configurador-conteudo'
import { screenshotBidFreteInt as S } from './manual-bid-frete-catalogo-screenshots'
import { MANUAL_ESPACO_FRASE_IMAGEM_PX } from './manual-tipografia'

type GaleriaCompararFechar = NonNullable<DocPassoVisual['galeriaComparacaoAposParagrafo']>[number]

const GRADE_COMPARAR_FECHAR = {
  indice: 0,
  colunas: 1,
  textoAcimaEstiloCorpo: true,
  espacoTextoFiguraPx: MANUAL_ESPACO_FRASE_IMAGEM_PX,
} as const

export const TEXTO_BID_FRETE_COMPARAR_COTACOES_RESPONDIDAS =
  'Com **todas** ou **mais cotações respondidas**, é possível comparar **valores**, **qualidade**, **transit time**, **free time**, **escalas** e **prazo**.'

/** Transição pós-email do comprador → passo Comparar e fechar (uma frase, uma tela). */
export const TEXTO_BID_FRETE_HORA_COMPARAR_E_FECHAR =
  'Assim que **todos os fornecedores responderem**, é hora de comparar **preço**, **transit time**, **prazo**, **qualidade** e **fechar**.'

export const TEXTO_BID_FRETE_VARIOS_FORNECEDORES_COMPARE_CARDS =
  'Quando **vários fornecedores** responderem, compare os cards lado a lado e abra **Ver detalhamento completo** de cada proposta.'

/** Prints 1–5 — comparar propostas (uma frase + uma tela). Reutilizado no fim dos passos 5/6 e no passo 7. */
export const TELAS_ANALISE_FORNECEDOR_COMPARAR: { sufixo: string; paragrafoAntes: string }[] = [
  {
    sufixo: 'analise_fornecedor_1',
    paragrafoAntes:
      'Na **Visão geral**, o **Painel de Insights** resume **melhor proposta**, **ranking** e compara **transit time**, **free time** e **escala**.',
  },
  {
    sufixo: 'analise_fornecedor_2',
    paragrafoAntes:
      'Na aba **Propostas**, ordene por **score geral**, **menor preço**, **melhor trânsito**, **melhor avaliação**, **menor transbordo** ou **maior free time**.',
  },
  {
    sufixo: 'analise_fornecedor_3',
    paragrafoAntes: TEXTO_BID_FRETE_VARIOS_FORNECEDORES_COMPARE_CARDS,
  },
  {
    sufixo: 'analise_fornecedor_4',
    paragrafoAntes:
      'No **Detalhamento da proposta**, confira **frete base**, **taxas de origem**, **taxas de destino** e **valor total**.',
  },
  {
    sufixo: 'analise_fornecedor_5',
    paragrafoAntes:
      'No **Detalhamento da proposta**, confira **frete base**, **taxas de origem**, **taxas de destino** e **valor total**.',
  },
]

export function telasGaleriaAnaliseFornecedorComparar(): DocGaleriaComparacaoTela[] {
  return TELAS_ANALISE_FORNECEDOR_COMPARAR.map(({ sufixo, paragrafoAntes }) =>
    telaCompararFechar(sufixo, paragrafoAntes),
  )
}

const TELAS_APROVACAO_E_FECHAMENTO: { sufixo: string; paragrafoAntes: string }[] = [
  { sufixo: 'aprovacao_1', paragrafoAntes: 'Clique em **Aprovar** na proposta escolhida.' },
  {
    sufixo: 'aprovacao_2',
    paragrafoAntes:
      'Revise o **fornecedor selecionado**, o **valor total** e a **taxa de fechamento** no modal **Confirmar Aprovação**.',
  },
  {
    sufixo: 'aprovacao_3',
    paragrafoAntes:
      'Confira **transit time**, **free time** e **validade**; opcionalmente envie **mensagem para o agente** e clique em **Confirmar Aprovação**.',
  },
  {
    sufixo: 'aprovacao_4',
    paragrafoAntes:
      'A plataforma confirma a aprovação e exibe o **saving obtido**; clique em **Continuar**.',
  },
  {
    sufixo: 'aprovacao_5',
    paragrafoAntes:
      'O **Painel da Cotação** passa a **Aguard. fornecedor** até o ganhador aceitar no **email**.',
  },
  {
    sufixo: 'aprovado_fornecedor_1',
    paragrafoAntes:
      'O **fornecedor vencedor** recebe o email **Parabéns! Sua proposta foi aprovada** com ranking e valores.',
  },
  {
    sufixo: 'aprovado_fornecedor_2',
    paragrafoAntes:
      'No email, o **Resumo da cotação** traz o botão **Ir para confirmação**.',
  },
  {
    sufixo: 'aprovado_fornecedor_3',
    paragrafoAntes:
      'Na página pública, o fornecedor marca **Li e aceito o contrato de fechamento** e clica em **Recebi e estou de acordo**.',
  },
  {
    sufixo: 'aprovado_fornecedor_segundo_lugar',
    paragrafoAntes:
      'Quem ficou em **2º lugar** recebe o **Resultado da cotação** com a colocação por eixo.',
  },
  {
    sufixo: 'aprovado_fornecedor_terceiro_lugar',
    paragrafoAntes:
      'Quem ficou em **3º lugar** recebe o **Resultado da cotação** com a posição no ranking.',
  },
  {
    sufixo: 'aprovado_final',
    paragrafoAntes:
      'Após o aceite, o status avança para **Aprovada** e o painel exibe **Aprovação recebida**.',
  },
]

function telaCompararFechar(sufixo: string, paragrafoAntes: string): DocGaleriaComparacaoTela {
  return { legenda: '', imagem: S(sufixo), paragrafoAntes }
}

const TELAS_COMPARAR_FECHAR = [
  ...TELAS_ANALISE_FORNECEDOR_COMPARAR,
  ...TELAS_APROVACAO_E_FECHAMENTO,
]

/** §4.02 — galeria única (16 telas) para render contínuo no Academy e /docs. */
export const GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO: GaleriaCompararFechar = {
  ...GRADE_COMPARAR_FECHAR,
  telas: TELAS_COMPARAR_FECHAR.map(({ sufixo, paragrafoAntes }) => telaCompararFechar(sufixo, paragrafoAntes)),
}

/** Compat — consumidores que esperam array de galerias isoladas. */
export const GALERIAS_BID_FRETE_COMPARAR_FECHAR_COTACAO: GaleriaCompararFechar[] = [
  GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO,
]

/** §4.02.03 — passo próprio no sumário Academy (após Manual ou Smart Doc). */
export const PASSO_BID_FRETE_COMPARAR_FECHAR_COTACAO: DocPassoVisual = {
  titulo: 'Comparar e fechar',
  tituloCurto: 'Comparar e fechar',
  estiloTituloWizard: true,
  paragrafos: [],
  galeriaComparacaoAposParagrafo: [GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO],
}
