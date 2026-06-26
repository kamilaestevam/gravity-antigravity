/**
 * Base de tempos comparativos Smart Read (DOCS BASE PRODUTO).
 * SSOT compartilhado entre lista, insights e BFF.
 */

export type TipoDocumentoBaseSmartRead =
  | 'bl'
  | 'awb'
  | 'invoice'
  | 'packing_list'
  | 'proforma'
  | 'pedido'
  | 'outros'

export type ParametrosTempoDocumentoSmartRead = {
  tipo_documento: TipoDocumentoBaseSmartRead
  rotulo: string
  campos_medio: number
  tempo_digitação_manual_minutos: number
  tempo_digitação_smart_read_minutos: number
  tempo_correcao_erro_manual_minutos_por_campo: number
  tempo_correcao_erro_smart_read_minutos_por_campo: number
}

export type ParametrosFinanceirosSmartRead = {
  custo_hora_operador_brl: number
  markup_venda: number
}

export const PARAMETROS_FINANCEIROS_SMART_READ: ParametrosFinanceirosSmartRead = {
  custo_hora_operador_brl: 85,
  markup_venda: 1.35,
}

/**
 * Estudo DOCS BASE PRODUTO — taxa média de erro na digitação manual.
 * Equivale a ~3 erros evitados a cada 10.000 campos extraídos (0,03%).
 */
export const ERROS_EVITADOS_POR_10_000_CAMPOS_ESTUDO_SMART_READ = 3

export type ContagemAcertoErroEstudoSmartRead = {
  total: number
  corretos: number
  errados: number
  taxa_acerto: number | null
}

/** Erros evitados (estimativa do estudo) a partir do volume de campos extraídos. */
export function estimarCamposErradosEvitadosSmartRead(totalCamposExtraidos: number): number {
  if (totalCamposExtraidos <= 0) return 0
  return Math.round(
    (totalCamposExtraidos * ERROS_EVITADOS_POR_10_000_CAMPOS_ESTUDO_SMART_READ) / 10_000,
  )
}

/** SSOT de acerto/erro para métricas e savings em todo o Smart Docs. */
export function resolverContagemAcertoErroEstudoSmartRead(
  totalCamposExtraidos: number,
): ContagemAcertoErroEstudoSmartRead {
  if (totalCamposExtraidos <= 0) {
    return { total: 0, corretos: 0, errados: 0, taxa_acerto: null }
  }
  const errados = estimarCamposErradosEvitadosSmartRead(totalCamposExtraidos)
  const corretos = Math.max(0, totalCamposExtraidos - errados)
  return {
    total: totalCamposExtraidos,
    corretos,
    errados,
    taxa_acerto: corretos / totalCamposExtraidos,
  }
}

/** Ordem e rótulos da tabela «Base de cálculo» (estudo DOCS BASE PRODUTO). */
export const LINHAS_TABELA_EXIBICAO_BASE_CALCULO_SMART_READ: {
  rotulo_exibicao: string
  tempo_digitação_manual_minutos: number
  tipo_parametro: TipoDocumentoBaseSmartRead
}[] = [
  { rotulo_exibicao: 'Pedido', tempo_digitação_manual_minutos: 16.1, tipo_parametro: 'pedido' },
  { rotulo_exibicao: 'Proforma', tempo_digitação_manual_minutos: 16.1, tipo_parametro: 'proforma' },
  { rotulo_exibicao: 'Invoice', tempo_digitação_manual_minutos: 16.1, tipo_parametro: 'invoice' },
  {
    rotulo_exibicao: 'Packing List',
    tempo_digitação_manual_minutos: 19.054,
    tipo_parametro: 'packing_list',
  },
  { rotulo_exibicao: 'BL', tempo_digitação_manual_minutos: 12.1, tipo_parametro: 'bl' },
  { rotulo_exibicao: 'AWB', tempo_digitação_manual_minutos: 9.02, tipo_parametro: 'awb' },
  {
    rotulo_exibicao: 'Documentos Financeiros',
    tempo_digitação_manual_minutos: 20,
    tipo_parametro: 'outros',
  },
]

export const OBSERVACOES_DOCUMENTO_MEDIO_ESTUDO_SMART_READ: { rotulo: string; texto: string }[] = [
  { rotulo: 'Invoice / Proforma / Pedido', texto: '20 itens' },
  { rotulo: 'Packing List', texto: '10 linhas' },
  { rotulo: 'Documentos Financeiros', texto: '10 linhas' },
  {
    rotulo: 'BL / AWB',
    texto:
      'documento de cabeçalho (sem contagem de itens; o que pesa é a quantidade de contêineres)',
  },
]

export const BASE_TEMPO_DOCUMENTO_SMART_READ: ParametrosTempoDocumentoSmartRead[] = [
  {
    tipo_documento: 'pedido',
    rotulo: 'Pedido',
    campos_medio: 30,
    tempo_digitação_manual_minutos: 16.1,
    tempo_digitação_smart_read_minutos: 3.5,
    tempo_correcao_erro_manual_minutos_por_campo: 1.7,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.42,
  },
  {
    tipo_documento: 'proforma',
    rotulo: 'Proforma',
    campos_medio: 36,
    tempo_digitação_manual_minutos: 16.1,
    tempo_digitação_smart_read_minutos: 4.0,
    tempo_correcao_erro_manual_minutos_por_campo: 1.9,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.48,
  },
  {
    tipo_documento: 'invoice',
    rotulo: 'Invoice',
    campos_medio: 42,
    tempo_digitação_manual_minutos: 16.1,
    tempo_digitação_smart_read_minutos: 4.5,
    tempo_correcao_erro_manual_minutos_por_campo: 2.1,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.55,
  },
  {
    tipo_documento: 'packing_list',
    rotulo: 'Packing List',
    campos_medio: 46,
    tempo_digitação_manual_minutos: 19.054,
    tempo_digitação_smart_read_minutos: 5.2,
    tempo_correcao_erro_manual_minutos_por_campo: 2.0,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.5,
  },
  {
    tipo_documento: 'bl',
    rotulo: 'Bill of Lading',
    campos_medio: 86,
    tempo_digitação_manual_minutos: 12.1,
    tempo_digitação_smart_read_minutos: 9,
    tempo_correcao_erro_manual_minutos_por_campo: 2.8,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.75,
  },
  {
    tipo_documento: 'awb',
    rotulo: 'AWB',
    campos_medio: 54,
    tempo_digitação_manual_minutos: 9.02,
    tempo_digitação_smart_read_minutos: 6.5,
    tempo_correcao_erro_manual_minutos_por_campo: 2.4,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.65,
  },
  {
    tipo_documento: 'outros',
    rotulo: 'Documentos Financeiros',
    campos_medio: 28,
    tempo_digitação_manual_minutos: 20,
    tempo_digitação_smart_read_minutos: 3.2,
    tempo_correcao_erro_manual_minutos_por_campo: 1.6,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.4,
  },
]

const MAPA_TIPO = new Map<string, TipoDocumentoBaseSmartRead>([
  ['bill of lading', 'bl'],
  ['bl', 'bl'],
  ['b/l', 'bl'],
  ['awb', 'awb'],
  ['air waybill', 'awb'],
  ['invoice', 'invoice'],
  ['commercial invoice', 'invoice'],
  ['packing list', 'packing_list'],
  ['packing', 'packing_list'],
  ['proforma', 'proforma'],
  ['pro forma', 'proforma'],
  ['pedido', 'pedido'],
  ['purchase order', 'pedido'],
])

export function normalizarTipoDocumentoBaseSmartRead(
  rotulo: string | null | undefined,
): TipoDocumentoBaseSmartRead {
  const chave = (rotulo ?? '').trim().toLowerCase()
  if (!chave) return 'outros'
  for (const [padrao, tipo] of MAPA_TIPO) {
    if (chave.includes(padrao)) return tipo
  }
  return 'outros'
}

export function resolverParametrosTempoDocumentoSmartRead(
  tipo: TipoDocumentoBaseSmartRead,
): ParametrosTempoDocumentoSmartRead {
  return (
    BASE_TEMPO_DOCUMENTO_SMART_READ.find((item) => item.tipo_documento === tipo) ??
    BASE_TEMPO_DOCUMENTO_SMART_READ.find((item) => item.tipo_documento === 'outros')!
  )
}

export type MediasTabelaBaseCalculoSmartRead = {
  tempo_digitação_manual_minutos: number
  tempo_digitação_smart_read_minutos: number
  tempo_correcao_erro_manual_minutos_por_campo: number
  tempo_correcao_erro_smart_read_minutos_por_campo: number
}

/** Médias aritméticas das linhas exibidas na tabela «Base de cálculo». */
export function calcularMediasTabelaBaseCalculoSmartRead(): MediasTabelaBaseCalculoSmartRead {
  const linhas = LINHAS_TABELA_EXIBICAO_BASE_CALCULO_SMART_READ
  let somaManual = 0
  let somaSmartRead = 0
  let somaCorrecaoManual = 0
  let somaCorrecaoSmartRead = 0

  for (const linha of linhas) {
    const params = resolverParametrosTempoDocumentoSmartRead(linha.tipo_parametro)
    somaManual += linha.tempo_digitação_manual_minutos
    somaSmartRead += params.tempo_digitação_smart_read_minutos
    somaCorrecaoManual += params.tempo_correcao_erro_manual_minutos_por_campo
    somaCorrecaoSmartRead += params.tempo_correcao_erro_smart_read_minutos_por_campo
  }

  const quantidade = linhas.length
  return {
    tempo_digitação_manual_minutos: somaManual / quantidade,
    tempo_digitação_smart_read_minutos: somaSmartRead / quantidade,
    tempo_correcao_erro_manual_minutos_por_campo: somaCorrecaoManual / quantidade,
    tempo_correcao_erro_smart_read_minutos_por_campo: somaCorrecaoSmartRead / quantidade,
  }
}
