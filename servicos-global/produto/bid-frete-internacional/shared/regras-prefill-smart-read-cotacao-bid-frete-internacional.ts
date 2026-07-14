/**
 * Regras de visibilidade e passo inicial — prefill Smart Docs → Nova Cotação BID Frete.
 * Espelha sequenciaPassosWizardNovaCotacao + validação dos passos modal/origem/carga/armazenagem.
 */
import type { PrefillFormularioCotacaoBidFreteSmartRead } from '../../smart-read/shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'

export type ModalFretePrefill = NonNullable<PrefillFormularioCotacaoBidFreteSmartRead['modal_cotacao_bid_frete_internacional']>
export type ModalidadePrefill = NonNullable<PrefillFormularioCotacaoBidFreteSmartRead['modalidade_cotacao_bid_frete_internacional']>

export type TipoPassoInicialPrefillSmartRead =
  | 'modal'
  | 'origem'
  | 'carga'
  | 'armazenagem'
  | 'fornecedores'

export function ehMaritimoLclPrefill(
  modal?: PrefillFormularioCotacaoBidFreteSmartRead['modal_cotacao_bid_frete_internacional'],
  modalidade?: PrefillFormularioCotacaoBidFreteSmartRead['modalidade_cotacao_bid_frete_internacional'],
): boolean {
  return modal === 'MARITIMO' && modalidade === 'LCL'
}

export function modalExigePortoPrefill(modal?: string): boolean {
  return modal === 'MARITIMO'
}

export function modalExigeAeroportoPrefill(modal?: string): boolean {
  return modal === 'AEREO'
}

export function modalExigeRodoviarioPrefill(modal?: string): boolean {
  return modal === 'RODOVIARIO'
}

export function exigeCampoArmazenagemLclPrefill(
  prefill: PrefillFormularioCotacaoBidFreteSmartRead,
): boolean {
  return ehMaritimoLclPrefill(
    prefill.modal_cotacao_bid_frete_internacional,
    prefill.modalidade_cotacao_bid_frete_internacional,
  )
}

export function exigeLinhasContainerFclPrefill(
  prefill: PrefillFormularioCotacaoBidFreteSmartRead,
): boolean {
  return prefill.modal_cotacao_bid_frete_internacional === 'MARITIMO'
    && prefill.modalidade_cotacao_bid_frete_internacional === 'FCL'
}

export function avaliarCamposFaltantesPrefillCotacaoBidFrete(
  prefill: PrefillFormularioCotacaoBidFreteSmartRead,
): string[] {
  const faltantes: string[] = []
  const modal = prefill.modal_cotacao_bid_frete_internacional
  const modalidade = prefill.modalidade_cotacao_bid_frete_internacional

  if (!modal) faltantes.push('Modal')
  if (!modalidade && modal !== 'AEREO') faltantes.push('Modalidade')
  if (!prefill.tipo_operacao_cotacao_bid_frete_internacional) faltantes.push('Operação')
  if (!prefill.descricao_mercadoria_cotacao_bid_frete_internacional?.trim()) faltantes.push('Mercadoria')
  if (!prefill.incoterm_cotacao_bid_frete_internacional?.trim()) faltantes.push('Incoterm')
  if (!prefill.quantidade_volume_cotacao_bid_frete_internacional
    || prefill.quantidade_volume_cotacao_bid_frete_internacional <= 0) {
    faltantes.push('Volumes')
  }

  if (modalExigePortoPrefill(modal)) {
    if (!prefill.porto_origem_cotacao_bid_frete_internacional?.trim()) faltantes.push('Porto origem')
    if (!prefill.porto_destino_cotacao_bid_frete_internacional?.trim()) faltantes.push('Porto destino')
  }
  if (modalExigeAeroportoPrefill(modal)) {
    if (!prefill.aeroporto_origem_cotacao_bid_frete_internacional?.trim()) faltantes.push('Aeroporto origem')
    if (!prefill.aeroporto_destino_cotacao_bid_frete_internacional?.trim()) faltantes.push('Aeroporto destino')
  }

  if (exigeCampoArmazenagemLclPrefill(prefill)) {
    const opcao = prefill.opcao_incluir_armazenagem_cotacao
    if (opcao !== 'sim' && opcao !== 'nao') {
      faltantes.push('Armazenagem LCL')
    }
  }

  if (exigeLinhasContainerFclPrefill(prefill) && !prefill.tipo_container_cotacao_bid_frete_internacional?.trim()) {
    faltantes.push('Tipo container')
  }

  return [...new Set(faltantes)]
}

/** Primeiro passo incompleto do wizard (paridade com validação do modal Nova Cotação). */
export function resolverPassoInicialPrefillSmartRead(
  prefill: PrefillFormularioCotacaoBidFreteSmartRead,
): TipoPassoInicialPrefillSmartRead {
  const modal = prefill.modal_cotacao_bid_frete_internacional
  const modalidade = prefill.modalidade_cotacao_bid_frete_internacional

  if (!modal || !prefill.tipo_operacao_cotacao_bid_frete_internacional) return 'modal'
  if (modal !== 'AEREO' && !modalidade) return 'modal'

  if (modalExigePortoPrefill(modal)) {
    if (!prefill.porto_origem_cotacao_bid_frete_internacional?.trim()
      || !prefill.porto_destino_cotacao_bid_frete_internacional?.trim()) {
      return 'origem'
    }
  }
  if (modalExigeAeroportoPrefill(modal)) {
    if (!prefill.aeroporto_origem_cotacao_bid_frete_internacional?.trim()
      || !prefill.aeroporto_destino_cotacao_bid_frete_internacional?.trim()) {
      return 'origem'
    }
  }

  if (!prefill.descricao_mercadoria_cotacao_bid_frete_internacional?.trim()
    || !prefill.incoterm_cotacao_bid_frete_internacional?.trim()
    || !prefill.quantidade_volume_cotacao_bid_frete_internacional
    || prefill.quantidade_volume_cotacao_bid_frete_internacional <= 0) {
    return 'carga'
  }

  if (exigeLinhasContainerFclPrefill(prefill) && !prefill.tipo_container_cotacao_bid_frete_internacional?.trim()) {
    return 'carga'
  }

  if (exigeCampoArmazenagemLclPrefill(prefill)) {
    const opcao = prefill.opcao_incluir_armazenagem_cotacao
    if (opcao !== 'sim' && opcao !== 'nao') return 'armazenagem'
    if (opcao === 'sim') return 'armazenagem'
  }

  return 'fornecedores'
}
