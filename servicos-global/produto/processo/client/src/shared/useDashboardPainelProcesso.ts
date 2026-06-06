/**
 * Estado dos painéis do Dashboard Processo (localStorage até API dedicada).
 */
import { useCallback, useEffect, useState } from 'react'
import {
  paineisDashboardProcessoLocal,
  type ProcessoDashboardPainel,
} from './processoDashboardPainelLocal'

export function useDashboardPainelProcesso() {
  const [paineis, setPaineis] = useState<ProcessoDashboardPainel[]>([])
  const [painelAtualId, setPainelAtualId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const data = paineisDashboardProcessoLocal.listar()
    setPaineis(data)
    const salvo = paineisDashboardProcessoLocal.lerPainelAtualId()
    const valido = salvo != null && data.some(p => p.id === salvo)
    const proximo =
      valido && salvo
        ? salvo
        : (data.find(p => p.is_visivel !== false) ?? data[0])?.id ?? null
    setPainelAtualId(proximo)
    if (proximo) paineisDashboardProcessoLocal.gravarPainelAtualId(proximo)
    setCarregando(false)
  }, [])

  const onTrocarPainel = useCallback((id: string) => {
    setPainelAtualId(id)
    paineisDashboardProcessoLocal.gravarPainelAtualId(id)
  }, [])

  const onCriarPainel = useCallback(async (nome: string) => {
    const novo = paineisDashboardProcessoLocal.criar(nome)
    setPaineis(prev => [...prev, novo])
    setPainelAtualId(novo.id)
    paineisDashboardProcessoLocal.gravarPainelAtualId(novo.id)
    return true
  }, [])

  return {
    paineis,
    painelAtualId,
    carregando,
    setPaineis,
    setPainelAtualId,
    onTrocarPainel,
    onCriarPainel,
  }
}
