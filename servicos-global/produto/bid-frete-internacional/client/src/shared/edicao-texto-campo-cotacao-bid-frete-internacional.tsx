import React, { useEffect, useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'

export interface EdicaoTextoCampoCotacaoBidFreteInternacionalProps {
  label: string
  valor: string | null
  permiteEditar: boolean
  salvando: boolean
  onConfirmar: (texto: string | null) => void | Promise<void>
}

export function EdicaoTextoCampoCotacaoBidFreteInternacional({
  label,
  valor,
  permiteEditar,
  salvando,
  onConfirmar,
}: EdicaoTextoCampoCotacaoBidFreteInternacionalProps) {
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState(valor ?? '')

  useEffect(() => {
    if (!editando) setRascunho(valor ?? '')
  }, [valor, editando])

  async function confirmar() {
    const texto = rascunho.trim() || null
    await onConfirmar(texto)
    setEditando(false)
  }

  if (!permiteEditar) {
    return <span className="cdado-texto">{valor?.trim() ? valor : '—'}</span>
  }

  if (editando) {
    return (
      <input
        type="text"
        className="dc-campo-espelho-input"
        value={rascunho}
        disabled={salvando}
        aria-label={label}
        autoFocus
        onChange={(e) => setRascunho(e.target.value)}
        onBlur={() => void confirmar()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void confirmar()
          if (e.key === 'Escape') {
            setRascunho(valor ?? '')
            setEditando(false)
          }
        }}
      />
    )
  }

  return (
    <button
      type="button"
      className="dc-cronograma-prazo-trigger"
      disabled={salvando}
      aria-label={label}
      onClick={() => setEditando(true)}
    >
      <span className="dc-cronograma-prazo-trigger-valor">{valor?.trim() ? valor : '—'}</span>
      <PencilSimple weight="bold" size={14} className="dc-cronograma-prazo-trigger-icone" aria-hidden />
    </button>
  )
}
