import React from 'react'
import { CaretLeft } from '@phosphor-icons/react'

interface UniBotaoVoltarPadraoProps {
  label: string
  onClick: () => void
}

/** Botão voltar — paridade `.uni-player-aula__voltar` / MenuTopoGlobal. */
export function UniBotaoVoltarPadrao({ label, onClick }: UniBotaoVoltarPadraoProps) {
  return (
    <button type="button" className="uni-player-aula__voltar" onClick={onClick}>
      <span className="uni-player-aula__voltar-icone" aria-hidden>
        <CaretLeft size={16} weight="bold" />
      </span>
      {label}
    </button>
  )
}
