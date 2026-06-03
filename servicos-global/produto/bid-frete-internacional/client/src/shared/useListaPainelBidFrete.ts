/**
 * Estado e persistência dos painéis da Lista (BID Frete Internacional).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { GTPreferencias } from '@nucleo/tabela-virtual-global'
import {
  configListaPainelPadraoV1,
  parsearConfigListaPainel,
  parsearConfigListaPainelSeguro,
  type ListaPainelConfigV1,
} from '../../../shared/listaPainelConfigSchema'
import { paineisListaBidFreteApi, type ListaPainel } from './api'
import { deserializarFiltrosLista, serializarFiltrosLista } from './lista-painel-filtros'
import type { FiltrosAtivosMap } from '../components/lista/filtros'

export interface EstadoListaParaPainel {
  preferencias: GTPreferencias | undefined
  abaAtiva: string
  sortCampo: string
  sortDir: 'asc' | 'desc'
  busca: string
  filtrosAtivos: FiltrosAtivosMap
  cardsVisiveisIds?: string[]
  periodoCards?: string
}

export interface AplicarConfigListaPainelCallbacks {
  setPreferencias: (p: GTPreferencias | undefined) => void
  setAbaAtiva: (aba: string) => void
  setSortCampo: (c: string) => void
  setSortDir: (d: 'asc' | 'desc') => void
  setBusca: (b: string) => void
  setFiltrosAtivos: (f: FiltrosAtivosMap) => void
  onConfigAplicada?: (
    aba: string,
    campo: string,
    dir: 'asc' | 'desc',
    busca: string,
  ) => void
  onPainelHidratado?: (idPainel: string) => void
}

function estadoParaConfig(estado: EstadoListaParaPainel): ListaPainelConfigV1 {
  const colunasVisiveis = estado.preferencias?.colunas_visiveis ?? []
  return configListaPainelPadraoV1({
    colunas_visiveis: colunasVisiveis,
    ...(estado.preferencias?.colunas_largura
      ? { colunas_largura: estado.preferencias.colunas_largura as Record<string, number> }
      : {}),
    aba_status_ativa: estado.abaAtiva,
    filtros_coluna: serializarFiltrosLista(estado.filtrosAtivos),
    ordenacao: { campo: estado.sortCampo, direcao: estado.sortDir },
    ...(estado.busca.trim() ? { busca: estado.busca } : {}),
    ...(estado.cardsVisiveisIds
      ? {
          cards_topo: {
            ids_visiveis: estado.cardsVisiveisIds,
            ...(estado.periodoCards ? { periodo: estado.periodoCards } : {}),
          },
        }
      : {}),
  })
}

export function useListaPainelBidFrete() {
  const [paineis, setPaineis] = useState<ListaPainel[]>([])
  const [painelAtualId, setPainelAtualId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const painelAtualIdRef = useRef<string | null>(null)
  const estadoRef = useRef<EstadoListaParaPainel | null>(null)
  const aplicandoConfigRef = useRef(false)
  const painelHidratadoIdRef = useRef<string | null>(null)

  useEffect(() => {
    painelAtualIdRef.current = painelAtualId
  }, [painelAtualId])

  const carregarPaineis = useCallback(async () => {
    setCarregando(true)
    painelHidratadoIdRef.current = null
    try {
      const { data } = await paineisListaBidFreteApi.listar()
      setPaineis(data)
      const visivel = data.find(p => p.is_visivel) ?? data[0]
      if (visivel) setPainelAtualId(visivel.id)
    } catch (err) {
      console.warn('[useListaPainelBidFrete] falha ao carregar painéis', err)
      setPaineis([])
      setPainelAtualId(null)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregarPaineis()
  }, [carregarPaineis])

  const aplicarConfigDoPainel = useCallback((
    painel: ListaPainel,
    callbacks: AplicarConfigListaPainelCallbacks,
  ) => {
    aplicandoConfigRef.current = true
    painelHidratadoIdRef.current = null
    const fallback = configListaPainelPadraoV1()
    let config: ListaPainelConfigV1
    try {
      config = parsearConfigListaPainel(painel.config_json)
    } catch {
      config = parsearConfigListaPainelSeguro(painel.config_json, fallback, {
        id_painel: painel.id,
        origem: 'useListaPainelBidFrete.aplicarConfigDoPainel',
      })
    }

    const prefs: GTPreferencias = {
      ...(config.colunas_visiveis.length > 0
        ? { colunas_visiveis: config.colunas_visiveis }
        : {}),
      ...(config.colunas_largura ? { colunas_largura: config.colunas_largura } : {}),
    }
    callbacks.setPreferencias(Object.keys(prefs).length > 0 ? prefs : undefined)
    callbacks.setAbaAtiva(config.aba_status_ativa)
    callbacks.setSortCampo(config.ordenacao.campo)
    callbacks.setSortDir(config.ordenacao.direcao)
    callbacks.setBusca(config.busca ?? '')
    callbacks.setFiltrosAtivos(deserializarFiltrosLista(config.filtros_coluna))

    callbacks.onConfigAplicada?.(
      config.aba_status_ativa,
      config.ordenacao.campo,
      config.ordenacao.direcao,
      config.busca ?? '',
    )

    queueMicrotask(() => {
      aplicandoConfigRef.current = false
      painelHidratadoIdRef.current = painel.id
      callbacks.onPainelHidratado?.(painel.id)
    })
  }, [])

  const persistirPainelAtual = useCallback((estado: EstadoListaParaPainel) => {
    estadoRef.current = estado
    const id = painelAtualIdRef.current
    if (!id || aplicandoConfigRef.current) return
    if (painelHidratadoIdRef.current !== id) return

    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      const configJson = JSON.stringify(estadoParaConfig(estado))
      paineisListaBidFreteApi.atualizar(id, { config_json: configJson }).catch(err => {
        console.warn('[useListaPainelBidFrete] falha ao persistir painel', id, err)
      })
    }, 400)
  }, [])

  const trocarPainel = useCallback(async (
    id: string,
    estadoAtual: EstadoListaParaPainel,
    callbacks: AplicarConfigListaPainelCallbacks,
  ) => {
    const idAnterior = painelAtualIdRef.current
    painelHidratadoIdRef.current = null
    if (idAnterior && idAnterior !== id) {
      const configJson = JSON.stringify(estadoParaConfig(estadoAtual))
      await paineisListaBidFreteApi.atualizar(idAnterior, { config_json: configJson }).catch(err => {
        console.warn('[useListaPainelBidFrete] falha ao salvar painel anterior', idAnterior, err)
      })
    }

    const proximo = paineis.find(p => p.id === id)
    if (!proximo) {
      console.warn('[useListaPainelBidFrete] painel não encontrado para troca', id)
      return
    }

    setPainelAtualId(id)
    aplicarConfigDoPainel(proximo, callbacks)
  }, [paineis, aplicarConfigDoPainel])

  const painelAtual = paineis.find(p => p.id === painelAtualId) ?? null

  return {
    paineis,
    setPaineis,
    painelAtualId,
    setPainelAtualId,
    painelAtual,
    carregando,
    carregarPaineis,
    aplicarConfigDoPainel,
    persistirPainelAtual,
    trocarPainel,
    aplicandoConfigRef,
    painelHidratadoIdRef,
  }
}
