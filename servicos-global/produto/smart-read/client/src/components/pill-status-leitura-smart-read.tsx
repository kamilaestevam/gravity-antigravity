import type { StatusLeitura } from '../shared/schemas'
import { ROTULO_STATUS_LEITURA } from '../shared/formatacao-leitura-smart-read'

export function PillStatusLeitura({ status }: { status: StatusLeitura }) {
  return (
    <span className={`sr-pill sr-pill-${status.toLowerCase()}`}>
      {ROTULO_STATUS_LEITURA[status]}
    </span>
  )
}
