/**
 * Estado e carga dos painéis do Dashboard (paridade useListaPainelBidFrete).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useShellStore } from '@gravity/shell'
import { identidadeTenantApiPronta } from './api'
import type { DashboardPainel } from './api'

export interface UseDashboardPainelBidFreteParams {
  paineisDashboardApi: {
    listar: () => Promise<{ data: DashboardPainel[] }>
    criar: (nome: string) => Promise<{ data: DashboardPainel }>
  }
  setPaineisStore: (paineis: DashboardPainel[]) => void
  setPainelAtualStore: (id: string) => void
  painelAtualIdStore: string | null
}

export function useDashboardPainelBidFrete({
  paineisDashboardApi,
  setPaineisStore,
  setPainelAtualStore,
  painelAtualIdStore,
}: UseDashboardPainelBidFreteParams) {
  const meStatus = useShellStore(s => s.meStatus)
  const [paineis, setPaineis] = useState<DashboardPainel[]>([])
  const [painelAtualId, setPainelAtualId] = useState<string | null>(painelAtualIdStore)
  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)
  const cargaPaineisSeqRef = useRef(0)

  const podeCarregar = identidadeTenantApiPronta() && meStatus === 'success'

  const carregarPaineis = useCallback(async () => {
    if (!podeCarregar) return
    const seq = ++cargaPaineisSeqRef.current
    setCarregando(true)
    setErroCarregar(null)
    try {
      let { data } = await paineisDashboardApi.listar()
      if (seq !== cargaPaineisSeqRef.current) return
      if (data.length === 0) {
        const criado = await paineisDashboardApi.criar('Principal')
        if (seq !== cargaPaineisSeqRef.current) return
        data = [criado.data]
      }
      setPaineis(data)
      setPaineisStore(data)
      const atualValido =
        painelAtualIdStore != null && data.some(p => p.id === painelAtualIdStore)
      const proximo = atualValido
        ? painelAtualIdStore!
        : (data.find(p => p.is_visivel !== false) ?? data[0])?.id ?? null
      if (proximo) {
        setPainelAtualId(proximo)
        if (!atualValido) setPainelAtualStore(proximo)
      }
    } catch (err) {
      if (seq !== cargaPaineisSeqRef.current) return
      console.warn('[useDashboardPainelBidFrete] falha ao carregar painéis', err)
      setPaineis([])
      setErroCarregar('Não foi possível carregar os painéis do dashboard.')
    } finally {
      if (seq === cargaPaineisSeqRef.current) setCarregando(false)
    }
  }, [
    podeCarregar,
    paineisDashboardApi,
    setPaineisStore,
    setPainelAtualStore,
    painelAtualIdStore,
  ])

  useEffect(() => {
    if (!podeCarregar) {
      cargaPaineisSeqRef.current += 1
      if (meStatus === 'success') setCarregando(false)
      return
    }
    void carregarPaineis()
  }, [podeCarregar, meStatus, carregarPaineis])

  const setPaineisCompleto = useCallback((next: DashboardPainel[]) => {
    setPaineis(next)
    setPaineisStore(next)
  }, [setPaineisStore])

  const setPainelAtualCompleto = useCallback((id: string) => {
    setPainelAtualId(id)
    setPainelAtualStore(id)
  }, [setPainelAtualStore])

  return {
    paineis,
    painelAtualId,
    carregando,
    erroCarregar,
    carregarPaineis,
    setPaineis: setPaineisCompleto,
    setPainelAtualId: setPainelAtualCompleto,
  }
}
