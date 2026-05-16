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
  confirmarEdicao: (opts?: OpcoesConfirmacaoEdicao) => Promise<void>
  cancelarEdicao: () => void
}

// Opcoes que o popover passa ao confirmar — capturadas via confirmarEdicao(opts).
// Decisao UX 2026-05-13: checkbox "Aplicar a todos os itens" no popover da
// linha PAI dispara replicar_em_itens=true. Default false preserva o
// comportamento divergente (item mantem valor proprio, pai mostra alerta).
export interface OpcoesConfirmacaoEdicao {
  replicar_em_itens?: boolean
}

export function useGTInlineEdit<T>(
  onEditar?: (id: string, campo: string, valor: unknown, opts?: OpcoesConfirmacaoEdicao) => Promise<T>,
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
  const confirmandoRef = useRef(false)
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

  const confirmarEdicao = useCallback(async (opts?: OpcoesConfirmacaoEdicao) => {
    if (!editandoCelula || confirmandoRef.current) return

    // Sem handler de save → fecha a célula como noop
    if (!onEditar) {
      setEditandoCelula(null)
      setValorEditando(null)
      return
    }

    // Não salva se o valor não mudou — EXCETO quando o popover pediu
    // replicar_em_itens (a intenção é propagar mesmo valor para os filhos).
    const valorIgual = JSON.stringify(valorEditandoRef.current) === JSON.stringify(valorOriginalRef.current)
    if (valorIgual && !opts?.replicar_em_itens) {
      setEditandoCelula(null)
      return
    }

    confirmandoRef.current = true
    const { id, campo } = editandoCelula
    setSalvando(true)
    setErro(null)

    if (resultadoTimerRef.current) {
      clearTimeout(resultadoTimerRef.current)
      resultadoTimerRef.current = null
    }

    try {
      const itemAtualizado = await onEditar(id, campo, valorEditandoRef.current, opts)
      onAtualizarItem?.(itemAtualizado)
      onSucesso?.()
      valorEditandoRef.current = null
      valorOriginalRef.current = null

      setResultado('sucesso')
      setCelulaResultado({ id, campo })
      resultadoTimerRef.current = setTimeout(() => {
        setEditandoCelula(null)
        setValorEditando(null)
        setResultado(null)
        setCelulaResultado(null)
        resultadoTimerRef.current = null
      }, 600)
    } catch (err: unknown) {
      setValorEditando(valorOriginalRef.current)
      valorEditandoRef.current = valorOriginalRef.current

      const mensagem =
        err instanceof Error
          ? err.message
          : 'Erro ao salvar. Tente novamente.'

      setErro(mensagem)
      onErro?.(mensagem)

      setResultado('erro')
      setCelulaResultado({ id, campo })
      resultadoTimerRef.current = setTimeout(() => {
        setEditandoCelula(null)
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
