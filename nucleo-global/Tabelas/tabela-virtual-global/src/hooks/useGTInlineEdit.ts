/**
 * @nucleo/tabela-virtual-global — useGTInlineEdit
 * Gerencia edição inline de células com update otimista e rollback em caso de conflito.
 */

import { useState, useCallback, useRef } from 'react'

export interface CelulaEditando {
  id: string
  campo: string
}

export interface UseGTInlineEditRetorno<T> {
  editandoCelula: CelulaEditando | null
  valorEditando: unknown
  salvando: boolean
  erro: string | null
  iniciarEdicao: (id: string, campo: string, valorAtual: unknown) => void
  atualizarValor: (valor: unknown) => void
  confirmarEdicao: () => Promise<void>
  cancelarEdicao: () => void
}

export function useGTInlineEdit<T>(
  onEditar?: (id: string, campo: string, valor: unknown) => Promise<T>,
  onAtualizarItem?: (item: T) => void,
  onSucesso?: () => void,
  onErro?: (mensagem: string) => void,
): UseGTInlineEditRetorno<T> {
  const [editandoCelula, setEditandoCelula] = useState<CelulaEditando | null>(null)
  const [valorEditando, setValorEditando] = useState<unknown>(null)
  const [valorOriginal, setValorOriginal] = useState<unknown>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  // Evita double-confirm quando Enter + blur disparam confirmarEdicao em sequência
  const confirmandoRef = useRef(false)

  const iniciarEdicao = useCallback((id: string, campo: string, valorAtual: unknown) => {
    setEditandoCelula({ id, campo })
    setValorEditando(valorAtual)
    setValorOriginal(valorAtual)
    setErro(null)
  }, [])

  const atualizarValor = useCallback((valor: unknown) => {
    setValorEditando(valor)
  }, [])

  const confirmarEdicao = useCallback(async () => {
    if (!editandoCelula || !onEditar || confirmandoRef.current) {
      if (!editandoCelula) setEditandoCelula(null)
      return
    }

    confirmandoRef.current = true
    const { id, campo } = editandoCelula
    setSalvando(true)
    setErro(null)

    try {
      const itemAtualizado = await onEditar(id, campo, valorEditando)
      onAtualizarItem?.(itemAtualizado)
      onSucesso?.()
      setEditandoCelula(null)
      setValorEditando(null)
      setValorOriginal(null)
    } catch (err: unknown) {
      // Rollback para o valor original
      setValorEditando(valorOriginal)

      const mensagem =
        err instanceof Error
          ? err.message
          : 'Erro ao salvar. Tente novamente.'

      setErro(mensagem)
      onErro?.(mensagem)
      setEditandoCelula(null)
    } finally {
      setSalvando(false)
      confirmandoRef.current = false
    }
  }, [editandoCelula, valorEditando, valorOriginal, onEditar, onAtualizarItem, onSucesso, onErro])

  const cancelarEdicao = useCallback(() => {
    setEditandoCelula(null)
    setValorEditando(null)
    setValorOriginal(null)
    setErro(null)
  }, [])

  return {
    editandoCelula,
    valorEditando,
    salvando,
    erro,
    iniciarEdicao,
    atualizarValor,
    confirmarEdicao,
    cancelarEdicao,
  }
}
