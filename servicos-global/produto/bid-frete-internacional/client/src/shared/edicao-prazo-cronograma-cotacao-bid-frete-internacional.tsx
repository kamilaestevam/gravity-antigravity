/**
 * Prazo para resposta — edição inline com EdicaoPeriodoPopoverGlobal (paridade lista Pedido).
 */
import React, { useRef, useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { EdicaoPeriodoPopoverGlobal } from '@nucleo/tabela-virtual-global'

const dataHoraBR = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : null

export interface EdicaoPrazoCronogramaCotacaoBidFreteInternacionalProps {
  label: string
  valorIso: string | null
  permiteEditar: boolean
  salvando: boolean
  resultadoSalvar: 'sucesso' | 'erro' | null
  onConfirmar: (iso: string | null) => void | Promise<void>
}

export function EdicaoPrazoCronogramaCotacaoBidFreteInternacional({
  label,
  valorIso,
  permiteEditar,
  salvando,
  resultadoSalvar,
  onConfirmar,
}: EdicaoPrazoCronogramaCotacaoBidFreteInternacionalProps) {
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

  async function handleConfirmar(iso: string | null) {
    await onConfirmar(iso)
    setPopoverAberto(false)
  }

  const textoExibicao = dataHoraBR(valorIso)

  return (
    <div className="dc-cronograma-prazo-editor">
      {permiteEditar ? (
        <button
          ref={triggerRef}
          type="button"
          className="dc-cronograma-prazo-trigger"
          onClick={abrirPopover}
          disabled={salvando}
          aria-label={label}
        >
          <span className="dc-cronograma-prazo-trigger-valor">
            {textoExibicao ?? '—'}
          </span>
          <PencilSimple weight="bold" size={14} className="dc-cronograma-prazo-trigger-icone" aria-hidden />
        </button>
      ) : (
        <span className="cdado-texto">{textoExibicao ?? '—'}</span>
      )}

      {popoverAberto && anchorRect ? (
        <EdicaoPeriodoPopoverGlobal
          anchorRect={anchorRect}
          label={label.toUpperCase()}
          valorIso={valorIso}
          comHorario
          salvando={salvando}
          resultado={resultadoSalvar}
          onConfirmar={(iso) => void handleConfirmar(iso)}
          onCancelar={() => setPopoverAberto(false)}
        />
      ) : null}
    </div>
  )
}
