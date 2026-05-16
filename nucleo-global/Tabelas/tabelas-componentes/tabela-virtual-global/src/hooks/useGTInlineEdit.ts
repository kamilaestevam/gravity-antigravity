/**
 * @nucleo/tabela-virtual-global — useGTInlineEdit
 * Gerencia edição inline de células com update otimista e rollback em caso de conflito.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export interface CelulaEditando {
  id: string
  campo: string
}

export type ResultadoEdicao = 'sucesso' | 'erro' | null

export interface UseGTInlineEditRetorno<T> {
  editandoCelula: CelulaEditando | null
  valorEditando: unknown
  salvando: boolean
  erro: string | null
  resultado: ResultadoEdicao
  celulaResultado: CelulaEditando | null
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
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoEdicao>(null)
  const [celulaResultado, setCelulaResultado] = useState<CelulaEditando | null>(null)
  // Evita double-confirm quando Enter + blur disparam confirmarEdicao em sequência
  const confirmandoRef = useRef(false)
  // Ref síncrona para evitar closure stale em confirmarEdicao
  const valorEditandoRef = useRef<unknown>(null)
  const valorOriginalRef = useRef<unknown>(null)
  const resultadoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const iniciarEdicao = useCallback((id: string, campo: string, valorAtual: unknown) => {
    setEditandoCelula({ id, campo })
    setValorEditando(valorAtual)
    valorEditandoRef.current = valorAtual
    valorOriginalRef.current = valorAtual
    setErro(null)
  }, [])

  const atualizarValor = useCallback((valor: unknown) => {
    setValorEditando(valor)
    valorEditandoRef.current = valor
  }, [])

  const confirmarEdicao = useCallback(async () => {
    if (!editandoCelula || confirmandoRef.current) return

    // Sem handler de save → fecha a célula como noop
    if (!onEditar) {
      setEditandoCelula(null)
      setValorEditando(null)
      return
    }

    // Não salva se o valor não mudou — usa JSON para comparar objetos compostos (moeda, unidade)
    if (JSON.stringify(valorEditandoRef.current) === JSON.stringify(valorOriginalRef.current)) {
      setEditandoCelula(null)
      return
    }

    confirmandoRef.current = true
    const { id, campo } = editandoCelula
    setSalvando(true)
    setErro(null)

    // Limpa timer anterior se houver (edição rápida em sequência)
    if (resultadoTimerRef.current) {
      clearTimeout(resultadoTimerRef.current)
      resultadoTimerRef.current = null
    }

    try {
      const itemAtualizado = await onEditar(id, campo, valorEditandoRef.current)
      onAtualizarItem?.(itemAtualizado)
      onSucesso?.()
      setEditandoCelula(null)
      setValorEditando(null)
      valorEditandoRef.current = null
      valorOriginalRef.current = null

      // Flash de sucesso na célula que acabou de ser salva
      setCelulaResultado({ id, campo })
      setResultado('sucesso')
      resultadoTimerRef.current = setTimeout(() => {
        setResultado(null)
        setCelulaResultado(null)
        resultadoTimerRef.current = null
      }, 600)
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

      // Flash de erro na célula que falhou
      setCelulaResultado({ id, campo })
      setResultado('erro')
      resultadoTimerRef.current = setTimeout(() => {
        setResultado(null)
        setCelulaResultado(null)
        resultadoTimerRef.current = null
      }, 1000)
    } finally {
      setSalvando(false)
      confirmandoRef.current = false
    }
  }, [editandoCelula, onEditar, onAtualizarItem, onSucesso, onErro])

  const cancelarEdicao = useCallback(() => {
    setEditandoCelula(null)
    setValorEditando(null)
    setErro(null)
  }, [])

  // Limpa timer de resultado ao desmontar
  useEffect(() => {
    return () => {
      if (resultadoTimerRef.current) clearTimeout(resultadoTimerRef.current)
    }
  }, [])

  return {
    editandoCelula,
    valorEditando,
    salvando,
    erro,
    resultado,
    celulaResultado,
    iniciarEdicao,
    atualizarValor,
    confirmarEdicao,
    cancelarEdicao,
  }
}
