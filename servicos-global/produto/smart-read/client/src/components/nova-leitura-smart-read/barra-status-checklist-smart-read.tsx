/**
 * BarraStatusChecklistSmartRead — barra segmentada verde/amarelo/vermelho/pendente
 */

type Props = {
  verde: number
  amarelo: number
  vermelho: number
  pendente: number
  total: number
  classe?: string
}

export function BarraStatusChecklistSmartRead({
  verde,
  amarelo,
  vermelho,
  pendente,
  total,
  classe = '',
}: Props) {
  if (total === 0) {
    return (
      <div
        className={`sr-chk-info-barra sr-chk-info-barra--vazia${classe ? ` ${classe}` : ''}`}
        role="presentation"
      />
    )
  }

  const pct = (n: number) => `${(n / total) * 100}%`

  return (
    <div
      className={`sr-chk-info-barra${classe ? ` ${classe}` : ''}`}
      role="presentation"
      aria-hidden
    >
      {verde > 0 && <span className="sr-chk-info-barra--verde" style={{ width: pct(verde) }} />}
      {amarelo > 0 && <span className="sr-chk-info-barra--amarelo" style={{ width: pct(amarelo) }} />}
      {vermelho > 0 && <span className="sr-chk-info-barra--vermelho" style={{ width: pct(vermelho) }} />}
      {pendente > 0 && <span className="sr-chk-info-barra--pendente" style={{ width: pct(pendente) }} />}
    </div>
  )
}
