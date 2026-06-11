/**
 * Estado e carga dos painéis do Dashboard Pedido (paridade useListaPainelPedido / BID Frete).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useShellStore } from '@gravity/shell'
import { paineisDashboardApi, type DashboardPainel } from './api'

export interface UseDashboardPainelPedidoParams {
  setPaineisStore: (paineis: DashboardPainel[]) => void
  setPainelAtualStore: (id: string) => void
  painelAtualIdStore: string | null
}

export function useDashboardPainelPedido({
  setPaineisStore,
  setPainelAtualStore,
  painelAtualIdStore,
}: UseDashboardPainelPedidoParams) {
  const meStatus = useShellStore(s => s.meStatus)
  const idOrganizacao = useShellStore(
    s => s.currentUser.idOrganizacao ?? (import.meta.env.VITE_DEV_ID_ORGANIZACAO as string | undefined) ?? '',
  )
  const idUsuario = useShellStore(s => s.currentUser.id ?? '')
  const podeCarregar = Boolean(idOrganizacao && idUsuario) && meStatus === 'success'

  const [paineis, setPaineis] = useState<DashboardPainel[]>([])
  const [painelAtualId, setPainelAtualId] = useState<string | null>(painelAtualIdStore)
  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)
  const cargaPaineisSeqRef = useRef(0)

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
      console.warn('[useDashboardPainelPedido] falha ao carregar painéis', err)
      setPaineis([])
      setErroCarregar('Não foi possível carregar os painéis do dashboard.')
    } finally {
      if (seq === cargaPaineisSeqRef.current) setCarregando(false)
    }
  }, [podeCarregar, setPaineisStore, setPainelAtualStore, painelAtualIdStore])

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
