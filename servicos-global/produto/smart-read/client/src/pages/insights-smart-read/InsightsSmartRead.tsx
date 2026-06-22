/**
 * InsightsSmartRead — dashboard operacional (padrão BID Frete / bfd-dashboard)
 */

import { useMemo } from 'react'
import {
  KpiGridInsightsLeituraSmartRead,
  PainelCamposAcertosInsightsSmartRead,
  PainelGraficoCamposPorDiaInsightsSmartRead,
  PainelRankingsEntidadeInsightsSmartRead,
  PainelSavingDetalheInsightsSmartRead,
  PainelTiposDocumentoInsightsSmartRead,
} from '../../components/insights-smart-read-paineis'
import { calcularMetricasInsightsLeituraSmartRead } from './calcular-metricas-insights-leitura-smart-read'
import { useDadosInsightsLeituraSmartRead } from './use-dados-insights-leitura-smart-read'
import '../../shared/smart-read-leituras.css'
import './insights-smart-read.css'

export default function InsightsSmartRead() {
  const { leiturasDetalhe, transacoes, carregando, erro } = useDadosInsightsLeituraSmartRead()

  const metricas = useMemo(
    () => calcularMetricasInsightsLeituraSmartRead(leiturasDetalhe, transacoes),
    [leiturasDetalhe, transacoes],
  )

  if (carregando && leiturasDetalhe.length === 0 && transacoes.length === 0) {
    return <div className="sr-insights-carregando">Carregando insights…</div>
  }

  return (
    <div className="sr-insights-dashboard">
      {erro && (
        <div className="sr-erro" role="alert">
          {erro}
        </div>
      )}

      <div className="sr-insights-grid">
        <KpiGridInsightsLeituraSmartRead metricas={metricas} carregando={carregando} />

        <PainelGraficoCamposPorDiaInsightsSmartRead
          className="sr-insights-grid__grafico"
          metricas={metricas}
          transacoes={transacoes}
        />
        <PainelCamposAcertosInsightsSmartRead
          className="sr-insights-grid__acertos"
          metricas={metricas}
        />

        <div className="sr-insights-grid__col-leve">
          <PainelTiposDocumentoInsightsSmartRead metricas={metricas} />
          <PainelSavingDetalheInsightsSmartRead metricas={metricas} />
        </div>
        <PainelRankingsEntidadeInsightsSmartRead
          className="sr-insights-grid__rankings"
          metricas={metricas}
        />
      </div>
    </div>
  )
}
