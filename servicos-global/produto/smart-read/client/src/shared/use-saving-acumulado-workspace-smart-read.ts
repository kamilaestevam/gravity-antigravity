/**
 * Saving acumulado do workspace — 1 chamada ao agregado do BFF (Postgres Gravity).
 * Substitui a paginação da listagem DATI no client (tempestade de requisições a
 * cada 30s que saturava as conexões do navegador e estrangulava o upload).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { smartReadApi } from './api'
import type { SavingAgregadoTransacoesSmartRead } from './calcular-saving-agregado-transacoes-smart-read'

import type { TransacaoLeitura } from './schemas'

const INTERVALO_RECARGA_PADRAO_MS = 30_000

type EstadoSavingAcumulado = SavingAgregadoTransacoesSmartRead & {
  transacoes: TransacaoLeitura[]
  carregando: boolean
  erro: string | null
  /** Menor data_envio espelhada no Postgres — rótulo «desde DD/MM/AAAA». */
  dataInicioHistorico: string | null
  /** Mediana de tempo de análise — calibra a barra de estimativa do passo 2. */
  tempoMedianoAnaliseMs: number | null
}

const ESTADO_INICIAL: EstadoSavingAcumulado = {
  minutos: null,
  brl: null,
  leiturasComSaving: 0,
  totalDocumentos: 0,
  transacoes: [],
  carregando: false,
  erro: null,
  dataInicioHistorico: null,
  tempoMedianoAnaliseMs: null,
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
  const carregandoRef = useRef(false)
  const intervaloRecargaMs = opcoes?.intervaloRecargaMs ?? INTERVALO_RECARGA_PADRAO_MS

  const carregar = useCallback(async () => {
    // Guarda anti-sobreposição: o setInterval não pode empilhar uma nova
    // passada enquanto a anterior ainda está em voo.
    if (carregandoRef.current) return
    carregandoRef.current = true

    setEstado((anterior) => ({ ...anterior, carregando: anterior.transacoes.length === 0, erro: null }))
    try {
      const agregado = await smartReadApi.obterAgregadoWorkspaceLeituras()

      if (canceladoRef.current) return

      setEstado({
        minutos: agregado.saving_total_minutos,
        brl: agregado.saving_total_brl,
        leiturasComSaving: agregado.leituras_com_saving,
        totalDocumentos: agregado.total_documentos,
        transacoes: agregado.transacoes,
        carregando: false,
        erro: null,
        dataInicioHistorico: agregado.data_inicio_historico,
        tempoMedianoAnaliseMs: agregado.tempo_mediano_analise_ms,
      })
    } catch {
      if (canceladoRef.current) return
      setEstado({
        ...ESTADO_INICIAL,
        erro: 'Falha ao carregar histórico',
      })
    } finally {
      carregandoRef.current = false
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
