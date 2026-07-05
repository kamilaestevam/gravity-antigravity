import { useCallback, useMemo } from 'react'
import type { TFunction } from 'i18next'
import {
  modalCotacaoExigeAeroportoLocal,
  modalCotacaoExigePortoLocal,
  montarTextoLocaisOpcionaisCotacaoBidFrete,
  type ContextoLocaisOpcionaisCotacaoBidFrete,
} from '../../../shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional'
import { formatarRotuloLocalLogistico } from './formatacao-local-logistico-bid-frete-internacional'
import { useAeroportosPorPais, usePortosPorPais } from './useCadastrosLogistica'

export function useResolverRotuloLocalLogisticoCotacaoBidFrete(
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
) {
  const exigePorto = modalCotacaoExigePortoLocal(ctx.modal_cotacao_bid_frete_internacional)
  const exigeAeroporto = modalCotacaoExigeAeroportoLocal(ctx.modal_cotacao_bid_frete_internacional)
  const { portos } = usePortosPorPais('', exigePorto)
  const { aeroportos } = useAeroportosPorPais('', exigeAeroporto)

  return useCallback(
    (codigo: string) => {
      if (exigePorto) {
        const porto = portos.find((p) => p.codigo_unlocode_porto === codigo)
        if (porto) return formatarRotuloLocalLogistico(porto.nome_porto, codigo)
      }
      if (exigeAeroporto) {
        const aeroporto = aeroportos.find((a) => a.codigo_iata_aeroporto === codigo)
        if (aeroporto) return formatarRotuloLocalLogistico(aeroporto.nome_aeroporto, codigo)
      }
      return codigo
    },
    [aeroportos, exigeAeroporto, exigePorto, portos],
  )
}

export function useTextosLocaisOpcionaisCotacaoBidFrete(
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
) {
  const resolverRotulo = useResolverRotuloLocalLogisticoCotacaoBidFrete(ctx)
  return useMemo(
    () => ({
      origem: montarTextoLocaisOpcionaisCotacaoBidFrete(ctx, 'origem', resolverRotulo),
      destino: montarTextoLocaisOpcionaisCotacaoBidFrete(ctx, 'destino', resolverRotulo),
    }),
    [ctx, resolverRotulo],
  )
}

export function rotuloExibicaoLocaisOpcionaisCotacaoBidFrete(
  t: TFunction,
  lado: 'origem' | 'destino',
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
): string {
  const maritimo = modalCotacaoExigePortoLocal(ctx.modal_cotacao_bid_frete_internacional)
  if (lado === 'origem') {
    return maritimo
      ? t('bidfrete.nova_cotacao.resumo_portos_opcionais_origem', {
        defaultValue: 'Portos de Origem opcionais',
      })
      : t('bidfrete.nova_cotacao.resumo_aeroportos_opcionais_origem', {
        defaultValue: 'Aeroportos de Origem opcionais',
      })
  }
  return maritimo
    ? t('bidfrete.nova_cotacao.resumo_portos_opcionais_destino', {
      defaultValue: 'Portos de Destino opcionais',
    })
    : t('bidfrete.nova_cotacao.resumo_aeroportos_opcionais_destino', {
      defaultValue: 'Aeroportos de Destino opcionais',
    })
}

export function rotuloSelecaoLocalFornecedorRespostaBidFrete(
  t: TFunction,
  lado: 'origem' | 'destino',
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
): string {
  const maritimo = modalCotacaoExigePortoLocal(ctx.modal_cotacao_bid_frete_internacional)
  if (lado === 'origem') {
    return maritimo
      ? t('bidfrete.portal.responder.porto_origem_utilizado', {
        defaultValue: 'Porto de origem utilizado na proposta',
      })
      : t('bidfrete.portal.responder.aeroporto_origem_utilizado', {
        defaultValue: 'Aeroporto de origem utilizado na proposta',
      })
  }
  return maritimo
    ? t('bidfrete.portal.responder.porto_destino_utilizado', {
      defaultValue: 'Porto de destino utilizado na proposta',
    })
    : t('bidfrete.portal.responder.aeroporto_destino_utilizado', {
      defaultValue: 'Aeroporto de destino utilizado na proposta',
    })
}
