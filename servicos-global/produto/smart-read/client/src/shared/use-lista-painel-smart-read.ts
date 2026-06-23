/**
 * Estado e persistência dos painéis da Lista (Smart Read).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useShellStore } from '@gravity/shell'
import type { FiltrosAtivosMap, GTPreferencias } from '@nucleo/tabela-virtual-global'
import {
  configListaPainelPadraoV1,
  parsearConfigListaPainel,
  parsearConfigListaPainelSeguro,
  type ListaPainelConfigV1,
} from '../../../shared/listaPainelConfigSchema'
import { podePersistirPainelLista } from '../../../shared/persistenciaListaPainel'
import { COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ } from './colunas-lista-leitura-smart-read'
import { paineisListaSmartReadApi, type ListaPainel } from './api'
import { deserializarFiltrosLista, serializarFiltrosLista } from './lista-painel-filtros'

export interface EstadoListaParaPainel {
  preferencias: GTPreferencias | undefined
  abaAtiva: string
  sortCampo: string
  sortDir: 'asc' | 'desc'
  busca: string
  filtrosAtivos: FiltrosAtivosMap
}

export interface AplicarConfigListaPainelCallbacks {
  setPreferencias: (p: GTPreferencias | undefined) => void
  setAbaAtiva: (aba: string) => void
  setSortCampo: (c: string) => void
  setSortDir: (d: 'asc' | 'desc') => void
  setBusca: (b: string) => void
  setFiltrosAtivos: (f: FiltrosAtivosMap) => void
  onConfigAplicada?: (snapshot: {
    aba: string
    sortCampo: string
    sortDir: 'asc' | 'desc'
    busca: string
    filtrosColuna: FiltrosAtivosMap
  }) => void
  onPainelHidratado?: (idPainel: string) => void
}

export interface PersistirPainelOpcoes {
  imediato?: boolean
  acaoUsuario?: boolean
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
  })
}

function mensagemErroPersistirPainel(err: unknown): string {
  const detalhe = err instanceof Error ? err.message.trim() : ''
  return detalhe
    ? `Não foi possível salvar o painel. ${detalhe}`
    : 'Não foi possível salvar o painel da lista.'
}

function normalizarColunasVisiveis(colunas: string[]): string[] {
  const padrao = [...COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ]
  if (colunas.length === 0) return padrao

  const legadoCincoColunas = new Set([
    'nome_leitura',
    'status_leitura',
    'total_arquivos',
    'media_acertos',
    'data_envio',
  ])
  const painelSoLegado =
    colunas.length === legadoCincoColunas.size &&
    colunas.every((chave) => legadoCincoColunas.has(chave))
  if (painelSoLegado) return padrao

  const presentes = new Set(colunas)
  const faltando = padrao.filter((chave) => !presentes.has(chave))
  if (faltando.length === 0) {
    const extras = colunas.filter((chave) => !padrao.includes(chave as (typeof padrao)[number]))
    return [...padrao, ...extras]
  }

  const merged = [...colunas]
  for (const chave of faltando) {
    const idxPadrao = padrao.indexOf(chave)
    let inserirEm = merged.length
    for (let i = idxPadrao - 1; i >= 0; i -= 1) {
      const ancora = padrao[i]
      const idxAncora = merged.indexOf(ancora)
      if (idxAncora >= 0) {
        inserirEm = idxAncora + 1
        break
      }
    }
    merged.splice(inserirEm, 0, chave)
  }
  return merged
}

export function useListaPainelSmartRead() {
  const idOrganizacao = useShellStore(
    (s) => s.currentUser.idOrganizacao ?? (import.meta.env.VITE_DEV_ID_ORGANIZACAO as string | undefined) ?? '',
  )
  const idUsuario = useShellStore((s) => s.currentUser.id ?? '')
  const addNotification = useShellStore((s) => s.addNotification)
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
      const { data } = await paineisListaSmartReadApi.listar()
      if (seq !== cargaPaineisSeqRef.current) return
      setPaineis(data)
      const visivel = data.find((p) => p.is_visivel !== false) ?? data[0]
      if (visivel) setPainelAtualId(visivel.id)
    } catch (err) {
      if (seq !== cargaPaineisSeqRef.current) return
      console.warn('[useListaPainelSmartRead] falha ao carregar painéis', err)
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

  const executarPersistencia = useCallback(async (id: string, estado: EstadoListaParaPainel) => {
    const configJson = JSON.stringify(estadoParaConfig(estado))
    try {
      await paineisListaSmartReadApi.atualizar(id, { config_json: configJson })
      setPaineis((prev) => prev.map((p) => (p.id === id ? { ...p, config_json: configJson } : p)))
    } catch (err) {
      console.warn('[useListaPainelSmartRead] falha ao persistir painel', id, err)
      addNotification({ type: 'error', message: mensagemErroPersistirPainel(err) })
    }
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
        origem: 'useListaPainelSmartRead.aplicarConfigDoPainel',
      })
    }

    const colunasVisiveis = normalizarColunasVisiveis(config.colunas_visiveis)
    const prefs: GTPreferencias = {
      colunas_visiveis: colunasVisiveis,
      ...(config.colunas_largura ? { colunas_largura: config.colunas_largura } : {}),
    }
    callbacks.setPreferencias(prefs)
    callbacks.setAbaAtiva(config.aba_status_ativa)
    callbacks.setSortCampo(config.ordenacao.campo)
    callbacks.setSortDir(config.ordenacao.direcao)
    callbacks.setBusca(config.busca ?? '')
    callbacks.setFiltrosAtivos(deserializarFiltrosLista(config.filtros_coluna))

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
      const pendente = persistenciaPendenteAposConfigRef.current
      if (pendente && painelAtualIdRef.current === painel.id) {
        persistenciaPendenteAposConfigRef.current = null
        void executarPersistencia(painel.id, pendente)
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
      void executarPersistencia(id, estado)
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
      void executarPersistencia(idAtual, estadoAtual)
    }, 400)
  }, [executarPersistencia])

  const persistirPainelAtualImediato = useCallback((
    estado: EstadoListaParaPainel,
    opcoes?: Omit<PersistirPainelOpcoes, 'imediato'>,
  ) => {
    persistirPainelAtual(estado, { ...opcoes, imediato: true, acaoUsuario: true })
  }, [persistirPainelAtual])

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
    void executarPersistencia(id, estado)
  }, [executarPersistencia])

  const painelAtual = paineis.find((p) => p.id === painelAtualId) ?? null

  return {
    paineis,
    painelAtualId,
    painelAtual,
    carregando,
    carregarPaineis,
    aplicarConfigDoPainel,
    persistirPainelAtual,
    persistirPainelAtualImediato,
    aplicandoConfigRef,
    painelHidratadoIdRef,
  }
}
