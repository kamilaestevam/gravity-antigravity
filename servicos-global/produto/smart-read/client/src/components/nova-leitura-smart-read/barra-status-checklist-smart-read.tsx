/**
 * BarraStatusChecklistSmartRead — barra segmentada verde/amarelo/vermelho/pendente/na
 */

type Props = {
  verde: number
  amarelo: number
  vermelho: number
  pendente: number
  na?: number
  total: number
  classe?: string
  /** Barra ainda recebendo prévia local ou enriquecimento IA */
  emAnalise?: boolean
}

export function BarraStatusChecklistSmartRead({
  verde,
  amarelo,
  vermelho,
  pendente,
  na = 0,
  total,
  classe = '',
  emAnalise = false,
}: Props) {
  const classeEmAnalise = emAnalise ? ' sr-chk-info-barra--em-analise' : ''

  if (total === 0) {
    return (
      <div
        className={`sr-chk-info-barra sr-chk-info-barra--vazia${classeEmAnalise}${classe ? ` ${classe}` : ''}`}
        role="presentation"
      >
        {emAnalise ? <span className="sr-barra-overlay-em-analise" aria-hidden /> : null}
      </div>
    )
  }

  const pct = (n: number) => `${(n / total) * 100}%`

  return (
    <div
      className={`sr-chk-info-barra${classeEmAnalise}${classe ? ` ${classe}` : ''}`}
      role="presentation"
      aria-hidden
    >
      {verde > 0 && <span className="sr-chk-info-barra--verde" style={{ width: pct(verde) }} />}
      {na > 0 && <span className="sr-chk-info-barra--na" style={{ width: pct(na) }} />}
      {amarelo > 0 && <span className="sr-chk-info-barra--amarelo" style={{ width: pct(amarelo) }} />}
      {vermelho > 0 && <span className="sr-chk-info-barra--vermelho" style={{ width: pct(vermelho) }} />}
      {pendente > 0 && <span className="sr-chk-info-barra--pendente" style={{ width: pct(pendente) }} />}
      {emAnalise ? <span className="sr-barra-overlay-em-analise" aria-hidden /> : null}
    </div>
  )
}
