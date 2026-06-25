/**
 * Saving acumulado do workspace — pagina todas as transações de envios.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { smartReadApi } from './api'
import { calcularSavingAgregadoTransacoesSmartRead } from './calcular-saving-agregado-transacoes-smart-read'
import type { SavingAgregadoTransacoesSmartRead } from './calcular-saving-agregado-transacoes-smart-read'

import type { TransacaoLeitura } from './schemas'

const INTERVALO_RECARGA_PADRAO_MS = 30_000

type EstadoSavingAcumulado = SavingAgregadoTransacoesSmartRead & {
  transacoes: TransacaoLeitura[]
  carregando: boolean
  erro: string | null
}

const ESTADO_INICIAL: EstadoSavingAcumulado = {
  minutos: null,
  brl: null,
  leiturasComSaving: 0,
  totalDocumentos: 0,
  transacoes: [],
  carregando: false,
  erro: null,
}

type OpcoesSavingAcumuladoWorkspace = {
  /** Recarga periódica enquanto habilitado (0 desliga). */
  intervaloRecargaMs?: number
  /** Dispara recarga imediata quando o valor muda (ex.: análise concluída). */
  gatilhoRecarga?: unknown
}

export function useSavingAcumuladoWorkspaceSmartRead(
  habilitado = true,
  opcoes?: OpcoesSavingAcumuladoWorkspace,
): EstadoSavingAcumulado & { recarregar: () => Promise<void> } {
  const [estado, setEstado] = useState<EstadoSavingAcumulado>(ESTADO_INICIAL)
  const canceladoRef = useRef(false)
  const intervaloRecargaMs = opcoes?.intervaloRecargaMs ?? INTERVALO_RECARGA_PADRAO_MS

  const carregar = useCallback(async () => {
    setEstado((anterior) => ({ ...anterior, carregando: anterior.transacoes.length === 0, erro: null }))
    try {
      const transacoes = []
      let pagina = 1
      let totalPaginas = 1

      while (pagina <= totalPaginas) {
        const lista = await smartReadApi.listarTransacoes({
          pagina,
          limite: 100,
        })
        transacoes.push(...lista.transacoes)
        totalPaginas = Math.max(1, Math.ceil(lista.paginacao.total / lista.paginacao.limite))
        pagina += 1
      }

      if (canceladoRef.current) return

      setEstado({
        ...calcularSavingAgregadoTransacoesSmartRead(transacoes),
        transacoes,
        carregando: false,
        erro: null,
      })
    } catch {
      if (canceladoRef.current) return
      setEstado((anterior) => ({
        minutos: null,
        brl: null,
        leiturasComSaving: 0,
        totalDocumentos: 0,
        transacoes: [],
        carregando: false,
        erro: 'Falha ao carregar histórico',
      }))
    }
  }, [])

  useEffect(() => {
    canceladoRef.current = false

    if (!habilitado) {
      setEstado(ESTADO_INICIAL)
      return () => {
        canceladoRef.current = true
      }
    }

    void carregar()

    if (intervaloRecargaMs > 0) {
      const id = window.setInterval(() => {
        void carregar()
      }, intervaloRecargaMs)
      return () => {
        canceladoRef.current = true
        window.clearInterval(id)
      }
    }

    return () => {
      canceladoRef.current = true
    }
  }, [habilitado, carregar, intervaloRecargaMs])

  useEffect(() => {
    if (!habilitado || opcoes?.gatilhoRecarga === undefined) return
    void carregar()
  }, [habilitado, opcoes?.gatilhoRecarga, carregar])

  return { ...estado, recarregar: carregar }
}
