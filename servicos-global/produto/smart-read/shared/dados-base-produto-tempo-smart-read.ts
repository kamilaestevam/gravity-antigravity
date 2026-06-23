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

export const BASE_TEMPO_DOCUMENTO_SMART_READ: ParametrosTempoDocumentoSmartRead[] = [
  {
    tipo_documento: 'bl',
    rotulo: 'Bill of Lading',
    campos_medio: 86,
    tempo_digitação_manual_minutos: 48,
    tempo_digitação_smart_read_minutos: 9,
    tempo_correcao_erro_manual_minutos_por_campo: 2.8,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.75,
  },
  {
    tipo_documento: 'awb',
    rotulo: 'AWB',
    campos_medio: 54,
    tempo_digitação_manual_minutos: 32,
    tempo_digitação_smart_read_minutos: 6.5,
    tempo_correcao_erro_manual_minutos_por_campo: 2.4,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.65,
  },
  {
    tipo_documento: 'invoice',
    rotulo: 'Invoice',
    campos_medio: 42,
    tempo_digitação_manual_minutos: 24,
    tempo_digitação_smart_read_minutos: 4.5,
    tempo_correcao_erro_manual_minutos_por_campo: 2.1,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.55,
  },
  {
    tipo_documento: 'packing_list',
    rotulo: 'Packing List',
    campos_medio: 46,
    tempo_digitação_manual_minutos: 27,
    tempo_digitação_smart_read_minutos: 5.2,
    tempo_correcao_erro_manual_minutos_por_campo: 2.0,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.5,
  },
  {
    tipo_documento: 'proforma',
    rotulo: 'Proforma',
    campos_medio: 36,
    tempo_digitação_manual_minutos: 21,
    tempo_digitação_smart_read_minutos: 4.0,
    tempo_correcao_erro_manual_minutos_por_campo: 1.9,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.48,
  },
  {
    tipo_documento: 'pedido',
    rotulo: 'Pedido',
    campos_medio: 30,
    tempo_digitação_manual_minutos: 18,
    tempo_digitação_smart_read_minutos: 3.5,
    tempo_correcao_erro_manual_minutos_por_campo: 1.7,
    tempo_correcao_erro_smart_read_minutos_por_campo: 0.42,
  },
  {
    tipo_documento: 'outros',
    rotulo: 'Outros',
    campos_medio: 28,
    tempo_digitação_manual_minutos: 16,
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
