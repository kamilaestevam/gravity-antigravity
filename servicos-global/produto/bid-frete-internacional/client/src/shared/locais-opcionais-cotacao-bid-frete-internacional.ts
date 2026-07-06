import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import {
  codigosElegiveisSelecaoLocalFornecedorBidFrete,
  exigeSelecaoLocalFornecedorRespostaBidFrete,
  modalCotacaoExigeAeroportoLocal,
  modalCotacaoExigePortoLocal,
  montarTextoLocaisOpcionaisCotacaoBidFrete,
  type ContextoLocaisOpcionaisCotacaoBidFrete,
} from '../../../shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional'
import {
  chaveCodigoLocalBidFrete,
  coletarCodigosLocaisCotacaoBidFrete,
  resolverRotuloLocalFornecedorRespostaBidFrete,
  rotuloLocalFromSnapshotCotacaoBidFrete,
  type ContextoLocaisComNomesSnapshot,
} from '../../../shared/rotulos-locais-resposta-fornecedor-bid-frete-internacional'
import {
  rotuloAeroportoCadastroLogistica,
  rotuloPortoCadastroLogistica,
} from '../../../shared/rotulo-cadastro-logistica-bid-frete-internacional'
import { cadastrosApi } from './cadastrosApi'
import { useAeroportosPorPais, usePortosPorPais } from './useCadastrosLogistica'

async function buscarRotuloLocalCadastrosBidFrete(
  codigo: string,
  modal: ContextoLocaisOpcionaisCotacaoBidFrete['modal_cotacao_bid_frete_internacional'],
): Promise<string | null> {
  const alvo = chaveCodigoLocalBidFrete(codigo)
  if (!alvo) return null

  try {
    if (modalCotacaoExigePortoLocal(modal)) {
      const hit = await cadastrosApi.buscarPortoPorCodigo(alvo)
      if (hit) return rotuloPortoCadastroLogistica(hit)
    }
    if (modalCotacaoExigeAeroportoLocal(modal)) {
      const hit = await cadastrosApi.buscarAeroportoPorCodigo(alvo)
      if (hit) return rotuloAeroportoCadastroLogistica(hit)
    }
  } catch {
    return null
  }

  return null
}

function useMapaRotulosLocaisCotacaoBidFrete(ctx: ContextoLocaisComNomesSnapshot) {
  const exigePorto = modalCotacaoExigePortoLocal(ctx.modal_cotacao_bid_frete_internacional)
  const exigeAeroporto = modalCotacaoExigeAeroportoLocal(ctx.modal_cotacao_bid_frete_internacional)
  const { portos } = usePortosPorPais('', exigePorto)
  const { aeroportos } = useAeroportosPorPais('', exigeAeroporto)

  const codigos = useMemo(() => coletarCodigosLocaisCotacaoBidFrete(ctx), [ctx])
  const chaveCodigos = codigos.map(chaveCodigoLocalBidFrete).sort().join('|')

  const [mapaRemoto, setMapaRemoto] = useState<Map<string, string>>(() => new Map())
  const [carregandoRemoto, setCarregandoRemoto] = useState(false)

  useEffect(() => {
    if (codigos.length === 0) {
      setMapaRemoto(new Map())
      return
    }

    let ativo = true
    setCarregandoRemoto(true)

    void Promise.all(
      codigos.map(async (codigo) => {
        const chave = chaveCodigoLocalBidFrete(codigo)
        const rotuloServidor = ctx.mapa_rotulos_locais_resposta_bid_frete_internacional?.[chave]
        if (rotuloServidor) return [chave, rotuloServidor] as const

        for (const lado of ['origem', 'destino'] as const) {
          const snapshot = rotuloLocalFromSnapshotCotacaoBidFrete(ctx, lado, codigo)
          if (snapshot) return [chave, snapshot] as const
        }

        const remoto = await buscarRotuloLocalCadastrosBidFrete(codigo, ctx.modal_cotacao_bid_frete_internacional)
        if (remoto) return [chave, remoto] as const

        return [chave, codigo] as const
      }),
    )
      .then((pares) => {
        if (!ativo) return
        setMapaRemoto(new Map(pares))
      })
      .finally(() => {
        if (ativo) setCarregandoRemoto(false)
      })

    return () => {
      ativo = false
    }
  }, [
    chaveCodigos,
    ctx.modal_cotacao_bid_frete_internacional,
    ctx.origem_nome_cotacao_bid_frete_internacional,
    ctx.destino_nome_cotacao_bid_frete_internacional,
    ctx.mapa_rotulos_locais_resposta_bid_frete_internacional,
  ])

  const resolverRotulo = useCallback(
    (codigo: string): string =>
      resolverRotuloLocalFornecedorRespostaBidFrete(ctx, codigo, portos, aeroportos, mapaRemoto),
    [aeroportos, ctx, mapaRemoto, portos],
  )

  return { resolverRotulo, carregandoRemoto }
}

export function useResolverRotuloLocalLogisticoCotacaoBidFrete(
  ctx: ContextoLocaisComNomesSnapshot,
) {
  const { resolverRotulo } = useMapaRotulosLocaisCotacaoBidFrete(ctx)
  return resolverRotulo
}

export function useLocaisSelecaoFornecedorRespostaBidFrete(
  ctx: ContextoLocaisComNomesSnapshot,
) {
  const { resolverRotulo, carregandoRemoto } = useMapaRotulosLocaisCotacaoBidFrete(ctx)

  const opcoesOrigem = useMemo((): SelectOpcao[] => {
    if (!exigeSelecaoLocalFornecedorRespostaBidFrete(ctx, 'origem')) return []
    return codigosElegiveisSelecaoLocalFornecedorBidFrete(ctx, 'origem').map((codigo) => ({
      valor: codigo,
      rotulo: resolverRotulo(codigo),
    }))
  }, [ctx, resolverRotulo])

  const opcoesDestino = useMemo((): SelectOpcao[] => {
    if (!exigeSelecaoLocalFornecedorRespostaBidFrete(ctx, 'destino')) return []
    return codigosElegiveisSelecaoLocalFornecedorBidFrete(ctx, 'destino').map((codigo) => ({
      valor: codigo,
      rotulo: resolverRotulo(codigo),
    }))
  }, [ctx, resolverRotulo])

  return {
    resolverRotulo,
    opcoesOrigem,
    opcoesDestino,
    carregando: carregandoRemoto,
  }
}

export function useOpcoesSelecaoLocalFornecedorRespostaBidFrete(
  ctx: ContextoLocaisComNomesSnapshot,
  lado: 'origem' | 'destino',
): { opcoes: SelectOpcao[]; carregando: boolean } {
  const { opcoesOrigem, opcoesDestino, carregando } = useLocaisSelecaoFornecedorRespostaBidFrete(ctx)
  return {
    opcoes: lado === 'origem' ? opcoesOrigem : opcoesDestino,
    carregando,
  }
}

export function useTextosLocaisOpcionaisCotacaoBidFrete(
  ctx: ContextoLocaisComNomesSnapshot,
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

export type { ContextoLocaisComNomesSnapshot }
