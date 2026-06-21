import type { MetricaSerieTemporalInsightsSmartRead } from '../pages/insights-smart-read/agrupar-campos-por-dia-insights-smart-read'

type Props = {
  metrica: MetricaSerieTemporalInsightsSmartRead
  onChangeMetrica: (metrica: MetricaSerieTemporalInsightsSmartRead) => void
}

const OPCOES: { id: MetricaSerieTemporalInsightsSmartRead; rotulo: string }[] = [
  { id: 'campos', rotulo: 'Campos' },
  { id: 'documentos', rotulo: 'Documentos' },
]

export function SeletorMetricaSerieTemporalInsightsSmartRead({ metrica, onChangeMetrica }: Props) {
  return (
    <div className="sr-insights-metrica" role="group" aria-label="Métrica do gráfico">
      {OPCOES.map((opcao) => (
        <button
          key={opcao.id}
          type="button"
          className={`sr-insights-metrica__btn${metrica === opcao.id ? ' sr-insights-metrica__btn--ativa' : ''}`}
          aria-pressed={metrica === opcao.id}
          onClick={() => onChangeMetrica(opcao.id)}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  )
}
