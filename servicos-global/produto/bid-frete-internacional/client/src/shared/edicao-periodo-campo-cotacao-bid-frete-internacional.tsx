/**
 * Edição de campo data/hora — paridade com coluna tipo periodo da lista.
 */
import React, { useRef, useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { EdicaoPeriodoPopoverGlobal } from '@nucleo/tabela-virtual-global'
import { formatarDataBidFrete } from './formato-data-bid-frete'

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

export interface EdicaoPeriodoCampoCotacaoBidFreteInternacionalProps {
  label: string
  valorIso: string | null
  permiteEditar: boolean
  comHorario?: boolean
  motivoBloqueado?: string
  salvando: boolean
  resultadoSalvar: 'sucesso' | 'erro' | null
  onConfirmar: (iso: string | null) => void | Promise<void>
}

export function EdicaoPeriodoCampoCotacaoBidFreteInternacional({
  label,
  valorIso,
  permiteEditar,
  comHorario = true,
  motivoBloqueado,
  salvando,
  resultadoSalvar,
  onConfirmar,
}: EdicaoPeriodoCampoCotacaoBidFreteInternacionalProps) {
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

  const textoExibicao = comHorario
    ? dataHoraBR(valorIso)
    : formatarDataBidFrete(valorIso)

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
          comHorario={comHorario}
          salvando={salvando}
          resultado={resultadoSalvar}
          onConfirmar={(iso) => void handleConfirmar(iso)}
          onCancelar={() => setPopoverAberto(false)}
        />
      ) : null}
    </div>
  )
}
