import { mapaRotulosOpcionaisPersistidosCotacaoBidFrete } from '../../../shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional.js'
import {
  chaveCodigoLocalBidFrete,
  coletarCodigosLocaisCotacaoBidFrete,
  rotuloLocalFromSnapshotCotacaoBidFrete,
  type ContextoLocaisComNomesSnapshot,
} from '../../../shared/rotulos-locais-resposta-fornecedor-bid-frete-internacional.js'
import { resolverRotulosLocaisOpcionaisDisparoBidFrete } from './resolver-rotulos-locais-opcionais-disparo-bid-frete-internacional.js'

/**
 * Monta mapa código → rótulo completo para todos os locais da cotação
 * (principal, opcionais e elegíveis na seleção do fornecedor).
 */
export async function montarMapaRotulosLocaisRespostaBidFreteInternacional(
  ctx: ContextoLocaisComNomesSnapshot,
): Promise<Record<string, string>> {
  const mapa: Record<string, string> = {
    ...mapaRotulosOpcionaisPersistidosCotacaoBidFrete(ctx),
  }

  for (const codigo of coletarCodigosLocaisCotacaoBidFrete(ctx)) {
    const chave = chaveCodigoLocalBidFrete(codigo)
    if (mapa[chave]) continue
    for (const lado of ['origem', 'destino'] as const) {
      const snapshot = rotuloLocalFromSnapshotCotacaoBidFrete(ctx, lado, codigo)
      if (snapshot) {
        mapa[chave] = snapshot
        break
      }
    }
  }

  const faltantes = coletarCodigosLocaisCotacaoBidFrete(ctx).filter(
    (codigo) => !mapa[chaveCodigoLocalBidFrete(codigo)],
  )

  if (faltantes.length > 0) {
    const rotulos = await resolverRotulosLocaisOpcionaisDisparoBidFrete(
      ctx.modal_cotacao_bid_frete_internacional,
      faltantes,
    )
    faltantes.forEach((codigo, indice) => {
      mapa[chaveCodigoLocalBidFrete(codigo)] = rotulos[indice] ?? codigo
    })
  }

  return mapa
}
