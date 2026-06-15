/**
 * Conector da expand cell — só linhas BID (grupo) exibem chevron.
 * Cotações avulsas (COT) retornam null; o BID usa o markup padrão da TVG.
 */
import React from 'react'
import type { GTConectorPaiContext } from '@nucleo/tabela-virtual-global'
import { isLinhaBidGrupo, type LinhaPaiLista } from './lista-bid-frete-internacional-utils'

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

function ConectorChevronBid({ expandido, carregando, onToggle }: GTConectorPaiContext) {
  if (carregando) {
    return <span className="gtv-spinner" aria-label="Carregando filhos..." />
  }

  return (
    <div
      className="bf-conector-bid-slot"
      onClick={pararPropagacao}
      onMouseDown={pararPropagacao}
      onPointerDown={pararPropagacao}
    >
      <button
        type="button"
        className="gtv-chevron-btn"
        aria-expanded={expandido}
        aria-label={expandido ? 'Colapsar cotações do BID' : 'Expandir cotações do BID'}
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

export function renderConectorPaiListaBidFreteInternacional(
  item: LinhaPaiLista,
  ctx: GTConectorPaiContext,
): React.ReactNode {
  if (!isLinhaBidGrupo(item)) return null
  return <ConectorChevronBid {...ctx} />
}
