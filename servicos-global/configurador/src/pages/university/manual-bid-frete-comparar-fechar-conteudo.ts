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

/** Transição pós-análise → sequência de aprovação (uma frase, uma tela). */
export const TEXTO_BID_FRETE_DECISAO_APROVAR_COTACAO =
  'Com a **decisão tomada**, é hora de **aprovar a cotação**.'

/** Transição pós-aprovação → aceite do fornecedor (uma frase, uma tela). */
export const TEXTO_BID_FRETE_FORNECEDOR_CONFIRMACAO_ACEITE_FINAL =
  'O **fornecedor** irá receber a **confirmação** e o **aceite final**.'

/** Transição pós-aceite do ganhador → aviso aos demais colocados (uma frase, uma tela). */
export const TEXTO_BID_FRETE_OUTROS_COLOCADOS_AVISADOS =
  'Os outros colocados são avisados o lugar que ficaram, mas claro **sem ser revelado o frete dos concorrentes**.'

/** Transição pós-aceite → painel atualizado (uma frase, uma tela). */
export const TEXTO_BID_FRETE_PAINEL_ATUALIZADO_ACEITE_VENCEDOR =
  'Assim que o **fornecedor** confirma e aceita que é o **vencedor**, o **Painel** é **atualizado**.'

/** Subtítulos (`tituloEtapa`) — galeria pós-envio (Manual, Smart Doc e Comparar e fechar). */
export const TITULO_ETAPA_BID_FRETE_RESPOSTAS_FORNECEDOR = 'Respostas do fornecedor'
export const TITULO_ETAPA_BID_FRETE_COMPARAR_PROPOSTAS = 'Comparar propostas'
export const TITULO_ETAPA_BID_FRETE_APROVAR_COTACAO = 'Aprovar cotação'
export const TITULO_ETAPA_BID_FRETE_ACEITE_VENCEDOR = 'Aceite do vencedor'
export const TITULO_ETAPA_BID_FRETE_DEMAIS_COLOCADOS = 'Demais colocados'
export const TITULO_ETAPA_BID_FRETE_PAINEL_ATUALIZADO = 'Painel atualizado'

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
  return TELAS_ANALISE_FORNECEDOR_COMPARAR.map(({ sufixo, paragrafoAntes }, idx, arr) => {
    const tela = telaCompararFechar(sufixo, paragrafoAntes)
    if (idx === arr.length - 1) {
      return { ...tela, paragrafoDepois: TEXTO_BID_FRETE_DECISAO_APROVAR_COTACAO }
    }
    return tela
  })
}

const TELAS_APROVACAO_COTACAO: { sufixo: string; paragrafoAntes: string }[] = [
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
]

export function telasGaleriaAprovacaoCotacao(): DocGaleriaComparacaoTela[] {
  return TELAS_APROVACAO_COTACAO.map(({ sufixo, paragrafoAntes }, idx, arr) => {
    const tela = telaCompararFechar(sufixo, paragrafoAntes)
    if (idx === arr.length - 1) {
      return { ...tela, paragrafoDepois: TEXTO_BID_FRETE_FORNECEDOR_CONFIRMACAO_ACEITE_FINAL }
    }
    return tela
  })
}

const TELAS_APROVADO_FORNECEDOR_COTACAO: { sufixo: string; paragrafoAntes: string }[] = [
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
]

export function telasGaleriaAprovadoFornecedorCotacao(): DocGaleriaComparacaoTela[] {
  return TELAS_APROVADO_FORNECEDOR_COTACAO.map(({ sufixo, paragrafoAntes }, idx, arr) => {
    const tela = telaCompararFechar(sufixo, paragrafoAntes)
    if (idx === arr.length - 1) {
      return { ...tela, paragrafoDepois: TEXTO_BID_FRETE_OUTROS_COLOCADOS_AVISADOS }
    }
    return tela
  })
}

const TELAS_OUTROS_COLOCADOS_FORNECEDOR_COTACAO: { sufixo: string; paragrafoAntes: string }[] = [
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
]

export function telasGaleriaOutrosColocadosFornecedorCotacao(): DocGaleriaComparacaoTela[] {
  return TELAS_OUTROS_COLOCADOS_FORNECEDOR_COTACAO.map(({ sufixo, paragrafoAntes }, idx, arr) => {
    const tela = telaCompararFechar(sufixo, paragrafoAntes)
    if (idx === arr.length - 1) {
      return { ...tela, paragrafoDepois: TEXTO_BID_FRETE_PAINEL_ATUALIZADO_ACEITE_VENCEDOR }
    }
    return tela
  })
}

const TELAS_APROVADO_FINAL_COTACAO: { sufixo: string; paragrafoAntes: string }[] = [
  {
    sufixo: 'aprovado_final',
    paragrafoAntes:
      'Após o aceite, o status avança para **Aprovada** e o painel exibe **Aprovação recebida**.',
  },
]

export function telasGaleriaAprovadoFinalCotacao(): DocGaleriaComparacaoTela[] {
  return TELAS_APROVADO_FINAL_COTACAO.map(({ sufixo, paragrafoAntes }) =>
    telaCompararFechar(sufixo, paragrafoAntes),
  )
}

function telaCompararFechar(sufixo: string, paragrafoAntes: string): DocGaleriaComparacaoTela {
  return { legenda: '', imagem: S(sufixo), paragrafoAntes }
}

function galeriaComTituloEtapa(
  tituloEtapa: string,
  telas: DocGaleriaComparacaoTela[],
): GaleriaCompararFechar {
  return { ...GRADE_COMPARAR_FECHAR, tituloEtapa, telas }
}

/** §4.02 — blocos temáticos pós-envio (21 telas, mesma ordem — Manual e Smart Doc). */
export function galeriasCotacaoAvulsaPosEnvioFornecedor(
  telasRespostasFornecedor: DocGaleriaComparacaoTela[],
): GaleriaCompararFechar[] {
  return [
    galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_RESPOSTAS_FORNECEDOR, telasRespostasFornecedor),
    galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_COMPARAR_PROPOSTAS, telasGaleriaAnaliseFornecedorComparar()),
    galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_APROVAR_COTACAO, telasGaleriaAprovacaoCotacao()),
    galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_ACEITE_VENCEDOR, telasGaleriaAprovadoFornecedorCotacao()),
    galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_DEMAIS_COLOCADOS, telasGaleriaOutrosColocadosFornecedorCotacao()),
    galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_PAINEL_ATUALIZADO, telasGaleriaAprovadoFinalCotacao()),
  ]
}

/** §4.02 — 5 blocos temáticos (16 telas) para Comparar e fechar no Academy e /docs. */
export const GALERIAS_BID_FRETE_COMPARAR_FECHAR_COTACAO: GaleriaCompararFechar[] = [
  galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_COMPARAR_PROPOSTAS, telasGaleriaAnaliseFornecedorComparar()),
  galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_APROVAR_COTACAO, telasGaleriaAprovacaoCotacao()),
  galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_ACEITE_VENCEDOR, telasGaleriaAprovadoFornecedorCotacao()),
  galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_DEMAIS_COLOCADOS, telasGaleriaOutrosColocadosFornecedorCotacao()),
  galeriaComTituloEtapa(TITULO_ETAPA_BID_FRETE_PAINEL_ATUALIZADO, telasGaleriaAprovadoFinalCotacao()),
]

/** Compat — telas achatadas (testes e consumidores legados). */
export const GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO: GaleriaCompararFechar = {
  ...GRADE_COMPARAR_FECHAR,
  telas: GALERIAS_BID_FRETE_COMPARAR_FECHAR_COTACAO.flatMap((g) => g.telas),
}

/** §4.02.03 — passo próprio no sumário Academy (após Manual ou Smart Doc). */
export const PASSO_BID_FRETE_COMPARAR_FECHAR_COTACAO: DocPassoVisual = {
  titulo: 'Comparar e fechar',
  tituloCurto: 'Comparar e fechar',
  estiloTituloWizard: true,
  paragrafos: [],
  galeriaComparacaoAposParagrafo: GALERIAS_BID_FRETE_COMPARAR_FECHAR_COTACAO,
}
