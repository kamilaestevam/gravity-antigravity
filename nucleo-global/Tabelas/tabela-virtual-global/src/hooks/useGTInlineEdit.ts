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
  // Ref síncrona para evitar closure stale em confirmarEdicao
  const valorEditandoRef = useRef<unknown>(null)
  const valorOriginalRef = useRef<unknown>(null)

  const iniciarEdicao = useCallback((id: string, campo: string, valorAtual: unknown) => {
    setEditandoCelula({ id, campo })
    setValorEditando(valorAtual)
    setValorOriginal(valorAtual)
    valorEditandoRef.current = valorAtual
    valorOriginalRef.current = valorAtual
    setErro(null)
  }, [])

  const atualizarValor = useCallback((valor: unknown) => {
    setValorEditando(valor)
    valorEditandoRef.current = valor
  }, [])

  const confirmarEdicao = useCallback(async () => {
    if (!editandoCelula || !onEditar || confirmandoRef.current) {
      if (!editandoCelula) setEditandoCelula(null)
      return
    }

    // Não salva se o valor não mudou
    if (valorEditandoRef.current === valorOriginalRef.current) {
      setEditandoCelula(null)
      return
    }

    confirmandoRef.current = true
    const { id, campo } = editandoCelula
    setSalvando(true)
    setErro(null)

    try {
      const itemAtualizado = await onEditar(id, campo, valorEditandoRef.current)
      onAtualizarItem?.(itemAtualizado)
      onSucesso?.()
      setEditandoCelula(null)
      setValorEditando(null)
      setValorOriginal(null)
      valorEditandoRef.current = null
      valorOriginalRef.current = null
    } catch (err: unknown) {
      // Rollback para o valor original
      setValorEditando(valorOriginalRef.current)
      valorEditandoRef.current = valorOriginalRef.current

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
  }, [editandoCelula, onEditar, onAtualizarItem, onSucesso, onErro])

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
