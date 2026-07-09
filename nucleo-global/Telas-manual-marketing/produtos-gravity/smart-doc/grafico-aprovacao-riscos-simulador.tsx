/**
 * GraficoAprovacaoRiscosSimulador — progresso da conferência manual dos riscos (checkboxes)
 * Paridade GraficoConferenciaCheckedSmartRead
 */

type Props = {
  marcados: number
  total: number
  classe?: string
}

const RAIO = 36
const COMPRIMENTO_ARCO = 2 * Math.PI * RAIO

export function GraficoAprovacaoRiscosSimulador({ marcados, total, classe = '' }: Props) {
  const percentual = total > 0 ? Math.round((marcados / total) * 100) : 0
  const offset = COMPRIMENTO_ARCO - (percentual / 100) * COMPRIMENTO_ARCO

  return (
    <div
      className={`sr-chk-grafico-conferido sds-riscos-grafico-aprovacao${classe ? ` ${classe}` : ''}`}
      role="img"
      aria-label={`${marcados} de ${total} riscos conferidos manualmente (${percentual}%)`}
    >
      <div className="sr-chk-grafico-conferido-anel sds-riscos-grafico-aprovacao-anel">
        <svg viewBox="0 0 88 88" className="sr-chk-grafico-conferido-svg" aria-hidden>
          <circle
            cx="44"
            cy="44"
            r={RAIO}
            className="sr-chk-grafico-conferido-trilho"
            fill="none"
            strokeWidth="8"
          />
          <circle
            cx="44"
            cy="44"
            r={RAIO}
            className="sr-chk-grafico-conferido-progresso"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={COMPRIMENTO_ARCO}
            strokeDashoffset={offset}
            transform="rotate(-90 44 44)"
          />
        </svg>
        <div className="sr-chk-grafico-conferido-centro">
          <strong className="sr-chk-grafico-conferido-pct">{percentual}%</strong>
        </div>
      </div>
      <div className="sr-chk-grafico-conferido-legenda">
        <span className="sr-chk-grafico-conferido-titulo">Conferência manual</span>
        <span className="sr-chk-grafico-conferido-contagem">
          <strong>{marcados}</strong> / {total} conferidos
        </span>
      </div>
    </div>
  )
}
