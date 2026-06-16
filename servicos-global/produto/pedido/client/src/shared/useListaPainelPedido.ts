/**
 * Estado e persistência dos painéis da Lista (Pedido).
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
import { podePersistirPainelLista } from '../../../shared/persistenciaListaPainel'
import { paineisListaApi, type ListaPainel } from './api'
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
  /** KPIs do topo: período + quais cards ficam visíveis (por painel) */
  setCardsTopoDoPainel?: (cardsTopo: ListaPainelConfigV1['cards_topo']) => void
  /** Snapshot do painel — o pai busca a lista com estes params e só depois aplica o estado na UI. */
  onConfigAplicada?: (snapshot: SnapshotAplicarListaPainel) => void
  onPainelHidratado?: (idPainel: string) => void
}

export interface SnapshotAplicarListaPainel {
  aba: string
  sortCampo: string
  sortDir: 'asc' | 'desc'
  busca: string
  filtrosColuna: FiltrosAtivosMap
  cardsTopo?: ListaPainelConfigV1['cards_topo']
}

export interface PersistirPainelOpcoes {
  /** Grava na API sem debounce — uso em toggle de colunas e demais prefs críticas. */
  imediato?: boolean
  /** Reordenar colunas, sort, toggle — persiste mesmo antes da hidratação do painel. */
  acaoUsuario?: boolean
}

function estadoParaConfig(estado: EstadoListaParaPainel): ListaPainelConfigV1 {
  const colunasVisiveis = estado.preferencias?.colunas_visiveis ?? []
  const conhecidas = estado.preferencias?.colunas_manuais_conhecidas
  return configListaPainelPadraoV1({
    colunas_visiveis: colunasVisiveis,
    ...(conhecidas && conhecidas.length > 0 ? { colunas_manuais_conhecidas: conhecidas } : {}),
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

function mensagemErroPersistirPainel(err: unknown): string {
  const detalhe = err instanceof Error ? err.message.trim() : ''
  return detalhe
    ? `Não foi possível salvar o painel. ${detalhe}`
    : 'Não foi possível salvar o painel da lista.'
}

export function useListaPainelPedido() {
  const idOrganizacao = useShellStore(
    s => s.currentUser.idOrganizacao ?? (import.meta.env.VITE_DEV_ID_ORGANIZACAO as string | undefined) ?? '',
  )
  const idUsuario = useShellStore(s => s.currentUser.id ?? '')
  const addNotification = useShellStore(s => s.addNotification)
  const podeCarregar = Boolean(idOrganizacao && idUsuario)

  const [paineis, setPaineis] = useState<ListaPainel[]>([])
  const [painelAtualId, setPainelAtualId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const painelAtualIdRef = useRef<string | null>(null)
  const estadoRef = useRef<EstadoListaParaPainel | null>(null)
  const aplicandoConfigRef = useRef(false)
  const painelHidratadoIdRef = useRef<string | null>(null)
  const persistenciaPendenteAposConfigRef = useRef<EstadoListaParaPainel | null>(null)
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
      const { data } = await paineisListaApi.listar()
      if (seq !== cargaPaineisSeqRef.current) return
      setPaineis(data)
      const visivel = data.find(p => p.is_visivel !== false) ?? data[0]
      if (visivel) setPainelAtualId(visivel.id)
    } catch (err) {
      if (seq !== cargaPaineisSeqRef.current) return
      console.warn('[useListaPainelPedido] falha ao carregar painéis', err)
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

  const executarPersistencia = useCallback((id: string, estado: EstadoListaParaPainel) => {
    const configJson = JSON.stringify(estadoParaConfig(estado))
    void paineisListaApi.atualizar(id, { config_json: configJson })
      .then(() => {
        setPaineis(prev => prev.map(p => (
          p.id === id ? { ...p, config_json: configJson } : p
        )))
      })
      .catch(err => {
        console.warn('[useListaPainelPedido] falha ao persistir painel', id, err)
        addNotification({ type: 'error', message: mensagemErroPersistirPainel(err) })
      })
  }, [addNotification])

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
        origem: 'useListaPainelPedido.aplicarConfigDoPainel',
      })
    }

    if (config.colunas_visiveis.length > 0) {
      const prefs: GTPreferencias = {
        colunas_visiveis: config.colunas_visiveis,
        ...(config.colunas_largura ? { colunas_largura: config.colunas_largura } : {}),
        ...(config.colunas_manuais_conhecidas
          ? { colunas_manuais_conhecidas: config.colunas_manuais_conhecidas }
          : {}),
      }
      callbacks.setPreferencias(prefs)
    }

    callbacks.onConfigAplicada?.({
      aba: config.aba_status_ativa,
      sortCampo: config.ordenacao.campo,
      sortDir: config.ordenacao.direcao,
      busca: config.busca ?? '',
      filtrosColuna: deserializarFiltrosLista(config.filtros_coluna),
      cardsTopo: config.cards_topo,
    })

    queueMicrotask(() => {
      aplicandoConfigRef.current = false
      painelHidratadoIdRef.current = painel.id
      callbacks.onPainelHidratado?.(painel.id)
      const pendente = persistenciaPendenteAposConfigRef.current
      if (pendente && painelAtualIdRef.current === painel.id) {
        persistenciaPendenteAposConfigRef.current = null
        executarPersistencia(painel.id, pendente)
      }
    })
  }, [executarPersistencia])

  const persistirPainelAtual = useCallback((
    estado: EstadoListaParaPainel,
    opcoes?: PersistirPainelOpcoes,
  ) => {
    estadoRef.current = estado
    const id = painelAtualIdRef.current
    const opcoesPersistencia = opcoes?.acaoUsuario ? { acaoUsuario: true as const } : undefined

    if (!id) return

    if (aplicandoConfigRef.current) {
      if (opcoes?.acaoUsuario) {
        persistenciaPendenteAposConfigRef.current = estado
      }
      return
    }

    if (!podePersistirPainelLista(
      id,
      aplicandoConfigRef.current,
      painelHidratadoIdRef.current,
      opcoesPersistencia,
    )) {
      return
    }

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
      persistTimerRef.current = null
    }

    if (opcoes?.imediato) {
      executarPersistencia(id, estado)
      return
    }

    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      const idAtual = painelAtualIdRef.current
      const estadoAtual = estadoRef.current
      if (!idAtual || !estadoAtual) return
      if (!podePersistirPainelLista(
        idAtual,
        aplicandoConfigRef.current,
        painelHidratadoIdRef.current,
      )) {
        return
      }
      executarPersistencia(idAtual, estadoAtual)
    }, 400)
  }, [executarPersistencia])

  useEffect(() => () => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
      persistTimerRef.current = null
    }
    const estado = estadoRef.current
    const id = painelAtualIdRef.current
    if (!estado || !podePersistirPainelLista(id, aplicandoConfigRef.current, painelHidratadoIdRef.current)) {
      return
    }
    executarPersistencia(id, estado)
  }, [executarPersistencia])

  const trocarPainel = useCallback(async (
    id: string,
    estadoAtual: EstadoListaParaPainel,
    callbacks: AplicarConfigListaPainelCallbacks,
  ) => {
    const idAnterior = painelAtualIdRef.current
    painelHidratadoIdRef.current = null
    if (idAnterior && idAnterior !== id) {
      const configJson = JSON.stringify(estadoParaConfig(estadoAtual))
      await paineisListaApi.atualizar(idAnterior, { config_json: configJson }).catch(err => {
        console.warn('[useListaPainelPedido] falha ao salvar painel anterior', idAnterior, err)
        addNotification({ type: 'error', message: mensagemErroPersistirPainel(err) })
      })
    }

    const proximo = paineis.find(p => p.id === id)
    if (!proximo) {
      console.warn('[useListaPainelPedido] painel não encontrado para troca', id)
      return
    }

    setPainelAtualId(id)
    aplicarConfigDoPainel(proximo, callbacks)
  }, [paineis, aplicarConfigDoPainel, addNotification])

  const criarPainel = useCallback(async (
    nome: string,
    estadoAtual: EstadoListaParaPainel,
    callbacks: AplicarConfigListaPainelCallbacks,
  ) => {
    const trimmed = nome.trim()
    if (!trimmed) return null
    try {
      const configJson = JSON.stringify(estadoParaConfig(estadoAtual))
      const { data } = await paineisListaApi.criar(trimmed, configJson)
      setPaineis(prev => [...prev, data])
      painelHidratadoIdRef.current = null
      setPainelAtualId(data.id)
      aplicarConfigDoPainel(data, callbacks)
      return data
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[useListaPainelPedido] falha ao criar painel', msg, err)
      throw err instanceof Error ? err : new Error(msg)
    }
  }, [aplicarConfigDoPainel])

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
    criarPainel,
    aplicandoConfigRef,
    painelHidratadoIdRef,
  }
}
