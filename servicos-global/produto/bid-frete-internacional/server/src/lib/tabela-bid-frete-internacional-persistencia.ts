import { prepararCamposRotaTabelaPersistencia } from './rota-tabela-bid-frete-internacional.js'
import type { TabelaBidFreteInternacionalInput } from '../../../shared/tabela-bid-frete-internacional-schema.js'

const CAMPOS_ROTA_TABELA = [
  'modal_tabela_bid_frete_internacional',
  'porto_origem_tabela_bid_frete_internacional',
  'porto_destino_tabela_bid_frete_internacional',
  'aeroporto_origem_tabela_bid_frete_internacional',
  'aeroporto_destino_tabela_bid_frete_internacional',
  'endereco_origem_tabela_bid_frete_internacional',
  'endereco_destino_tabela_bid_frete_internacional',
  'pais_origem_rodoviario_tabela_bid_frete_internacional',
  'pais_destino_rodoviario_tabela_bid_frete_internacional',
  'estado_provincia_origem_rodoviario_tabela_bid_frete_internacional',
  'estado_provincia_destino_rodoviario_tabela_bid_frete_internacional',
  'cidade_origem_rodoviario_tabela_bid_frete_internacional',
  'cidade_destino_rodoviario_tabela_bid_frete_internacional',
  'origem_codigo_tabela_bid_frete_internacional',
  'origem_nome_tabela_bid_frete_internacional',
  'origem_pais_tabela_bid_frete_internacional',
  'destino_codigo_tabela_bid_frete_internacional',
  'destino_nome_tabela_bid_frete_internacional',
  'destino_pais_tabela_bid_frete_internacional',
] as const

function temCampoRota(input: Partial<TabelaBidFreteInternacionalInput>): boolean {
  return CAMPOS_ROTA_TABELA.some(campo => campo in input && input[campo as keyof typeof input] !== undefined)
}

export function prepararTabelaBidFreteInternacionalParaPersistencia(
  input: Partial<TabelaBidFreteInternacionalInput>,
): Record<string, unknown> {
  const data: Record<string, unknown> = { ...input }

  if (input.modal_tabela_bid_frete_internacional && temCampoRota(input)) {
    Object.assign(data, prepararCamposRotaTabelaPersistencia(input as TabelaBidFreteInternacionalInput))
  }

  if (input.validade_inicio_tabela_bid_frete_internacional) {
    data.validade_inicio_tabela_bid_frete_internacional = new Date(input.validade_inicio_tabela_bid_frete_internacional)
  }
  if (input.validade_fim_tabela_bid_frete_internacional) {
    data.validade_fim_tabela_bid_frete_internacional = new Date(input.validade_fim_tabela_bid_frete_internacional)
  }

  return data
}
