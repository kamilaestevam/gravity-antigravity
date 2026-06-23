/**
 * Valida snapshot de rota da cotação contra Cadastros na gravação (POST/PATCH).
 */

import {
  validarConsistenciaLocalRotaCadastros,
  type LocalCadastrosResolvido,
} from '../../../shared/divergencia-cadastros-rota-bid-frete-internacional.js'
import {
  prepararCamposRotaCotacaoPersistencia,
  type CamposRotaModalCotacao,
} from './rota-cotacao-bid-frete-internacional.js'
import { resolverLocalCadastrosBidFreteInternacional } from './resolver-local-cadastros-bid-frete-internacional.js'

export interface ErroValidacaoRotaCadastros {
  path: string
  message: string
}

function paraLocalResolvido(
  local: Awaited<ReturnType<typeof resolverLocalCadastrosBidFreteInternacional>>,
): LocalCadastrosResolvido | null {
  if (!local) return null
  return { codigo: local.codigo, nome: local.nome, pais: local.pais }
}

export async function validarRotaCotacaoContraCadastros(
  input: CamposRotaModalCotacao,
  idOrganizacao: string,
): Promise<ErroValidacaoRotaCadastros[]> {
  const modal = input.modal_cotacao_bid_frete_internacional
  if (modal === 'RODOVIARIO') return []

  const preparado = prepararCamposRotaCotacaoPersistencia(input)
  const erros: ErroValidacaoRotaCadastros[] = []

  const origemCodigo = preparado.origem_codigo_cotacao_bid_frete_internacional?.trim().toUpperCase() ?? ''
  const destinoCodigo = preparado.destino_codigo_cotacao_bid_frete_internacional?.trim().toUpperCase() ?? ''

  if (origemCodigo) {
    const cadastros = paraLocalResolvido(
      await resolverLocalCadastrosBidFreteInternacional(origemCodigo, {
        id_organizacao: idOrganizacao,
        modal,
      }),
    )
    const erro = validarConsistenciaLocalRotaCadastros(
      'origem',
      {
        codigo: origemCodigo,
        nome: preparado.origem_nome_cotacao_bid_frete_internacional ?? '',
        pais: preparado.origem_pais_cotacao_bid_frete_internacional ?? '',
      },
      cadastros,
    )
    if (erro) erros.push(erro)
  }

  if (destinoCodigo) {
    const cadastros = paraLocalResolvido(
      await resolverLocalCadastrosBidFreteInternacional(destinoCodigo, {
        id_organizacao: idOrganizacao,
        modal,
      }),
    )
    const erro = validarConsistenciaLocalRotaCadastros(
      'destino',
      {
        codigo: destinoCodigo,
        nome: preparado.destino_nome_cotacao_bid_frete_internacional ?? '',
        pais: preparado.destino_pais_cotacao_bid_frete_internacional ?? '',
      },
      cadastros,
    )
    if (erro) erros.push(erro)
  }

  return erros
}
