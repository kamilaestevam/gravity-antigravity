// FiltroChipStatus.tsx — chip de status ativo na toolbar (padrão .fc-chip).
// Ex.: "Status: Em Criação" com botão × para voltar à aba "Todos/Todas".

import React from 'react'

export interface FiltroChipStatusProps {
  /** Rótulo do campo (default: "Status") */
  rotuloCampo?: string
  /** Valor exibido (rótulo da aba selecionada) */
  rotuloValor: string
  /** Remove o filtro (tipicamente volta para aba "todos") */
  onRemover: () => void
  /** aria-label do botão remover (opcional) */
  ariaLabelRemover?: string
}

function FcChipRemoveIcon(): React.ReactElement {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 4 L12 12 M12 4 L4 12" />
    </svg>
  )
}

export function FiltroChipStatus({
  rotuloCampo = 'Status',
  rotuloValor,
  onRemover,
  ariaLabelRemover,
}: FiltroChipStatusProps): React.ReactElement {
  return (
    <span className="fc-chip" role="status">
      <span className="fc-chip-label">{rotuloCampo}:</span>
      <span className="fc-chip-valor">{rotuloValor}</span>
      <button
        type="button"
        className="fc-chip-remove"
        onClick={onRemover}
        aria-label={ariaLabelRemover ?? `Remover filtro ${rotuloCampo}`}
      >
        <FcChipRemoveIcon />
      </button>
    </span>
  )
}
