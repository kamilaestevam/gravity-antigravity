/**
 * ConectorPaiLista — chevron isolado na expand cell do processo (L1).
 */
import React from 'react'
import type { GTConectorPaiContext } from '@nucleo/tabela-virtual-global'

function IconeChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4 2L8 6L4 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function pararPropagacao(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

export function ConectorPaiLista({
  expandido,
  carregando,
  onToggle,
}: GTConectorPaiContext) {
  if (carregando) {
    return <span className="gtv-spinner" aria-label="Carregando filhos..." />
  }

  return (
    <div
      className="pl-conector-processo-slot"
      onClick={pararPropagacao}
      onMouseDown={pararPropagacao}
      onPointerDown={pararPropagacao}
    >
      <button
        type="button"
        className="gtv-chevron-btn pl-processo-chevron"
        aria-expanded={expandido}
        aria-label={expandido ? 'Retrair pedidos do processo' : 'Expandir pedidos do processo'}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        onMouseDown={pararPropagacao}
      >
        <span className={`gtv-chevron-icon${expandido ? ' gtv-chevron-icon--aberto' : ''}`}>
          <IconeChevron />
        </span>
      </button>
    </div>
  )
}
