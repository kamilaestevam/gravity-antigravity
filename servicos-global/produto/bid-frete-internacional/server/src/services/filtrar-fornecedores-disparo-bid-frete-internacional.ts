/**
 * Filtra IDs de fornecedor elegíveis ao disparo conforme modal da cotação e Cadastros.
 */

import type { ModalRotaCotacao } from '../../../shared/rota-cotacao-bid-frete-internacional.js'
import {
  fornecedorElegivelDisparoBidFreteInternacional,
  fornecedorElegivelDisparoBidFreteInternacionalPorTipoColapsado,
  type TipoFornecedorBidFreteColapsado,
} from '../../../shared/fornecedor-elegivel-disparo-bid-frete-internacional.js'
import {
  listarParceirosFreteCadastros,
  type FornecedorCadastrosFrete,
} from './sincronizar-fornecedores-cadastros.js'

export async function filtrarFornecedorIdsElegiveisDisparoBidFreteInternacional(
  idOrganizacao: string,
  modal: ModalRotaCotacao,
  fornecedorIds: string[],
  opcoes?: {
    parceirosCadastros?: FornecedorCadastrosFrete[]
    tiposEspelhoPorId?: Map<string, TipoFornecedorBidFreteColapsado>
  },
): Promise<string[]> {
  if (fornecedorIds.length === 0) return []

  let parceiros = opcoes?.parceirosCadastros
  if (!parceiros) {
    try {
      parceiros = await listarParceirosFreteCadastros(idOrganizacao)
    } catch {
      parceiros = []
    }
  }

  const parceirosPorId = new Map(parceiros.map(p => [p.id_fornecedor, p]))

  return fornecedorIds.filter((id) => {
    const parceiro = parceirosPorId.get(id)
    if (parceiro) {
      return fornecedorElegivelDisparoBidFreteInternacional(modal, parceiro)
    }
    const tipoEspelho = opcoes?.tiposEspelhoPorId?.get(id)
    if (tipoEspelho) {
      return fornecedorElegivelDisparoBidFreteInternacionalPorTipoColapsado(modal, tipoEspelho)
    }
    return false
  })
}
