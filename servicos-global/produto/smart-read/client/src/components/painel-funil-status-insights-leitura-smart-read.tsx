import type { StatusLeitura } from '../shared/schemas'
import { ROTULO_STATUS_LEITURA } from '../shared/formatacao-leitura-smart-read'
import type { MetricasInsightsLeituraSmartRead } from '../pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read'

const STATUS_ORDEM: StatusLeitura[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']

const CLASSE_BARRA: Record<StatusLeitura, string> = {
  PENDING: 'sr-insights-funil-barra--pending',
  PROCESSING: 'sr-insights-funil-barra--processing',
  COMPLETED: 'sr-insights-funil-barra--completed',
  FAILED: 'sr-insights-funil-barra--failed',
}

type Props = {
  metricas: MetricasInsightsLeituraSmartRead
  amostraTotal: number
}

export function PainelFunilStatusInsightsLeituraSmartRead({ metricas, amostraTotal }: Props) {
  const maxContagem = Math.max(...STATUS_ORDEM.map((s) => metricas.porStatus[s]), 1)

  return (
    <section className="sr-insights-painel" aria-labelledby="sr-insights-funil-titulo">
      <h2 id="sr-insights-funil-titulo" className="sr-insights-painel-titulo">
        Distribuição por status
      </h2>
      <p className="sr-insights-painel-subtitulo">
        Amostra de {amostraTotal} leitura(s) carregada(s)
      </p>

      {amostraTotal === 0 ? (
        <p className="sr-insights-vazio">Nenhuma leitura na amostra para exibir.</p>
      ) : (
        STATUS_ORDEM.map((status) => {
          const contagem = metricas.porStatus[status]
          const largura = `${Math.round((contagem / maxContagem) * 100)}%`
          return (
            <div key={status} className="sr-insights-funil-linha">
              <span className="sr-insights-funil-rotulo">{ROTULO_STATUS_LEITURA[status]}</span>
              <div className="sr-insights-funil-barra-wrap">
                <div
                  className={`sr-insights-funil-barra ${CLASSE_BARRA[status]}`}
                  style={{ width: largura }}
                  role="presentation"
                />
              </div>
              <span className="sr-insights-funil-valor">{contagem}</span>
            </div>
          )
        })
      )}

      <div className="sr-insights-origem-grid" aria-label="Origem das leituras">
        <div className="sr-insights-origem-item">
          <p className="sr-insights-origem-rotulo">Interface</p>
          <p className="sr-insights-origem-valor">{metricas.porOrigem.interface}</p>
        </div>
        <div className="sr-insights-origem-item">
          <p className="sr-insights-origem-rotulo">API</p>
          <p className="sr-insights-origem-valor">{metricas.porOrigem.api}</p>
        </div>
      </div>
    </section>
  )
}
