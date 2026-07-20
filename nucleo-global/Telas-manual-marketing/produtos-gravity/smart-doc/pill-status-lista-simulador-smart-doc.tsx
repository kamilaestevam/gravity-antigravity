import type { StatusLeituraSimulador } from './dados-lista-simulador-smart-doc'
import { ROTULO_STATUS_LEITURA_SIMULADOR } from './formatacao-lista-simulador-smart-doc'
import './pill-status-lista-simulador-smart-doc.css'

export function PillStatusListaSimuladorSmartDoc({ status }: { status: StatusLeituraSimulador }) {
  return (
    <span className={`sds-sr-pill sds-sr-pill--${status.toLowerCase()}`}>
      {ROTULO_STATUS_LEITURA_SIMULADOR[status]}
    </span>
  )
}
