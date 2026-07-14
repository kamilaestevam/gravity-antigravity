import type { StatusFluxoLeitura } from '../../../shared/status-fluxo-leitura-smart-read'
import {
  CLASSE_PILL_STATUS_FLUXO_LEITURA,
  ROTULO_STATUS_FLUXO_LEITURA,
} from '../../../shared/status-fluxo-leitura-smart-read'

export function PillStatusFluxoLeitura({ status }: { status: StatusFluxoLeitura }) {
  return (
    <span className={`sr-pill ${CLASSE_PILL_STATUS_FLUXO_LEITURA[status]}`}>
      {ROTULO_STATUS_FLUXO_LEITURA[status]}
    </span>
  )
}
