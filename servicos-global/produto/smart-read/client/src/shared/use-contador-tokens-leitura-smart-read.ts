/**
 * use-contador-tokens-leitura-smart-read.ts — contador discreto na jornada Nova Leitura
 */

import { useCallback, useEffect, useState } from 'react'
import type { ResumoUsoLlmLeituraSmartRead } from '../../../shared/uso-llm-leitura-smart-read'
import { smartReadApi } from './api'

const resumoVazio = (): ResumoUsoLlmLeituraSmartRead => ({
  tokens_entrada: 0,
  tokens_saida: 0,
  tokens_total: 0,
  total_chamadas: 0,
  custo_usd: 0,
})

export function useContadorTokensLeituraSmartRead(idLeituraLegado: string | null) {
  const [resumo, setResumo] = useState<ResumoUsoLlmLeituraSmartRead>(resumoVazio)
  const [carregando, setCarregando] = useState(false)

  const recarregar = useCallback(async () => {
    if (!idLeituraLegado) {
      setResumo(resumoVazio())
      return
    }
    setCarregando(true)
    try {
      const dados = await smartReadApi.obterResumoTokensLeitura(idLeituraLegado)
      setResumo(dados)
    } catch {
      // Mantém último valor — contador é informativo, não bloqueia fluxo
    } finally {
      setCarregando(false)
    }
  }, [idLeituraLegado])

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  const aplicarResumoLeitura = useCallback((parcial: ResumoUsoLlmLeituraSmartRead | null | undefined) => {
    if (parcial) setResumo(parcial)
    else void recarregar()
  }, [recarregar])

  return {
    resumo,
    carregando,
    recarregar,
    aplicarResumoLeitura,
    tokensTotal: resumo.tokens_total,
  }
}
