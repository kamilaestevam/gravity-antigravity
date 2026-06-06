/**
 * Estado e persistência dos painéis da Lista (BID Frete Internacional).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useShellStore } from '@gravity/shell'
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
  setCardsTopoDoPainel?: (cardsTopo: ListaPainelConfigV1['cards_topo']) => void
  onConfigAplicada?: (snapshot: {
    aba: string
    sortCampo: string
    sortDir: 'asc' | 'desc'
    busca: string
    filtrosColuna: FiltrosAtivosMap
  }) => void
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
  const idOrganizacao = useShellStore(
    s => s.currentUser.idOrganizacao ?? (import.meta.env.VITE_DEV_ID_ORGANIZACAO as string | undefined) ?? '',
  )
  const idUsuario = useShellStore(s => s.currentUser.id ?? '')
  const podeCarregar = Boolean(idOrganizacao && idUsuario)

  const [paineis, setPaineis] = useState<ListaPainel[]>([])
  const [painelAtualId, setPainelAtualId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const painelAtualIdRef = useRef<string | null>(null)
  const estadoRef = useRef<EstadoListaParaPainel | null>(null)
  const aplicandoConfigRef = useRef(false)
  const painelHidratadoIdRef = useRef<string | null>(null)
  const cargaPaineisSeqRef = useRef(0)

  useEffect(() => {
    painelAtualIdRef.current = painelAtualId
  }, [painelAtualId])

  const carregarPaineis = useCallback(async () => {
    if (!podeCarregar) return
    const seq = ++cargaPaineisSeqRef.current
    setCarregando(true)
    painelHidratadoIdRef.current = null
    try {
      const { data } = await paineisListaBidFreteApi.listar()
      if (seq !== cargaPaineisSeqRef.current) return
      setPaineis(data)
      const visivel = data.find(p => p.is_visivel !== false) ?? data[0]
      if (visivel) setPainelAtualId(visivel.id)
    } catch (err) {
      if (seq !== cargaPaineisSeqRef.current) return
      console.warn('[useListaPainelBidFrete] falha ao carregar painéis', err)
      setPaineis([])
      setPainelAtualId(null)
    } finally {
      if (seq === cargaPaineisSeqRef.current) setCarregando(false)
    }
  }, [podeCarregar])

  useEffect(() => {
    if (!podeCarregar) {
      cargaPaineisSeqRef.current += 1
      setCarregando(false)
      return
    }
    void carregarPaineis()
  }, [podeCarregar, carregarPaineis])

  const salvarConfigPainelNoServidor = useCallback(async (id: string, estado: EstadoListaParaPainel) => {
    const configJson = JSON.stringify(estadoParaConfig(estado))
    try {
      await paineisListaBidFreteApi.atualizar(id, { config_json: configJson })
      setPaineis(prev => prev.map(p => (p.id === id ? { ...p, config_json: configJson } : p)))
    } catch (err) {
      console.warn('[useListaPainelBidFrete] falha ao persistir painel', id, err)
    }
  }, [])

  const cancelarPersistenciaAgendada = useCallback(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
      persistTimerRef.current = null
    }
  }, [])

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
    callbacks.setCardsTopoDoPainel?.(config.cards_topo)

    callbacks.onConfigAplicada?.({
      aba: config.aba_status_ativa,
      sortCampo: config.ordenacao.campo,
      sortDir: config.ordenacao.direcao,
      busca: config.busca ?? '',
      filtrosColuna: deserializarFiltrosLista(config.filtros_coluna),
    })

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

    cancelarPersistenciaAgendada()
    const idSnapshot = id
    const estadoSnapshot = estado
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      void salvarConfigPainelNoServidor(idSnapshot, estadoSnapshot)
    }, 400)
  }, [cancelarPersistenciaAgendada, salvarConfigPainelNoServidor])

  const persistirPainelAtualImediato = useCallback((estado: EstadoListaParaPainel) => {
    estadoRef.current = estado
    const id = painelAtualIdRef.current
    if (!id || aplicandoConfigRef.current) return
    if (painelHidratadoIdRef.current !== id) return

    cancelarPersistenciaAgendada()
    void salvarConfigPainelNoServidor(id, estado)
  }, [cancelarPersistenciaAgendada, salvarConfigPainelNoServidor])

  const criarPainel = useCallback(async (
    nome: string,
    estadoAtual: EstadoListaParaPainel,
    callbacks: AplicarConfigListaPainelCallbacks,
  ) => {
    const trimmed = nome.trim()
    if (!trimmed) return null
    try {
      const configJson = JSON.stringify(estadoParaConfig(estadoAtual))
      const { data } = await paineisListaBidFreteApi.criar(trimmed, configJson)
      setPaineis(prev => [...prev, data])
      painelHidratadoIdRef.current = null
      setPainelAtualId(data.id)
      aplicarConfigDoPainel(data, callbacks)
      return data
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[useListaPainelBidFrete] falha ao criar painel', msg, err)
      throw err instanceof Error ? err : new Error(msg)
    }
  }, [aplicarConfigDoPainel])

  const trocarPainel = useCallback(async (
    id: string,
    estadoAtual: EstadoListaParaPainel,
    callbacks: AplicarConfigListaPainelCallbacks,
  ) => {
    cancelarPersistenciaAgendada()
    const idAnterior = painelAtualIdRef.current
    painelHidratadoIdRef.current = null

    let paineisAtualizados = paineis
    if (idAnterior && idAnterior !== id) {
      const estadoSalvar = estadoRef.current ?? estadoAtual
      const configJson = JSON.stringify(estadoParaConfig(estadoSalvar))
      try {
        await paineisListaBidFreteApi.atualizar(idAnterior, { config_json: configJson })
        paineisAtualizados = paineis.map(p => (
          p.id === idAnterior ? { ...p, config_json: configJson } : p
        ))
        setPaineis(paineisAtualizados)
      } catch (err) {
        console.warn('[useListaPainelBidFrete] falha ao salvar painel anterior', idAnterior, err)
      }
    }

    const proximo = paineisAtualizados.find(p => p.id === id)
    if (!proximo) {
      console.warn('[useListaPainelBidFrete] painel não encontrado para troca', id)
      return
    }

    setPainelAtualId(id)
    aplicarConfigDoPainel(proximo, callbacks)
  }, [paineis, aplicarConfigDoPainel, cancelarPersistenciaAgendada])

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
    persistirPainelAtualImediato,
    trocarPainel,
    criarPainel,
    aplicandoConfigRef,
    painelHidratadoIdRef,
  }
}
