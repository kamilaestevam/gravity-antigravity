/**
 * Edição de campo texto — popover global (mesmo padrão do prazo/datas do cockpit).
 */
import React, { useRef, useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { EdicaoTextoPopoverGlobal } from '@nucleo/tabela-virtual-global'

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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverAberto, setPopoverAberto] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  function abrirPopover() {
    if (!permiteEditar || salvando) return
    const el = triggerRef.current
    if (!el) return
    setAnchorRect(el.getBoundingClientRect())
    setPopoverAberto(true)
  }

  async function handleConfirmar(texto: string | null) {
    await onConfirmar(texto)
    setPopoverAberto(false)
  }

  if (!permiteEditar) {
    return <span className="cdado-texto">{valor?.trim() ? valor : '—'}</span>
  }

  return (
    <div className="dc-cronograma-prazo-editor">
      <button
        ref={triggerRef}
        type="button"
        className="dc-cronograma-prazo-trigger"
        disabled={salvando}
        aria-label={label}
        onClick={abrirPopover}
      >
        <span className="dc-cronograma-prazo-trigger-valor">{valor?.trim() ? valor : '—'}</span>
        <PencilSimple weight="bold" size={14} className="dc-cronograma-prazo-trigger-icone" aria-hidden />
      </button>

      {popoverAberto && anchorRect ? (
        <EdicaoTextoPopoverGlobal
          anchorRect={anchorRect}
          label={label.toUpperCase()}
          valor={valor}
          salvando={salvando}
          onConfirmar={(texto) => void handleConfirmar(texto)}
          onCancelar={() => setPopoverAberto(false)}
        />
      ) : null}
    </div>
  )
}
