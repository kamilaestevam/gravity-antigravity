/**
 * SSOT — elegibilidade de fornecedor no disparo de cotação BID Frete Internacional
 * por modal da cotação e flags `pode_ser_*` do Cadastros.
 *
 * Regras:
 * - Agente, armador, cia aérea → sempre elegíveis
 * - Transportadora rodoviária internacional → só modal RODOVIARIO
 * - Transportadora rodoviária nacional → nunca elegível
 * - Parceiro com nacional + internacional → internacional prevalece (rodoviário só no modal rodoviário)
 */

import type { ModalRotaCotacao } from './rota-cotacao-bid-frete-internacional.js'

export type FlagsParceiroFreteCadastrosDisparo = {
  pode_ser_agente_fornecedor: boolean
  pode_ser_armador_fornecedor: boolean
  pode_ser_cia_aerea_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: boolean
}

export type TipoFornecedorBidFreteColapsado = 'AGENTE_CARGA' | 'ARMADOR' | 'CIA_AEREA' | 'TRANSPORTADORA'

export function extrairFlagsParceiroFreteCadastrosDisparo(
  fornecedor: FlagsParceiroFreteCadastrosDisparo,
): FlagsParceiroFreteCadastrosDisparo {
  return {
    pode_ser_agente_fornecedor: Boolean(fornecedor.pode_ser_agente_fornecedor),
    pode_ser_armador_fornecedor: Boolean(fornecedor.pode_ser_armador_fornecedor),
    pode_ser_cia_aerea_fornecedor: Boolean(fornecedor.pode_ser_cia_aerea_fornecedor),
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: Boolean(
      fornecedor.pode_ser_transportadora_rodoviaria_nacional_fornecedor,
    ),
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: Boolean(
      fornecedor.pode_ser_transportadora_rodoviaria_internacional_fornecedor,
    ),
  }
}

/** Elegibilidade com flags Cadastros (fonte preferencial). */
export function fornecedorElegivelDisparoBidFreteInternacional(
  modal: ModalRotaCotacao,
  flags: FlagsParceiroFreteCadastrosDisparo,
): boolean {
  const f = extrairFlagsParceiroFreteCadastrosDisparo(flags)

  if (f.pode_ser_agente_fornecedor) return true
  if (f.pode_ser_armador_fornecedor) return true
  if (f.pode_ser_cia_aerea_fornecedor) return true

  if (f.pode_ser_transportadora_rodoviaria_internacional_fornecedor) {
    return modal === 'RODOVIARIO'
  }

  if (f.pode_ser_transportadora_rodoviaria_nacional_fornecedor) {
    return false
  }

  return false
}

/** Fallback quando flags Cadastros não estão disponíveis (espelho BID colapsado). */
export function fornecedorElegivelDisparoBidFreteInternacionalPorTipoColapsado(
  modal: ModalRotaCotacao,
  tipo: TipoFornecedorBidFreteColapsado,
): boolean {
  if (tipo === 'TRANSPORTADORA') return modal === 'RODOVIARIO'
  return true
}

export function fornecedorPossuiFlagsCadastrosDisparo(
  fornecedor: Partial<FlagsParceiroFreteCadastrosDisparo>,
): fornecedor is FlagsParceiroFreteCadastrosDisparo {
  return (
    typeof fornecedor.pode_ser_agente_fornecedor === 'boolean'
    && typeof fornecedor.pode_ser_armador_fornecedor === 'boolean'
    && typeof fornecedor.pode_ser_cia_aerea_fornecedor === 'boolean'
    && typeof fornecedor.pode_ser_transportadora_rodoviaria_nacional_fornecedor === 'boolean'
    && typeof fornecedor.pode_ser_transportadora_rodoviaria_internacional_fornecedor === 'boolean'
  )
}

export function resolverElegibilidadeDisparoFornecedorBidFreteInternacional(
  modal: ModalRotaCotacao,
  fornecedor: Partial<FlagsParceiroFreteCadastrosDisparo> & {
    tipo_fornecedor_bid_frete_internacional?: TipoFornecedorBidFreteColapsado
  },
): boolean {
  if (fornecedorPossuiFlagsCadastrosDisparo(fornecedor)) {
    return fornecedorElegivelDisparoBidFreteInternacional(modal, fornecedor)
  }
  const tipo = fornecedor.tipo_fornecedor_bid_frete_internacional
  if (!tipo) return false
  return fornecedorElegivelDisparoBidFreteInternacionalPorTipoColapsado(modal, tipo)
}
